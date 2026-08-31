const rentalService = require('../services/rentalService');
const { successResponse, errorResponse } = require('../utils/response');

class ComplaintController {
  async create(req, res, next) {
    try {
      const { propertyId, category, description, priority } = req.body;
      if (!category || !description) {
        return errorResponse(res, 'Category and description are required', 400, 'FIELDS_REQUIRED');
      }

      const complaint = await rentalService.createComplaint(req.user, {
        propertyId,
        category,
        description,
        priority
      });

      return successResponse(res, { complaint }, 'Complaint submitted for admin investigation', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const complaints = await rentalService.getComplaints(req.user, { status });
      return successResponse(res, { complaints, total: complaints.length }, 'Complaints retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminResponse } = req.body;
      if (!['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) {
        return errorResponse(res, 'Invalid complaint status', 400, 'INVALID_STATUS');
      }

      const updated = await rentalService.updateComplaint(req.user, id, status, adminResponse);
      return successResponse(res, { complaint: updated }, `Complaint updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplaintController();
