const { prisma, isPrismaConnected, memoryStore } = require('./dataStore');

class UserRepository {
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (isPrismaConnected()) {
      return prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { tenantProfile: true, ownerProfile: true }
      });
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) return null;

    const tenantProfile = memoryStore.tenantProfiles.find(t => t.userId === user.id) || null;
    const ownerProfile = memoryStore.ownerProfiles.find(o => o.userId === user.id) || null;

    return {
      ...user,
      tenantProfile,
      ownerProfile
    };
  }

  async findById(id) {
    if (isPrismaConnected()) {
      return prisma.user.findUnique({
        where: { id },
        include: { tenantProfile: true, ownerProfile: true }
      });
    }

    const user = memoryStore.users.find(u => u.id === id);
    if (!user) return null;

    const tenantProfile = memoryStore.tenantProfiles.find(t => t.userId === user.id) || null;
    const ownerProfile = memoryStore.ownerProfiles.find(o => o.userId === user.id) || null;

    return {
      ...user,
      tenantProfile,
      ownerProfile
    };
  }

  async createUser(userData, profileData = {}) {
    const normalizedEmail = userData.email.toLowerCase().trim();

    if (isPrismaConnected()) {
      return prisma.user.create({
        data: {
          fullName: userData.fullName,
          email: normalizedEmail,
          phone: userData.phone || null,
          passwordHash: userData.passwordHash,
          role: userData.role || 'TENANT',
          status: 'ACTIVE',
          emailVerified: true,
          phoneVerified: true,
          ...(userData.role === 'TENANT' && {
            tenantProfile: {
              create: {
                preferredCity: profileData.preferredCity || profileData.city,
                preferredArea: profileData.preferredArea || profileData.area,
                budgetMin: profileData.budgetMin,
                budgetMax: profileData.budgetMax,
                preferredBhk: profileData.preferredBhk,
                tenantType: profileData.tenantType || 'BACHELOR',
                occupation: profileData.occupation,
                companyOrCollege: profileData.companyOrCollege
              }
            }
          }),
          ...(userData.role === 'OWNER' && {
            ownerProfile: {
              create: {
                ownerType: 'INDIVIDUAL',
                verificationStatus: 'PENDING'
              }
            }
          })
        },
        include: { tenantProfile: true, ownerProfile: true }
      });
    }

    // In-memory create
    const userId = `usr-gen-${Date.now()}`;
    const newUser = {
      id: userId,
      fullName: userData.fullName,
      email: normalizedEmail,
      phone: userData.phone || null,
      passwordHash: userData.passwordHash,
      role: userData.role || 'TENANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      profileImage: null,
      resetToken: null,
      resetExpiresAt: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.push(newUser);

    let tenantProfile = null;
    let ownerProfile = null;

    if (newUser.role === 'TENANT') {
      tenantProfile = {
        id: `ten-prof-${Date.now()}`,
        userId: userId,
        occupation: profileData.occupation || null,
        companyOrCollege: profileData.companyOrCollege || null,
        preferredCity: profileData.preferredCity || profileData.city || null,
        preferredArea: profileData.preferredArea || profileData.area || null,
        budgetMin: profileData.budgetMin || 10000,
        budgetMax: profileData.budgetMax || 30000,
        preferredPropertyType: 'APARTMENT',
        preferredBhk: profileData.preferredBhk || 2,
        tenantType: profileData.tenantType || 'BACHELOR',
        moveInDate: new Date(),
        numberOfOccupants: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.tenantProfiles.push(tenantProfile);
    } else if (newUser.role === 'OWNER') {
      ownerProfile = {
        id: `own-prof-${Date.now()}`,
        userId: userId,
        ownerType: 'INDIVIDUAL',
        verificationStatus: 'PENDING',
        identityDocument: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.ownerProfiles.push(ownerProfile);
    }

    return {
      ...newUser,
      tenantProfile,
      ownerProfile
    };
  }

  async updateUser(id, updateData) {
    if (isPrismaConnected()) {
      return prisma.user.update({
        where: { id },
        data: updateData,
        include: { tenantProfile: true, ownerProfile: true }
      });
    }

    const idx = memoryStore.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    memoryStore.users[idx] = {
      ...memoryStore.users[idx],
      ...updateData,
      updatedAt: new Date()
    };

    return this.findById(id);
  }

  async updateTenantProfile(userId, profileData) {
    if (isPrismaConnected()) {
      return prisma.tenantProfile.update({
        where: { userId },
        data: profileData
      });
    }

    const idx = memoryStore.tenantProfiles.findIndex(t => t.userId === userId);
    if (idx === -1) return null;

    memoryStore.tenantProfiles[idx] = {
      ...memoryStore.tenantProfiles[idx],
      ...profileData,
      updatedAt: new Date()
    };
    return memoryStore.tenantProfiles[idx];
  }

  async updateOwnerProfile(userId, profileData) {
    if (isPrismaConnected()) {
      return prisma.ownerProfile.update({
        where: { userId },
        data: profileData
      });
    }

    const idx = memoryStore.ownerProfiles.findIndex(o => o.userId === userId);
    if (idx === -1) return null;

    memoryStore.ownerProfiles[idx] = {
      ...memoryStore.ownerProfiles[idx],
      ...profileData,
      updatedAt: new Date()
    };
    return memoryStore.ownerProfiles[idx];
  }

  async getAllUsers(filters = {}) {
    if (isPrismaConnected()) {
      const where = {};
      if (filters.role) where.role = filters.role;
      if (filters.status) where.status = filters.status;
      return prisma.user.findMany({
        where,
        include: { tenantProfile: true, ownerProfile: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    let result = [...memoryStore.users];
    if (filters.role) result = result.filter(u => u.role === filters.role);
    if (filters.status) result = result.filter(u => u.status === filters.status);

    return result.map(u => ({
      ...u,
      tenantProfile: memoryStore.tenantProfiles.find(t => t.userId === u.id) || null,
      ownerProfile: memoryStore.ownerProfiles.find(o => o.userId === u.id) || null
    }));
  }

  async createVerificationDocument(ownerProfileId, docData) {
    if (isPrismaConnected()) {
      return prisma.verificationDocument.create({
        data: {
          ownerProfileId,
          documentType: docData.documentType || 'IDENTITY_PROOF',
          documentUrl: docData.documentUrl,
          verified: false
        }
      });
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      ownerProfileId,
      documentType: docData.documentType || 'IDENTITY_PROOF',
      documentUrl: docData.documentUrl,
      verified: false,
      verifiedAt: null,
      createdAt: new Date()
    };
    memoryStore.ownerProfiles.forEach(o => {
      if (o.id === ownerProfileId) {
        o.identityDocument = docData.documentUrl;
        o.verificationStatus = 'PENDING';
      }
    });
    return newDoc;
  }
}

module.exports = new UserRepository();
