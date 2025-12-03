/**
 * OpenAI SDK 基础能力层
 * 只负责与 OpenAI API 的通信，不包含业务逻辑
 */

const OPENAI_BASE_URL = "https://zenmux.ai/api/openai/v1";

/**
 * 通用的 OpenAI API 请求
 */
async function request(apiKey: string, endpoint: string, body: any): Promise<any> {
  const response = await fetch(`${OPENAI_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 使用 OpenAI 进行视觉分析 (返回 JSON)
 */
export async function analyzeImageJSON(
  apiKey: string,
  model: string,
  base64Image: string,
  prompt: string,
  schema: Record<string, any>
): Promise<any> {
  const response = await request(apiKey, "/chat/completions", {
    model,
    messages: [{
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        { type: "text", text: prompt }
      ]
    }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "analysis_result",
        strict: true,
        schema: {
          type: "object",
          properties: schema,
          required: ["items", "totalCount"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * 使用 OpenAI 进行对话
 */
export async function chat(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; text: string }>,
  systemInstruction?: string
): Promise<string> {
  const formattedMessages = [];

  if (systemInstruction) {
    formattedMessages.push({
      role: "system",
      content: systemInstruction
    });
  }

  formattedMessages.push(
    ...messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.text
    }))
  );

  const response = await request(apiKey, "/chat/completions", {
    model,
    messages: formattedMessages
  });

  return response.choices[0].message.content || "";
}
