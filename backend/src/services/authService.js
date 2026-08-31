const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/token');
const logger = require('../utils/logger');

class AuthService {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.errorCode = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await userRepository.createUser(
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role || 'TENANT'
      },
      {
        city: data.city,
        area: data.area,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        preferredBhk: data.preferredBhk,
        tenantType: data.tenantType,
        occupation: data.occupation,
        companyOrCollege: data.companyOrCollege
      }
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    logger.info(`User registered successfully: ${user.email} [Role: ${user.role}]`);

    // Remove passwordHash from return object
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      token
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email address or password');
      error.statusCode = 401;
      error.errorCode = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (user.status === 'SUSPENDED') {
      const error = new Error('Your account has been suspended by administration. Please contact support.');
      error.statusCode = 403;
      error.errorCode = 'ACCOUNT_SUSPENDED';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email address or password');
      error.statusCode = 401;
      error.errorCode = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Update last login
    await userRepository.updateUser(user.id, { lastLoginAt: new Date() });

    const token = generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    logger.info(`User logged in successfully: ${user.email} [Role: ${user.role}]`);

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      token
    };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success message to avoid email enumeration
      return { message: 'If the email exists, a password reset link has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.updateUser(user.id, {
      resetToken,
      resetExpiresAt
    });

    logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);
    return {
      message: 'Password reset link sent successfully.',
      demoResetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  }

  async resetPassword(token, newPassword) {
    const allUsers = await userRepository.getAllUsers();
    const user = allUsers.find(u => u.resetToken === token && new Date(u.resetExpiresAt) > new Date());

    if (!user) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      error.errorCode = 'INVALID_RESET_TOKEN';
      throw error;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await userRepository.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetExpiresAt: null
    });

    logger.info(`Password reset completed for ${user.email}`);
    return { message: 'Password has been reset successfully. You can now login.' };
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }

    const userFields = {};
    if (updateData.fullName) userFields.fullName = updateData.fullName;
    if (updateData.phone !== undefined) userFields.phone = updateData.phone;
    if (updateData.profileImage !== undefined) userFields.profileImage = updateData.profileImage;

    if (Object.keys(userFields).length > 0) {
      await userRepository.updateUser(userId, userFields);
    }

    if (user.role === 'TENANT') {
      const tenantFields = {};
      if (updateData.occupation !== undefined) tenantFields.occupation = updateData.occupation;
      if (updateData.companyOrCollege !== undefined) tenantFields.companyOrCollege = updateData.companyOrCollege;
      if (updateData.preferredCity !== undefined) tenantFields.preferredCity = updateData.preferredCity;
      if (updateData.preferredArea !== undefined) tenantFields.preferredArea = updateData.preferredArea;
      if (updateData.budgetMin !== undefined) tenantFields.budgetMin = updateData.budgetMin;
      if (updateData.budgetMax !== undefined) tenantFields.budgetMax = updateData.budgetMax;
      if (updateData.preferredBhk !== undefined) tenantFields.preferredBhk = updateData.preferredBhk;
      if (updateData.tenantType !== undefined) tenantFields.tenantType = updateData.tenantType;
      if (updateData.numberOfOccupants !== undefined) tenantFields.numberOfOccupants = updateData.numberOfOccupants;

      if (Object.keys(tenantFields).length > 0) {
        await userRepository.updateTenantProfile(userId, tenantFields);
      }
    }

    const updatedUser = await userRepository.findById(userId);
    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }
}

module.exports = new AuthService();
