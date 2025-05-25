"use client"

import { useRef, useEffect } from "react"
import type { GithubLanguageStats } from "../../app/services/github-service"

interface DonutChartProps {
  data: GithubLanguageStats[]
  width?: number
  height?: number
  innerRadius?: number
  outerRadius?: number
  animationDuration?: number
}

export default function DonutChart({
  data,
  width = 300,
  height = 300,
  innerRadius = 70,
  outerRadius = 120,
  animationDuration = 1000,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with higher resolution for sharper rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Center of the chart
    const centerX = width / 2
    const centerY = height / 2

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.count, 0)

    // Animation variables
    let animationStartTime: number | null = null
    let animationProgress = 0

    // Function to draw the donut chart
    const drawDonut = (progress: number) => {
      ctx.clearRect(0, 0, width, height)

      // Draw background circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#0d1117"
      ctx.fill()

      // Draw segments
      let startAngle = -Math.PI / 2 // Start from top
      data.forEach((item) => {
        const segmentAngle = (item.count / total) * Math.PI * 2 * progress

        // Draw segment
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + segmentAngle)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()

        // Draw inner circle to create donut effect
        ctx.beginPath()
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
        ctx.fillStyle = "#0d1117"
        ctx.fill()

        // Calculate position for the label
        if (segmentAngle > 0.2) {
          // Only show label if segment is large enough
          const labelAngle = startAngle + segmentAngle / 2
          const labelRadius = (innerRadius + outerRadius) / 2
          const labelX = centerX + Math.cos(labelAngle) * labelRadius
          const labelY = centerY + Math.sin(labelAngle) * labelRadius

          // Draw label
          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(labelAngle + Math.PI / 2)
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = "bold 12px Arial"
          ctx.fillStyle = "#fff"
          ctx.fillText(item.language, 0, 0)
          ctx.restore()
        }

        startAngle += segmentAngle
      })

      // Draw center text
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#fff"
      ctx.fillText(`${data.length}`, centerX, centerY - 10)
      ctx.font = "12px Arial"
      ctx.fillText("Languages", centerX, centerY + 10)
    }

    // Animation function
    const animate = (timestamp: number) => {
      if (!animationStartTime) animationStartTime = timestamp
      const elapsed = timestamp - animationStartTime

      animationProgress = Math.min(elapsed / animationDuration, 1)
      drawDonut(animationProgress)

      if (animationProgress < 1) {
        requestAnimationFrame(animate)
      }
    }

    // Start animation
    requestAnimationFrame(animate)

    // Cleanup
    return () => {
      animationStartTime = null
    }
  }, [data, width, height, innerRadius, outerRadius, animationDuration])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="mx-auto"
      />
    </div>
  )
}
