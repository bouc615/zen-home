// API 配置
export const API_CONFIG = {
  // 后端 API 基础 URL，开发环境可以使用本地地址
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://your-api-domain.com/api"
      : "http://localhost:3000/api",

  // 超时时间（毫秒）
  TIMEOUT: 10000,
};

// API 端点
export const API_ENDPOINTS = {
  // 物品管理
  ITEMS: "/items",
  ITEM_BY_ID: (id: string) => `/items/${id}`,

  // 食谱管理
  RECIPES: "/recipes",
  RECIPE_BY_ID: (id: string) => `/recipes/${id}`,

  // AI 服务
  AI_ANALYZE_IMAGE: "/ai/analyze-image",
  AI_CHAT: "/ai/chat",

  // 文件上传
  UPLOAD: "/upload",
};
