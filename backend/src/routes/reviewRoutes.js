const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, requireRole('TENANT'), (req, res, next) => reviewController.create(req, res, next));

module.exports = router;
