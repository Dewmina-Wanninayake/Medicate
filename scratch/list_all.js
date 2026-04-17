const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:UGW8UDMPxwM3SHJV@cluster0.4eyusgd.mongodb.net/';

async function listAll() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));

    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = conn.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        console.log(`Collections in ${dbInfo.name}:`, collections.map(c => c.name));
        
        const usersCol = collections.find(c => c.name === 'users');
        if (usersCol) {
            const users = await db.db.collection('users').find({ email: 'dulajtck@gmail.com' }).toArray();
            if (users.length > 0) {
                console.log(`FOUND USER in ${dbInfo.name}:`, JSON.stringify(users[0], null, 2));
            }
            const doctor = await db.db.collection('users').findOne({ role: 'doctor' });
            if (doctor) {
                console.log(`FOUND DOCTOR in ${dbInfo.name}:`, JSON.stringify(doctor, null, 2));
            }
        }
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

listAll();
