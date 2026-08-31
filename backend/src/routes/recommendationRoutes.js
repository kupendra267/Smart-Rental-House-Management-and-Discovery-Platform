const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res, next) => recommendationController.getRecommendations(req, res, next));

module.exports = router;
