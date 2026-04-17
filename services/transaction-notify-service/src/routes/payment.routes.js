/**
 * routes/payment.routes.js
 * All /api/payments routes — Stripe only
 */

const express  = require('express');
const { body, param, query } = require('express-validator');
const router   = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const ctrl      = require('../controllers/payment.controller');

// ─── Stripe: Create PaymentIntent ─────────────────────────────────────────────
/**
 * POST /api/payments/stripe/intent
 * Patient initiates a payment — returns clientSecret for Stripe.js
 */
router.post(
  '/stripe/intent',
  authenticate,
  authorize('patient', 'admin'),
  [
    body('amount').isInt({ min: 50 }).withMessage('amount must be a positive integer (cents)'),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('patientId').notEmpty().withMessage('patientId is required'),
    body('doctorId').notEmpty().withMessage('doctorId is required'),
    body('patientEmail').isEmail().withMessage('valid patientEmail is required'),
    body('patientName').notEmpty().withMessage('patientName is required'),
  ],
  validate,
  ctrl.createStripeIntent
);

// ─── Stripe: Confirm PaymentIntent ────────────────────────────────────────────
/**
 * POST /api/payments/stripe/confirm
 * Server-side confirmation of a PaymentIntent
 */
router.post(
  '/stripe/confirm',
  authenticate,
  authorize('patient', 'admin'),
  [
    body('paymentIntentId').notEmpty().withMessage('paymentIntentId is required'),
    body('paymentMethodId').optional(),   // frontend Stripe.js confirms client-side; no paymentMethodId forwarded
  ],
  validate,
  ctrl.confirmStripePayment
);

// ─── Stripe: Refund ───────────────────────────────────────────────────────────
/**
 * POST /api/payments/stripe/refund
 * Admin only — issue a full or partial refund
 */
router.post(
  '/stripe/refund',
  authenticate,
  authorize('admin'),
  [
    body('transactionId').notEmpty().withMessage('transactionId is required'),
    body('amount').optional().isInt({ min: 1 }),
    body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']),
  ],
  validate,
  ctrl.createStripeRefund
);

// ─── Stripe: List saved payment methods ───────────────────────────────────────
/**
 * GET /api/payments/stripe/methods?customerId=cus_xxx
 */
router.get(
  '/stripe/methods',
  authenticate,
  authorize('patient', 'admin'),
  [query('customerId').notEmpty().withMessage('customerId is required')],
  validate,
  ctrl.listPaymentMethods
);

// ─── Transactions: admin list ─────────────────────────────────────────────────
/**
 * GET /api/payments/transactions
 * Admin only — paginated list with optional filters
 */
router.get(
  '/transactions',
  authenticate,
  authorize('admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn([
      'pending','processing','succeeded','failed',
      'refunded','partially_refunded','cancelled',
    ]),
  ],
  validate,
  ctrl.listTransactions
);

// ─── Transactions: patient's own ──────────────────────────────────────────────
/**
 * GET /api/payments/my-transactions
 */
router.get(
  '/my-transactions',
  authenticate,
  authorize('patient'),
  ctrl.myTransactions
);

// ─── Transactions: single record ──────────────────────────────────────────────
/**
 * GET /api/payments/transactions/:id
 * Patient sees own, doctor and admin see all
 */
router.get(
  '/transactions/:id',
  authenticate,
  authorize('patient', 'doctor', 'admin'),
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validate,
  ctrl.getTransaction
);

// ─── Transactions: update status (admin) ─────────────────────────────────────
/**
 * PUT /api/payments/transactions/:id/status
 * Admin only — manually adjust payment state.
 */
router.put(
  '/transactions/:id/status',
  authenticate,
  authorize('admin'),
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('status')
      .isIn([
        'pending','processing','succeeded','completed','failed',
        'refunded','partially_refunded','cancelled'
      ])
      .withMessage('Invalid status provided')
  ],
  validate,
  ctrl.updateTransactionStatus
);

module.exports = router;
