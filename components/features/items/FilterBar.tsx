import React from 'react';

interface FilterBarProps {
  activeStatus: string;
  activeCategory: string;
  categories: string[];
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeStatus,
  activeCategory,
  categories,
  onStatusChange,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4 animate-fade-in-up">
      {/* Level 1: Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => onStatusChange('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeStatus === 'all'
              ? 'bg-zinc-900 text-white shadow-md'
              : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}
        >
          全部
        </button>
        <button
          onClick={() => onStatusChange('expiring')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${activeStatus === 'expiring'
              ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm'
              : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}
        >
          <span>⚠️</span> 临期/过期
        </button>
      </div>

      {/* Level 2: Category Filter (Horizontal Scroll) */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat
                  ? 'bg-zinc-100 text-zinc-900 border border-zinc-300'
                  : 'text-zinc-400 hover:text-zinc-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
