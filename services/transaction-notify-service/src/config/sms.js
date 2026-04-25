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

    // Normalize to E.164: remove all non-digits, then prepend +
    const digitsOnly = to.replace(/\D/g, '');
    const e164Phone = `+${digitsOnly}`;

    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to: e164Phone,
    });
    console.log(`SMS sent to ${e164Phone}: ${msg.sid}`);
    return msg;
  } catch (err) {
    console.error('SMS send error:', err.message);
    // Non-fatal
  }
}

module.exports = { sendSMS };
