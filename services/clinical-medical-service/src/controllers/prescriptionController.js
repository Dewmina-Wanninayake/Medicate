const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');

// POST /api/prescriptions  — doctor issues a prescription
async function createPrescription(req, res) {
  try {
    if (req.userRole !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can issue prescriptions' });
    }

    const { patientId, appointmentId, medications, diagnosis, notes, followUpDate } = req.body;
    if (!patientId || !medications || !medications.length) {
      return res.status(400).json({ error: 'patientId and medications are required' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.userId,
      appointmentId,
      medications,
      diagnosis,
      notes,
      followUpDate,
    });

    // Also create a medical record entry so patient can see it in history
    await MedicalRecord.create({
      patientId,
      doctorId: req.userId,
      appointmentId,
      title: `Prescription - ${diagnosis || 'Consultation'}`,
      description: notes,
      recordType: 'prescription',
      uploadedBy: req.userId,
      uploadedByRole: 'doctor',
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/prescriptions  — patient sees own; doctor sees ones they issued
async function getPrescriptions(req, res) {
  try {
    let filter = {};

    if (req.userRole === 'patient') {
      filter.patientId = req.userId;
    } else if (req.userRole === 'doctor') {
      filter.doctorId = req.userId;
      // optionally filter by patient
      if (req.query.patientId) filter.patientId = req.query.patientId;
    } else if (req.userRole === 'admin') {
      if (req.query.patientId) filter.patientId = req.query.patientId;
      if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    }

    const prescriptions = await Prescription.find(filter).sort({ issuedAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/prescriptions/:id
async function getPrescriptionById(req, res) {
  try {
    const p = await Prescription.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Prescription not found' });

    if (req.userRole === 'patient' && p.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.userRole === 'doctor' && p.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/prescriptions/:id - update a prescription
async function updatePrescription(req, res) {
  try {
    const p = await Prescription.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Prescription not found' });

    // Access control: only the issuing doctor can update (or admin)
    if (req.userRole === 'doctor' && p.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.userRole === 'patient') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { medications, diagnosis, notes, followUpDate } = req.body;
    if (medications) p.medications = medications;
    if (diagnosis !== undefined) p.diagnosis = diagnosis;
    if (notes !== undefined) p.notes = notes;
    if (followUpDate !== undefined) p.followUpDate = followUpDate;

    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/prescriptions/:id - delete a prescription
async function deletePrescription(req, res) {
  try {
    const p = await Prescription.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Prescription not found' });

    // Access control: only issuing doctor or admin can delete
    if (req.userRole === 'doctor' && p.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.userRole === 'patient') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createPrescription, getPrescriptions, getPrescriptionById, updatePrescription, deletePrescription };
