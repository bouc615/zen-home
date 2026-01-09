import { View, Text, Input, Button, Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useEffect } from "react";
import { InventoryItem, ItemType } from "../../types";
import { addItem, updateItem, fetchItems } from "../../services/apiService";
import "./index.scss";

const CATEGORIES = [
  "蔬菜",
  "水果",
  "肉类",
  "海鲜",
  "乳制品",
  "饮品",
  "调味品",
  "零食",
  "其他",
];
const EMOJIS = ["🥬", "🍎", "🥩", "🦐", "🥛", "🥤", "🧂", "🍪", "📦"];

export default function EditItemPage() {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [itemId, setItemId] = useState<string>("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("蔬菜");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [emoji, setEmoji] = useState("🥬");
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  Taro.useLoad((options) => {
    const { mode: pageMode, id } = options;
    setMode(pageMode === "edit" ? "edit" : "add");

    if (pageMode === "edit" && id) {
      setItemId(id);
      loadItem(id);
    }
  });

  const loadItem = async (id: string) => {
    try {
      const items = await fetchItems();
      const item = items.find((i) => i.id === id);

      if (item) {
        setName(item.name);
        setCategory(item.category);
        setCategoryIndex(CATEGORIES.indexOf(item.category));
        setEmoji(item.emoji || "📦");
        setEmojiIndex(EMOJIS.indexOf(item.emoji || "📦"));
        setQuantity(item.quantity || "");
        setExpiryDate(item.expiry_date || "");
        setNotes(item.notes || "");
      }
    } catch (error) {
      console.error("Failed to load item:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    }
  };

  const handleCategoryChange = (e) => {
    const index = e.detail.value;
    setCategoryIndex(index);
    setCategory(CATEGORIES[index]);
  };

  const handleEmojiChange = (e) => {
    const index = e.detail.value;
    setEmojiIndex(index);
    setEmoji(EMOJIS[index]);
  };

  const handleDateChange = (e) => {
    setExpiryDate(e.detail.value);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: "请输入物品名称", icon: "none" });
      return;
    }

    setLoading(true);

    try {
      const itemData: Partial<InventoryItem> = {
        name: name.trim(),
        type: ItemType.FRIDGE,
        category,
        emoji,
        quantity: quantity.trim(),
        expiry_date: expiryDate,
        notes: notes.trim(),
        added_at: Date.now(),
        status: "active",
      };

      if (mode === "edit" && itemId) {
        await updateItem(itemId, itemData);
        Taro.showToast({ title: "更新成功", icon: "success" });
      } else {
        await addItem(
          itemData as Omit<InventoryItem, "id" | "created_at" | "updated_at">
        );
        Taro.showToast({ title: "添加成功", icon: "success" });
      }

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Failed to save item:", error);
      Taro.showToast({ title: "保存失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="edit-item-page">
      <View className="form">
        {/* 物品名称 */}
        <View className="form-item">
          <Text className="label">物品名称 *</Text>
          <Input
            className="input"
            type="text"
            placeholder="请输入物品名称"
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        {/* 分类 */}
        <View className="form-item">
          <Text className="label">分类</Text>
          <Picker
            mode="selector"
            range={CATEGORIES}
            value={categoryIndex}
            onChange={handleCategoryChange}
          >
            <View className="picker">
              <Text>{category}</Text>
              <Text className="arrow">›</Text>
            </View>
          </Picker>
        </View>

        {/* Emoji */}
        <View className="form-item">
          <Text className="label">图标</Text>
          <Picker
            mode="selector"
            range={EMOJIS}
            value={emojiIndex}
            onChange={handleEmojiChange}
          >
            <View className="picker">
              <Text className="emoji-display">{emoji}</Text>
              <Text className="arrow">›</Text>
            </View>
          </Picker>
        </View>

        {/* 数量 */}
        <View className="form-item">
          <Text className="label">数量</Text>
          <Input
            className="input"
            type="text"
            placeholder="如：1个、500g、1L"
            value={quantity}
            onInput={(e) => setQuantity(e.detail.value)}
          />
        </View>

        {/* 过期日期 */}
        <View className="form-item">
          <Text className="label">过期日期</Text>
          <Picker mode="date" value={expiryDate} onChange={handleDateChange}>
            <View className="picker">
              <Text className={expiryDate ? "" : "placeholder"}>
                {expiryDate || "选择日期"}
              </Text>
              <Text className="arrow">›</Text>
            </View>
          </Picker>
        </View>

        {/* 备注 */}
        <View className="form-item">
          <Text className="label">备注</Text>
          <Input
            className="input"
            type="text"
            placeholder="添加备注"
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
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
