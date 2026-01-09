import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { supabase } from "../config/database";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// POST /api/upload - Upload file
router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;

    // Optimize image: resize and convert to WebP
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1920, 1920, {
        // Limit max dimension to 1920px (Full HD)
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    const fileName = `${Date.now()}-${file.originalname.split(".")[0]}.webp`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, optimizedBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    res.json({ url: urlData.publicUrl });
  })
);

export default router;
