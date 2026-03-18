"use client"

import { Label, RadialBar, RadialBarChart, PolarRadiusAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"

interface RiskGaugeProps {
  score: number
  maxScore?: number
}

const getRiskLevel = (score: number, maxScore: number = 100) => {
  const percentage = score / maxScore
  if (percentage < 0.33) return { level: "Low Risk", color: "#22c55e" } // green
  if (percentage < 0.66) return { level: "Moderate Risk", color: "#f59e0b" } // amber
  return { level: "High Risk", color: "#ef4444" } // red
}

export function RiskGauge({ score, maxScore = 100 }: RiskGaugeProps) {
  const risk = getRiskLevel(score, maxScore)
  const percentage = Math.min(Math.max(score / maxScore, 0), 1)

  const chartConfig = {
    score: {
      label: "Risk Score",
      color: risk.color,
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Risk Score</CardTitle>
        <CardDescription>Based on clinical indicators</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={[{ background: 100, score: percentage * 100 }]}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={130}
            barSize={20}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {score}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 15}
                          className="fill-muted-foreground text-sm"
                          fill={risk.color}
                        >
                          {risk.level}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            {/* Background bar (gray) */}
            <RadialBar
              dataKey="background"
              stackId="a"
              cornerRadius={10}
              fill="#e4e4e7"
              className="stroke-transparent stroke-2"
            />
            {/* Score bar (colored) */}
            <RadialBar
              dataKey="score"
              stackId="a"
              cornerRadius={10}
              fill={risk.color}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
