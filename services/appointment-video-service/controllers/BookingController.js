const Appointment = require('../models/Appointment');
const DoctorSchedule = require('../models/DoctorSchedule');
const redis = require('../config/redis');

// @desc    Book an appointment
// @route   POST /api/appointments/book
exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, startTime, endTime, appointmentType, notes } = req.body;

    const appointment = new Appointment({
      patientId,
      doctorId,
      startTime,
      endTime,
      appointmentType,
      notes
    });

    await appointment.save();
    await redis.del(`doctor_schedule:${doctorId}`);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get appointments
exports.getAppointments = async (req, res) => {
  try {
    const { userId, role } = req.query;
    const filter = role === 'doctor' ? { doctorId: userId } : { patientId: userId };
    
    const appointments = await Appointment.find(filter).sort('-startTime');
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
