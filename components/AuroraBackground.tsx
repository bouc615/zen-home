import React from 'react';

interface AuroraBackgroundProps {
  isThinking?: boolean;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ isThinking }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-stone-50 pointer-events-none">
      {/* Base Gradient - Snow Paper Tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-[#F5F5F4] to-[#E7E5E4] opacity-90" />

      {/* Ink Plum Branch (SVG Animation) */}
      <div className="absolute bottom-0 left-[-5%] w-[60vh] h-[80vh] opacity-80 z-0 pointer-events-none">
        <svg viewBox="0 0 400 600" className="w-full h-full overflow-visible">
           <defs>
             <filter id="ink-blur" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
             </filter>
           </defs>
           {/* Branch Main */}
           <path 
             d="M0,600 C50,550 80,500 100,450 C120,400 110,350 150,300 C190,250 220,280 250,220 C280,160 260,120 300,80" 
             fill="none" 
             stroke="#292524" 
             strokeWidth="4" 
             strokeLinecap="round"
             className="animate-grow-branch origin-bottom"
             style={{ opacity: 0.7, filter: 'url(#ink-blur)' }}
           />
           {/* Branch Sub */}
           <path 
             d="M150,300 C180,280 200,290 230,280" 
             fill="none" 
             stroke="#292524" 
             strokeWidth="2" 
             strokeLinecap="round"
             className="animate-grow-branch delay-500"
             style={{ opacity: 0.6, filter: 'url(#ink-blur)', animationDelay: '1s' }}
           />
           {/* Petals */}
           <circle cx="250" cy="220" r="4" fill="#be123c" className="animate-fade-in-up delay-700 opacity-80" />
           <circle cx="260" cy="210" r="3" fill="#be123c" className="animate-fade-in-up delay-1000 opacity-60" />
           <circle cx="300" cy="80" r="5" fill="#9f1239" className="animate-fade-in-up delay-1000 opacity-90" />
        </svg>
      </div>

      {/* Floating Petals */}
      <div className="absolute top-10 right-10 w-4 h-4 rounded-full bg-rose-800/20 animate-float-petal" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-[20%] w-3 h-3 rounded-full bg-rose-900/10 animate-float-petal" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[60%] right-[10%] w-2 h-2 rounded-full bg-stone-800/10 animate-float-petal" style={{ animationDelay: '4s' }} />

      {/* Aurora Orbs - Fog/Mist Effect */}
      <div 
        className={`absolute top-[-15%] right-[-10%] w-[90vw] h-[90vw] rounded-full bg-stone-200/40 mix-blend-multiply filter blur-[100px] animate-aurora transition-all duration-1000 ${isThinking ? 'bg-stone-300/60 duration-500' : ''}`} 
        style={{ animationDuration: isThinking ? '10s' : '45s' }}
      />
      
      <div 
        className={`absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-[#E5E7EB]/40 mix-blend-multiply filter blur-[120px] animate-aurora transition-all duration-1000`}
        style={{ animationDelay: '2s', animationDuration: '60s' }}
      />
    </div>
  );
};