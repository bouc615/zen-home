import { Router } from 'express';
import { aiService } from '../services/aiService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// POST /api/ai/analyze-image - Analyze image
router.post('/analyze-image', asyncHandler(async (req, res) => {
  const { image, type } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const result = await aiService.analyzeImage(image, type);
  res.json(result);
}));

// POST /api/ai/chat - Chat with AI
router.post('/chat', asyncHandler(async (req, res) => {
  const { history, message, inventory, recipes } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = await aiService.chat(
    history || [],
    message,
    inventory || [],
    recipes || []
  );
  
  res.json({ text: response });
}));

export default router;
