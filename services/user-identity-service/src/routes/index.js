const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const adminCtrl = require('../controllers/adminController');
const { requireRole } = require('../middleware/roleCheck');

// Auth routes (public — API Gateway exempts these from JWT check)
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);

// User profile routes
router.get('/users/me', requireRole(), userCtrl.getMe);
router.put('/users/me', requireRole(), userCtrl.updateMe);

// Doctor routes
router.get('/doctors/public', userCtrl.listDoctors);  // public
router.get('/doctors/:id', userCtrl.getDoctorById);
router.put('/doctors/availability', requireRole('doctor'), userCtrl.setAvailability);

// Admin routes
router.get('/admin/users', requireRole('admin'), adminCtrl.listUsers);
router.patch('/admin/doctors/:id/verify', requireRole('admin'), adminCtrl.verifyDoctor);
router.patch('/admin/users/:id/status', requireRole('admin'), adminCtrl.toggleUserStatus);
router.delete('/admin/users/:id', requireRole('admin'), adminCtrl.deleteUser);
router.put('/admin/users/:id', requireRole('admin'), adminCtrl.updateUser);

module.exports = router;
