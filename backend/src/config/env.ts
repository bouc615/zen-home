import { config } from "dotenv";
import { z } from "zod";

// Load environment variables
config();

// Define environment schema
const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // AI
  LLM_MODEL_ID: z.string(),
  LLM_API_KEY: z.string(),
  LLM_BASE_URL: z.string().url(),

  // CORS
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  // WeChat Mini Program
  WECHAT_APPID: z.string(),
  WECHAT_APP_SECRET: z.string(),

  // JWT
  JWT_SECRET: z
    .string()
    .default("your-super-secret-jwt-key-change-in-production"),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

// Export individual variables for convenience
export const {
  PORT,
  NODE_ENV,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  LLM_MODEL_ID,
  LLM_API_KEY,
  LLM_BASE_URL,
  ALLOWED_ORIGINS,
  WECHAT_APPID,
  WECHAT_APP_SECRET,
  JWT_SECRET,
} = env;
