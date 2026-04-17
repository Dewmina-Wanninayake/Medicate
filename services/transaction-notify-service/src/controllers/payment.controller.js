/**
 * controllers/payment.controller.js
 * Handles all payment-related HTTP requests — Stripe only
 *
 * Routes:
 *   POST  /api/payments/stripe/intent        — create Stripe PaymentIntent
 *   POST  /api/payments/stripe/confirm       — confirm PaymentIntent server-side
 *   POST  /api/payments/stripe/refund        — issue refund (admin)
 *   GET   /api/payments/stripe/methods       — list saved payment methods
 *   GET   /api/payments/transactions         — all transactions (admin)
 *   GET   /api/payments/transactions/:id     — single transaction
 *   GET   /api/payments/my-transactions      — patient's own transactions
 */

const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const stripeService = require('../services/stripe.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

// ─── Create PaymentIntent ──────────────────────────────────────────────────────

/**
 * POST /api/payments/stripe/intent
 * Creates a Stripe PaymentIntent and a pending Transaction record.
 *
 * Body:
 *   amount        {number}  Amount in cents (e.g. 500 = $5.00)
 *   currency      {string}  ISO code, default 'usd'
 *   patientId     {string}
 *   patientEmail  {string}
 *   patientName   {string}
 *   patientPhone  {string}  (optional — for SMS receipt)
 *   doctorId      {string}
 *   appointmentId {string}  (optional)
 *   description   {string}  (optional)
 */
exports.createStripeIntent = async (req, res, next) => {
  try {
    const {
      amount,
      currency = 'usd',
      patientId,
      patientEmail,
      patientName,
      patientPhone,
      doctorId,
      doctorName,
      appointmentId,
      appointmentDate,
      appointmentTime,
      description,
    } = req.body;

    // Fast-Fail / Safety guard for invalid object structures coming from frontend
    let formattedPhone = patientPhone;
    if (typeof patientPhone === 'object' && patientPhone !== null) {
      formattedPhone = `${patientPhone.countryCode || '+1'}${patientPhone.number || ''}`;
    }

    // Create or retrieve a Stripe Customer (deduplicates by email)
    const customer = await stripeService.createOrRetrieveCustomer({
      email: patientEmail,
      name: patientName,
      phone: formattedPhone,
      patientId,
    });

    const transactionId = uuidv4();

    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      customerId: customer.id,
      description: description || `Medicate consultation — ${patientName}`,
      metadata: {
        transactionId,
        patientId,
        patientEmail,
        patientName,
        patientPhone: typeof formattedPhone === 'string' ? formattedPhone : '',
        doctorId,
        doctorName: doctorName || '',
        appointmentId: appointmentId || '',
        appointmentDate: appointmentDate || '',
        appointmentTime: appointmentTime || '',
      },
    });

    // Persist a pending transaction record
    const tx = await Transaction.create({
      transactionId,
      patientId,
      doctorId,
      appointmentId,
      gateway: 'stripe',
      gatewayTransactionId: paymentIntent.id,
      gatewayCustomerId: customer.id,
      amount,
      currency: currency.toUpperCase(),
      description,
      status: 'pending',
      ipAddress: req.ip,
      metadata: {
        patientEmail,
        patientName,
        patientPhone: typeof formattedPhone === 'string' ? formattedPhone : '',
        doctorName: doctorName || '',
        appointmentDate: appointmentDate || '',
        appointmentTime: appointmentTime || '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        transactionId: tx.transactionId,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id,
        amount,
        currency: currency.toUpperCase(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Confirm PaymentIntent ─────────────────────────────────────────────────────

/**
 * POST /api/payments/stripe/confirm
 * Server-side confirmation with a specific payment method.
 * (Alternatively the frontend can confirm directly with Stripe.js)
 *
 * Body: { paymentIntentId, paymentMethodId, patientEmail, patientName, patientPhone }
 */
exports.confirmStripePayment = async (req, res, next) => {
  try {
    const {
      paymentIntentId,
      paymentMethodId,
      patientEmail,
      patientName,
      patientPhone,
      doctorName,
      appointmentDate,
      appointmentTime
    } = req.body;

    let formattedPhone = patientPhone;
    if (typeof patientPhone === 'object' && patientPhone !== null) {
      formattedPhone = `${patientPhone.countryCode || '+1'}${patientPhone.number || ''}`;
    }

    let paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded' && paymentMethodId) {
      paymentIntent = await stripeService.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId
      );
    }

    const newStatus = paymentIntent.status === 'succeeded' ? 'completed' : 'processing';

    const tx = await Transaction.findOneAndUpdate(
      { gatewayTransactionId: paymentIntentId },
      { status: newStatus, gatewayPaymentId: paymentIntent.latest_charge },
      { new: true }
    );

    // Fire notifications immediately if confirmed succeeded
    if (newStatus === 'completed' && tx) {
      // Pull doctorName from request body first, then transaction metadata
      const resolvedDoctorName = doctorName || tx.metadata?.doctorName || '';
      await _sendPaymentSuccessNotifications(tx, { patientEmail, patientName, patientPhone: formattedPhone, doctorName: resolvedDoctorName, appointmentDate, appointmentTime });

      // Also notify Appt Service manually for local env without webhooks
      if (tx.appointmentId) {
        try {
          let startTime, endTime;
          if (appointmentDate && appointmentTime) {
            const [hourMinute, ampm] = appointmentTime.split(' ');
            let [hours, minutes] = hourMinute.split(':');
            if (ampm === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
            if (ampm === 'AM' && hours === '12') hours = '00';
            startTime = new Date(`${appointmentDate}T${String(hours).padStart(2, '0')}:${minutes}:00`);
            endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins
          }

          await fetch('http://appointment-service:5003/api/appointments/status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              appointmentId: tx.appointmentId, 
              status: 'scheduled',
              startTime,
              endTime
            })
          });
        } catch (e) {
          console.error('[Controller] Appt notification failed', e.message);
        }
      }
    }

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        transactionId: tx?.transactionId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refund ────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/stripe/refund
 * Admin only. Issues a full or partial refund.
 *
 * Body: { transactionId, amount (optional, cents), reason }
 */
exports.createStripeRefund = async (req, res, next) => {
  try {
    const { transactionId, amount, reason = 'requested_by_customer' } = req.body;

    const tx = await Transaction.findOne({ transactionId });
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    if (tx.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: `Cannot refund a transaction with status '${tx.status}'`,
      });
    }

    const refund = await stripeService.createRefund({
      paymentIntentId: tx.gatewayTransactionId,
      amount,
      reason,
    });

    const refundAmount = amount || tx.amount;
    const newStatus = refundAmount >= tx.amount ? 'refunded' : 'partially_refunded';

    await Transaction.findOneAndUpdate(
      { transactionId },
      {
        status: newStatus,
        refundAmount,
        refundReason: reason,
        refundedAt: new Date(),
        gatewayRefundId: refund.id,
      }
    );

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency?.toUpperCase(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── List saved payment methods ────────────────────────────────────────────────

/**
 * GET /api/payments/stripe/methods?customerId=cus_xxx
 */
exports.listPaymentMethods = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'customerId is required' });
    }
    const methods = await stripeService.listCustomerPaymentMethods(customerId);
    res.json({ success: true, data: methods.data });
  } catch (err) {
    next(err);
  }
};

