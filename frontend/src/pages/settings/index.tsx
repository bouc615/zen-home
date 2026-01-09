import { View, Text, Button, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useState } from "react";
import { UserProfile } from "../../types";
import {
  fetchProfile,
  fetchHouseholdMembers,
  joinHousehold,
  leaveHousehold,
} from "../../services/apiService";
import "./index.scss";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Refresh data whenever the page shows
  useDidShow(() => {
    loadData();
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const userProfile = await fetchProfile();
      setProfile(userProfile);

      // Fetch household members
      const householdMembers = await fetchHouseholdMembers();
      setMembers(householdMembers);
    } catch (error) {
      console.error("Failed to load settings data:", error);
      Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  const handleScanCode = async () => {
    try {
      const res = await Taro.scanCode({
        onlyFromCamera: true,
        scanType: ["qrCode"],
      });

      const targetUserId = res.result;
      if (!targetUserId) return;

      if (targetUserId === profile?.id) {
        Taro.showToast({ title: "不能加入自己的家庭", icon: "none" });
        return;
      }

      const confirm = await Taro.showModal({
        title: "加入家庭",
        content: `确定要加入目标用户的家庭吗？\n您的个人数据将合并显示。`,
      });

      if (confirm.confirm) {
        await joinHousehold(targetUserId);
        Taro.showToast({ title: "加入成功", icon: "success" });
        loadData();
      }
    } catch (error) {
      // User cancelled or error
      console.log("Scan cancelled or failed", error);
    }
  };

  const handleLeaveHousehold = async () => {
    const confirm = await Taro.showModal({
      title: "退出家庭",
      content: "确定要退出当前家庭，恢复单人模式吗？",
    });

    if (confirm.confirm) {
      try {
        await leaveHousehold();
        Taro.showToast({ title: "已退出", icon: "success" });
        loadData();
      } catch (error) {
        Taro.showToast({ title: "退出失败", icon: "none" });
      }
    }
  };

  const handleCopyId = () => {
    if (profile?.id) {
      Taro.setClipboardData({
        data: profile.id,
        success: () => Taro.showToast({ title: "ID 已复制", icon: "success" }),
      });
    }
  };

  const handleAbout = () => {
    Taro.showModal({
      title: "ZenHome",
      content: "智能厨房管家小程序\n版本: 1.0.0",
      showCancel: false,
    });
  };

  if (!profile)
    return <View className="settings-page loading">Loading...</View>;

  const isSharedHousehold =
    profile.household_id && profile.household_id !== profile.id;

  return (
    <View className="settings-page">
      {/* Header */}
      <View className="header">
        <Text className="title">设置</Text>
        <Text className="subtitle">Settings</Text>
      </View>

      {/* User Info */}
      <View className="section">
        <Text className="section-title">用户信息</Text>
        <View className="setting-item">
          <Text className="setting-label">昵称</Text>
          <Text className="setting-value">{profile.name}</Text>
        </View>
        <View className="setting-item" onClick={handleCopyId}>
          <Text className="setting-label">用户 ID</Text>
          <Text className="setting-value small">{profile.id}</Text>
        </View>
      </View>

      {/* Household Management */}
      <View className="section">
        <Text className="section-title">家庭管理</Text>

        <View className="household-status">
          <Text className="status-label">当前状态</Text>
          <View
            className={`status-badge ${
              isSharedHousehold ? "shared" : "single"
            }`}
          >
            {isSharedHousehold ? "已加入家庭" : "单人模式"}
          </View>
        </View>

        {members.length > 0 && (
          <View className="members-list">
            <Text className="members-title">家庭成员 ({members.length})</Text>
            <View className="avatars">
              {members.map((m) => (
                <View key={m.id} className="member-avatar">
                  {m.avatar ? (
                    <Image src={m.avatar} className="avatar-img" />
                  ) : (
                    <View className="avatar-placeholder">
                      {m.name?.[0] || "U"}
                    </View>
                  )}
                  <Text className="member-name">{m.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="actions">
          {!isSharedHousehold ? (
            <Button
              className="action-btn primary"
              onClick={handleScanCode}
              disabled={loading}
            >
              {loading ? "处理中..." : "扫码加入家庭"}
            </Button>
          ) : (
            <Button
              className="action-btn danger"
              onClick={handleLeaveHousehold}
              disabled={loading}
            >
              {loading ? "处理中..." : "退出家庭"}
            </Button>
          )}
          {/* Show QR Code for invitation (Placeholder for now) */}
          <View className="invite-section">
            <Text className="invite-tip">让家人扫码加入我的家庭:</Text>
            {/* In real app, generate QR Code of profile.id here */}
            <View className="qr-placeholder" onClick={handleCopyId}>
              <Text>点击复制我的家庭 ID</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Preferences */}
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

      {/* About */}
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
