import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { InventoryItem, ItemType } from '../types';
import { FRIDGE_CATEGORIES, WARDROBE_CATEGORIES } from '../constants';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  initialData?: Partial<InventoryItem>;
  type: ItemType;
  isNew?: boolean;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, initialData, type, isNew }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const categories = type === ItemType.FRIDGE ? FRIDGE_CATEGORIES : WARDROBE_CATEGORIES;

  useEffect(() => {
    setFormData(initialData || { type });
  }, [initialData, type]);

  if (!isOpen) return null;

  const currentCategories = formData.category && !categories.includes(formData.category)
    ? [...categories, formData.category]
    : categories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <GlassCard className="!bg-white !rounded-none !border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl text-zinc-900">{isNew ? '录入物品' : '编辑物品'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors">
              <X size={20} className="text-zinc-500" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">名称</label>
              <input
                className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none transition-colors font-serif text-lg"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：牛油果"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">分类</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none transition-colors"
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>选择分类</option>
                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {type === ItemType.FRIDGE ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">数量</label>
                  <input
                    className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none"
                    value={formData.quantity || ''}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="如: 500g"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">颜色</label>
                  <input
                    className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none"
                    value={formData.color || ''}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    placeholder="如: 藏青"
                  />
                </div>
              )}
            </div>

            {type === ItemType.FRIDGE ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">过期日期</label>
                <input
                  type="date"
                  className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none font-mono text-sm"
                  value={formData.expiryDate || ''}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">适用季节</label>
                <input
                  className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none"
                  value={formData.season || ''}
                  onChange={e => setFormData({ ...formData, season: e.target.value })}
                  placeholder="如: 春/秋"
                />
              </div>
            )}

            <button
              onClick={() => onSave(formData)}
              className="w-full py-3.5 btn-primary font-medium transition-all mt-4 active:scale-[0.98]"
            >
              {isNew ? '确认入库' : '保存修改'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
