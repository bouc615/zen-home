import { Router } from 'express';
import { recipesService } from '../services/recipesService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/recipes - Get all recipes
router.get('/', asyncHandler(async (req, res) => {
  const recipes = await recipesService.getAllRecipes();
  res.json({ data: recipes });
}));

// POST /api/recipes - Create recipe
router.post('/', asyncHandler(async (req, res) => {
  const result = await recipesService.createRecipe(req.body);
  res.status(201).json(result);
}));

// PUT /api/recipes/:id - Update recipe
router.put('/:id', asyncHandler(async (req, res) => {
  await recipesService.updateRecipe(req.params.id, req.body);
  res.json({ message: 'Recipe updated successfully' });
}));

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', asyncHandler(async (req, res) => {
  await recipesService.deleteRecipe(req.params.id);
  res.json({ message: 'Recipe deleted successfully' });
}));

export default router;
