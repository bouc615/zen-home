import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { ItemIcon } from '../../utils/iconMapper';
import { Trash2, Edit2, X } from 'lucide-react';

interface ActionSheetProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConsume: (item: InventoryItem, progress: number) => void;
  onWaste: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  item,
  isOpen,
  onClose,
  onConsume,
  onWaste,
  onEdit,
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setSliderValue(item.usageProgress || 0);
    }
  }, [isOpen, item]);

  if (!item || !isOpen) return null;

  const getFeedbackText = (val: number) => {
    if (val >= 100) return { text: '空空如也! 🎉', color: 'text-emerald-600' };
    if (val >= 90) return { text: '见底了!', color: 'text-red-500' };
    if (val >= 60) return { text: '所剩无几', color: 'text-orange-500' };
    if (val >= 40) return { text: '消耗过半', color: 'text-yellow-600' };
    if (val >= 10) return { text: '浅尝辄止', color: 'text-emerald-600' };
    return { text: '满满当当', color: 'text-zinc-400' };
  };

  const feedback = getFeedbackText(sliderValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  };

  const handleRelease = () => {
    if (sliderValue >= 100) {
      // Consume completely
      onConsume(item, 100);
      onClose();
    } else {
      // Update progress but keep item
      onConsume(item, sliderValue);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-600 border border-zinc-100">
              <ItemIcon category={item.category} name={item.name} iconName={item.iconName} className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-zinc-900">{item.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">{item.quantity || '未设定数量'} • {item.expiryDate ? `过期日: ${item.expiryDate}` : '无日期'}</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>

        {/* Zen Slider Section */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <label className="text-sm font-medium text-zinc-900">消耗进度</label>
            <span className={`text-sm font-bold transition-colors ${feedback.color}`}>
              {feedback.text} ({sliderValue}%)
            </span>
          </div>

          <div className="relative h-12 flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderValue}
              onChange={handleSliderChange}
              onTouchEnd={handleRelease}
              onMouseUp={handleRelease}
              className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900 focus:outline-none"
            />
          </div>
          <p className="text-xs text-center text-zinc-400 mt-2">
            {sliderValue >= 100 ? '松手即可完成消耗' : '拖动滑块记录剩余量'}
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { onWaste(item); onClose(); }}
            className="flex-1 py-3 rounded-xl border border-red-100 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            浪费了
          </button>
        </div>
      </div>
    </>
  );
};
