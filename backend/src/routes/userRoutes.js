const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// User profile endpoints
router.get('/profile', authenticateToken, (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', authenticateToken, (req, res, next) => userController.updateProfile(req, res, next));
router.post('/owner-verification', authenticateToken, requireRole('OWNER'), (req, res, next) => userController.uploadOwnerVerification(req, res, next));

// Admin user management endpoints
router.get('/', authenticateToken, requireRole('ADMIN'), (req, res, next) => userController.getAllUsers(req, res, next));
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), (req, res, next) => userController.updateUserStatus(req, res, next));

module.exports = router;
