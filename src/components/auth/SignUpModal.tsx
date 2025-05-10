"use client"

import type React from "react"

import { useState } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase/supabase"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void // 로그인 모달로 전환하기 위한 함수
}

export default function SignUpModal({ isOpen, onClose, onLoginClick }: SignUpModalProps) {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password)

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: username,
            created_at: new Date().toISOString(),
          })
      }

      onClose()
      // 성공 메시지 표시 또는 추가 처리

    } catch (error) {
      console.error('Sign up error:', error)
      setError(error instanceof Error ? error.message : "회원가입에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignup = async () => {
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
      onClose()
    } catch (error) {
      console.error('GitHub sign up error:', error)
      setError(error instanceof Error ? error.message : "GitHub 회원가입에 실패했습니다")
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
            <CardDescription className="text-gray-400">Enter your details to sign up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {error && (
              <div className="bg-red-500/10 text-red-500 p-2 rounded-md text-sm mb-2">
                {error}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-gray-300 text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 h-9"
                  />
                </div>
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-gray-300 text-sm">
                    Password
                  </Label>
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
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 h-9"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 h-9 mt-1"
              >
                {isLoading ? "Creating account..." : "Sign up"}
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
              onClick={handleGithubSignup}
              disabled={isLoading}
              className="w-full border-gray-700 bg-gray-900/60 text-white hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 h-9"
            >
              <Github className="mr-2 h-4 w-4 text-emerald-500" />
              GitHub
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-1 border-t border-gray-800 pt-3 pb-4">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={onLoginClick}
                className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign in
              </button>
            </p>
            <p className="text-center text-xs text-gray-600">
              By signing up, you agree to our{" "}
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
