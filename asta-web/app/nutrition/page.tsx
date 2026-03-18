"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Apple, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { FoodIcons } from "@/components/food-icons"
import { analyzeNutritionalGap } from "@/lib/api"
import type { NutritionalGapResponse } from "@/types"

export default function NutritionPage() {
  const [patientId, setPatientId] = useState("")
  const [ageMonths, setAgeMonths] = useState("")
  const [hasProtein, setHasProtein] = useState(false)
  const [hasVegetables, setHasVegetables] = useState(false)
  const [hasCarbs, setHasCarbs] = useState(false)
  const [hasFats, setHasFats] = useState(true)
  const [mealFrequency, setMealFrequency] = useState("3")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<NutritionalGapResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (result?.whatsapp_copypaste_text) {
      navigator.clipboard.writeText(result.whatsapp_copypaste_text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await analyzeNutritionalGap({
        patient_id: patientId,
        age_months: parseInt(ageMonths),
        daily_intake: {
          has_animal_protein: hasProtein,
          has_vegetables: hasVegetables,
          has_carbs: hasCarbs,
          has_fats: hasFats,
          meal_frequency: parseInt(mealFrequency),
        },
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze nutritional gap")
    } finally {
      setLoading(false)
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 5) return "text-yellow-600"
    return "text-destructive"
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 8) return "Good"
    if (score >= 5) return "Moderate"
    return "Poor"
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
            <Apple className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Nutritional Gap Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Assess dietary intake and identify nutritional gaps
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
              <CardDescription>Enter child&apos;s dietary intake information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      placeholder="e.g., N-001"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageMonths">Age (months)</Label>
                    <Input
                      id="ageMonths"
                      type="number"
                      placeholder="e.g., 12"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Daily Food Intake</Label>
                  <div className="grid gap-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasProtein}
                        onChange={(e) => setHasProtein(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Animal Protein (meat, fish, chicken)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasVegetables}
                        onChange={(e) => setHasVegetables(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Vegetables</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasCarbs}
                        onChange={(e) => setHasCarbs(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Carbohydrates (rice, porridge, bread)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasFats}
                        onChange={(e) => setHasFats(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Fats (oil, butter, coconut milk)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mealFrequency">Meal Frequency (per day)</Label>
                  <Input
                    id="mealFrequency"
                    type="number"
                    min="1"
                    max="10"
                    value={mealFrequency}
                    onChange={(e) => setMealFrequency(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 3+ meals per day for children over 6 months
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Nutrition"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                {result.has_gap ? (
                  <Alert variant="destructive">
                    <AlertTitle>Nutritional Gap Detected</AlertTitle>
                    <AlertDescription>
                      Child may not be receiving adequate nutrition for optimal growth.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTitle>No Nutritional Gap</AlertTitle>
                    <AlertDescription>
                      Child&apos;s nutritional intake appears adequate for their age.
                    </AlertDescription>
                  </Alert>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Health Score</CardTitle>
                    <CardDescription>Based on dietary intake assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <div className={`text-6xl font-bold ${getHealthScoreColor(result.health_score_out_of_10)}`}>
                      {result.health_score_out_of_10}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      out of 10
                    </div>
                    <Badge className="mt-3" variant="outline">
                      {getHealthScoreLabel(result.health_score_out_of_10)} Nutrition
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Food Groups Status</CardTitle>
                    <CardDescription>Visual representation of food group intake</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FoodIcons iconStates={result.ui_icon_states} />
                  </CardContent>
                </Card>

                {result.whatsapp_copypaste_text && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>WhatsApp Report</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <CardDescription>Ready to send to healthcare provider</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        readOnly
                        value={result.whatsapp_copypaste_text}
                        className="min-h-32 resize-none font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && (
              <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center text-muted-foreground">
                  <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter dietary intake information and click Analyze to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
