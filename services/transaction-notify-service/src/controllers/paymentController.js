const Payment = require('../models/Payment');
const { getStripe } = require('../config/stripe');

// POST /api/payments/create-intent
// Patient initiates payment for an appointment
async function createPaymentIntent(req, res) {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ error: 'Only patients can initiate payments' });
    }

    const { appointmentId, doctorId, amount, currency = 'usd', description } = req.body;
    if (!appointmentId || !amount) {
      return res.status(400).json({ error: 'appointmentId and amount (in cents) are required' });
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // must be integer cents
      currency,
      description: description || `Consultation fee - Appointment ${appointmentId}`,
      metadata: {
        appointmentId,
        patientId: req.userId,
        doctorId: doctorId || '',
      },
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
      req.body, // raw buffer
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
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'succeeded' }
      );
      console.log(`Payment succeeded: ${intent.id}`);
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed' }
      );
      console.log(`Payment failed: ${intent.id}`);
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/payments/confirm/:paymentId  — manually confirm payment status (for testing)
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

    payment.status = statusMap[intent.status] || 'pending';
    await payment.save();

    res.json({ payment, stripeStatus: intent.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/payments  — list payments
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
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    await payment.save();

    res.json({ message: 'Refund issued', refundId: refund.id, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createPaymentIntent, handleWebhook, confirmPayment, getPayments, getPaymentById, refundPayment };
