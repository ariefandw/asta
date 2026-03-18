"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RiskGauge } from "@/components/risk-gauge"
import { calculateMaternalRisk } from "@/lib/api"
import type { MaternalRiskResponse } from "@/types"

export default function MaternalPage() {
  const [patientId, setPatientId] = useState("")
  const [age, setAge] = useState("")
  const [lila, setLila] = useState("")
  const [hbLevel, setHbLevel] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MaternalRiskResponse | null>(null)

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
      case "low risk":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "moderate":
      case "moderate risk":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "high":
      case "high risk":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  const getTriageStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "routine":
        return "default"
      case "priority":
        return "secondary"
      case "urgent":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await calculateMaternalRisk({
        patient_id: patientId,
        age: parseInt(age),
        lila_cm: parseFloat(lila),
        hb_level: parseFloat(hbLevel),
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate risk score")
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
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Maternal Risk Scoring</h1>
              <p className="text-sm text-muted-foreground">
                Calculate maternal risk factors based on clinical indicators
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
              <CardDescription>Enter maternal health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    placeholder="e.g., M-001"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lila">LILA (cm)</Label>
                    <Input
                      id="lila"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 24.5"
                      value={lila}
                      onChange={(e) => setLila(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      &lt;23.5 cm indicates risk
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hbLevel">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hbLevel"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10.5"
                      value={hbLevel}
                      onChange={(e) => setHbLevel(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      &lt;11 g/dL indicates anemia
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 55"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 160"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Calculating..." : "Calculate Risk Score"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                <RiskGauge score={result.total_score} maxScore={100} />

                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Risk Level</p>
                        <Badge className={getRiskLevelColor(result.risk_level)}>
                          {result.risk_level}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Triage Status</p>
                        <Badge variant={getTriageStatusColor(result.triage_status) as any}>
                          {result.triage_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t mt-4 pt-4 text-center">
                      <p className="text-sm text-muted-foreground">Calculated BMI</p>
                      <p className="text-2xl font-bold">{result.calculated_bmi.toFixed(1)}</p>
                    </div>
                  </CardContent>
                </Card>

                {result.risk_factors_list.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Identified Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.risk_factors_list.map((factor, index) => (
                          <Badge key={index} variant="outline">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.summary_text && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{result.summary_text}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && (
              <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter maternal health indicators and click Calculate to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
