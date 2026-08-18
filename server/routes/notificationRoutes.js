const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserNotifications);
router.patch('/read-all', protect, markAllNotificationsRead);
router.patch('/:id/read', protect, markNotificationRead);

module.exports = router;
