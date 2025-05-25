"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import type { GithubLanguageStats } from "../../app/services/github-service"

interface EnhancedDonutChartProps {
  data: GithubLanguageStats[]
  width?: number
  height?: number
  innerRadius?: number
  outerRadius?: number
  animationDuration?: number
  onSegmentHover?: (language: string | null) => void
}

export default function EnhancedDonutChart({
  data,
  width = 300,
  height = 300,
  innerRadius = 70,
  outerRadius = 120,
  animationDuration = 1500,
  onSegmentHover,
}: EnhancedDonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)

  // Store segment angles for hover detection
  const segmentAnglesRef = useRef<Array<{ language: string; startAngle: number; endAngle: number }>>([])

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
    segmentAnglesRef.current = []

    // Function to draw the donut chart
    const drawDonut = (progress: number) => {
      ctx.clearRect(0, 0, width, height)

      // Draw background circle with subtle gradient
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius)
      bgGradient.addColorStop(0, "#0d1117")
      bgGradient.addColorStop(1, "#0a0c10")

      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius + 5, 0, Math.PI * 2)
      ctx.fillStyle = bgGradient
      ctx.fill()

      // Draw segments
      let startAngle = -Math.PI / 2 // Start from top

      // Clear segment angles if we're redrawing
      if (progress === 0) {
        segmentAnglesRef.current = []
      }

      data.forEach((item) => {
        const segmentAngle = (item.count / total) * Math.PI * 2 * progress
        const endAngle = startAngle + segmentAngle

        // Store segment angles for hover detection
        if (progress === 1) {
          segmentAnglesRef.current.push({
            language: item.language,
            startAngle,
            endAngle,
          })
        }

        // Draw segment with gradient
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
        ctx.closePath()

        // Create gradient for segment
        const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius)
        const baseColor = item.color
        gradient.addColorStop(0, baseColor + "99") // Semi-transparent
        gradient.addColorStop(1, baseColor)

        ctx.fillStyle = gradient
        ctx.fill()

        // Add highlight to segment edge
        if (hoveredSegment === item.language) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
          ctx.lineWidth = 2
          ctx.strokeStyle = "#ffffff"
          ctx.stroke()
        }

        startAngle = endAngle
      })

      // Draw inner circle to create donut effect with gradient
      const innerGradient = ctx.createRadialGradient(centerX, centerY, innerRadius * 0.7, centerX, centerY, innerRadius)
      innerGradient.addColorStop(0, "#0d1117")
      innerGradient.addColorStop(1, "#161b22")

      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
      ctx.fillStyle = innerGradient
      ctx.fill()

      // Add subtle inner shadow
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = "#0a0c10"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.shadowColor = "transparent"

      // Draw center text
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Draw total languages count
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
      ctx.fillStyle = "#e6edf3"
      ctx.fillText(`${data.length}`, centerX, centerY - 15)

      // Draw "Languages" text
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
      ctx.fillStyle = "#8b949e"
      ctx.fillText("Languages", centerX, centerY + 15)

      // If a segment is hovered, show its percentage
      if (hoveredSegment) {
        const hoveredItem = data.find((item) => item.language === hoveredSegment)
        if (hoveredItem) {
          ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
          ctx.fillStyle = "#58a6ff"
          ctx.fillText(`${hoveredItem.percentage.toFixed(1)}%`, centerX, centerY + 35)
        }
      }
    }

    // Animation function
    const animate = (timestamp: number) => {
      if (!animationStartTime) animationStartTime = timestamp
      const elapsed = timestamp - animationStartTime

      animationProgress = Math.min(elapsed / animationDuration, 1)

      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - animationProgress, 3)

      drawDonut(easedProgress)

      if (animationProgress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    // Start animation
    setIsAnimating(true)
    requestAnimationFrame(animate)

    // Cleanup
    return () => {
      animationStartTime = null
    }
  }, [data, width, height, innerRadius, outerRadius, animationDuration, hoveredSegment])

  // Handle mouse move to detect hover on segments
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnimating || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert to canvas coordinates
    const dpr = window.devicePixelRatio || 1
    const canvasX = x * dpr
    const canvasY = y * dpr

    // Calculate distance from center
    const centerX = (width * dpr) / 2
    const centerY = (height * dpr) / 2
    const distance = Math.sqrt(Math.pow(canvasX - centerX, 2) + Math.pow(canvasY - centerY, 2))

    // Check if within donut area
    if (distance > innerRadius * dpr && distance < outerRadius * dpr) {
      // Calculate angle
      let angle = Math.atan2(canvasY - centerY, canvasX - centerX)

      // Adjust angle to start from top (-PI/2) and go clockwise
      if (angle < -Math.PI / 2) {
        angle = angle + 2 * Math.PI
      } else {
        angle = angle + Math.PI / 2
      }

      if (angle < 0) {
        angle += 2 * Math.PI
      }

      // Find segment at this angle
      const segment = segmentAnglesRef.current.find((seg) => angle >= seg.startAngle && angle <= seg.endAngle)

      if (segment) {
        if (hoveredSegment !== segment.language) {
          setHoveredSegment(segment.language)
          if (onSegmentHover) onSegmentHover(segment.language)
        }
      } else {
        setHoveredSegment(null)
        if (onSegmentHover) onSegmentHover(null)
      }
    } else {
      setHoveredSegment(null)
      if (onSegmentHover) onSegmentHover(null)
    }
  }

  const handleMouseLeave = () => {
    setHoveredSegment(null)
    if (onSegmentHover) onSegmentHover(null)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="mx-auto cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}
