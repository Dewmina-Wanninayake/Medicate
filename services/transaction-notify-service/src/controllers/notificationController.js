const Notification = require('../models/Notification');
const { sendEmail } = require('../config/mailer');
const { sendSMS } = require('../config/sms');

// Internal event handler — called by other services (no auth required, internal only)
// POST /api/notifications/internal
async function handleInternalEvent(req, res) {
  try {
    const { event, data } = req.body;
    if (!event || !data) return res.status(400).json({ error: 'event and data required' });

    const templates = buildTemplates(event, data);

    const notifications = [];
    for (const t of templates) {
      const notif = await Notification.create({
        userId: t.userId,
        type: event,
        title: t.title,
        message: t.message,
        channels: t.channels,
        metadata: data,
        isRead: false,
      });
      notifications.push(notif);

      // Send email if provided
      if (t.email) {
        await sendEmail({
          to: t.email,
          subject: t.title,
          text: t.message,
          html: `<p>${t.message}</p>`,
        });
      }

      // Send SMS if provided
      if (t.phone) {
        await sendSMS({ to: t.phone, body: t.message });
      }
    }

    res.json({ ok: true, notificationsCreated: notifications.length });
  } catch (err) {
    console.error('Internal event error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

function buildTemplates(event, data) {
  const templates = [];

  switch (event) {
    case 'appointment_booked':
      templates.push({
        userId: data.patientId,
        title: 'Booking Initiated (Payment Pending)',
        message: `Your appointment has been booked for ${data.appointmentDate} at ${data.startTime}. Please complete your payment to confirm the session.`,
        channels: ['email', 'in_app'],
        email: data.patientEmail,
        phone: data.patientPhone,
      });
      templates.push({
        userId: data.doctorId,
        title: 'New Appointment Request',
        message: `You have a new appointment request for ${data.appointmentDate} at ${data.startTime}. Please confirm or reject.`,
        channels: ['email', 'in_app'],
        email: data.doctorEmail,
      });
      break;

    case 'appointment_status_updated':
      templates.push({
        userId: data.patientId,
        title: `Appointment ${capitalize(data.status)}`,
        message: `Your appointment has been ${data.status}.`,
        channels: ['email', 'sms', 'in_app'],
        email: data.patientEmail,
        phone: data.patientPhone,
      });
      break;

    case 'payment_success':
      templates.push({
        userId: data.patientId,
        title: 'Payment Successful',
        message: `Your payment of ${formatAmount(data.amount, data.currency)} was successful for appointment ${data.appointmentId}.`,
        channels: ['email', 'sms', 'in_app'],
        email: data.patientEmail,
        phone: data.patientPhone,
      });
      break;

    case 'payment_failed':
      templates.push({
        userId: data.patientId,
        title: 'Payment Failed',
        message: `Your payment for appointment ${data.appointmentId} failed. Please try again.`,
        channels: ['email', 'sms', 'in_app'],
        email: data.patientEmail,
        phone: data.patientPhone,
      });
      break;

    default:
      if (data.userId) {
        templates.push({
          userId: data.userId,
          title: data.title || 'Notification',
          message: data.message || event,
          channels: ['in_app'],
        });
      }
  }

  return templates;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatAmount(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// GET /api/notifications  — get own notifications
async function getNotifications(req, res) {
  try {
    const { unreadOnly } = req.query;
    const filter = { userId: req.userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/notifications/:id/read  — mark as read
async function markRead(req, res) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/notifications/read-all  — mark all as read
async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleInternalEvent, getNotifications, markRead, markAllRead };
