const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const { updateProfileSchema } = require('../validators/authValidator');
const { successResponse, errorResponse } = require('../utils/response');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return successResponse(res, { user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          validation.error.flatten().fieldErrors
        );
      }

      const updatedUser = await authService.updateProfile(req.user.id, validation.data);
      return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadOwnerVerification(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user || user.role !== 'OWNER' || !user.ownerProfile) {
        return errorResponse(res, 'Only owners can submit verification documents', 403, 'FORBIDDEN');
      }

      const documentUrl = req.file ? `/uploads/documents/${req.file.filename}` : req.body.documentUrl;
      if (!documentUrl) {
        return errorResponse(res, 'Document file or URL is required', 400, 'DOCUMENT_REQUIRED');
      }

      const doc = await userRepository.createVerificationDocument(user.ownerProfile.id, {
        documentType: req.body.documentType || 'IDENTITY_PROOF',
        documentUrl
      });

      return successResponse(res, { document: doc }, 'Verification document submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { role, status } = req.query;
      const users = await userRepository.getAllUsers({ role, status });
      // Sanitize password hashes
      const safeUsers = users.map(u => {
        const { passwordHash: _, ...safe } = u;
        return safe;
      });
      return successResponse(res, { users: safeUsers, total: safeUsers.length }, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['ACTIVE', 'SUSPENDED', 'PENDING', 'DELETED'].includes(status)) {
        return errorResponse(res, 'Invalid user status', 400, 'INVALID_STATUS');
      }

      const updated = await userRepository.updateUser(id, { status });
      if (!updated) {
        return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
      }

      const { passwordHash: _, ...safeUser } = updated;
      return successResponse(res, { user: safeUser }, `User status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
