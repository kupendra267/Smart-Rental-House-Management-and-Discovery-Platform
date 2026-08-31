const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', authenticateToken, (req, res, next) => paymentController.createOrder(req, res, next));
router.post('/verify', authenticateToken, (req, res, next) => paymentController.verify(req, res, next));
router.get('/receipt/:paymentId', authenticateToken, (req, res, next) => paymentController.getReceipt(req, res, next));

module.exports = router;
