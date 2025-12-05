import React, { useState, useMemo, useRef } from 'react';
import { Camera, Plus, Search, X } from 'lucide-react';
import { InventoryItem, ItemType } from '../../types';
import { FilterBar } from '../features/items/FilterBar';
import { ItemListView } from '../features/items/ItemListView';

interface FridgeViewProps {
  items: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
  onAddClick: () => void;
  onFileSelected: (file: File) => void;
}

export const FridgeView: React.FC<FridgeViewProps> = ({
  items,
  onItemClick,
  onAddClick,
  onFileSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeStatus, setActiveStatus] = useState('all'); // 'all' | 'expiring'
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    let current = items.filter(i => i.type === ItemType.FRIDGE);

    // Status Filter (Level 1)
    current = current.filter(i => !i.status || i.status === 'active');

    if (activeStatus === 'expiring') {
      current = current.filter(i => {
        if (!i.expiryDate) return false;
        const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
        return days <= 3;
      });
    }

    // Category Filter (Level 2)
    if (activeCategory !== '全部') {
      current = current.filter(i => i.category === activeCategory);
    }

    // Search Filter (Level 3)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      current = current.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query) ||
        (i.quantity && i.quantity.toLowerCase().includes(query))
      );
    }

    return current;
  }, [items, activeStatus, activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.filter(i => i.type === ItemType.FRIDGE).map(i => i.category))).filter(Boolean);
    return ['全部', ...cats];
  }, [items]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-4 animate-fade-in-up">
        <div>
          <h2 className="font-serif text-3xl text-zinc-900">
            食材
          </h2>
          <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">
            Kitchen Inventory • {filteredItems.length} Items
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={onAddClick}
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar - only show when there are items */}
      {items.filter(i => i.type === ItemType.FRIDGE && (!i.status || i.status === 'active')).length > 0 && (
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索食材名称、分类..."
            className="w-full px-4 py-2.5 pl-10 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Filters - only show when there are items */}
      {items.filter(i => i.type === ItemType.FRIDGE && (!i.status || i.status === 'active')).length > 0 && (
        <FilterBar
          activeStatus={activeStatus}
          activeCategory={activeCategory}
          categories={categories}
          onStatusChange={setActiveStatus}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        <ItemListView
          items={filteredItems}
          onItemClick={onItemClick}
        />
      </div>

      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
