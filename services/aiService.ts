import { InventoryItem, ItemType, AnalysisResult, ChatMessage, Recipe } from "../types";
import * as VertexAI from "./vertexAI";
import * as OpenAI from "./openai";
import {
  getImageAnalysisPrompt,
  getImageAnalysisSchema,
  getChatSystemInstruction
} from "./prompts";

// ... (existing config and client setup)

/**
 * 发送聊天消息
 */
export async function sendChatMessage(
  history: ChatMessage[],
  message: string,
  inventory: InventoryItem[],
  recipes: Recipe[]
): Promise<string> {
  try {
    const systemInstruction = getChatSystemInstruction(inventory, recipes);

    // Construct messages array for API
    // Note: This is a simplified implementation. 
    // Ideally, we should map `history` to the specific provider's format.
    // For now, we'll assume a simple prompt concatenation or basic structure if supported.

    if (PROVIDER === "openai") {
      // OpenAI implementation (placeholder - assuming text-only chat for now)
      // You might need to implement a `chat` function in openai.ts
      // For now, let's just return a mock response if OpenAI is selected but not fully implemented for chat
      return "OpenAI Chat integration pending...";
    } else {
      const client = getVertexClient();
      // Vertex AI / Gemini often supports a list of messages
      // We need to adapt `history` + `message` to the format expected by `generateContent`
      // For simplicity, we'll concatenate for a single turn or use a chat session if available.
      // Here we use a simple single-turn generation with system instruction context.

      const fullPrompt = `${systemInstruction}\n\nUser History:\n${history.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nUser: ${message}\nModel:`;

      const result = await VertexAI.generateContent(client, MODEL, fullPrompt);
      return result;
    }
  } catch (error) {
    console.error("Chat failed", error);
    return "抱歉，我现在有点累，请稍后再试。";
  }
}

// ============================================================================
// 配置
// ============================================================================

const PROVIDER = process.env.ZENMUX_PROVIDER || "vertex-ai"; // "vertex-ai" | "openai"
const API_KEY = process.env.ZENMUX_API_KEY || "";
const MODEL = process.env.ZENMUX_MODEL || "google/gemini-3-pro-preview-free";

// ============================================================================
// 延迟初始化客户端 (避免在没有 API Key 时立即报错)
// ============================================================================

let vertexClient: ReturnType<typeof VertexAI.createVertexAIClient> | null = null;

function getVertexClient() {
  if (!API_KEY) {
    throw new Error("ZENMUX_API_KEY 环境变量未设置。请在 .env.local 中配置。");
  }
  if (!vertexClient) {
    vertexClient = VertexAI.createVertexAIClient(API_KEY);
  }
  return vertexClient;
}

// ============================================================================
// 业务逻辑层 - 统一导出接口
// ============================================================================

/**
 * 分析图像识别物品
 */
export async function analyzeImage(base64Image: string, type: ItemType): Promise<AnalysisResult> {
  try {
    const prompt = getImageAnalysisPrompt(type);
    const schema = getImageAnalysisSchema(type);

    let result: any;

    if (PROVIDER === "openai") {
      if (!API_KEY) {
        throw new Error("ZENMUX_API_KEY 环境变量未设置。请在 .env.local 中配置。");
      }
      result = await OpenAI.analyzeImageJSON(API_KEY, MODEL, base64Image, prompt, schema);
    } else {
      const client = getVertexClient();
      result = await VertexAI.analyzeImageJSON(client, MODEL, base64Image, prompt, schema);
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed", error);
    return {
      items: [{ name: "未知物品", category: "未分类" }],
      totalCount: 1
    };
  }
}


