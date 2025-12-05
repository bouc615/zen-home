import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Recipe } from '../../types';
import { RecipeCard } from '../features/recipes/RecipeCard';

interface RecipesViewProps {
  recipes: Recipe[];
  onAddClick: () => void;
  onEditClick: (recipe: Recipe) => void;
  onDeleteClick: (recipe: Recipe) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div>
          <h2 className="font-serif text-3xl text-zinc-900">
            菜谱
          </h2>
          <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">
            My Recipes • {recipes.length} Items
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>


      <div className="flex-1 overflow-y-auto pb-24 -mx-4 px-4 no-scrollbar">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <BookOpen size={32} strokeWidth={1.5} className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-serif text-zinc-900 mb-2">还没有菜谱</h3>
            <p className="text-sm text-zinc-400 mb-6">
              点击右上角 + 创建第一个私房菜谱
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={idx}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
