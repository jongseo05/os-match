"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Check, X, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import type { UserData } from "../../types/user"

interface ProfileHeaderProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function ProfileHeader({ userData, onUpdate }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(userData.bio || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const confirmImageChange = () => {
    if (previewImage) {
      onUpdate({ profileImage: previewImage })
      setPreviewImage(null)
    }
  }

  const cancelImageChange = () => {
    setPreviewImage(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const saveBio = () => {
    onUpdate({ bio })
    setIsEditingBio(false)
  }

  return (
    <div className="bg-black/70 backdrop-blur-md border border-gray-800 rounded-md shadow-md overflow-hidden">
      {/* Cover image */}
      <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-400 relative">
        {/* Profile image */}
        <div className="absolute -bottom-12 left-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-black">
              <Image
                src={previewImage || "/dev_profile.png"}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {!previewImage ? (
              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 p-1.5 bg-gray-800 border border-gray-700 rounded-full cursor-pointer hover:bg-emerald-500/20 transition-colors duration-200"
                aria-label="Change profile picture"
              >
                <Camera className="w-3.5 h-3.5 text-gray-300" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </button>
            ) : (
              <div className="absolute bottom-0 right-0 flex space-x-1">
                <button
                  onClick={confirmImageChange}
                  className="p-1.5 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-500 transition-colors duration-200"
                  aria-label="Confirm new profile picture"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={cancelImageChange}
                  className="p-1.5 bg-red-600 rounded-full cursor-pointer hover:bg-red-500 transition-colors duration-200"
                  aria-label="Cancel profile picture change"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 pb-6 px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white">{userData.nickname}</h1>
            {userData.privacy.showRealName && <p className="text-gray-400 mt-1">{userData.realName}</p>}

            {!isEditingBio ? (
              <div className="mt-3 relative group">
                <p className="text-gray-300 max-w-2xl">{userData.bio || "Add a bio"}</p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="absolute top-0 right-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 hover:text-emerald-400 transition-opacity duration-200"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 bg-gray-900/60 border border-gray-700 rounded-md text-white text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Write a short bio about yourself"
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => {
                      setBio(userData.bio || "")
                      setIsEditingBio(false)
                    }}
                    className="px-2 py-1 text-xs text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBio}
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-0">
            <button className="px-4 py-1.5 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-colors duration-200">
              Edit profile
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
          {userData.githubConnected && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                ></path>
              </svg>
              <a
                href={`https://github.com/${userData.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:underline"
              >
                @{userData.githubUsername}
              </a>
            </div>
          )}          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
            {userData.city && userData.country ? (
              <span>{userData.city}, {userData.country}</span>
            ) : (
              <span>{userData.region}</span>
            )}
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{userData.timezone.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
