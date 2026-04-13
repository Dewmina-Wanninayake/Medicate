const redis = require('../config/redis');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async ({ userId, role }) => {
      socket.join(userId);
      if (role === 'doctor') {
        await redis.set(`doctor_status:${userId}`, 'online');
        io.emit('doctor_status_changed', { doctorId: userId, status: 'online' });
      }
    });

    socket.on('update_appointment_status', async ({ appointmentId, status, patientId, doctorId }) => {
      io.to(patientId).to(doctorId).emit('appointment_status_received', { appointmentId, status });
    });

    socket.on('video_signal', ({ targetId, signalData }) => {
      io.to(targetId).emit('video_signal_received', { from: socket.id, signalData });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = { initSocket };
