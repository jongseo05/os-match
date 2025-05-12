"use client"

import type React from "react"

import { useState } from "react"
import type { UserData } from "../../../types/user"

interface BasicInfoSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function BasicInfoSection({ userData, onUpdate }: BasicInfoSectionProps) {
  const [nickname, setNickname] = useState(userData.nickname)
  const [realName, setRealName] = useState(userData.realName)
  const [bio, setBio] = useState(userData.bio || "")
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ nickname, realName, bio })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Basic Information</h2>
        <p className="text-gray-400">
          This information will be displayed on your profile and will help others identify you.
        </p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">
              Nickname
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Your display name"
            />
            <p className="text-xs text-gray-500">This is the name that will be displayed to other users.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="realName" className="block text-sm font-medium text-gray-300">
              Real Name
            </label>
            <input
              id="realName"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Your full name"
            />
            <p className="text-xs text-gray-500">
              Your real name will only be visible if you enable this in privacy settings.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Tell us a bit about yourself"
            />
            <p className="text-xs text-gray-500">
              A short description about yourself that will appear on your profile.
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setNickname(userData.nickname)
                setRealName(userData.realName)
                setBio(userData.bio || "")
                setIsEditing(false)
              }}
              className="px-4 py-2 bg-gray-900/60 text-gray-300 text-sm font-medium border border-gray-700 rounded-md hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Nickname</p>
              <p className="text-base text-white">{userData.nickname}</p>
            </div>

            <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Real Name</p>
              <p className="text-base text-white">{userData.realName}</p>
            </div>
          </div>

          <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Bio</p>
            <p className="text-base text-white">{userData.bio || "No bio provided"}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300"
          >
            Edit Basic Information
          </button>
        </div>
      )}
    </div>
  )
}
