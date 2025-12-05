import React, { useState, useEffect } from 'react';
import { Sparkles, Refrigerator, BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LoginModal } from '../features/auth/LoginModal';
import { getUserInfo, onLoginStateChanged, signOut } from '../../services/cloudService';

interface LayoutProps {
  onChatClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onChatClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUserInfo().then(setUser);
    onLoginStateChanged(setUser);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await signOut();
    }
  };

  // Helper to determine active state
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', icon: Refrigerator, label: '冰箱' },
    { path: '/recipes', icon: BookOpen, label: '菜谱' },
    { path: '/chat', icon: Sparkles, label: 'AI 助手' },
    { path: '/settings', icon: User, label: '我的' },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsLoginModalOpen(false)}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-zinc-200 p-6 bg-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">ZenKitchen</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                ? 'bg-zinc-100 text-zinc-900 font-medium'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-auto pt-6 border-t border-zinc-100">
          {user ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.uid?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium truncate">已登录</span>
                  <span className="text-xs text-zinc-400 truncate">手机用户</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <LogIn size={18} />
              <span className="font-medium">登录 / 注册</span>
            </button>
          )}
        </div>
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
          <div className="flex items-center gap-2">
            {!user && (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg shadow-sm"
              >
                登录
              </button>
            )}
            <Link
              to="/chat"
              className="w-9 h-9 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm"
            >
              <Sparkles size={16} />
            </Link>
          </div>
        </div>

        <main className="flex-1 overflow-hidden p-4 md:p-8 max-w-2xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden border-t border-zinc-200 bg-white/80 backdrop-blur-lg pb-safe">
          <div className="flex justify-around p-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive(item.path)
                  ? 'text-zinc-900 bg-zinc-100 scale-105'
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                  }`}
              >
                <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
