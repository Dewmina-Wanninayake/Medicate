const express = require('express');
const router  = express.Router();

// Middleware
const { protect, authorize } = require('../middleware/auth');

// AI controller functions
const { checkSymptoms } = require('../controllers/ai.controller');

// ─── Routes ────────────────────────────────────────────────────────────────

// Analyze patient symptoms using AI (patients only)
router.post('/symptoms',
  protect,
  authorize('patient'),
  checkSymptoms
);

module.exports = router;