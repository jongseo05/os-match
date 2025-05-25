// GitHub API integration service

export interface GithubRepository {
  name: string
  language: string
  stargazers_count: number
  updated_at: string
  html_url: string
  description: string | null
}

export interface GithubLanguageStats {
  language: string
  count: number
  percentage: number
  color: string
}

export interface GithubUserStats {
  totalRepos: number
  averageStars: number
  lastActivityDate: string
  languages: GithubLanguageStats[]
  topSkills: string[]
}

// Language colors based on GitHub's color scheme
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Rust: "#dea584",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  "C++": "#f34b7d",
  C: "#555555",
  // Add more languages as needed
  Other: "#ededed",
}

// Mock function to simulate fetching GitHub repositories
// In a real app, this would make actual API calls to GitHub
export async function fetchGithubRepositories(username: string): Promise<GithubRepository[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock data - in a real app, this would come from the GitHub API
  return [
    {
      name: "react-dashboard",
      language: "TypeScript",
      stargazers_count: 42,
      updated_at: "2023-04-15T10:20:30Z",
      html_url: "https://github.com/alexj-dev/react-dashboard",
      description: "A responsive dashboard built with React and TypeScript",
    },
    {
      name: "node-api-starter",
      language: "JavaScript",
      stargazers_count: 28,
      updated_at: "2023-05-20T14:30:45Z",
      html_url: "https://github.com/alexj-dev/node-api-starter",
      description: "A starter template for Node.js APIs",
    },
    {
      name: "python-data-analysis",
      language: "Python",
      stargazers_count: 15,
      updated_at: "2023-03-10T09:15:25Z",
      html_url: "https://github.com/alexj-dev/python-data-analysis",
      description: "Data analysis tools built with Python",
    },
    {
      name: "go-microservices",
      language: "Go",
      stargazers_count: 35,
      updated_at: "2023-06-05T16:40:55Z",
      html_url: "https://github.com/alexj-dev/go-microservices",
      description: "Microservices architecture implemented in Go",
    },
    {
      name: "react-native-app",
      language: "JavaScript",
      stargazers_count: 22,
      updated_at: "2023-05-01T11:25:35Z",
      html_url: "https://github.com/alexj-dev/react-native-app",
      description: "Mobile app built with React Native",
    },
    {
      name: "vue-component-library",
      language: "Vue",
      stargazers_count: 18,
      updated_at: "2023-04-25T13:35:40Z",
      html_url: "https://github.com/alexj-dev/vue-component-library",
      description: "Reusable Vue.js components",
    },
    {
      name: "rust-cli-tools",
      language: "Rust",
      stargazers_count: 12,
      updated_at: "2023-02-15T08:10:20Z",
      html_url: "https://github.com/alexj-dev/rust-cli-tools",
      description: "Command-line tools built with Rust",
    },
    {
      name: "typescript-design-patterns",
      language: "TypeScript",
      stargazers_count: 31,
      updated_at: "2023-06-10T15:45:50Z",
      html_url: "https://github.com/alexj-dev/typescript-design-patterns",
      description: "Implementation of design patterns in TypeScript",
    },
    {
      name: "kotlin-android-app",
      language: "Kotlin",
      stargazers_count: 19,
      updated_at: "2023-03-20T10:30:30Z",
      html_url: "https://github.com/alexj-dev/kotlin-android-app",
      description: "Android app built with Kotlin",
    },
    {
      name: "css-animations",
      language: "CSS",
      stargazers_count: 14,
      updated_at: "2023-01-25T09:05:15Z",
      html_url: "https://github.com/alexj-dev/css-animations",
      description: "Collection of CSS animations and transitions",
    },
  ]
}

// Analyze GitHub repositories to extract language statistics and other metrics
export function analyzeGithubRepositories(repositories: GithubRepository[]): GithubUserStats {
  // Calculate total repositories
  const totalRepos = repositories.length

  // Calculate average stars
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const averageStars = totalRepos > 0 ? totalStars / totalRepos : 0

  // Find the most recent activity date
  const lastActivityDate = repositories.reduce(
    (latest, repo) => (repo.updated_at > latest ? repo.updated_at : latest),
    "",
  )

  // Count repositories by language
  const languageCounts: Record<string, number> = {}
  repositories.forEach((repo) => {
    const language = repo.language || "Other"
    languageCounts[language] = (languageCounts[language] || 0) + 1
  })

  // Calculate percentages and create language stats
  const languages: GithubLanguageStats[] = Object.entries(languageCounts).map(([language, count]) => ({
    language,
    count,
    percentage: (count / totalRepos) * 100,
    color: languageColors[language] || languageColors.Other,
  }))

  // Sort languages by count (descending)
  languages.sort((a, b) => b.count - a.count)

  // Extract top skills based on languages
  const topSkills = languages.slice(0, 5).map((lang) => lang.language)

  return {
    totalRepos,
    averageStars,
    lastActivityDate,
    languages,
    topSkills,
  }
}

// Function to generate skill tags from GitHub repositories
export function generateSkillTags(
  repositories: GithubRepository[],
): { name: string; level: string; category: string; proficiency: number }[] {
  const stats = analyzeGithubRepositories(repositories)

  // Generate language skills
  const languageSkills = stats.languages.map((lang) => ({
    name: lang.language,
    level: lang.percentage > 30 ? "Expert" : lang.percentage > 15 ? "Intermediate" : "Beginner",
    category: "language",
    proficiency: Math.min(Math.round(lang.percentage * 2), 100), // Scale percentage to proficiency (max 100)
  }))

  // Generate framework skills based on repository descriptions and names
  // This is a simplified approach - in a real app, you'd use more sophisticated analysis
  const frameworkSkills: { name: string; level: string; category: string; proficiency: number }[] = []

  // Check for React
  if (
    repositories.some(
      (repo) =>
        repo.name.toLowerCase().includes("react") ||
        (repo.description && repo.description.toLowerCase().includes("react")),
    )
  ) {
    frameworkSkills.push({
      name: "React",
      level: "Intermediate",
      category: "framework",
      proficiency: 75,
    })
  }

  // Check for Node.js
  if (
    repositories.some(
      (repo) =>
        repo.name.toLowerCase().includes("node") ||
        (repo.description && repo.description.toLowerCase().includes("node")),
    )
  ) {
    frameworkSkills.push({
      name: "Node.js",
      level: "Intermediate",
      category: "framework",
      proficiency: 70,
    })
  }

  // Check for Vue
  if (
    repositories.some(
      (repo) =>
        repo.name.toLowerCase().includes("vue") || (repo.description && repo.description.toLowerCase().includes("vue")),
    )
  ) {
    frameworkSkills.push({
      name: "Vue.js",
      level: "Beginner",
      category: "framework",
      proficiency: 50,
    })
  }

  // Combine all skills
  return [...languageSkills, ...frameworkSkills]
}
