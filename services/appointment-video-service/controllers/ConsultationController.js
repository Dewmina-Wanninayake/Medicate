const Appointment = require('../models/Appointment');
const ConsultationMessage = require('../models/ConsultationMessage');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const APP_ID = process.env.AGORA_APP_ID || 'e7f6e9aeecf14b2ba10e3f40be9f56e7';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

exports.generateRoomId = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.body;
    
    let appointment;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
    } else if (patientId) {
      // Find the most recent telemedicine appointment for this patient that is not cancelled
      appointment = await Appointment.findOne({ 
        patientId, 
        appointmentType: 'telemedicine',
        status: { $ne: 'cancelled' }
      }).sort({ startTime: -1 });
    }

    if (!appointment && patientId) {
      // For demo/prototype purposes, if no appointment exists, create one on the fly
      appointment = await Appointment.create({
        patientId,
        doctorId: 'doctor_001',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'scheduled',
        appointmentType: 'telemedicine'
      });
      console.log('Auto-created appointment for:', patientId);
    }

    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const role = RtcRole.PUBLISHER;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
    
    // Use the appointment ID as the channel name for consistency
    const channelName = appointment._id.toString();
    
    let token = null;
    if (APP_CERTIFICATE) {
      token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, 0, role, privilegeExpiredTs);
    }

    appointment.roomId = channelName;
    appointment.status = 'in-progress';
    await appointment.save();

    res.status(200).json({ 
      success: true, 
      data: { appId: APP_ID, channel: channelName, token },
      message: 'Agora token generated successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSessionStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, status: appointment.status, roomId: appointment.roomId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { appointmentId, senderId, senderRole, content, messageType, metadata } = req.body;
    
    const message = await ConsultationMessage.create({
      appointmentId,
      senderId,
      senderRole,
      content,
      messageType,
      metadata
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await ConsultationMessage.find({ 
      appointmentId: req.params.appointmentId 
    }).sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateNotes = async (req, res) => {
  try {
    const { appointmentId, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { notes },
      { new: true }
    );
    
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });
    
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

