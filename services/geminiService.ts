import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, ItemType, ChatMessage, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an uploaded image to identify the item and extract details.
 */
export const analyzeImage = async (
  base64Image: string,
  type: ItemType
): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash"; // Efficient for vision tasks

  const prompt = type === ItemType.FRIDGE
    ? "识别这个食物。如果是新鲜食材，请预估从今天(YYYY-MM-DD)开始的保质期；如果是包装食品，请尝试读取标签。建议一个分类（如蔬菜、乳制品、肉类等）和数量。请全部使用简体中文返回。"
    : "识别这件衣物。建议一个分类（如上装、下装、鞋履、配饰等）、主要颜色、和适用季节（夏季、冬季、四季）。请全部使用简体中文返回。";

  // Define schema based on item type
  const schemaProperties = type === ItemType.FRIDGE
    ? {
        name: { type: Type.STRING, description: "食物名称 (中文)" },
        category: { type: Type.STRING, description: "类别，如蔬菜、水果、乳制品 (中文)" },
        expiryDate: { type: Type.STRING, description: "预估过期日期 YYYY-MM-DD" },
        quantity: { type: Type.STRING, description: "数量，例如 '1把', '500g', '1盒' (中文)" },
        suggestedUse: { type: Type.STRING, description: "简短的存储或食用建议 (中文)" },
      }
    : {
        name: { type: Type.STRING, description: "衣物名称 (中文)" },
        category: { type: Type.STRING, description: "类别，如上装、下装、外套 (中文)" },
        season: { type: Type.STRING, description: "适用季节 (中文)" },
        color: { type: Type.STRING, description: "主要颜色 (中文)" },
        suggestedUse: { type: Type.STRING, description: "简短的搭配建议 (中文)" },
      };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: ["name", "category"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No JSON response text");
  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback if AI fails
    return {
      name: "未知物品",
      category: "未分类",
    };
  }
};

/**
 * Chat with the inventory context.
 */
export const sendChatMessage = async (
  history: ChatMessage[],
  message: string,
  inventory: InventoryItem[],
  currentContext: ItemType
): Promise<string> => {
  const modelId = "gemini-2.5-flash";

  // Filter inventory relevant to the current context
  const relevantItems = inventory.filter(i => i.type === currentContext);
  const inventoryList = relevantItems.map(i =>
    `- ${i.name} (${i.category}) ${currentContext === ItemType.FRIDGE ? `[过期: ${i.expiryDate}]` : `[颜色: ${i.color}]`}`
  ).join("\n");

  const systemInstruction = `你是 DWell，一个优雅、精致的生活方式 AI 顾问。
  用户正在询问关于 ${currentContext === ItemType.FRIDGE ? '厨房/冰箱食材' : '衣橱/穿搭'} 的问题。
  
  当前用户的库存物品:
  ${inventoryList}

  风格与语调:
  - 务必使用**简体中文**回答。
  - 语气优雅、乐于助人，如同高端生活杂志的编辑或专业的私人管家。
  - 既然是“Bento Grid”和“Soft Glass”风格的 App，你的语言也应该保持极简和通透感。
  - 如果用户询问食谱，请优先基于现有食材推荐。
  - 如果用户询问穿搭，请基于现有衣物进行搭配。
  
  格式:
  - 使用 Markdown 格式。
  - 保持排版美观（使用项目符号、短段落）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "此刻我无法连接到灵感库，请稍后再试。";
  } catch (error) {
    console.error("Chat failed", error);
    return "我的思绪正在进行数字冥想，请稍后再试。";
  }
};