import math
import numpy as np
from typing import List, Dict, Tuple
from ..schemas.recommendation import TenantPreferences, CandidateProperty, PropertyScoreResult

DEFAULT_WEIGHTS = {
    "budget": 0.25,
    "location": 0.25,
    "bhk": 0.15,
    "property_type": 0.10,
    "amenities": 0.10,
    "tenant_preference": 0.10,
    "distance": 0.05
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PropertyRecommender:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS
        # Normalize weights to sum to 1.0
        total_w = sum(self.weights.values())
        self.weights = {k: v / total_w for k, v in self.weights.items()}

    def score_property(self, prefs: TenantPreferences, prop: CandidateProperty) -> Tuple[float, List[str], Dict[str, float]]:
        reasons = []
        breakdown = {}

        # 1. Budget Score (25%)
        b_min = prefs.budget_min or 0.0
        b_max = prefs.budget_max or 50000.0
        rent = prop.monthly_rent

        if b_min <= rent <= b_max:
            budget_score = 1.0
            reasons.append(f"✓ Within your budget (₹{rent:,.0f}/month)")
        elif rent < b_min:
            # Below min budget is still very good
            budget_score = 0.95
            reasons.append(f"✓ Highly affordable rent (₹{rent:,.0f}/month, below your min budget)")
        else:
            # Above max budget: smooth Gaussian decay
            diff = rent - b_max
            sigma = b_max * 0.3 # 30% tolerance window
            budget_score = float(np.exp(- (diff ** 2) / (2 * (sigma ** 2))))
            if budget_score > 0.7:
                reasons.append(f"✓ Close to your budget ceiling (₹{rent:,.0f}/month)")

        breakdown["budget"] = round(budget_score, 3)

        # 2. Location & City Score (25%)
        loc_score = 0.0
        pref_city = (prefs.preferred_city or "").strip().lower()
        pref_area = (prefs.preferred_area or "").strip().lower()
        prop_city = (prop.city or "").strip().lower()
        prop_area = (prop.area or "").strip().lower()

        if pref_city and pref_city in prop_city:
            loc_score += 0.5
            if pref_area and pref_area in prop_area:
                loc_score += 0.5
                reasons.append(f"✓ Prime match in preferred area ({prop.area}, {prop.city})")
            else:
                reasons.append(f"✓ Located in your preferred city ({prop.city})")
        elif not pref_city:
            loc_score = 0.8
        else:
            loc_score = 0.2

        breakdown["location"] = round(loc_score, 3)

        # 3. BHK Score (15%)
        pref_bhk = prefs.preferred_bhk or 2
        prop_bhk = prop.bhk

        if prop_bhk == pref_bhk:
            bhk_score = 1.0
            reasons.append(f"✓ Exact {prop_bhk} BHK layout match")
        elif abs(prop_bhk - pref_bhk) == 1:
            bhk_score = 0.6
            reasons.append(f"✓ Close configuration ({prop_bhk} BHK vs requested {pref_bhk} BHK)")
        else:
            bhk_score = 0.3

        breakdown["bhk"] = round(bhk_score, 3)

        # 4. Property Type Score (10%)
        pref_type = (prefs.preferred_property_type or "").upper()
        prop_type = (prop.property_type or "").upper()

        if pref_type == prop_type:
            type_score = 1.0
            reasons.append(f"✓ Matches preferred property style ({prop.property_type.replace('_', ' ').title()})")
        elif not pref_type:
            type_score = 0.8
        else:
            type_score = 0.4

        breakdown["property_type"] = round(type_score, 3)

        # 5. Tenant Classification Match (10%)
        tenant_type = (prefs.tenant_type or "BACHELOR").upper()
        prop_pref = (prop.tenant_preference or "ANY").upper()

        if prop_pref == "ANY":
            pref_score = 1.0
            reasons.append("✓ Open to all tenant profiles")
        elif prop_pref == "BACHELOR_ONLY" and tenant_type in ["BACHELOR", "STUDENT", "WORKING_PROFESSIONAL"]:
            pref_score = 1.0
            reasons.append("✓ Bachelor & professional friendly")
        elif prop_pref == "FAMILY_ONLY" and tenant_type == "FAMILY":
            pref_score = 1.0
            reasons.append("✓ Dedicated family residential community")
        else:
            pref_score = 0.2

        breakdown["tenant_preference"] = round(pref_score, 3)

        # 6. Amenities Match (10%)
        desired = set([a.lower().strip() for a in (prefs.desired_amenities or [])])
        provided = set([a.lower().strip() for a in (prop.amenities or [])])

        if not desired:
            amen_score = 0.9
            if len(provided) >= 4:
                reasons.append(f"✓ Well-equipped with {len(provided)} modern amenities")
        else:
            intersection = desired.intersection(provided)
            amen_score = len(intersection) / len(desired) if desired else 1.0
            if len(intersection) > 0:
                reasons.append(f"✓ Includes {len(intersection)} of your desired amenities")

        breakdown["amenities"] = round(amen_score, 3)

        # 7. Haversine Distance (5%)
        if prefs.latitude and prefs.longitude and prop.latitude and prop.longitude:
            dist = haversine_distance(prefs.latitude, prefs.longitude, prop.latitude, prop.longitude)
            if dist <= 3.0:
                dist_score = 1.0
                reasons.append(f"✓ Proximity advantage ({dist:.1f} km away)")
            elif dist <= 8.0:
                dist_score = 0.8
                reasons.append(f"✓ Convenient distance ({dist:.1f} km away)")
            elif dist <= 15.0:
                dist_score = 0.5
            else:
                dist_score = 0.2
        else:
            dist_score = 0.7

        breakdown["distance"] = round(dist_score, 3)

        # Compute Final Weighted Composite Score
        final_score = (
            self.weights["budget"] * budget_score +
            self.weights["location"] * loc_score +
            self.weights["bhk"] * bhk_score +
            self.weights["property_type"] * type_score +
            self.weights["tenant_preference"] * pref_score +
            self.weights["amenities"] * amen_score +
            self.weights["distance"] * dist_score
        )

        return float(final_score), reasons, breakdown

    def rank_properties(self, prefs: TenantPreferences, properties: List[CandidateProperty]) -> List[PropertyScoreResult]:
        results = []
        for p in properties:
            score, reasons, breakdown = self.score_property(prefs, p)
            match_pct = int(round(score * 100))
            results.append(PropertyScoreResult(
                property_id=p.id,
                score=round(score, 4),
                match_percentage=match_pct,
                reasons=reasons[:4], # Top 4 human-readable justifications
                breakdown=breakdown
            ))

        # Sort descending by score
        results.sort(key=lambda r: r.score, reverse=True)
        return results
