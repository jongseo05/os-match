"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card } from "@/components/ui/card"
import ProfileHeader from "./ProfileHeader"
import BasicInfoSection from "./sections/BasicInfoSection"
import ContactInfoSection from "./sections/ContactInfoSection"
import LocationSection from "./sections/LocationSection"
import TechnicalSkillsSection from "./sections/TechnicalSkillsSection"
import PrivacySection from "./sections/PrivacySection"
import type { UserData } from "@/types/user"

export default function UserProfile() {
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
    skills: [
      { name: "JavaScript", level: "Expert", category: "language", proficiency: 90 },
      { name: "React", level: "Expert", category: "framework", proficiency: 85 },
      { name: "Node.js", level: "Intermediate", category: "framework", proficiency: 70 },
      { name: "TypeScript", level: "Intermediate", category: "language", proficiency: 65 },
      { name: "GraphQL", level: "Beginner", category: "tool", proficiency: 40 },
      { name: "Docker", level: "Intermediate", category: "tool", proficiency: 60 },
      { name: "AWS", level: "Beginner", category: "platform", proficiency: 45 },
    ]
  });

  const handleUpdateUserData = (newData: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="space-y-8">
      <ProfileHeader userData={userData} onUpdate={handleUpdateUserData} />

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-5 bg-gray-900/60 border border-gray-800">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="skills">Technical Skills</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Settings</TabsTrigger>
        </TabsList>

        <Card className="mt-6 bg-black/70 backdrop-blur-md border border-gray-800">
          <TabsContent value="basic" className="p-6">
            <BasicInfoSection userData={userData} onUpdate={handleUpdateUserData} />
          </TabsContent>

          <TabsContent value="contact" className="p-6">
            <ContactInfoSection userData={userData} onUpdate={handleUpdateUserData} />
          </TabsContent>

          <TabsContent value="location" className="p-6">
            <LocationSection userData={userData} onUpdate={handleUpdateUserData} />
          </TabsContent>

          <TabsContent value="skills" className="p-6">
            <TechnicalSkillsSection userData={userData} onUpdate={handleUpdateUserData} />
          </TabsContent>

          <TabsContent value="privacy" className="p-6">
            <PrivacySection userData={userData} onUpdate={handleUpdateUserData} />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}
