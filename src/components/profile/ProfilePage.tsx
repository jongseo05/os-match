"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth"
import { useUserStore } from "../../store/userStore"
import { getUserProfile, updateUserProfile } from "../../lib/profile"
import ProfileHeader from "./ProfileHeader"
import ProfileSidebar from "./ProfileSidebar"
import ProfileContent from "./ProfileContent"
import type { UserData } from "../../types/user"

export default function ProfilePage() {
  const { user } = useAuth() // Supabase 인증 정보
  const storeUser = useUserStore(state => state.user) // Zustand 스토어의 사용자 정보
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 기본 사용자 데이터
  const [userData, setUserData] = useState<UserData>({
    nickname: storeUser?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || "사용자",
    realName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    profileImage: user?.user_metadata?.avatar_url || "/diverse-profile-avatars.png",
    bio: "",
    githubConnected: !!user?.app_metadata?.provider && user?.app_metadata?.provider === 'github',
    githubUsername: user?.user_metadata?.user_name || "",
    region: "",
    timezone: "",
    privacy: {
      profileVisibility: "public",
      showRealName: true,
      showEmail: false,
    },
    skills: []
  })

  // 사용자 프로필 데이터 가져오기
  useEffect(() => {
    async function fetchUserProfile() {
      if (user?.id) {
        setLoading(true)
        try {
          const profileData = await getUserProfile(user.id)
          if (profileData) {
            setUserData(profileData)
          }
        } catch (err) {
          console.error("프로필 데이터를 가져오는 중 오류가 발생했습니다:", err)
          setError("프로필 데이터를 불러오지 못했습니다. 다시 시도해 주세요.")
        } finally {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  // 사용자 프로필 데이터 업데이트
  const handleUpdateUserData = async (newData: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...newData }))
    
    // 데이터베이스에 업데이트
    if (user?.id) {
      try {
        const success = await updateUserProfile(user.id, newData)
        if (!success) {
          console.error("프로필 업데이트에 실패했습니다.")
          setError("프로필 업데이트에 실패했습니다. 잠시 후 다시 시도해 주세요.")
        } else {
          setError(null)
        }
      } catch (err) {
        console.error("프로필 업데이트 중 오류가 발생했습니다:", err)
        setError("프로필 업데이트 중 오류가 발생했습니다.")
      }
    }
  }
  if (loading) {
    return (
      <div className="text-gray-300 flex items-center justify-center p-8">
        <div className="animate-pulse text-xl">프로필 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="text-gray-300">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
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