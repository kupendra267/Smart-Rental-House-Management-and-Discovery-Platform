const request = require('supertest');
const app = require('../src/app');

describe('Phase 3 & 4: Authentication, RBAC, and Profile Tests', () => {
  let tenantToken = '';
  let ownerToken = '';
  let adminToken = '';
  let newTenantEmail = `newtenant_${Date.now()}@test.com`;

  test('1. Admin Login with seed credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@smartrental.com',
        password: 'Admin@12345'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  test('2. Owner Login with seed credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner1@smartrental.com',
        password: 'Owner@12345'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('OWNER');
    ownerToken = res.body.data.token;
  });

  test('3. Tenant Registration with profile creation', async () => {
    const res = await request(app)
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

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(newTenantEmail);
    expect(res.body.data.user.tenantProfile).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    tenantToken = res.body.data.token;
  });

  test('4. Prevent Duplicate Email Registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Duplicate User',
        email: newTenantEmail,
        password: 'Password@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('EMAIL_ALREADY_EXISTS');
  });

  test('5. Reject Login with Invalid Password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@smartrental.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('6. Fetch Current User Profile (/api/auth/me)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tenantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(newTenantEmail);
    expect(res.body.data.user.tenantProfile.preferredCity).toBe('Bangalore');
  });

  test('7. Update Tenant Profile (/api/users/profile)', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        fullName: 'Test Suite Tenant Updated',
        budgetMax: 30000,
        preferredArea: 'Indiranagar'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.fullName).toBe('Test Suite Tenant Updated');
  });

  test('8. RBAC Guard: Tenant cannot access Admin user listing', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tenantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN_ROLE');
  });

  test('9. Admin can list all users (/api/users)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(15);
  });
});
