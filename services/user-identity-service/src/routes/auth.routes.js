const router = require('express').Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerRules, loginRules, validate } = require('../middleware/validate.middleware');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.post('/refresh',  refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me',      protect, getMe);

module.exports = router;