const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res, next) => notificationController.getNotifications(req, res, next));
router.patch('/read-all', authenticateToken, (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.patch('/:id/read', authenticateToken, (req, res, next) => notificationController.markAsRead(req, res, next));

module.exports = router;
