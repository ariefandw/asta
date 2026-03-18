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
