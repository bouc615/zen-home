import request from "../utils/request";
import { API_ENDPOINTS } from "../config";
import {
  AnalysisResult,
  ChatMessage,
  InventoryItem,
  ItemType,
  Recipe,
} from "../types";

/**
 * AI 图像识别服务
 */
export async function analyzeImage(
  base64Image: string,
  type: ItemType
): Promise<AnalysisResult> {
  try {
    const result = await request.post<AnalysisResult>(
      API_ENDPOINTS.AI_ANALYZE_IMAGE,
      {
        image: base64Image,
        type,
      }
    );

    return result;
  } catch (error) {
    console.error("Analysis failed", error);
    return {
      items: [{ name: "未知物品", category: "未分类" }],
      totalCount: 1,
    };
  }
}

/**
 * AI 聊天服务
 */
export async function sendChatMessage(
  history: ChatMessage[],
  message: string,
  inventory: InventoryItem[],
  recipes: Recipe[]
): Promise<string> {
  try {
    // 简化 history 对象，只传输必要字段
    const simpleHistory = history.map((h) => ({ role: h.role, text: h.text }));

    const result = await request.post<{ text: string }>(API_ENDPOINTS.AI_CHAT, {
      history: simpleHistory,
      message,
      inventory,
      recipes,
    });

    if (result && result.text) {
      return result.text;
    }
    throw new Error("AI response format error");
  } catch (error) {
    console.error("Chat failed", error);
    return "抱歉，我现在有点累，请稍后再试。";
  }
}
