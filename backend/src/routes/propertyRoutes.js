const express = require('express');
const propertyController = require('../controllers/propertyController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', (req, res, next) => propertyController.getAllProperties(req, res, next));
router.get('/amenities', (req, res, next) => propertyController.getAmenities(req, res, next));
router.post('/compare', (req, res, next) => propertyController.compareProperties(req, res, next));

// Owner specific management
router.get('/owner/my-properties', authenticateToken, requireRole('OWNER'), (req, res, next) => propertyController.getOwnerProperties(req, res, next));
router.post('/', authenticateToken, requireRole('OWNER'), (req, res, next) => propertyController.createProperty(req, res, next));
router.put('/:id', authenticateToken, requireRole(['OWNER', 'ADMIN']), (req, res, next) => propertyController.updateProperty(req, res, next));
router.delete('/:id', authenticateToken, requireRole(['OWNER', 'ADMIN']), (req, res, next) => propertyController.deleteProperty(req, res, next));

// Public property details (tracks view with optional auth)
router.get('/:id', optionalAuth, (req, res, next) => propertyController.getPropertyById(req, res, next));

module.exports = router;
