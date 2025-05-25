export interface Skill {
  name: string
  level: string
  category: string
  proficiency: number
  githubVerified?: boolean
  manuallyAdded?: boolean
}

export interface UserData {
  nickname: string
  realName: string
  email: string
  profileImage: string
  bio: string
  githubConnected: boolean
  githubUsername: string
  region: string
  timezone: string
  // 위치 정보 추가
  latitude?: number
  longitude?: number
  // 국가 및 도시 정보 추가
  country?: string
  city?: string
  privacy: {
    profileVisibility: string
    showRealName: boolean
    showEmail: boolean
  }
  // TechnicalSkillsSection.tsx에서 필요한 skills 속성 추가
  skills: Skill[]
  // 계정 생성 날짜 정보 추가
  accountCreatedAt?: string
  // GitHub 분석 날짜 추가
  githubLastAnalyzed?: string
}