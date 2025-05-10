"use client"

import type React from "react"

import { useState } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, signInWithGithub } = useAuth()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      // 로그인 성공 시 메인 페이지로 이동 (추후 구현)
    } catch (error) {
      console.error("로그인 오류:", error)
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsLoading(true)

    try {
      await signInWithGithub()
      // GitHub OAuth 리다이렉션이 발생하므로 여기서는 추가 처리가 필요 없음
    } catch (error) {
      console.error("GitHub 로그인 오류:", error)
      alert("GitHub 로그인에 실패했습니다.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-black/70 backdrop-blur-md border border-gray-800">
      <CardHeader className="space-y-1 flex flex-col items-center py-5">
        <div className="w-48 mb-2">
          <span className="text-emerald-500 font-bold text-xl">OS-Match</span>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Sign in to your account</CardTitle>
        <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <form onSubmit={handleEmailLogin} className="space-y-3">
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
      </CardContent>
      <CardFooter className="flex flex-col space-y-1 border-t border-gray-800 pt-3 pb-4">
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
            Sign up
          </Link>
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
  )
}
