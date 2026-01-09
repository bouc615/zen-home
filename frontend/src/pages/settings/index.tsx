import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { UserProfile } from "../../types";
import "./index.scss";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "User",
    emails: [],
    avatar: "",
    preferences: {
      dietary: [],
      dislikes: [],
      spiciness: "medium",
      cuisine: [],
    },
  });

  const handleAbout = () => {
    Taro.showModal({
      title: "ZenHome",
      content: "智能厨房管家小程序\n版本: 1.0.0",
      showCancel: false,
    });
  };

  return (
    <View className="settings-page">
      {/* 头部 */}
      <View className="header">
        <Text className="title">设置</Text>
        <Text className="subtitle">Settings</Text>
      </View>

      {/* 用户信息 */}
      <View className="section">
        <Text className="section-title">用户信息</Text>
        <View className="setting-item">
          <Text className="setting-label">昵称</Text>
          <Text className="setting-value">{profile.name}</Text>
        </View>
      </View>

      {/* 偏好设置 */}
      <View className="section">
        <Text className="section-title">偏好设置</Text>
        <View className="setting-item">
          <Text className="setting-label">辣度偏好</Text>
          <Text className="setting-value">
            {profile.preferences?.spiciness === "none"
              ? "不吃辣"
              : profile.preferences?.spiciness === "mild"
              ? "微辣"
              : profile.preferences?.spiciness === "medium"
              ? "中辣"
              : "重辣"}
          </Text>
        </View>
      </View>

      {/* 关于 */}
      <View className="section">
        <Text className="section-title">关于</Text>
        <View className="setting-item" onClick={handleAbout}>
          <Text className="setting-label">关于 ZenHome</Text>
          <Text className="setting-arrow">›</Text>
        </View>
      </View>
    </View>
  );
}
