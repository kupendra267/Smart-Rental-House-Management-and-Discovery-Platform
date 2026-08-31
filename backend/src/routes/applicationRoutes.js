const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Tenant routes
router.post('/', authenticateToken, requireRole('TENANT'), (req, res, next) => applicationController.apply(req, res, next));
router.get('/tenant', authenticateToken, requireRole('TENANT'), (req, res, next) => applicationController.getTenantApplications(req, res, next));

// Owner routes
router.get('/owner', authenticateToken, requireRole('OWNER'), (req, res, next) => applicationController.getOwnerApplications(req, res, next));
router.patch('/:id/status', authenticateToken, requireRole(['OWNER', 'ADMIN']), (req, res, next) => applicationController.updateStatus(req, res, next));

module.exports = router;
