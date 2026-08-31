const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');

async function runLifecycleTests() {
  console.log('🧪 Starting Full Rental Lifecycle (Phases 9 - 19) E2E Integration Tests...\n');

  // Authenticate all 3 roles
  const resAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@smartrental.com', password: 'Admin@12345' });
  const adminToken = resAdmin.body.data.token;

  const resOwner = await request(app).post('/api/auth/login').send({ email: 'owner1@smartrental.com', password: 'Owner@12345' });
  const ownerToken = resOwner.body.data.token;

  const resTenant = await request(app).post('/api/auth/login').send({ email: 'tenant2@smartrental.com', password: 'Tenant@12345' });
  const tenantToken = resTenant.body.data.token;

  console.log('✅ Setup: Admin, Owner, and Tenant authenticated\n');

  // STEP 1: Owner creates a new property
  const resCreateProp = await request(app)
    .post('/api/properties')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'E2E Demo High-Rise Flat Indiranagar',
      description: 'Spacious 2 BHK home for demo test walkthrough with modular kitchen and private balcony.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 4,
      totalFloors: 8,
      areaSqft: 1200,
      furnishingStatus: 'FURNISHED',
      monthlyRent: 20000,
      securityDeposit: 60000,
      maintenanceCharge: 2000,
      tenantPreference: 'ANY',
      address: '42, 100ft Road, Indiranagar',
      area: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408
    });
  assert.strictEqual(resCreateProp.status, 201);
  const demoPropertyId = resCreateProp.body.data.property.id;
  console.log(`✅ Step 1: Owner listed property: ${demoPropertyId} (Status: PENDING)`);

  // STEP 2: Admin approves property verification
  const resVerifyProp = await request(app)
    .patch(`/api/admin/properties/${demoPropertyId}/verify`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ decision: 'APPROVED', reason: 'Deed verified during E2E test' });
  assert.strictEqual(resVerifyProp.status, 200);
  assert.strictEqual(resVerifyProp.body.data.property.verificationStatus, 'APPROVED');
  assert.strictEqual(resVerifyProp.body.data.property.status, 'AVAILABLE');
  console.log('✅ Step 2: Admin verified and approved property listing -> AVAILABLE');

  // STEP 3: Tenant applies for the property
  const resApply = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      propertyId: demoPropertyId,
      moveInDate: new Date(),
      occupants: 2,
      message: 'Hello, I would love to rent this apartment!'
    });
  assert.strictEqual(resApply.status, 201);
  const demoAppId = resApply.body.data.application.id;
  console.log(`✅ Step 3: Tenant applied for property (Application ID: ${demoAppId})`);

  // STEP 4: Owner approves tenant application -> triggers automated Lease & First Invoice Creation
  const resApproveApp = await request(app)
    .patch(`/api/applications/${demoAppId}/status`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ status: 'APPROVED' });
  assert.strictEqual(resApproveApp.status, 200);
  assert.ok(resApproveApp.body.data.rental, 'Active rental must be created automatically');
  const demoRentalId = resApproveApp.body.data.rental.id;
  console.log(`✅ Step 4: Owner approved application -> Lease Created (Rental ID: ${demoRentalId})`);

  // STEP 5: Tenant views Active Lease & Generated Invoices
  const resRental = await request(app)
    .get(`/api/rentals/${demoRentalId}`)
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resRental.status, 200);
  assert.ok(resRental.body.data.rental.agreement, 'Agreement metadata must exist');
  assert.ok(resRental.body.data.rental.invoices.length >= 1, 'Initial monthly invoice must exist');
  const pendingInvoice = resRental.body.data.rental.invoices.find(i => i.status === 'PENDING');
  assert.ok(pendingInvoice, 'Pending invoice must be present');
  console.log(`✅ Step 5: Tenant retrieved active lease & Pending Invoice #${pendingInvoice.id} (Amount: ₹${pendingInvoice.totalAmount})`);

  // STEP 6: Tenant generates Payment Order via Razorpay Sandbox
  const resOrder = await request(app)
    .post('/api/payments/create-order')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ invoiceId: pendingInvoice.id });
  assert.strictEqual(resOrder.status, 200);
  assert.ok(resOrder.body.data.orderId, 'Order ID must be returned');
  assert.strictEqual(resOrder.body.data.amount, pendingInvoice.totalAmount);
  const razorpayOrderId = resOrder.body.data.orderId;
  console.log(`✅ Step 6: Server-side payment order created (Order: ${razorpayOrderId})`);

  // STEP 7: Server verifies payment and confirms transaction
  const resVerifyPay = await request(app)
    .post('/api/payments/verify')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      invoiceId: pendingInvoice.id,
      orderId: razorpayOrderId,
      paymentId: `pay_e2e_${Date.now()}`,
      signature: 'sig_verified_mock_hash_e2e'
    });
  assert.strictEqual(resVerifyPay.status, 200);
  assert.strictEqual(resVerifyPay.body.data.success, true);
  assert.ok(resVerifyPay.body.data.receipt, 'Receipt must be generated');
  const receiptNumber = resVerifyPay.body.data.receipt.receiptNumber;
  const paymentId = resVerifyPay.body.data.payment.id;
  console.log(`✅ Step 7: Payment verified -> Invoice PAID, Unique Receipt: ${receiptNumber}`);

  // STEP 8: Download & Inspect Digital Receipt
  const resReceipt = await request(app)
    .get(`/api/payments/receipt/${paymentId}`)
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resReceipt.status, 200);
  assert.strictEqual(resReceipt.body.data.receipt.receiptNumber, receiptNumber);
  console.log('✅ Step 8: Digital receipt retrieved successfully');

  // STEP 9: Tenant submits Maintenance Ticket
  const resMaint = await request(app)
    .post('/api/maintenance')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      rentalId: demoRentalId,
      propertyId: demoPropertyId,
      category: 'ELECTRICAL',
      description: 'Switchboard in living room needs replacement',
      priority: 'MEDIUM'
    });
  assert.strictEqual(resMaint.status, 201);
  const maintTicketId = resMaint.body.data.maintenance.id;
  console.log(`✅ Step 9: Tenant submitted maintenance ticket (Ticket ID: ${maintTicketId})`);

  // STEP 10: Owner updates maintenance status to RESOLVED
  const resMaintUpdate = await request(app)
    .patch(`/api/maintenance/${maintTicketId}/status`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ status: 'RESOLVED' });
  assert.strictEqual(resMaintUpdate.status, 200);
  assert.strictEqual(resMaintUpdate.body.data.maintenance.status, 'RESOLVED');
  console.log('✅ Step 10: Owner updated maintenance ticket status to RESOLVED');

  // STEP 11: Tenant writes Property Review
  const resReview = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      propertyId: demoPropertyId,
      rentalId: demoRentalId,
      rating: 5,
      cleanlinessRating: 5,
      locationRating: 5,
      ownerRating: 5,
      comment: 'Flawless move-in experience and quick maintenance turnaround!'
    });
  assert.strictEqual(resReview.status, 201);
  console.log('✅ Step 11: Tenant submitted 5-star property review');

  // STEP 12: Admin views Analytics Dashboard
  const resAnalytics = await request(app)
    .get('/api/admin/analytics')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(resAnalytics.status, 200);
  assert.ok(resAnalytics.body.data.stats.totalRevenue > 0, 'Revenue should reflect confirmed payments');
  console.log(`✅ Step 12: Admin analytics verified (Total Revenue: ₹${resAnalytics.body.data.stats.totalRevenue}, Active Leases: ${resAnalytics.body.data.stats.activeRentals})`);

  console.log('\n🎉 ALL 12 END-TO-END RENTAL LIFECYCLE STEPS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
}

runLifecycleTests().catch(err => {
  console.error('❌ Lifecycle E2E Test Failed:', err);
  process.exit(1);
});
