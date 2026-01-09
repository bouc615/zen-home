import { View, Text, Button, Input, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useMemo } from "react";
import { Recipe } from "../../types";
import {
  fetchRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../services/apiService";
import "./index.scss";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 加载数据
  Taro.useLoad(async () => {
    await loadRecipes();
  });

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Failed to load recipes:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  // 过滤后的食谱列表
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    const query = searchQuery.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        r.ingredients.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  // 添加食谱
  const handleAddRecipe = () => {
    Taro.navigateTo({
      url: "/pages/editRecipe/index?mode=add",
    });
  };

  // 点击食谱
  const handleRecipeClick = (recipe: Recipe) => {
    Taro.navigateTo({
      url: `/pages/editRecipe/index?mode=edit&id=${recipe.id}`,
    });
  };

  return (
    <View className="recipes-page">
      {/* 头部 */}
      <View className="header">
        <View className="header-title">
          <Text className="title">食谱</Text>
          <Text className="subtitle">
            Recipes • {filteredRecipes.length} Items
          </Text>
        </View>
        <Button className="add-btn" onClick={handleAddRecipe}>
          <Text className="icon">+</Text>
        </Button>
      </View>

      {/* 搜索框 */}
      {recipes.length > 0 && (
        <View className="search-bar">
          <Input
            className="search-input"
            type="text"
            placeholder="搜索食谱名称、标签..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
        </View>
      )}

      {/* 食谱列表 */}
      <View className="recipe-list">
        {loading ? (
          <View className="empty-state">
            <Text>加载中...</Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">👨‍🍳</Text>
            <Text className="empty-text">还没有食谱</Text>
            <Text className="empty-hint">点击右上角添加食谱</Text>
          </View>
        ) : (
          filteredRecipes.map((recipe) => (
            <View
              key={recipe.id}
              className="recipe-card"
              onClick={() => handleRecipeClick(recipe)}
            >
              {recipe.imageUrl ? (
                <Image
                  className="recipe-image"
                  src={recipe.imageUrl}
                  mode="aspectFill"
                />
              ) : (
                <View className="recipe-placeholder">
                  <Text className="placeholder-icon">🍳</Text>
                </View>
              )}
              <View className="recipe-info">
                <Text className="recipe-name">{recipe.name}</Text>
                <View className="recipe-tags">
                  {recipe.tags.map((tag, index) => (
                    <Text key={index} className="tag">
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
