import { Router } from "express";
import { recipesService } from "../services/recipesService";
import { asyncHandler } from "../middleware/errorHandler";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/database";

const router = Router();

/**
 * 中间件：从 token 中提取用户信息
 */
async function getUserInfo(
  req: any
): Promise<{ userId: string; householdId: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  // 获取用户的 household_id
  const { data: user } = await supabase
    .from("users")
    .select("household_id")
    .eq("id", decoded.userId)
    .single();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId: decoded.userId,
    householdId: user.household_id,
  };
}

// GET /api/recipes - Get all recipes for the user's household
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { householdId } = await getUserInfo(req);
    const recipes = await recipesService.getAllRecipes(householdId);
    res.json({ data: recipes });
  })
);

// POST /api/recipes - Create recipe
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { userId, householdId } = await getUserInfo(req);
    const result = await recipesService.createRecipe(
      req.body,
      userId,
      householdId
    );
    res.status(201).json(result);
  })
);

// PUT /api/recipes/:id - Update recipe
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    await recipesService.updateRecipe(req.params.id, req.body);
    res.json({ message: "Recipe updated successfully" });
  })
);

// DELETE /api/recipes/:id - Delete recipe
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await recipesService.deleteRecipe(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  })
);

export default router;
