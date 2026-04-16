/**
 * routes/webhook.routes.js
 * Stripe webhook endpoint — requires raw body (NOT parsed by express.json)
 *
 * Mounted BEFORE express.json() in app.js so the raw buffer is preserved.
 */

const express       = require('express');
const router        = express.Router();
const stripeService = require('../services/stripe.service');
const Transaction   = require('../models/Transaction');
const Notification  = require('../models/Notification');
const emailService  = require('../services/email.service');
const smsService    = require('../services/sms.service');

/**
 * POST /api/webhooks/stripe
 * Stripe sends signed events to this endpoint.
 * Signature is verified via STRIPE_WEBHOOK_SECRET before any processing.
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),  // raw body required for signature check
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripeService.constructWebhookEvent(req.body, sig);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] Event: ${event.type} — ID: ${event.id}`);

    try {
      switch (event.type) {        // ── Payment succeeded ──────────────────────────────────────────────
        case 'payment_intent.succeeded': {
          const intent = event.data.object;
          const meta = intent.metadata || {};

          const tx = await Transaction.findOneAndUpdate(
            { gatewayTransactionId: intent.id },
            { status: 'succeeded', gatewayPaymentId: intent.latest_charge },
            { new: true }
          );

          if (!tx) break;

          // Notify Appointment Service if this was a booking
          if (meta.appointmentId) {
            try {
              // Internal Docker network call to appointment-service
              await fetch('http://appointment-service:5003/api/appointments/status-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: meta.appointmentId, status: 'scheduled' })
              });
              console.log(`[Webhook] Notified appointment service for ${meta.appointmentId}`);
            } catch (e) {
              console.error('[Webhook] Appointment service callback failed:', e.message);
            }
          }

          const notifData = {
            patientName:   meta.patientName || 'Patient',
            amount:        intent.amount,
            currency:      intent.currency.toUpperCase(),
            transactionId: tx.transactionId,
            doctorName:    meta.doctorName || 'Doctor',
            appointmentDate: meta.appointmentDate || '',
            appointmentTime: meta.appointmentTime || '',
          };

          // Decide which notification type to send
          const notificationType = meta.appointmentId ? 'appointment_confirmation' : 'payment_success';

          // Send email 
          if (meta.patientEmail) {
            try {
              const result = await emailService.sendEmail({
                to:   meta.patientEmail,
                type: notificationType,
                data: notifData,
              });
              await Notification.create({
                recipientId:          meta.patientId || tx.patientId,
                recipientRole:        'patient',
                channel:              'email',
                type:                 notificationType,
                subject:              notificationType === 'appointment_confirmation' ? 'Appointment Confirmed — Medicate' : 'Payment Confirmed — Medicate',
                body:                 notificationType === 'appointment_confirmation' ? 'Appointment details sent' : 'Payment receipt sent',
                status:               'sent',
                providerMessageId:    result.messageId,
                sentAt:               new Date(),
                relatedTransactionId: tx.transactionId,
              });
            } catch (e) {
              console.error('[Webhook] Email failed:', e.message);
            }
          }

          // Send SMS 
          if (meta.patientPhone) {
            try {
              const result = await smsService.sendSms({
                to:   meta.patientPhone,
                type: notificationType,
                data: notifData,
              });
              await Notification.create({
                recipientId:          meta.patientId || tx.patientId,
                recipientRole:        'patient',
                channel:              'sms',
                type:                 notificationType,
                body:                 notificationType === 'appointment_confirmation' ? 'Appointment SMS sent' : 'Payment SMS sent',
                status:               'sent',
                providerMessageId:    result.sid,
                sentAt:               new Date(),
                relatedTransactionId: tx.transactionId,
              });
            } catch (e) {
              console.error('[Webhook] SMS failed:', e.message);
            }
          }
          break;
        }

        // ── Payment failed ─────────────────────────────────────────────────
        case 'payment_intent.payment_failed': {
          const intent    = event.data.object;
          const failReason = intent.last_payment_error?.message || 'Unknown error';

          await Transaction.findOneAndUpdate(
            { gatewayTransactionId: intent.id },
            { status: 'failed', failureReason: failReason }
          );

          const meta = intent.metadata || {};
          if (meta.patientEmail) {
            try {
              await emailService.sendEmail({
                to:   meta.patientEmail,
                type: 'payment_failed',
                data: {
                  patientName:   meta.patientName || 'Patient',
                  transactionId: intent.id,
                  reason:        failReason,
                },
              });
            } catch (e) {
              console.error('[Webhook] Failure email failed:', e.message);
            }
          }
          break;
        }

        // ── Charge refunded ────────────────────────────────────────────────
        case 'charge.refunded': {
          const charge   = event.data.object;
          const refundEl = charge.refunds?.data?.[0];
          if (!refundEl) break;

          const tx = await Transaction.findOne({ gatewayPaymentId: charge.id });
          if (tx) {
            const isFullRefund = charge.amount_refunded >= tx.amount;
            await Transaction.findOneAndUpdate(
              { _id: tx._id },
              {
                status:          isFullRefund ? 'refunded' : 'partially_refunded',
                refundAmount:    charge.amount_refunded,
                refundedAt:      new Date(),
                gatewayRefundId: refundEl.id,
              }
            );
          }
          break;
        }

        // ── Customer created (for logging) ─────────────────────────────────
        case 'customer.created':
          console.log(`[Stripe Webhook] New customer: ${event.data.object.id}`);
          break;

        default:
          console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
      }
    } catch (err) {
      console.error('[Stripe Webhook] Processing error:', err.message);
      // Return 200 anyway — prevents Stripe from infinite retries on our bugs
    }

    res.json({ received: true });
  }
);

module.exports = router;
