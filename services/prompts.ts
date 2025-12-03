import { ItemType, InventoryItem, Recipe } from "../types";

/**
 * 获取图像分析
 */
export function getImageAnalysisPrompt(type: ItemType): string {
  return type === ItemType.FRIDGE
    ? "识别这张图片中的所有食物。对于每个食物：如果是新鲜食材,请预估从今天(YYYY-MM-DD)开始的保质期;如果是包装食品,请尝试读取标签。为每个食物建议一个分类(如蔬菜、乳制品、肉类等)和数量。**最重要的是，为每个食物匹配一个最合适的 Emoji 表情符号**。请全部使用简体中文返回。如果图片中有多个物品,请全部识别出来。"
    : "识别这张图片中的所有衣物。对于每件衣物：建议一个分类(如上装、下装、鞋履、配饰等)、主要颜色、和适用季节(夏季、冬季、四季)。请全部使用简体中文返回。如果图片中有多件衣物,请全部识别出来。";
}

/**
 * 获取图像分析的 Schema (通用格式)
 */
export function getImageAnalysisSchema(type: ItemType) {
  const itemSchema = type === ItemType.FRIDGE
    ? {
      name: { type: "string", description: "食物名称 (中文)" },
      emoji: { type: "string", description: "代表该食物的 Emoji，如 🍎, 🥩, 🥛" },
      category: { type: "string", description: "类别,如蔬菜、水果、乳制品 (中文)" },
      expiryDate: { type: "string", description: "预估过期日期 YYYY-MM-DD" },
      quantity: { type: "string", description: "数量,例如 '1把', '500g', '1盒' (中文)" },
      suggestedUse: { type: "string", description: "简短的存储或食用建议 (中文)" },
    }
    : {
      name: { type: "string", description: "衣物名称 (中文)" },
      category: { type: "string", description: "类别,如上装、下装、外套 (中文)" },
      season: { type: "string", description: "适用季节 (中文)" },
      color: { type: "string", description: "主要颜色 (中文)" },
      suggestedUse: { type: "string", description: "简短的搭配建议 (中文)" },
    };

  return {
    items: {
      type: "array",
      description: "识别到的所有物品列表",
      items: {
        type: "object",
        properties: itemSchema,
        required: ["name", "category"]
      }
    },
    totalCount: {
      type: "number",
      description: "识别到的物品总数"
    }
  };
}

/**
 * 获取聊天的系统指令
 */
export function getChatSystemInstruction(
  inventory: InventoryItem[],
  recipes: Recipe[]
): string {
  const fridgeItems = inventory.filter(i => i.type === ItemType.FRIDGE);
  const wardrobeItems = inventory.filter(i => i.type === ItemType.WARDROBE);

  const fridgeList = fridgeItems.map(i => `- ${i.name} (${i.quantity || '1'}, ${i.expiryDate || '无日期'})`).join('\n');
  const wardrobeList = wardrobeItems.map(i => `- ${i.name} (${i.color || '无颜色'}, ${i.season || '全季'})`).join('\n');
  const recipeList = recipes.map(r => `- ${r.name} (标签: ${r.tags.join(', ')})`).join('\n');

  return `你是 ZenHome 的 AI 助手，一个优雅、极简、富有智慧的生活管家。
你的目标是帮助用户过上更正念（Mindful）、更有条理的生活。

你拥有用户当前的物品数据：

【冰箱食材】
${fridgeList || '(空)'}

【衣橱衣物】
${wardrobeList || '(空)'}

【私房菜谱】
${recipeList || '(空)'}

请遵循以下原则：
1. **基于数据回答**：当用户问“吃什么”时，优先推荐能消耗即将过期食材的食谱。当用户问“穿什么”时，基于衣橱库存搭配。
2. **极简主义**：回答言简意赅，不要长篇大论。
3. **正念生活**：鼓励用户减少浪费，珍惜物品，享受当下。
4. **格式美观**：使用 Markdown，适当使用 emoji，保持排版清晰。
5. **语言**：始终使用简体中文。

如果用户问的问题与物品管理无关，请礼貌地将话题引回到生活管理上，或者提供简短的生活建议。`;
}
