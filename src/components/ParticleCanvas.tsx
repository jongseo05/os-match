"use client"

import { useRef, useEffect, useState } from "react"

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      // Set explicit dimensions to ensure canvas has height and width
      canvas.width = window.innerWidth || 1000
      canvas.height = window.innerHeight || 800

      // Force a minimum size to prevent zero height
      if (canvas.height <= 0) canvas.height = 800
      if (canvas.width <= 0) canvas.width = 1000

      setIsMobile(window.innerWidth < 768)
      setCanvasReady(true)
    }

    // Initial size update
    updateCanvasSize()

    let particles: {
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      life: number
    }[] = []

    let textImageData: ImageData | null = null

    function createTextImage() {
      if (!ctx || !canvas || !canvasReady) return 0

      // Clear the canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.save()

      // Ensure we have valid dimensions
      const logoHeight = isMobile ? 80 : 160 // Increased size for better visibility

      // Center the OS-Match text
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Draw OS-Match text
      const osMatchScale = logoHeight / 40
      ctx.scale(osMatchScale, osMatchScale)

      // Center align the text
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Use a bolder font for better visibility
      ctx.font = "bold 36px Arial"
      ctx.fillText("OS-Match", 0, 0)

      ctx.restore()

      try {
        // Get image data with error handling
        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      } catch (error) {
        console.error("Error getting image data:", error)
        // Create a fallback image data if needed
        textImageData = ctx.createImageData(canvas.width, canvas.height)
      }

      return osMatchScale
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        // Make sure we're within bounds
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4
          if (index >= 0 && index < data.length && data[index + 3] > 128) {
            return {
              x: x,
              y: y,
              baseX: x,
              baseY: y,
              size: Math.random() * 1 + 0.5,
              life: Math.random() * 100 + 50,
            }
          }
        }
      }

      // If we couldn't find a valid position, create a random particle
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        size: Math.random() * 1 + 0.5,
        life: Math.random() * 100 + 50,
      }
    }

    function createInitialParticles() {
      if (!canvas || !ctx) return;
      
      const baseParticleCount = 5000 // Reduced for better performance
      // canvas 크기를 확인하고 안전하게 계산
      const canvasArea = (canvas.width || 1) * (canvas.height || 1);
      const referenceArea = 1920 * 1080;
      const scaleFactor = Math.sqrt(canvasArea / referenceArea);
      const particleCount = Math.floor(baseParticleCount * scaleFactor);
      
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle()
        if (particle) particles.push(particle)
      }
    }

    let animationFrameId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // 파티클은 항상 원래 위치에 고정 (커서 효과 제거)
        p.x = p.baseX
        p.y = p.baseY

        // 항상 흰색으로 유지
        ctx.fillStyle = "white"
        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle()
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 5000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle()
        if (newParticle) particles.push(newParticle)
      }

      animationFrameId = requestAnimationFrame(() => animate())
    }

    // Wait for canvas to be ready before initializing
    if (canvasReady) {
      createTextImage()
      createInitialParticles()
      animate()
    }

    const handleResize = () => {
      updateCanvasSize()
      if (canvasReady) {
        createTextImage()
        particles = []
        createInitialParticles()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile, canvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute top-0 left-0"
      aria-label="Particle effect with OS-Match logo"
    />
  )
}
