const { GoogleGenAI } = require("@google/genai");

// 初始化客户端
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // Ensure fetch is available in the environment
  fetch: global.fetch
});

exports.main = async (event, context) => {
  const { history = [], message, inventory = [], recipes = [] } = event;

  try {
    // 1. 构建系统提示词
    const systemInstruction = `你是一个智能厨房管家。你的目标是帮助用户管理冰箱库存、减少食物浪费，并根据现有食材推荐食谱。

当前冰箱库存:
${JSON.stringify(inventory.map(i => `${i.name} (${i.quantity || '适量'}) - ${i.expiryDate || '无有效期'}`), null, 2)}

用户收藏的菜谱:
${JSON.stringify(recipes.map(r => r.name), null, 2)}

请根据用户的输入提供帮助。如果用户询问"吃什么"，请优先基于当前库存推荐。回答要简洁、友好。`;

    // 2. 转换历史记录格式
    const chatHistory = history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));

    // 3. 调用 Gemini (使用 @google/genai SDK)
    const chat = client.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
      config: {
        systemInstruction: systemInstruction
      }
    });

    // 发送消息
    // SDK expects an object with a 'message' property containing the text or parts
    const result = await chat.sendMessage({
      message: message
    });

    return {
      text: result.text
    };

  } catch (error) {
    console.error("AI Chat Error:", error);
    return {
      error: error.message,
      text: "抱歉，我遇到了一些问题，请稍后再试。"
    };
  }
};
