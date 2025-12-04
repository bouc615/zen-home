import React, { useState, useRef } from 'react';
import { Edit2, Trash2, Image as ImageIcon, Check, X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { InventoryItem, ItemType } from '../types';
import { ItemIcon } from '../utils/iconMapper';

interface ItemCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onConsume?: (item: InventoryItem) => void;
  onWaste?: (item: InventoryItem) => void;
  index: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete, onConsume, onWaste, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const delayClass = `delay-${Math.min((index + 1) * 100, 500)}`;

  const startPress = () => {
    pressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 600);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const isExpired = item.expiryDate ? new Date(item.expiryDate) < new Date() : false;
  const expiringSoon = item.expiryDate
    ? (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24) <= 3 && !isExpired
    : false;

  return (
    <div
      className={`relative group touch-manipulation select-none h-full opacity-0 animate-fade-in-up ${delayClass}`}
      onTouchStart={startPress}
      onTouchEnd={(e) => {
        cancelPress();
      }}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={() => {
        if (!showMenu) {
          onEdit(item);
        }
      }}
    >
      <div className="h-full flex flex-col cursor-pointer group" onClick={() => !showMenu && onEdit(item)}>
        <div className="aspect-square w-full relative overflow-hidden bg-zinc-100 mb-3">
          {item.type === ItemType.FRIDGE ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-600">
              <ItemIcon category={item.category} name={item.name} iconName={item.iconName} className="w-16 h-16 opacity-80" />
            </div>
          ) : item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-50">
              <ImageIcon size={32} strokeWidth={1} />
            </div>
          )}

          {(isExpired || expiringSoon) && (
            <div className="absolute top-2 right-2 z-10">
              <span className={`w-2 h-2 rounded-full block ${isExpired ? 'bg-red-500' : 'bg-orange-400'} shadow-sm`}></span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-start">
            <h3 className="font-serif text-[15px] text-zinc-900 truncate tracking-wide leading-tight">{item.name}</h3>
            {item.type === ItemType.FRIDGE && item.expiryDate && (
              <span className={`text-[10px] font-medium ml-2 shrink-0 ${isExpired ? 'text-red-500' : expiringSoon ? 'text-orange-500' : 'text-zinc-400'}`}>
                {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-light tracking-wider uppercase">
            <span>{item.category}</span>
            {item.type === ItemType.FRIDGE && item.quantity && (
              <>
                <span>•</span>
                <span>{item.quantity}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div
          className="absolute inset-0 z-20 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-200 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onConsume?.(item); setShowMenu(false); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg w-full justify-center"
          >
            <Check size={16} /> <span className="text-sm font-medium">吃掉了</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onWaste?.(item); setShowMenu(false); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg w-full justify-center"
          >
            <X size={16} /> <span className="text-sm font-medium">浪费了</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); setShowMenu(false); }}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors mt-2"
          >
            <Trash2 size={14} /> <span className="text-xs">删除</span>
          </button>
          <p className="absolute bottom-4 text-[10px] text-zinc-500">点击任意处关闭</p>
        </div>
      )}
    </div>
  );
};
