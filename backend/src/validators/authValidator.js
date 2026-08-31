const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long').max(100),
  email: z.string().email('Invalid email address format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15).optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['TENANT', 'OWNER', 'ADMIN']).default('TENANT'),
  city: z.string().optional(),
  area: z.string().optional(),
  occupation: z.string().optional(),
  companyOrCollege: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().positive().optional(),
  preferredBhk: z.number().int().min(1).max(10).optional(),
  tenantType: z.enum(['BACHELOR', 'FAMILY', 'STUDENT', 'WORKING_PROFESSIONAL', 'OTHER']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address format')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long')
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional().or(z.literal('')),
  profileImage: z.string().url().optional().or(z.literal('')),
  // Tenant specific fields
  occupation: z.string().optional(),
  companyOrCollege: z.string().optional(),
  preferredCity: z.string().optional(),
  preferredArea: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().positive().optional(),
  preferredBhk: z.number().int().min(1).max(10).optional(),
  tenantType: z.enum(['BACHELOR', 'FAMILY', 'STUDENT', 'WORKING_PROFESSIONAL', 'OTHER']).optional(),
  numberOfOccupants: z.number().int().min(1).max(20).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
};
