const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  availableSlots: [{
    day: { type: String, required: true },
    periods: [{
      startTime: String,
      endTime: String,
    }]
  }],
  exceptions: [{
    date: Date,
    isAvailable: Boolean
  }]
});

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
