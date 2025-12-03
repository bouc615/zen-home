import React from 'react';
import {
  GiApple, GiBanana, GiGrapes, GiLemon, GiPeach, GiPear, GiStrawberry, GiWatermelon, // Fruits
  GiCarrot, GiCorn, GiGarlic, GiMushroomGills, GiOnion, GiPotato, GiTomato, // Vegetables
  GiChickenLeg, GiMeat, GiSteak, GiSausage, // Meat
  GiFishCooked, GiShrimp, // Seafood
  GiMilkCarton, GiCheeseWedge, GiFriedEggs, // Dairy & Eggs
  GiBread, GiSlicedBread, GiToast, // Bakery
  GiSodaCan, GiWaterBottle, GiWineBottle, // Drinks
  GiBowlOfRice, GiNoodles, // Grains
  GiCakeSlice, GiIceCreamCone, GiCookie, // Sweets
  GiSaltShaker, GiChiliPepper, // Spices
  GiShoppingBag // Default
} from 'react-icons/gi';
import { LuBeef, LuCarrot, LuCherry, LuCitrus, LuCoffee, LuCookie, LuCroissant, LuCupSoda, LuEgg, LuFish, LuGlassWater, LuGrape, LuIceCream, LuMilk, LuPizza, LuSandwich, LuSoup, LuWheat, LuWine } from 'react-icons/lu';

// Map categories or keywords to icons
export const getIconForCategory = (category: string, name: string): React.ElementType => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  // Specific Name Matching (Priority)
  if (lowerName.includes('苹果') || lowerName.includes('apple')) return GiApple;
  if (lowerName.includes('香蕉') || lowerName.includes('banana')) return GiBanana;
  if (lowerName.includes('葡萄') || lowerName.includes('grape')) return GiGrapes;
  if (lowerName.includes('柠檬') || lowerName.includes('lemon')) return GiLemon;
  if (lowerName.includes('桃') || lowerName.includes('peach')) return GiPeach;
  if (lowerName.includes('梨') || lowerName.includes('pear')) return GiPear;
  if (lowerName.includes('草莓') || lowerName.includes('strawberry')) return GiStrawberry;
  if (lowerName.includes('西瓜') || lowerName.includes('watermelon')) return GiWatermelon;

  if (lowerName.includes('胡萝卜') || lowerName.includes('carrot')) return GiCarrot;
  if (lowerName.includes('玉米') || lowerName.includes('corn')) return GiCorn;
  if (lowerName.includes('蒜') || lowerName.includes('garlic')) return GiGarlic;
  if (lowerName.includes('蘑菇') || lowerName.includes('mushroom')) return GiMushroomGills;
  if (lowerName.includes('洋葱') || lowerName.includes('onion')) return GiOnion;
  if (lowerName.includes('土豆') || lowerName.includes('potato')) return GiPotato;
  if (lowerName.includes('番茄') || lowerName.includes('西红柿') || lowerName.includes('tomato')) return GiTomato;
  if (lowerName.includes('辣椒') || lowerName.includes('pepper')) return GiChiliPepper;

  if (lowerName.includes('鸡') || lowerName.includes('chicken')) return GiChickenLeg;
  if (lowerName.includes('牛') || lowerName.includes('steak') || lowerName.includes('beef')) return GiSteak;
  if (lowerName.includes('猪') || lowerName.includes('pork') || lowerName.includes('meat')) return GiMeat;
  if (lowerName.includes('肠') || lowerName.includes('sausage')) return GiSausage;

  if (lowerName.includes('鱼') || lowerName.includes('fish')) return GiFishCooked;
  if (lowerName.includes('虾') || lowerName.includes('shrimp')) return GiShrimp;

  if (lowerName.includes('奶') || lowerName.includes('milk')) return GiMilkCarton;
  if (lowerName.includes('芝士') || lowerName.includes('奶酪') || lowerName.includes('cheese')) return GiCheeseWedge;
  if (lowerName.includes('蛋') || lowerName.includes('egg')) return GiFriedEggs;

  if (lowerName.includes('面包') || lowerName.includes('bread')) return GiSlicedBread;
  if (lowerName.includes('米') || lowerName.includes('rice')) return GiBowlOfRice;
  if (lowerName.includes('面') || lowerName.includes('noodle')) return GiNoodles;

  // Category Matching (Fallback)
  if (lowerCat.includes('水果') || lowerCat.includes('fruit')) return GiApple;
  if (lowerCat.includes('蔬菜') || lowerCat.includes('vegetable')) return GiCarrot;
  if (lowerCat.includes('肉') || lowerCat.includes('meat')) return GiMeat;
  if (lowerCat.includes('海鲜') || lowerCat.includes('seafood')) return GiFishCooked;
  if (lowerCat.includes('乳') || lowerCat.includes('dairy')) return GiMilkCarton;
  if (lowerCat.includes('蛋') || lowerCat.includes('egg')) return GiFriedEggs;
  if (lowerCat.includes('主食') || lowerCat.includes('grain')) return GiBowlOfRice;
  if (lowerCat.includes('零食') || lowerCat.includes('snack')) return GiCookie;
  if (lowerCat.includes('饮品') || lowerCat.includes('drink')) return GiSodaCan;
  if (lowerCat.includes('调料') || lowerCat.includes('spice')) return GiSaltShaker;

  return GiShoppingBag; // Default icon
};

// Helper component to render the icon
export const ItemIcon: React.FC<{ category: string; name: string; className?: string }> = ({ category, name, className }) => {
  const Icon = getIconForCategory(category, name);
  return <Icon className={className} />;
};
