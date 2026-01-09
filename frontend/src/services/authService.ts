import Taro from "@tarojs/taro";
import { API_ENDPOINTS } from "../config";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    openid: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * 微信小程序登录
 * @returns 登录响应，包含 token 和用户信息
 */
export async function wechatLogin(): Promise<LoginResponse> {
  // 1. 调用微信登录获取 code
  const { code } = await Taro.login();

  if (!code) {
    throw new Error("Failed to get WeChat login code");
  }

  // 2. 将 code 发送到后端
  const response = await Taro.request<LoginResponse>({
    url: `${API_ENDPOINTS.BASE_URL}/auth/login`,
    method: "POST",
    data: { code },
    header: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode !== 200 || !response.data) {
    throw new Error("Login failed");
  }

  return response.data;
}

/**
 * 保存登录 token 到本地存储
 */
export function saveToken(token: string): void {
  Taro.setStorageSync("auth_token", token);
}

/**
 * 获取本地存储的 token
 */
export function getToken(): string | null {
  try {
    return Taro.getStorageSync("auth_token");
  } catch {
    return null;
  }
}

/**
 * 清除本地存储的 token
 */
export function clearToken(): void {
  Taro.removeStorageSync("auth_token");
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}
