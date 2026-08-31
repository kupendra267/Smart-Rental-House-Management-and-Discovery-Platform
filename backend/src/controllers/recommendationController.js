const recommendationService = require('../services/recommendationService');
const { successResponse, errorResponse } = require('../utils/response');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;
      const result = await recommendationService.getRecommendationsForTenant(req.user, limit);
      return successResponse(res, result, 'Personalized AI recommendations generated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
