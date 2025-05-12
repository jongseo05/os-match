"use client"

import { useState } from "react"
import ProfileHeader from "./ProfileHeader"
import ProfileSidebar from "./ProfileSidebar"
import ProfileContent from "./ProfileContent"
import type { UserData } from "../../types/user"

export default function ProfilePage() {
  // Mock user data - in a real app, this would come from an API or context
  const [userData, setUserData] = useState<UserData>({
    nickname: "dev_explorer",
    realName: "Alex Johnson",
    email: "alex@example.com",
    profileImage: "/diverse-profile-avatars.png",
    bio: "Full-stack developer passionate about open source and collaborative projects.",
    githubConnected: true,
    githubUsername: "alexj-dev",
    region: "North America",
    timezone: "America/New_York",
    privacy: {
      profileVisibility: "public",
      showRealName: true,
      showEmail: false,
    },
    skills: []
  })

  const handleUpdateUserData = (newData: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...newData }))
  }

  return (
    <div className="text-gray-300">
      <ProfileHeader userData={userData} onUpdate={handleUpdateUserData} />

      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <ProfileSidebar userData={userData} />
        </div>
        <div className="lg:w-3/4">
          <ProfileContent userData={userData} onUpdate={handleUpdateUserData} />
        </div>
      </div>
    </div>
  )
}
