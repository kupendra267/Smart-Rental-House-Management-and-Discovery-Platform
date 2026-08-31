const rentalService = require('../services/rentalService');
const { successResponse, errorResponse } = require('../utils/response');

class MaintenanceController {
  async create(req, res, next) {
    try {
      const { rentalId, propertyId, category, description, priority, imageUrl } = req.body;
      if (!rentalId || !propertyId || !description) {
        return errorResponse(res, 'Rental ID, Property ID, and description are required', 400, 'FIELDS_REQUIRED');
      }

      const request = await rentalService.createMaintenanceRequest(req.user, {
        rentalId,
        propertyId,
        category,
        description,
        priority,
        imageUrl
      });

      return successResponse(res, { maintenance: request }, 'Maintenance request submitted', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { status, category } = req.query;
      const requests = await rentalService.getMaintenanceRequests(req.user, { status, category });
      return successResponse(res, { maintenanceRequests: requests, total: requests.length }, 'Maintenance requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
        return errorResponse(res, 'Invalid maintenance status', 400, 'INVALID_STATUS');
      }

      const updated = await rentalService.updateMaintenanceStatus(req.user, id, status);
      return successResponse(res, { maintenance: updated }, `Status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
