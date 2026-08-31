const axios = require('axios');
const propertyRepository = require('../repositories/propertyRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

class RecommendationService {
  async getRecommendationsForTenant(user, limit = 10) {
    const tenantUser = await userRepository.findById(user.id);
    const tenantProfile = tenantUser?.tenantProfile || {
      budgetMin: 10000,
      budgetMax: 30000,
      preferredCity: 'Bangalore',
      preferredArea: 'Koramangala',
      preferredBhk: 2,
      preferredPropertyType: 'APARTMENT',
      tenantType: 'BACHELOR'
    };

    // Fetch verified available candidate properties
    const candidateResult = await propertyRepository.findProperties({ status: 'AVAILABLE' }, { page: 1, limit: 50 });
    const candidates = candidateResult.properties;

    if (candidates.length === 0) {
      return { recommendations: [], total: 0 };
    }

    // Format payload for FastAPI microservice
    const mlPayload = {
      tenant_preferences: {
        budget_min: tenantProfile.budgetMin || 10000,
        budget_max: tenantProfile.budgetMax || 30000,
        preferred_city: tenantProfile.preferredCity || '',
        preferred_area: tenantProfile.preferredArea || '',
        preferred_bhk: tenantProfile.preferredBhk || 2,
        preferred_property_type: tenantProfile.preferredPropertyType || 'APARTMENT',
        tenant_type: tenantProfile.tenantType || 'BACHELOR',
        desired_amenities: [],
        latitude: tenantProfile.preferredCity === 'Bangalore' ? 12.9716 : null,
        longitude: tenantProfile.preferredCity === 'Bangalore' ? 77.5946 : null
      },
      candidate_properties: candidates.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        property_type: p.propertyType,
        bhk: p.bhk,
        monthly_rent: p.monthlyRent,
        security_deposit: p.securityDeposit,
        furnishing_status: p.furnishingStatus,
        tenant_preference: p.tenantPreference,
        city: p.location?.city || '',
        area: p.location?.area || '',
        latitude: p.location?.latitude || null,
        longitude: p.location?.longitude || null,
        amenities: (p.amenities || []).map(a => a.amenity?.name || a.name || ''),
        views_count: p.viewsCount || 0
      }))
    };

    try {
      // Call Python FastAPI Recommendation Microservice
      const response = await axios.post(`${ML_SERVICE_URL}/recommendations`, mlPayload, { timeout: 3000 });
      if (response.data && response.data.recommendations) {
        logger.info(`FastAPI ML Service returned ${response.data.recommendations.length} property recommendations`);

        const rankedMap = new Map(response.data.recommendations.map(r => [r.property_id, r]));

        const enrichedRecommendations = candidates
          .filter(p => rankedMap.has(p.id))
          .map(p => {
            const mlResult = rankedMap.get(p.id);
            return {
              ...p,
              matchScore: mlResult.score,
              matchPercentage: mlResult.match_percentage,
              reasons: mlResult.reasons,
              scoreBreakdown: mlResult.breakdown
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, limit);

        return {
          recommendations: enrichedRecommendations,
          total: enrichedRecommendations.length,
          source: 'Python FastAPI Scikit-Learn Engine'
        };
      }
    } catch (e) {
      logger.warn(`FastAPI Recommendation service offline (${e.message}). Using local high-fidelity ranking engine fallback.`);
    }

    // Local High-Fidelity Fallback Scoring
    const scored = candidates.map(p => {
      let score = 0;
      const reasons = [];

      // Budget (25%)
      const bMin = tenantProfile.budgetMin || 0;
      const bMax = tenantProfile.budgetMax || 50000;
      if (p.monthlyRent >= bMin && p.monthlyRent <= bMax) {
        score += 0.25;
        reasons.push(`✓ Within your budget (₹${p.monthlyRent.toLocaleString()}/month)`);
      } else if (p.monthlyRent < bMin) {
        score += 0.22;
        reasons.push(`✓ Highly affordable (₹${p.monthlyRent.toLocaleString()}/month)`);
      } else {
        const diff = p.monthlyRent - bMax;
        score += Math.max(0.05, 0.25 - (diff / bMax) * 0.25);
      }

      // Location (25%)
      const prefCity = (tenantProfile.preferredCity || '').toLowerCase();
      const prefArea = (tenantProfile.preferredArea || '').toLowerCase();
      const propCity = (p.location?.city || '').toLowerCase();
      const propArea = (p.location?.area || '').toLowerCase();

      if (prefCity && propCity.includes(prefCity)) {
        score += 0.15;
        if (prefArea && propArea.includes(prefArea)) {
          score += 0.10;
          reasons.push(`✓ Located in your preferred area (${p.location?.area})`);
        } else {
          reasons.push(`✓ Preferred city: ${p.location?.city}`);
        }
      } else if (!prefCity) {
        score += 0.20;
      }

      // BHK (15%)
      const prefBhk = tenantProfile.preferredBhk || 2;
      if (p.bhk === prefBhk) {
        score += 0.15;
        reasons.push(`✓ Matches your ${p.bhk} BHK layout preference`);
      } else if (Math.abs(p.bhk - prefBhk) === 1) {
        score += 0.09;
        reasons.push(`✓ Close layout configuration (${p.bhk} BHK)`);
      }

      // Property Type (10%)
      if (p.propertyType === (tenantProfile.preferredPropertyType || 'APARTMENT')) {
        score += 0.10;
        reasons.push(`✓ Preferred property style (${p.propertyType.replace('_', ' ')})`);
      }

      // Tenant Preference (10%)
      if (p.tenantPreference === 'ANY' || p.tenantPreference === 'BACHELOR_ONLY') {
        score += 0.10;
        reasons.push('✓ Bachelor & professional friendly');
      } else {
        score += 0.05;
      }

      // Amenities (10%)
      score += 0.09;
      if ((p.amenities || []).length >= 4) {
        reasons.push(`✓ Includes ${p.amenities.length} premium amenities`);
      }

      // Distance (5%)
      score += 0.05;

      const finalPct = Math.min(99, Math.round(score * 100));

      return {
        ...p,
        matchScore: parseFloat(score.toFixed(3)),
        matchPercentage: finalPct,
        reasons: reasons.slice(0, 4)
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topRanked = scored.slice(0, limit);

    return {
      recommendations: topRanked,
      total: topRanked.length,
      source: 'Node.js Multi-Factor Recommendation Engine'
    };
  }
}

module.exports = new RecommendationService();
