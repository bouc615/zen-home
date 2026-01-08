import OpenAI from "openai";
import { LLM_BASE_URL, LLM_API_KEY, LLM_MODEL_ID } from "./env";

// Create OpenAI client for ZenMux API
export const openai = new OpenAI({
  baseURL: LLM_BASE_URL,
  apiKey: LLM_API_KEY,
});

export const AI_CONFIG = {
  MODEL_ID: LLM_MODEL_ID,
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
} as const;
