const authService = require('../services/authService');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidator');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          validation.error.flatten().fieldErrors
        );
      }

      const result = await authService.register(validation.data);
      return successResponse(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          validation.error.flatten().fieldErrors
        );
      }

      const result = await authService.login(validation.data.email, validation.data.password);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return successResponse(res, { user }, 'Current user profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Invalid email address', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.forgotPassword(validation.data.email);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.flatten().fieldErrors);
      }

      const result = await authService.resetPassword(validation.data.token, validation.data.newPassword);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    // Stateless JWT logout confirmation
    return successResponse(res, { message: 'Logged out successfully' }, 'Logged out');
  }
}

module.exports = new AuthController();
