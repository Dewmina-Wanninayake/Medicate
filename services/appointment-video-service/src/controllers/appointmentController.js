const Appointment = require('../models/Appointment');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Helper: fire-and-forget notification
async function notifyService(event, data) {
  try {
    const url = process.env.TRANSACTION_NOTIFY_SERVICE_URL;
    if (url) {
      await axios.post(`${url}/api/notifications/internal`, { event, data }, { timeout: 3000 });
    }
  } catch (_) {
    // non-blocking — notification failures shouldn't break core flow
  }
}

// POST /api/appointments  — patient books an appointment
async function bookAppointment(req, res) {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    const { 
      doctorId, appointmentDate, startTime, endTime, 
      specialization, reasonForVisit, consultationType,
      patientEmail, patientPhone 
    } = req.body;

    if (!doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'doctorId, appointmentDate, and startTime are required' });
    }

    // Conflict check: is the doctor already booked for this slot?
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      status: { $in: ['pending', 'confirmed'] } 
    });

    if (existing) {
      return res.status(409).json({ error: 'Doctor is already booked for this time slot' });
    }

    const appointment = await Appointment.create({
      patientId: req.userId,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      specialization,
      reasonForVisit,
      consultationType: consultationType || 'video',
    });

    // Notify
    await notifyService('appointment_booked', {
      appointmentId: appointment._id,
      patientId: req.userId,
      doctorId,
      appointmentDate,
      startTime,
      patientEmail: patientEmail || '',
      patientPhone: patientPhone || '',
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/appointments  — list appointments for the caller
async function getAppointments(req, res) {
  try {
    let filter = {};
    const { status } = req.query;

    if (req.userRole === 'patient') filter.patientId = req.userId;
    else if (req.userRole === 'doctor') filter.doctorId = req.userId;
    // admin sees all

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/appointments/:id
async function getAppointmentById(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const isOwner =
      (req.userRole === 'patient' && appt.patientId === req.userId) ||
      (req.userRole === 'doctor' && appt.doctorId === req.userId) ||
      req.userRole === 'admin';

    if (!isOwner) return res.status(403).json({ error: 'Forbidden' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/appointments/:id/status  — doctor accepts/rejects; patient/doctor can cancel
async function updateStatus(req, res) {
  try {
    const { status, cancellationReason, doctorNotes, patientEmail, patientPhone } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const allowedTransitions = {
      doctor: ['confirmed', 'rejected', 'completed'],
      patient: ['cancelled'],
      admin: ['cancelled', 'confirmed', 'completed'],
    };

    if (!allowedTransitions[req.userRole]?.includes(status)) {
      return res.status(403).json({ error: `Role ${req.userRole} cannot set status to ${status}` });
    }

    appt.status = status;
    if (cancellationReason) {
      appt.cancellationReason = cancellationReason;
      appt.cancelledBy = req.userId;
    }
    if (doctorNotes) appt.doctorNotes = doctorNotes;
    await appt.save();

    // Only notify if this is a manual update (not an internal sync from payment)
    if (!req.body.isInternalSync) {
      await notifyService('appointment_status_updated', {
        appointmentId: appt._id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        status,
        patientEmail,
        patientPhone,
      });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/appointments/:id  — patient cancels (alias)
async function cancelAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    if (req.userRole === 'patient' && appt.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    appt.status = 'cancelled';
    appt.cancelledBy = req.userId;
    appt.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    await appt.save();

    res.json({ message: 'Appointment cancelled', appointment: appt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/appointments/:id/chat — Add a chat message
async function addChatMessage(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    if (req.userRole === 'patient' && appt.patientId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (req.userRole === 'doctor' && appt.doctorId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const { message, senderName } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    appt.chat.push({
      senderId: req.userId,
      senderName: senderName || req.userRole,
      role: req.userRole,
      message,
      timestamp: new Date()
    });

    await appt.save();
    res.json(appt.chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/appointments/doctor/:doctorId/availability — public/patient view of doctor schedule
async function getDoctorAvailability(req, res) {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({
      doctorId,
      status: { $in: ['pending', 'confirmed'] }
    }).select('appointmentDate startTime status');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  bookAppointment, 
  getAppointments, 
  getAppointmentById, 
  updateStatus, 
  cancelAppointment,
  getDoctorAvailability,
  addChatMessage
};
