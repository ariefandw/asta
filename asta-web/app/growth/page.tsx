"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GrowthChart } from "@/components/growth-chart"
import { analyzeGrowth } from "@/lib/api"
import type { GrowthHistory, GrowthChartDataPoint, GrowthAnomalyResponse } from "@/types"

export default function GrowthPage() {
  const [patientId, setPatientId] = useState("")
  const [gender, setGender] = useState<string>("")
  const [currentAge, setCurrentAge] = useState("")
  const [history, setHistory] = useState<GrowthHistory[]>([
    { age_months: 0, weight_kg: 3.2, height_cm: 50 },
    { age_months: 3, weight_kg: 5.5, height_cm: 60 },
    { age_months: 6, weight_kg: 7.2, height_cm: 65 },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GrowthAnomalyResponse | null>(null)
  const [chartData, setChartData] = useState<GrowthChartDataPoint[]>([])

  const addHistoryRow = () => {
    const lastEntry = history[history.length - 1]
    setHistory([
      ...history,
      {
        age_months: lastEntry ? lastEntry.age_months + 3 : 0,
        weight_kg: 0,
        height_cm: 0,
      },
    ])
  }

  const removeHistoryRow = (index: number) => {
    if (history.length > 1) {
      setHistory(history.filter((_, i) => i !== index))
    }
  }

  const updateHistoryRow = (index: number, field: keyof GrowthHistory, value: string) => {
    const newHistory = [...history]
    newHistory[index][field] = field === "age_months" ? parseInt(value) || 0 : parseFloat(value) || 0
    setHistory(newHistory)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await analyzeGrowth({
        patient_id: patientId,
        gender,
        current_age_months: parseInt(currentAge),
        history,
      })
      setResult(response)

      // Prepare chart data
      const historicalData: GrowthChartDataPoint[] = history.map((h) => ({
        age: h.age_months,
        weight: h.weight_kg,
        isProjection: false,
      }))
      const projectionData: GrowthChartDataPoint[] = response.projections.map((p) => ({
        age: p.age_months,
        weight: p.predicted_weight_kg,
        isProjection: true,
      }))
      setChartData([...historicalData, ...projectionData])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze growth data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Baby className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Growth Anomaly Detection</h1>
              <p className="text-sm text-muted-foreground">
                Analyze growth patterns with 3-month projections
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter patient details and growth history</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      placeholder="e.g., P-001"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age (months)</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    placeholder="e.g., 9"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Growth History</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addHistoryRow}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Row
                    </Button>
                  </div>
                  {/* Column headers */}
                  <div className="grid grid-cols-4 gap-2 px-2 text-xs font-medium text-muted-foreground">
                    <span>Age (months)</span>
                    <span>Weight (kg)</span>
                    <span>Height (cm)</span>
                    <span></span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((entry, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-4">
                        <Input
                          type="number"
                          placeholder="Age (mo)"
                          value={entry.age_months}
                          onChange={(e) => updateHistoryRow(index, "age_months", e.target.value)}
                          required
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Weight (kg)"
                          value={entry.weight_kg || ""}
                          onChange={(e) => updateHistoryRow(index, "weight_kg", e.target.value)}
                          required
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Height (cm)"
                          value={entry.height_cm || ""}
                          onChange={(e) => updateHistoryRow(index, "height_cm", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHistoryRow(index)}
                          disabled={history.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Growth"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                {result.is_anomaly && result.alert_message && (
                  <Alert variant="destructive">
                    <AlertTitle>Anomaly Detected</AlertTitle>
                    <AlertDescription>{result.alert_message}</AlertDescription>
                  </Alert>
                )}

                {!result.is_anomaly && (
                  <Alert>
                    <AlertTitle>Normal Growth Pattern</AlertTitle>
                    <AlertDescription>
                      Child&apos;s growth is within expected range. Trend slope: {result.trend_slope.toFixed(3)}
                    </AlertDescription>
                  </Alert>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Chart</CardTitle>
                    <CardDescription>
                      Solid line: Historical data | Dashed line: 3-month projection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GrowthChart data={chartData} />
                  </CardContent>
                </Card>

                {result.action_recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.action_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && (
              <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center text-muted-foreground">
                  <Baby className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter patient information and click Analyze to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
