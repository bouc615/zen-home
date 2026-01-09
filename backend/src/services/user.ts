import { supabase } from "../config/database";
import { User } from "../types/auth";

/**
 * 根据 openid 查找用户
 */
export async function findUserByOpenid(openid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("openid", openid)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 未找到用户
      return null;
    }
    throw error;
  }

  return data as User;
}

/**
 * 创建新用户
 * 默认 household_id 等于自己的 id（隐形家庭模型）
 */
export async function createUser(
  openid: string,
  sessionKey: string,
  unionid?: string
): Promise<User> {
  // 第一步：创建用户（household_id 暂时为空）
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      openid,
      session_key: sessionKey,
      unionid,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  // 第二步：将 household_id 设置为自己的 id
  const { data, error: updateError } = await supabase
    .from("users")
    .update({
      household_id: newUser.id,
    })
    .eq("id", newUser.id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return data as User;
}

/**
 * 更新用户的 session_key
 */
export async function updateUserSessionKey(
  openid: string,
  sessionKey: string
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({
      session_key: sessionKey,
      updated_at: new Date().toISOString(),
    })
    .eq("openid", openid)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}

/**
 * 获取家庭成员列表
 */
export async function getHouseholdMembers(
  householdId: string
): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, openid, created_at")
    .eq("household_id", householdId);

  if (error) {
    throw error;
  }

  return data as User[];
}

/**
 * 加入指定用户的家庭
 */
export async function joinHousehold(
  userId: string,
  targetUserId: string
): Promise<User> {
  // 获取目标用户的 household_id
  const { data: targetUser, error: targetError } = await supabase
    .from("users")
    .select("household_id")
    .eq("id", targetUserId)
    .single();

  if (targetError) {
    throw new Error("Target user not found");
  }

  // 更新当前用户的 household_id
  const { data, error } = await supabase
    .from("users")
    .update({
      household_id: targetUser.household_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}

/**
 * 退出家庭（恢复为独立家庭）
 */
export async function leaveHousehold(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({
      household_id: userId, // 恢复为自己的 id
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}
