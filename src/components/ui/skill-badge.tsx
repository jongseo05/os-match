"use client"

import { X, Check } from "lucide-react"
import type { Skill } from "@/types/user"


interface SkillBadgeProps {
  skill: Skill
  onRemove?: () => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  showLevel?: boolean
}

export default function SkillBadge({
  skill,
  onRemove,
  size = "md",
  interactive = false,
  showLevel = false,
}: SkillBadgeProps) {
  // Get color based on category
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      language: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
      framework: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
      tool: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
      database: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
      cloud: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
    }

    return category in colors
      ? `${colors[category].bg} ${colors[category].text} ${colors[category].border}`
      : "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${getCategoryColor(
        skill.category,
      )} ${sizeClasses[size]} ${interactive ? "hover:bg-opacity-20 transition-colors" : ""}`}
    >
      <span className="font-medium">{skill.name}</span>

      {showLevel && <span className="text-xs opacity-80 border-l border-current pl-1.5 ml-0.5">{skill.level}</span>}

      {skill.githubVerified && (
        <span className="inline-flex items-center" title="Verified from GitHub">
          <Check className="w-3 h-3 text-emerald-400" />
        </span>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 rounded-full hover:bg-gray-700 transition-colors"
          aria-label={`Remove ${skill.name} skill`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
