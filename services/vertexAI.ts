import { GoogleGenAI, Type } from "@google/genai";

/**
 * Vertex AI 基础能力层
 * 只负责与 Vertex AI API 的通信，不包含业务逻辑
 */

export interface VertexAIClient {
  generateContent(params: {
    model: string;
    contents: any;
    config?: any;
  }): Promise<{ text?: string }>;

  // Expose the raw client for advanced usage like chat
  _rawClient: GoogleGenAI;
}

/**
 * 创建 Vertex AI 客户端
 */
export function createVertexAIClient(apiKey?: string): VertexAIClient {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  return {
    async generateContent(params) {
      return await client.models.generateContent(params);
    },
    _rawClient: client
  };
}

/**
 * 使用 Vertex AI 进行视觉分析 (返回 JSON)
 */
export async function analyzeImageJSON(
  client: VertexAIClient,
  model: string,
  base64Image: string,
  prompt: string,
  schema: Record<string, any>
): Promise<any> {
  // 转换 schema 为 Vertex AI 格式
  function convertSchema(schemaObj: any): any {
    if (schemaObj.type === "array") {
      return {
        type: Type.ARRAY,
        description: schemaObj.description,
        items: convertSchema(schemaObj.items)
      };
    } else if (schemaObj.type === "object") {
      const properties: Record<string, any> = {};
      for (const [key, value] of Object.entries(schemaObj.properties || {})) {
        properties[key] = convertSchema(value);
      }
      return {
        type: Type.OBJECT,
        properties,
        required: schemaObj.required || []
      };
    } else if (schemaObj.type === "string") {
      return {
        type: Type.STRING,
        description: schemaObj.description
      };
    } else if (schemaObj.type === "number") {
      return {
        type: Type.NUMBER,
        description: schemaObj.description
      };
    }
    return schemaObj;
  }

  const vertexSchema: Record<string, any> = {};
  for (const [key, value] of Object.entries(schema)) {
    vertexSchema[key] = convertSchema(value);
  }

  const response = await client.generateContent({
    model,
    contents: {
      role: 'user',
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: vertexSchema,
        required: ["items", "totalCount"],
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("No response from Vertex AI");
}

/**
 * 使用 Vertex AI 生成内容 (通用)
 */
export async function generateContent(
  client: VertexAIClient,
  model: string,
  prompt: string
): Promise<string> {
  const response = await client.generateContent({
    model,
    contents: prompt
  });

  return response.text || "";
}

/**
 * 使用 Vertex AI 进行多轮对话
 */
export async function chat(
  client: VertexAIClient,
  model: string,
  history: Array<{ role: string; text: string }>,
  message: string,
  systemInstruction?: string
): Promise<string> {
  // Convert history to GoogleGenAI format
  const formattedHistory = history.map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  const chatSession = client._rawClient.chats.create({
    model,
    history: formattedHistory,
    config: systemInstruction ? { systemInstruction } : undefined
  });

  const response = await chatSession.sendMessage({
    contents: message
  } as any);

  return response.text || "";
}

/**
 * 使用 Vertex AI 生成内容 (带降级策略)
 * 依次尝试模型列表，如果遇到资源耗尽错误则尝试下一个模型
 * 限额文档: https://ai.google.dev/gemini-api/docs/rate-limits?hl=zh-cn#usage-tiers
 */
export async function generateContentWithFallback(
  client: VertexAIClient,
  prompt: string,
  models: string[] = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-pro"]
): Promise<string> {
  for (const model of models) {
    try {
      return await generateContent(client, model, prompt);
    } catch (error: any) {
      // 检查是否为资源耗尽错误 (429 Resource Exhausted)
      // Google GenAI SDK 可能抛出不同的错误结构，这里尝试覆盖常见情况
      const isResourceExhausted =
        error.status === 429 ||
        error.code === 429 ||
        (error.message && /Resource.*exhausted/i.test(error.message)) ||
        (error.error && error.error.code === 429);

      if (isResourceExhausted) {
        console.warn(`Model ${model} exhausted, trying next...`);
        continue;
      }

      // 如果是其他错误 (如模型不存在, 参数错误等), 直接抛出
      throw error;
    }
  }

  throw new Error("所有模型均已超限，请稍后重试");
}
