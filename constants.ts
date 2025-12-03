import { InventoryItem, ItemType, Recipe } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: '有机纯牛奶', type: ItemType.FRIDGE, category: '乳制品', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), expiryDate: '2023-11-20', quantity: '1L' },
  { id: '2', name: '牛油果', type: ItemType.FRIDGE, category: '水果', imageUrl: 'https://images.unsplash.com/photo-1523049673856-6468baca292f?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), expiryDate: '2023-11-15', quantity: '3 个' },
  { id: '3', name: '复古牛仔夹克', type: ItemType.WARDROBE, category: '外套', imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), color: '丹宁蓝', season: '四季' },
  { id: '4', name: '亚麻休闲衬衫', type: ItemType.WARDROBE, category: '上装', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), color: '米白', season: '夏季' },
];

export const FRIDGE_CATEGORIES = ['蔬菜', '水果', '肉类', '海鲜', '乳制品', '饮品', '调味品', '零食', '其他'];
export const WARDROBE_CATEGORIES = ['上装', '下装', '外套', '连身裙', '鞋履', '包袋', '配饰', '家居服', '其他'];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    name: '清炒时蔬',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80',
    tags: ['素食', '快手', '健康'],
    ingredients: '青菜 500g\n蒜末 适量\n盐 1勺',
    steps: '1. 青菜洗净备用\n2. 热锅凉油爆香蒜末\n3. 放入青菜大火快炒\n4. 加盐调味出锅',
    addedAt: Date.now()
  },
  {
    id: '2',
    name: '红烧肉',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80',
    tags: ['硬菜', '家常', '下饭'],
    ingredients: '五花肉 500g\n冰糖 适量\n生抽 2勺\n老抽 1勺',
    steps: '1. 五花肉切块焯水\n2. 炒糖色\n3. 放入肉块翻炒上色\n4. 加水炖煮40分钟\n5. 收汁出锅',
    addedAt: Date.now()
  }
];
