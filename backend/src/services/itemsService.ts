import { supabase, TABLES } from '../config/database';
import { InventoryItem } from '../types';

export class ItemsService {
  /**
   * Get all items
   */
  async getAllItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from(TABLES.ITEMS)
      .select('*')
      .order('added_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new item
   */
  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from(TABLES.ITEMS)
      .insert([item])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return { id: data.id };
  }

  /**
   * Update an item
   */
  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const { error } = await supabase
      .from(TABLES.ITEMS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`);
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.ITEMS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  }
}

export const itemsService = new ItemsService();
