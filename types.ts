
export enum AppView {
  FRIDGE = 'FRIDGE',
  RECIPES = 'RECIPES',
  SETTINGS = 'SETTINGS',
}

export enum ItemType {
  FRIDGE = 'FRIDGE',
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
  iconName?: string;   // Custom icon name (overrides auto-selection)
  notes?: string;
  status?: 'active' | 'consumed' | 'wasted';
  consumedAt?: number;
  wastedAt?: number;
  usageProgress?: number; // 0-100, percentage of usage
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
  avatar?: string;
}
