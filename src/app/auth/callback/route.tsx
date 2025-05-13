import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnTo = requestUrl.searchParams.get('returnTo') || '/';
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 코드를 세션으로 교환
    await supabase.auth.exchangeCodeForSession(code);
    
    // 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
      // GitHub 로그인이나 연결이면 프로필에 GitHub 정보 업데이트
    if (user) {
      // 사용자가 GitHub 제공자를 사용하는지 확인
      const isGithubProvider = user.app_metadata?.provider === 'github';
      
      // 사용자 ID 제공자 중 GitHub가 있는지 확인
      const hasGithubIdentity = user.identities && 
        user.identities.some(identity => identity.provider === 'github');
      
      if (isGithubProvider || hasGithubIdentity) {
        // GitHub 사용자 이름 가져오기 (user_name 또는 username)
        const githubUsername = user.user_metadata?.user_name || 
                              user.user_metadata?.username || '';
        
        if (githubUsername) {
          console.log(`GitHub 사용자 연결: @${githubUsername}`);
          
          // user_profiles 테이블에 GitHub 정보 업데이트
          await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              github_connected: true,
              github_username: githubUsername,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
        }
      }
    }
  }
  
  // returnTo 파라미터가 있으면 해당 경로로, 없으면 메인 페이지로 리다이렉트
  return NextResponse.redirect(new URL(returnTo, request.url));
}