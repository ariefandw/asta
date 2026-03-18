"use client"

import { Beef, Egg, Wheat, Leaf } from "lucide-react"

interface FoodIconsProps {
  iconStates: Record<string, string>
}

export function FoodIcons({ iconStates }: FoodIconsProps) {
  const foods = [
    { key: "protein", icon: Beef, label: "Protein", color: "text-red-500" },
    { key: "egg", icon: Egg, label: "Egg", color: "text-amber-500" },
    { key: "carbs", icon: Wheat, label: "Carbs", color: "text-yellow-600" },
    { key: "vegetables", icon: Leaf, label: "Vegetables", color: "text-green-500" },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
      {foods.map((food) => {
        const Icon = food.icon
        const isActive = iconStates[food.key] === "active"

        return (
          <div key={food.key} className="flex flex-col items-center gap-2">
            <div
              className={`
                h-16 w-16 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isActive ? food.color + " bg-current/10 scale-110" : "bg-muted text-muted-foreground"}
              `}
            >
              <Icon className="h-8 w-8" />
            </div>
            <span className="text-xs text-center">{food.label}</span>
          </div>
        )
      })}
    </div>
  )
}
