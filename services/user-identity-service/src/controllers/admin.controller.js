const User = require('../models/user.model');

// ── GET /api/admin/users ─────────────────────────────────────────
// List all users with optional filters
const listUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/users/:id ─────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/doctors/pending ──────────────────────────────
// List doctors awaiting verification
const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', 'doctorProfile.isVerified': false })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { doctors, count: doctors.length } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/doctors/:id/verify ───────────────────────────
// Approve a doctor registration
const verifyDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (doctor.doctorProfile?.isVerified) {
      return res.status(400).json({ success: false, message: 'Doctor is already verified' });
    }

    doctor.doctorProfile.isVerified = true;
    doctor.doctorProfile.verifiedAt = new Date();
    doctor.doctorProfile.verifiedBy = req.user._id;
    await doctor.save();

    res.json({
      success: true,
      message: `Dr. ${doctor.firstName} ${doctor.lastName} has been verified.`,
      data: { doctor: doctor.toPublicProfile() },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/doctors/:id/reject ───────────────────────────
// Reject a doctor registration
const rejectDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Deactivate the account on rejection
    doctor.isActive = false;
    await doctor.save();

    res.json({ success: true, message: `Doctor registration rejected and account deactivated.` });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/users/:id/toggle-status ───────────────────────
// Activate or deactivate any user account
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent admin from deactivating themselves
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/users/:id ──────────────────────────────────
// Hard delete a user (use with caution)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/users/:id ──────────────────────────────────
// Edit a user's details
const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, specialty } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role && ['patient', 'doctor', 'admin'].includes(role)) {
      user.role = role;
    }

    if (user.role === 'doctor' && specialty) {
      if (!user.doctorProfile) user.doctorProfile = {};
      user.doctorProfile.specialty = specialty;
    }

    await user.save();

    // toPublicProfile may not be defined depending on user schema, 
    // but looking at earlier file it's used in doctor verification. 
    // To be safe we'll send standard fields without password.
    const userRes = user.toObject();
    delete userRes.password;
    delete userRes.refreshToken;

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: { user: userRes },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
    }
    next(err);
  }
};

// ── GET /api/admin/stats ─────────────────────────────────────────
// Platform overview stats
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, pendingDoctors, totalAdmins, inactiveUsers] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true, 'doctorProfile.isVerified': true }),
      User.countDocuments({ role: 'doctor', 'doctorProfile.isVerified': false }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: false }),
    ]);

    res.json({
      success: true,
      data: { totalPatients, totalDoctors, pendingDoctors, totalAdmins, inactiveUsers },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUserById,
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor,
  toggleUserStatus,
  deleteUser,
  getPlatformStats,
  updateUserProfile,
};