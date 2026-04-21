const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleCheck');
const symptomCtrl = require('../controllers/symptomController');

// Anyone authenticated can check symptoms (patient primarily, but doctors can test too)
router.post('/symptoms/check', requireRole(), symptomCtrl.checkSymptoms);
router.get('/symptoms/history', requireRole(), symptomCtrl.getHistory);
router.get('/symptoms/history/:id', requireRole(), symptomCtrl.getCheckById);
router.get('/symptoms/specialties', requireRole(), symptomCtrl.listSpecialties);

module.exports = router;
