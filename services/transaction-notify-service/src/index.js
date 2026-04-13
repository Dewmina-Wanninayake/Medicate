/**
 * transaction-notify-service — Entry Point
 * Medicate Smart Healthcare Platform — Member 4
 *
 * Responsibilities:
 *  - Payment processing  : Stripe (card payments)
 *  - Notifications       : Email (Nodemailer/SMTP) + SMS (Twilio)
 *  - JWT Auth middleware  : Patient | Doctor | Admin role guards
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`[transaction-notify-service] Running on port ${PORT}`);
  console.log(`[transaction-notify-service] Environment: ${process.env.NODE_ENV || 'development'}`);
});
