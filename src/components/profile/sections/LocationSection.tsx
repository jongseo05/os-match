"use client"

import type React from "react"

import { useState } from "react"
import type { UserData } from "../../../types/user"

interface LocationSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function LocationSection({ userData, onUpdate }: LocationSectionProps) {
  const [region, setRegion] = useState(userData.region)
  const [timezone, setTimezone] = useState(userData.timezone)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ region, timezone })
    setIsEditing(false)
  }

  // Sample regions and timezones - in a real app, these would be more comprehensive
  const regions = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania"]

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Location & Timezone</h2>
        <p className="text-gray-400">
          This information helps us match you with projects and contributors in your region and timezone.
        </p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="region" className="block text-sm font-medium text-gray-300">
              Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Your region helps us suggest projects in your area.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Your timezone helps with scheduling and collaboration.</p>
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
                setRegion(userData.region)
                setTimezone(userData.timezone)
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
              <p className="text-sm font-medium text-gray-400">Region</p>
              <p className="text-base text-white">{userData.region}</p>
            </div>

            <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Timezone</p>
              <p className="text-base text-white">{userData.timezone.replace("_", " ")}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300"
          >
            Edit Location & Timezone
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-900/60 rounded-md border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-3">Timezone Map</h3>        <div className="relative h-48 bg-black/50 rounded-md overflow-hidden">
          {/* World map visualization - simplified for this example */}
          <div className="absolute inset-0 opacity-20 flex items-center justify-center">
            <img src="/globe.svg" alt="World Map" className="opacity-20 w-16 h-16" />
          </div>
          <div
            className="absolute h-4 w-4 rounded-full bg-emerald-500 border-2 border-black"
            style={{
              // This is a simplified positioning - in a real app, you'd calculate this based on actual coordinates
              top: "40%",
              left: userData.timezone.includes("America")
                ? "25%"
                : userData.timezone.includes("Europe")
                  ? "45%"
                  : userData.timezone.includes("Asia")
                    ? "65%"
                    : userData.timezone.includes("Australia")
                      ? "80%"
                      : "50%",
            }}
          ></div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            Your current timezone: {userData.timezone.replace("_", " ")}
          </div>
        </div>
      </div>
    </div>
  )
}
