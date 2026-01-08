import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { UserProfile } from '../../types';
import {
  User,
  Flame,
  Utensils,
  Ban,
  Globe,
  X
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempInput, setTempInput] = useState('');

  const updatePreference = (key: keyof NonNullable<UserProfile['preferences']>, value: any) => {
    onUpdate({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value
      }
    });
  };

  const spicinessLevels = [
    { value: 'none', label: '不辣' },
    { value: 'mild', label: '微辣' },
    { value: 'medium', label: '中辣' },
    { value: 'hot', label: '特辣' }
  ];

  const commonDietary = ['素食', '无麸质', '低碳水', '高蛋白'];
  const commonCuisines = ['中餐', '日料', '西餐', '泰餐', '韩料'];

  const toggleArrayItem = (key: 'dietary' | 'cuisine', item: string) => {
    const current = profile.preferences?.[key] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updatePreference(key, updated);
  };

  const addDislike = () => {
    if (!tempInput.trim()) return;
    const current = profile.preferences?.dislikes || [];
    if (!current.includes(tempInput.trim())) {
      updatePreference('dislikes', [...current, tempInput.trim()]);
    }
    setTempInput('');
    setEditingField(null);
  };

  const removeDislike = (item: string) => {
    const current = profile.preferences?.dislikes || [];
    updatePreference('dislikes', current.filter(i => i !== item));
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in-up px-4 pt-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-3xl text-zinc-900">个人中心</h2>
      </div>

      {/* Profile Section */}
      <section>
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-4">基本信息</h3>
        <GlassCard className="!p-0 overflow-hidden !rounded-2xl">
          <div className="flex items-center p-4 bg-white/50 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl font-serif mr-4 shadow-inner shrink-0">
              {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : (profile.name[0] || <User />)}
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-zinc-400 block mb-1">昵称</label>
              <input
                value={profile.name}
                onChange={e => onUpdate({ ...profile, name: e.target.value })}
                className="bg-transparent text-lg font-medium text-zinc-900 w-full focus:outline-none placeholder-zinc-300"
                placeholder="设置昵称"
              />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Preferences Section */}
      <section>
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-4">口味偏好</h3>
        <GlassCard className="!p-0 overflow-hidden !rounded-2xl divide-y divide-zinc-100/50">

          {/* Spiciness */}
          <div className="p-4 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Flame size={18} />
              </div>
              <span className="text-zinc-700 font-medium">辣度接受</span>
            </div>
            <div className="flex bg-zinc-100 rounded-lg p-1 self-start sm:self-auto">
              {spicinessLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => updatePreference('spiciness', level.value)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${profile.preferences?.spiciness === level.value
                      ? 'bg-white text-zinc-900 shadow-sm font-medium'
                      : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-500 shrink-0">
                <Utensils size={18} />
              </div>
              <span className="text-zinc-700 font-medium">饮食习惯</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {commonDietary.map(item => (
                <button
                  key={item}
                  onClick={() => toggleArrayItem('dietary', item)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${profile.preferences?.dietary?.includes(item)
                      ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                      : 'bg-transparent border-zinc-200 text-zinc-500 hover:border-zinc-300'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <Globe size={18} />
              </div>
              <span className="text-zinc-700 font-medium">喜好菜系</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {commonCuisines.map(item => (
                <button
                  key={item}
                  onClick={() => toggleArrayItem('cuisine', item)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${profile.preferences?.cuisine?.includes(item)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                      : 'bg-transparent border-zinc-200 text-zinc-500 hover:border-zinc-300'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Dislikes */}
          <div className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                  <Ban size={18} />
                </div>
                <span className="text-zinc-700 font-medium">忌口/不吃</span>
              </div>
              <button
                onClick={() => setEditingField('dislikes')}
                className="text-xs text-blue-500 font-medium hover:text-blue-600"
              >
                添加
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pl-11">
              {profile.preferences?.dislikes?.map(item => (
                <span key={item} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs rounded-md">
                  {item}
                  <button onClick={() => removeDislike(item)} className="hover:text-red-800">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {editingField === 'dislikes' && (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={tempInput}
                    onChange={e => setTempInput(e.target.value)}
                    onBlur={addDislike}
                    onKeyDown={e => e.key === 'Enter' && addDislike()}
                    className="w-20 px-2 py-1 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="输入..."
                  />
                </div>
              )}
              {(!profile.preferences?.dislikes?.length && editingField !== 'dislikes') && (
                <span className="text-xs text-zinc-400 italic">无忌口</span>
              )}
            </div>
          </div>

        </GlassCard>
      </section>

      <div className="text-center pt-8 text-zinc-300 text-xs font-serif italic">
        ZenKitchen v1.0 • Designed with Mindfulness
      </div>
    </div>
  );
};
