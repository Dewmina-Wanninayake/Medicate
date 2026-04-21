const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleCheck');
const paymentCtrl = require('../controllers/paymentController');
const notifCtrl = require('../controllers/notificationController');

// Payment routes
router.post('/payments/create-intent', requireRole('patient'), paymentCtrl.createPaymentIntent);
router.get('/payments', requireRole(), paymentCtrl.getPayments);
router.get('/payments/:id', requireRole(), paymentCtrl.getPaymentById);
router.post('/payments/confirm/:paymentId', requireRole(), paymentCtrl.confirmPayment);
router.post('/payments/refund/:id', requireRole('admin'), paymentCtrl.refundPayment);

// Stripe webhook — raw body required (mounted separately in index.js)
// router.post('/payments/webhook', paymentCtrl.handleWebhook); // mounted in index.js

// Notification routes
router.post('/notifications/internal', notifCtrl.handleInternalEvent); // internal service-to-service
router.get('/notifications', requireRole(), notifCtrl.getNotifications);
router.patch('/notifications/read-all', requireRole(), notifCtrl.markAllRead);
router.patch('/notifications/:id/read', requireRole(), notifCtrl.markRead);

module.exports = router;
