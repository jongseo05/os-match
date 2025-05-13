import type { UserData } from "../../types/user"
import { Shield, Users, Globe } from "lucide-react"

/**
 * 날짜 형식을 변환하는 함수 - 'YYYY-MM-DD' 형식을 'MMMM YYYY' 형식으로 변환
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    
    // 유효한 날짜가 아니면 기본값 반환
    if (isNaN(date.getTime())) return "Unknown";
    
    // 년, 월을 형식화
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long'
    });
  } catch (e) {
    return "Unknown";
  }
}

interface ProfileSidebarProps {
  userData: UserData
}

export default function ProfileSidebar({ userData }: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-black/70 backdrop-blur-md border border-gray-800 rounded-md shadow-md p-5">
        <h2 className="text-base font-semibold text-white mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          Profile Overview
        </h2>

        <div className="space-y-4">          <div className="border-t border-gray-800 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Account Status</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
            </div>
            <p className="text-sm text-gray-400">
              Member since {formatDate(userData.accountCreatedAt)}
            </p>
          </div>

          <div className="border-t border-gray-800 pt-3">
            <div className="flex items-center mb-2">
              <Globe className="w-4 h-4 mr-2 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Location</h3>
            </div>
            <p className="text-sm text-gray-400">{userData.region}</p>
            <p className="text-sm text-gray-400 mt-1">{userData.timezone.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      <div className="bg-black/70 backdrop-blur-md border border-gray-800 rounded-md shadow-md p-5">
        <h2 className="text-base font-semibold text-white mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-gray-400" />
          Profile Visibility
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Status</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              userData.privacy.profileVisibility === "public"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {userData.privacy.profileVisibility === "public" ? "Public" : "Private"}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Real Name</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                userData.privacy.showRealName ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {userData.privacy.showRealName ? "Visible" : "Hidden"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Email</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                userData.privacy.showEmail ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {userData.privacy.showEmail ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
