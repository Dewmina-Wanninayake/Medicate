const User = require('../models/User');

// GET /api/users/me
async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/me
async function updateMe(req, res) {
  try {
    const userToUpdate = await User.findById(req.userId);
    if (!userToUpdate) return res.status(404).json({ error: 'User not found' });

    const role = userToUpdate.role;
    const allowedFields = ['name', 'phone', 'avatar'];

    if (role === 'patient') {
      allowedFields.push('dateOfBirth', 'bloodGroup', 'address');
    } else if (role === 'doctor') {
      allowedFields.push('specialization', 'licenseNumber', 'experience', 'consultationFee', 'bio');
    }

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/doctors/public  — list verified doctors (public, no auth)
async function listDoctors(req, res) {
  try {
    const { specialization } = req.query;
    const filter = { role: 'doctor', isActive: true, isVerified: true };
    if (specialization) filter.specialization = new RegExp(specialization, 'i');

    const doctors = await User.find(filter).select('-password -licenseNumber');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/doctors/:id  — get single doctor profile
async function getDoctorById(req, res) {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password -licenseNumber');
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/doctors/availability — doctor sets availability
async function setAvailability(req, res) {
  try {
    if (req.userRole !== 'doctor') return res.status(403).json({ error: 'Only doctors can set availability' });
    const { availability } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { availability }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMe, updateMe, listDoctors, getDoctorById, setAvailability };
