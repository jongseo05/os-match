"use client"

import Navbar from "../../components/Navbar"
import ProfilePage from "../../components/profile/ProfilePage"
import ParticleCanvas from "../../components/ParticleCanvas"

export default function Profile() {
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
