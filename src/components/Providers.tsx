'use client'; // 클라이언트 컴포넌트로 표시

import { AuthProvider } from '../lib/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}