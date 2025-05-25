"use client"

import { useEffect, useState } from "react"

interface AnimatedProgressProps {
  value: number
  max?: number
  color?: string
  height?: number
  width?: number
  duration?: number
  label?: string
  showValue?: boolean
}

export default function AnimatedProgress({
  value,
  max = 100,
  color = "emerald",
  height = 8,
  width,
  duration = 1000,
  label,
  showValue = true,
}: AnimatedProgressProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const endValue = Math.min(value, max)

    const updateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setCurrentValue(easedProgress * endValue)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    requestAnimationFrame(updateValue)
  }, [value, max, duration])

  const percentage = (currentValue / max) * 100

  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    green: "bg-green-500",
  }

  const bgColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald
  return (
    <div className={width ? "" : "w-full"} style={width ? { width: `${width}px` } : {}}>
      {label && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
          <span>{label}</span>
          {showValue && <span>{Math.round(currentValue)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-900/60 rounded-full overflow-hidden" style={{ height: `${height}px` }}>
        <div
          className={`${bgColorClass} rounded-full transition-all`}
          style={{
            width: `${percentage}%`,
            height: "100%",
            boxShadow: `0 0 10px ${color === "emerald" ? "#10b981" : ""}`,
          }}
        />
      </div>
    </div>
  )
}
