const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, requireRole('TENANT'), (req, res, next) => maintenanceController.create(req, res, next));
router.get('/', authenticateToken, (req, res, next) => maintenanceController.getAll(req, res, next));
router.patch('/:id/status', authenticateToken, requireRole(['OWNER', 'ADMIN']), (req, res, next) => maintenanceController.updateStatus(req, res, next));

module.exports = router;
