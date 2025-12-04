import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Refrigerator, BookOpen, User, Plus, Camera, Search, X } from 'lucide-react';
import { InventoryItem, Recipe, AppView, ItemType, ChatMessage } from './types';
import { analyzeImage, sendChatMessage } from './services/aiService';
import { uploadFile, fetchItems, addItem, updateItem, deleteItem, fetchRecipes, addRecipe, updateRecipe, deleteRecipe } from './services/cloudService';
import { EditItemModal } from './components/EditItemModal';
import { RecipeModal } from './components/RecipeModal';
import { RecipeCard } from './components/RecipeCard';
import { SettingsView } from './components/SettingsView';
import { AIChatView } from './components/AIChatView';
import { FilterBar } from './components/FilterBar';
import { ItemListView } from './components/ItemListView';
import { ActionSheet } from './components/ActionSheet';

function App() {
  // --- State ---
  const [view, setView] = useState<AppView>(AppView.FRIDGE);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeStatus, setActiveStatus] = useState('all'); // 'all' | 'expiring'
  const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词

  // Modals & Sheets
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // For ActionSheet

  // Editing
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [isNewRecipe, setIsNewRecipe] = useState(false);

  // AI & Loading
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的厨房管家。我可以帮你规划食谱、管理食材。今天想吃点什么？', timestamp: Date.now() }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedItems, fetchedRecipes] = await Promise.all([fetchItems(), fetchRecipes()]);
      setItems(fetchedItems);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // --- Computed ---
  const filteredItems = useMemo(() => {
    let current = items.filter(i => i.type === ItemType.FRIDGE);

    // Status Filter (Level 1)
    // Always filter out consumed/wasted unless we add a history view later
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

  // --- Handlers ---

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];

      setIsThinking(true);
      try {
        // AI Analysis
        const analysis = await analyzeImage(base64Data, ItemType.FRIDGE);

        if (analysis.items && analysis.items.length > 0) {
          // Batch Add directly (Zen Mode: Trust AI)
          const newItems = await Promise.all(analysis.items.map(async (item, index) => {
            const newItem = {
              id: `${Date.now()}-${index}`,
              imageUrl: '', // No image for receipt items to keep UI clean
              emoji: item.emoji,
              type: ItemType.FRIDGE,
              name: item.name,
              category: item.category,
              expiryDate: item.expiryDate,
              quantity: item.quantity, // String: "1个", "500g"
              addedAt: Date.now(),
              status: 'active' as const,
              usageProgress: 0,
            };
            await addItem(newItem as InventoryItem);
            return newItem;
          }));

          setItems(prev => [...newItems as InventoryItem[], ...prev]);
          alert(`已成功添加 ${newItems.length} 个物品！`);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('识别失败，请重试');
      } finally {
        setIsThinking(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualAdd = () => {
    setEditingItem({
      type: ItemType.FRIDGE,
      imageUrl: '',
      addedAt: Date.now(),
      status: 'active',
      usageProgress: 0
    });
    setIsNewItem(true);
    setShowEditModal(true);
  };

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      if (isNewItem) {
        await addItem(item);
        setItems(prev => [item, ...prev]);
      } else {
        await updateItem(item);
        setItems(prev => prev.map(i => i.id === item.id ? item : i));
      }
      setShowEditModal(false);
      setSelectedItem(null); // Close sheet if open
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleConsume = async (item: InventoryItem, progress: number) => {
    try {
      const updatedItem = {
        ...item,
        usageProgress: progress,
        status: progress >= 100 ? 'consumed' as const : 'active' as const,
        consumedAt: progress >= 100 ? Date.now() : undefined
      };

      await updateItem(updatedItem);
      setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    } catch (error) {
      console.error('Failed to consume item:', error);
    }
  };

  const handleWaste = async (item: InventoryItem) => {
    try {
      const updatedItem = { ...item, status: 'wasted' as const, wastedAt: Date.now() };
      await updateItem(updatedItem);
      setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    } catch (error) {
      console.error('Failed to waste item:', error);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Chat Handlers
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const responseText = await sendChatMessage([...chatMessages, userMsg], text, items, recipes);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: '抱歉，我遇到了一些问题。', timestamp: Date.now() }]);
    } finally {
      setIsThinking(false);
    }
  };

  // --- Renderers ---

  const renderFridgeView = () => (
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
            onClick={handleManualAdd}
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
          onItemClick={setSelectedItem}
        />
      </div>

      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );

  const renderRecipeView = () => (
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
          onClick={() => {
            setEditingRecipe({ addedAt: Date.now(), tags: [] });
            setIsNewRecipe(true);
            setShowRecipeModal(true);
          }}
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
                onEdit={(r) => { setEditingRecipe(r); setIsNewRecipe(false); setShowRecipeModal(true); }}
                onDelete={async (r) => {
                  if (confirm('确定删除这个菜谱吗？')) {
                    await deleteRecipe(r.id);
                    setRecipes(prev => prev.filter(i => i.id !== r.id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Desktop Sidebar (Optional, keeping simple for now) */}
      <div className="hidden md:flex w-64 flex-col border-r border-zinc-200 p-6 bg-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">ZenKitchen</h1>
        </div>
        {/* ... Desktop Nav ... */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-zinc-50 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <span className="font-serif text-lg font-bold">ZenKitchen</span>
          </div>
          <button
            onClick={() => setShowAIChat(true)}
            className="w-9 h-9 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm"
          >
            <Sparkles size={16} />
          </button>
        </div>

        <main className="flex-1 overflow-hidden p-4 md:p-8 max-w-2xl mx-auto w-full">
          {view === AppView.FRIDGE && renderFridgeView()}
          {view === AppView.RECIPES && renderRecipeView()}
          {view === AppView.SETTINGS && (
            <SettingsView profile={{ name: 'User', emails: [], avatar: '' }} onUpdate={() => { }} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden border-t border-zinc-200 bg-white/80 backdrop-blur-lg pb-safe">
          <div className="flex justify-around p-2">
            {[
              { id: AppView.FRIDGE, icon: Refrigerator, label: '冰箱' },
              { id: AppView.RECIPES, icon: BookOpen, label: '菜谱' },
              { id: AppView.SETTINGS, icon: User, label: '我的' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${view === item.id
                  ? 'text-zinc-900 bg-zinc-100 scale-105'
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                  }`}
              >
                <item.icon size={24} strokeWidth={view === item.id ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${view === item.id ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <ActionSheet
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onConsume={handleConsume}
        onWaste={handleWaste}
        onEdit={(item) => {
          setEditingItem(item);
          setIsNewItem(false);
          setShowEditModal(true);
        }}
      />

      {showEditModal && editingItem && (
        <EditItemModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveItem}
          initialData={editingItem}
          type={ItemType.FRIDGE}
          isNew={isNewItem}
        />
      )}

      {showRecipeModal && editingRecipe && (
        <RecipeModal
          isOpen={showRecipeModal}
          onClose={() => setShowRecipeModal(false)}
          onSave={async (recipe) => {
            if (isNewRecipe) {
              await addRecipe(recipe as Recipe);
              setRecipes(prev => [recipe as Recipe, ...prev]);
            } else {
              await updateRecipe(recipe as Recipe);
              setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe as Recipe : r));
            }
            setShowRecipeModal(false);
          }}
          initialData={editingRecipe}
          isNew={isNewRecipe}
        />
      )}

      {showAIChat && (
        <AIChatView
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setShowAIChat(false)}
          isThinking={isThinking}
        />
      )}
    </div>
  );
}

export default App;