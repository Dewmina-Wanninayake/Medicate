const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    specialization: { type: String },
    reasonForVisit: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    consultationType: {
      type: String,
      enum: ['video', 'in_person'],
      default: 'video',
    },

    // Agora video session fields
    sessionId: { type: String },       // Agora channel name = appointment _id string
    agoraAppId: { type: String },      // Agora App ID (safe for clients)
    sessionStartedAt: { type: Date },
    sessionEndedAt: { type: Date },
    sessionDurationSeconds: { type: Number },

    // Payment reference
    paymentId: { type: String },
    isPaid: { type: Boolean, default: false },

    cancelledBy: { type: String },
    cancellationReason: { type: String },
    doctorNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
