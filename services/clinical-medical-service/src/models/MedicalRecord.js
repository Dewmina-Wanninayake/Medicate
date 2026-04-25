const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String },
    appointmentId: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    recordType: {
      type: String,
      enum: ['lab_report', 'imaging', 'prescription', 'consultation_note', 'uploaded_document', 'other'],
      default: 'other',
    },
    filePath: { type: String },       // local file path
    fileName: { type: String },       // original file name
    mimeType: { type: String },
    uploadedBy: { type: String },     // userId who uploaded
    uploadedByRole: { type: String }, // patient or doctor
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
