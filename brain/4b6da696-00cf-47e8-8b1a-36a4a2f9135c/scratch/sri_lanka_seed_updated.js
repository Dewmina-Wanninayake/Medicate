const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URIS = {
  user: 'mongodb://mongo-user:27017/user-identity-db',
  clinical: 'mongodb://mongo-clinical:27017/clinical-medical-db',
  appointment: 'mongodb://mongo-appointment:27017/appointment-video-db'
};

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  isVerified: Boolean, isActive: Boolean, specialization: String,
  experience: Number, consultationFee: Number, address: String, bio: String, avatar: String
}, { strict: false });

const appointmentSchema = new mongoose.Schema({
  patientId: mongoose.Types.ObjectId,
  doctorId: mongoose.Types.ObjectId,
  date: Date,
  startTime: String,
  endTime: String,
  status: String,
  reason: String
}, { strict: false });

const recordSchema = new mongoose.Schema({
  patientId: mongoose.Types.ObjectId,
  doctorId: mongoose.Types.ObjectId,
  appointmentId: mongoose.Types.ObjectId,
  title: String,
  description: String,
  type: String,
  fileUrl: String
}, { strict: false });

async function seed() {
  try {
    console.log('Starting updated Sri Lankan seeding...');

    const userConn = await mongoose.createConnection(MONGO_URIS.user).asPromise();
    const User = userConn.model('User', userSchema);
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      { name: 'Admin Medicate', email: 'admin@medicate.com', password: hashedPassword, role: 'admin', isActive: true, isVerified: true },
      { 
        name: 'Dr. Kasun Perera', 
        email: 'kasun.p@medicate.lk', 
        password: hashedPassword, 
        role: 'doctor', 
        isVerified: true, 
        isActive: true, 
        specialization: 'Cardiologist', 
        experience: 15, 
        consultationFee: 250, 
        address: 'Colombo 07, Sri Lanka', 
        bio: 'Senior Cardiologist with 15 years of expertise.',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400'
      },
      { 
        name: 'Dr. Nilanthi Silva', 
        email: 'nilanthi.s@medicate.lk', 
        password: hashedPassword, 
        role: 'doctor', 
        isVerified: true, 
        isActive: true, 
        specialization: 'Dermatologist', 
        experience: 10, 
        consultationFee: 180, 
        address: 'Kandy, Sri Lanka', 
        bio: 'Specialist in clinical and aesthetic dermatology.',
        avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&h=400'
      },
      { 
        name: 'Dr. Tharindu Jayawardena', 
        email: 'tharindu.j@medicate.lk', 
        password: hashedPassword, 
        role: 'doctor', 
        isVerified: true, 
        isActive: true, 
        specialization: 'Pediatrician', 
        experience: 12, 
        consultationFee: 150, 
        address: 'Colombo 03, Sri Lanka', 
        bio: 'Compassionate pediatrician focusing on child development.',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400'
      },
      { 
        name: 'Dr. Anula Wickramasinghe', 
        email: 'anula.w@medicate.lk', 
        password: hashedPassword, 
        role: 'doctor', 
        isVerified: true, 
        isActive: true, 
        specialization: 'Neurologist', 
        experience: 20, 
        consultationFee: 450, 
        address: 'Galle, Sri Lanka', 
        bio: 'Renowned neurologist with focus on stroke prevention.',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400'
      },
      { 
        name: 'Dr. Chaminda Fernando', 
        email: 'chaminda.f@medicate.lk', 
        password: hashedPassword, 
        role: 'doctor', 
        isVerified: true, 
        isActive: true, 
        specialization: 'Orthopedic', 
        experience: 14, 
        consultationFee: 320, 
        address: 'Negombo, Sri Lanka', 
        bio: 'Specialist in sports injuries and joint replacement.',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400'
      },
      { name: 'Kamal Gunaratne', email: 'kamal@gmail.com', password: hashedPassword, role: 'patient', isActive: true, address: 'Colombo 05, Sri Lanka' },
      { name: 'Sunethra Rajapaksa', email: 'sunethra@gmail.com', password: hashedPassword, role: 'patient', isActive: true, address: 'Kurunegala, Sri Lanka' }
    ];

    await User.insertMany(users);
    console.log('Updated Sri Lankan Users seeded with avatars and dollar fees');

    const kamal = await User.findOne({ email: 'kamal@gmail.com' });
    const kasun = await User.findOne({ email: 'kasun.p@medicate.lk' });
    const tharindu = await User.findOne({ email: 'tharindu.j@medicate.lk' });

    const apptConn = await mongoose.createConnection(MONGO_URIS.appointment).asPromise();
    const Appointment = apptConn.model('Appointment', appointmentSchema);
    await Appointment.deleteMany({});

    const appts = [
      {
        patientId: kamal._id,
        doctorId: kasun._id,
        date: new Date(),
        startTime: '09:00',
        endTime: '09:30',
        status: 'scheduled',
        reason: 'Monthly heart checkup'
      },
      {
        patientId: kamal._id,
        doctorId: tharindu._id,
        date: new Date(Date.now() - 86400000 * 3),
        startTime: '16:00',
        endTime: '16:30',
        status: 'completed',
        reason: 'Severe headache and fatigue'
      }
    ];

    await Appointment.insertMany(appts);
    console.log('Appointments seeded');

    const completedAppt = await Appointment.findOne({ status: 'completed' });

    const clinicalConn = await mongoose.createConnection(MONGO_URIS.clinical).asPromise();
    const Record = clinicalConn.model('Record', recordSchema);
    await Record.deleteMany({});

    const records = [
      {
        patientId: kamal._id,
        doctorId: tharindu._id,
        appointmentId: completedAppt._id,
        title: 'Diagnostic Report - Kamal',
        description: 'Patient examined for fatigue. Vitamin deficiency suspected. Prescribed multivitamins.',
        type: 'report',
        fileUrl: '/uploads/kamal_report.pdf'
      }
    ];

    await Record.insertMany(records);
    console.log('Medical records seeded');

    console.log('Updated seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
