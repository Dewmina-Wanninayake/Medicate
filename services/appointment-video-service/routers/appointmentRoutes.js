const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  bookAppointment, 
  getAppointments, 
  cancelAppointment 
} = require('../controllers/BookingController');

router.post('/book', protect, bookAppointment);
router.get('/', protect, getAppointments);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
