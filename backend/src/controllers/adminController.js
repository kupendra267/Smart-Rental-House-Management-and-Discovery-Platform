const rentalRepository = require('../repositories/rentalRepository');
const propertyRepository = require('../repositories/propertyRepository');
const userRepository = require('../repositories/userRepository');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  async getAnalytics(req, res, next) {
    try {
      const stats = await rentalRepository.getAdminAnalytics();
      return successResponse(res, { stats }, 'Platform analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPendingProperties(req, res, next) {
    try {
      const result = await propertyRepository.findProperties({ status: 'PENDING_APPROVAL' }, { page: 1, limit: 100 });
      return successResponse(res, { properties: result.properties, total: result.total }, 'Pending properties retrieved');
    } catch (error) {
      next(error);
    }
  }

  async verifyProperty(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, reason } = req.body; // decision: 'APPROVED' or 'REJECTED'

      if (!['APPROVED', 'REJECTED'].includes(decision)) {
        return errorResponse(res, 'Decision must be APPROVED or REJECTED', 400, 'INVALID_DECISION');
      }

      const updated = await propertyRepository.updateProperty(id, {
        verificationStatus: decision,
        status: decision === 'APPROVED' ? 'AVAILABLE' : 'REJECTED'
      });

      if (!updated) {
        return errorResponse(res, 'Property not found', 404, 'PROPERTY_NOT_FOUND');
      }

      // Record Audit Log
      await rentalRepository.createAuditLog({
        userId: req.user.id,
        action: `PROPERTY_VERIFICATION_${decision}`,
        entityType: 'Property',
        entityId: id,
        metadata: { decision, reason }
      });

      // Notify Owner
      if (updated.owner && updated.owner.userId) {
        await rentalRepository.createNotification({
          userId: updated.owner.userId,
          type: 'PROPERTY_VERIFICATION',
          title: `Property Verification: ${decision}`,
          message: `Your property "${updated.title}" has been ${decision}. ${reason ? `Admin note: ${reason}` : ''}`,
          link: '/owner/my-properties'
        });
      }

      return successResponse(res, { property: updated }, `Property listing ${decision}`);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await rentalRepository.getAuditLogs();
      return successResponse(res, { auditLogs: logs, total: logs.length }, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
