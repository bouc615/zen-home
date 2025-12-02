import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ChatMessage, InventoryItem, ItemType } from '../types';
import { sendChatMessage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  type: ItemType;
  inventory: InventoryItem[];
  onThinking: (isThinking: boolean) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, type, inventory, onThinking }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize welcome message only once when opened or type changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{
            role: 'model',
            text: type === ItemType.FRIDGE 
              ? "你好。冰箱里的食材我都记下了。今晚想吃点清淡的，还是来顿丰盛的晚餐？" 
              : "欢迎来到你的云端衣橱。今天要出席什么场合？让我为你寻找穿搭灵感。",
            timestamp: Date.now()
          }]);
    }
  }, [isOpen, type]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    onThinking(true);

    try {
      const responseText = await sendChatMessage(messages, input, inventory, type);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-sage-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Chat Panel */}
      <div className="relative w-full md:max-w-md h-full animate-slide-in-right">
        <GlassCard className="h-full rounded-none md:rounded-l-[32px] border-l border-white/60 flex flex-col !bg-white/80">
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-sage-100">
            <div className="flex items-center gap-3 text-sage-900">
              <div className="p-2 bg-sage-100 rounded-full">
                <Sparkles size={18} className="text-sage-600 animate-pulse-slow" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">DWell Assistant</h3>
                <p className="text-xs text-sage-500">{type === ItemType.FRIDGE ? '膳食灵感' : '穿搭顾问'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-sage-50 rounded-full transition-colors">
              <X size={24} className="text-sage-400 hover:text-sage-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-sage-800 text-white rounded-tr-none' 
                      : 'bg-white text-sage-800 rounded-tl-none border border-sage-50'}
                  `}
                >
                  {msg.role === 'model' ? (
                     <ReactMarkdown 
                        components={{
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1 marker:text-sage-400" {...props} />,
                            li: ({node, ...props}) => <li className="" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-sage-900" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                     >
                        {msg.text}
                     </ReactMarkdown>
                  ) : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-sage-50 flex items-center gap-2 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-sage-500" />
                    <span className="text-xs text-sage-500">思考中...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-sage-100 bg-white/50 backdrop-blur-md pb-safe">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={type === ItemType.FRIDGE ? "需要什么食谱建议？" : "需要什么穿搭建议？"}
                className="w-full bg-white border border-sage-200 rounded-full pl-6 pr-14 py-3.5 text-base focus:ring-2 focus:ring-sage-200 focus:border-sage-400 focus:outline-none placeholder-sage-400 text-sage-800 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-2 bg-sage-800 text-white rounded-full hover:bg-sage-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};