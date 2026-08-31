const rentalService = require('../services/rentalService');
const { successResponse, errorResponse } = require('../utils/response');

class ApplicationController {
  async apply(req, res, next) {
    try {
      const { propertyId, moveInDate, occupants, message } = req.body;
      if (!propertyId) {
        return errorResponse(res, 'Property ID is required', 400, 'PROPERTY_ID_REQUIRED');
      }

      const application = await rentalService.applyForProperty(req.user, {
        propertyId,
        moveInDate,
        occupants: parseInt(occupants, 10) || 1,
        message
      });

      return successResponse(res, { application }, 'Rental application submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTenantApplications(req, res, next) {
    try {
      const applications = await rentalService.getTenantApplications(req.user);
      return successResponse(res, { applications, total: applications.length }, 'Tenant applications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOwnerApplications(req, res, next) {
    try {
      const applications = await rentalService.getOwnerApplications(req.user);
      return successResponse(res, { applications, total: applications.length }, 'Owner applications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      if (!['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
        return errorResponse(res, 'Invalid status value', 400, 'INVALID_STATUS');
      }

      const result = await rentalService.updateApplicationStatus(req.user, id, status, message);
      return successResponse(res, result, `Application updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
