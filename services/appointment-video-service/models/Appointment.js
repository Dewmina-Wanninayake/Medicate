const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: String,
  doctorId: { type: String, required: true },
  doctorName: String,
  specialty: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'pending'],
    default: 'pending'
  },
  appointmentType: {
    type: String,
    enum: ['telemedicine', 'in-person'],
    default: 'telemedicine'
  },
  roomId: { type: String, unique: true, sparse: true },
  notes: String,
  consultationFee: Number,
  paymentStatus: { type: String, default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
