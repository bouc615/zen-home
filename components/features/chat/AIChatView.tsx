import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, InventoryItem, Recipe } from '../../../types';
import { sendChatMessage } from '../../../services/aiService';

interface AIChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isThinking: boolean;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ messages, onSendMessage, onClose, isThinking }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header - Paper Style */}
      <div className="px-6 py-4 flex items-center justify-between bg-zinc-50/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-zinc-900">Zen AI</h2>
            <p className="text-xs text-zinc-400">生活管家</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area - Paper Texture Feel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 opacity-50">
            <Sparkles size={48} strokeWidth={1} className="mb-4" />
            <p className="font-serif text-sm">有什么我可以帮你的吗？</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-zinc-800 text-white rounded-tr-none' // User: Dark Card
                : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none' // AI: Paper Note
                }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-400">思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating Dock */}
      <div className="p-4 bg-zinc-50 pb-safe">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-white p-2 pr-2 rounded-[2rem] shadow-lg shadow-zinc-200/50 border border-zinc-100"
        >
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="说点什么..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-900 placeholder-zinc-400 text-sm px-2"
            disabled={isThinking}
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
