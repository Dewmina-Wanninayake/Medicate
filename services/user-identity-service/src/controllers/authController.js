const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const {
      name: rawName, firstName, lastName,
      email, password, role, phone,
      specialization, licenseNumber, experience, consultationFee,
    } = req.body;

    const name = rawName || `${firstName || ''} ${lastName || ''}`.trim();

    const errors = [];
    if (!name) errors.push({ msg: 'Name is required' });
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push({ msg: 'Email is required' });
    } else if (!emailRegex.test(email)) {
      errors.push({ msg: 'Invalid email format' });
    }

    if (!password) {
      errors.push({ msg: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ msg: 'Password must be at least 8 characters long' });
    }

    if (!['patient', 'doctor'].includes(role)) {
      errors.push({ msg: 'Role must be patient or doctor' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const userData = { name, email, password, role, phone };
    if (role === 'doctor') {
      Object.assign(userData, { specialization, licenseNumber, experience, consultationFee, isVerified: false });
    }

    const user = await User.create(userData);
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const errors = [];
    if (!email) errors.push({ msg: 'Email is required' });
    if (!password) errors.push({ msg: 'Password is required' });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ error: 'Account disabled' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login };
