const { verifyToken } = require('../utils/token');
const { errorResponse } = require('../utils/response');

/**
 * Middleware: Verify Bearer JWT Token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No authentication token provided.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Contains id, email, role, fullName
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
};

/**
 * Middleware: Require Specific Role(s)
 * Example: requireRole(['ADMIN', 'OWNER']) or requireRole('ADMIN')
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden. This resource requires one of the following roles: [${roles.join(', ')}]. Your role is '${req.user.role}'.`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
};

/**
 * Optional Authentication (attach user if valid token present, otherwise proceed as guest)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
