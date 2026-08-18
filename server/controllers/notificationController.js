const Notification = require('../models/Notification');

// @route GET /api/notifications
// Get unread & recent notifications for logged in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/notifications/read-all
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
