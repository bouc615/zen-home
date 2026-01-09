import request from "../utils/request";
import { API_ENDPOINTS } from "../config";
import { InventoryItem, Recipe } from "../types";

/**
 * 物品管理 API
 */

export async function fetchItems(): Promise<InventoryItem[]> {
  try {
    const response = await request.get<{ data: InventoryItem[] }>(
      API_ENDPOINTS.ITEMS
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return [];
  }
}

export async function addItem(item: InventoryItem): Promise<string> {
  const response = await request.post<{ id: string }>(
    API_ENDPOINTS.ITEMS,
    item
  );
  return response.id;
}

export async function updateItem(item: InventoryItem): Promise<void> {
  await request.put(API_ENDPOINTS.ITEM_BY_ID(item.id), item);
}

export async function deleteItem(item: InventoryItem): Promise<void> {
  await request.delete(API_ENDPOINTS.ITEM_BY_ID(item.id));
}

/**
 * 食谱管理 API
 */

export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await request.get<{ data: Recipe[] }>(
      API_ENDPOINTS.RECIPES
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }
}

export async function addRecipe(recipe: Recipe): Promise<string> {
  const response = await request.post<{ id: string }>(
    API_ENDPOINTS.RECIPES,
    recipe
  );
  return response.id;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await request.put(API_ENDPOINTS.RECIPE_BY_ID(recipe.id), recipe);
}

export async function deleteRecipe(recipe: Recipe): Promise<void> {
  await request.delete(API_ENDPOINTS.RECIPE_BY_ID(recipe.id));
}

/**
 * 文件上传 API
 */

export async function uploadFile(filePath: string): Promise<string> {
  return await request.uploadFile(filePath);
}
