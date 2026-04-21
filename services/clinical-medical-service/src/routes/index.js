const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../config/upload');
const recordCtrl = require('../controllers/recordController');
const prescriptionCtrl = require('../controllers/prescriptionController');

// Medical Records
router.post('/records/upload', requireRole('patient', 'doctor'), upload.single('file'), recordCtrl.uploadRecord);
router.get('/records', requireRole(), recordCtrl.getRecords);
router.get('/records/:id', requireRole(), recordCtrl.getRecordById);
router.delete('/records/:id', requireRole('patient', 'admin'), recordCtrl.deleteRecord);

// Prescriptions
router.post('/prescriptions', requireRole('doctor'), prescriptionCtrl.createPrescription);
router.get('/prescriptions', requireRole(), prescriptionCtrl.getPrescriptions);
router.get('/prescriptions/:id', requireRole(), prescriptionCtrl.getPrescriptionById);

module.exports = router;
