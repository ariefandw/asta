# AI Agent Instructions: Bootstrap asta-api (Pro Edition)

## Context for AI Agent

You are tasked with building a standalone FastAPI microservice called **asta-api** (AI Stunting Triage Assistant). This API serves as a decision-support backend for an Electronic Medical Record (EMR) system to prevent child stunting (1000 Days of Life / HPK program).

**Professional Standards:**
- Use **uv** for lightning-fast package management.
- Use **SQLModel** (SQLAlchemy + Pydantic) for a unified data layer.
- Use **SQLite** for the Proof of Concept (POC).
- All endpoints must be protected by a simple API Key header authentication (`X-API-Key`).

## Main Endpoints

- **POST** `/api/v1/stunting/growth-anomaly` - Predicts growth faltering based on historical weight data using `numpy.polynomial.Polynomial`.
- **POST** `/api/v1/maternal/risk-score` - Rule-based scoring for high-risk pregnancies (MUAC, Hb, Age, BMI).
- **POST** `/api/v1/stunting/nutritional-gap` - Rule-based validation for complementary feeding (MPASI).

---

## Task

Create the following project structure and files exactly as specified below.

### 1. Project Structure

```text
asta-api/
├── pyproject.toml
├── models.py
├── services.py
└── main.py
```

### 2. pyproject.toml

```toml
[project]
name = "asta-api"
version = "0.1.0"
description = "AI Stunting Triage Assistant"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "fastapi==0.135.1",
    "uvicorn==0.42.0",
    "sqlmodel==0.0.37",
    "numpy==2.4.3",
    "python-multipart==0.0.20",
]

[tool.uv]
managed = true
```

### 3. models.py

```python
from typing import List, Dict, Optional
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine

# --- Module 1: Growth Curve Models ---

class GrowthHistoryBase(SQLModel):
    age_months: int
    weight_kg: float
    height_cm: float

class GrowthHistory(GrowthHistoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: str = Field(index=True)

class GrowthAnomalyRequest(SQLModel):
    patient_id: str
    gender: str
    current_age_months: int
    history: List[GrowthHistoryBase]

class Projection(SQLModel):
    age_months: int
    predicted_weight_kg: float

class GrowthAnomalyResponse(SQLModel):
    is_anomaly: bool
    trend_slope: float
    alert_message: Optional[str] = None
    action_recommendations: List[str]
    projections: List[Projection]

# --- Module 2: Maternal Risk Models ---

class MaternalRisk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: str = Field(index=True)
    age: int
    lila_cm: float
    hb_level: float
    weight_kg: float
    height_cm: float
    total_score: int
    risk_level: str

class MaternalRiskRequest(SQLModel):
    patient_id: str
    age: int
    lila_cm: float
    hb_level: float
    weight_kg: float
    height_cm: float

class MaternalRiskResponse(SQLModel):
    total_score: int
    risk_level: str
    triage_status: str
    calculated_bmi: float
    risk_factors_list: List[str]
    summary_text: str

# --- Module 3: Nutritional Gap Models ---

class DailyIntake(SQLModel):
    has_animal_protein: bool
    has_vegetables: bool
    has_carbs: bool
    has_fats: bool = True
    meal_frequency: int

class NutritionalGapRequest(SQLModel):
    patient_id: str
    age_months: int
    daily_intake: DailyIntake

class NutritionalGapResponse(SQLModel):
    has_gap: bool
    health_score_out_of_10: int
    whatsapp_copypaste_text: str
    ui_icon_states: Dict[str, str]

# --- Database Config ---
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

### 4. services.py

```python
import numpy as np
from numpy.polynomial import Polynomial
from sqlmodel import Session
from models import (
    GrowthAnomalyRequest, GrowthAnomalyResponse, Projection,
    MaternalRiskRequest, MaternalRiskResponse,
    NutritionalGapRequest, NutritionalGapResponse,
    MaternalRisk
)

