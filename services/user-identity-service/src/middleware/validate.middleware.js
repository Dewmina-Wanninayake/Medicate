const { body, validationResult } = require('express-validator');

// ── Run validation and return errors ────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ── Register validation rules ────────────────────────────────────
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
  body('phone.countryCode')
    .optional()
    .matches(/^\+\d{1,4}$/).withMessage('Invalid country code (e.g. +94, +1, +44)'),
  body('phone.number')
    .optional()
    .matches(/^\d{7,15}$/).withMessage('Invalid phone number'),
];

// ── Login validation rules ───────────────────────────────────────
const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Update profile validation rules ─────────────────────────────
const updateProfileRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone.countryCode')
    .optional()
    .matches(/^\+\d{1,4}$/).withMessage('Invalid country code (e.g. +94, +1, +44)'),
  body('phone.number')
    .optional()
    .matches(/^\d{7,15}$/).withMessage('Invalid phone number'),
];

// ── Change password validation rules ────────────────────────────
const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/\d/).withMessage('New password must contain a number')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
};