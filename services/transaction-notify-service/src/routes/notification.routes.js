/**
 * routes/notification.routes.js
 * All /api/notifications routes
 */

const express = require('express');
const { body, query } = require('express-validator');
const router  = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl     = require('../controllers/notification.controller');

/**
 * POST /api/notifications/send
 * Manually send an email or SMS — accessible by admin and doctor
 */
router.post(
  '/send',
  authenticate,
  authorize('admin', 'doctor'),
  [
    body('recipientId').notEmpty().withMessage('recipientId is required'),
    body('recipientRole').isIn(['patient', 'doctor', 'admin']).withMessage('invalid recipientRole'),
    body('channel').isIn(['email', 'sms']).withMessage("channel must be 'email' or 'sms'"),
    body('type').optional().isIn([
      'payment_success','payment_failed','payment_refund',
      'appointment_confirmation','appointment_reminder',
      'prescription_ready','general',
    ]),
    body('email').if(body('channel').equals('email')).isEmail().withMessage('valid email is required'),
    body('phone').if(body('channel').equals('sms')).notEmpty().withMessage('phone is required for sms'),
  ],
  validate,
  ctrl.sendNotification
);

/**
 * GET /api/notifications
 * Admin: list all notifications with filters
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('channel').optional().isIn(['email', 'sms']),
    query('status').optional().isIn(['queued', 'sent', 'failed', 'bounced']),
  ],
  validate,
  ctrl.listNotifications
);

/**
 * GET /api/notifications/my
 * Patient or doctor: their own notification history
 */
router.get(
  '/my',
  authenticate,
  authorize('patient', 'doctor'),
  ctrl.myNotifications
);

/**
 * GET /api/notifications/:id
 * Get a specific notification record
 */
router.get(
  '/:id',
  authenticate,
  authorize('patient', 'doctor', 'admin'),
  ctrl.getNotification
);

module.exports = router;
