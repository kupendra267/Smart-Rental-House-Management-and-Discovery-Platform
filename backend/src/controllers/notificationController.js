const rentalRepository = require('../repositories/rentalRepository');
const { successResponse } = require('../utils/response');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifications = await rentalRepository.findNotificationsByUser(req.user.id);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return successResponse(res, { notifications, unreadCount, total: notifications.length }, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await rentalRepository.markNotificationRead(id);
      return successResponse(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await rentalRepository.markAllNotificationsRead(req.user.id);
      return successResponse(res, { message: 'All notifications marked as read' }, 'Success');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
