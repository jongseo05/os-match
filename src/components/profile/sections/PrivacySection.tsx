"use client"

import type React from "react"

import { useState } from "react"
import type { UserData } from "../../../types/user"

interface PrivacySectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function PrivacySection({ userData, onUpdate }: PrivacySectionProps) {
  const [privacy, setPrivacy] = useState(userData.privacy)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ privacy })
    setIsEditing(false)
  }

  const updatePrivacy = (key: keyof typeof privacy, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Privacy & Settings</h2>
        <p className="text-gray-400">Control how your information is displayed and used across the platform.</p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-300">
                Profile Visibility
              </label>
              <select
                id="profileVisibility"
                value={privacy.profileVisibility}
                onChange={(e) => updatePrivacy("profileVisibility", e.target.value)}
                className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="private">Private - Only visible to you</option>
                <option value="anonymous">Anonymous - Participate without revealing identity</option>
              </select>
              <p className="text-xs text-gray-500">This controls who can see your profile on the platform.</p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-800">
              <div>
                <p className="text-gray-300">Show Real Name</p>
                <p className="text-sm text-gray-500">Display your real name on your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showRealName}
                  onChange={(e) => updatePrivacy("showRealName", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-900 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-800">
              <div>
                <p className="text-gray-300">Show Email Address</p>
                <p className="text-sm text-gray-500">Make your email visible to other users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => updatePrivacy("showEmail", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-900 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Save Privacy Settings
            </button>
            <button
              type="button"
              onClick={() => {
                setPrivacy(userData.privacy)
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
          <div className="p-4 bg-gray-900/60 rounded-md border border-gray-700">
            <div className="space-y-1 mb-4">
              <p className="text-sm font-medium text-gray-400">Profile Visibility</p>
              <p className="text-base text-white capitalize">{userData.privacy.profileVisibility}</p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-800">
              <div>
                <p className="text-gray-300">Show Real Name</p>
                <p className="text-sm text-gray-500">Display your real name on your profile</p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userData.privacy.showRealName ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {userData.privacy.showRealName ? "Enabled" : "Disabled"}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-800">
              <div>
                <p className="text-gray-300">Show Email Address</p>
                <p className="text-sm text-gray-500">Make your email visible to other users</p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userData.privacy.showEmail ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {userData.privacy.showEmail ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300"
          >
            Edit Privacy Settings
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-lg font-medium text-white mb-4">Account Security</h3>

        <div className="space-y-4">
          <button className="px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300">
            Change Password
          </button>

          <button className="px-4 py-2 bg-gray-900/60 border border-red-700 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
