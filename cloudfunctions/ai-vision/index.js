const { GoogleGenAI, Type } = require("@google/genai");

// ⚠️ 必须在云函数配置中设置环境变量 GEMINI_API_KEY
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.main = async (event, context) => {
  const { image, type } = event; // image is base64 string

  try {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `分析这张图片，识别其中的${type === 'fridge' ? '食材' : '物品'}。
    请返回一个严格的 JSON 对象，包含 items 数组和 totalCount。
    
    每个 item 应包含以下字段:
    - name: 物品名称 (中文)
    - category: 分类 (如: 蔬菜, 水果, 肉类, 饮料, 调味品, 其他)
    - quantity: 数量估算 (字符串, 如 "1个", "500g")
    - expiryDate: 预估过期时间 (YYYY-MM-DD, 基于常见保质期推算，从今天 ${today} 开始)
    - emoji: 代表该物品的 emoji
    `;

    // 定义 Schema
    const schema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              quantity: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              emoji: { type: Type.STRING }
            },
            required: ["name", "category"]
          }
        },
        totalCount: { type: Type.NUMBER }
      },
      required: ["items", "totalCount"]
    };

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: 'user',
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    // @google/genai SDK 通常会自动解析 JSON 如果 responseMimeType 是 application/json
    // 但为了保险，我们检查 response.text
    if (response.text) {
      // 如果 SDK 已经返回对象，response.text 可能是 undefined 或者 string
      // 在新版 SDK 中，如果配置了 JSON schema，response.parsed 可能会有值，或者 text 是 JSON 字符串
      try {
        return JSON.parse(response.text);
      } catch (e) {
        return response.text; // 假设它已经是对象，或者无法解析
      }
    } else if (response.parsed) {
      return response.parsed;
    }

    // Fallback
    return JSON.parse(JSON.stringify(response));

  } catch (error) {
    console.error("AI Vision Error:", error);
    return {
      items: [],
      totalCount: 0,
      error: error.message
    };
  }
};
