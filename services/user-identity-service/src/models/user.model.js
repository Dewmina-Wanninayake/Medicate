const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['patient', 'doctor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    // ── Core identity ──────────────────────────────────────────────
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 8 },
    phone: {
      countryCode: { type: String, default: '+94' },
      number:      { type: String, trim: true },
    },
    role:      { type: String, enum: ROLES, default: 'patient' },
    isActive:  { type: Boolean, default: true },

    // ── Doctor-specific fields ─────────────────────────────────────
    doctorProfile: {
      specialty:        { type: String },
      licenseNumber:    { type: String },
      qualifications:   [{ type: String }],
      yearsExperience:  { type: Number },
      consultationFee:  { type: Number },
      isVerified:       { type: Boolean, default: false },
      verifiedAt:       { type: Date },
      verifiedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // ── Patient-specific fields ────────────────────────────────────
    patientProfile: {
      dateOfBirth: { type: Date },
      gender:      { type: String, enum: ['male', 'female', 'other'] },
      bloodGroup:  { type: String },
      address:     { type: String },
      emergencyContact: {
        name:  { type: String },
        phone: { type: String },
      },
    },

    // ── Auth helpers ───────────────────────────────────────────────
    refreshToken:         { type: String },
    passwordResetToken:   { type: String },
    passwordResetExpires: { type: Date },
    lastLogin:            { type: Date },
  },
  { timestamps: true }
);

// ── Pre-save: hash password ──────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ───────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public profile (no password) ──────────
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);