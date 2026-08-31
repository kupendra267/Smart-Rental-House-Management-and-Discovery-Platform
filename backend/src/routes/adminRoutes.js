const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Super Admin Only
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
router.get('/properties/pending', (req, res, next) => adminController.getPendingProperties(req, res, next));
router.patch('/properties/:id/verify', (req, res, next) => adminController.verifyProperty(req, res, next));
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

module.exports = router;
