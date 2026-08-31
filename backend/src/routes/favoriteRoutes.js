const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Tenant favorite routes
router.get('/', authenticateToken, requireRole('TENANT'), (req, res, next) => favoriteController.getFavorites(req, res, next));
router.post('/:propertyId', authenticateToken, requireRole('TENANT'), (req, res, next) => favoriteController.addFavorite(req, res, next));
router.delete('/:propertyId', authenticateToken, requireRole('TENANT'), (req, res, next) => favoriteController.removeFavorite(req, res, next));

module.exports = router;
