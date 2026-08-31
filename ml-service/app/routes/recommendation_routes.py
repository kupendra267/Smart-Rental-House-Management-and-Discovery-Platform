from fastapi import APIRouter, HTTPException
from ..schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    EvaluationRequest,
    EvaluationResponse
)
from ..services.recommender import PropertyRecommender

router = APIRouter(tags=["Recommendations"])

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    recommender = PropertyRecommender(weights=payload.weights)
    ranked = recommender.rank_properties(payload.tenant_preferences, payload.candidate_properties)
    return RecommendationResponse(
        total_candidates=len(payload.candidate_properties),
        recommendations=ranked
    )

@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_recommendations(payload: EvaluationRequest):
    k = payload.k
    hits = 0
    precisions = []

    for test_case in payload.test_cases:
        recommender = PropertyRecommender(weights=test_case.weights)
        ranked = recommender.rank_properties(test_case.tenant_preferences, test_case.candidate_properties)
        top_k = ranked[:k]

        # Consider score >= 0.70 as relevant
        relevant_in_top_k = [r for r in top_k if r.score >= 0.70]
        if len(relevant_in_top_k) > 0:
            hits += 1
        precision = len(relevant_in_top_k) / k if k > 0 else 0
        precisions.append(precision)

    total = len(payload.test_cases)
    hit_rate = hits / total if total > 0 else 0.0
    avg_precision = sum(precisions) / total if total > 0 else 0.0

    return EvaluationResponse(
        k=k,
        hit_rate=round(hit_rate, 4),
        average_precision_at_k=round(avg_precision, 4),
        total_evaluations=total
    )
