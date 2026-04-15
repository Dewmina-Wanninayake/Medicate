const express = require('express');
const router  = express.Router();

// Middleware
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Multer/Cloudinary upload middleware

// Record controller functions
const {
  uploadRecord,
  getPatientRecords,
  getSingleRecord,
  deleteRecord
} = require('../controllers/record.controller');

// ─── All Routes: Protected (Patient & Doctor only) ─────────────────────────

// Upload a new medical record file (multipart/form-data, field name: "file")
router.post('/upload',
  protect,
  authorize('patient', 'doctor'),
  upload.single('file'), // Process single file upload before controller
  uploadRecord
);

// Get all records for a specific patient
router.get('/patient/:patientId',
  protect,
  authorize('patient', 'doctor'),
  getPatientRecords
);

// Get a single record by ID
router.get('/:id',
  protect,
  authorize('patient', 'doctor'),
  getSingleRecord
);

// Delete a record by ID (also removes file from Cloudinary)
router.delete('/:id',
  protect,
  authorize('patient', 'doctor'),
  deleteRecord
);

module.exports = router;