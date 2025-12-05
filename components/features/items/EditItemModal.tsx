import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Camera, Upload } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { InventoryItem, ItemType } from '../../../types';
import { FRIDGE_CATEGORIES } from '../../../constants';
import { uploadFile } from '../../../services/cloudService';
import { ItemIcon } from '../../../utils/iconMapper';
import { IconPicker } from '../../ui/IconPicker';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = FRIDGE_CATEGORIES;

  const [dateMode, setDateMode] = useState<'date' | 'duration'>('date');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');

  useEffect(() => {
    if (dateMode === 'duration') {
      if (!durationValue) return;
      const num = parseInt(durationValue);
      if (isNaN(num)) return;

      const date = new Date();
      if (durationUnit === 'days') date.setDate(date.getDate() + num);
      if (durationUnit === 'weeks') date.setDate(date.getDate() + num * 7);
      if (durationUnit === 'months') date.setMonth(date.getMonth() + num);

      setFormData(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
    }
  }, [durationValue, durationUnit, dateMode]);

  useEffect(() => {
    setFormData(initialData || { type });
  }, [initialData, type]);

  if (!isOpen) return null;

  const currentCategories = formData.category && !categories.includes(formData.category)
    ? [...categories, formData.category]
    : categories;

  const handleModeSwitch = (mode: 'date' | 'duration') => {
    setDateMode(mode);
    if (mode === 'duration' && formData.expiryDate) {
      const [y, m, d] = formData.expiryDate.split('-').map(Number);
      const expiryDate = new Date(y, m - 1, d);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        if (diffDays % 30 === 0) {
          setDurationValue((diffDays / 30).toString());
          setDurationUnit('months');
        } else if (diffDays % 7 === 0) {
          setDurationValue((diffDays / 7).toString());
          setDurationUnit('weeks');
        } else {
          setDurationValue(diffDays.toString());
          setDurationUnit('days');
        }
      }
    }
  };

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
            {/* Icon Display and Picker */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 border border-zinc-100 shadow-inner mb-3">
                <ItemIcon
                  category={formData.category || ''}
                  name={formData.name || ''}
                  iconName={formData.iconName}
                  className="w-12 h-12"
                />
              </div>

              <div className="w-full max-w-xs">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  图标选择
                </label>
                <IconPicker
                  selectedIcon={formData.iconName}
                  onSelect={(iconName) => setFormData({ ...formData, iconName: iconName || undefined })}
                  category={formData.category || ''}
                  name={formData.name || ''}
                />
                <p className="text-xs text-zinc-400 mt-1.5 text-center">
                  {formData.iconName ? '已自定义图标' : '自动根据名称和分类选择'}
                </p>
              </div>
            </div>

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

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">数量</label>
                <input
                  className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none"
                  value={formData.quantity || ''}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="如: 500g"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {dateMode === 'date' ? '过期日期' : '保质期'}
                </label>
                <div className="flex bg-zinc-100 rounded-lg p-0.5">
                  <button
                    onClick={() => handleModeSwitch('date')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${dateMode === 'date'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                  >
                    日期
                  </button>
                  <button
                    onClick={() => handleModeSwitch('duration')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${dateMode === 'duration'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                  >
                    时长
                  </button>
                </div>
              </div>

              {dateMode === 'date' ? (
                <input
                  type="date"
                  className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none font-mono text-sm"
                  value={formData.expiryDate || ''}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      className="flex-1 skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none font-mono text-sm"
                      placeholder="例如: 3"
                      value={durationValue}
                      onChange={e => setDurationValue(e.target.value)}
                    />
                    <div className="relative w-24">
                      <select
                        className="w-full appearance-none skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none text-sm"
                        value={durationUnit}
                        onChange={e => setDurationUnit(e.target.value as any)}
                      >
                        <option value="days">天</option>
                        <option value="weeks">周</option>
                        <option value="months">月</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                  {formData.expiryDate && (
                    <p className="text-xs text-zinc-400 text-right">
                      预计过期: {formData.expiryDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => onSave(formData)}
              disabled={isUploading}
              className="w-full py-3.5 btn-primary font-medium transition-all mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '正在上传...' : (isNew ? '确认入库' : '保存修改')}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
