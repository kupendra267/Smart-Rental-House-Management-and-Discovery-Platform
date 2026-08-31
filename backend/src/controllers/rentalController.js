const rentalService = require('../services/rentalService');
const { successResponse, errorResponse } = require('../utils/response');

class RentalController {
  async getRentals(req, res, next) {
    try {
      const rentals = await rentalService.getRentals(req.user);
      return successResponse(res, { rentals, total: rentals.length }, 'Rentals retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getRentalById(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await rentalService.getRentalById(req.user, id);
      return successResponse(res, { rental }, 'Rental lease details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const { status, billingMonth, rentalId } = req.query;
      const invoices = await rentalService.getInvoices(req.user, { status, billingMonth, rentalId });
      return successResponse(res, { invoices, total: invoices.length }, 'Rent invoices retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RentalController();
