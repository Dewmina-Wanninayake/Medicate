const router = require('express').Router();
const {
  listUsers, getUserById, getPendingDoctors,
  verifyDoctor, rejectDoctor, toggleUserStatus,
  deleteUser, getPlatformStats,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/stats',                  getPlatformStats);
router.get('/users',                  listUsers);
router.get('/users/:id',              getUserById);
router.delete('/users/:id',           deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

router.get('/doctors/pending',        getPendingDoctors);
router.put('/doctors/:id/verify',     verifyDoctor);
router.put('/doctors/:id/reject',     rejectDoctor);

module.exports = router;