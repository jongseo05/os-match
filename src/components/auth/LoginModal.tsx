"use client"

import type React from "react"

import { useState } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase/supabase"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignUpClick: () => void // 회원가입 모달로 전환하기 위한 함수
}

export default function LoginModal({ isOpen, onClose, onSignUpClick }: LoginModalProps) {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      onClose()
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "로그인에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) throw error
      // GitHub OAuth는 리디렉션을 처리하므로 onClose()는 호출하지 않음
    } catch (error) {
      console.error("GitHub login error:", error)
      setError(error instanceof Error ? error.message : "GitHub 로그인에 실패했습니다")
      setIsLoading(false)
    }
  }

  const handleSignupClick = () => {
    onClose()
    onSignUpClick()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-black/90 backdrop-blur-md border border-gray-800 shadow-xl shadow-emerald-900/10">
          <CardHeader className="space-y-1 flex flex-col items-center py-5">
            <CardTitle className="text-2xl font-bold text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>          <CardContent className="space-y-3 pt-0">
            {error && (
              <div className="bg-red-500/10 text-red-500 p-2 rounded-md text-sm mb-2">
                {error}
              </div>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-300 text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 h-9"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300 text-sm">
                    Password
                  </Label>
                  <a href="#" className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 h-9"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 h-9 mt-1"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full border-gray-700 bg-gray-900/60 text-white hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 h-9"
            >
              <Github className="mr-2 h-4 w-4 text-emerald-500" />
              GitHub
            </Button>
          </CardContent>          <CardFooter className="flex flex-col space-y-1 border-t border-gray-800 pt-3 pb-4">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                onClick={handleSignupClick}
                className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign up
              </button>
            </p>
            <p className="text-center text-xs text-gray-600">
              By signing in, you agree to our{" "}
              <a href="#" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
