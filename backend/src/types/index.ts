export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  category: string;
  image_url?: string;
  emoji?: string;
  expiry_date?: string;
  quantity?: string;
  notes?: string;
  status?: 'active' | 'consumed' | 'wasted';
  usage_progress?: number;
  added_at: number;
  consumed_at?: number;
  wasted_at?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Recipe {
  id: string;
  name: string;
  image_url?: string;
  tags: string[];
  ingredients: string;
  steps: string;
  added_at: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ItemAnalysis {
  name: string;
  category: string;
  emoji?: string;
  expiryDate?: string;
  quantity?: string;
}

export interface AnalysisResult {
  items: ItemAnalysis[];
  totalCount: number;
}
