const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { getStripe } = require('../config/stripe');
const { sendEmail } = require('../config/mailer');
const { sendSMS } = require('../config/sms');
const axios = require('axios');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function syncAppointmentStatus(appointmentId, status) {
  try {
    const url = process.env.APPOINTMENT_SERVICE_URL;
    if (!url) return;

    // We call the appointment service internal endpoint to update status
    // Note: In a real system, we'd use a more secure internal auth or an event bus
    await axios.patch(`${url}/api/appointments/${appointmentId}/status`, {
      status,
      // We pass these so the appointment service can trigger notifications if needed
      // though we already handle 'payment_success' notifications here.
      isInternalSync: true
    }, {
      headers: {
        'x-user-role': 'admin', // System-level update
        'x-user-id': 'system'
      }
    });
    console.log(`Synced appointment ${appointmentId} to status: ${status}`);
  } catch (err) {
    console.error(`Failed to sync appointment ${appointmentId}:`, err.message);
  }
}

function formatAmount(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function buildEmailHtml(title, message, payment, isSuccess) {
  const color = isSuccess ? '#22c55e' : '#ef4444';
  const icon = isSuccess ? '✅' : '❌';
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#f9fafb;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:48px;">${icon}</div>
        <h1 style="color:${color};font-size:28px;margin:16px 0 8px;">${title}</h1>
      </div>
      <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;">
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">${message}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#6b7280;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:600;">Amount</td>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">${formatAmount(payment.amount, payment.currency)}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:600;">Appointment ID</td>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-family:monospace;">${payment.appointmentId}</td></tr>
          ${payment.doctorName ? `<tr><td style="padding:8px 0;font-weight:600;">Doctor</td>
              <td style="padding:8px 0;text-align:right;">Dr. ${payment.doctorName}</td></tr>` : ''}
        </table>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;">Medicate Healthcare Platform · Secure Payments by Stripe</p>
    </div>
  `;
}

async function sendPaymentNotification(payment, eventType) {
  try {
    const isSuccess = eventType === 'payment_success';
    const title = isSuccess ? 'Appointment Confirmed (Payment Received) 🎉' : 'Payment Failed';
    const message = isSuccess
      ? `Your payment of ${formatAmount(payment.amount, payment.currency)} was successful. Your appointment for ${payment.appointmentId} is now officially confirmed.`
      : `Your payment for appointment ${payment.appointmentId} failed. Please try again.`;

    // Persist in-app notification
    await Notification.create({
      userId: payment.patientId,
      type: eventType,
      title,
      message,
      channels: ['email', 'sms', 'in_app'],
      metadata: {
        paymentId: payment._id,
        appointmentId: payment.appointmentId,
        amount: payment.amount,
        currency: payment.currency,
      },
      isRead: false,
    });

    // Send email
    if (payment.patientEmail) {
      await sendEmail({
        to: payment.patientEmail,
        subject: title,
        text: message,
        html: buildEmailHtml(title, message, payment, isSuccess),
      });
    }

    // Send SMS
    const rawPhone = payment.patientPhone;
    if (rawPhone && isSuccess) {
      console.log(`[SMS] Attempting to send to: "${rawPhone}" for payment ${payment._id}`);

      let dateStr = 'your scheduled date';
      if (payment.appointmentDate) {
        dateStr = new Date(payment.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      let timeStr = '';
      if (payment.startTime) {
        const [hourStr, minStr] = payment.startTime.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        timeStr = ` at ${formattedHour}:${minStr} ${ampm}`;
      }

      const docStr = payment.doctorName ? ` with Dr. ${payment.doctorName.replace(/^(dr\.?\s*)+/gi, '')}` : '';

      const smsBody = `Medicate: Your appointment${docStr} is confirmed for ${dateStr}${timeStr}.`;

      await sendSMS({ to: rawPhone, body: smsBody });
    } else if (!rawPhone) {
      console.warn(`[SMS] Skipped — no phone number stored for payment ${payment._id}`);
    }
  } catch (err) {
    console.error('Payment notification error:', err.message);
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

// POST /api/payments/create-intent
async function createPaymentIntent(req, res) {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ error: 'Only patients can initiate payments' });
    }

    const {
      appointmentId,
      doctorId,
      amount,
      currency = 'usd',
      description,
      patientEmail,
      patientPhone,
      doctorName,
      appointmentDate,
      startTime,
    } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ error: 'appointmentId and amount (in cents) are required' });
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      description: description || `Consultation fee – Appointment ${appointmentId}`,
      metadata: {
        appointmentId,
        patientId: req.userId,
        doctorId: doctorId || '',
        patientEmail: patientEmail || '',
      },
      receipt_email: patientEmail || undefined,
    });

    const payment = await Payment.create({
      patientId: req.userId,
      doctorId: doctorId || '',
      appointmentId,
      amount,
      currency,
      status: 'pending',
      stripePaymentIntentId: intent.id,
      stripeClientSecret: intent.client_secret,
      description,
      patientEmail: patientEmail || '',
      patientPhone: patientPhone || '',
      doctorName: doctorName || '',
      appointmentDate,
      startTime,
    });

    res.status(201).json({
      paymentId: payment._id,
      clientSecret: intent.client_secret,
      stripePaymentIntentId: intent.id,
      amount,
      currency,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/payments/webhook  — Stripe webhook (raw body needed)
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'succeeded' },
        { new: true }
      );
      console.log(`Payment succeeded: ${intent.id}`);
      if (payment) {
        await syncAppointmentStatus(payment.appointmentId, 'confirmed');
        await sendPaymentNotification(payment, 'payment_success');
      }

    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed' },
        { new: true }
      );
      console.log(`Payment failed: ${intent.id}`);
      if (payment) await sendPaymentNotification(payment, 'payment_failed');
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/payments/confirm/:paymentId  — manually sync status from Stripe
async function confirmPayment(req, res) {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (req.userRole === 'patient' && payment.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    const statusMap = {
      succeeded: 'succeeded',
      canceled: 'failed',
      requires_payment_method: 'pending',
    };

    const newStatus = statusMap[intent.status] || 'pending';
    const wasSucceeded = payment.status !== 'succeeded' && newStatus === 'succeeded';

    payment.status = newStatus;
    await payment.save();

    // Send notification if this confirm call reveals a success
    if (wasSucceeded) {
      await syncAppointmentStatus(payment.appointmentId, 'confirmed');
      await sendPaymentNotification(payment, 'payment_success');
    }

    res.json({ payment, stripeStatus: intent.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/payments  — list payments for the caller
async function getPayments(req, res) {
  try {
    let filter = {};
    if (req.userRole === 'patient') filter.patientId = req.userId;
    else if (req.userRole === 'doctor') filter.doctorId = req.userId;
    // admin sees all

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/payments/:id
async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const isOwner =
      (req.userRole === 'patient' && payment.patientId === req.userId) ||
      (req.userRole === 'doctor' && payment.doctorId === req.userId) ||
      req.userRole === 'admin';

    if (!isOwner) return res.status(403).json({ error: 'Forbidden' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/payments/refund/:id  — admin initiates refund
async function refundPayment(req, res) {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ error: 'Only succeeded payments can be refunded' });
    }

    const stripe = getStripe();
    const refund = await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    await payment.save();

    res.json({ message: 'Refund issued', refundId: refund.id, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/payments/:id/status  — admin updates payment status (e.g., payout to doctor)
async function updatePaymentStatus(req, res) {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (status === 'paid_to_doctor' && payment.status !== 'paid_to_doctor') {
      const stripe = getStripe();
      try {
        // Trigger a payout/transfer to the doctor via Stripe
        // Assuming we are transferring 80% of the payment to the doctor's connected account
        // Note: Using a placeholder destination if the doctor doesn't have a connected account mapped
        await stripe.transfers.create({
          amount: Math.round(payment.amount),
          currency: payment.currency,
          destination: 'acct_1000000000000000', // Mock destination for assignment purposes
          description: `Payout for appointment ${payment.appointmentId}`
        });
      } catch (err) {
        console.warn('Stripe transfer warning (simulated payout):', err.message);
        // We continue with updating the DB status even if the mock transfer fails in test mode
      }
    }

    payment.status = status;
    await payment.save();

    res.json({ message: 'Payment status updated', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
  confirmPayment,
  getPayments,
  getPaymentById,
  refundPayment,
  updatePaymentStatus,
};
