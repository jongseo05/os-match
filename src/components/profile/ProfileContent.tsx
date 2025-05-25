"use client"

import { useState } from "react"
import { User, Mail, MapPin, Shield, Code } from "lucide-react"
import BasicInfoSection from "./sections/BasicInfoSection"
import ContactInfoSection from "./sections/ContactInfoSection"
import LocationSection from "./sections/LocationSection"
import PrivacySection from "./sections/PrivacySection"
import TechnicalSkillsSection from "./sections/TechnicalSkillsSection"
import type { UserData } from "../../types/user"

interface ProfileContentProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function ProfileContent({ userData, onUpdate }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const tabs = [
    { id: "basic", label: "Basic Information", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "location", label: "Location", icon: MapPin },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "skills", label: "Technical Skills", icon: Code },
  ]

  return (
    <div className="bg-black/70 backdrop-blur-md border border-gray-800 rounded-md shadow-md overflow-hidden">
      <div className="border-b border-gray-800">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>      <div className="p-6">
        {activeTab === "basic" && <BasicInfoSection userData={userData} onUpdate={onUpdate} />}
        {activeTab === "contact" && <ContactInfoSection userData={userData} onUpdate={onUpdate} />}
        {activeTab === "location" && <LocationSection userData={userData} onUpdate={onUpdate} />}
        {activeTab === "privacy" && <PrivacySection userData={userData} onUpdate={onUpdate} />}
        {activeTab === "skills" && <TechnicalSkillsSection userData={userData} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}
