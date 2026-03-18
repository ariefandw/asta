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
