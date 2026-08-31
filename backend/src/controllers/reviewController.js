const rentalService = require('../services/rentalService');
const { successResponse, errorResponse } = require('../utils/response');

class ReviewController {
  async create(req, res, next) {
    try {
      const { propertyId, rentalId, rating, cleanlinessRating, locationRating, ownerRating, comment } = req.body;
      if (!propertyId || !comment || !rating) {
        return errorResponse(res, 'Property ID, rating, and comment are required', 400, 'FIELDS_REQUIRED');
      }

      const review = await rentalService.createReview(req.user, {
        propertyId,
        rentalId,
        rating: parseInt(rating, 10),
        cleanlinessRating: parseInt(cleanlinessRating, 10) || 5,
        locationRating: parseInt(locationRating, 10) || 5,
        ownerRating: parseInt(ownerRating, 10) || 5,
        comment
      });

      return successResponse(res, { review }, 'Review submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
