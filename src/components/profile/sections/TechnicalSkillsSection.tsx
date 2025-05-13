"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { UserData, Skill } from "../../../types/user"
import { Plus, X } from "lucide-react"

interface TechnicalSkillsSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function TechnicalSkillsSection({ userData, onUpdate }: TechnicalSkillsSectionProps) {
  const [skills, setSkills] = useState<Skill[]>(userData.skills)
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate")
  const [newSkillCategory, setNewSkillCategory] = useState("language")
  const [newSkillProficiency, setNewSkillProficiency] = useState(50)
  const [isEditing, setIsEditing] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const radarChartRef = useRef<HTMLCanvasElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ skills })
    setIsEditing(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([
        ...skills,
        {
          name: newSkill.trim(),
          level: newSkillLevel,
          category: newSkillCategory,
          proficiency: newSkillProficiency,
        },
      ])
      setNewSkill("")
      setNewSkillProficiency(50)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill.name !== skillToRemove))
  }

  const skillLevels = ["Beginner", "Intermediate", "Expert"]
  const skillCategories = [
    { value: "language", label: "Programming Language", color: "#58a6ff" },
    { value: "framework", label: "Framework", color: "#8957e5" },
    { value: "tool", label: "Tool", color: "#f0883e" },
    { value: "database", label: "Database", color: "#f85149" },
    { value: "cloud", label: "Cloud Service", color: "#3fb950" },
  ]

  const getCategoryColor = (category: string): string => {
    const found = skillCategories.find((c) => c.value === category)
    return found ? found.color : "#58a6ff"
  }

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>,
  )

  // Draw radar chart
  useEffect(() => {
    const canvas = radarChartRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with higher resolution for sharper rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) * 0.75

    // Draw background
    ctx.fillStyle = "#0d1117"
    ctx.fillRect(0, 0, width, height)

    // Draw radar grid with subtle gradient
    const levels = 5
    const levelOpacityStep = 0.7 / levels

    for (let i = 1; i <= levels; i++) {
      const ratio = i / levels
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * ratio, 0, 2 * Math.PI)

      // Create gradient for grid levels
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * ratio)
      gradient.addColorStop(0, `rgba(31, 111, 235, ${0.05 + levelOpacityStep * i})`)
      gradient.addColorStop(1, `rgba(31, 111, 235, ${0.02 + (levelOpacityStep * i) / 2})`)

      ctx.fillStyle = gradient
      ctx.fill()

      ctx.strokeStyle = `rgba(48, 54, 61, ${0.3 + ratio * 0.4})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Get top skills from each category (max 3 per category)
    const topSkills: Skill[] = []
    Object.values(skillsByCategory).forEach((categorySkills) => {
      // Sort by proficiency (highest first)
      const sorted = [...categorySkills].sort((a, b) => b.proficiency - a.proficiency)
      // Take top 3
      topSkills.push(...sorted.slice(0, 3))
    })

    if (topSkills.length === 0) return

    // Calculate angles for each skill
    const angleStep = (2 * Math.PI) / topSkills.length

    // Draw axes with subtle glow
    topSkills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2 // Start from top (subtract PI/2)

      // Draw axis line with gradient
      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
      )
      gradient.addColorStop(0, "rgba(48, 54, 61, 0.2)")
      gradient.addColorStop(1, "rgba(48, 54, 61, 0.8)")

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw skill label with better positioning
      const labelRadius = radius + 15
      const labelX = centerX + labelRadius * Math.cos(angle)
      const labelY = centerY + labelRadius * Math.sin(angle)

      ctx.save()
      ctx.translate(labelX, labelY)

      // Rotate text based on position for better readability
      if (angle > Math.PI / 2 && angle < (Math.PI * 3) / 2) {
        ctx.rotate(angle + Math.PI)
        ctx.textAlign = "right"
      } else {
        ctx.rotate(angle)
        ctx.textAlign = "left"
      }

      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
      ctx.shadowBlur = 3
      ctx.fillStyle = getCategoryColor(skill.category)
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
      ctx.textBaseline = "middle"
      ctx.fillText(skill.name, 0, 0)
      ctx.restore()
    })

    // Draw data polygon with gradient fill
    ctx.beginPath()
    topSkills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2 // Start from top
      const pointRadius = radius * (skill.proficiency / 100)
      const x = centerX + pointRadius * Math.cos(angle)
      const y = centerY + pointRadius * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    // Close the path
    const firstSkill = topSkills[0]
    const firstAngle = -Math.PI / 2 // Start from top
    const firstPointRadius = radius * (firstSkill.proficiency / 100)
    ctx.lineTo(centerX + firstPointRadius * Math.cos(firstAngle), centerY + firstPointRadius * Math.sin(firstAngle))

    // Create gradient fill for the radar area
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "rgba(56, 139, 253, 0.7)")
    gradient.addColorStop(0.7, "rgba(56, 139, 253, 0.2)")
    gradient.addColorStop(1, "rgba(56, 139, 253, 0.05)")

    // Fill with gradient
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw glowing outline
    ctx.strokeStyle = "rgba(56, 139, 253, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Add outer glow effect
    ctx.shadowColor = "rgba(56, 139, 253, 0.5)"
    ctx.shadowBlur = 10
    ctx.strokeStyle = "rgba(56, 139, 253, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw data points with glowing effect
    topSkills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2 // Start from top
      const pointRadius = radius * (skill.proficiency / 100)
      const x = centerX + pointRadius * Math.cos(angle)
      const y = centerY + pointRadius * Math.sin(angle)

      // Draw glow
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.fill()

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = getCategoryColor(skill.category)
      ctx.fill()

      // Add highlight
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.fill()

      // Add skill percentage near the point
      const percentX = x + (x > centerX ? 10 : -10)
      const percentY = y + (y > centerY ? 10 : -10)

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
      ctx.textAlign = x > centerX ? "left" : "right"
      ctx.textBaseline = y > centerY ? "top" : "bottom"
      ctx.fillText(`${skill.proficiency}%`, percentX, percentY)    })

    // Add center point with glow
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(56, 139, 253, 0.8)";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
  }, [skills, skillsByCategory, getCategoryColor])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#e6edf3] mb-2">Technical Skills</h2>
        <p className="text-[#8b949e]">
          Add your technical skills to help us match you with suitable projects and collaborators.
        </p>
      </div>

      {/* Skill Visualization */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
        <h3 className="text-lg font-medium text-[#e6edf3] mb-4">Skill Radar</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <canvas ref={radarChartRef} className="w-full h-64"></canvas>
          </div>
          <div className="md:w-1/2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#c9d1d9]">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {skillCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(activeCategory === category.value ? null : category.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      activeCategory === category.value
                        ? `bg-${category.color}/20 text-${category.color} border-${category.color}/30`
                        : "bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]"
                    }`}
                    style={{
                      backgroundColor: activeCategory === category.value ? `${category.color}20` : undefined,
                      color: activeCategory === category.value ? category.color : undefined,
                      borderColor: activeCategory === category.value ? `${category.color}30` : undefined,
                    }}
                  >
                    {category.label}s
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3 max-h-40 overflow-y-auto pr-2">
                {Object.entries(skillsByCategory)
                  .filter(([category]) => !activeCategory || category === activeCategory)
                  .map(([category, categorySkills]) => (
                    <div key={category}>
                      {activeCategory === null && (
                        <h5
                          className="text-sm font-medium text-[#c9d1d9] mb-2"
                          style={{ color: getCategoryColor(category) }}
                        >
                          {skillCategories.find((c) => c.value === category)?.label || category}
                        </h5>
                      )}
                      {categorySkills.map((skill) => (
                        <div key={skill.name} className="flex items-center mb-2">
                          <span className="text-sm text-[#c9d1d9] flex-1">{skill.name}</span>
                          <div className="w-24 h-2 bg-[#21262d] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${skill.proficiency}%`,
                                backgroundColor: getCategoryColor(category),
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#0d1117] border border-[#30363d] rounded-md p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: `${getCategoryColor(skill.category)}20`,
                    color: getCategoryColor(skill.category),
                    borderColor: `${getCategoryColor(skill.category)}30`,
                  }}
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.name)}
                    className="ml-1 text-[#8b949e] hover:text-[#c9d1d9]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="newSkill" className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Add Skill
                </label>
                <input
                  id="newSkill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md shadow-sm text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb] sm:text-sm"
                  placeholder="e.g., JavaScript, React, AWS"
                />
              </div>

              <div>
                <label htmlFor="skillCategory" className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Category
                </label>
                <select
                  id="skillCategory"
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md shadow-sm text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb] sm:text-sm"
                >
                  {skillCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="skillLevel" className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Skill Level
                </label>
                <select
                  id="skillLevel"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md shadow-sm text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb] sm:text-sm"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skillProficiency" className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Proficiency: {newSkillProficiency}%
                </label>
                <input
                  id="skillProficiency"
                  type="range"
                  min="10"
                  max="100"
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#1f6feb]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm font-medium text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-colors duration-200"
              disabled={!newSkill.trim()}
            >
              <Plus className="w-4 h-4 inline-block mr-1" /> Add Skill
            </button>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded-md hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1117] focus:ring-[#238636]"
            >
              Save Skills
            </button>
            <button
              type="button"
              onClick={() => {
                setSkills(userData.skills)
                setIsEditing(false)
              }}
              className="px-4 py-2 bg-[#21262d] text-[#c9d1d9] text-sm font-medium border border-[#30363d] rounded-md hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1117] focus:ring-[#1f6feb]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm font-medium text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-colors duration-200"
          >
            Edit Technical Skills
          </button>
        </div>
      )}
    </div>
  )
}