// ─── List all transactions (admin) ────────────────────────────────────────────

/**
 * GET /api/payments/transactions
 * Query: ?status=succeeded&patientId=xxx&doctorId=xxx&page=1&limit=20
 */
exports.listTransactions = async (req, res, next) => {
  try {
    const { status, patientId, doctorId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Patient's own transactions ───────────────────────────────────────────────

/**
 * GET /api/payments/my-transactions
 */
exports.myTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { patientId: req.user.userId };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      meta: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Single transaction ───────────────────────────────────────────────────────

/**
 * GET /api/payments/transactions/:id
 * Patients can only retrieve their own transactions.
 */
exports.getTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ transactionId: req.params.id });
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    if (req.user.role === 'patient' && tx.patientId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

// ─── Update transaction status (Admin) ────────────────────────────────────────

/**
 * PUT /api/payments/transactions/:id/status
 * Admin only — updates the transaction status manually.
 */
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const tx = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      { status },
      { new: true }
    );
    
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

// ─── Private helper ───────────────────────────────────────────────────────────

async function _sendPaymentSuccessNotifications(tx, { patientEmail, patientName, patientPhone, doctorName, appointmentDate, appointmentTime }) {
  const templateData = {
    patientName: patientName || tx.metadata?.patientName || 'Patient',
    amount: tx.amount,
    currency: tx.currency,
    transactionId: tx.transactionId,
    doctorName: doctorName || tx.metadata?.doctorName || 'Doctor',
    appointmentDate: appointmentDate || tx.metadata?.appointmentDate || '',
    appointmentTime: appointmentTime || tx.metadata?.appointmentTime || '',
  };

  const notificationType = tx.appointmentId ? 'appointment_confirmation' : 'payment_success';

  console.log(`[Notify] Preparing ${notificationType} notifications — Email: ${patientEmail || 'N/A'}, Phone: ${patientPhone || 'N/A'}, Doctor: ${templateData.doctorName}`);

  const notifBase = {
    recipientId: tx.patientId,
    recipientRole: 'patient',
    type: notificationType,
    relatedTransactionId: tx.transactionId,
  };

  if (patientEmail) {
    try {
      const result = await emailService.sendEmail({
        to: patientEmail,
        type: notificationType,
        data: templateData,
      });
      await Notification.create({
        ...notifBase,
        channel: 'email',
        recipientEmail: patientEmail,
        subject: notificationType === 'appointment_confirmation' ? 'Appointment Confirmed — Medicate' : 'Payment Confirmed — Medicate',
        body: notificationType === 'appointment_confirmation' ? 'Appointment details sent' : 'Payment receipt email sent',
        status: 'sent',
        providerMessageId: result.messageId,
        sentAt: new Date(),
      });
      await Transaction.findOneAndUpdate(
        { transactionId: tx.transactionId },
        { receiptEmailSent: true }
      );
      console.log(`[Notify] ✅ Email sent to ${patientEmail} — MessageId: ${result.messageId}`);
    } catch (err) {
      console.error('[Notify] Email failed:', err.message);
      await Notification.create({
        ...notifBase,
        channel: 'email',
        body: 'Email failed',
        status: 'failed',
        failureReason: err.message,
      });
    }
  } else {
    console.warn('[Notify] ⚠️ No patientEmail provided — skipping email notification');
  }

  if (patientPhone) {
    try {
      const result = await smsService.sendSms({
        to: patientPhone,
        type: notificationType,
        data: templateData,
      });
      await Notification.create({
        ...notifBase,
        channel: 'sms',
        recipientPhone: patientPhone,
        body: notificationType === 'appointment_confirmation' ? 'Appointment SMS sent' : 'Payment SMS sent',
        status: 'sent',
        providerMessageId: result.sid,
        sentAt: new Date(),
      });
      await Transaction.findOneAndUpdate(
        { transactionId: tx.transactionId },
        { receiptSmsSent: true }
      );
      console.log(`[Notify] ✅ SMS sent to ${patientPhone} — SID: ${result.sid}`);
    } catch (err) {
      console.error('[Notify] SMS failed:', err.message);
      await Notification.create({
        ...notifBase,
        channel: 'sms',
        body: 'SMS failed',
        status: 'failed',
        failureReason: err.message,
      });
    }
  } else {
    console.warn('[Notify] ⚠️ No patientPhone provided — skipping SMS notification');
  }
}
