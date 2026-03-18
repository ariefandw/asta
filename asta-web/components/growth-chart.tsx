"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { GrowthChartDataPoint } from "@/types"

interface GrowthChartProps {
  data: GrowthChartDataPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (value: any, name: any) => {
  const numValue = typeof value === "number" ? value : 0
  if (name === "Historical Weight") return [`${numValue.toFixed(1)} kg`, "Weight"]
  if (name === "Projected Weight") return [`${numValue.toFixed(1)} kg`, "Projected"]
  return [value, name]
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="age"
            label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
            stroke="#71717a"
          />
          <YAxis
            label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
            stroke="#71717a"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "0.5rem",
            }}
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Age: ${label} months`}
          />
          <Legend verticalAlign="top" wrapperStyle={{ paddingTop: "2px" }} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={2}
            name="Historical Weight"
            dot={{ fill: "#2563eb", r: 4 }}
            activeDot={{ r: 6, fill: "#2563eb" }}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Projected Weight"
            dot={{ fill: "#f59e0b", r: 4 }}
            activeDot={{ r: 6, fill: "#f59e0b" }}
            connectNulls={false}
            isAnimationActive={false}
            data={data.filter((d) => d.isProjection)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
