const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    phone: { type: String },
    isVerified: { type: Boolean, default: false }, // for doctor verification by admin
    isActive: { type: Boolean, default: true },

    // Patient-specific fields
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    address: { type: String },

    // Doctor-specific fields
    specialization: { type: String },
    licenseNumber: { type: String },
    experience: { type: Number },
    consultationFee: { type: Number },
    bio: { type: String },

    // Availability (for doctors)
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun, 6=Sat
        startTime: { type: String }, // "09:00"
        endTime: { type: String },   // "17:00"
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
