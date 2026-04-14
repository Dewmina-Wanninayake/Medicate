/**
 * services/email.service.js
 * Email notification service using Nodemailer
 *
 * Supports:
 *  - Payment receipts
 *  - Appointment confirmations & reminders
 *  - Prescription ready alerts
 *  - Generic templated emails
 *
 * Transport: SMTP (production) or Ethereal (development auto-preview)
 */

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize the mail transporter.
 * Called lazily on first use to allow env vars to be loaded.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // Use Ethereal for development (auto-creates test account)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
  } else {
    // Production SMTP (Gmail, SendGrid, AWS SES, etc.)
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  // Verify connection
  try {
    await transporter.verify();
    console.log('[Email] SMTP connection verified');
  } catch (err) {
    console.error('[Email] SMTP connection failed:', err.message);
    transporter = null;
    throw err;
  }

  return transporter;
};

// ─── Templates ────────────────────────────────────────────────────────────────

const templates = {
  payment_success: ({ patientName, amount, currency, transactionId, doctorName, appointmentDate }) => ({
    subject: `✅ Payment Confirmed — Medicate Receipt #${transactionId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9fafb;padding:24px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#0070f3,#00bcd4);padding:28px;border-radius:8px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">💳 Payment Successful</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-top:16px;border:1px solid #e5e7eb;">
          <p style="font-size:16px;color:#374151;">Dear <strong>${patientName}</strong>,</p>
          <p style="color:#374151;">Your payment has been successfully processed. Here are your details:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f3f4f6;">
              <td style="padding:10px;font-weight:bold;color:#374151;">Transaction ID</td>
              <td style="padding:10px;color:#6b7280;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;color:#374151;">Amount Paid</td>
              <td style="padding:10px;color:#059669;font-weight:bold;">${currency} ${(amount / 100).toFixed(2)}</td>
            </tr>
            <tr style="background:#f3f4f6;">
              <td style="padding:10px;font-weight:bold;color:#374151;">Doctor</td>
              <td style="padding:10px;color:#6b7280;">Dr. ${doctorName}</td>
            </tr>
            ${appointmentDate ? `
            <tr>
              <td style="padding:10px;font-weight:bold;color:#374151;">Appointment</td>
              <td style="padding:10px;color:#6b7280;">${appointmentDate}</td>
            </tr>` : ''}
          </table>
          <p style="color:#6b7280;font-size:14px;margin-top:20px;">Thank you for choosing Medicate. Please keep this email as your receipt.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Medicate Healthcare Platform</p>
      </div>`,
  }),

  payment_failed: ({ patientName, transactionId, reason }) => ({
    subject: `❌ Payment Failed — Medicate Ref #${transactionId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <div style="background:#ef4444;padding:28px;border-radius:8px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Payment Failed</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-top:16px;border:1px solid #fecaca;">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Unfortunately your payment could not be processed.</p>
          <p><strong>Reference:</strong> ${transactionId}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please try again or contact our support team.</p>
        </div>
      </div>`,
  }),

  payment_refund: ({ patientName, amount, currency, transactionId, reason }) => ({
    subject: `💰 Refund Processed — Medicate`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <div style="background:#f59e0b;padding:28px;border-radius:8px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Refund Processed</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-top:16px;">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>A refund of <strong>${currency} ${(amount / 100).toFixed(2)}</strong> has been processed for transaction <strong>${transactionId}</strong>.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please allow 5–10 business days for the amount to reflect in your account.</p>
        </div>
      </div>`,
  }),

  appointment_confirmation: ({ patientName, doctorName, appointmentDate, appointmentTime, consultationType }) => ({
    subject: `📅 Appointment Confirmed — Medicate`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:28px;border-radius:8px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Appointment Confirmed</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-top:16px;border:1px solid #d1fae5;">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been confirmed:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#f0fdf4;"><td style="padding:10px;font-weight:bold;">Doctor</td><td style="padding:10px;">Dr. ${doctorName}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Date</td><td style="padding:10px;">${appointmentDate}</td></tr>
            <tr style="background:#f0fdf4;"><td style="padding:10px;font-weight:bold;">Time</td><td style="padding:10px;">${appointmentTime}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Type</td><td style="padding:10px;">${consultationType || 'Online Consultation'}</td></tr>
          </table>
        </div>
      </div>`,
  }),

  general: ({ recipientName, subject: _s, message }) => ({
    subject: _s || 'Notification from Medicate',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>${message}</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">Medicate Healthcare Platform</p>
      </div>`,
  }),
};

// ─── Core send function ────────────────────────────────────────────────────────

/**
 * Send an email notification.
 *
 * @param {object} options
 * @param {string}  options.to          Recipient email
 * @param {string}  options.type        Template key (see templates above)
 * @param {object}  options.data        Template variables
 * @param {string}  [options.subject]   Override subject
 * @returns {Promise<{ messageId: string, previewUrl: string|null }>}
 */
const sendEmail = async ({ to, type = 'general', data = {}, subject: subjectOverride }) => {
  const transport = await getTransporter();

  const template = templates[type] || templates.general;
  const { subject, html } = template(data);

  const mailOptions = {
    from: `"Medicate Healthcare" <${process.env.SMTP_FROM || 'noreply@medicate.health'}>`,
    to,
    subject: subjectOverride || subject,
    html,
  };

  const info = await transport.sendMail(mailOptions);

  // In development, log the Ethereal preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (previewUrl) {
    console.log(`[Email] Preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl };
};

module.exports = { sendEmail };
