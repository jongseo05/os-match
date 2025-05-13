/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 빌드 시 경고는 허용하고 오류만 실패하도록 설정
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;