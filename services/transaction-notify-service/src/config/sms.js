let twilioClient;

function getTwilio() {
  if (!twilioClient) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn('Twilio credentials not set — SMS will be skipped');
      return null;
    }
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

async function sendSMS({ to, body }) {
  try {
    const client = getTwilio();
    if (!client) {
      console.log(`[SMS MOCK] To: ${to} | Body: ${body}`);
      return;
    }
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}: ${msg.sid}`);
    return msg;
  } catch (err) {
    console.error('SMS send error:', err.message);
    // Non-fatal
  }
}

module.exports = { sendSMS };
