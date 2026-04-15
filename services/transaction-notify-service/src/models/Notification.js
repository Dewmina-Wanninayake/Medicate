/**
 * models/Notification.js
 * MongoDB schema for tracking all sent notifications (email + SMS)
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ──────────────────────────────────────────────────────────────
    recipientId:    { type: String, required: true, index: true },
    recipientRole:  { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    recipientEmail: { type: String },
    recipientPhone: { type: String },

    // ── Channel & type ─────────────────────────────────────────────────────────
    channel: {
      type: String,
      enum: ['email', 'sms'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'payment_success',
        'payment_failed',
        'payment_refund',
        'appointment_confirmation',
        'appointment_reminder',
        'prescription_ready',
        'general',
      ],
      required: true,
      index: true,
    },

    // ── Content ────────────────────────────────────────────────────────────────
    subject:  { type: String },  // email subject
    body:     { type: String, required: true },
    template: { type: String },  // template name used

    // ── Delivery status ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed', 'bounced'],
      default: 'queued',
      index: true,
    },
    providerMessageId: { type: String },  // Twilio SID or email Message-ID
    failureReason:     { type: String },
    sentAt:            { type: Date },
    retryCount:        { type: Number, default: 0 },

    // ── Reference ──────────────────────────────────────────────────────────────
    relatedTransactionId: { type: String, index: true },
    relatedAppointmentId: { type: String },

    // ── Metadata ───────────────────────────────────────────────────────────────
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
