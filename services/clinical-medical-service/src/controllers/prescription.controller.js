const Prescription = require('../models/Prescription');

// ─── POST /api/prescriptions ───────────────────────────────────────────────
// Protected | Doctor only | Create a new prescription for a patient
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, patientName, appointmentId, medications, diagnosis, notes, followUpDate } = req.body;

    // Validate required fields (medications must have at least one entry)
    if (!patientId || !patientName || !diagnosis || !medications?.length) {
      return res.status(400).json({
        success: false,
        message: 'patientId, patientName, diagnosis, and medications are required'
      });
    }

    const prescription = await Prescription.create({
      doctorId:      req.user.userId,
      doctorName:    req.user.name || req.body.doctorName, // Use token name, fallback to body
      patientId,
      patientName,
      appointmentId: appointmentId || '',
      medications,
      diagnosis,
      notes:         notes        || '',
      followUpDate:  followUpDate || null
    });

    res.status(201).json({ success: true, data: prescription });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/prescriptions/patient/:patientId ─────────────────────────────
// Protected | Patient & Doctor | Get all prescriptions for a patient (newest first)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patients can only view their own prescriptions, doctors can view any
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ success: false, message: 'You can only view your own prescriptions' });
    }

    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/prescriptions/doctor/:doctorId ───────────────────────────────
// Protected | Doctor only | Get all prescriptions issued by a specific doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Doctors can only view prescriptions they themselves issued
    if (req.user.userId !== doctorId) {
      return res.status(403).json({ success: false, message: 'You can only view your own issued prescriptions' });
    }

    const prescriptions = await Prescription.find({ doctorId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/prescriptions/:id ────────────────────────────────────────────
// Protected | Patient & Doctor | Get a single prescription by ID
exports.getSinglePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Only the patient or the issuing doctor can view this prescription
    const isOwner = prescription.patientId === req.user.userId ||
                    prescription.doctorId   === req.user.userId;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: prescription });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};