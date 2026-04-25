const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleCheck');
const apptCtrl = require('../controllers/appointmentController');
const sessionCtrl = require('../controllers/sessionController');

// ── Appointment routes ───────────────────────────────────────────────────────
router.post('/appointments', requireRole('patient'), apptCtrl.bookAppointment);
router.get('/appointments', requireRole(), apptCtrl.getAppointments);
router.get('/appointments/doctor/:doctorId/availability', requireRole(), apptCtrl.getDoctorAvailability);
router.get('/appointments/:id', requireRole(), apptCtrl.getAppointmentById);
router.patch('/appointments/:id/status', requireRole('doctor', 'patient', 'admin'), apptCtrl.updateStatus);
router.delete('/appointments/:id', requireRole('patient', 'admin'), apptCtrl.cancelAppointment);
router.post('/appointments/:id/chat', requireRole('doctor', 'patient'), apptCtrl.addChatMessage);

// ── Agora video session routes ───────────────────────────────────────────────
// Doctor starts the Agora channel and gets their RTC token
router.post('/sessions/start/:appointmentId', requireRole('doctor'), sessionCtrl.startSession);

// Any participant (patient or doctor) fetches/refreshes their own RTC token
router.get('/sessions/token/:appointmentId', requireRole(), sessionCtrl.getToken);

// Doctor ends the session
router.post('/sessions/end/:appointmentId', requireRole('doctor'), sessionCtrl.endSession);

// Any participant checks session state (useful for patient polling before joining)
router.get('/sessions/status/:appointmentId', requireRole(), sessionCtrl.getSessionStatus);

module.exports = router;
