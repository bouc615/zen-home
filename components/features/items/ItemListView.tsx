import React from 'react';
import { InventoryItem, ItemType } from '../../../types';
import { ItemIcon } from '../../../utils/iconMapper';
import { getExpiryStatus } from '../../../utils/dateUtils';

interface ItemListViewProps {
  items: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
}

export const ItemListView: React.FC<ItemListViewProps> = ({ items, onItemClick }) => {

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-serif text-zinc-900 mb-2">冰箱空空如也</h3>
        <p className="text-sm text-zinc-400 mb-6 max-w-xs">
          开始记录你的食材，让 AI 帮你规划健康饮食
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            拍照添加
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-24">
      {items.map((item, index) => {
        const status = getExpiryStatus(item.expiryDate);
        const progress = item.usageProgress || 0;

        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group flex items-center gap-4 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Progress Background (Subtle) */}
            {progress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-500"
                style={{ width: `${100 - progress}%` }}
              />
            )}

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 shrink-0 border border-zinc-100">
              <ItemIcon category={item.category} name={item.name} iconName={item.iconName} className="w-6 h-6" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-zinc-900 truncate text-base">{item.name}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="bg-zinc-50 px-1.5 py-0.5 rounded text-zinc-500">{item.category}</span>
                <span>•</span>
                <span>{item.quantity || '未设定数量'}</span>
                {progress > 0 && (
                  <span className="text-emerald-600 font-medium">
                    (剩 {100 - progress}%)
                  </span>
                )}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex flex-col items-end gap-1">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className={`text-[10px] font-medium ${status.text === '已过期' ? 'text-red-500' : 'text-zinc-400'
                }`}>
                {status.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
