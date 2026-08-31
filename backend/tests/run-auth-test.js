const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');

async function runTests() {
  console.log('🧪 Starting Phase 3 & 4 (Auth, RBAC, Profiles) Tests...\n');
  let tenantToken = '';
  let ownerToken = '';
  let adminToken = '';
  let newTenantEmail = `tenant_${Date.now()}@test.com`;

  // 1. Admin Login
  const resAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@smartrental.com', password: 'Admin@12345' });
  assert.strictEqual(resAdmin.status, 200, 'Admin login status should be 200');
  assert.strictEqual(resAdmin.body.data.user.role, 'ADMIN');
  assert.ok(resAdmin.body.data.token, 'Token must be present');
  adminToken = resAdmin.body.data.token;
  console.log('✅ Test 1 Passed: Admin login with seed credentials');

  // 2. Owner Login
  const resOwner = await request(app)
    .post('/api/auth/login')
    .send({ email: 'owner1@smartrental.com', password: 'Owner@12345' });
  assert.strictEqual(resOwner.status, 200, 'Owner login status should be 200');
  assert.strictEqual(resOwner.body.data.user.role, 'OWNER');
  ownerToken = resOwner.body.data.token;
  console.log('✅ Test 2 Passed: Owner login with seed credentials');

  // 3. Tenant Registration
  const resReg = await request(app)
    .post('/api/auth/register')
    .send({
      fullName: 'Test Suite Tenant',
      email: newTenantEmail,
      password: 'Password@123',
      phone: '+91 9998887776',
      role: 'TENANT',
      city: 'Bangalore',
      area: 'Koramangala',
      budgetMin: 15000,
      budgetMax: 25000,
      preferredBhk: 2,
      tenantType: 'BACHELOR',
      occupation: 'Software Engineer'
    });
  assert.strictEqual(resReg.status, 201, 'Registration status should be 201');
  assert.strictEqual(resReg.body.data.user.email, newTenantEmail);
  assert.ok(resReg.body.data.user.tenantProfile, 'Tenant profile must be auto-created');
  tenantToken = resReg.body.data.token;
  console.log('✅ Test 3 Passed: Tenant registration with auto profile creation');

  // 4. Duplicate Email
  const resDup = await request(app)
    .post('/api/auth/register')
    .send({ fullName: 'Dup User', email: newTenantEmail, password: 'Password@123' });
  assert.strictEqual(resDup.status, 409, 'Duplicate email should be rejected with 409');
  assert.strictEqual(resDup.body.errorCode, 'EMAIL_ALREADY_EXISTS');
  console.log('✅ Test 4 Passed: Duplicate registration blocked');

  // 5. Invalid Password
  const resInv = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@smartrental.com', password: 'WrongPassword' });
  assert.strictEqual(resInv.status, 401, 'Invalid password should return 401');
  console.log('✅ Test 5 Passed: Invalid password rejected');

  // 6. Get Current User (/api/auth/me)
  const resMe = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resMe.status, 200, 'Get me status should be 200');
  assert.strictEqual(resMe.body.data.user.email, newTenantEmail);
  console.log('✅ Test 6 Passed: Current user profile (/api/auth/me) verified');

  // 7. Update Profile (/api/users/profile)
  const resUpd = await request(app)
    .put('/api/users/profile')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ fullName: 'Updated Tenant Name', preferredArea: 'HSR Layout', budgetMax: 32000 });
  assert.strictEqual(resUpd.status, 200, 'Update profile should be 200');
  assert.strictEqual(resUpd.body.data.user.fullName, 'Updated Tenant Name');
  assert.strictEqual(resUpd.body.data.user.tenantProfile.preferredArea, 'HSR Layout');
  console.log('✅ Test 7 Passed: Tenant profile update verified');

  // 8. RBAC Guard: Tenant cannot access Admin endpoint
  const resRbac = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resRbac.status, 403, 'RBAC should deny tenant from /api/users with 403');
  assert.strictEqual(resRbac.body.errorCode, 'FORBIDDEN_ROLE');
  console.log('✅ Test 8 Passed: RBAC role guard successfully blocked unauthorized role');

  // 9. Admin User Management
  const resUsers = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(resUsers.status, 200, 'Admin can list users with 200');
  assert.ok(Array.isArray(resUsers.body.data.users), 'Users must be an array');
  assert.ok(resUsers.body.data.users.length >= 15, 'Should contain seed users');
  console.log('✅ Test 9 Passed: Admin user directory retrieved');

  console.log('\n🎉 ALL 9 AUTH & RBAC INTEGRATION TESTS PASSED!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