def analyze_growth_anomaly(data: GrowthAnomalyRequest) -> GrowthAnomalyResponse:
    if len(data.history) < 2:
        return GrowthAnomalyResponse(
            is_anomaly=False, trend_slope=0.0, action_recommendations=["Need more data points"], projections=[]
        )

    # Extract X (age) and Y (weight)
    x = np.array([item.age_months for item in data.history])
    y = np.array([item.weight_kg for item in data.history])

    # Modern Linear Regression
    poly = Polynomial.fit(x, y, 1).convert()
    intercept, slope = poly.coef
    
    # Project next 3 months
    last_age = data.current_age_months
    projections = []
    for i in range(1, 4):
        future_age = last_age + i
        pred_weight = (slope * future_age) + intercept
        projections.append(Projection(age_months=future_age, predicted_weight_kg=round(float(pred_weight), 2)))

    is_anomaly = slope < 0.2 
    alert_msg = "⚠️ Slowing Trend: Risk of Stunting in 90 days if there is no animal protein intervention." if is_anomaly else "Growth is on track."
    actions = ["Refer to Nutritionist", "View MPASI Guidelines"] if is_anomaly else ["Continue good nutrition"]

    return GrowthAnomalyResponse(
        is_anomaly=bool(is_anomaly),
        trend_slope=round(float(slope), 3),
        alert_message=alert_msg,
        action_recommendations=actions,
        projections=projections
    )


def calculate_maternal_risk(session: Session, data: MaternalRiskRequest) -> MaternalRiskResponse:
    score = 0
    factors = []

    height_m = data.height_cm / 100
    bmi = data.weight_kg / (height_m ** 2) if height_m > 0 else 0

    if data.lila_cm < 23.5:
        score += 30
        factors.append(f"CED (MUAC {data.lila_cm} cm)")
    
    if data.hb_level < 11.0:
        score += 40
        factors.append(f"Anemia (Hb {data.hb_level} g/dL)")
        
    if data.age < 20 or data.age > 35:
        score += 20
        factors.append(f"At-Risk Age ({data.age} yrs)")
        
    if bmi < 18.5:
        score += 10
        factors.append(f"Underweight (BMI {round(bmi, 1)})")

    level = "HIGH_RISK" if score > 60 else ("MEDIUM_RISK" if score >= 30 else "LOW_RISK")
    status = f"[STATUS: {level.replace('_', ' ')} PREGNANCY]"

    # Persist the risk record
    db_record = MaternalRisk(
        patient_id=data.patient_id,
        age=data.age,
        lila_cm=data.lila_cm,
        hb_level=data.hb_level,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
        total_score=score,
        risk_level=level
    )
    session.add(db_record)
    session.commit()

    return MaternalRiskResponse(
        total_score=score,
        risk_level=level,
        triage_status=status,
        calculated_bmi=round(bmi, 1),
        risk_factors_list=factors,
        summary_text=f"Risk Factors: {', '.join(factors)}" if factors else "No major risk factors."
    )


def analyze_nutritional_gap(data: NutritionalGapRequest) -> NutritionalGapResponse:
    intake = data.daily_intake
    has_gap = False
    missing = []
    
    if data.age_months > 6 and not intake.has_animal_protein:
        has_gap = True
        missing.append("Animal Protein & Iron")
        
    score = 10
    if not intake.has_animal_protein: score -= 3
    if not intake.has_vegetables: score -= 2
    if not intake.has_carbs: score -= 2
    if intake.meal_frequency < 2: score -= 2

    whatsapp_text = f"Patient ({data.age_months}mo) lacks {', '.join(missing)} intake." if has_gap else "Adequate nutrition."

    return NutritionalGapResponse(
        has_gap=has_gap,
        health_score_out_of_10=max(0, score),
        whatsapp_copypaste_text=whatsapp_text,
        ui_icon_states={
            "meat": "colored" if intake.has_animal_protein else "gray",
            "egg": "colored" if intake.has_animal_protein else "gray",
            "carbs": "colored" if intake.has_carbs else "gray",
            "veg": "colored" if intake.has_vegetables else "gray"
        }
    )
```

### 5. main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlmodel import Session
from models import (
    GrowthAnomalyRequest, MaternalRiskRequest, NutritionalGapRequest,
    engine, create_db_and_tables
)
from services import (
    analyze_growth_anomaly, calculate_maternal_risk, analyze_nutritional_gap
)

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
```
