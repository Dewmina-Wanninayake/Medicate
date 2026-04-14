const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');

// ── POST /api/auth/register ──────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Only 'patient' or 'doctor' can self-register; admins are seeded
    const allowedRoles = ['patient', 'doctor'];
    const assignedRole = allowedRoles.includes(role) ? role : 'patient';

    const user = await User.create({ firstName, lastName, email, password, role: assignedRole, phone });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toPublicProfile(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For doctors: check verification status (warn but don't block login)
    const doctorWarning =
      user.role === 'doctor' && !user.doctorProfile?.isVerified
        ? 'Your account is pending verification by an admin.'
        : null;

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      ...(doctorWarning && { warning: doctorWarning }),
      data: {
        user: user.toPublicProfile(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ───────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Refresh token mismatch' });
    }

    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // Invalidate the refresh token stored in DB
    req.user.refreshToken = null;
    await req.user.save();

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user.toPublicProfile() } });
};

module.exports = { register, login, refreshToken, logout, getMe };