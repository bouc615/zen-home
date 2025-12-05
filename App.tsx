import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Recipe, ItemType, ChatMessage } from './types';
import { analyzeImage, sendChatMessage } from './services/aiService';
import { fetchItems, addItem, updateItem, deleteItem, fetchRecipes, addRecipe, updateRecipe, deleteRecipe } from './services/cloudService';
import { EditItemModal } from './components/features/items/EditItemModal';
import { RecipeModal } from './components/features/recipes/RecipeModal';
import { SettingsView } from './components/pages/SettingsView';
import { AIChatView } from './components/features/chat/AIChatView';
import { ActionSheet } from './components/ui/ActionSheet';
import { Layout } from './components/layout/Layout';
import { FridgeView } from './components/pages/FridgeView';
import { RecipesView } from './components/pages/RecipesView';

function App() {
  // --- State ---
  const [items, setItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Modals & Sheets
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // For ActionSheet

  // Editing
  const [editingItem, setEditingItem] = useState<Partial<any> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [isNewRecipe, setIsNewRecipe] = useState(false);

  // AI & Loading
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的厨房管家。我可以帮你规划食谱、管理食材。今天想吃点什么？', timestamp: Date.now() }
  ]);

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

  // --- Handlers ---

  const handleFileSelected = async (file: File) => {
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
            await addItem(newItem as any);
            return newItem;
          }));

          setItems(prev => [...newItems as any[], ...prev]);
          alert(`已成功添加 ${newItems.length} 个物品！`);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('识别失败，请重试');
      } finally {
        setIsThinking(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualAdd = () => {
    setEditingItem({
      id: Date.now().toString(),
      type: ItemType.FRIDGE,
      imageUrl: '',
      addedAt: Date.now(),
      status: 'active',
      usageProgress: 0
    });
    setIsNewItem(true);
    setShowEditModal(true);
  };

  const handleSaveItem = async (item: any) => {
    try {
      // Ensure item has an ID
      const itemToSave = {
        ...item,
        id: item.id || Date.now().toString()
      };

      if (isNewItem) {
        const _id = await addItem(itemToSave);
        setItems(prev => [{ ...itemToSave, _id }, ...prev]);
      } else {
        await updateItem(itemToSave);
        setItems(prev => prev.map(i => i.id === itemToSave.id ? itemToSave : i));
      }
      setShowEditModal(false);
      setSelectedItem(null); // Close sheet if open
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleConsume = async (item: Partial<any>, progress: number) => {
    try {
      const updatedItem = {
        ...item,
        _id: item._id,
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

  const handleWaste = async (item: any) => {
    try {
      const updatedItem = { ...item, status: 'wasted' as const, wastedAt: Date.now() };
      await updateItem(updatedItem);
      setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    } catch (error) {
      console.error('Failed to waste item:', error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await deleteItem(item);
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

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onChatClick={() => setShowAIChat(true)} />}>
          <Route
            path="/"
            element={
              <FridgeView
                items={items}
                onItemClick={setSelectedItem}
                onAddClick={handleManualAdd}
                onFileSelected={handleFileSelected}
              />
            }
          />
          <Route
            path="/recipes"
            element={
              <RecipesView
                recipes={recipes}
                onAddClick={() => {
                  setEditingRecipe({ addedAt: Date.now(), tags: [] });
                  setIsNewRecipe(true);
                  setShowRecipeModal(true);
                }}
                onEditClick={(r) => {
                  setEditingRecipe(r);
                  setIsNewRecipe(false);
                  setShowRecipeModal(true);
                }}
                onDeleteClick={async (r) => {
                  if (confirm('确定删除这个菜谱吗？')) {
                    await deleteRecipe(r);
                    setRecipes(prev => prev.filter(i => i.id !== r.id));
                  }
                }}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsView profile={{ name: 'User', emails: [], avatar: '' }} onUpdate={() => { }} />
            }
          />
          <Route
            path="/chat"
            element={
              <AIChatView
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClose={() => window.history.back()}
                isThinking={isThinking}
              />
            }
          />
        </Route>
      </Routes>

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
              const _id = await addRecipe(recipe as Recipe);
              setRecipes(prev => [{ ...recipe as Recipe, _id }, ...prev]);
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
    </BrowserRouter>
  );
}

export default App;