# AI Property Recommendation Microservice

> FastAPI-powered property recommendation and matching engine using multi-factor weighted scoring and Cosine Similarity.

## Features
- **Budget Matching**: Gaussian decay scoring based on min/max tenant budget tolerance.
- **Location & Proximity**: Vector string similarity & Haversine distance scoring.
- **BHK & Property Type**: Preference classification matrix.
- **Amenity Vectorization**: Multi-hot binary feature similarity.
- **Explainable AI (XAI)**: Generates human-understandable justification bullet points for every recommendation score (e.g. `94% Match`).

## Endpoints
- `GET /health` - Health check
- `POST /recommendations` - Compute rankings and scores for candidate properties based on tenant profile
- `POST /evaluate` - Model evaluation metrics (Precision@K, Hit Rate)

## Running Locally
```bash
python -m venv venv
# Activate virtual environment
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
