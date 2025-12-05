import React, { useState } from 'react';
import { Plus, Camera, Edit2, X } from 'lucide-react';

interface FloatingActionGroupProps {
  onManualAdd: () => void;
  onCameraAdd?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  showCamera: boolean;
}

export const FloatingActionGroup: React.FC<FloatingActionGroupProps> = ({
  onManualAdd,
  onCameraAdd,
  fileInputRef,
  showCamera
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // If only manual add is available, just show the simple button
  if (!showCamera) {
    return (
      <button
        onClick={onManualAdd}
        className="fixed bottom-24 right-6 w-14 h-14 btn-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40 shadow-lg"
      >
        <Plus size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-4">
      {/* Menu Items */}
      <div className={`flex flex-col items-end gap-3 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

        {/* Camera Action */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm text-zinc-600">
            AI 识别
          </span>
          <label className="w-12 h-12 bg-white text-zinc-900 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (onCameraAdd) onCameraAdd(e);
                setIsOpen(false);
              }}
            />
            <Camera size={20} />
          </label>
        </div>

        {/* Manual Action */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm text-zinc-600">
            手动录入
          </span>
          <button
            onClick={() => {
              onManualAdd();
              setIsOpen(false);
            }}
            className="w-12 h-12 bg-white text-zinc-900 rounded-full shadow-lg flex items-center justify-center hover:bg-zinc-50 transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 btn-primary rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
      >
        <Plus size={24} />
      </button>

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
