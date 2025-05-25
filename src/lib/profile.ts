'use client';

import { supabase } from './supabase/supabase';
import type { UserData, Skill } from '../types/user';

// 현재 스킬 업데이트가 진행 중인 사용자 ID를 추적하기 위한 Set
const skillUpdateInProgress = new Set<string>();

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
  try {
    // 프로필 테이블에 저장할 데이터 준비 (기존과 동일)
    const profileDataToUpdate: any = {};
    if (userData.nickname !== undefined) profileDataToUpdate.nickname = userData.nickname;
    if (userData.realName !== undefined) profileDataToUpdate.real_name = userData.realName;
    if (userData.bio !== undefined) profileDataToUpdate.bio = userData.bio;
    if (userData.githubConnected !== undefined) profileDataToUpdate.github_connected = userData.githubConnected;
    if (userData.githubUsername !== undefined) profileDataToUpdate.github_username = userData.githubUsername;
    if (userData.region !== undefined) profileDataToUpdate.region = userData.region;
    if (userData.timezone !== undefined) profileDataToUpdate.timezone = userData.timezone;
    if (userData.privacy?.profileVisibility !== undefined) profileDataToUpdate.profile_visibility = userData.privacy.profileVisibility;
    if (userData.privacy?.showRealName !== undefined) profileDataToUpdate.show_real_name = userData.privacy.showRealName;
    if (userData.privacy?.showEmail !== undefined) profileDataToUpdate.show_email = userData.privacy.showEmail;
    if (userData.latitude !== undefined) profileDataToUpdate.latitude = userData.latitude;
    if (userData.longitude !== undefined) profileDataToUpdate.longitude = userData.longitude;
    if (userData.country !== undefined) profileDataToUpdate.country = userData.country;
    if (userData.city !== undefined) profileDataToUpdate.city = userData.city;
    
    // 업데이트할 필드가 있는 경우에만 프로필 업데이트 실행
    if (Object.keys(profileDataToUpdate).length > 0) {
        profileDataToUpdate.updated_at = new Date().toISOString(); // updated_at 타임스탬프 추가
        const { error: profileUpdateError } = await supabase
            .from('user_profiles')
            .update(profileDataToUpdate)
            .eq('id', userId);

        if (profileUpdateError) {
            console.error('프로필 정보를 업데이트하는 중 에러 발생:', profileUpdateError);
            return false;
        }
    }

    // 기술 스택 정보가 payload에 포함된 경우에만 기술 스택 업데이트 로직 실행
    if (userData.skills !== undefined) {
      // 동시 실행 방지 로직 시작
      if (skillUpdateInProgress.has(userId)) {
        console.warn(`Skill update for user_id: ${userId} is already in progress. Skipping this call.`);
        // 현재는 동시 호출을 오류로 처리하지 않고, 단순히 건너뛰도록 합니다.
        // 필요에 따라 false를 반환하여 호출자에게 실패를 알릴 수도 있습니다.
        return true; 
      }
      skillUpdateInProgress.add(userId);
      console.log(`Skill update lock acquired for user_id: ${userId}`);
      // 동시 실행 방지 로직 끝

      try {
        // 1. 기존 기술 스택 정보 모두 삭제
        console.log(`Attempting to delete existing skills for user_id: ${userId}`);
        const { data: deletedData, error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', userId)
          .select(); // 삭제된 행에 대한 정보를 반환받기 위해 .select() 추가

        if (deleteError) {
          console.error('기존 기술 스택 정보를 삭제하는 중 에러 발생 (raw):', deleteError);
          console.error('기존 기술 스택 정보를 삭제하는 중 에러 발생 (stringified):', JSON.stringify(deleteError, null, 2));
          return false; // 삭제 실패는 치명적이므로 중단
        } else {
          console.log(`Supabase delete operation for user_id: ${userId} completed without error.`);
          console.log('Deleted skills data (from Supabase):', JSON.stringify(deletedData, null, 2));
          if (deletedData && deletedData.length > 0) {
            console.log(`Number of skills reported as deleted: ${deletedData.length}`);
            if (deletedData.some(skill => skill.name === 'React')) {
              console.log("The 'React' skill was reported as deleted by Supabase among the deleted items.");
            } else {
              console.log("The 'React' skill was NOT found among the items reported as deleted by Supabase.");
            }
          } else {
            console.log("No skills were reported as deleted by Supabase (deletedData is null, undefined, or empty).");
          }
        }

        // 2. 새 기술 스택 정보 추가 (userData.skills가 빈 배열이 아닌 경우)
        if (userData.skills.length > 0) {
          const uniqueSkillsMap = new Map<string, Skill>();
          for (const skill of userData.skills) {
            if (skill.name) { 
              uniqueSkillsMap.set(skill.name, skill);
            }
          }
          const skillsToInsert = Array.from(uniqueSkillsMap.values());

          if (skillsToInsert.length > 0) {
            console.log(`Attempting to insert new skills for user_id: ${userId}`, JSON.stringify(skillsToInsert, null, 2));
            const { error: insertError } = await supabase
              .from('user_skills')
              .insert(skillsToInsert.map(skill => ({
                user_id: userId,
                name: skill.name,
                level: skill.level || '중',
                category: skill.category || '기타',
                proficiency: skill.proficiency || 50,
              })));

            if (insertError) {
              console.error('새 기술 스택 정보를 추가하는 중 에러 발생 (raw):', insertError);
              console.error('새 기술 스택 정보를 추가하는 중 에러 발생 (stringified):', JSON.stringify(insertError, null, 2));
              return false;
            }
            console.log(`Successfully inserted new skills for user_id: ${userId}`);
          }
        }
      } finally {
        skillUpdateInProgress.delete(userId);
        console.log(`Skill update lock released for user_id: ${userId}`);
      }
    }

    return true;
  } catch (error) {
    console.error('사용자 프로필을 업데이트하는 중 예외 발생:', error);
    // 스킬 업데이트 시도 중 외부 try-catch에서 에러가 잡힌 경우에도 잠금 해제 시도
    if (userData.skills !== undefined && skillUpdateInProgress.has(userId)) {
        skillUpdateInProgress.delete(userId);
        console.log(`Skill update lock released for user_id: ${userId} due to outer catch.`);
    }
    return false;
  }
}
