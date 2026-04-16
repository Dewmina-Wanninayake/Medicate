const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getAppointments, 
  cancelAppointment,
  confirmAppointment
} = require('../controllers/BookingController');
const { protect } = require('../src/middleware/auth');

router.post('/book', protect, bookAppointment);
router.get('/', protect, getAppointments);
router.delete('/:id', protect, cancelAppointment);
router.post('/status-update', confirmAppointment); // Internal callback

module.exports = router;
