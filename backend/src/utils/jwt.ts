import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

/**
 * 生成 JWT token
 * @param payload 要加密的数据
 * @param expiresIn 过期时间，默认 30 天
 */
export function generateToken(
  payload: { userId: string; openid: string },
  expiresIn = "30d"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证 JWT token
 * @param token JWT token
 * @returns 解密后的数据
 */
export function verifyToken(token: string): { userId: string; openid: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; openid: string };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
