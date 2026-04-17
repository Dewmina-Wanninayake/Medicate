const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:UGW8UDMPxwM3SHJV@cluster0.4eyusgd.mongodb.net/';

async function findIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const UserSchema = new mongoose.Schema({
        email: String,
        role: String
    }, { strict: false, collection: 'users' });
    const User = mongoose.model('User', UserSchema);

    const targetUser = await User.findOne({ email: 'dulajtck@gmail.com' });
    const doctor = await User.findOne({ role: 'doctor' });

    console.log('Target User ID:', targetUser ? targetUser._id : 'Not found');
    console.log('Doctor ID:', doctor ? doctor._id : 'Not found');
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

findIds();
