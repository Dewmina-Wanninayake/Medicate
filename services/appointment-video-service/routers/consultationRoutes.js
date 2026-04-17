const express = require('express');
const router = express.Router();
const { 
  generateRoomId, 
  getSessionStatus,
  sendMessage,
  getMessages,
  updateNotes 
} = require('../controllers/ConsultationController');

router.post('/generate-room', generateRoomId);
router.get('/status/:appointmentId', getSessionStatus);
router.post('/messages', sendMessage);
router.get('/messages/:appointmentId', getMessages);
router.patch('/update-notes', updateNotes);

module.exports = router;
