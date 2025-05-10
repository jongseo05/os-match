'use client'

import { useState } from "react"
import { User, Menu, X, Home, Layers, GitPullRequest, History } from "lucide-react"
import NavLink from "./NavLink"
import LoginModal from "../components/auth/LoginModal"
import SignUpModal from "../components/auth/SignUpModal"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const openLoginModal = () => {
    setSignUpModalOpen(false)
    setLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setLoginModalOpen(false)
  }
  
  const openSignUpModal = () => {
    setLoginModalOpen(false)
    setSignUpModalOpen(true)
  }
  
  const closeSignUpModal = () => {
    setSignUpModalOpen(false)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/projects", icon: Layers, label: "Project Recommends" },
    { href: "/issues", icon: GitPullRequest, label: "Issue Explorer" },
    { href: "/contributions", icon: History, label: "Contribution History" },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-emerald-500 font-bold text-xl">OS-Match</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <NavLink key={item.label} href={item.href} icon={item.icon} label={item.label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="group p-2 rounded-full text-gray-400 transition-all duration-300 ease-in-out focus:outline-none"
                >
                  <span className="sr-only">Sign in</span>
                  <User
                    className="h-6 w-6 group-hover:text-emerald-400 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-emerald-400 transition-colors duration-300 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6 transition-transform duration-300 hover:rotate-90" aria-hidden="true" />
                ) : (
                  <Menu
                    className="block h-6 w-6 transition-transform duration-300 hover:scale-110"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90 backdrop-blur-sm">
            {navItems.map((item) => (
              <NavLink key={item.label} href={item.href} icon={item.icon} label={item.label} mobile />
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                openLoginModal()
              }}
              className="w-full text-left"
            >
              <NavLink href="#" icon={User} label="Sign in" mobile />
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={closeLoginModal} 
        onSignUpClick={openSignUpModal}
      />
      <SignUpModal 
        isOpen={signUpModalOpen} 
        onClose={closeSignUpModal}
        onLoginClick={openLoginModal}
      />
    </>
  )
}
