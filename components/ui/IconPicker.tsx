import React, { useState } from 'react';
import { ICON_MAP, AVAILABLE_ICONS } from '../../utils/iconMapper';
import { ChevronDown, Check } from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  category: string;
  name: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, category, name }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get auto-selected icon name for display
  const getAutoIconName = () => {
    // This is a simplified version - in reality we'd need to reverse-engineer from getIconForCategory
    return 'ShoppingBag'; // Default
  };

  const autoIcon = selectedIcon ? null : getAutoIconName();

  // Group icons by category for better UX
  const iconGroups = {
    '水果': ['Apple', 'Banana', 'Grape', 'Citrus', 'Cherry'],
    '蔬菜': ['Carrot', 'Salad'],
    '肉类': ['Beef', 'Drumstick', 'Fish'],
    '乳制品': ['Milk', 'Egg'],
    '主食': ['Wheat', 'Croissant', 'Sandwich', 'Pizza'],
    '饮品': ['Coffee', 'Wine', 'Beer', 'GlassWater', 'Martini'],
    '甜点': ['IceCream', 'Cookie', 'Cake', 'Candy'],
    '其他': ['Soup', 'Utensils', 'ShoppingBag', 'Nut']
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              {React.createElement(ICON_MAP[selectedIcon], { size: 16 })}
              <span>{selectedIcon}</span>
            </>
          ) : (
            <span className="text-zinc-400">自动选择</span>
          )}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {/* Auto option */}
            <button
              type="button"
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 transition-colors text-left"
            >
              <span className="text-sm text-zinc-600">自动选择</span>
              {!selectedIcon && <Check size={14} className="text-emerald-600" />}
            </button>

            <div className="border-t border-zinc-100 my-1" />

            {/* Icon groups */}
            {Object.entries(iconGroups).map(([groupName, icons]) => (
              <div key={groupName}>
                <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50">
                  {groupName}
                </div>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {icons.map((iconName) => {
                    const IconComponent = ICON_MAP[iconName];
                    const isSelected = selectedIcon === iconName;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          onSelect(iconName);
                          setIsOpen(false);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isSelected
                          ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500'
                          : 'hover:bg-zinc-50 text-zinc-600'
                          }`}
                        title={iconName}
                      >
                        <IconComponent size={20} />
                        <span className="text-[9px] truncate w-full text-center">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
