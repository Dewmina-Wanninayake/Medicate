const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String },
  instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    appointmentId: { type: String },
    medications: [medicationSchema],
    diagnosis: { type: String },
    notes: { type: String },
    followUpDate: { type: Date },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);

module.exports = mongoose.model('Prescription', prescriptionSchema);
