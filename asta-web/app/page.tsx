import Link from "next/link"
import { Activity, Baby, Apple } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">ASTA</h1>
              <p className="text-sm text-muted-foreground">
                AI Stunting Triage Assistant
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Clinical Decision Support</h2>
          <p className="text-muted-foreground">
            Select a module to begin analysis
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Link href="/growth" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Baby className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Growth Anomaly Detection</CardTitle>
                <CardDescription>
                  Analyze growth patterns and detect anomalies with 3-month projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Uses linear regression to predict weight trends and identify at-risk children
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/maternal" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Maternal Risk Scoring</CardTitle>
                <CardDescription>
                  Calculate maternal risk factors based on LILA, Hb, age, and BMI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evidence-based risk scoring with triage recommendations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/nutrition" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Apple className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Nutritional Gap Analysis</CardTitle>
                <CardDescription>
                  Assess dietary intake and identify nutritional gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Rule-based analysis with health score and WhatsApp-ready reports
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
