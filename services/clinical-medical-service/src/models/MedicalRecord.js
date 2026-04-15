const mongoose = require('mongoose');

// ─── Medical Record Schema ─────────────────────────────────────────────────
// Represents a single medical document/file uploaded by a patient or doctor
const medicalRecordSchema = new mongoose.Schema(
  {
    // ID of the patient this medical record belongs to
    patientId: {
      type: String,
      required: true
    },

    // ID of the user who uploaded this record (could be patient or doctor)
    uploadedBy: {
      type: String,
      required: true
    },

    // Role of the person who uploaded the record
    uploaderRole: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },

    // Title/name given to this medical record (e.g., "Blood Test Report")
    title: {
      type: String,
      required: true
    },

    // Optional description or notes about the record
    description: {
      type: String,
      default: ''
    },

    // Cloudinary URL to access/display the uploaded file
    fileUrl: {
      type: String,
      required: true
    },

    // Cloudinary public ID — needed to delete or update the file on Cloudinary
    filePublicId: {
      type: String,
      required: true
    },

    // Type of the uploaded file
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: true
    },

    // Original file name when it was uploaded (e.g., "blood_test_2024.pdf")
    fileName: {
      type: String,
      required: true
    },

    // Size of the file in bytes
    fileSize: {
      type: Number,
      default: 0
    },

    // Medical category of the record for easy filtering/sorting
    category: {
      type: String,
      enum: [
        'lab_report',   // Blood tests, urine tests, etc.
        'prescription', // Doctor's prescription
        'scan',         // MRI, CT scan, ultrasound
        'x_ray',        // X-ray images
        'other'         // Anything that doesn't fit above
      ],
      default: 'other'
    }
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);