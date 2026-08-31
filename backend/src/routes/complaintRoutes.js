const express = require('express');
const complaintController = require('../controllers/complaintController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, (req, res, next) => complaintController.create(req, res, next));
router.get('/', authenticateToken, (req, res, next) => complaintController.getAll(req, res, next));
router.patch('/:id', authenticateToken, requireRole('ADMIN'), (req, res, next) => complaintController.update(req, res, next));

module.exports = router;
