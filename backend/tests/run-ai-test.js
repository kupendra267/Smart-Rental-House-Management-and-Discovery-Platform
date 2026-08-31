const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');

async function runAITests() {
  console.log('🧪 Starting Phase 20 (AI Property Recommendation Engine) Tests...\n');

  // Login as Tenant 1 (Preferred: Bangalore, Koramangala, 2 BHK, Bachelor, Budget 12k-20k)
  const resTenant = await request(app)
    .post('/api/auth/login')
    .send({ email: 'tenant1@smartrental.com', password: 'Tenant@12345' });
  const tenantToken = resTenant.body.data.token;
  assert.ok(tenantToken, 'Tenant token must be present');
  console.log('✅ Setup: Tenant 1 (Aarav Patel - Koramangala 2 BHK seeker) authenticated');

  // Request AI Recommendations
  const resRecs = await request(app)
    .get('/api/recommendations?limit=5')
    .set('Authorization', `Bearer ${tenantToken}`);

  assert.strictEqual(resRecs.status, 200, 'Recommendation endpoint should return 200');
  assert.ok(Array.isArray(resRecs.body.data.recommendations), 'Recommendations must be an array');
  assert.ok(resRecs.body.data.recommendations.length >= 1, 'Should return at least 1 recommended house');

  const topPick = resRecs.body.data.recommendations[0];
  console.log(`\n🏆 Top AI Recommended House for Tenant 1:`);
  console.log(`   Property: "${topPick.title}"`);
  console.log(`   Location: ${topPick.location.area}, ${topPick.location.city}`);
  console.log(`   Rent: ₹${topPick.monthlyRent}/month | BHK: ${topPick.bhk} BHK`);
  console.log(`   Match Score: ${topPick.matchScore} (${topPick.matchPercentage}% Match)`);
  console.log(`   XAI Explanations:`);
  topPick.reasons.forEach(r => console.log(`     ${r}`));

  assert.ok(topPick.matchPercentage >= 70, 'Top recommendation match percentage should be >= 70%');
  assert.ok(Array.isArray(topPick.reasons) && topPick.reasons.length >= 2, 'Must provide explainable AI justification reasons');

  console.log('\n🎉 ALL AI RECOMMENDATION ENGINE TESTS PASSED!\n');
  process.exit(0);
}

runAITests().catch(err => {
  console.error('❌ AI Test Failed:', err);
  process.exit(1);
});
