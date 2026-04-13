const Appointment = require('../models/Appointment');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const APP_ID = process.env.AGORA_APP_ID || 'e7f6e9aeecf14b2ba10e3f40be9f56e7';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

exports.generateRoomId = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    const role = RtcRole.PUBLISHER;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
    const channelName = appointmentId.toString();
    
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
      message: 'Agora token generated'
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
