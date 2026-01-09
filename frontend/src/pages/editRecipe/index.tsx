import { View, Text, Input, Button, Textarea } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import { Recipe } from "../../types";
import {
  addRecipe,
  updateRecipe,
  fetchRecipes,
} from "../../services/apiService";
import "./index.scss";

export default function EditRecipePage() {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [recipeId, setRecipeId] = useState<string>("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(false);

  Taro.useLoad((options) => {
    const { mode: pageMode, id } = options;
    setMode(pageMode === "edit" ? "edit" : "add");

    if (pageMode === "edit" && id) {
      setRecipeId(id);
      loadRecipe(id);
    }
  });

  const loadRecipe = async (id: string) => {
    try {
      const recipes = await fetchRecipes();
      const recipe = recipes.find((r) => r.id === id);

      if (recipe) {
        setName(recipe.name);
        setTags(recipe.tags.join(", "));
        setIngredients(recipe.ingredients);
        setSteps(recipe.steps);
      }
    } catch (error) {
      console.error("Failed to load recipe:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: "请输入食谱名称", icon: "none" });
      return;
    }

    if (!ingredients.trim()) {
      Taro.showToast({ title: "请输入食材", icon: "none" });
      return;
    }

    if (!steps.trim()) {
      Taro.showToast({ title: "请输入步骤", icon: "none" });
      return;
    }

    setLoading(true);

    try {
      const recipeData: Partial<Recipe> = {
        name: name.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        added_at: Date.now(),
      };

      if (mode === "edit" && recipeId) {
        await updateRecipe(recipeId, recipeData);
        Taro.showToast({ title: "更新成功", icon: "success" });
      } else {
        await addRecipe(
          recipeData as Omit<Recipe, "id" | "created_at" | "updated_at">
        );
        Taro.showToast({ title: "添加成功", icon: "success" });
      }

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      Taro.showToast({ title: "保存失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="edit-recipe-page">
      <View className="form">
        {/* 食谱名称 */}
        <View className="form-item">
          <Text className="label">食谱名称 *</Text>
          <Input
            className="input"
            type="text"
            placeholder="请输入食谱名称"
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        {/* 标签 */}
        <View className="form-item">
          <Text className="label">标签</Text>
          <Input
            className="input"
            type="text"
            placeholder="用逗号分隔，如：快手菜, 家常菜"
            value={tags}
            onInput={(e) => setTags(e.detail.value)}
          />
        </View>

        {/* 食材 */}
        <View className="form-item">
          <Text className="label">食材 *</Text>
          <Textarea
            className="textarea"
            placeholder="请输入食材清单，每行一个"
            value={ingredients}
            onInput={(e) => setIngredients(e.detail.value)}
            maxlength={-1}
            autoHeight
          />
        </View>

        {/* 步骤 */}
        <View className="form-item">
          <Text className="label">步骤 *</Text>
          <Textarea
            className="textarea"
            placeholder="请输入制作步骤"
            value={steps}
            onInput={(e) => setSteps(e.detail.value)}
            maxlength={-1}
            autoHeight
          />
        </View>
      </View>

      {/* 保存按钮 */}
      <View className="footer">
        <Button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading ? "保存中..." : mode === "edit" ? "更新" : "添加"}
        </Button>
      </View>
    </View>
  );
}
