import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { code2Session } from "../services/wechat";
import {
  findUserByOpenid,
  createUser,
  updateUserSessionKey,
} from "../services/user";
import { generateToken, verifyToken } from "../utils/jwt";
import { WeChatLoginRequest, LoginResponse } from "../types/auth";

const router = Router();

function extractUserId(req: any): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded.userId;
}

// GET /api/auth/me - 获取当前用户信息
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const userId = extractUserId(req);

    const { data: user } = await require("../config/database")
      .supabase.from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  })
);

// POST /api/auth/login - 微信小程序登录
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { code } = req.body as WeChatLoginRequest;

    if (!code) {
      return res.status(400).json({ error: "Missing code parameter" });
    }

    // 1. 调用微信接口获取 openid 和 session_key
    const wechatData = await code2Session(code);
    const { openid, session_key, unionid } = wechatData;

    // 2. 查找或创建用户
    let user = await findUserByOpenid(openid);

    if (user) {
      // 用户已存在，更新 session_key
      user = await updateUserSessionKey(openid, session_key);
    } else {
      // 创建新用户
      user = await createUser(openid, session_key, unionid);
    }

    // 3. 生成 JWT token
    const token = generateToken({
      userId: user.id,
      openid: user.openid,
    });

    // 4. 返回 token 和用户信息
    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        household_id: user.household_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };

    res.json(response);
  })
);

export default router;
