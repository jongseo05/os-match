"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import ProfileHeader from "./ProfileHeader"
// import ProfileTabs from './ProfileTabs'; // ProfileTabs is part of ProfileContent
import ProfileContent from "./ProfileContent"
import { useUserProfile } from "@/hooks/useUserProfile"
import type { UserData } from "@/types/user"

export default function UserProfile() {
  const { userData, loading, error, updateUserGithubUsername } = useUserProfile()
  // const [activeTab, setActiveTab] = useState('overview'); // Tab management is within ProfileContent

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>
  }

  if (!userData) {
    return <div className="text-center py-10">No user data found.</div>
  }

  // Mock onUpdate function for now, replace with actual logic if needed
  const handleUpdateUserData = (data: Partial<UserData>) => {
    console.log("User data update requested:", data)
    // Here you would typically call an API to update the user data
    // and then potentially update the local state via useUserProfile or directly.
    if (data.githubUsername !== undefined) {
      updateUserGithubUsername(data.githubUsername || null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <ProfileHeader
        userData={userData}
        onUpdate={handleUpdateUserData} // Pass the onUpdate handler
      />
      {/* ProfileTabs is rendered inside ProfileContent */}
      {/* <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}
      <ProfileContent
        // activeTab prop is removed as ProfileContent manages its own tabs
        userData={userData}
        onUpdate={handleUpdateUserData} // Pass the onUpdate handler
        updateUserGithubUsername={updateUserGithubUsername} // Pass the specific GitHub username update function
      />
    </div>
  )
}
