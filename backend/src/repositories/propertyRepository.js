const { prisma, isPrismaConnected, memoryStore } = require('./dataStore');

// Calculate Haversine distance in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class PropertyRepository {
  async getAllAmenities() {
    if (isPrismaConnected()) {
      return prisma.amenity.findMany();
    }
    return memoryStore.amenities;
  }

  async findProperties(filters = {}, pagination = { page: 1, limit: 12 }, sortBy = 'newest') {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    if (isPrismaConnected()) {
      const where = {
        status: filters.status || 'AVAILABLE',
        verificationStatus: 'APPROVED'
      };

      if (filters.city) {
        where.location = { city: { contains: filters.city, mode: 'insensitive' } };
      }
      if (filters.area) {
        where.location = { ...where.location, area: { contains: filters.area, mode: 'insensitive' } };
      }
      if (filters.propertyType) where.propertyType = filters.propertyType;
      if (filters.bhk) where.bhk = filters.bhk;
      if (filters.minRent || filters.maxRent) {
        where.monthlyRent = {};
        if (filters.minRent) where.monthlyRent.gte = filters.minRent;
        if (filters.maxRent) where.monthlyRent.lte = filters.maxRent;
      }
      if (filters.furnishingStatus) where.furnishingStatus = filters.furnishingStatus;
      if (filters.tenantPreference && filters.tenantPreference !== 'ANY') {
        where.tenantPreference = { in: [filters.tenantPreference, 'ANY'] };
      }

      let orderBy = { createdAt: 'desc' };
      if (sortBy === 'price_low_to_high') orderBy = { monthlyRent: 'asc' };
      if (sortBy === 'price_high_to_low') orderBy = { monthlyRent: 'desc' };
      if (sortBy === 'views') orderBy = { viewsCount: 'desc' };

      const [total, properties] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.findMany({
          where,
          include: {
            location: true,
            images: { orderBy: { displayOrder: 'asc' } },
            amenities: { include: { amenity: true } },
            owner: { include: { user: { select: { fullName: true, email: true, phone: true, profileImage: true } } } },
            reviews: { select: { rating: true } }
          },
          skip,
          take: limit,
          orderBy
        })
      ]);

      return {
        properties,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    // In-memory search & filter
    let items = memoryStore.properties.filter(p => {
      // By default public search only shows AVAILABLE and APPROVED
      if (filters.status && p.status !== filters.status) return false;
      if (!filters.status && p.status !== 'AVAILABLE') return false;
      if (p.verificationStatus !== 'APPROVED') return false;

      const loc = memoryStore.propertyLocations.find(l => l.propertyId === p.id);
      if (!loc) return false;

      if (filters.city && !loc.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.area && !loc.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (filters.bhk && p.bhk !== filters.bhk) return false;
      if (filters.minRent && p.monthlyRent < filters.minRent) return false;
      if (filters.maxRent && p.monthlyRent > filters.maxRent) return false;
      if (filters.minDeposit && p.securityDeposit < filters.minDeposit) return false;
      if (filters.maxDeposit && p.securityDeposit > filters.maxDeposit) return false;
      if (filters.furnishingStatus && p.furnishingStatus !== filters.furnishingStatus) return false;
      if (filters.tenantPreference && filters.tenantPreference !== 'ANY') {
        if (p.tenantPreference !== 'ANY' && p.tenantPreference !== filters.tenantPreference) return false;
      }

      // Radius filter if lat & lng provided
      if (filters.lat && filters.lng && filters.radiusKm) {
        const dist = calculateHaversineDistance(filters.lat, filters.lng, loc.latitude, loc.longitude);
        if (dist > filters.radiusKm) return false;
      }

      return true;
    });

    // Populate relations
    let enriched = items.map(p => {
      const location = memoryStore.propertyLocations.find(l => l.propertyId === p.id) || null;
      const images = memoryStore.propertyImages.filter(img => img.propertyId === p.id);
      const propAmens = memoryStore.propertyAmenities.filter(pa => pa.propertyId === p.id);
      const amenities = propAmens.map(pa => {
        const a = memoryStore.amenities.find(am => am.id === pa.amenityId);
        return { amenity: a };
      });
      const owner = memoryStore.ownerProfiles.find(o => o.id === p.ownerId);
      const ownerUser = owner ? memoryStore.users.find(u => u.id === owner.userId) : null;
      const reviews = memoryStore.reviews.filter(r => r.propertyId === p.id);
      const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

      let distanceKm = null;
      if (filters.lat && filters.lng && location) {
        distanceKm = parseFloat(calculateHaversineDistance(filters.lat, filters.lng, location.latitude, location.longitude).toFixed(1));
      }

      return {
        ...p,
        location,
        images,
        amenities,
        owner: {
          ...owner,
          user: ownerUser ? {
            fullName: ownerUser.fullName,
            email: ownerUser.email,
            phone: ownerUser.phone,
            profileImage: ownerUser.profileImage
          } : null
        },
        reviewsCount: reviews.length,
        averageRating: parseFloat(avgRating),
        distanceKm
      };
    });

    // Sorting
    if (sortBy === 'price_low_to_high') enriched.sort((a, b) => a.monthlyRent - b.monthlyRent);
    else if (sortBy === 'price_high_to_low') enriched.sort((a, b) => b.monthlyRent - a.monthlyRent);
    else if (sortBy === 'views') enriched.sort((a, b) => b.viewsCount - a.viewsCount);
    else if (sortBy === 'distance' && filters.lat && filters.lng) enriched.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    else enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = enriched.length;
    const paginated = enriched.slice(skip, skip + limit);

    return {
      properties: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id) {
    if (isPrismaConnected()) {
      return prisma.property.findUnique({
        where: { id },
        include: {
          location: true,
          images: { orderBy: { displayOrder: 'asc' } },
          amenities: { include: { amenity: true } },
          owner: { include: { user: { select: { fullName: true, email: true, phone: true, profileImage: true } } } },
          reviews: {
            include: { reviewer: { select: { fullName: true, profileImage: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    const p = memoryStore.properties.find(prop => prop.id === id);
    if (!p) return null;

    const location = memoryStore.propertyLocations.find(l => l.propertyId === p.id) || null;
    const images = memoryStore.propertyImages.filter(img => img.propertyId === p.id);
    const propAmens = memoryStore.propertyAmenities.filter(pa => pa.propertyId === p.id);
    const amenities = propAmens.map(pa => {
      const a = memoryStore.amenities.find(am => am.id === pa.amenityId);
      return { amenity: a };
    });
    const owner = memoryStore.ownerProfiles.find(o => o.id === p.ownerId);
    const ownerUser = owner ? memoryStore.users.find(u => u.id === owner.userId) : null;
    const reviews = memoryStore.reviews.filter(r => r.propertyId === p.id).map(r => {
      const revUser = memoryStore.users.find(u => u.id === r.reviewerId);
      return {
        ...r,
        reviewer: revUser ? { fullName: revUser.fullName, profileImage: revUser.profileImage } : null
      };
    });

    return {
      ...p,
      location,
      images,
      amenities,
      owner: {
        ...owner,
        user: ownerUser ? {
          fullName: ownerUser.fullName,
          email: ownerUser.email,
          phone: ownerUser.phone,
          profileImage: ownerUser.profileImage
        } : null
      },
      reviews,
      reviewsCount: reviews.length,
      averageRating: reviews.length ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)) : 5.0
    };
  }

  async findByOwnerId(ownerProfileId) {
    if (isPrismaConnected()) {
      return prisma.property.findMany({
        where: { ownerId: ownerProfileId },
        include: {
          location: true,
          images: true,
          applications: true,
          rentals: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const props = memoryStore.properties.filter(p => p.ownerId === ownerProfileId);
    return props.map(p => {
      const location = memoryStore.propertyLocations.find(l => l.propertyId === p.id);
      const images = memoryStore.propertyImages.filter(img => img.propertyId === p.id);
      const applications = memoryStore.applications.filter(a => a.propertyId === p.id);
      const rentals = memoryStore.rentals.filter(r => r.propertyId === p.id);
      return {
        ...p,
        location,
        images,
        applications,
        rentals
      };
    });
  }

  async createProperty(ownerProfileId, data) {
    const propId = `prop-${Date.now()}`;

    if (isPrismaConnected()) {
      return prisma.property.create({
        data: {
          ownerId: ownerProfileId,
          title: data.title,
          description: data.description,
          propertyType: data.propertyType,
          bhk: data.bhk,
          bathrooms: data.bathrooms,
          floorNumber: data.floorNumber,
          totalFloors: data.totalFloors,
          areaSqft: data.areaSqft,
          furnishingStatus: data.furnishingStatus,
          monthlyRent: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          maintenanceCharge: data.maintenanceCharge || 0,
          tenantPreference: data.tenantPreference || 'ANY',
          status: 'PENDING_APPROVAL',
          verificationStatus: 'PENDING',
          location: {
            create: {
              address: data.address,
              area: data.area,
              city: data.city,
              state: data.state || 'Karnataka',
              pincode: data.pincode,
              latitude: data.latitude || 12.9716,
              longitude: data.longitude || 77.5946
            }
          },
          images: {
            create: (data.images || []).map((img, idx) => ({
              url: img.url,
              imageType: img.imageType || 'EXTERIOR',
              displayOrder: idx
            }))
          },
          verifications: {
            create: {
              decision: 'PENDING',
              reason: 'New property submitted by owner. Awaiting administrative inspection.'
            }
          }
        },
        include: { location: true, images: true }
      });
    }

    // In-memory property creation
    const newProp = {
      id: propId,
      ownerId: ownerProfileId,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType || 'APARTMENT',
      bhk: data.bhk || 1,
      bathrooms: data.bathrooms || 1,
      floorNumber: data.floorNumber || 1,
      totalFloors: data.totalFloors || 1,
      areaSqft: data.areaSqft,
      furnishingStatus: data.furnishingStatus || 'UNFURNISHED',
      monthlyRent: data.monthlyRent,
      securityDeposit: data.securityDeposit,
      maintenanceCharge: data.maintenanceCharge || 0,
      availableFrom: new Date(),
      tenantPreference: data.tenantPreference || 'ANY',
      status: 'PENDING_APPROVAL',
      verificationStatus: 'PENDING',
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.properties.push(newProp);

    const newLoc = {
      id: `loc-${propId}`,
      propertyId: propId,
      address: data.address,
      area: data.area,
      city: data.city,
      state: data.state || 'Karnataka',
      pincode: data.pincode,
      latitude: data.latitude || 12.9716,
      longitude: data.longitude || 77.5946,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.propertyLocations.push(newLoc);

    (data.images || []).forEach((img, idx) => {
      memoryStore.propertyImages.push({
        id: `img-${propId}-${idx}`,
        propertyId: propId,
        url: img.url,
        imageType: img.imageType || 'EXTERIOR',
        displayOrder: idx,
        createdAt: new Date()
      });
    });

    (data.amenities || []).forEach(amenId => {
      memoryStore.propertyAmenities.push({
        propertyId: propId,
        amenityId: amenId,
        createdAt: new Date()
      });
    });

    return this.findById(propId);
  }

  async updateProperty(id, updateData) {
    if (isPrismaConnected()) {
      return prisma.property.update({
        where: { id },
        data: updateData,
        include: { location: true, images: true }
      });
    }

    const idx = memoryStore.properties.findIndex(p => p.id === id);
    if (idx === -1) return null;

    memoryStore.properties[idx] = {
      ...memoryStore.properties[idx],
      ...updateData,
      updatedAt: new Date()
    };

    return this.findById(id);
  }

  async deleteProperty(id) {
    if (isPrismaConnected()) {
      return prisma.property.update({
        where: { id },
        data: { status: 'INACTIVE' }
      });
    }

    const p = memoryStore.properties.find(prop => prop.id === id);
    if (p) p.status = 'INACTIVE';
    return p;
  }

  async incrementViews(propertyId, userId = null, ipAddress = null) {
    if (isPrismaConnected()) {
      await Promise.all([
        prisma.property.update({
          where: { id: propertyId },
          data: { viewsCount: { increment: 1 } }
        }),
        prisma.propertyView.create({
          data: { propertyId, userId, ipAddress }
        })
      ]);
      return;
    }

    const p = memoryStore.properties.find(prop => prop.id === propertyId);
    if (p) p.viewsCount += 1;
    memoryStore.propertyViews.push({
      id: `view-${Date.now()}`,
      propertyId,
      userId,
      ipAddress,
      viewedAt: new Date()
    });
  }

  // Favorites
  async getFavorites(tenantProfileId) {
    if (isPrismaConnected()) {
      const favs = await prisma.favorite.findMany({
        where: { tenantId: tenantProfileId },
        include: {
          property: {
            include: { location: true, images: true, amenities: { include: { amenity: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return favs.map(f => f.property);
    }

    const favs = memoryStore.favorites.filter(f => f.tenantId === tenantProfileId);
    return favs.map(f => {
      const prop = memoryStore.properties.find(p => p.id === f.propertyId);
      if (!prop) return null;
      const location = memoryStore.propertyLocations.find(l => l.propertyId === prop.id);
      const images = memoryStore.propertyImages.filter(img => img.propertyId === prop.id);
      return {
        ...prop,
        location,
        images
      };
    }).filter(Boolean);
  }

  async addFavorite(tenantProfileId, propertyId) {
    if (isPrismaConnected()) {
      return prisma.favorite.upsert({
        where: { tenantId_propertyId: { tenantId: tenantProfileId, propertyId } },
        create: { tenantId: tenantProfileId, propertyId },
        update: {}
      });
    }

    const exists = memoryStore.favorites.find(f => f.tenantId === tenantProfileId && f.propertyId === propertyId);
    if (exists) return exists;

    const newFav = {
      id: `fav-${Date.now()}`,
      tenantId: tenantProfileId,
      propertyId,
      createdAt: new Date()
    };
    memoryStore.favorites.push(newFav);
    return newFav;
  }

  async removeFavorite(tenantProfileId, propertyId) {
    if (isPrismaConnected()) {
      return prisma.favorite.deleteMany({
        where: { tenantId: tenantProfileId, propertyId }
      });
    }

    const idx = memoryStore.favorites.findIndex(f => f.tenantId === tenantProfileId && f.propertyId === propertyId);
    if (idx !== -1) {
      memoryStore.favorites.splice(idx, 1);
      return true;
    }
    return false;
  }
}

module.exports = new PropertyRepository();
