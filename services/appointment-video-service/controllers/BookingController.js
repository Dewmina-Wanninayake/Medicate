const Appointment = require('../models/Appointment');
const axios = require('axios');
const redis = require('../config/redis');

// Internal Service URLs
const CLINICAL_SERVICE_URL = 'http://clinical-medical-service:5000/api';

/**
 * @desc    Get appointments for the logged-in user
 * @route   GET /api/appointments
 */
exports.getAppointments = async (req, res) => {
  try {
    const { userId, role } = req.user;
    console.log(`[Appointments] Fetching for User: ${userId}, Role: ${role}`);
    
    const filter = role === 'doctor' ? { doctorId: userId } : { patientId: userId };
    const appointments = await Appointment.find(filter).sort('-startTime');
    
    console.log(`[Appointments] Found ${appointments.length} records for filter:`, filter);

    res.status(200).json({ 
      success: true, 
      count: appointments.length, 
      appointments, // New standardized field
      data: appointments // Legacy/Fallback field
    });
  } catch (error) {
    console.error('[Appointments] Error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Book an appointment & Create Stripe Intent
 * @route   POST /api/appointments/book
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, startTime, appointmentType, notes } = req.body;
    const patientId = req.user.userId;
    const patientEmail = req.user.email;

    // 1. Fetch Doctor Details (for fee and names)
    let doctorData;
    try {
      const docRes = await axios.get(`${CLINICAL_SERVICE_URL}/doctors/${doctorId}`);
      doctorData = docRes.data.data;
    } catch (e) {
      console.error('Failed to fetch doctor details:', e.message);
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const amount = doctorData.consultationFee || 5000; // Default to $50.00 if missing
    
    // Safety check for date
    const validStartTime = new Date(startTime);
    if (isNaN(validStartTime.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid start time provided' });
    }

    const endTime = new Date(validStartTime.getTime() + 30 * 60000); // Default 30 min duration

    // 2. Create the Appointment record with 'pending' status
    const appointment = new Appointment({
      patientId,
      patientName: req.user.name || 'Patient', // In real app, look up from identity service
      doctorId,
      doctorName: doctorData.name,
      specialty: doctorData.specialization,
      startTime,
      endTime,
      appointmentType: appointmentType || 'telemedicine',
      notes,
      consultationFee: amount,
      status: 'pending' 
    });

    await appointment.save();

    // Return the pending appointment and fee to the frontend.
    // The frontend (BookingModal) will call the transaction-notify-service directly
    // to create the Stripe PaymentIntent, using the user's own JWT which carries
    // the patient email — avoiding the service-to-service auth chain issue.
    res.status(201).json({
      success: true,
      data: appointment,
      consultationFee: amount,
      currency: 'usd',
    });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Confirm Appointment (Usually called by Webhook callback)
 * @route   POST /api/appointments/status-update
 */
exports.confirmAppointment = async (req, res) => {
  // Logic is shared or targeted by the internal webhook logic
  try {
    const { appointmentId, status, startTime, endTime } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    
    if (appointment) {
      appointment.status = status || 'scheduled';
      appointment.paymentStatus = 'paid';
      
      // Update dates if provided (useful for rescheduling during payment)
      if (startTime) appointment.startTime = new Date(startTime);
      if (endTime)   appointment.endTime   = new Date(endTime);
      
      await appointment.save();
      
      // Clear cache if exists
      if (redis.del) {
        await redis.del(`doctor_schedule:${appointment.doctorId}`);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Cancel appointment
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });

    // Only patient or doctor of this appt can cancel
    if (req.user.role !== 'admin' && 
        appointment.patientId !== req.user.userId && 
        appointment.doctorId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
