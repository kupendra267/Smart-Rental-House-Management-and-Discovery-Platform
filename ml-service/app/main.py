from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .routes.recommendation_routes import router as recommendation_router

app = FastAPI(
    title="Smart Rental AI Recommendation Microservice",
    description="Intelligent property ranking, cosine similarity & multi-factor match score engine",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "service": "smart-rental-ml-service",
        "version": "1.0.0"
    }

@app.get("/")
def read_root():
    return {
        "message": "Smart Rental AI Recommendation API is active",
        "docs_url": "/docs",
        "status": "online"
    }

# Include AI Recommendation Routes
app.include_router(recommendation_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
