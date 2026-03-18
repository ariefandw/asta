// --- Module 1: Growth Curve Types ---

export interface GrowthHistory {
  age_months: number
  weight_kg: number
  height_cm: number
}

export interface GrowthAnomalyRequest {
  patient_id: string
  gender: string
  current_age_months: number
  history: GrowthHistory[]
}

export interface Projection {
  age_months: number
  predicted_weight_kg: number
}

export interface GrowthAnomalyResponse {
  is_anomaly: boolean
  trend_slope: number
  alert_message: string | null
  action_recommendations: string[]
  projections: Projection[]
}

// --- Module 2: Maternal Risk Types ---

export interface MaternalRiskRequest {
  patient_id: string
  age: number
  lila_cm: number
  hb_level: number
  weight_kg: number
  height_cm: number
}

export interface MaternalRiskResponse {
  total_score: number
  risk_level: string
  triage_status: string
  calculated_bmi: number
  risk_factors_list: string[]
  summary_text: string
}

// --- Module 3: Nutritional Gap Types ---

export interface DailyIntake {
  has_animal_protein: boolean
  has_vegetables: boolean
  has_carbs: boolean
  has_fats: boolean
  meal_frequency: number
}

export interface NutritionalGapRequest {
  patient_id: string
  age_months: number
  daily_intake: DailyIntake
}

export interface NutritionalGapResponse {
  has_gap: boolean
  health_score_out_of_10: number
  whatsapp_copypaste_text: string
  ui_icon_states: Record<string, string>
}

// --- Chart Data Types ---

export interface GrowthChartDataPoint {
  age: number
  weight: number
  isProjection?: boolean
}
