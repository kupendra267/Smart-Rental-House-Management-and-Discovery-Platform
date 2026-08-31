const propertyRepository = require('../repositories/propertyRepository');
const userRepository = require('../repositories/userRepository');
const { successResponse, errorResponse } = require('../utils/response');

class FavoriteController {
  async getFavorites(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user || !user.tenantProfile) {
        return errorResponse(res, 'Tenant profile not found', 404, 'TENANT_NOT_FOUND');
      }

      const favorites = await propertyRepository.getFavorites(user.tenantProfile.id);
      return successResponse(res, { favorites, total: favorites.length }, 'Favorites retrieved');
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req, res, next) {
    try {
      const { propertyId } = req.params;
      const user = await userRepository.findById(req.user.id);
      if (!user || !user.tenantProfile) {
        return errorResponse(res, 'Only tenants can bookmark favorite properties', 403, 'FORBIDDEN');
      }

      const fav = await propertyRepository.addFavorite(user.tenantProfile.id, propertyId);
      return successResponse(res, { favorite: fav }, 'Property added to favorites');
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const { propertyId } = req.params;
      const user = await userRepository.findById(req.user.id);
      if (!user || !user.tenantProfile) {
        return errorResponse(res, 'Only tenants can manage favorites', 403, 'FORBIDDEN');
      }

      await propertyRepository.removeFavorite(user.tenantProfile.id, propertyId);
      return successResponse(res, { message: 'Property removed from favorites' }, 'Removed from favorites');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
