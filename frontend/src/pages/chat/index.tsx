import { View, Text, Input, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { ChatMessage, InventoryItem, Recipe } from "../../types";
import { sendChatMessage } from "../../services/aiService";
import "./index.scss";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "你好！我是你的厨房管家。我可以帮你规划食谱、管理食材。今天想吃点什么？",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: inputText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      // TODO: 获取当前的 items 和 recipes
      const items: InventoryItem[] = [];
      const recipes: Recipe[] = [];

      const responseText = await sendChatMessage(
        [...messages, userMsg],
        inputText,
        items,
        recipes
      );
      const aiMsg: ChatMessage = {
        role: "model",
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "抱歉，我遇到了一些问题。",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <View className="chat-page">
      {/* 消息列表 */}
      <ScrollView
        className="message-list"
        scrollY
        scrollIntoView={`msg-${messages.length - 1}`}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            id={`msg-${index}`}
            className={`message ${msg.role}`}
          >
            <View className="message-bubble">
              <Text className="message-text">{msg.text}</Text>
            </View>
          </View>
        ))}
        {isThinking && (
          <View className="message model">
            <View className="message-bubble">
              <Text className="message-text">思考中...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 输入框 */}
      <View className="input-area">
        <Input
          className="input"
          type="text"
          placeholder="输入消息..."
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          onConfirm={handleSend}
        />
        <View className="send-btn" onClick={handleSend}>
          <Text>发送</Text>
        </View>
      </View>
    </View>
  );
}
