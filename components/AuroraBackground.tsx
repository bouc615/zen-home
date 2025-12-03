import React from 'react';

interface AuroraBackgroundProps {
  isThinking?: boolean;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ isThinking }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white pointer-events-none">
      {/* Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white opacity-50" />

      {/* Thinking State Overlay */}
      <div
        className={`absolute inset-0 bg-zinc-100/50 transition-opacity duration-500 ${isThinking ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Minimalist Decor - Optional geometric shapes or just clean space */}
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-100/50 blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-50/80 blur-[100px]" />
    </div>
  );
};
