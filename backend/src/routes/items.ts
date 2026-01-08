import { Router } from 'express';
import { itemsService } from '../services/itemsService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/items - Get all items
router.get('/', asyncHandler(async (req, res) => {
  const items = await itemsService.getAllItems();
  res.json({ data: items });
}));

// POST /api/items - Create item
router.post('/', asyncHandler(async (req, res) => {
  const result = await itemsService.createItem(req.body);
  res.status(201).json(result);
}));

// PUT /api/items/:id - Update item
router.put('/:id', asyncHandler(async (req, res) => {
  await itemsService.updateItem(req.params.id, req.body);
  res.json({ message: 'Item updated successfully' });
}));

// DELETE /api/items/:id - Delete item
router.delete('/:id', asyncHandler(async (req, res) => {
  await itemsService.deleteItem(req.params.id);
  res.json({ message: 'Item deleted successfully' });
}));

export default router;
