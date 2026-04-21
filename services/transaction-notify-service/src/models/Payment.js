const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true },
    appointmentId: { type: String, required: true, index: true },
    amount: { type: Number, required: true }, // in cents (Stripe standard)
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String },
    stripeClientSecret: { type: String },
    description: { type: String },
    refundId: { type: String },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
