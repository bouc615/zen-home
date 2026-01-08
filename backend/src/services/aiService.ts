import { openai, AI_CONFIG } from "../config/ai";
import { AnalysisResult, ChatMessage, InventoryItem, Recipe } from "../types";

export class AIService {
  /**
   * Analyze image to recognize items
   */
  async analyzeImage(
    base64Image: string,
    type: string
  ): Promise<AnalysisResult> {
    try {
      const prompt = `你是一个智能食材识别助手。请分析这张图片，识别出其中的食材。
对于每个食材，请提供：
1. name: 食材名称（中文）
2. category: 分类（如：蔬菜、水果、肉类、海鲜、乳制品、饮品、调味品、零食、其他）
3. emoji: 合适的 emoji 表情
4. quantity: 估计的数量（如：1个、500g、1瓶等）

请以 JSON 格式返回，格式如下：
{
  "items": [
    {
      "name": "牛奶",
      "category": "乳制品",
      "emoji": "🥛",
      "quantity": "1瓶"
    }
  ],
  "totalCount": 1
}

只返回 JSON，不要其他文字。`;

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL_ID,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
      });

      const content = response.choices[0].message.content || "";

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse AI response");
    } catch (error: any) {
      console.error("AI image analysis failed:", error.message);
      return {
        items: [{ name: "未知物品", category: "未分类" }],
        totalCount: 1,
      };
    }
  }

  /**
   * Chat with AI assistant
   */
  async chat(
    history: ChatMessage[],
    message: string,
    inventory: InventoryItem[],
    recipes: Recipe[]
  ): Promise<string> {
    try {
      // Simplified system prompt for faster responses
      const systemPrompt = `你是一个智能厨房助手，可以帮助用户管理食材和推荐食谱。请简洁友好地回答问题。`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...history.slice(-5).map((msg) => ({
          // Only keep last 5 messages for context
          role: msg.role === "model" ? "assistant" : msg.role,
          content: msg.text,
        })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL_ID,
        messages,
        max_tokens: 500, // Reduced for faster responses
        temperature: 0.7,
      });

      return response.choices[0].message.content || "抱歉，我没有回复。";
    } catch (error: any) {
      console.error("AI chat failed:", error.message);
      return "抱歉，我现在有点累，请稍后再试。";
    }
  }
}

export const aiService = new AIService();
