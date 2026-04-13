const express = require('express');
const router  = express.Router();

// Middleware
const { protect, authorize } = require('../middleware/auth');

// Prescription controller functions
const {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getSinglePrescription
} = require('../controllers/prescription.controller');

// ─── Routes ────────────────────────────────────────────────────────────────

// Create a new prescription (doctors only)
router.post('/',
  protect,
  authorize('doctor'),
  createPrescription
);

// Get all prescriptions for a specific patient (patient sees own, doctor sees any)
router.get('/patient/:patientId',
  protect,
  authorize('patient', 'doctor'),
  getPatientPrescriptions
);

// Get all prescriptions issued by a specific doctor (doctors only)
router.get('/doctor/:doctorId',
  protect,
  authorize('doctor'),
  getDoctorPrescriptions
);

// Get a single prescription by ID (patient sees own, doctor sees any)
router.get('/:id',
  protect,
  authorize('patient', 'doctor'),
  getSinglePrescription
);

module.exports = router;