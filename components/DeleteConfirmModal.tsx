import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xs animate-in zoom-in-95 duration-200">
        <GlassCard className="!bg-white !rounded-none !border-zinc-200 text-center">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h3 className="font-serif text-lg text-zinc-900 mb-2">确认移除?</h3>
          <p className="text-sm text-zinc-500 mb-6">
            您确定要移除 <span className="font-medium text-zinc-900">{itemName}</span> 吗？此操作无法撤销。
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 skeuo-btn text-zinc-600 font-medium hover:bg-zinc-50">取消</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 skeuo-btn text-red-600 font-medium hover:bg-red-50">移除</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
