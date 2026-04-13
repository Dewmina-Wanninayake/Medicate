const express = require('express');
const router = express.Router();
const { 
  generateRoomId, 
  getSessionStatus 
} = require('../controllers/ConsultationController');

router.post('/generate-room', generateRoomId);
router.get('/status/:appointmentId', getSessionStatus);

module.exports = router;
