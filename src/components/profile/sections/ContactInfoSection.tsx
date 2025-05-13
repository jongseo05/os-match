"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { UserData } from "../../../types/user"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase/supabase"

interface ContactInfoSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function ContactInfoSection({ userData, onUpdate }: ContactInfoSectionProps) {  
  const [email, setEmail] = useState(userData.email)
  const [isEditing, setIsEditing] = useState(false)
  const [isCheckingGithub, setIsCheckingGithub] = useState(false)
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)

  const { user } = useAuth()
  
  // GitHub 연결 상태 확인 및 업데이트
  useEffect(() => {
    const checkGithubConnection = async () => {
      // 사용자가 로그인했고, Supabase 사용자 정보가 있는 경우
      if (user) {
        setIsCheckingGithub(true)
        
        try {
          // 사용자 정보 가져오기
          const { data: { user: currentUser } } = await supabase.auth.getUser()            // GitHub 제공자이거나 GitHub 연결된 경우 GitHub 정보 업데이트
          if (currentUser) {
            // Supabase 사용자가 GitHub 제공자를 통해 로그인했는지 확인
            const isGithubProvider = currentUser.app_metadata?.provider === 'github';
            
            // Supabase 사용자의 ID 제공자 목록에 GitHub가 있는지 확인
            const hasGithubIdentity = currentUser.identities && 
              currentUser.identities.some(identity => identity.provider === 'github');
            
            if (isGithubProvider || hasGithubIdentity) {
              // GitHub 사용자 이름 가져오기 (user_name 또는 username)
              const githubUsername = currentUser.user_metadata?.user_name || 
                                    currentUser.user_metadata?.username || '';
            
              // 현재 상태와 다른 경우에만 업데이트
              if (githubUsername && 
                  (!userData.githubConnected || 
                   userData.githubUsername !== githubUsername)) {
                
                console.log('GitHub 정보 업데이트:', githubUsername);
                
                onUpdate({
                  githubConnected: true,
                  githubUsername
                });
              }
            }
          }
        } catch (error) {
          console.error('GitHub 연결 상태 확인 실패:', error)
        } finally {
          setIsCheckingGithub(false)
        }
      }
    }
    
    checkGithubConnection()
  }, [user, userData.githubConnected, userData.githubUsername, onUpdate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ email })
    setIsEditing(false)
  }
  const handleConnectGithub = async () => {
    console.log("Connecting to GitHub...")
    setIsConnectingGithub(true)
    
    try {
      // GitHub OAuth를 통한 로그인 진행
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=/profile`,
          scopes: 'read:user user:email', // 사용자 정보와 이메일 접근 권한
          queryParams: {
            prompt: 'consent' // 항상 GitHub 동의 화면 표시
          }
        }
      })
      
      if (error) {
        console.error("GitHub 연결 오류:", error)
        throw error
      }
      
      // 리다이렉션이 성공적으로 시작되면 여기에 도달하지 않음
      // (리다이렉션이 실패하는 경우 여기에 도달할 수 있음)
    } catch (error) {
      console.error("GitHub 연결 실패:", error)
      alert("GitHub 계정 연결에 실패했습니다.")
      setIsConnectingGithub(false)
    }
  }
  
  const handleDisconnectGithub = async () => {
    console.log("Disconnecting from GitHub...")
    setIsConnectingGithub(true)

    try {
      // 사용자 프로필에서 GitHub 연결 정보 삭제
      // 실제로 Supabase/GitHub OAuth 연결을 완전히 해제하려면 GitHub 설정에서 직접 해제 필요
      await supabase
        .from('user_profiles')
        .update({
          github_connected: false,
          github_username: "",
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id || '')
      
      // 프론트엔드 상태 업데이트
      onUpdate({
        githubConnected: false,
        githubUsername: ""
      })
      
      // 알림 표시
      alert("GitHub 계정 연결이 해제되었습니다.")
    } catch (error) {
      console.error("GitHub 연결 해제 실패:", error)
      alert("GitHub 계정 연결 해제에 실패했습니다.")
    } finally {
      setIsConnectingGithub(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Contact Information</h2>
        <p className="text-gray-400">Manage your email address and connected accounts.</p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-gray-500">
              Your email will only be visible if you enable this in privacy settings.
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Save Email
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail(userData.email)
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
          <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Email Address</p>
            <p className="text-base text-white">{userData.email}</p>
            {!userData.privacy.showEmail && (
              <p className="text-xs text-orange-400 mt-1">This email is private and not visible to others</p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300"
          >
            Change Email
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-lg font-medium text-white mb-4">Connected Accounts</h3>

        <div className="p-4 bg-gray-900/60 rounded-md border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-300" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                ></path>
              </svg>              <div>
                <p className="text-white font-medium">GitHub</p>
                {isCheckingGithub ? (
                  <p className="text-sm text-yellow-500">확인 중...</p>
                ) : userData.githubConnected ? (
                  <p className="text-sm text-emerald-500">Connected as @{userData.githubUsername}</p>
                ) : (
                  <p className="text-sm text-gray-400">Not connected</p>
                )}
              </div>
            </div>            {userData.githubConnected ? (
              <button
                onClick={handleDisconnectGithub}
                disabled={isCheckingGithub || isConnectingGithub}
                className="px-3 py-1.5 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingGithub ? "확인 중..." : isConnectingGithub ? "해제 중..." : "Disconnect"}
              </button>
            ) : (
              <button
                onClick={handleConnectGithub}
                disabled={isCheckingGithub || isConnectingGithub}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingGithub ? "확인 중..." : isConnectingGithub ? "연결 중..." : "Connect"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
