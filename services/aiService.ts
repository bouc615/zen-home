import { InventoryItem, ItemType, AnalysisResult, ChatMessage, Recipe } from "../types";
import { callAI, callImageAnalysis } from "./cloudService";

/**
 * 发送聊天消息 (Delegates to Cloud Function)
 */
export async function sendChatMessage(
  history: ChatMessage[],
  message: string,
  inventory: InventoryItem[],
  recipes: Recipe[]
): Promise<string> {
  try {
    // 简化 history 对象，只传输必要字段
    const simpleHistory = history.map(h => ({ role: h.role, text: h.text }));

    const responseText = await callAI(simpleHistory, message, inventory, recipes);
    return responseText;
  } catch (error) {
    console.error("Chat failed", error);
    return "抱歉，我现在有点累，请稍后再试。";
  }
}

/**
 * 分析图像识别物品 (Delegates to Cloud Function)
 */
export async function analyzeImage(base64Image: string, type: ItemType): Promise<AnalysisResult> {
  try {
    const result = await callImageAnalysis(base64Image, type);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed", error);
    return {
      items: [{ name: "未知物品", category: "未分类" }],
      totalCount: 1
    };
  }
}


