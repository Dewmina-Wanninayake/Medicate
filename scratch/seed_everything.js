const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGO_HOST = 'localhost:27017';
const USER_DB = `mongodb://${MONGO_HOST}/medicate_users`;
const TRANS_DB = `mongodb://${MONGO_HOST}/medicate_transactions`;

async function seed() {
  try {
    console.log('--- SEEDING START ---');

    // 1. Create/Ensure User in medicate_users
    const userConn = await mongoose.createConnection(USER_DB).asPromise();
    console.log('[DB] Connected to medicate_users');

    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: { type: String, required: true },
      role: { type: String, default: 'patient' },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true, collection: 'users' });

    const User = userConn.model('User', UserSchema);

    const email = 'dulajtck@gmail.com';
    const password = '123456789D';
    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: 'Dulaj',
        lastName: 'Patient',
        email,
        password: hashedPassword,
        role: 'patient',
        isActive: true
      });
      console.log('[User] Created user:', email);
    } else {
      user.password = hashedPassword;
      await user.save();
      console.log('[User] Updated user password:', email);
    }

    const patientId = user._id.toString();
    await userConn.close();

    // 2. Create Transactions in medicate_transactions
    const transConn = await mongoose.createConnection(TRANS_DB).asPromise();
    console.log('[DB] Connected to medicate_transactions');

    const TransactionSchema = new mongoose.Schema({
      transactionId: { type: String, unique: true },
      patientId: String,
      doctorId: String,
      appointmentId: String,
      gateway: { type: String, default: 'stripe' },
      amount: Number,
      currency: { type: String, default: 'USD' },
      status: String,
      description: String,
      gatewayTransactionId: String,
      createdAt: { type: Date, default: Date.now }
    }, { timestamps: true, collection: 'transactions' });

    const Transaction = transConn.model('Transaction', TransactionSchema);

    // Clear existing for this user to avoid duplicates if re-run (optional)
    // await Transaction.deleteMany({ patientId });

    const doctorId = new mongoose.Types.ObjectId().toString(); // Dummy doctor ID

    const sampleTransactions = [
      {
        transactionId: uuidv4(),
        patientId,
        doctorId,
        amount: 5000,
        currency: 'USD',
        status: 'succeeded',
        description: 'Cardiology Consultation',
        gatewayTransactionId: 'pi_' + uuidv4().substring(0, 8),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        transactionId: uuidv4(),
        patientId,
        doctorId,
        amount: 3500,
        currency: 'USD',
        status: 'succeeded',
        description: 'General Checkup',
        gatewayTransactionId: 'pi_' + uuidv4().substring(0, 8),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        transactionId: uuidv4(),
        patientId,
        doctorId,
        amount: 12000,
        currency: 'USD',
        status: 'pending',
        description: 'Specialist Surgery Deposit',
        gatewayTransactionId: 'pi_' + uuidv4().substring(0, 8),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        transactionId: uuidv4(),
        patientId,
        doctorId,
        amount: 4500,
        currency: 'USD',
        status: 'failed',
        description: 'Dermatology Session',
        gatewayTransactionId: 'pi_' + uuidv4().substring(0, 8),
        createdAt: new Date()
      }
    ];

    for (const tx of sampleTransactions) {
      const exists = await Transaction.findOne({ description: tx.description, patientId });
      if (!exists) {
        await Transaction.create(tx);
        console.log('[Transaction] Seeded:', tx.description);
      }
    }

    await transConn.close();
    console.log('--- SEEDING COMPLETE ---');

  } catch (err) {
    console.error('[Error] Seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
