/**
 * services/sms.service.js
 * SMS notification service using Twilio
 *
 * Supports:
 *  - Payment confirmation SMS
 *  - Appointment reminders
 *  - OTP codes (for 2FA if needed)
 *  - Generic SMS
 */

const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'ACplaceholder';
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN  || 'placeholder';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+1234567890';

// Lazy-init client so missing env vars don't crash at import time
let client = null;

const getClient = () => {
  if (!client) {
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_ACCOUNT_SID !== 'ACplaceholder') {
      client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } else {
      // Mock client for development when Twilio is not configured
      console.warn('[SMS] Twilio not configured — SMS will be logged only');
      client = {
        messages: {
          create: async (params) => {
            console.log('[SMS] [MOCK] Would send SMS:', params);
            return { sid: `MOCK_${Date.now()}`, status: 'sent' };
          },
        },
      };
    }
  }
  return client;
};

// ─── Message templates ────────────────────────────────────────────────────────

const smsTemplates = {
  payment_success: ({ patientName, amount, currency, transactionId }) =>
    `Medicate: Hi ${patientName}, your payment of ${currency} ${(amount / 100).toFixed(2)} was successful. Ref: ${transactionId.slice(-8).toUpperCase()}. Thank you!`,

  payment_failed: ({ patientName, transactionId }) =>
    `Medicate: Hi ${patientName}, your payment (Ref: ${transactionId.slice(-8).toUpperCase()}) failed. Please try again or contact support.`,

  payment_refund: ({ patientName, amount, currency }) =>
    `Medicate: Hi ${patientName}, refund of ${currency} ${(amount / 100).toFixed(2)} has been processed. Allow 5-10 business days.`,

  appointment_confirmation: ({ patientName, doctorName, appointmentDate, appointmentTime }) =>
    `Medicate: Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}.`,

  appointment_reminder: ({ patientName, doctorName, appointmentDate, appointmentTime }) =>
    `Medicate Reminder: Hi ${patientName}, you have an appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime}. Please be ready.`,

  prescription_ready: ({ patientName, doctorName }) =>
    `Medicate: Hi ${patientName}, your prescription from Dr. ${doctorName} is ready. Log in to view it.`,

  otp: ({ otp, expireMinutes = 10 }) =>
    `Medicate: Your OTP is ${otp}. Valid for ${expireMinutes} minutes. Do not share this with anyone.`,

  general: ({ recipientName, message }) =>
    `Medicate: Hi ${recipientName}, ${message}`,
};

// ─── Core send function ────────────────────────────────────────────────────────

/**
 * Send an SMS notification.
 *
 * @param {object} options
 * @param {string}  options.to     Recipient phone number (E.164 format, e.g. '+94771234567')
 * @param {string}  options.type   Template key
 * @param {object}  options.data   Template variables
 * @param {string}  [options.body] Override message body
 * @returns {Promise<{ sid: string, status: string }>}
 */
const sendSms = async ({ to, type = 'general', data = {}, body: bodyOverride }) => {
  const templateFn = smsTemplates[type] || smsTemplates.general;
  const body = bodyOverride || templateFn(data);

  // Truncate to 160 chars for single-segment SMS
  const truncated = body.length > 320 ? body.substring(0, 317) + '...' : body;

  const twilioClient = getClient();
  const message = await twilioClient.messages.create({
    body: truncated,
    from: TWILIO_FROM_NUMBER,
    to,
  });

  console.log(`[SMS] Sent to ${to} — SID: ${message.sid} — Status: ${message.status}`);

  return { sid: message.sid, status: message.status };
};

/**
 * Send an OTP via SMS.
 * Generates a 6-digit OTP, sends it, and returns the code for server-side verification.
 *
 * @param {string} phoneNumber  E.164 phone
 * @returns {Promise<{ otp: string, sid: string }>}
 */
const sendOtp = async (phoneNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendSms({
    to:   phoneNumber,
    type: 'otp',
    data: { otp, expireMinutes: 10 },
  });
  return { otp, sid: result.sid };
};

module.exports = { sendSms, sendOtp };
