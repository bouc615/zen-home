import React from 'react';
import { Clock, ChefHat, Edit2, Trash2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  index: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit, onDelete, index }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div
      className={`relative group touch-manipulation select-none h-full opacity-0 animate-fade-in-up ${delayClass}`}
      onTouchStart={startPress}
      onTouchEnd={(e) => {
        cancelPress();
        if (!showMenu && !pressTimer.current) {
          // Short press/click
        }
      }}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={() => {
        if (!showMenu) {
          onEdit(recipe);
        }
      }}
    >
      <div className="h-full flex flex-col cursor-pointer group" onClick={() => !showMenu && onEdit(recipe)}>
        <div className="aspect-square w-full relative overflow-hidden bg-zinc-100 mb-3">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-50">
              <ChefHat size={32} strokeWidth={1} />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        <div className="flex flex-col gap-0.5">
          <h3 className="font-serif text-[15px] text-zinc-900 truncate tracking-wide leading-tight">{recipe.name}</h3>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-light tracking-wider uppercase">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              <span>{new Date(recipe.addedAt).toLocaleDateString()}</span>
            </span>
            {recipe.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{recipe.tags[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div
          className="absolute inset-0 z-20 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(recipe); setShowMenu(false); }}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <Trash2 size={18} /> <span className="text-sm font-medium">删除菜谱</span>
          </button>
          <p className="absolute bottom-6 text-[10px] text-zinc-400">点击任意处关闭</p>
        </div>
      )}
    </div>
  );
};
