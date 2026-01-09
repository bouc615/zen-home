// WeChat Mini Program Login Types

export interface WeChatLoginRequest {
  code: string; // 微信登录凭证
}

export interface WeChatCode2SessionResponse {
  openid: string; // 用户唯一标识
  session_key: string; // 会话密钥
  unionid?: string; // 用户在开放平台的唯一标识符（需要满足UnionID获取条件）
  errcode?: number; // 错误码
  errmsg?: string; // 错误信息
}

export interface LoginResponse {
  token: string; // 自定义 JWT token
  user: {
    id: string;
    openid: string;
    household_id: string;
    created_at: string;
    updated_at: string;
  };
}

export interface User {
  id: string;
  openid: string;
  unionid?: string;
  session_key: string;
  household_id: string; // 家庭ID：默认等于自己的id，加入他人家庭后指向户主的household_id
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  openid: string;
  created_at: string;
}
