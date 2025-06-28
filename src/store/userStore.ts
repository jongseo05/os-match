import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 사용자 정보 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
  // 필요한 다른 사용자 정보 필드 추가
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  githubUsername: string | null; // Add this line
  setGithubUsername: (username: string | null) => void; // Add this line
}


export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      
      // 로그인 처리
      login: (userData) => set({ 
        user: userData,
        isLoggedIn: true 
      }),
      
      // 로그아웃 처리
      logout: () => set({ 
        user: null,
        isLoggedIn: false 
      }),
      
      // 사용자 정보 업데이트
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      githubUsername: null, // Add this line
      setGithubUsername: (username) => set({ githubUsername: username }), // Add this line
    }),
    {
      name: 'user-storage', // 로컬 스토리지에 저장될 키 이름
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);