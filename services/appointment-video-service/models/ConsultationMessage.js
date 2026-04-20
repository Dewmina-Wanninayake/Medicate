const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'attachment'],
    default: 'text'
  },
  metadata: {
    fileName: String,
    fileUrl: String,
    fileType: String
  },
  readBy: [{
    userId: String,
    at: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ConsultationMessage', consultationMessageSchema);
