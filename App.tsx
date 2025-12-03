import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Refrigerator,
  Shirt,
  Search,
  Plus,
  BookOpen,
  User,
  Sparkles,
  Camera
} from 'lucide-react';
import { ItemCard } from './components/ItemCard';
import { FloatingActionGroup } from './components/FloatingActionGroup';
import { EditItemModal } from './components/EditItemModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsView } from './components/SettingsView';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { AIChatView } from './components/AIChatView';
import { AppView, InventoryItem, ItemType, UserProfile, Recipe } from './types';
import { analyzeImage } from './services/aiService';
import { fetchItems, fetchRecipes, addItem, updateItem, deleteItem, addRecipe, updateRecipe, deleteRecipe, uploadFile } from './services/cloudService';


const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.FRIDGE);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ... (other state definitions)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cloudItems, cloudRecipes] = await Promise.all([fetchItems(), fetchRecipes()]);
        setItems(cloudItems);
        setRecipes(cloudRecipes);
      } catch (e) {
        console.error("Failed to load cloud data", e);
        setItems([]);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ... (rest of the component)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [isNewRecipe, setIsNewRecipe] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zen_user_profile');
    return saved ? JSON.parse(saved) : { name: '生活家', emails: [] };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('zen_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    setActiveCategory('全部');
  }, [view]);

  const filteredItems = useMemo(() => {
    let currentItems = items;
    if (view === AppView.FRIDGE) currentItems = items.filter(i => i.type === ItemType.FRIDGE);
    if (view === AppView.WARDROBE) currentItems = items.filter(i => i.type === ItemType.WARDROBE);

    if (activeCategory === '⚠️ 已过期') {
      currentItems = currentItems.filter(i => {
        if (!i.expiryDate) return false;
        return new Date(i.expiryDate) < new Date();
      });
    } else if (activeCategory !== '全部') {
      currentItems = currentItems.filter(i => i.category === activeCategory);
    }
    return currentItems;
  }, [items, view, activeCategory]);

  const categories = useMemo(() => {
    let currentItems = items;
    if (view === AppView.FRIDGE) currentItems = items.filter(i => i.type === ItemType.FRIDGE);
    if (view === AppView.WARDROBE) currentItems = items.filter(i => i.type === ItemType.WARDROBE);

    const cats = Array.from(new Set(currentItems.map(i => i.category))).filter(Boolean);

    // Check for expired items
    const hasExpired = currentItems.some(i => i.expiryDate && new Date(i.expiryDate) < new Date());

    const result = ['全部', ...cats];
    if (hasExpired && view === AppView.FRIDGE) {
      result.splice(1, 0, '⚠️ 已过期');
    }

    return result;
  }, [items, view]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];

      setIsThinking(true);
      try {
        const type = view === AppView.WARDROBE ? ItemType.WARDROBE : ItemType.FRIDGE;

        // Only upload image for wardrobe items to save storage
        let cloudImageUrl = '';
        if (type === ItemType.WARDROBE) {
          cloudImageUrl = await uploadFile(file);
        }

        const analysis = await analyzeImage(base64Data, type);

        if (analysis.items && analysis.items.length > 0) {
          if (analysis.items.length === 1) {
            const item = analysis.items[0];
            const newItem: Partial<InventoryItem> = {
              imageUrl: cloudImageUrl,
              emoji: item.emoji, // Use emoji from analysis
              type: type,
              name: item.name,
              category: item.category,
              expiryDate: item.expiryDate,
              quantity: item.quantity,
              season: item.season,
              color: item.color,
              addedAt: Date.now(),
            };

            setEditingItem(newItem);
            setIsNewItem(true);
            setShowEditModal(true);
          } else {
            const newItems = await Promise.all(analysis.items.map(async (item, index) => {
              const newItem = {
                id: `${Date.now()}-${index}`,
                imageUrl: cloudImageUrl,
                emoji: item.emoji, // Use emoji from analysis
                type: type,
                name: item.name,
                category: item.category,
                expiryDate: item.expiryDate,
                quantity: item.quantity,
                season: item.season,
                color: item.color,
                addedAt: Date.now(),
              };
              // Add to cloud
              await addItem(newItem as InventoryItem);
              return newItem;
            }));

            setItems(prev => [...newItems as InventoryItem[], ...prev]);
          }
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('识别失败，请重试');
      } finally {
        setIsThinking(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualAdd = () => {
    setEditingItem({
      type: view === AppView.WARDROBE ? ItemType.WARDROBE : ItemType.FRIDGE,
      imageUrl: '',
      addedAt: Date.now()
    });
    setIsNewItem(true);
    setShowEditModal(true);
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    if (isNewItem) {
      const newItem = { ...itemData, id: Date.now().toString() } as InventoryItem;
      await addItem(newItem);
      setItems(prev => [newItem, ...prev]);
    } else {
      const updatedItem = { ...editingItem, ...itemData } as InventoryItem;
      await updateItem(updatedItem);
      setItems(prev => prev.map(i => i.id === editingItem?.id ? updatedItem : i));
    }
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveRecipe = async (recipeData: Partial<Recipe>) => {
    if (isNewRecipe) {
      const newRecipe = { ...recipeData, id: Date.now().toString(), addedAt: Date.now() } as Recipe;
      await addRecipe(newRecipe);
      setRecipes(prev => [newRecipe, ...prev]);
    } else {
      const updatedRecipe = { ...editingRecipe, ...recipeData } as Recipe;
      await updateRecipe(updatedRecipe);
      setRecipes(prev => prev.map(r => r.id === editingRecipe?.id ? updatedRecipe : r));
    }
    setShowRecipeModal(false);
    setEditingRecipe(null);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingItem) {
      await deleteItem(deletingItem.id);
      setItems(prev => prev.filter(i => i.id !== deletingItem.id));
      setDeletingItem(null);
    }
    if (deletingRecipe) {
      await deleteRecipe(deletingRecipe.id);
      setRecipes(prev => prev.filter(r => r.id !== deletingRecipe.id));
      setDeletingRecipe(null);
    }
    setShowDeleteModal(false);
  };

  const renderRecipeView = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-serif text-3xl text-zinc-900 mb-1">私房菜谱</h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase">
              Cookbook • {recipes.length} Recipes
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 -mx-4 px-4 no-scrollbar">
        {recipes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-400 animate-fade-in-up">
            <BookOpen size={48} strokeWidth={1} className="mb-4 opacity-50" />
            <p className="font-light">暂无菜谱，记录你的第一道菜？</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe, idx) => (
              <div key={recipe.id} className="aspect-[4/5]">
                <RecipeCard
                  recipe={recipe}
                  index={idx}
                  onEdit={(r) => { setEditingRecipe(r); setIsNewRecipe(false); setShowRecipeModal(true); }}
                  onDelete={(r) => { setDeletingRecipe(r); setShowDeleteModal(true); }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );

  const renderGridView = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-serif text-3xl text-zinc-900 mb-1">
              {view === AppView.FRIDGE ? '食材' : '衣物'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase">
              {view === AppView.FRIDGE ? 'Inventory' : 'Collection'} • {filteredItems.length} Items
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto no-scrollbar animate-fade-in-up delay-100 pb-2">
        <div className="flex gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                 whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all duration-300
                  ${activeCategory === cat
                  ? (cat === '⚠️ 已过期' ? 'bg-red-50 text-red-600 font-medium border border-red-200 shadow-sm' : 'skeuo-inner text-zinc-900 font-medium border-zinc-900')
                  : (cat === '⚠️ 已过期' ? 'text-red-500 hover:bg-red-50' : 'skeuo-btn text-zinc-500 hover:text-zinc-700')}
                `}
            >
              {cat === '⚠️ 已过期' ? '已过期' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 -mx-4 px-4 no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-400 animate-fade-in-up">
            <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
            <p className="font-light">暂无物品，尝试添加一个？</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="aspect-[4/5]">
                <ItemCard
                  item={item}
                  index={idx}
                  onEdit={(i) => { setEditingItem(i); setIsNewItem(false); setShowEditModal(true); }}
                  onDelete={handleDeleteClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="flex h-screen w-full bg-white text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-zinc-200 p-6 bg-zinc-50/50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">ZenHome</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: AppView.FRIDGE, icon: Refrigerator, label: '冰箱管理' },
            { id: AppView.RECIPES, icon: BookOpen, label: '私房菜谱' },
            { id: AppView.WARDROBE, icon: Shirt, label: '衣橱管家' },
            { id: AppView.SETTINGS, icon: User, label: '个人中心' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${view === item.id
                ? 'bg-zinc-900 text-white shadow-lg'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
              {item.id === AppView.FRIDGE && items.some(i => i.type === ItemType.FRIDGE && i.expiryDate && new Date(i.expiryDate) < new Date()) && (
                <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-zinc-200">
          <button
            onClick={() => setShowAIChat(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 transition-all mb-4"
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Zen AI</p>
              <p className="text-xs text-zinc-400">智能助手</p>
            </div>
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-zinc-200">
            <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-serif">
              {profile.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{profile.name}</p>
              <p className="text-xs text-zinc-400 truncate">生活家</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <span className="font-serif text-lg font-bold">ZenHome</span>
          </div>
          <button
            onClick={() => setShowAIChat(true)}
            className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            <Sparkles size={16} />
          </button>
        </div>

        <main className="flex-1 overflow-hidden p-4 md:p-8 max-w-7xl mx-auto w-full">
          {view === AppView.FRIDGE && renderGridView()}
          {view === AppView.RECIPES && renderRecipeView()}
          {view === AppView.WARDROBE && renderGridView()}
          {view === AppView.SETTINGS && (
            <SettingsView profile={profile} onUpdate={setProfile} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden border-t border-zinc-200 bg-white/90 backdrop-blur-lg pb-safe">
          <div className="flex justify-around p-2">
            {[
              { id: AppView.FRIDGE, icon: Refrigerator, label: '冰箱' },
              { id: AppView.RECIPES, icon: BookOpen, label: '菜谱' },
              { id: AppView.WARDROBE, icon: Shirt, label: '衣橱' },
              { id: AppView.SETTINGS, icon: User, label: '我的' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === item.id ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
              >
                <div className="relative">
                  <item.icon size={20} strokeWidth={view === item.id ? 2.5 : 2} />
                  {item.id === AppView.FRIDGE && items.some(i => i.type === ItemType.FRIDGE && i.expiryDate && new Date(i.expiryDate) < new Date()) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Action Group */}
        {(view === AppView.FRIDGE || view === AppView.WARDROBE || view === AppView.RECIPES) && (
          <FloatingActionGroup
            onManualAdd={() => {
              if (view === AppView.RECIPES) {
                setEditingRecipe({ addedAt: Date.now(), tags: [] });
                setIsNewRecipe(true);
                setShowRecipeModal(true);
              } else {
                handleManualAdd();
              }
            }}
            onCameraAdd={handleFileUpload}
            fileInputRef={fileInputRef}
            showCamera={view !== AppView.RECIPES}
          />
        )}
      </div>

      {/* Modals */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveItem}
        initialData={editingItem || {}}
        type={view === AppView.WARDROBE ? ItemType.WARDROBE : ItemType.FRIDGE}
        isNew={isNewItem}
      />

      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSave={handleSaveRecipe}
        initialData={editingRecipe || {}}
        isNew={isNewRecipe}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingItem?.name || deletingRecipe?.name}
      />

      <AIChatView
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        items={items}
        recipes={recipes}
      />

      {/* Loading Overlay */}
      {isThinking && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-600 font-medium animate-pulse">AI 正在识别中...</p>
        </div>
      )}
    </div>
  );
};

export default App;