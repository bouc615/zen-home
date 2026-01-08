import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// POST /api/upload - Upload file
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = `uploads/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  res.json({ url: urlData.publicUrl });
}));

export default router;
