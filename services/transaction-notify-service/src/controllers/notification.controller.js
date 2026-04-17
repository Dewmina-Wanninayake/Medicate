/**
 * controllers/notification.controller.js
 * Handles direct notification dispatch and notification history queries
 *
 * Routes:
 *   POST  /api/notifications/send          — send email or SMS (admin/doctor)
 *   GET   /api/notifications               — list notifications (admin)
 *   GET   /api/notifications/my            — patient/doctor's own notifications
 *   GET   /api/notifications/:id           — get single notification
 */

const Notification  = require('../models/Notification');
const emailService  = require('../services/email.service');
const smsService    = require('../services/sms.service');

/**
 * POST /api/notifications/send
 * Manually dispatch a notification. Accessible by doctor and admin.
 * Body: { recipientId, recipientRole, channel, type, subject, body,
 *          email, phone, data, relatedTransactionId, relatedAppointmentId }
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const {
      recipientId,
      recipientRole = 'patient',
      channel,                 // 'email' | 'sms'
      type = 'general',
      subject,
      body: bodyText,
      email,
      phone,
      data = {},
      relatedTransactionId,
      relatedAppointmentId,
    } = req.body;

    if (!channel || !['email', 'sms'].includes(channel)) {
      return res.status(400).json({ success: false, error: "channel must be 'email' or 'sms'" });
    }

    const notifRecord = {
      recipientId,
      recipientRole,
      channel,
      type,
      body: bodyText || JSON.stringify(data),
      relatedTransactionId,
      relatedAppointmentId,
      status: 'queued',
    };

    let providerResult;

    if (channel === 'email') {
      if (!email) return res.status(400).json({ success: false, error: 'email is required for email channel' });
      notifRecord.recipientEmail = email;
      notifRecord.subject = subject;

      providerResult = await emailService.sendEmail({ to: email, type, data, subject });
      notifRecord.status = 'sent';
      notifRecord.providerMessageId = providerResult.messageId;
      notifRecord.sentAt = new Date();
    } else {
      if (!phone) return res.status(400).json({ success: false, error: 'phone is required for sms channel' });
      notifRecord.recipientPhone = phone;

      providerResult = await smsService.sendSms({ to: phone, type, data, body: bodyText });
      notifRecord.status = 'sent';
      notifRecord.providerMessageId = providerResult.sid;
      notifRecord.sentAt = new Date();
    }

    const notification = await Notification.create(notifRecord);

    res.status(201).json({
      success: true,
      data: {
        notificationId: notification._id,
        status:         notification.status,
        channel,
        providerResult,
      },
    });
  } catch (err) {
    // Log and save failure record
    try {
      await Notification.create({
        recipientId: req.body.recipientId || 'unknown',
        recipientRole: req.body.recipientRole || 'patient',
        channel: req.body.channel || 'email',
        type: req.body.type || 'general',
        body: req.body.body || '',
        status: 'failed',
        failureReason: err.message,
      });
    } catch (_) { /* ignore secondary error */ }
    next(err);
  }
};

/**
 * GET /api/notifications
 * Admin: list all notifications with optional filters.
 * Query: ?channel=email&type=payment_success&status=sent&page=1&limit=20
 */
exports.listNotifications = async (req, res, next) => {
  try {
    const { channel, type, status, recipientId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (channel)     filter.channel     = channel;
    if (type)        filter.type        = type;
    if (status)      filter.status      = status;
    if (recipientId) filter.recipientId = recipientId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/my
 * Returns the calling user's own notifications (patient or doctor).
 */
exports.myNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { recipientId: req.user.userId };
    const skip   = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/:id
 * Get a single notification record.
 */
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Non-admins can only view their own
    if (req.user.role !== 'admin' && notification.recipientId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};
