import React from 'react';
import { GlassCard } from './GlassCard';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdate }) => {

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-zinc-900 mb-2">个人中心</h2>
        <p className="text-zinc-500 font-light">管理您的偏好设置与通知方式</p>
      </div>

      <GlassCard className="!rounded-none !border-zinc-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center text-zinc-600 text-xl font-serif">
            {profile.name[0]}
          </div>
          <div>
            <input
              value={profile.name}
              onChange={e => onUpdate({ ...profile, name: e.target.value })}
              className="bg-transparent text-xl font-serif text-zinc-900 border-b border-transparent focus:border-zinc-300 focus:outline-none"
            />
            <p className="text-xs text-zinc-400 mt-1">点击修改昵称</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!rounded-none !border-zinc-200">
        <h3 className="font-serif text-lg text-zinc-900 mb-4">关于 ZenKitchen</h3>
        <p className="text-sm text-zinc-500 font-light leading-relaxed">
          ZenKitchen 是一款极简主义的厨房管理应用。我们相信，通过清晰地了解冰箱里的食材，可以减少浪费，过上更正念的生活。
        </p>
      </GlassCard>

      <div className="text-center pt-8 text-zinc-300 text-xs font-serif italic">
        ZenKitchen v1.0 • Designed with Mindfulness
      </div>
    </div>
  );
};
