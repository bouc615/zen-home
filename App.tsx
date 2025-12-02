import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shirt, 
  Refrigerator, 
  Camera, 
  Sparkles,
  LayoutGrid,
  Mail,
  AlertCircle,
  CheckCircle,
  User,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  Leaf,
  Droplets,
  Wind,
  Search,
  ChevronLeft
} from 'lucide-react';
import { AuroraBackground } from './components/AuroraBackground';
import { GlassCard } from './components/GlassCard';
import { AIChat } from './components/AIChat';
import { AppView, InventoryItem, ItemType, UserProfile } from './types';
import { analyzeImage } from './services/geminiService';

// Initial Data
const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: '有机纯牛奶', type: ItemType.FRIDGE, category: '乳制品', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), expiryDate: '2023-11-20', quantity: '1L' },
  { id: '2', name: '牛油果', type: ItemType.FRIDGE, category: '水果', imageUrl: 'https://images.unsplash.com/photo-1523049673856-6468baca292f?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), expiryDate: '2023-11-15', quantity: '3 个' },
  { id: '3', name: '复古牛仔夹克', type: ItemType.WARDROBE, category: '外套', imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), color: '丹宁蓝', season: '四季' },
  { id: '4', name: '亚麻休闲衬衫', type: ItemType.WARDROBE, category: '上装', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80', addedAt: Date.now(), color: '米白', season: '夏季' },
];

const FRIDGE_CATEGORIES = ['蔬菜', '水果', '肉类', '海鲜', '乳制品', '饮品', '调味品', '零食', '其他'];
const WARDROBE_CATEGORIES = ['上装', '下装', '外套', '连身裙', '鞋履', '包袋', '配饰', '家居服', '其他'];

// --- Components ---

const ItemCard: React.FC<{ 
  item: InventoryItem; 
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  index: number;
}> = ({ item, onEdit, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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

  const isExpired = item.expiryDate ? new Date(item.expiryDate) < new Date() : false;
  const expiringSoon = item.expiryDate 
    ? (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24) <= 3 && !isExpired
    : false;

  return (
    <div 
      className={`relative group touch-manipulation select-none h-full opacity-0 animate-fade-in-up ${delayClass}`}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
    >
      <GlassCard className="h-full flex flex-col !rounded-[24px] !p-0 bg-white/50 border-white/40" noPadding>
        <div className="aspect-[4/5] w-full relative overflow-hidden bg-stone-100 shrink-0">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
               <ImageIcon size={32} strokeWidth={1} />
             </div>
          )}
          
          {(isExpired || expiringSoon) && (
            <div className="absolute top-3 right-3">
               <span className={`w-2 h-2 rounded-full block ${isExpired ? 'bg-red-400' : 'bg-orange-300'} shadow-sm`}></span>
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        <div className="p-4 flex flex-col flex-1 justify-between bg-white/30 backdrop-blur-sm">
          <div>
            <div className="flex justify-between items-start mb-1">
               <span className="text-[10px] tracking-widest uppercase text-stone-400 font-medium">{item.category}</span>
            </div>
            <h3 className="font-serif text-[15px] font-medium text-stone-800 truncate tracking-wide">{item.name}</h3>
          </div>
          
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-light">
             {item.type === ItemType.FRIDGE ? (
                <span>{item.expiryDate ? item.expiryDate.slice(5) : '--'}</span>
             ) : (
                <span>{item.season || '--'}</span>
             )}
             {item.type === ItemType.FRIDGE ? (
                <span className="truncate max-w-[50%]">{item.quantity}</span>
             ) : (
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-stone-200" style={{backgroundColor: 'currentColor'}}></div> {item.color}</span>
             )}
          </div>
        </div>
      </GlassCard>

      {showMenu && (
        <div 
          className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); setShowMenu(false); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage-50 text-sage-800 rounded-full hover:bg-sage-100 transition-colors shadow-sm"
          >
            <Edit2 size={16} /> <span className="text-sm font-medium">编辑</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item); setShowMenu(false); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-500 border border-red-100 rounded-full hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 size={16} /> <span className="text-sm font-medium">删除</span>
          </button>
          <p className="absolute bottom-4 text-[10px] text-stone-400">点击关闭</p>
        </div>
      )}
    </div>
  );
};

const EditItemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  initialData?: Partial<InventoryItem>;
  type: ItemType;
  isNew?: boolean;
}> = ({ isOpen, onClose, onSave, initialData, type, isNew }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const categories = type === ItemType.FRIDGE ? FRIDGE_CATEGORIES : WARDROBE_CATEGORIES;

  useEffect(() => {
    setFormData(initialData || { type });
  }, [initialData, type]);

  if (!isOpen) return null;

  const currentCategories = formData.category && !categories.includes(formData.category) 
    ? [...categories, formData.category] 
    : categories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <GlassCard className="!bg-white/90">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl text-stone-800">{isNew ? '录入物品' : '编辑物品'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} className="text-stone-500" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
               <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">名称</label>
               <input 
                 className="w-full bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none transition-colors font-serif text-lg"
                 value={formData.name || ''}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 placeholder="例如：牛油果"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">分类</label>
                   <div className="relative">
                      <select 
                        className="w-full appearance-none bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none transition-colors"
                        value={formData.category || ''}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="" disabled>选择分类</option>
                        {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-0 top-3 text-stone-400 pointer-events-none" />
                   </div>
                </div>
                
                {type === ItemType.FRIDGE ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">数量</label>
                    <input 
                      className="w-full bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none"
                      value={formData.quantity || ''}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      placeholder="如: 500g"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">颜色</label>
                    <input 
                      className="w-full bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none"
                      value={formData.color || ''}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      placeholder="如: 藏青"
                    />
                  </div>
                )}
            </div>

            {type === ItemType.FRIDGE ? (
               <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">过期日期</label>
                  <input 
                    type="date"
                    className="w-full bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none font-mono text-sm"
                    value={formData.expiryDate || ''}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  />
               </div>
            ) : (
               <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">适用季节</label>
                  <input 
                    className="w-full bg-stone-50 border-b border-stone-200 px-1 py-2 text-stone-800 focus:border-sage-500 focus:outline-none"
                    value={formData.season || ''}
                    onChange={e => setFormData({...formData, season: e.target.value})}
                    placeholder="如: 春/秋"
                  />
               </div>
            )}

            <button 
              onClick={() => onSave(formData)}
              className="w-full py-3.5 bg-sage-800 hover:bg-sage-900 text-white rounded-xl font-medium transition-all shadow-lg shadow-sage-900/10 mt-4 active:scale-[0.98]"
            >
              {isNew ? '确认入库' : '保存修改'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xs animate-in zoom-in-95 duration-200">
        <GlassCard className="!bg-white/95 text-center">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h3 className="font-serif text-lg text-stone-800 mb-2">确认移除?</h3>
          <p className="text-sm text-stone-500 mb-6">
            您确定要移除 <span className="font-medium text-stone-800">{itemName}</span> 吗？此操作无法撤销。
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50">取消</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 shadow-lg shadow-red-500/20">移除</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
}> = ({ profile, onUpdate }) => {
  const [newEmail, setNewEmail] = useState('');

  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      onUpdate({ ...profile, emails: [...profile.emails, newEmail] });
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    onUpdate({ ...profile, emails: profile.emails.filter(e => e !== email) });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
         <h2 className="font-serif text-3xl text-stone-800 mb-2">个人中心</h2>
         <p className="text-stone-500 font-light">管理您的偏好设置与通知方式</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 text-xl font-serif">
            {profile.name[0]}
          </div>
          <div>
            <input 
              value={profile.name}
              onChange={e => onUpdate({...profile, name: e.target.value})}
              className="bg-transparent text-xl font-serif text-stone-800 border-b border-transparent focus:border-sage-300 focus:outline-none"
            />
            <p className="text-xs text-stone-400 mt-1">点击修改昵称</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
         <h3 className="font-serif text-lg text-stone-800 mb-4">通知设置</h3>
         <div className="flex items-center gap-2 mb-4 text-stone-800">
            <Mail size={18} />
            <span className="font-medium">邮箱提醒</span>
         </div>
         <p className="text-sm text-stone-500 mb-4 font-light">
           当食材即将过期时，我们将向以下地址发送清单。
         </p>
         
         <div className="space-y-3">
           {profile.emails.map(email => (
             <div key={email} className="flex justify-between items-center bg-stone-50 px-4 py-3 rounded-xl border border-stone-100">
               <span className="text-stone-600 text-sm">{email}</span>
               <button onClick={() => removeEmail(email)} className="text-stone-400 hover:text-red-400 p-1">
                 <X size={16} />
               </button>
             </div>
           ))}
         </div>

         <div className="mt-4 flex gap-2">
           <input 
             className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-400 transition-colors"
             placeholder="输入邮箱地址..."
             value={newEmail}
             onChange={e => setNewEmail(e.target.value)}
           />
           <button 
             onClick={addEmail}
             disabled={!newEmail}
             className="bg-stone-800 text-white px-4 rounded-xl text-sm font-medium hover:bg-stone-900 disabled:opacity-50"
           >
             添加
           </button>
         </div>
      </GlassCard>
      
      <div className="text-center pt-8 text-stone-300 text-xs font-serif italic">
         ZenHome v1.0 • Designed with Mindfulness
      </div>
    </div>
  );
}

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [isThinking, setIsThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
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
    
    if (activeCategory !== '全部') {
      currentItems = currentItems.filter(i => i.category === activeCategory);
    }
    return currentItems;
  }, [items, view, activeCategory]);

  const categories = useMemo(() => {
    let currentItems = items;
    if (view === AppView.FRIDGE) currentItems = items.filter(i => i.type === ItemType.FRIDGE);
    if (view === AppView.WARDROBE) currentItems = items.filter(i => i.type === ItemType.WARDROBE);
    const cats = Array.from(new Set(currentItems.map(i => i.category))).filter(Boolean);
    return ['全部', ...cats];
  }, [items, view]);

  const expiringItems = useMemo(() => {
    return items.filter(i => {
      if (i.type !== ItemType.FRIDGE || !i.expiryDate) return false;
      const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
      return days <= 3;
    });
  }, [items]);

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
        const analysis = await analyzeImage(base64Data, type);
        
        const newItem: Partial<InventoryItem> = {
          imageUrl: base64,
          type: type,
          name: analysis.name,
          category: analysis.category,
          expiryDate: analysis.expiryDate,
          quantity: analysis.quantity,
          season: analysis.season,
          color: analysis.color,
          addedAt: Date.now(),
        };
        
        setEditingItem(newItem);
        setIsNewItem(true);
        setShowEditModal(true);
      } catch (error) {
        console.error(error);
        alert('无法识别图片，请重试');
      } finally {
        setIsThinking(false);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    if (isNewItem) {
      const newItem = { ...itemData, id: Date.now().toString() } as InventoryItem;
      setItems(prev => [newItem, ...prev]);
    } else {
      setItems(prev => prev.map(i => i.id === editingItem?.id ? { ...i, ...itemData } : i));
    }
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      setItems(prev => prev.filter(i => i.id !== deletingItem.id));
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
  };

  const sendEmailReport = () => {
    if (profile.emails.length === 0) {
      setView(AppView.SETTINGS);
      alert('请先设置邮箱地址');
      return;
    }
    
    const subject = `ZenHome 食材保鲜提醒 - ${new Date().toLocaleDateString()}`;
    const body = `亲爱的 ${profile.name},\n\n以下食材需要您关注:\n\n` + 
      expiringItems.map(i => `- ${i.name} (过期日: ${i.expiryDate})`).join('\n') + 
      `\n\n请尽快享用。\n\n来自 ZenHome`;
    
    window.location.href = `mailto:${profile.emails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getPoeticGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { title: "夜阑人静", sub: "星河入梦，万物安眠" };
    if (hour < 11) return { title: "晨光熹微", sub: "清风拂面，唤醒生机" };
    if (hour < 14) return { title: "午后静谧", sub: "日光倾城，片刻安闲" };
    if (hour < 18) return { title: "日落时分", sub: "夕阳余晖，温暖归途" };
    return { title: "华灯初上", sub: "卸下疲惫，回归本真" };
  };

  const greeting = getPoeticGreeting();

  // --- Layout Renderers ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="pt-8 pb-4">
         <h1 className="font-serif text-4xl text-stone-800 mb-2">{greeting.title}</h1>
         <p className="text-stone-500 font-light tracking-wide">{greeting.sub}</p>
      </div>

      <GlassCard className="!bg-gradient-to-br from-white/80 to-sage-50/50">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-sage-100 rounded-full text-sage-600">
               <Leaf size={24} strokeWidth={1.5} />
            </div>
            <div>
               <h3 className="font-serif text-lg text-stone-800 mb-1">今日灵感</h3>
               <p className="text-sm text-stone-600 leading-relaxed font-light">
                 "生活不是等待风暴过去，而是学会在雨中翩翩起舞。"
               </p>
            </div>
         </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6">
        {/* Large Prominent Cards for Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <GlassCard 
              className="group flex flex-col items-start gap-4 !p-8 hover:bg-white/80 transition-all cursor-pointer relative overflow-hidden" 
              onClick={() => setView(AppView.FRIDGE)}
           >
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <Droplets size={140} strokeWidth={0.5} />
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                 <Droplets size={28} strokeWidth={1.5} />
              </div>
              <div>
                 <h3 className="font-serif text-2xl text-stone-800 mb-1">冷鲜管理</h3>
                 <p className="text-stone-500 font-light">管理冰箱库存与保质期</p>
              </div>
           </GlassCard>
           
           <GlassCard 
              className="group flex flex-col items-start gap-4 !p-8 hover:bg-white/80 transition-all cursor-pointer relative overflow-hidden" 
              onClick={() => setView(AppView.WARDROBE)}
           >
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <Wind size={140} strokeWidth={0.5} />
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                 <Wind size={28} strokeWidth={1.5} />
              </div>
              <div>
                 <h3 className="font-serif text-2xl text-stone-800 mb-1">衣橱美学</h3>
                 <p className="text-stone-500 font-light">数字化你的个人风格</p>
              </div>
           </GlassCard>
        </div>

        {expiringItems.length > 0 && (
           <GlassCard>
             <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-3 rounded-xl mb-4">
               <AlertCircle size={20} />
               <span className="text-sm font-medium">{expiringItems.length} 件物品即将过期</span>
             </div>
             <button 
               onClick={sendEmailReport}
               className="w-full py-2.5 flex items-center justify-center gap-2 bg-stone-800 text-white rounded-xl text-sm hover:bg-stone-900 transition-colors"
             >
               <Mail size={16} /> 发送清单给家人
             </button>
           </GlassCard>
        )}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setView(AppView.DASHBOARD)}
             className="p-2 -ml-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"
           >
              <ChevronLeft size={24} />
           </button>
           <div>
              <h2 className="font-serif text-3xl text-stone-800 mb-1">
                {view === AppView.FRIDGE ? '食材' : '衣物'}
              </h2>
              <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">
                {view === AppView.FRIDGE ? 'Inventory' : 'Collection'} • {filteredItems.length} Items
              </p>
           </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowChat(true)}
             className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 hover:bg-sage-200 transition-colors"
           >
             <Sparkles size={18} />
           </button>
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
                   ? 'bg-stone-800 text-white shadow-md' 
                   : 'bg-white/50 text-stone-500 hover:bg-white/80'}
               `}
             >
               {cat}
             </button>
           ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 -mx-4 px-4 no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-stone-400 animate-fade-in-up">
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

      <button
         onClick={handleManualAdd}
         className="fixed bottom-24 right-6 w-14 h-14 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-stone-900/20 hover:scale-110 transition-transform active:scale-95 z-40"
      >
         <Plus size={24} />
      </button>

      <label className="fixed bottom-40 right-6 w-14 h-14 bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg shadow-stone-900/10 hover:scale-110 transition-transform active:scale-95 cursor-pointer z-40 border border-stone-100">
         <Camera size={24} />
         <input 
           ref={fileInputRef}
           type="file" 
           accept="image/*" 
           capture="environment"
           className="hidden"
           onChange={handleFileUpload}
         />
      </label>
    </div>
  );

  return (
    <div className="min-h-screen relative flex text-stone-800 font-sans selection:bg-sage-200">
      <AuroraBackground isThinking={isThinking} />
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-24 h-screen flex-col items-center py-8 z-40 fixed left-0 top-0">
        <GlassCard className="h-full w-20 flex flex-col items-center !px-0 py-6" noPadding>
          <div className="flex flex-col gap-6 w-full px-2">
            {[
              { id: AppView.DASHBOARD, icon: LayoutGrid, label: '首页' },
              { id: AppView.SETTINGS, icon: User, label: '我的' },
            ].map((item) => (
               <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`
                    w-full aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 group
                    ${view === item.id ? 'bg-sage-50 text-sage-900' : 'text-stone-400 hover:bg-white/50 hover:text-stone-600'}
                  `}
               >
                  <item.icon size={24} strokeWidth={1.5} />
                  {view === item.id && <div className="w-1 h-1 rounded-full bg-sage-900 mt-1" />}
               </button>
            ))}
          </div>
        </GlassCard>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-28 p-4 md:p-8 h-screen overflow-hidden">
        <div className="max-w-5xl mx-auto h-full relative">
           {view === AppView.DASHBOARD && renderDashboard()}
           {(view === AppView.FRIDGE || view === AppView.WARDROBE) && renderGridView()}
           {view === AppView.SETTINGS && <SettingsView profile={profile} onUpdate={setProfile} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-20 z-40">
        <GlassCard className="h-full !px-2 flex items-center" noPadding>
          <div className="flex justify-around items-center w-full h-full">
            {[
              { id: AppView.DASHBOARD, icon: LayoutGrid },
              { id: AppView.SETTINGS, icon: User },
            ].map((item) => (
               <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`
                    p-4 rounded-2xl transition-all duration-300 relative
                    ${view === item.id ? 'text-sage-900 -translate-y-2' : 'text-stone-400'}
                  `}
               >
                  <item.icon size={24} strokeWidth={view === item.id ? 2 : 1.5} />
                  {view === item.id && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-900" />}
               </button>
            ))}
          </div>
        </GlassCard>
      </nav>

      {/* Modals & Overlays */}
      <AIChat 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        type={view === AppView.WARDROBE ? ItemType.WARDROBE : ItemType.FRIDGE}
        inventory={items}
        onThinking={setIsThinking}
      />

      <EditItemModal 
         isOpen={showEditModal}
         onClose={() => { setShowEditModal(false); setEditingItem(null); }}
         onSave={handleSaveItem}
         initialData={editingItem || {}}
         type={view === AppView.WARDROBE ? ItemType.WARDROBE : ItemType.FRIDGE}
         isNew={isNewItem}
      />

      <DeleteConfirmModal 
         isOpen={showDeleteModal}
         onClose={() => setShowDeleteModal(false)}
         onConfirm={confirmDelete}
         itemName={deletingItem?.name}
      />
      
      {isThinking && !showChat && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in">
           <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin mb-4"></div>
           <p className="font-serif text-stone-600 animate-pulse">正在感知...</p>
        </div>
      )}
    </div>
  );
};

export default App;