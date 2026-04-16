const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_HOST = 'localhost:27017';
const USER_DB = `mongodb://${MONGO_HOST}/medicate_users`;
const CLINICAL_DB = `mongodb://${MONGO_HOST}/medicate_clinical`;
const APPOINTMENT_DB = `mongodb://${MONGO_HOST}/medicate_appointments`;

async function seedMedicalData() {
  try {
    console.log('--- STARTING MASTER MEDICAL SEED ---');

    // 1. Connect to All DBs
    const userConn = await mongoose.createConnection(USER_DB).asPromise();
    const clinicalConn = await mongoose.createConnection(CLINICAL_DB).asPromise();
    const apptConn = await mongoose.createConnection(APPOINTMENT_DB).asPromise();

    // 2. Clear Existing Data (Optional but recommended for clean state)
    console.log('Clearing old doctors and appointments...');
    await clinicalConn.db.collection('doctors').deleteMany({});
    await apptConn.db.collection('appointments').deleteMany({});

    // 3. Define Doctors We Want to Create
    const doctorsData = [
      {
        email: 'dr.smith@medicate.com',
        name: 'Dr. John Smith',
        specialization: 'Cardiologist',
        consultationFee: 12000, // $120.00
        bio: 'Expert in cardiovascular health with 15 years experience.',
        experience: 15,
      },
      {
        email: 'dr.jane@medicate.com',
        name: 'Dr. Jane Doe',
        specialization: 'Dermatologist',
        consultationFee: 8500, // $85.00
        bio: 'Specialist in skin care and cosmetic dermatology.',
        experience: 8,
      },
      {
        email: 'dr.sarah@medicate.com',
        name: 'Dr. Sarah Adams',
        specialization: 'General Practitioner',
        consultationFee: 5000, // $50.00
        bio: 'Compassionate family doctor focused on preventative care.',
        experience: 12,
      }
    ];

    const passwordHash = await bcrypt.hash('12345678', 12);
    const createdDoctors = [];

    // 4. Create Users (if missing) and Doctor Profiles
    for (const d of doctorsData) {
      let user = await userConn.db.collection('users').findOne({ email: d.email });
      if (!user) {
        const res = await userConn.db.collection('users').insertOne({
          email: d.email,
          password: passwordHash,
          role: 'doctor',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        user = { _id: res.insertedId, ...d };
      }

      const doctorRes = await clinicalConn.db.collection('doctors').insertOne({
        userId: user._id.toString(),
        name: d.name,
        email: d.email,
        specialization: d.specialization,
        consultationFee: d.consultationFee,
        bio: d.bio,
        experience: d.experience,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      createdDoctors.push({ id: user._id.toString(), profileId: doctorRes.insertedId, ...d });
      console.log(`Created profile for ${d.name}`);
    }

    // 5. Create Appointments for Target User
    const patientEmail = 'dulajtck@gmail.com';
    const patientUser = await userConn.db.collection('users').findOne({ email: patientEmail });

    if (!patientUser) {
      console.error(`Patient ${patientEmail} not found! Please run seed-user first.`);
    } else {
      const patientId = patientUser._id.toString();
      
      const appointments = [
        {
          patientId,
          doctorId: createdDoctors[0].id,
          doctorName: createdDoctors[0].name, // Redundancy for easy display in dashboard
          specialty: createdDoctors[0].specialization,
          startTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
          endTime: new Date(Date.now() + 86400000 * 2 + 3600000),
          status: 'scheduled',
          appointmentType: 'telemedicine',
          notes: 'Checkup for blood pressure',
          createdAt: new Date(),
        },
        {
          patientId,
          doctorId: createdDoctors[1].id,
          doctorName: createdDoctors[1].name,
          specialty: createdDoctors[1].specialization,
          startTime: new Date(Date.now() - 86400000 * 5), // 5 days ago
          endTime: new Date(Date.now() - 86400000 * 5 + 1800000),
          status: 'completed',
          appointmentType: 'telemedicine',
          notes: 'Skin rash followup',
          createdAt: new Date(),
        },
        {
          patientId,
          doctorId: createdDoctors[2].id,
          doctorName: createdDoctors[2].name,
          specialty: createdDoctors[2].specialization,
          startTime: new Date(Date.now() + 3600000 * 5), // 5 hours from now
          endTime: new Date(Date.now() + 3600000 * 6),
          status: 'scheduled',
          appointmentType: 'telemedicine',
          notes: 'General wellness discussion',
          createdAt: new Date(),
        }
      ];

      await apptConn.db.collection('appointments').insertMany(appointments);
      console.log(`Seeded ${appointments.length} appointments for ${patientEmail}`);
    }

    // 6. Close Connections
    await userConn.close();
    await clinicalConn.close();
    await apptConn.close();
    console.log('--- MASTER SEED COMPLETE ---');

  } catch (err) {
    console.error('[Error] Master seed failed:', err);
  } finally {
    process.exit(0);
  }
}

seedMedicalData();
