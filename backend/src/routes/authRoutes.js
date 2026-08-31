const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Protected auth routes
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

module.exports = router;
