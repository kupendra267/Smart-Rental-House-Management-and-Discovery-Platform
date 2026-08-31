const { prisma, isPrismaConnected, memoryStore } = require('./dataStore');

class RentalRepository {
  // -------------------------------------------------------------
  // APPLICATIONS
  // -------------------------------------------------------------
  async createApplication(data) {
    if (isPrismaConnected()) {
      return prisma.application.create({
        data,
        include: { property: { include: { location: true } }, tenant: { include: { user: true } } }
      });
    }

    const newApp = {
      id: `app-${Date.now()}`,
      tenantId: data.tenantId,
      propertyId: data.propertyId,
      moveInDate: new Date(data.moveInDate || Date.now()),
      occupants: data.occupants || 1,
      message: data.message || '',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.applications.push(newApp);

    const prop = memoryStore.properties.find(p => p.id === data.propertyId);
    const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
    const tenant = memoryStore.tenantProfiles.find(t => t.id === data.tenantId);
    const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;

    return {
      ...newApp,
      property: prop ? { ...prop, location: loc } : null,
      tenant: tenant ? { ...tenant, user: tenantUser } : null
    };
  }

  async findApplicationsByTenant(tenantProfileId) {
    if (isPrismaConnected()) {
      return prisma.application.findMany({
        where: { tenantId: tenantProfileId },
        include: {
          property: {
            include: { location: true, images: true, owner: { include: { user: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const apps = memoryStore.applications.filter(a => a.tenantId === tenantProfileId);
    return apps.map(a => {
      const prop = memoryStore.properties.find(p => p.id === a.propertyId);
      const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
      const imgs = prop ? memoryStore.propertyImages.filter(i => i.propertyId === prop.id) : [];
      const owner = prop ? memoryStore.ownerProfiles.find(o => o.id === prop.ownerId) : null;
      const ownerUser = owner ? memoryStore.users.find(u => u.id === owner.userId) : null;
      return {
        ...a,
        property: prop ? { ...prop, location: loc, images: imgs, owner: { ...owner, user: ownerUser } } : null
      };
    });
  }

  async findApplicationsByOwner(ownerProfileId) {
    if (isPrismaConnected()) {
      return prisma.application.findMany({
        where: { property: { ownerId: ownerProfileId } },
        include: {
          property: { include: { location: true } },
          tenant: { include: { user: { select: { fullName: true, email: true, phone: true, profileImage: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const ownerProps = memoryStore.properties.filter(p => p.ownerId === ownerProfileId).map(p => p.id);
    const apps = memoryStore.applications.filter(a => ownerProps.includes(a.propertyId));

    return apps.map(a => {
      const prop = memoryStore.properties.find(p => p.id === a.propertyId);
      const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
      const tenant = memoryStore.tenantProfiles.find(t => t.id === a.tenantId);
      const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;

      return {
        ...a,
        property: prop ? { ...prop, location: loc } : null,
        tenant: tenant ? {
          ...tenant,
          user: tenantUser ? {
            fullName: tenantUser.fullName,
            email: tenantUser.email,
            phone: tenantUser.phone,
            profileImage: tenantUser.profileImage
          } : null
        } : null
      };
    });
  }

  async findApplicationById(id) {
    if (isPrismaConnected()) {
      return prisma.application.findUnique({
        where: { id },
        include: { property: true, tenant: { include: { user: true } } }
      });
    }

    const app = memoryStore.applications.find(a => a.id === id);
    if (!app) return null;

    const prop = memoryStore.properties.find(p => p.id === app.propertyId);
    const tenant = memoryStore.tenantProfiles.find(t => t.id === app.tenantId);
    const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;

    return {
      ...app,
      property: prop || null,
      tenant: tenant ? { ...tenant, user: tenantUser } : null
    };
  }

  async updateApplicationStatus(id, status) {
    if (isPrismaConnected()) {
      return prisma.application.update({
        where: { id },
        data: { status }
      });
    }

    const app = memoryStore.applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      app.updatedAt = new Date();
    }
    return app;
  }

  // -------------------------------------------------------------
  // RENTALS & LEASES
  // -------------------------------------------------------------
  async createRental(data) {
    if (isPrismaConnected()) {
      return prisma.$transaction(async (tx) => {
        // 1. Create rental record
        const rental = await tx.rental.create({
          data: {
            propertyId: data.propertyId,
            tenantId: data.tenantId,
            ownerId: data.ownerId,
            startDate: data.startDate,
            endDate: data.endDate,
            monthlyRent: data.monthlyRent,
            securityDeposit: data.securityDeposit,
            maintenanceCharge: data.maintenanceCharge,
            rentDueDay: data.rentDueDay || 5,
            status: 'ACTIVE',
            agreement: {
              create: {
                startDate: data.startDate,
                endDate: data.endDate,
                rent: data.monthlyRent,
                deposit: data.securityDeposit,
                noticePeriodMonths: 1,
                specialTerms: 'Standard rental terms. Notice period 1 month.',
                signedByTenant: true,
                signedByOwner: true,
                signedAt: new Date()
              }
            }
          },
          include: { agreement: true, property: true }
        });

        // 2. Mark property status as RENTED
        await tx.property.update({
          where: { id: data.propertyId },
          data: { status: 'RENTED' }
        });

        // 3. Create initial rent invoice
        const date = new Date();
        const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const dueDate = new Date(date.getFullYear(), date.getMonth(), data.rentDueDay || 5);

        await tx.rentInvoice.create({
          data: {
            rentalId: rental.id,
            billingMonth: currentMonth,
            dueDate,
            baseRent: data.monthlyRent,
            maintenance: data.maintenanceCharge,
            totalAmount: data.monthlyRent + data.maintenanceCharge,
            status: 'PENDING'
          }
        });

        return rental;
      });
    }

    // In-memory Transaction simulation
    const rentalId = `rent-${Date.now()}`;
    const newRental = {
      id: rentalId,
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      ownerId: data.ownerId,
      startDate: data.startDate,
      endDate: data.endDate,
      monthlyRent: data.monthlyRent,
      securityDeposit: data.securityDeposit,
      maintenanceCharge: data.maintenanceCharge,
      rentDueDay: data.rentDueDay || 5,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.rentals.push(newRental);

    // Agreement
    const newAgreement = {
      id: `agr-${Date.now()}`,
      rentalId: rentalId,
      startDate: data.startDate,
      endDate: data.endDate,
      rent: data.monthlyRent,
      deposit: data.securityDeposit,
      noticePeriodMonths: 1,
      specialTerms: 'Standard rental terms. Notice period 1 month.',
      documentUrl: '/uploads/receipts/agreement_demo.pdf',
      signedByTenant: true,
      signedByOwner: true,
      signedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.rentalAgreements.push(newAgreement);

    // Update Property to RENTED
    const prop = memoryStore.properties.find(p => p.id === data.propertyId);
    if (prop) prop.status = 'RENTED';

    // Generate First Month Invoice
    const date = new Date();
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(date.getFullYear(), date.getMonth(), data.rentDueDay || 5);

    const firstInvoice = {
      id: `inv-${rentalId}-${currentMonth}`,
      rentalId: rentalId,
      billingMonth: currentMonth,
      dueDate,
      baseRent: data.monthlyRent,
      maintenance: data.maintenanceCharge,
      lateFee: 0,
      discount: 0,
      totalAmount: data.monthlyRent + data.maintenanceCharge,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.rentInvoices.push(firstInvoice);

    return {
      ...newRental,
      agreement: newAgreement,
      property: prop || null
    };
  }

  async findRentalsByUser(userId, role) {
    if (isPrismaConnected()) {
      const where = {};
      if (role === 'TENANT') {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { tenantProfile: true } });
        if (!user || !user.tenantProfile) return [];
        where.tenantId = user.tenantProfile.id;
      } else if (role === 'OWNER') {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { ownerProfile: true } });
        if (!user || !user.ownerProfile) return [];
        where.ownerId = user.ownerProfile.id;
      }

      return prisma.rental.findMany({
        where,
        include: {
          property: { include: { location: true, images: true } },
          agreement: true,
          invoices: { orderBy: { billingMonth: 'desc' } },
          tenant: { include: { user: true } },
          maintenance: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    let results = [];
    if (role === 'TENANT') {
      const tenant = memoryStore.tenantProfiles.find(t => t.userId === userId);
      if (!tenant) return [];
      results = memoryStore.rentals.filter(r => r.tenantId === tenant.id);
    } else if (role === 'OWNER') {
      const owner = memoryStore.ownerProfiles.find(o => o.userId === userId);
      if (!owner) return [];
      results = memoryStore.rentals.filter(r => r.ownerId === owner.id);
    } else {
      results = [...memoryStore.rentals];
    }

    return results.map(r => {
      const prop = memoryStore.properties.find(p => p.id === r.propertyId);
      const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
      const imgs = prop ? memoryStore.propertyImages.filter(i => i.propertyId === prop.id) : [];
      const agr = memoryStore.rentalAgreements.find(a => a.rentalId === r.id);
      const invs = memoryStore.rentInvoices.filter(i => i.rentalId === r.id);
      const tenant = memoryStore.tenantProfiles.find(t => t.id === r.tenantId);
      const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;
      const maint = memoryStore.maintenanceRequests.filter(m => m.rentalId === r.id);

      return {
        ...r,
        property: prop ? { ...prop, location: loc, images: imgs } : null,
        agreement: agr || null,
        invoices: invs,
        tenant: tenant ? { ...tenant, user: tenantUser } : null,
        maintenance: maint
      };
    });
  }

  async findRentalById(id) {
    if (isPrismaConnected()) {
      return prisma.rental.findUnique({
        where: { id },
        include: {
          property: { include: { location: true, images: true } },
          agreement: true,
          invoices: { orderBy: { billingMonth: 'desc' }, include: { payments: { include: { receipt: true } } } },
          tenant: { include: { user: true } },
          maintenance: true
        }
      });
    }

    const r = memoryStore.rentals.find(rent => rent.id === id);
    if (!r) return null;

    const prop = memoryStore.properties.find(p => p.id === r.propertyId);
    const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
    const imgs = prop ? memoryStore.propertyImages.filter(i => i.propertyId === prop.id) : [];
    const agr = memoryStore.rentalAgreements.find(a => a.rentalId === r.id);
    const invs = memoryStore.rentInvoices.filter(i => i.rentalId === r.id).map(inv => {
      const pays = memoryStore.payments.filter(p => p.invoiceId === inv.id).map(p => {
        const rec = memoryStore.receipts.find(rc => rc.paymentId === p.id);
        return { ...p, receipt: rec || null };
      });
      return { ...inv, payments: pays };
    });
    const tenant = memoryStore.tenantProfiles.find(t => t.id === r.tenantId);
    const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;
    const maint = memoryStore.maintenanceRequests.filter(m => m.rentalId === r.id);

    return {
      ...r,
      property: prop ? { ...prop, location: loc, images: imgs } : null,
      agreement: agr || null,
      invoices: invs,
      tenant: tenant ? { ...tenant, user: tenantUser } : null,
      maintenance: maint
    };
  }

  // -------------------------------------------------------------
  // INVOICES & PAYMENTS & RECEIPTS
  // -------------------------------------------------------------
  async findInvoices(filters = {}) {
    if (isPrismaConnected()) {
      const where = {};
      if (filters.rentalId) where.rentalId = filters.rentalId;
      if (filters.status) where.status = filters.status;
      if (filters.tenantId) where.rental = { tenantId: filters.tenantId };
      if (filters.ownerId) where.rental = { ownerId: filters.ownerId };

      return prisma.rentInvoice.findMany({
        where,
        include: {
          rental: {
            include: { property: true, tenant: { include: { user: true } } }
          },
          payments: { include: { receipt: true } }
        },
        orderBy: { billingMonth: 'desc' }
      });
    }

    let invs = [...memoryStore.rentInvoices];
    if (filters.rentalId) invs = invs.filter(i => i.rentalId === filters.rentalId);
    if (filters.status) invs = invs.filter(i => i.status === filters.status);

    if (filters.tenantId || filters.ownerId) {
      invs = invs.filter(i => {
        const rental = memoryStore.rentals.find(r => r.id === i.rentalId);
        if (!rental) return false;
        if (filters.tenantId && rental.tenantId !== filters.tenantId) return false;
        if (filters.ownerId && rental.ownerId !== filters.ownerId) return false;
        return true;
      });
    }

    return invs.map(inv => {
      const rental = memoryStore.rentals.find(r => r.id === inv.rentalId);
      const prop = rental ? memoryStore.properties.find(p => p.id === rental.propertyId) : null;
      const tenant = rental ? memoryStore.tenantProfiles.find(t => t.id === rental.tenantId) : null;
      const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;
      const payments = memoryStore.payments.filter(p => p.invoiceId === inv.id).map(p => {
        const receipt = memoryStore.receipts.find(rc => rc.paymentId === p.id);
        return { ...p, receipt: receipt || null };
      });

      return {
        ...inv,
        rental: rental ? {
          ...rental,
          property: prop || null,
          tenant: tenant ? { ...tenant, user: tenantUser } : null
        } : null,
        payments
      };
    });
  }

  async findInvoiceById(id) {
    if (isPrismaConnected()) {
      return prisma.rentInvoice.findUnique({
        where: { id },
        include: {
          rental: {
            include: { property: { include: { location: true } }, tenant: { include: { user: true } }, owner: { include: { user: true } } }
          },
          payments: { include: { receipt: true } }
        }
      });
    }

    const inv = memoryStore.rentInvoices.find(i => i.id === id);
    if (!inv) return null;

    const rental = memoryStore.rentals.find(r => r.id === inv.rentalId);
    const prop = rental ? memoryStore.properties.find(p => p.id === rental.propertyId) : null;
    const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
    const tenant = rental ? memoryStore.tenantProfiles.find(t => t.id === rental.tenantId) : null;
    const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;
    const owner = rental ? memoryStore.ownerProfiles.find(o => o.id === rental.ownerId) : null;
    const ownerUser = owner ? memoryStore.users.find(u => u.id === owner.userId) : null;
    const payments = memoryStore.payments.filter(p => p.invoiceId === inv.id).map(p => {
      const receipt = memoryStore.receipts.find(rc => rc.paymentId === p.id);
      return { ...p, receipt: receipt || null };
    });

    return {
      ...inv,
      rental: rental ? {
        ...rental,
        property: prop ? { ...prop, location: loc } : null,
        tenant: tenant ? { ...tenant, user: tenantUser } : null,
        owner: owner ? { ...owner, user: ownerUser } : null
      } : null,
      payments
    };
  }

  async processSuccessfulPayment(paymentData) {
    const { invoiceId, tenantId, ownerId, amount, gatewayOrderId, gatewayPaymentId, gatewaySignature, tenantName, propertyName, billingPeriod } = paymentData;

    const receiptNum = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    if (isPrismaConnected()) {
      return prisma.$transaction(async (tx) => {
        // Update Invoice status to PAID
        await tx.rentInvoice.update({
          where: { id: invoiceId },
          data: { status: 'PAID' }
        });

        // Insert Payment record
        const payment = await tx.payment.create({
          data: {
            invoiceId,
            tenantId,
            ownerId,
            amount,
            currency: 'INR',
            gateway: 'RAZORPAY_SANDBOX',
            gatewayOrderId,
            gatewayPaymentId,
            gatewaySignature,
            status: 'SUCCESS',
            paidAt: new Date(),
            receipt: {
              create: {
                receiptNumber: receiptNum,
                tenantName,
                propertyName,
                billingPeriod,
                amountPaid: amount,
                paymentDate: new Date(),
                transactionReference: gatewayPaymentId,
                pdfUrl: `/uploads/receipts/${receiptNum}.pdf`
              }
            }
          },
          include: { receipt: true }
        });

        return payment;
      });
    }

    // In-memory payment transaction
    const inv = memoryStore.rentInvoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = 'PAID';
      inv.updatedAt = new Date();
    }

    const paymentId = `pay-${Date.now()}`;
    const payment = {
      id: paymentId,
      invoiceId,
      tenantId,
      ownerId,
      amount,
      currency: 'INR',
      gateway: 'RAZORPAY_SANDBOX',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      status: 'SUCCESS',
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.payments.push(payment);

    const receipt = {
      id: `rec-${Date.now()}`,
      paymentId,
      receiptNumber: receiptNum,
      tenantName,
      propertyName,
      billingPeriod,
      amountPaid: amount,
      paymentDate: new Date(),
      transactionReference: gatewayPaymentId,
      pdfUrl: `/uploads/receipts/${receiptNum}.pdf`,
      createdAt: new Date()
    };
    memoryStore.receipts.push(receipt);

    return {
      ...payment,
      receipt
    };
  }

  async findReceiptByPaymentId(paymentId) {
    if (isPrismaConnected()) {
      return prisma.receipt.findUnique({
        where: { paymentId },
        include: { payment: { include: { invoice: { include: { rental: { include: { property: true } } } } } } }
      });
    }

    const rec = memoryStore.receipts.find(r => r.paymentId === paymentId);
    if (!rec) return null;
    const pay = memoryStore.payments.find(p => p.id === paymentId);
    return {
      ...rec,
      payment: pay || null
    };
  }

  // -------------------------------------------------------------
  // MAINTENANCE REQUESTS
  // -------------------------------------------------------------
  async createMaintenanceRequest(data) {
    if (isPrismaConnected()) {
      return prisma.maintenanceRequest.create({
        data,
        include: { property: true, rental: true }
      });
    }

    const newMaint = {
      id: `maint-${Date.now()}`,
      rentalId: data.rentalId,
      tenantId: data.tenantId,
      propertyId: data.propertyId,
      category: data.category || 'OTHER',
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      imageUrl: data.imageUrl || null,
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.maintenanceRequests.push(newMaint);
    return newMaint;
  }

  async findMaintenanceRequests(filters = {}) {
    if (isPrismaConnected()) {
      const where = {};
      if (filters.tenantId) where.tenantId = filters.tenantId;
      if (filters.propertyId) where.propertyId = filters.propertyId;
      if (filters.status) where.status = filters.status;
      if (filters.ownerId) where.property = { ownerId: filters.ownerId };

      return prisma.maintenanceRequest.findMany({
        where,
        include: {
          property: { include: { location: true } },
          tenant: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    let items = [...memoryStore.maintenanceRequests];
    if (filters.tenantId) items = items.filter(m => m.tenantId === filters.tenantId);
    if (filters.propertyId) items = items.filter(m => m.propertyId === filters.propertyId);
    if (filters.status) items = items.filter(m => m.status === filters.status);
    if (filters.ownerId) {
      items = items.filter(m => {
        const prop = memoryStore.properties.find(p => p.id === m.propertyId);
        return prop && prop.ownerId === filters.ownerId;
      });
    }

    return items.map(m => {
      const prop = memoryStore.properties.find(p => p.id === m.propertyId);
      const loc = prop ? memoryStore.propertyLocations.find(l => l.propertyId === prop.id) : null;
      const tenant = memoryStore.tenantProfiles.find(t => t.id === m.tenantId);
      const tenantUser = tenant ? memoryStore.users.find(u => u.id === tenant.userId) : null;

      return {
        ...m,
        property: prop ? { ...prop, location: loc } : null,
        tenant: tenant ? { ...tenant, user: tenantUser } : null
      };
    });
  }

  async updateMaintenanceStatus(id, status) {
    if (isPrismaConnected()) {
      return prisma.maintenanceRequest.update({
        where: { id },
        data: {
          status,
          ...(status === 'RESOLVED' && { resolvedAt: new Date() })
        }
      });
    }

    const item = memoryStore.maintenanceRequests.find(m => m.id === id);
    if (item) {
      item.status = status;
      if (status === 'RESOLVED') item.resolvedAt = new Date();
      item.updatedAt = new Date();
    }
    return item;
  }

  // -------------------------------------------------------------
  // REVIEWS & COMPLAINTS
  // -------------------------------------------------------------
  async createReview(data) {
    if (isPrismaConnected()) {
      return prisma.review.create({ data });
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      reviewerId: data.reviewerId,
      propertyId: data.propertyId,
      rentalId: data.rentalId,
      rating: data.rating,
      cleanlinessRating: data.cleanlinessRating || 5,
      locationRating: data.locationRating || 5,
      ownerRating: data.ownerRating || 5,
      comment: data.comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.reviews.push(newRev);
    return newRev;
  }

  async createComplaint(data) {
    if (isPrismaConnected()) {
      return prisma.complaint.create({ data });
    }

    const newComp = {
      id: `comp-${Date.now()}`,
      userId: data.userId,
      propertyId: data.propertyId || null,
      category: data.category,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      adminResponse: null,
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.complaints.push(newComp);
    return newComp;
  }

  async findComplaints(filters = {}) {
    if (isPrismaConnected()) {
      const where = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      return prisma.complaint.findMany({
        where,
        include: { user: { select: { fullName: true, email: true, role: true } }, property: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    let comps = [...memoryStore.complaints];
    if (filters.userId) comps = comps.filter(c => c.userId === filters.userId);
    if (filters.status) comps = comps.filter(c => c.status === filters.status);

    return comps.map(c => {
      const user = memoryStore.users.find(u => u.id === c.userId);
      const prop = c.propertyId ? memoryStore.properties.find(p => p.id === c.propertyId) : null;
      return {
        ...c,
        user: user ? { fullName: user.fullName, email: user.email, role: user.role } : null,
        property: prop || null
      };
    });
  }

  async updateComplaintStatus(id, status, adminResponse) {
    if (isPrismaConnected()) {
      return prisma.complaint.update({
        where: { id },
        data: {
          status,
          adminResponse,
          ...(status === 'RESOLVED' && { resolvedAt: new Date() })
        }
      });
    }

    const c = memoryStore.complaints.find(comp => comp.id === id);
    if (c) {
      c.status = status;
      c.adminResponse = adminResponse;
      if (status === 'RESOLVED') c.resolvedAt = new Date();
      c.updatedAt = new Date();
    }
    return c;
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async createNotification(data) {
    if (isPrismaConnected()) {
      return prisma.notification.create({ data });
    }

    const notif = {
      id: `notif-${Date.now()}`,
      userId: data.userId,
      type: data.type || 'SYSTEM',
      title: data.title,
      message: data.message,
      link: data.link || null,
      isRead: false,
      createdAt: new Date()
    };
    memoryStore.notifications.push(notif);
    return notif;
  }

  async findNotificationsByUser(userId) {
    if (isPrismaConnected()) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30
      });
    }

    return memoryStore.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async markNotificationRead(id) {
    if (isPrismaConnected()) {
      return prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
    }

    const notif = memoryStore.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }

  async markAllNotificationsRead(userId) {
    if (isPrismaConnected()) {
      return prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true }
      });
    }

    memoryStore.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    return true;
  }

  // -------------------------------------------------------------
  // AUDIT LOGS & ADMIN ANALYTICS
  // -------------------------------------------------------------
  async createAuditLog(data) {
    if (isPrismaConnected()) {
      return prisma.auditLog.create({ data });
    }

    const log = {
      id: `audit-${Date.now()}`,
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      ipAddress: data.ipAddress || '127.0.0.1',
      metadata: data.metadata || null,
      createdAt: new Date()
    };
    memoryStore.auditLogs.push(log);
    return log;
  }

  async getAuditLogs() {
    if (isPrismaConnected()) {
      return prisma.auditLog.findMany({
        include: { user: { select: { fullName: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    return memoryStore.auditLogs.map(a => {
      const user = a.userId ? memoryStore.users.find(u => u.id === a.userId) : null;
      return {
        ...a,
        user: user ? { fullName: user.fullName, email: user.email, role: user.role } : null
      };
    });
  }

  async getAdminAnalytics() {
    if (isPrismaConnected()) {
      const [
        totalUsers,
        totalOwners,
        totalTenants,
        totalProperties,
        verifiedProperties,
        pendingProperties,
        activeRentals,
        totalPayments,
        openComplaints
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'OWNER' } }),
        prisma.user.count({ where: { role: 'TENANT' } }),
        prisma.property.count(),
        prisma.property.count({ where: { verificationStatus: 'APPROVED' } }),
        prisma.property.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.rental.count({ where: { status: 'ACTIVE' } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
        prisma.complaint.count({ where: { status: 'OPEN' } })
      ]);

      return {
        totalUsers,
        totalOwners,
        totalTenants,
        totalProperties,
        verifiedProperties,
        pendingProperties,
        activeRentals,
        totalRevenue: totalPayments._sum.amount || 0,
        openComplaints
      };
    }

    const totalUsers = memoryStore.users.length;
    const totalOwners = memoryStore.users.filter(u => u.role === 'OWNER').length;
    const totalTenants = memoryStore.users.filter(u => u.role === 'TENANT').length;
    const totalProperties = memoryStore.properties.length;
    const verifiedProperties = memoryStore.properties.filter(p => p.verificationStatus === 'APPROVED').length;
    const pendingProperties = memoryStore.properties.filter(p => p.verificationStatus === 'PENDING').length;
    const activeRentals = memoryStore.rentals.filter(r => r.status === 'ACTIVE').length;
    const totalRevenue = memoryStore.payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0);
    const openComplaints = memoryStore.complaints.filter(c => c.status === 'OPEN').length;

    return {
      totalUsers,
      totalOwners,
      totalTenants,
      totalProperties,
      verifiedProperties,
      pendingProperties,
      activeRentals,
      totalRevenue,
      openComplaints
    };
  }
}

module.exports = new RentalRepository();
