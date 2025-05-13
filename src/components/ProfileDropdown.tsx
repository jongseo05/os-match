"use client"

import { useState, useRef, useEffect } from "react"
import { User, LogOut, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileDropdownProps {
  isLoggedIn: boolean
  userEmail?: string | null  // userEmail 추가
  onLoginClick: () => void
  onLogout: () => void
}

export default function ProfileDropdown({ isLoggedIn, userEmail, onLoginClick, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle ESC key to close dropdown
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [])

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setIsOpen(!isOpen)
    } else {
      onLoginClick()
    }
  }

  const handleViewProfile = () => {
    setIsOpen(false)
    router.push("/profile")
  }

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleProfileClick}
        className={`group p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none ${
          isOpen ? "bg-gray-800" : "bg-transparent"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">{isLoggedIn ? "Open user menu" : "Sign in"}</span>
        <User
          className={`h-6 w-6 group-hover:text-emerald-400 transition-transform duration-300 group-hover:scale-110 ${
            isLoggedIn ? "text-emerald-400" : "text-gray-400"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown menu */}      {isOpen && isLoggedIn && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-black/90 backdrop-blur-sm border border-gray-800 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm text-white">Signed in as</p>
            <p className="text-sm font-medium text-emerald-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleViewProfile}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-colors duration-200 flex items-center"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-colors duration-200 flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
