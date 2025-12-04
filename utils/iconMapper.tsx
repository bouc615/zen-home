import React from 'react';
import {
  Apple,
  Banana,
  Grape,
  Citrus,
  Cherry,
  Carrot,
  Beef,
  Fish,
  Milk,
  Egg,
  Sandwich,
  Pizza,
  Soup,
  Coffee,
  Cookie,
  Wine,
  ShoppingBag,
  Utensils,
  Croissant,
  IceCream,
  Wheat,
  Drumstick,
  GlassWater,
  Candy,
  Nut,
  Salad,
  Cake,
  Beer,
  Martini
} from 'lucide-react';

// Icon name to component mapping
export const ICON_MAP: Record<string, React.ElementType> = {
  Apple,
  Banana,
  Grape,
  Citrus,
  Cherry,
  Carrot,
  Beef,
  Fish,
  Milk,
  Egg,
  Sandwich,
  Pizza,
  Soup,
  Coffee,
  Cookie,
  Wine,
  ShoppingBag,
  Utensils,
  Croissant,
  IceCream,
  Wheat,
  Drumstick,
  GlassWater,
  Candy,
  Nut,
  Salad,
  Cake,
  Beer,
  Martini
};

// Get all available icon names
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

// Map categories or keywords to icons
export const getIconForCategory = (category: string, name: string, customIconName?: string): React.ElementType => {
  // If custom icon name is provided, use it
  if (customIconName && ICON_MAP[customIconName]) {
    return ICON_MAP[customIconName];
  }

  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  // Specific Name Matching (Priority)
  if (lowerName.includes('苹果') || lowerName.includes('apple')) return Apple;
  if (lowerName.includes('香蕉') || lowerName.includes('banana')) return Banana;
  if (lowerName.includes('葡萄') || lowerName.includes('grape')) return Grape;
  if (lowerName.includes('柠檬') || lowerName.includes('lemon')) return Citrus;
  if (lowerName.includes('樱桃') || lowerName.includes('cherry')) return Cherry;

  if (lowerName.includes('胡萝卜') || lowerName.includes('carrot')) return Carrot;

  if (lowerName.includes('鸡') || lowerName.includes('chicken')) return Drumstick;
  if (lowerName.includes('牛') || lowerName.includes('steak') || lowerName.includes('beef')) return Beef;
  if (lowerName.includes('肉') || lowerName.includes('meat')) return Beef;

  if (lowerName.includes('鱼') || lowerName.includes('fish')) return Fish;

  if (lowerName.includes('奶') || lowerName.includes('milk')) return Milk;
  if (lowerName.includes('蛋') || lowerName.includes('egg')) return Egg;

  if (lowerName.includes('面包') || lowerName.includes('bread')) return Croissant;
  if (lowerName.includes('三明治') || lowerName.includes('sandwich')) return Sandwich;
  if (lowerName.includes('披萨') || lowerName.includes('pizza')) return Pizza;
  if (lowerName.includes('汤') || lowerName.includes('soup')) return Soup;

  if (lowerName.includes('咖啡') || lowerName.includes('coffee')) return Coffee;
  if (lowerName.includes('酒') || lowerName.includes('wine')) return Wine;
  if (lowerName.includes('啤酒') || lowerName.includes('beer')) return Beer;

  if (lowerName.includes('冰淇淋') || lowerName.includes('ice cream')) return IceCream;
  if (lowerName.includes('饼干') || lowerName.includes('cookie')) return Cookie;
  if (lowerName.includes('蛋糕') || lowerName.includes('cake')) return Cake;
  if (lowerName.includes('糖') || lowerName.includes('candy')) return Candy;

  // Category Matching (Fallback)
  if (lowerCat.includes('水果') || lowerCat.includes('fruit')) return Apple;
  if (lowerCat.includes('蔬菜') || lowerCat.includes('vegetable')) return Carrot;
  if (lowerCat.includes('肉') || lowerCat.includes('meat')) return Beef;
  if (lowerCat.includes('海鲜') || lowerCat.includes('seafood')) return Fish;
  if (lowerCat.includes('乳') || lowerCat.includes('dairy')) return Milk;
  if (lowerCat.includes('蛋') || lowerCat.includes('egg')) return Egg;
  if (lowerCat.includes('主食') || lowerCat.includes('grain')) return Wheat;
  if (lowerCat.includes('零食') || lowerCat.includes('snack')) return Cookie;
  if (lowerCat.includes('饮品') || lowerCat.includes('drink')) return GlassWater;
  if (lowerCat.includes('酒') || lowerCat.includes('alcohol')) return Wine;
  if (lowerCat.includes('甜点') || lowerCat.includes('dessert')) return Cake;

  return ShoppingBag; // Default icon
};

// Helper component to render the icon
export const ItemIcon: React.FC<{ category: string; name: string; iconName?: string; className?: string }> = ({ category, name, iconName, className }) => {
  const Icon = getIconForCategory(category, name, iconName);
  return <Icon className={className} />;
};
