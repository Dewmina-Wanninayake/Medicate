const nodemailer = require('nodemailer');

let transporter;

function getMailer() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  try {
    const mailer = getMailer();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@healthcare.local',
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Email send error:', err.message);
    // Non-fatal — log but don't throw
  }
}

module.exports = { sendEmail };
