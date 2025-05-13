export interface Skill {
  name: string
  level: string
  category: string
  proficiency: number
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
  privacy: {
    profileVisibility: string
    showRealName: boolean
    showEmail: boolean
  }
  // TechnicalSkillsSection.tsx에서 필요한 skills 속성 추가
  skills: Skill[]
  // 계정 생성 날짜 정보 추가
  accountCreatedAt?: string
}