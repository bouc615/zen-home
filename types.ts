
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  FRIDGE = 'FRIDGE',
  WARDROBE = 'WARDROBE',
  SETTINGS = 'SETTINGS',
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
  color?: string;      // For wardrobe
  season?: string;     // For wardrobe
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisResult {
  name: string;
  category: string;
  expiryDate?: string;
  season?: string;
  color?: string;
  quantity?: string;
  suggestedUse?: string;
}

export interface UserProfile {
  name: string;
  emails: string[];
}
