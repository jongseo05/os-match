"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, RefreshCw, Github, AlertCircle, Code, X, ExternalLink, Search } from "lucide-react"
import type { UserData, Skill } from "@/types/user"
import EnhancedDonutChart from "../../charts/EnhancedDonutChart"
import SkillBadge from "@/components/ui/skill-badge"
import AnimatedProgress from "@/components/ui/animated-progress"
import {
  fetchGithubRepositories,
  analyzeGithubRepositories,
  generateSkillTags,
  type GithubRepository,
  type GithubUserStats,
} from "../../../app/services/github-service"

interface TechnicalSkillsSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
  updateUserGithubUsername: (username: string | null) => void; // Add this line
}

export default function TechnicalSkillsSection({ userData, onUpdate, updateUserGithubUsername }: TechnicalSkillsSectionProps) {
  // Skills state
  const [skills, setSkills] = useState<Skill[]>(userData.skills || [])
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>(skills)
  const [skillSearch, setSkillSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate")
  const [newSkillCategory, setNewSkillCategory] = useState("language")
  const [newSkillProficiency, setNewSkillProficiency] = useState(50)

  // GitHub integration states
  const [isGithubConnected, setIsGithubConnected] = useState(userData.githubConnected || false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GithubRepository[]>([])
  const [githubStats, setGithubStats] = useState<GithubUserStats | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null)

  // UI states
  const [activeTab, setActiveTab] = useState<"overview" | "github" | "manage">("overview")
  const [showGithubConnectPrompt, setShowGithubConnectPrompt] = useState(!isGithubConnected)
  const skillInputRef = useRef<HTMLInputElement>(null)

  // Filter skills when search or category changes
  useEffect(() => {
    let result = [...skills]

    if (skillSearch) {
      const searchLower = skillSearch.toLowerCase()
      result = result.filter((skill) => skill.name.toLowerCase().includes(searchLower))
    }

    if (selectedCategory) {
      result = result.filter((skill) => skill.category === selectedCategory)
    }

    setFilteredSkills(result)
  }, [skills, skillSearch, selectedCategory])

  // Fetch GitHub data on initial load if connected
  useEffect(() => {
    if (isGithubConnected && userData.githubUsername) {
      fetchGithubData(userData.githubUsername)
    }
  }, [isGithubConnected, userData.githubUsername])

  // Focus input when adding skill
  useEffect(() => {
    if (isAddingSkill && skillInputRef.current) {
      skillInputRef.current.focus()
    }
  }, [isAddingSkill])

  // Function to fetch and analyze GitHub data
  const fetchGithubData = async (username: string) => {
    setIsAnalyzing(true)
    setAnalyzeError(null)

    try {
      const repos = await fetchGithubRepositories(username)
      setGithubRepos(repos)

      const stats = analyzeGithubRepositories(repos)
      setGithubStats(stats)

      // Generate skill tags from GitHub data
      const generatedSkills = generateSkillTags(repos)

      // Merge with existing skills, avoiding duplicates
      const existingSkillNames = skills.map((skill) => skill.name.toLowerCase())
      const newSkills = generatedSkills.filter((skill) => !existingSkillNames.includes(skill.name.toLowerCase()))

      // Update existing skills with GitHub data if they exist
      const updatedExistingSkills = skills.map((skill) => {
        const githubSkill = generatedSkills.find((gs) => gs.name.toLowerCase() === skill.name.toLowerCase())

        if (githubSkill) {
          return {
            ...skill,
            proficiency: Math.max(skill.proficiency || 0, githubSkill.proficiency),
            githubVerified: true,
          }
        }

        return skill
      })

      // Combine updated existing skills with new skills
      const mergedSkills = [...updatedExistingSkills, ...newSkills]
      setSkills(mergedSkills)

      // Update user data
      onUpdate({
        skills: mergedSkills,
        githubLastAnalyzed: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
      setAnalyzeError("Failed to analyze GitHub repositories. Please try again later.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) {
      const updatedSkills = [
        ...skills,
        {
          name: newSkill.trim(),
          level: newSkillLevel,
          category: newSkillCategory,
          proficiency: newSkillProficiency,
          manuallyAdded: true,
        },
      ]

      setSkills(updatedSkills)
      onUpdate({ skills: updatedSkills })

      // Reset form
      setNewSkill("")
      setNewSkillProficiency(50)
      setIsAddingSkill(false)
    }
  }

  const handleRemoveSkill = (skillName: string) => {
    const updatedSkills = skills.filter((skill) => skill.name !== skillName)
    setSkills(updatedSkills)
    onUpdate({ skills: updatedSkills })
  }

  const handleReanalyzeGithub = () => {
    if (userData.githubUsername) {
      fetchGithubData(userData.githubUsername)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const skillLevels = ["Beginner", "Intermediate", "Expert"]
  const skillCategories = [
    { value: "language", label: "Programming Language", color: "blue" },
    { value: "framework", label: "Framework", color: "purple" },
    { value: "tool", label: "Tool", color: "orange" },
    { value: "database", label: "Database", color: "red" },
    { value: "cloud", label: "Cloud Service", color: "green" },
  ]

  // Get top skills for each category
  const getTopSkillsByCategory = (category: string, limit = 3): Skill[] => {
    return skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
      .slice(0, limit)
  }

  // Get color for category
  const getCategoryColor = (category: string): string => {
    const found = skillCategories.find((c) => c.value === category)
    return found ? found.color : "blue"
  }

  const handleConnectGithub = async () => {
    if (userData.githubUsername) {
      await fetchGithubData(userData.githubUsername);
    } else {
      // If no username, maybe prompt the user or use the updateUserGithubUsername function
      // For now, let's assume we want to prompt for a username if it's missing.
      const newUsername = prompt("Please enter your GitHub username:");
      if (newUsername) {
        updateUserGithubUsername(newUsername); // Update in store and parent
        await fetchGithubData(newUsername); // Fetch data with new username
      } else {
        setAnalyzeError("GitHub username is required to connect.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Technical Skills</h2>
        <p className="text-gray-400">
          Showcase your technical expertise to help us match you with suitable projects and collaborators.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "overview"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`py-2 px-4 text-sm font-medium border-b-2 flex items-center ${
              activeTab === "github"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
            }`}
          >
            <Github className="w-3.5 h-3.5 mr-1.5" />
            GitHub Analysis
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`py-2 px-4 text-sm font-medium border-b-2 flex items-center ${
              activeTab === "manage"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
            }`}
          >
            <Code className="w-3.5 h-3.5 mr-1.5" />
            Manage Skills
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Skills Overview */}
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Skills Overview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("manage")}
                  className="px-3 py-1.5 bg-gray-900/60 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Skills
                </button>
              </div>
            </div>

            <div className="p-5">
              {skills.length > 0 ? (
                <div className="space-y-6">
                  {/* Top Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Your Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills
                        .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
                        .slice(0, 8)
                        .map((skill) => (
                          <SkillBadge key={skill.name} skill={skill} size="md" showLevel={true} />
                        ))}
                    </div>
                  </div>

                  {/* Skills by Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillCategories.map((category) => {
                      const categorySkills = getTopSkillsByCategory(category.value)
                      if (categorySkills.length === 0) return null

                      return (
                        <div key={category.value} className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">{category.label}s</h4>
                          <div className="space-y-3">
                            {categorySkills.map((skill) => (                              <div key={skill.name} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-white">{skill.name}</span>
                                  <span className="text-xs text-gray-400">{skill.level}</span>
                                </div>
                                <AnimatedProgress
                                  value={skill.proficiency || 50}
                                  color={getCategoryColor(category.value)}
                                  height={6}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Code className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-2">No skills added yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-4">
                    Add your technical skills manually or connect your GitHub account to automatically analyze your
                    repositories.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={() => setActiveTab("manage")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 rounded-md text-sm font-medium"
                    >
                      Add Skills Manually
                    </button>
                    {!isGithubConnected && (
                      <button
                        onClick={() => {
                          setIsGithubConnected(true)
                          setActiveTab("github")
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300 rounded-md text-sm font-medium flex items-center justify-center"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Connect GitHub
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GitHub Stats Summary (if connected) */}
          {isGithubConnected && githubStats && (
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-2 text-gray-400" />
                  <h3 className="text-lg font-medium text-white">GitHub Activity</h3>
                </div>
                <button
                  onClick={() => setActiveTab("github")}
                  className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  View Details
                </button>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Repositories</p>
                    <p className="text-2xl font-bold text-white">{githubStats.totalRepos}</p>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Avg. Stars</p>
                    <p className="text-2xl font-bold text-white">{githubStats.averageStars.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Last Activity</p>
                    <p className="text-sm font-medium text-white">{formatDate(githubStats.lastActivityDate)}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Top Languages</h4>
                    <div className="space-y-3">
                      {githubStats.languages.slice(0, 4).map((lang) => (
                        <div
                          key={lang.language}
                          className={`flex items-center ${hoveredLanguage === lang.language ? "bg-gray-800/30 rounded" : ""}`}
                        >
                          <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lang.color }}></span>
                          <span className="text-sm text-white flex-1">{lang.language}</span>
                          <span className="text-xs text-gray-400 mr-2">{lang.count} repos</span>
                          <AnimatedProgress
                            value={lang.percentage}
                            max={100}
                            height={6}
                            width={100}
                            showValue={false}
                          />
                          <span className="text-xs text-gray-400 ml-2 w-12 text-right">
                            {lang.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-1/2 flex justify-center">
                    <EnhancedDonutChart
                      data={githubStats.languages}
                      width={200}
                      height={200}
                      innerRadius={50}
                      outerRadius={80}
                      onSegmentHover={setHoveredLanguage}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GitHub Analysis Tab */}
      {activeTab === "github" && (
        <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center">
              <Github className="w-4 h-4 mr-2 text-gray-400" />
              <h3 className="text-lg font-medium text-white">GitHub Skills Analysis</h3>
            </div>
            {isGithubConnected && userData.githubLastAnalyzed && (
              <div className="text-xs text-gray-500">Last analyzed: {formatDate(userData.githubLastAnalyzed)}</div>
            )}
          </div>

          <div className="p-5">
            {isGithubConnected ? (
              <>
                {analyzeError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{analyzeError}</p>
                  </div>
                )}

                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Analyzing GitHub Repositories</h3>
                    <p className="text-gray-400 max-w-md text-center">
                      We're analyzing your public repositories to extract skills and language usage patterns. This may
                      take a moment.
                    </p>
                  </div>
                ) : githubStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Repositories</h4>
                          <span className="text-2xl font-bold text-white">{githubStats.totalRepos}</span>
                        </div>
                        <p className="text-xs text-gray-500">Total number of public repositories analyzed</p>
                      </div>

                      <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Average Stars</h4>
                          <span className="text-2xl font-bold text-white">{githubStats.averageStars.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Average star count across all repositories</p>
                      </div>

                      <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Last Activity</h4>
                          <span className="text-sm font-medium text-white">
                            {formatDate(githubStats.lastActivityDate)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Date of most recent repository update</p>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Language Distribution */}
                      <div className="lg:w-1/2">
                        <h4 className="text-sm font-medium text-gray-300 mb-4">Language Distribution</h4>
                        <div className="flex justify-center mb-6">
                          <EnhancedDonutChart
                            data={githubStats.languages}
                            width={250}
                            height={250}
                            innerRadius={60}
                            outerRadius={100}
                            onSegmentHover={setHoveredLanguage}
                          />
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {githubStats.languages.map((lang) => (
                            <div
                              key={lang.language}
                              className={`flex items-center ${hoveredLanguage === lang.language ? "bg-gray-800/30 rounded p-1" : "p-1"}`}
                            >
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: lang.color }}
                              ></span>
                              <span className="text-sm text-white flex-1">{lang.language}</span>
                              <span className="text-xs text-gray-400 mr-2">{lang.count} repos</span>
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${lang.percentage}%`,
                                    backgroundColor: lang.color,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400 ml-2 w-12 text-right">
                                {lang.percentage.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Repositories */}
                      <div className="lg:w-1/2">
                        <h4 className="text-sm font-medium text-gray-300 mb-4">Recent Repositories</h4>
                        <div className="bg-gray-900/30 rounded-lg border border-gray-800 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-800">
                              <thead className="bg-gray-900/50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                  >
                                    Repository
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                  >
                                    Language
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                  >
                                    Stars
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                  >
                                    Updated
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {githubRepos.slice(0, 5).map((repo) => (
                                  <tr key={repo.name} className="hover:bg-gray-800/30">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:underline flex items-center"
                                      >
                                        {repo.name}
                                        <ExternalLink className="w-3 h-3 ml-1 inline-block" />
                                      </a>
                                      {repo.description && (
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{repo.description}</p>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <span className="flex items-center">
                                        <span
                                          className="w-2 h-2 rounded-full mr-1.5"
                                          style={{
                                            backgroundColor:
                                              githubStats?.languages.find((l) => l.language === repo.language)?.color ||
                                              "#ededed",
                                          }}
                                        ></span>
                                        <span className="text-gray-300">{repo.language || "N/A"}</span>
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                      {repo.stargazers_count}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                      {formatDate(repo.updated_at)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {githubRepos.length > 5 && (
                            <div className="p-2 text-center border-t border-gray-800">
                              <a
                                href={`https://github.com/${userData.githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-400 hover:underline"
                              >
                                View all repositories on GitHub
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={handleReanalyzeGithub}
                            disabled={isAnalyzing}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
                            Re-analyze from GitHub
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Skills */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Extracted Skills</h4>
                      <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                        <p className="text-sm text-gray-400 mb-3">
                          These skills were automatically extracted from your GitHub repositories:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skills
                            .filter((skill) => skill.githubVerified)
                            .map((skill) => (
                              <SkillBadge key={skill.name} skill={skill} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <button
                      onClick={handleReanalyzeGithub}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-500 transition-colors duration-300 mb-4"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Analyze GitHub Repositories
                    </button>
                    <p className="text-gray-400 text-center max-w-md">
                      Analyze your public repositories to extract skills and language usage patterns. This helps us
                      better understand your technical expertise.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Github className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Connect your GitHub account</h3>
                <p className="text-gray-400 max-w-md text-center mb-6">
                  Connect your GitHub account to automatically analyze your repositories and extract your technical
                  skills.
                </p>
                <button
                  onClick={() => {
                    if (userData.githubUsername) {
                      setIsGithubConnected(true);
                      setShowGithubConnectPrompt(false);
                      fetchGithubData(userData.githubUsername);
                    } else {
                      console.warn("GitHub username is missing in userData.");
                      setAnalyzeError("GitHub username is not configured. Please set it up in your profile or connect your account via OAuth (not yet implemented).");
                      // Optionally, do not set isGithubConnected to true here
                      // and do not hide the prompt if username is missing.
                      // For now, we'll allow the UI to change to connected state
                      // but show an error.
                       setIsGithubConnected(true); // Or keep false if preferred UX
                       setShowGithubConnectPrompt(false); // Or keep true
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300 rounded-md text-sm font-medium"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub Account
                </button>
                {analyzeError && !isAnalyzing && ( // Show error if connection failed due to missing username
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md flex items-start max-w-md">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{analyzeError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Skills Tab */}
      {activeTab === "manage" && (
        <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Manage Your Skills</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingSkill(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 rounded-md text-xs font-medium flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add New Skill
              </button>
            </div>
          </div>

          <div className="p-5">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    selectedCategory === null
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-900/60 text-gray-400 border border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  All
                </button>
                {skillCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(selectedCategory === category.value ? null : category.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      selectedCategory === category.value
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900/60 text-gray-400 border border-gray-700 hover:bg-gray-800"
                    }`}
                  >
                    {category.label}s
                  </button>
                ))}
              </div>
            </div>

            {/* Add Skill Form */}
            {isAddingSkill && (
              <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800 mb-6 animate-in slide-in-from-top duration-300">
                <h4 className="text-sm font-medium text-white mb-3">Add New Skill</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="newSkill" className="block text-xs font-medium text-gray-400 mb-1">
                      Skill Name
                    </label>
                    <input
                      id="newSkill"
                      ref={skillInputRef}
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                      placeholder="e.g., JavaScript, React, AWS"
                    />
                  </div>

                  <div>
                    <label htmlFor="skillCategory" className="block text-xs font-medium text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      id="skillCategory"
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    >
                      {skillCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="skillLevel" className="block text-xs font-medium text-gray-400 mb-1">
                      Skill Level
                    </label>
                    <select
                      id="skillLevel"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                      className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    >
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="skillProficiency" className="block text-xs font-medium text-gray-400 mb-1">
                      Proficiency: {newSkillProficiency}%
                    </label>
                    <input
                      id="skillProficiency"
                      type="range"
                      min="10"
                      max="100"
                      value={newSkillProficiency}
                      onChange={(e) => setNewSkillProficiency(Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700 rounded-md hover:bg-gray-700 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            )}

            {/* Skills List */}
            {filteredSkills.length > 0 ? (
              <div className="space-y-4">
                {skillCategories
                  .filter((category) => !selectedCategory || selectedCategory === category.value)
                  .map((category) => {
                    const categorySkills = filteredSkills.filter((skill) => skill.category === category.value)
                    if (categorySkills.length === 0) return null

                    return (
                      <div key={category.value} className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">{category.label}s</h4>
                        <div className="space-y-3">
                          {categorySkills.map((skill) => (
                            <div key={skill.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <SkillBadge skill={skill} size="md" />
                                {skill.githubVerified && (
                                  <span className="text-xs text-emerald-500 flex items-center">
                                    <Github className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                                {skill.manuallyAdded && <span className="text-xs text-purple-400">Manually added</span>}
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-400 mr-2">{skill.level}</span>
                                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${skill.proficiency || 50}%`,
                                        backgroundColor:
                                          getCategoryColor(category.value) === "blue"
                                            ? "#3b82f6"
                                            : getCategoryColor(category.value) === "purple"
                                              ? "#a855f7"
                                              : getCategoryColor(category.value) === "orange"
                                                ? "#f97316"
                                                : getCategoryColor(category.value) === "red"
                                                  ? "#ef4444"
                                                  : getCategoryColor(category.value) === "green"
                                                    ? "#10b981"
                                                    : "#3b82f6",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveSkill(skill.name)}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                  aria-label={`Remove ${skill.name}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">{skillSearch ? "No skills match your search" : "No skills added yet"}</p>
                {skillSearch && (
                  <button onClick={() => setSkillSearch("")} className="mt-2 text-emerald-400 text-sm hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Connect Prompt (if not connected and not in GitHub tab) */}
      {showGithubConnectPrompt && !isGithubConnected && activeTab !== "github" && (
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Github className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-white">Connect your GitHub account</p>
              <p className="text-xs text-gray-400">Automatically analyze your repositories to extract skills</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowGithubConnectPrompt(false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-300"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setIsGithubConnected(true)
                setActiveTab("github")
                setShowGithubConnectPrompt(false)
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300 rounded-md text-xs font-medium"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
