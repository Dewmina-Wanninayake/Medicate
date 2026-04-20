const express = require('express');
const router = express.Router();

// Import the security middleware
const { protect, authorize } = require('../middleware/auth');

// Import the functions (logic) from the controller
const {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  updateAvailability
} = require('../controllers/doctor.controller');

// --- PUBLIC ROUTES ---
// Anyone (like a patient or visitor) can view these
router.get('/', getAllDoctors);      // Get the full list of doctors
router.get('/:id', getDoctorById);   // Get details for one specific doctor

// --- PROTECTED ROUTES ---
// These require a valid login and the user must be a 'doctor'

// Route to create a new doctor profile
router.post('/',
  protect,             // Step 1: Check if the user is logged in (JWT check)
  authorize('doctor'), // Step 2: Check if the user is actually a doctor
  createDoctorProfile
);

// Route to update an existing doctor's bio/info
router.put('/:id',
  protect, 
  authorize('doctor'), 
  updateDoctorProfile
);

// Route to specifically change a doctor's working hours
router.put('/:id/availability',
  protect, 
  authorize('doctor'), 
  updateAvailability
);

module.exports = router;