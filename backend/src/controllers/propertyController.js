const propertyService = require('../services/propertyService');
const propertyRepository = require('../repositories/propertyRepository');
const { createPropertySchema, updatePropertySchema, searchPropertySchema, comparePropertiesSchema } = require('../validators/propertyValidator');
const { successResponse, errorResponse } = require('../utils/response');

class PropertyController {
  async getAllProperties(req, res, next) {
    try {
      const validation = searchPropertySchema.safeParse(req.query);
      if (!validation.success) {
        return errorResponse(res, 'Invalid search query parameters', 400, 'VALIDATION_ERROR', validation.error.flatten().fieldErrors);
      }

      const result = await propertyService.searchProperties(validation.data);
      return successResponse(res, result, 'Properties retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPropertyById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const property = await propertyService.getPropertyDetails(id, userId, ipAddress);
      return successResponse(res, { property }, 'Property details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOwnerProperties(req, res, next) {
    try {
      const result = await propertyService.getOwnerProperties(req.user);
      return successResponse(res, result, 'Owner properties retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createProperty(req, res, next) {
    try {
      const validation = createPropertySchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.flatten().fieldErrors);
      }

      const created = await propertyService.createProperty(req.user, validation.data);
      return successResponse(res, { property: created }, 'Property created successfully. Awaiting admin approval.', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req, res, next) {
    try {
      const { id } = req.params;
      const validation = updatePropertySchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.flatten().fieldErrors);
      }

      const updated = await propertyService.updateProperty(req.user, id, validation.data);
      return successResponse(res, { property: updated }, 'Property updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await propertyService.deleteProperty(req.user, id);
      return successResponse(res, { property: deleted }, 'Property removed/archived successfully');
    } catch (error) {
      next(error);
    }
  }

  async compareProperties(req, res, next) {
    try {
      const validation = comparePropertiesSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.flatten().fieldErrors);
      }

      const result = await propertyService.compareProperties(validation.data.propertyIds);
      return successResponse(res, result, 'Properties comparison generated');
    } catch (error) {
      next(error);
    }
  }

  async getAmenities(req, res, next) {
    try {
      const amenities = await propertyRepository.getAllAmenities();
      return successResponse(res, { amenities }, 'Amenities retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
