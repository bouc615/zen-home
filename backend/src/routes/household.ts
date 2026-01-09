import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  getHouseholdMembers,
  joinHousehold,
  leaveHousehold,
} from "../services/user";
import { verifyToken } from "../utils/jwt";

const router = Router();

/**
 * 中间件：从 token 中提取用户 ID
 */
function extractUserId(req: any): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded.userId;
}

// GET /api/household/members - 获取当前家庭成员列表
router.get(
  "/members",
  asyncHandler(async (req, res) => {
    const userId = extractUserId(req);

    // 获取当前用户信息以获取 household_id
    const { data: currentUser } = await require("../config/database")
      .supabase.from("users")
      .select("household_id")
      .eq("id", userId)
      .single();

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const members = await getHouseholdMembers(currentUser.household_id);
    res.json({ members });
  })
);

// POST /api/household/join - 加入指定用户的家庭
router.post(
  "/join",
  asyncHandler(async (req, res) => {
    const userId = extractUserId(req);
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "Missing targetUserId parameter" });
    }

    const updatedUser = await joinHousehold(userId, targetUserId);
    res.json({
      message: "Successfully joined household",
      user: {
        id: updatedUser.id,
        household_id: updatedUser.household_id,
      },
    });
  })
);

// POST /api/household/leave - 退出当前家庭
router.post(
  "/leave",
  asyncHandler(async (req, res) => {
    const userId = extractUserId(req);

    const updatedUser = await leaveHousehold(userId);
    res.json({
      message: "Successfully left household",
      user: {
        id: updatedUser.id,
        household_id: updatedUser.household_id,
      },
    });
  })
);

export default router;
