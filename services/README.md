# AI Service

简洁的 AI 服务实现，采用分层架构，支持通过环境变量切换 Vertex AI 和 OpenAI SDK。

## 📁 文件结构

```
services/
├── aiService.ts    # 业务逻辑层 - 统一入口
├── prompts.ts      # 公共业务逻辑 - Prompt/Schema/格式化
├── vertexAI.ts     # 基础能力层 - Vertex AI API
├── openai.ts       # 基础能力层 - OpenAI API
└── README.md       # 本文档
```

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│   业务逻辑层 (aiService.ts)         │
│   - analyzeImage()                  │
│   - sendChatMessage()               │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
┌──────────────▼──────────┐  ┌──────────▼──────────┐
│  公共业务逻辑            │  │  基础能力层          │
│  (prompts.ts)           │  │  - vertexAI.ts      │
│  - Prompts              │  │  - openai.ts        │
│  - Schemas              │  │                     │
│  - 格式化函数            │  │  纯 API 调用         │
└─────────────────────────┘  └─────────────────────┘
```

### 职责划分

1. **aiService.ts** - 业务逻辑层
   - 统一的对外接口
   - 路由到不同的 AI 提供商
   - 错误处理和 fallback

2. **prompts.ts** - 公共业务逻辑
   - Prompt 模板
   - Schema 定义
   - 数据格式化函数
   - **无重复代码**

3. **vertexAI.ts** - Vertex AI 基础能力
   - 纯粹的 API 调用
   - 不包含业务逻辑
   - 可复用的基础函数

4. **openai.ts** - OpenAI 基础能力
   - 纯粹的 API 调用
   - 不包含业务逻辑
   - 可复用的基础函数

## ✨ 核心功能

### 1. 图像识别 - 支持多物品识别

```typescript
import { analyzeImage } from "./services/aiService";
import { ItemType } from "./types";

const result = await analyzeImage(base64Image, ItemType.FRIDGE);

// 返回格式
{
  items: [
    { name: "牛奶", category: "乳制品", expiryDate: "2025-12-10", ... },
    { name: "鸡蛋", category: "蛋类", quantity: "12个", ... }
  ],
  totalCount: 2
}
```

**特性:**
- ✅ 自动识别图片中的**所有物品**
- ✅ 为每个物品提供详细信息
- ✅ 返回识别到的物品总数
- ✅ 单个物品：打开编辑框确认
- ✅ 多个物品：批量自动添加

### 2. AI 聊天对话

```typescript
import { sendChatMessage } from "./services/aiService";

const response = await sendChatMessage(
  history, 
  "推荐一道菜", 
  inventory, 
  ItemType.FRIDGE
);
```

## 使用方法

```typescript
import { analyzeImage, sendChatMessage } from "./services/aiService";
import { ItemType } from "./types";

// 图像分析 - 支持识别多个物品
const result = await analyzeImage(base64Image, ItemType.FRIDGE);
console.log(`识别到 ${result.totalCount} 个物品`);
result.items.forEach(item => {
  console.log(`- ${item.name} (${item.category})`);
});

// 聊天
const response = await sendChatMessage(history, message, inventory, ItemType.FRIDGE);
```

## 环境变量配置

在 `.env.local` 中设置：

```bash
# 必需
ZENMUX_API_KEY=sk-ai-v1-your-api-key

# 可选 (默认: vertex-ai)
ZENMUX_PROVIDER=vertex-ai    # 或 "openai"

# 可选 (默认: google/gemini-3-pro-preview-free)
ZENMUX_MODEL=google/gemini-3-pro-preview-free
```

## 切换提供商

### 使用 Vertex AI (默认)
```bash
ZENMUX_PROVIDER=vertex-ai
```

### 使用 OpenAI SDK
```bash
ZENMUX_PROVIDER=openai
```

## ✨ 架构优势

- ✅ **分层清晰** - 业务逻辑与基础能力分离
- ✅ **无重复代码** - Prompt/Schema 统一管理
- ✅ **易于测试** - 每层可独立测试
- ✅ **易于扩展** - 添加新提供商只需实现基础能力层
- ✅ **职责单一** - 每个文件只负责一件事
- ✅ **可维护** - 修改业务逻辑不影响 AI 调用
- ✅ **多物品识别** - 自动识别图片中的所有物品

## 🔧 扩展新的 AI 提供商

只需 3 步：

1. 创建新的基础能力文件 (如 `anthropic.ts`)
2. 实现 `analyzeImageJSON()` 和 `chat()` 函数
3. 在 `aiService.ts` 中添加路由逻辑

业务逻辑完全复用，无需修改！
