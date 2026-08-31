from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TenantPreferences(BaseModel):
    budget_min: Optional[float] = 10000.0
    budget_max: Optional[float] = 30000.0
    preferred_city: Optional[str] = None
    preferred_area: Optional[str] = None
    preferred_bhk: Optional[int] = 2
    preferred_property_type: Optional[str] = "APARTMENT"
    tenant_type: Optional[str] = "BACHELOR"
    preferred_furnishing: Optional[str] = None
    desired_amenities: Optional[List[str]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CandidateProperty(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    property_type: str = "APARTMENT"
    bhk: int = 1
    monthly_rent: float
    security_deposit: float = 0.0
    furnishing_status: str = "UNFURNISHED"
    tenant_preference: str = "ANY"
    city: str
    area: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: Optional[List[str]] = []
    views_count: Optional[int] = 0

class RecommendationRequest(BaseModel):
    tenant_preferences: TenantPreferences
    candidate_properties: List[CandidateProperty]
    weights: Optional[Dict[str, float]] = None

class PropertyScoreResult(BaseModel):
    property_id: str
    score: float
    match_percentage: int
    reasons: List[str]
    breakdown: Dict[str, float]

class RecommendationResponse(BaseModel):
    total_candidates: int
    recommendations: List[PropertyScoreResult]

class EvaluationRequest(BaseModel):
    k: int = 5
    test_cases: List[RecommendationRequest]

class EvaluationResponse(BaseModel):
    k: int
    hit_rate: float
    average_precision_at_k: float
    total_evaluations: int
