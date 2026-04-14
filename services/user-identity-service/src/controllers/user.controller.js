const User = require('../models/user.model');

// ── GET /api/users/profile ───────────────────────────────────────
const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user.toPublicProfile() } });
};

// ── PUT /api/users/profile ───────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Role-specific profile updates
    if (req.user.role === 'patient' && req.body.patientProfile) {
      const patientFields = ['dateOfBirth', 'gender', 'bloodGroup', 'address', 'emergencyContact'];
      updates.patientProfile = {};
      patientFields.forEach((field) => {
        if (req.body.patientProfile[field] !== undefined) {
          updates.patientProfile[field] = req.body.patientProfile[field];
        }
      });
    }

    if (req.user.role === 'doctor' && req.body.doctorProfile) {
      // Doctors can update their own profile details (not verification status)
      const doctorFields = ['specialty', 'qualifications', 'yearsExperience', 'consultationFee'];
      updates.doctorProfile = { ...req.user.doctorProfile?.toObject?.() };
      doctorFields.forEach((field) => {
        if (req.body.doctorProfile[field] !== undefined) {
          updates.doctorProfile[field] = req.body.doctorProfile[field];
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    res.json({ success: true, message: 'Profile updated successfully', data: { user: updatedUser } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/change-password ──────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.refreshToken = null; // Force re-login after password change
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/doctors ───────────────────────────────────────
// Public: list verified doctors, filterable by specialty
const listDoctors = async (req, res, next) => {
  try {
    const { specialty, page = 1, limit = 10 } = req.query;

    const filter = { role: 'doctor', isActive: true, 'doctorProfile.isVerified': true };
    if (specialty) filter['doctorProfile.specialty'] = new RegExp(specialty, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [doctors, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName doctorProfile.specialty doctorProfile.consultationFee doctorProfile.qualifications doctorProfile.yearsExperience')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/doctors/:id ───────────────────────────────────
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      'doctorProfile.isVerified': true,
      isActive: true,
    }).select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: { doctor } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword, listDoctors, getDoctorById };