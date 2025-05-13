"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../lib/auth"
import Navbar from "../../components/Navbar"
import ProfilePage from "../../components/profile/ProfilePage"
import ParticleCanvas from "../../components/ParticleCanvas"

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // 로딩이 완료되고 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // 로딩 중이거나 인증되지 않은 상태에서는 로딩 화면 표시
  if (loading || !isAuthenticated) {
    return (
      <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
        <div className="z-10 text-white text-xl">로딩 중...</div>
        <ParticleCanvas />
      </div>
    )
  }

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <Navbar />
      <div className="z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 overflow-y-auto">
        <ProfilePage />
      </div>
      <ParticleCanvas />
    </div>
  )
}