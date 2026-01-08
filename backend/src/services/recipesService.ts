import { supabase, TABLES } from '../config/database';
import { Recipe } from '../types';

export class RecipesService {
  /**
   * Get all recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from(TABLES.RECIPES)
      .select('*')
      .order('added_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from(TABLES.RECIPES)
      .insert([recipe])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`);
    }

    return { id: data.id };
  }

  /**
   * Update a recipe
   */
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    const { error } = await supabase
      .from(TABLES.RECIPES)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`);
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    const { error} = await supabase
      .from(TABLES.RECIPES)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }
}

export const recipesService = new RecipesService();
