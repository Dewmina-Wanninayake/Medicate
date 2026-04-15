const Doctor = require('../models/Doctor');

// ─── GET /api/doctors ──────────────────────────────────────────────────────
// Public | Supports filters: ?specialization=Cardiology & ?verified=true
exports.getAllDoctors = async (req, res) => {
  try {
    const filter = {};

    // Filter by specialization (case-insensitive partial match)
    if (req.query.specialization) {
      filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    // Filter verified doctors only
    if (req.query.verified === 'true') {
      filter.isVerified = true;
    }

    const doctors = await Doctor.find(filter).select('-__v'); // Exclude __v field
    res.status(200).json({ success: true, count: doctors.length, data: doctors });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/doctors/:id ──────────────────────────────────────────────────
// Public | Get a single doctor by MongoDB ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/doctors ─────────────────────────────────────────────────────
// Protected | Doctor only | Create a new doctor profile
exports.createDoctorProfile = async (req, res) => {
  try {
    // Prevent duplicate profiles for the same user
    const existing = await Doctor.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Doctor profile already exists' });
    }

    // Create profile using logged-in user's ID + request body
    const doctor = await Doctor.create({ userId: req.user.userId, ...req.body });
    res.status(201).json({ success: true, data: doctor });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/doctors/:id ──────────────────────────────────────────────────
// Protected | Doctor only | Update own doctor profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Ensure doctor can only update their own profile
    if (doctor.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }

    // new: true → returns updated doc | runValidators → enforces schema rules
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/doctors/:id/availability ────────────────────────────────────
// Protected | Doctor only | Replace full availability schedule
exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Ensure doctor can only update their own availability
    if (doctor.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own availability' });
    }

    // Replace entire availability array and save
    doctor.availability = req.body.availability;
    await doctor.save();
    res.status(200).json({ success: true, data: doctor });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};