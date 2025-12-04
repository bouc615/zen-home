import { ItemType, InventoryItem, Recipe } from "../types";

/**
 * 获取图像分析
 */
export function getImageAnalysisPrompt(type: ItemType): string {
  return "识别这张图片中的所有食物。图片可能是冰箱内部照片，也可能是购物小票/收据。如果是小票，请提取上面的所有购买项。对于每个食物：如果是新鲜食材,请预估从今天(YYYY-MM-DD)开始的保质期;如果是包装食品,请尝试读取标签。为每个食物建议一个分类(如蔬菜、乳制品、肉类等)和数量。请全部使用简体中文返回。如果图片中有多个物品,请全部识别出来。";
}

/**
 * 获取图像分析的 Schema (通用格式)
 */
export function getImageAnalysisSchema(type: ItemType) {
  const itemSchema = {
    name: { type: "string", description: "食物名称 (中文)" },
    category: { type: "string", description: "类别,如蔬菜、水果、乳制品 (中文)" },
    expiryDate: { type: "string", description: "预估过期日期 YYYY-MM-DD" },
    quantity: { type: "string", description: "数量,例如 '1把', '500g', '1盒' (中文)" },
    suggestedUse: { type: "string", description: "简短的存储或食用建议 (中文)" },
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
  const fridgeItems = inventory.filter(i => i.type === ItemType.FRIDGE && (!i.status || i.status === 'active'));

  const fridgeList = fridgeItems.map(i => `- ${i.name} (${i.quantity || '1'}, ${i.expiryDate || '无日期'})`).join('\n');
  const recipeList = recipes.map(r => `- ${r.name} (标签: ${r.tags.join(', ')})`).join('\n');

  return `你是 ZenKitchen 的 AI 助手，一个优雅、极简、富有智慧的厨房管家。
你的目标是帮助用户过上更正念（Mindful）、更有条理的生活，减少食物浪费。

你拥有用户当前的物品数据：

【冰箱食材】
${fridgeList || '(空)'}

【私房菜谱】
${recipeList || '(空)'}

请遵循以下原则：
1. **基于数据回答**：当用户问"吃什么"时，优先推荐能消耗即将过期食材的食谱。
2. **极简主义**：回答言简意赅，不要长篇大论。
3. **正念生活**：鼓励用户减少浪费，珍惜食材，享受烹饪的过程。
4. **格式美观**：使用 Markdown，适当使用 emoji，保持排版清晰。
5. **语言**：始终使用简体中文。

如果用户问的问题与厨房管理无关，请礼貉地将话题引回到食材管理和烹饪上，或者提供简短的生活建议。`;
}
