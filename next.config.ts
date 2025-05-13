import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // ESLint 오류를 빌드 중에 무시하도록 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 타입 오류를 빌드 중에 무시하도록 설정
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
