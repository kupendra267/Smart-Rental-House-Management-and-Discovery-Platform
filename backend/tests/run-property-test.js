const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');

async function runPropertyTests() {
  console.log('🧪 Starting Phase 5 - 8 (Properties, Search, Map Radius, Favorites, Compare) Tests...\n');

  // 1. Login as Owner 1
  const resOwner = await request(app)
    .post('/api/auth/login')
    .send({ email: 'owner1@smartrental.com', password: 'Owner@12345' });
  const ownerToken = resOwner.body.data.token;
  assert.ok(ownerToken, 'Owner token must be present');
  console.log('✅ Setup: Owner 1 authenticated');

  // 2. Login as Tenant 1
  const resTenant = await request(app)
    .post('/api/auth/login')
    .send({ email: 'tenant1@smartrental.com', password: 'Tenant@12345' });
  const tenantToken = resTenant.body.data.token;
  assert.ok(tenantToken, 'Tenant token must be present');
  console.log('✅ Setup: Tenant 1 authenticated');

  // 3. Public Property Search (Default Pagination)
  const resSearch = await request(app).get('/api/properties?page=1&limit=6');
  assert.strictEqual(resSearch.status, 200, 'Search should return 200');
  assert.ok(Array.isArray(resSearch.body.data.properties), 'Properties array should exist');
  assert.strictEqual(resSearch.body.data.properties.length, 6, 'Should return 6 items per page');
  assert.ok(resSearch.body.data.total >= 10, 'Total properties should be >= 10');
  console.log(`✅ Test 1 Passed: Public property search pagination (Total available: ${resSearch.body.data.total})`);

  // 4. Filter by City & BHK (Bangalore 2 BHK)
  const resFiltered = await request(app).get('/api/properties?city=Bangalore&bhk=2');
  assert.strictEqual(resFiltered.status, 200);
  assert.ok(resFiltered.body.data.properties.every(p => p.location.city === 'Bangalore' && p.bhk === 2), 'All filtered properties must be Bangalore 2 BHK');
  console.log(`✅ Test 2 Passed: Multi-criteria filtering (Found ${resFiltered.body.data.properties.length} matching properties)`);

  // 5. Price Sorting (price_low_to_high)
  const resSort = await request(app).get('/api/properties?sortBy=price_low_to_high&limit=10');
  const rents = resSort.body.data.properties.map(p => p.monthlyRent);
  for (let i = 0; i < rents.length - 1; i++) {
    assert.ok(rents[i] <= rents[i + 1], `Sort error: ${rents[i]} should be <= ${rents[i + 1]}`);
  }
  console.log('✅ Test 3 Passed: Property sorting by price ascending verified');

  // 6. Map Coordinates & Haversine Radius Filter (Koramangala 12.9352, 77.6245 with 10km radius)
  const resMapRadius = await request(app).get('/api/properties?lat=12.9352&lng=77.6245&radiusKm=10');
  assert.strictEqual(resMapRadius.status, 200);
  assert.ok(resMapRadius.body.data.properties.length >= 2, 'Should find Bangalore properties in 10km radius');
  assert.ok(resMapRadius.body.data.properties.every(p => p.distanceKm <= 10), 'All properties must be within 10km');
  console.log(`✅ Test 4 Passed: Map coordinate search & Haversine radius calculation (${resMapRadius.body.data.properties.length} homes within 10km)`);

  // 7. Property Details View & Auto View Counter
  const testPropId = resSearch.body.data.properties[0].id;
  const resDetails = await request(app).get(`/api/properties/${testPropId}`);
  assert.strictEqual(resDetails.status, 200);
  assert.strictEqual(resDetails.body.data.property.id, testPropId);
  assert.ok(resDetails.body.data.property.location, 'Location must be attached');
  assert.ok(resDetails.body.data.property.images, 'Images gallery must be attached');
  console.log('✅ Test 5 Passed: Property detailed view with gallery & location retrieved');

  // 8. Owner Adds New Property
  const resCreate = await request(app)
    .post('/api/properties')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'Newly Listed Luxury 2 BHK in HSR Sector 1',
      description: 'Brand new luxury apartment with Italian marble, modular kitchen, and smart home automation.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 3,
      totalFloors: 6,
      areaSqft: 1300,
      furnishingStatus: 'FURNISHED',
      monthlyRent: 22000,
      securityDeposit: 60000,
      maintenanceCharge: 2500,
      tenantPreference: 'ANY',
      address: '777, 19th Main, Sector 1, HSR Layout',
      area: 'HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560102',
      latitude: 12.9110,
      longitude: 77.6410,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', imageType: 'LIVING_ROOM', displayOrder: 0 }
      ]
    });
  assert.strictEqual(resCreate.status, 201, 'Owner property creation should return 201');
  const newPropId = resCreate.body.data.property.id;
  assert.strictEqual(resCreate.body.data.property.verificationStatus, 'PENDING');
  console.log('✅ Test 6 Passed: Owner property listing creation with PENDING verification status');

  // 9. Owner Views Dashboard Properties
  const resOwnerProps = await request(app)
    .get('/api/properties/owner/my-properties')
    .set('Authorization', `Bearer ${ownerToken}`);
  assert.strictEqual(resOwnerProps.status, 200);
  assert.ok(resOwnerProps.body.data.stats.total >= 1, 'Owner stats must include created property');
  console.log(`✅ Test 7 Passed: Owner property management stats retrieved (Total: ${resOwnerProps.body.data.stats.total})`);

  // 10. Tenant Adds & Lists Favorites
  const resAddFav = await request(app)
    .post(`/api/favorites/${testPropId}`)
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resAddFav.status, 200);

  const resFavs = await request(app)
    .get('/api/favorites')
    .set('Authorization', `Bearer ${tenantToken}`);
  assert.strictEqual(resFavs.status, 200);
  assert.ok(resFavs.body.data.favorites.some(f => f.id === testPropId), 'Favorite property must appear in list');
  console.log('✅ Test 8 Passed: Tenant bookmarking / favorites management verified');

  // 11. Property Comparison Engine (Compare 2 properties)
  const propId1 = resSearch.body.data.properties[0].id;
  const propId2 = resSearch.body.data.properties[1].id;
  const resCompare = await request(app)
    .post('/api/properties/compare')
    .send({ propertyIds: [propId1, propId2] });
  assert.strictEqual(resCompare.status, 200);
  assert.strictEqual(resCompare.body.data.properties.length, 2, 'Should compare 2 properties');
  assert.ok(resCompare.body.data.comparisonFields.includes('monthlyRent'));
  console.log('✅ Test 9 Passed: Side-by-side property comparison matrix verified');

  console.log('\n🎉 ALL 9 PROPERTY, SEARCH, MAP & FAVORITE TESTS PASSED!\n');
  process.exit(0);
}

runPropertyTests().catch(err => {
  console.error('❌ Property Test Failed:', err);
  process.exit(1);
});
