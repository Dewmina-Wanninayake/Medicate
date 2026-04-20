const mongoose = require('mongoose');

// Single medication entry in a prescription
const medicationSchema = new mongoose.Schema({
  name:      { type: String, required: true }, // Medicine name (e.g., "Paracetamol")
  dosage:    { type: String, required: true }, // Amount per dose (e.g., "500mg")
  frequency: { type: String, required: true }, // How often (e.g., "Twice a day")
  duration:  { type: String, required: true }, // How long (e.g., "7 days")
  notes:     { type: String, default: '' }     // Extra instructions (e.g., "Take after meals")
});

// Prescription issued by a doctor to a patient
const prescriptionSchema = new mongoose.Schema(
  {
    doctorId:      { type: String, required: true }, // Doctor who issued the prescription
    doctorName:    { type: String, required: true }, // Stored for quick display without lookup
    patientId:     { type: String, required: true }, // Patient receiving the prescription
    patientName:   { type: String, required: true }, // Stored for quick display without lookup
    appointmentId: { type: String, default: '' },    // Linked appointment (optional)
    medications:   [medicationSchema],               // List of prescribed medications
    diagnosis:     { type: String, required: true }, // Doctor's diagnosis
    notes:         { type: String, default: '' },    // Additional doctor notes
    followUpDate:  { type: Date,   default: null },  // Next appointment date if needed
    isActive:      { type: Boolean, default: true }  // False if prescription is expired/cancelled
  },
  {
    timestamps: true // Auto adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);