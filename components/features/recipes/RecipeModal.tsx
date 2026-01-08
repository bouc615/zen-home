import React, { useState, useEffect, useRef } from 'react';
import { X, ChefHat, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Recipe } from '../../../types';
import { uploadFile } from '../../../services/cloudService';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Partial<Recipe>) => void;
  initialData?: Partial<Recipe>;
  isNew?: boolean;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, onSave, initialData, isNew }) => {
  const [formData, setFormData] = useState<Partial<Recipe>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fade-in-up max-h-[90vh] overflow-y-auto no-scrollbar">
        <GlassCard className="!bg-white !rounded-none !border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl text-zinc-900 flex items-center gap-2">
              <ChefHat size={20} className="text-zinc-600" />
              {isNew ? '记录新菜谱' : '编辑菜谱'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors">
              <X size={20} className="text-zinc-500" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Image Upload Area */}
            <div
              className="w-full aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Recipe" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-700 shadow-sm transition-opacity">
                      更换图片
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-zinc-500" />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span className="text-xs font-medium">点击上传封面图</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">菜名</label>
              <input
                className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none transition-colors font-serif text-lg"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：红烧肉"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">标签 (用逗号分隔)</label>
              <input
                className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none"
                value={formData.tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="例如: 辣, 晚餐, 简单"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">食材清单</label>
              <textarea
                className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none min-h-[100px]"
                value={formData.ingredients || ''}
                onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="每行一种食材..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">烹饪步骤</label>
              <textarea
                className="w-full skeuo-inner px-4 py-3 text-zinc-900 focus:outline-none min-h-[150px]"
                value={formData.steps || ''}
                onChange={e => setFormData({ ...formData, steps: e.target.value })}
                placeholder="描述烹饪步骤..."
              />
            </div>

            <button
              onClick={() => onSave(formData)}
              disabled={uploading}
              className="w-full py-3.5 btn-primary font-medium transition-all mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '上传中...' : (isNew ? '保存菜谱' : '更新菜谱')}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
