import { View, Text, Button, Input, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useMemo } from "react";
import { InventoryItem, ItemType } from "../../types";
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
} from "../../services/apiService";
import "./index.scss";

export default function FridgePage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [loading, setLoading] = useState(false);

  // 加载数据
  Taro.useLoad(async () => {
    await loadItems();
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const fetchedItems = await fetchItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to load items:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  // 过滤后的物品列表
  const filteredItems = useMemo(() => {
    let current = items.filter((i) => i.type === ItemType.FRIDGE);

    // 只显示活跃的物品
    current = current.filter((i) => !i.status || i.status === "active");

    // 分类过滤
    if (activeCategory !== "全部") {
      current = current.filter((i) => i.category === activeCategory);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      current = current.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.category.toLowerCase().includes(query) ||
          (i.quantity && i.quantity.toLowerCase().includes(query))
      );
    }

    return current;
  }, [items, activeCategory, searchQuery]);

  // 获取分类列表
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        items.filter((i) => i.type === ItemType.FRIDGE).map((i) => i.category)
      )
    ).filter(Boolean);
    return ["全部", ...cats];
  }, [items]);

  // 选择图片并识别
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        Taro.showToast({ title: "图片识别功能需要后端支持", icon: "none" });
        // TODO: 实现图片识别功能
        // const base64 = await fileToBase64(res.tempFilePaths[0]);
        // const analysis = await analyzeImage(base64, ItemType.FRIDGE);
      }
    } catch (error) {
      console.error("Choose image failed:", error);
    }
  };

  // 手动添加物品
  const handleAddItem = () => {
    Taro.navigateTo({
      url: "/pages/editItem/index?mode=add",
    });
  };

  // 点击物品
  const handleItemClick = (item: InventoryItem) => {
    Taro.navigateTo({
      url: `/pages/editItem/index?mode=edit&id=${item.id}`,
    });
  };

  return (
    <View className="fridge-page">
      {/* 头部 */}
      <View className="header">
        <View className="header-title">
          <Text className="title">食材</Text>
          <Text className="subtitle">
            Kitchen Inventory • {filteredItems.length} Items
          </Text>
        </View>
        <View className="header-actions">
          <Button className="action-btn camera-btn" onClick={handleChooseImage}>
            <Text className="icon">📷</Text>
          </Button>
          <Button className="action-btn add-btn" onClick={handleAddItem}>
            <Text className="icon">+</Text>
          </Button>
        </View>
      </View>

      {/* 搜索框 */}
      {items.filter(
        (i) =>
          i.type === ItemType.FRIDGE && (!i.status || i.status === "active")
      ).length > 0 && (
        <View className="search-bar">
          <Input
            className="search-input"
            type="text"
            placeholder="搜索食材名称、分类..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
        </View>
      )}

      {/* 分类过滤 */}
      {items.filter(
        (i) =>
          i.type === ItemType.FRIDGE && (!i.status || i.status === "active")
      ).length > 0 && (
        <View className="category-filter">
          {categories.map((cat) => (
            <View
              key={cat}
              className={`category-item ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              <Text className="category-text">{cat}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 物品列表 */}
      <View className="item-list">
        {loading ? (
          <View className="empty-state">
            <Text>加载中...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">🍎</Text>
            <Text className="empty-text">还没有食材</Text>
            <Text className="empty-hint">点击右上角添加食材</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View
              key={item.id}
              className="item-card"
              onClick={() => handleItemClick(item)}
            >
              {item.emoji ? (
                <Text className="item-emoji">{item.emoji}</Text>
              ) : item.imageUrl ? (
                <Image
                  className="item-image"
                  src={item.imageUrl}
                  mode="aspectFill"
                />
              ) : (
                <Text className="item-emoji">📦</Text>
              )}
              <View className="item-info">
                <Text className="item-name">{item.name}</Text>
                <Text className="item-category">{item.category}</Text>
                {item.quantity && (
                  <Text className="item-quantity">{item.quantity}</Text>
                )}
                {item.expiryDate && (
                  <Text className="item-expiry">
                    {new Date(item.expiryDate).toLocaleDateString("zh-CN")}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
