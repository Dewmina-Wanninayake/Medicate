/**
 * models/Transaction.js
 * MongoDB schema for Stripe payment transactions
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // ── Identifiers ───────────────────────────────────────────────────────────
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ── Parties ────────────────────────────────────────────────────────────────
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    appointmentId: {
      type: String,
      index: true,
    },

    // ── Payment details ────────────────────────────────────────────────────────
    gateway: {
      type: String,
      enum: ['stripe'],
      default: 'stripe',
      required: true,
    },
    gatewayTransactionId: {
      type: String,   // Stripe PaymentIntent ID
    },
    gatewayPaymentId: {
      type: String,   // Stripe Charge ID
    },
    gatewayCustomerId: {
      type: String,   // Stripe customer ID
    },

    // ── Amounts ────────────────────────────────────────────────────────────────
    amount: {
      type: Number,     // stored in smallest unit (cents / LKR cents)
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },
    consultationFee: { type: Number },
    taxAmount:        { type: Number, default: 0 },
    platformFee:      { type: Number, default: 0 },

    // ── Status lifecycle ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'succeeded',
        'completed',
        'failed',
        'refunded',
        'partially_refunded',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    failureReason: { type: String },

    // ── Refund tracking ────────────────────────────────────────────────────────
    refundAmount:        { type: Number, default: 0 },
    refundReason:        { type: String },
    refundedAt:          { type: Date },
    gatewayRefundId:     { type: String },

    // ── Notifications sent ─────────────────────────────────────────────────────
    receiptEmailSent:  { type: Boolean, default: false },
    receiptSmsSent:    { type: Boolean, default: false },

    // ── Metadata ───────────────────────────────────────────────────────────────
    description:  { type: String },
    metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress:    { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: formatted amount in major currency units
transactionSchema.virtual('displayAmount').get(function () {
  return (this.amount / 100).toFixed(2);
});

// Index for admin dashboard queries
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ patientId: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
