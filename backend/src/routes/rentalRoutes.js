const express = require('express');
const rentalController = require('../controllers/rentalController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res, next) => rentalController.getRentals(req, res, next));
router.get('/invoices', authenticateToken, (req, res, next) => rentalController.getInvoices(req, res, next));
router.get('/:id', authenticateToken, (req, res, next) => rentalController.getRentalById(req, res, next));

module.exports = router;
