const User = require('../models/User');

// GET /api/admin/users
async function listUsers(req, res) {
  try {
    const { role, isVerified, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/admin/doctors/:id/verify
async function verifyDoctor(req, res) {
  try {
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor verified', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/admin/users/:id/status
async function toggleUserStatus(req, res) {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listUsers, verifyDoctor, toggleUserStatus, deleteUser, updateUser };
