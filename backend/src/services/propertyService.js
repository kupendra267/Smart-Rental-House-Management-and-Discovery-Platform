const propertyRepository = require('../repositories/propertyRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

class PropertyService {
  async searchProperties(query) {
    const filters = {
      city: query.city,
      area: query.area,
      propertyType: query.propertyType,
      bhk: query.bhk,
      minRent: query.minRent,
      maxRent: query.maxRent,
      minDeposit: query.minDeposit,
      maxDeposit: query.maxDeposit,
      furnishingStatus: query.furnishingStatus,
      tenantPreference: query.tenantPreference,
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm
    };

    const pagination = {
      page: query.page || 1,
      limit: query.limit || 12
    };

    const result = await propertyRepository.findProperties(filters, pagination, query.sortBy || 'newest');
    return result;
  }

  async getPropertyDetails(id, userId = null, ipAddress = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      const error = new Error('Property not found');
      error.statusCode = 404;
      error.errorCode = 'PROPERTY_NOT_FOUND';
      throw error;
    }

    // Increment views async
    propertyRepository.incrementViews(id, userId, ipAddress).catch(err => {
      logger.error('Failed to increment property view:', err);
    });

    return property;
  }

  async createProperty(user, data) {
    const owner = await userRepository.findById(user.id);
    if (!owner || owner.role !== 'OWNER' || !owner.ownerProfile) {
      const error = new Error('Only registered owners can create property listings');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN_ROLE';
      throw error;
    }

    const created = await propertyRepository.createProperty(owner.ownerProfile.id, data);
    logger.info(`Owner ${owner.email} created new property: ${created.title} (ID: ${created.id})`);
    return created;
  }

  async updateProperty(user, propertyId, data) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      const error = new Error('Property not found');
      error.statusCode = 404;
      error.errorCode = 'PROPERTY_NOT_FOUND';
      throw error;
    }

    const currentUser = await userRepository.findById(user.id);
    const isOwner = currentUser.ownerProfile && currentUser.ownerProfile.id === property.ownerId;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized. You can only edit your own properties.');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN_OWNERSHIP';
      throw error;
    }

    const updated = await propertyRepository.updateProperty(propertyId, data);
    logger.info(`Property ${propertyId} updated by ${user.email}`);
    return updated;
  }

  async deleteProperty(user, propertyId) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      const error = new Error('Property not found');
      error.statusCode = 404;
      error.errorCode = 'PROPERTY_NOT_FOUND';
      throw error;
    }

    const currentUser = await userRepository.findById(user.id);
    const isOwner = currentUser.ownerProfile && currentUser.ownerProfile.id === property.ownerId;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized. You can only delete your own properties.');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN_OWNERSHIP';
      throw error;
    }

    const deleted = await propertyRepository.deleteProperty(propertyId);
    logger.info(`Property ${propertyId} archived/deleted by ${user.email}`);
    return deleted;
  }

  async getOwnerProperties(user) {
    const owner = await userRepository.findById(user.id);
    if (!owner || !owner.ownerProfile) {
      const error = new Error('Owner profile not found');
      error.statusCode = 404;
      error.errorCode = 'OWNER_NOT_FOUND';
      throw error;
    }

    const properties = await propertyRepository.findByOwnerId(owner.ownerProfile.id);
    const stats = {
      total: properties.length,
      available: properties.filter(p => p.status === 'AVAILABLE').length,
      rented: properties.filter(p => p.status === 'RENTED').length,
      pendingApproval: properties.filter(p => p.verificationStatus === 'PENDING').length
    };

    return { properties, stats };
  }

  async compareProperties(propertyIds) {
    const properties = await Promise.all(
      propertyIds.map(id => propertyRepository.findById(id))
    );

    const validProps = properties.filter(Boolean);
    if (validProps.length < 2) {
      const error = new Error('At least 2 valid properties must be found to compare');
      error.statusCode = 400;
      error.errorCode = 'INSUFFICIENT_PROPERTIES';
      throw error;
    }

    // Return structured comparison matrix
    return {
      properties: validProps,
      comparisonFields: [
        'monthlyRent',
        'securityDeposit',
        'bhk',
        'bathrooms',
        'areaSqft',
        'furnishingStatus',
        'tenantPreference',
        'propertyType',
        'location.city',
        'location.area'
      ]
    };
  }
}

module.exports = new PropertyService();
