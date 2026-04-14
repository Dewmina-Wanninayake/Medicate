const router = require('express').Router();
const {
  getProfile, updateProfile, changePassword, listDoctors, getDoctorById,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { updateProfileRules, changePasswordRules, validate } = require('../middleware/validate.middleware');

// Public routes (anyone can browse verified doctors)
router.get('/doctors',     listDoctors);
router.get('/doctors/:id', getDoctorById);

// Protected routes (must be logged in)
router.get('/profile',            protect, getProfile);
router.put('/profile',            protect, updateProfileRules, validate, updateProfile);
router.put('/change-password',    protect, changePasswordRules, validate, changePassword);

module.exports = router;