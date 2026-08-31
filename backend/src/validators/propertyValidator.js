const { z } = require('zod');

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['APARTMENT', 'INDEPENDENT_HOUSE', 'VILLA', 'PG', 'ROOM', 'OTHER']).default('APARTMENT'),
  bhk: z.number().int().min(1).max(10).default(1),
  bathrooms: z.number().int().min(1).max(10).default(1),
  floorNumber: z.number().int().min(0).max(100).default(1),
  totalFloors: z.number().int().min(1).max(100).default(1),
  areaSqft: z.number().positive('Area in sqft must be positive'),
  furnishingStatus: z.enum(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).default('UNFURNISHED'),
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  securityDeposit: z.number().nonnegative('Security deposit must be positive or zero'),
  maintenanceCharge: z.number().nonnegative().default(0),
  tenantPreference: z.enum(['ANY', 'FAMILY_ONLY', 'BACHELOR_ONLY', 'FEMALE_ONLY', 'STUDENT_ONLY']).default('ANY'),
  // Location info
  address: z.string().min(5),
  area: z.string().min(2),
  city: z.string().min(2),
  state: z.string().default('Karnataka'),
  pincode: z.string().min(4).max(10),
  latitude: z.number().optional().default(12.9716),
  longitude: z.number().optional().default(77.5946),
  // Amenities list of amenity IDs or names
  amenities: z.array(z.string()).optional().default([]),
  // Images
  images: z.array(z.object({
    url: z.string().url(),
    imageType: z.enum(['EXTERIOR', 'LIVING_ROOM', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'PARKING', 'BALCONY', 'OTHER']).default('OTHER'),
    displayOrder: z.number().int().default(0)
  })).optional().default([])
});

const updatePropertySchema = createPropertySchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'AVAILABLE', 'RESERVED', 'RENTED', 'INACTIVE']).optional()
});

const searchPropertySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  city: z.string().optional(),
  area: z.string().optional(),
  propertyType: z.string().optional(),
  bhk: z.coerce.number().int().optional(),
  minRent: z.coerce.number().optional(),
  maxRent: z.coerce.number().optional(),
  minDeposit: z.coerce.number().optional(),
  maxDeposit: z.coerce.number().optional(),
  furnishingStatus: z.string().optional(),
  tenantPreference: z.string().optional(),
  amenities: z.string().optional(), // comma-separated
  sortBy: z.enum(['price_low_to_high', 'price_high_to_low', 'newest', 'views', 'distance', 'recommended']).default('newest'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional()
});

const comparePropertiesSchema = z.object({
  propertyIds: z.array(z.string()).min(2, 'Must provide at least 2 properties to compare').max(4, 'Maximum 4 properties can be compared')
});

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  searchPropertySchema,
  comparePropertiesSchema
};
