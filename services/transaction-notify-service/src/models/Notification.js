const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['appointment_booked', 'appointment_confirmed', 'appointment_rejected',
             'appointment_cancelled', 'appointment_completed', 'payment_success',
             'payment_failed', 'session_started', 'general'],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    channels: [{ type: String, enum: ['email', 'sms', 'in_app'] }],
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
