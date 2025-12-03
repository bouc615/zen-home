
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  FRIDGE = 'FRIDGE',
  WARDROBE = 'WARDROBE',
  SETTINGS = 'SETTINGS',
  RECIPES = 'RECIPES',
}

export enum ItemType {
  FRIDGE = 'FRIDGE',
  WARDROBE = 'WARDROBE',
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  imageUrl: string;
  addedAt: number;
  // Specific fields
  expiryDate?: string; // For fridge
  quantity?: string;   // For fridge
  emoji?: string;      // For fridge items instead of image
  color?: string;      // For wardrobe
  season?: string;     // For wardrobe
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[]; // e.g., "Spicy", "Quick", "Dinner"
  ingredients: string; // Stored as text for simplicity or JSON string
  steps: string;       // Stored as text for simplicity
  addedAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ItemAnalysis {
  name: string;
  category: string;
  emoji?: string;
  expiryDate?: string;
  season?: string;
  color?: string;
  quantity?: string;
  suggestedUse?: string;
}

export interface AnalysisResult {
  items: ItemAnalysis[];
  totalCount: number;
}

export interface UserProfile {
  name: string;
  emails: string[];
}
