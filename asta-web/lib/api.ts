import axios from "axios"
import type {
  GrowthAnomalyRequest,
  GrowthAnomalyResponse,
  MaternalRiskRequest,
  MaternalRiskResponse,
  NutritionalGapRequest,
  NutritionalGapResponse,
} from "@/types"

// Use environment variable or default to localhost for dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_KEY = "rekmed-evah-2026"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
})

// Growth Anomaly API
export async function analyzeGrowth(
  data: GrowthAnomalyRequest
): Promise<GrowthAnomalyResponse> {
  const response = await apiClient.post<{ status: string; data: GrowthAnomalyResponse }>(
    "/api/v1/stunting/growth-anomaly",
    data
  )
  return response.data.data
}

// Maternal Risk API
export async function calculateMaternalRisk(
  data: MaternalRiskRequest
): Promise<MaternalRiskResponse> {
  const response = await apiClient.post<{ status: string; data: MaternalRiskResponse }>(
    "/api/v1/maternal/risk-score",
    data
  )
  return response.data.data
}

// Nutritional Gap API
export async function analyzeNutritionalGap(
  data: NutritionalGapRequest
): Promise<NutritionalGapResponse> {
  const response = await apiClient.post<{ status: string; data: NutritionalGapResponse }>(
    "/api/v1/stunting/nutritional-gap",
    data
  )
  return response.data.data
}

export default apiClient
