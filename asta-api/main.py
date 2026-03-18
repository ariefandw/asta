from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from models import (
    GrowthAnomalyRequest, MaternalRiskRequest, NutritionalGapRequest,
    engine, create_db_and_tables
)
from services import (
    analyze_growth_anomaly, calculate_maternal_risk, analyze_nutritional_gap
)
from scalar_fastapi import get_scalar_api_reference

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="ASTA Pro API",
    description="Professional backend for stunting triage.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scalar UI endpoint
@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title
    )

API_KEY = "rekmed-evah-2026"
api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

def get_session():
    with Session(engine) as session:
        yield session

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/stunting/growth-anomaly", dependencies=[Depends(verify_api_key)])
def endpoint_growth_anomaly(request: GrowthAnomalyRequest):
    return {"status": "success", "data": analyze_growth_anomaly(request)}

@app.post("/api/v1/maternal/risk-score", dependencies=[Depends(verify_api_key)])
def endpoint_maternal_risk(request: MaternalRiskRequest, session: Session = Depends(get_session)):
    return {"status": "success", "data": calculate_maternal_risk(session, request)}

@app.post("/api/v1/stunting/nutritional-gap", dependencies=[Depends(verify_api_key)])
def endpoint_nutritional_gap(request: NutritionalGapRequest):
    return {"status": "success", "data": analyze_nutritional_gap(request)}
