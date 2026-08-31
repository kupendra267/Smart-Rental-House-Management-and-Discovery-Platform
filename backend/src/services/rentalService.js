const rentalRepository = require('../repositories/rentalRepository');
const propertyRepository = require('../repositories/propertyRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

class RentalService {
  // -------------------------------------------------------------
  // APPLICATIONS & RENTAL CREATION
  // -------------------------------------------------------------
  async applyForProperty(tenantUser, data) {
    const user = await userRepository.findById(tenantUser.id);
    if (!user || !user.tenantProfile) {
      const error = new Error('Only tenants can apply for rental houses');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN_ROLE';
      throw error;
    }

    const property = await propertyRepository.findById(data.propertyId);
    if (!property) {
      const error = new Error('Property not found');
      error.statusCode = 404;
      error.errorCode = 'PROPERTY_NOT_FOUND';
      throw error;
    }

    if (property.status === 'RENTED' || property.status === 'INACTIVE') {
      const error = new Error('This property is not currently available for rental application');
      error.statusCode = 400;
      error.errorCode = 'PROPERTY_NOT_AVAILABLE';
      throw error;
    }

    // Check for existing pending application
    const existingApps = await rentalRepository.findApplicationsByTenant(user.tenantProfile.id);
    const hasActiveApp = existingApps.some(a => a.propertyId === data.propertyId && ['PENDING', 'UNDER_REVIEW'].includes(a.status));
    if (hasActiveApp) {
      const error = new Error('You already have an active application submitted for this property');
      error.statusCode = 409;
      error.errorCode = 'DUPLICATE_APPLICATION';
      throw error;
    }

    const application = await rentalRepository.createApplication({
      tenantId: user.tenantProfile.id,
      propertyId: data.propertyId,
      moveInDate: data.moveInDate || new Date(),
      occupants: data.occupants || 1,
      message: data.message || ''
    });

    // Notify Owner
    if (property.owner && property.owner.user) {
      await rentalRepository.createNotification({
        userId: property.owner.userId || property.owner.user.id,
        type: 'APPLICATION_UPDATE',
        title: 'New Rental Application Received',
        message: `Tenant ${user.fullName} has applied for your property: "${property.title}"`,
        link: '/owner/applications'
      });
    }

    logger.info(`Tenant ${user.email} applied for property ${property.id}`);
    return application;
  }

  async getTenantApplications(tenantUser) {
    const user = await userRepository.findById(tenantUser.id);
    if (!user || !user.tenantProfile) {
      const error = new Error('Tenant profile not found');
      error.statusCode = 404;
      error.errorCode = 'TENANT_NOT_FOUND';
      throw error;
    }

    return rentalRepository.findApplicationsByTenant(user.tenantProfile.id);
  }

  async getOwnerApplications(ownerUser) {
    const user = await userRepository.findById(ownerUser.id);
    if (!user || !user.ownerProfile) {
      const error = new Error('Owner profile not found');
      error.statusCode = 404;
      error.errorCode = 'OWNER_NOT_FOUND';
      throw error;
    }

    return rentalRepository.findApplicationsByOwner(user.ownerProfile.id);
  }

  async updateApplicationStatus(ownerUser, applicationId, status, message = '') {
    const app = await rentalRepository.findApplicationById(applicationId);
    if (!app) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      error.errorCode = 'APPLICATION_NOT_FOUND';
      throw error;
    }

    const property = await propertyRepository.findById(app.propertyId);
    const currentUser = await userRepository.findById(ownerUser.id);

    const isOwner = currentUser.ownerProfile && currentUser.ownerProfile.id === property.ownerId;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized. You can only manage applications for your own properties.');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN_OWNERSHIP';
      throw error;
    }

    await rentalRepository.updateApplicationStatus(applicationId, status);

    // If APPROVED: Trigger Automatic Lease & Rental Creation
    let rental = null;
    if (status === 'APPROVED') {
      rental = await rentalRepository.createRental({
        propertyId: property.id,
        tenantId: app.tenantId,
        ownerId: property.ownerId,
        startDate: app.moveInDate || new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year standard lease
        monthlyRent: property.monthlyRent,
        securityDeposit: property.securityDeposit,
        maintenanceCharge: property.maintenanceCharge,
        rentDueDay: 5
      });

      logger.info(`Rental Lease automatically created (ID: ${rental.id}) for Property ${property.id}`);
    }

    // Notify Tenant of Decision
    if (app.tenant && app.tenant.user) {
      await rentalRepository.createNotification({
        userId: app.tenant.user.id || app.tenant.userId,
        type: 'APPLICATION_UPDATE',
        title: `Rental Application ${status}`,
        message: status === 'APPROVED'
          ? `Congratulations! Your rental application for "${property.title}" was APPROVED. Your active rental lease and first invoice have been created.`
          : `Your rental application for "${property.title}" has been updated to ${status}. ${message ? `Note: ${message}` : ''}`,
        link: status === 'APPROVED' ? '/tenant/rental' : '/tenant/applications'
      });
    }

    return { application: { ...app, status }, rental };
  }

  // -------------------------------------------------------------
  // RENTALS & INVOICES
  // -------------------------------------------------------------
  async getRentals(user) {
    return rentalRepository.findRentalsByUser(user.id, user.role);
  }

  async getRentalById(user, rentalId) {
    const rental = await rentalRepository.findRentalById(rentalId);
    if (!rental) {
      const error = new Error('Rental lease not found');
      error.statusCode = 404;
      error.errorCode = 'RENTAL_NOT_FOUND';
      throw error;
    }

    return rental;
  }

  async getInvoices(user, filters = {}) {
    const currentUser = await userRepository.findById(user.id);
    const queryFilters = { ...filters };

    if (user.role === 'TENANT' && currentUser.tenantProfile) {
      queryFilters.tenantId = currentUser.tenantProfile.id;
    } else if (user.role === 'OWNER' && currentUser.ownerProfile) {
      queryFilters.ownerId = currentUser.ownerProfile.id;
    }

    return rentalRepository.findInvoices(queryFilters);
  }

  // -------------------------------------------------------------
  // MAINTENANCE REQUESTS
  // -------------------------------------------------------------
  async createMaintenanceRequest(tenantUser, data) {
    const user = await userRepository.findById(tenantUser.id);
    if (!user || !user.tenantProfile) {
      const error = new Error('Tenant profile not found');
      error.statusCode = 404;
      error.errorCode = 'TENANT_NOT_FOUND';
      throw error;
    }

    const maint = await rentalRepository.createMaintenanceRequest({
      rentalId: data.rentalId,
      tenantId: user.tenantProfile.id,
      propertyId: data.propertyId,
      category: data.category || 'OTHER',
      description: data.description,
      priority: data.priority || 'MEDIUM',
      imageUrl: data.imageUrl || null
    });

    const property = await propertyRepository.findById(data.propertyId);
    if (property && property.owner && property.owner.user) {
      await rentalRepository.createNotification({
        userId: property.owner.userId || property.owner.user.id,
        type: 'MAINTENANCE_UPDATE',
        title: `New Maintenance Ticket: ${data.category}`,
        message: `Tenant ${user.fullName} reported: "${data.description}"`,
        link: '/owner/maintenance'
      });
    }

    logger.info(`Maintenance request created for property ${data.propertyId} by ${user.email}`);
    return maint;
  }

  async getMaintenanceRequests(user, filters = {}) {
    const currentUser = await userRepository.findById(user.id);
    const queryFilters = { ...filters };

    if (user.role === 'TENANT' && currentUser.tenantProfile) {
      queryFilters.tenantId = currentUser.tenantProfile.id;
    } else if (user.role === 'OWNER' && currentUser.ownerProfile) {
      queryFilters.ownerId = currentUser.ownerProfile.id;
    }

    return rentalRepository.findMaintenanceRequests(queryFilters);
  }

  async updateMaintenanceStatus(user, id, status) {
    const updated = await rentalRepository.updateMaintenanceStatus(id, status);
    if (!updated) {
      const error = new Error('Maintenance request not found');
      error.statusCode = 404;
      error.errorCode = 'MAINTENANCE_NOT_FOUND';
      throw error;
    }

    // Notify Tenant of resolution/progress
    if (updated.tenant && updated.tenant.userId) {
      await rentalRepository.createNotification({
        userId: updated.tenant.userId,
        type: 'MAINTENANCE_UPDATE',
        title: `Maintenance Request Status Updated to ${status}`,
        message: `Your ticket regarding "${updated.description}" is now ${status}.`,
        link: '/tenant/maintenance'
      });
    }

    return updated;
  }

  // -------------------------------------------------------------
  // REVIEWS & COMPLAINTS
  // -------------------------------------------------------------
  async createReview(tenantUser, data) {
    const user = await userRepository.findById(tenantUser.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }

    const review = await rentalRepository.createReview({
      reviewerId: user.id,
      propertyId: data.propertyId,
      rentalId: data.rentalId,
      rating: data.rating || 5,
      cleanlinessRating: data.cleanlinessRating || 5,
      locationRating: data.locationRating || 5,
      ownerRating: data.ownerRating || 5,
      comment: data.comment
    });

    logger.info(`Review created for property ${data.propertyId} by ${user.email}`);
    return review;
  }

  async createComplaint(user, data) {
    const complaint = await rentalRepository.createComplaint({
      userId: user.id,
      propertyId: data.propertyId || null,
      category: data.category,
      description: data.description,
      priority: data.priority || 'MEDIUM'
    });

    logger.info(`Complaint submitted by ${user.email}: ${data.category}`);
    return complaint;
  }

  async getComplaints(user, filters = {}) {
    const queryFilters = { ...filters };
    if (user.role !== 'ADMIN') {
      queryFilters.userId = user.id;
    }
    return rentalRepository.findComplaints(queryFilters);
  }

  async updateComplaint(adminUser, id, status, adminResponse) {
    const updated = await rentalRepository.updateComplaintStatus(id, status, adminResponse);
    if (!updated) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      error.errorCode = 'COMPLAINT_NOT_FOUND';
      throw error;
    }

    // Notify complainant
    if (updated.userId) {
      await rentalRepository.createNotification({
        userId: updated.userId,
        type: 'COMPLAINT_UPDATE',
        title: `Complaint Status Updated: ${status}`,
        message: `Admin Response: ${adminResponse || 'Your complaint has been reviewed.'}`,
        link: '/tenant/complaints'
      });
    }

    return updated;
  }
}

module.exports = new RentalService();
