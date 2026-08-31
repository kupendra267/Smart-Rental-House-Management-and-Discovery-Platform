const paymentService = require('../services/paymentService');
const { successResponse, errorResponse } = require('../utils/response');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const { invoiceId } = req.body;
      if (!invoiceId) {
        return errorResponse(res, 'Invoice ID is required', 400, 'INVOICE_ID_REQUIRED');
      }

      const orderData = await paymentService.createPaymentOrder(req.user, invoiceId);
      return successResponse(res, orderData, 'Payment order created successfully');
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const { invoiceId, orderId, paymentId, signature } = req.body;
      if (!invoiceId) {
        return errorResponse(res, 'Invoice ID is required', 400, 'INVOICE_ID_REQUIRED');
      }

      const result = await paymentService.verifyPayment(req.user, {
        invoiceId,
        orderId,
        paymentId,
        signature
      });

      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getReceipt(req, res, next) {
    try {
      const { paymentId } = req.params;
      const receipt = await paymentService.getReceipt(paymentId);
      return successResponse(res, { receipt }, 'Receipt retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
