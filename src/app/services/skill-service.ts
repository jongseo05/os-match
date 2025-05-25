
'use client';

import { supabase } from '../../lib/supabase/supabase';

/**
 * 사용자 스킬을 추가하는 함수
 * - 기존 스킬을 모두 삭제하고 새로운 스킬을 추가합니다
 */
export async function addUserSkills(userId: string, skills: { name: string; level: string; category: string; proficiency: number }[]) {
  try {
    // 1. 기존 사용자의 스킬을 모두 삭제
    const { error: deleteError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) throw deleteError;
    
    // 2. 새 스킬 추가
    if (skills.length === 0) {
      return { success: true }; // 스킬이 없는 경우 바로 종료
    }
    
    const { error } = await supabase
      .from('user_skills')
      .insert(
        skills.map(skill => ({
          user_id: userId,
          name: skill.name,
          level: skill.level,
          category: skill.category,
          proficiency: skill.proficiency,
        }))
      );
    
    return { success: true };
  } catch (error) {
    console.error('기술 스택 정보를 추가하는 중 에러 발생:', error);
    return { success: false, error };
  }
}