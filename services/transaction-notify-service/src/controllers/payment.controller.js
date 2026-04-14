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
const Transaction   = require('../models/Transaction');
const Notification  = require('../models/Notification');
const stripeService = require('../services/stripe.service');
const emailService  = require('../services/email.service');
const smsService    = require('../services/sms.service');

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
      appointmentId,
      description,
    } = req.body;

    // Create or retrieve a Stripe Customer (deduplicates by email)
    const customer = await stripeService.createOrRetrieveCustomer({
      email:     patientEmail,
      name:      patientName,
      phone:     patientPhone,
      patientId,
    });

    const transactionId = uuidv4();

    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      customerId:  customer.id,
      description: description || `Medicate consultation — ${patientName}`,
      metadata: {
        transactionId,
        patientId,
        patientEmail,
        patientName,
        patientPhone: patientPhone || '',
        doctorId,
        appointmentId: appointmentId || '',
      },
    });

    // Persist a pending transaction record
    const tx = await Transaction.create({
      transactionId,
      patientId,
      doctorId,
      appointmentId,
      gateway:              'stripe',
      gatewayTransactionId:  paymentIntent.id,
      gatewayCustomerId:     customer.id,
      amount,
      currency:              currency.toUpperCase(),
      description,
      status:               'pending',
      ipAddress:             req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        transactionId:   tx.transactionId,
        clientSecret:    paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId:      customer.id,
        amount,
        currency:        currency.toUpperCase(),
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
    } = req.body;

    const paymentIntent = await stripeService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );

    const newStatus = paymentIntent.status === 'succeeded' ? 'succeeded' : 'processing';

    const tx = await Transaction.findOneAndUpdate(
      { gatewayTransactionId: paymentIntentId },
      { status: newStatus, gatewayPaymentId: paymentIntent.latest_charge },
      { new: true }
    );

    // Fire notifications immediately if confirmed succeeded
    if (newStatus === 'succeeded' && tx) {
      await _sendPaymentSuccessNotifications(tx, { patientEmail, patientName, patientPhone });
    }

    res.json({
      success: true,
      data: {
        status:        paymentIntent.status,
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
    const newStatus    = refundAmount >= tx.amount ? 'refunded' : 'partially_refunded';

    await Transaction.findOneAndUpdate(
      { transactionId },
      {
        status:          newStatus,
        refundAmount,
        refundReason:    reason,
        refundedAt:      new Date(),
        gatewayRefundId: refund.id,
      }
    );

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        status:   refund.status,
        amount:   refund.amount,
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
    if (status)    filter.status    = status;
    if (patientId) filter.patientId = patientId;
    if (doctorId)  filter.doctorId  = doctorId;

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
        page:       parseInt(page),
        limit:      parseInt(limit),
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
    const skip   = (parseInt(page) - 1) * parseInt(limit);

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

// ─── Private helper ───────────────────────────────────────────────────────────

async function _sendPaymentSuccessNotifications(tx, { patientEmail, patientName, patientPhone }) {
  const templateData = {
    patientName:   patientName || 'Patient',
    amount:        tx.amount,
    currency:      tx.currency,
    transactionId: tx.transactionId,
    doctorName:    '',
  };

  const notifBase = {
    recipientId:          tx.patientId,
    recipientRole:        'patient',
    type:                 'payment_success',
    relatedTransactionId: tx.transactionId,
  };

  if (patientEmail) {
    try {
      const result = await emailService.sendEmail({
        to:   patientEmail,
        type: 'payment_success',
        data: templateData,
      });
      await Notification.create({
        ...notifBase,
        channel:           'email',
        recipientEmail:    patientEmail,
        subject:           'Payment Confirmed — Medicate',
        body:              'Payment receipt email sent',
        status:            'sent',
        providerMessageId: result.messageId,
        sentAt:            new Date(),
      });
      await Transaction.findOneAndUpdate(
        { transactionId: tx.transactionId },
        { receiptEmailSent: true }
      );
    } catch (err) {
      console.error('[Notify] Email failed:', err.message);
      await Notification.create({
        ...notifBase,
        channel:       'email',
        body:          'Email failed',
        status:        'failed',
        failureReason: err.message,
      });
    }
  }

  if (patientPhone) {
    try {
      const result = await smsService.sendSms({
        to:   patientPhone,
        type: 'payment_success',
        data: templateData,
      });
      await Notification.create({
        ...notifBase,
        channel:           'sms',
        recipientPhone:    patientPhone,
        body:              'Payment SMS sent',
        status:            'sent',
        providerMessageId: result.sid,
        sentAt:            new Date(),
      });
      await Transaction.findOneAndUpdate(
        { transactionId: tx.transactionId },
        { receiptSmsSent: true }
      );
    } catch (err) {
      console.error('[Notify] SMS failed:', err.message);
      await Notification.create({
        ...notifBase,
        channel:       'sms',
        body:          'SMS failed',
        status:        'failed',
        failureReason: err.message,
      });
    }
  }
}
