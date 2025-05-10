'use client';

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// URL과 키가 없는 경우 에러 메시지 출력
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anonymous Key가 제공되지 않았습니다. .env.local 파일을 확인해주세요.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);