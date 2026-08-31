/**
 * Standard API Response Utilities
 * Fulfills Requirement 51: Consistent JSON Structure
 */

const successResponse = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errorCode = 'SERVER_ERROR', errors = null) => {
  const payload = {
    success: false,
    message,
    errorCode
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
