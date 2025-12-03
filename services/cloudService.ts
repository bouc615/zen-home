import cloudbase from '@cloudbase/js-sdk';
import { InventoryItem, Recipe } from '../types';

// ============================================================================
// 初始化 CloudBase
// ============================================================================

const app = cloudbase.init({
  env: 'zen-home-v1-1gm9o896f89db45f', // 你的环境 ID
  region: 'ap-shanghai' // 你的环境地域
});

const db = app.database();
const auth = app.auth();

// 确保已登录 (匿名登录)
async function ensureAuth() {
  const loginState = await auth.getLoginState();
  if (!loginState) {
    await auth.signInAnonymously();
  }
}

// ============================================================================
// 物品管理 (Items)
// ============================================================================

const COLLECTION_ITEMS = 'items';

export async function fetchItems(): Promise<InventoryItem[]> {
  await ensureAuth();
  try {
    const res = await db.collection(COLLECTION_ITEMS).limit(1000).get();
    return res.data as InventoryItem[];
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return [];
  }
}

export async function addItem(item: InventoryItem): Promise<string> {
  await ensureAuth();
  const res = await db.collection(COLLECTION_ITEMS).add(item);
  return (res as any).id;
}

export async function updateItem(item: InventoryItem): Promise<void> {
  await ensureAuth();
  const { _id, ...data } = item as any; // Remove _id if present to avoid update error
  // Use item.id as the query key assuming we store our app's ID as a field, 
  // OR if we use CloudBase's _id, we should map it.
  // For simplicity, let's assume we use the 'id' field we generate in frontend as a unique key for query,
  // or better, we should use _id for updates if we have it.
  // Let's use the `id` field for query since that's what we have in our types.

  await db.collection(COLLECTION_ITEMS).where({ id: item.id }).update(data);
}

export async function deleteItem(itemId: string): Promise<void> {
  await ensureAuth();
  await db.collection(COLLECTION_ITEMS).where({ id: itemId }).remove();
}

// ============================================================================
// 菜谱管理 (Recipes)
// ============================================================================

const COLLECTION_RECIPES = 'recipes';

export async function fetchRecipes(): Promise<Recipe[]> {
  await ensureAuth();
  try {
    const res = await db.collection(COLLECTION_RECIPES).limit(1000).get();
    return res.data as Recipe[];
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }
}

export async function addRecipe(recipe: Recipe): Promise<string> {
  await ensureAuth();
  const res = await db.collection(COLLECTION_RECIPES).add(recipe);
  return (res as any).id;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await ensureAuth();
  const { _id, ...data } = recipe as any;
  await db.collection(COLLECTION_RECIPES).where({ id: recipe.id }).update(data);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await ensureAuth();
  await db.collection(COLLECTION_RECIPES).where({ id: recipeId }).remove();
}

// ============================================================================
// 文件存储 (Storage)
// ============================================================================

/**
 * 上传文件到云存储
 * @param file 文件对象
 * @returns 下载链接 (File ID or HTTPS URL)
 */
export async function uploadFile(file: File): Promise<string> {
  await ensureAuth();

  const ext = file.name.split('.').pop();
  const cloudPath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const res = await app.uploadFile({
      cloudPath: cloudPath,
      filePath: file as any
    });

    // 获取临时访问链接 (或者直接返回 fileID，前端展示时再换取)
    // 为了方便，这里我们直接换取一个较长有效期的临时链接，或者如果公开读，可以直接拼接 HTTP URL
    // 但 CloudBase 默认私有读写，建议返回 fileID，前端组件负责获取 URL。
    // 不过为了兼容现有逻辑 (imageUrl 是 string url)，我们这里直接获取一个临时链接。

    const { fileList } = await app.getTempFileURL({
      fileList: [res.fileID]
    });

    return fileList[0].tempFileURL;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
