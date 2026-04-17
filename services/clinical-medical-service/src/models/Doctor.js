const mongoose = require('mongoose');

// ─── Availability Sub-Schema ───────────────────────────────────────────────
// Represents a single day's availability slot for a doctor
const availabilitySchema = new mongoose.Schema({

  // Day of the week for this availability slot
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },

  // Start time of the availability slot (e.g., "09:00")
  startTime: {
    type: String,
    required: true
  },

  // End time of the availability slot (e.g., "17:00")
  endTime: {
    type: String,
    required: true
  },

  // Whether the doctor is available on this slot (can be toggled off temporarily)
  isAvailable: {
    type: Boolean,
    default: true
  }

});

// ─── Doctor Schema ─────────────────────────────────────────────────────────
// Main schema representing a doctor's profile in the system
const doctorSchema = new mongoose.Schema(
  {
    // Reference to the user account (from users collection)
    userId: {
      type: String,
      required: true,
      unique: true // One doctor profile per user account
    },

    // Full name of the doctor
    name: {
      type: String,
      required: true
    },

    // Doctor's email address
    email: {
      type: String,
      required: true
    },

    // Medical specialization (e.g., "Cardiologist", "Dermatologist")
    specialization: {
      type: String,
      required: true
    },

    // Short biography or description about the doctor
    bio: {
      type: String,
      default: ''
    },

    // List of qualifications/degrees (e.g., ["MBBS", "MD", "PhD"])
    qualifications: [
      { type: String }
    ],

    // Years of professional experience
    experience: {
      type: Number,
      default: 0
    },

    // Fee charged per consultation (in your local currency)
    consultationFee: {
      type: Number,
      default: 0
    },

    // Contact phone number
    phone: {
      type: String,
      default: ''
    },

    // Weekly availability schedule (array of availability slots)
    availability: [availabilitySchema],

    // Whether the doctor's profile has been verified by admin
    isVerified: {
      type: Boolean,
      default: false
    },

    // Cloudinary URL of the doctor's profile image
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);