import { InventoryItem, ItemType, AnalysisResult, ChatMessage, Recipe } from "../types";
import { callFunction } from "./cloudService";

/**
 * 发送聊天消息
 * 目前使用 CloudBase 云函数 'ai-chat'
 * 后期可替换为自定义服务器接口
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

    const result = await callFunction('ai-chat', {
      history: simpleHistory,
      message,
      inventory,
      recipes
    });

    if (result && result.text) {
      return result.text;
    }
    throw new Error('AI response format error');
  } catch (error) {
    console.error("Chat failed", error);
    return "抱歉，我现在有点累，请稍后再试。";
  }
}

/**
 * 分析图像识别物品
 * 目前使用 CloudBase 云函数 'ai-vision'
 * 后期可替换为自定义服务器接口
 */
export async function analyzeImage(base64Image: string, type: ItemType): Promise<AnalysisResult> {
  try {
    const result = await callFunction('ai-vision', {
      image: base64Image,
      type
    });

    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed", error);
    return {
      items: [{ name: "未知物品", category: "未分类" }],
      totalCount: 1
    };
  }
}
