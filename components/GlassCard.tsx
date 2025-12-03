import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  noPadding = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        zen-glass
        rounded-[24px] md:rounded-[32px]
        transition-all duration-700 cubic-bezier(0.2, 0, 0.2, 1)
        ${(interactive || onClick) ? 'interactive cursor-pointer active:scale-[0.99]' : ''}
        ${noPadding ? '' : 'p-6 md:p-8'}
        ${className}
      `}
    >
      {/* Subtle Noise Texture for "Paper" feel on cards too */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-stone-900 z-0"></div>

      {/* Inner container must fill width/height to support flex children */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};