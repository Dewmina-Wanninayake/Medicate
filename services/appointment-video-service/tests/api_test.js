const BASE_URL = 'http://localhost:5003';

async function testEndpoints() {
  console.log('--- Starting API Tests ---');

  try {
    // 1. Root Route
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    console.log('✅ Root Route:', rootData.message);

    // 2. Book Appointment
    const bookRes = await fetch(`${BASE_URL}/api/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: 'patient_001',
        doctorId: 'doctor_001',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        appointmentType: 'telemedicine'
      })
    });
    const bookData = await bookRes.json();
    console.log('✅ Book Appointment:', bookData.success ? 'Success' : 'Failed');
    const appointmentId = bookData.data?._id;

    if (!appointmentId) throw new Error('Failed to book appointment');

    // 3. Generate Room (Agora)
    const roomRes = await fetch(`${BASE_URL}/api/consultations/generate-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId })
    });
    const roomData = await roomRes.json();
    console.log('✅ Generate Room:', roomData.success ? 'Success' : 'Failed');

    // 4. Send Message
    const msgRes = await fetch(`${BASE_URL}/api/consultations/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        senderId: 'doctor_001',
        senderRole: 'doctor',
        content: 'Hello, how can I help you today?'
      })
    });
    const msgData = await msgRes.json();
    console.log('✅ Send Message:', msgData.success ? 'Success' : 'Failed');

    // 5. Get Messages
    const getMsgRes = await fetch(`${BASE_URL}/api/consultations/messages/${appointmentId}`);
    const getMsgData = await getMsgRes.json();
    console.log('✅ Get Messages:', getMsgData.data.length === 1 ? 'Correct' : 'Incorrect length');

    // 6. Update Notes
    const notesRes = await fetch(`${BASE_URL}/api/consultations/update-notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        notes: 'Follow up in 2 weeks. Patient condition: stable.'
      })
    });
    const notesData = await notesRes.json();
    console.log('✅ Update Notes:', notesData.success ? 'Success' : 'Failed');

    console.log('--- All Tests Completed Successfully ---');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testEndpoints();
