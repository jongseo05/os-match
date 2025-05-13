'use client';

import { supabase } from './supabase/supabase';
import type { UserData, Skill } from '../types/user';

/**
 * 사용자 프로필이 존재하는지 확인하는 함수
 * @param userId 사용자 ID
 */
async function checkProfileExists(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId);
  
  if (error) {
    console.error('프로필 확인 중 에러 발생:', error);
    return false;
  }
  
  return data && data.length > 0;
}

/**
 * 초기 사용자 프로필 생성 함수
 * @param userId 사용자 ID
 */
async function createInitialUserProfile(userId: string): Promise<boolean> {
  try {
    // 사용자 정보 가져오기
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      console.error('사용자 정보를 찾을 수 없습니다');
      return false;
    }
    
    const user = userData.user;
      // 기본 프로필 데이터 생성
    const profileData = {
      id: userId,  // user_id 대신 id 사용
      nickname: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      real_name: user.user_metadata?.full_name || '',
      email: user.email || '',
      profile_image: user.user_metadata?.avatar_url || '/globe.svg',
      bio: '',
      github_connected: !!user.app_metadata?.provider && user.app_metadata?.provider === 'github',
      github_username: user.user_metadata?.user_name || '',
      region: '',
      timezone: '',
      profile_visibility: 'public',
      show_real_name: false,
      show_email: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('프로필 생성 시도:', profileData);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select();
      
    if (error) {
      console.error('초기 프로필 생성 중 에러 발생:', error);
      return false;
    }
    
    console.log('프로필 생성 성공:', data);
    return true;
  } catch (err) {
    console.error('프로필 생성 중 예외 발생:', err);
    return false;
  }
}

/**
 * Supabase에서 사용자 프로필 정보를 가져오는 함수
 * @param userId 사용자 ID
 */
export async function getUserProfile(userId: string): Promise<UserData | null> {  
  try {
    // 인증 시스템에서 사용자 정보 가져오기 (계정 생성 날짜 포함)
    const { data: authUserData } = await supabase.auth.getUser();
    const authUser = authUserData?.user;
    
    // 사용자 계정 생성 날짜
    const accountCreatedAt = authUser?.created_at;
    
    // 첫 로그인 사용자는 프로필이 없을 수 있으므로 프로필 존재 여부 확인
    const profileExists = await checkProfileExists(userId);
    
    if (!profileExists) {
      // 프로필이 없으면 생성
      const created = await createInitialUserProfile(userId);
      if (!created) return null;
    }
      // 'user_profiles' 테이블에서 사용자 정보 조회 - id 필드로 조회
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('프로필 정보를 가져오는 중 에러 발생:', error);
      return null;
    }    // 사용자 기술 스택 정보 조회 (user_skills 테이블이 있다면 정상적으로 조회)
    // user_skills 테이블은 user_id 대신 id를 사용할 수 있습니다
    const { data: skillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);

    if (skillsError && skillsError.code !== 'PGRST116') {
      console.error('기술 스택 정보를 가져오는 중 에러 발생:', skillsError);
      // 기술 스택 정보가 없어도 계속 진행
    }

    // 사용자 기술 스택 정보를 Skill 형태로 변환
    const skills: Skill[] = skillsData?.map((skill) => ({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      proficiency: skill.proficiency
    })) || [];    // 데이터베이스에서 가져온 정보와 UserData 타입 매핑
    if (data) {
      const userData: UserData = {
        nickname: data.nickname || '',
        realName: data.real_name || '',
        email: data.email || '',
        profileImage: data.profile_image || '/diverse-profile-avatars.png',
        bio: data.bio || '',
        githubConnected: data.github_connected || false,
        githubUsername: data.github_username || '',
        region: data.region || '',
        timezone: data.timezone || '',
        privacy: {
          profileVisibility: data.profile_visibility || 'public',
          showRealName: data.show_real_name || false,
          showEmail: data.show_email || false,
        },
        skills,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
        city: data.city,
        accountCreatedAt: accountCreatedAt || data.created_at || new Date().toISOString()
      };

      return userData;
    }

    return null;
  } catch (error) {
    console.error('사용자 프로필 정보를 가져오는 중 에러 발생:', error);
    return null;
  }
}

/**
 * 사용자 프로필 정보를 Supabase에 업데이트하는 함수
 * @param userId 사용자 ID
 * @param userData 업데이트할 사용자 데이터
 */
export async function updateUserProfile(userId: string, userData: Partial<UserData>): Promise<boolean> {
  try {    // 프로필 테이블에 저장할 데이터 준비
    const profileData = {
      nickname: userData.nickname,
      real_name: userData.realName,
      bio: userData.bio,
      github_connected: userData.githubConnected,
      github_username: userData.githubUsername,
      region: userData.region,
      timezone: userData.timezone,
      profile_visibility: userData.privacy?.profileVisibility,
      show_real_name: userData.privacy?.showRealName,
      show_email: userData.privacy?.showEmail,
      latitude: userData.latitude,
      longitude: userData.longitude,
      country: userData.country,
      city: userData.city,
    };// 프로필 정보 업데이트 - id 필드 사용
    const { error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('프로필 정보를 업데이트하는 중 에러 발생:', error);
      return false;
    }

    // 기술 스택 정보가 포함된 경우 업데이트
    if (userData.skills && userData.skills.length > 0) {      try {
        // 기존 기술 스택 정보 삭제
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('기존 기술 스택 정보를 삭제하는 중 에러 발생:', deleteError);
          // 에러가 있어도 계속 진행 (테이블이 없을 수 있음)
        }
      } catch (err) {
        console.error('기술 스택 정보 삭제 중 예외 발생:', err);
        // 계속 진행
      }

      // 새 기술 스택 정보 추가
      const skillsData = userData.skills.map(skill => ({
        user_id: userId,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        proficiency: skill.proficiency
      }));

      const { error: insertError } = await supabase
        .from('user_skills')
        .insert(skillsData);

      if (insertError) {
        console.error('기술 스택 정보를 추가하는 중 에러 발생:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('사용자 프로필을 업데이트하는 중 에러 발생:', error);
    return false;
  }
}
