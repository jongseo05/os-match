'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabase';

// context를 통해 제공할 타입 정의
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // 상태 관리
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // 인증 상태 변화 감지 -> login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      
      // 로그인 성공했을 때만 사용자 정보 출력
      if (session?.user) {
        console.log('로그인 성공: 사용자 정보', {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email: session.user.email
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw error;
    }
    
    // 로그인 성공 시 사용자 정보 콘솔에 출력
    if (data.user) {
      console.log('로그인 성공: 사용자 정보', {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        email: data.user.email
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback` 
      }
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, signInWithGithub }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};