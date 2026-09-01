import React from 'react';
import { ArrowRight, Star, Radio } from 'lucide-react';
import { tickerNews } from '../data/mockData';

interface IntelligenceTickerProps {
  onViewAll?: () => void;
}

export const IntelligenceTicker: React.FC<IntelligenceTickerProps> = ({ onViewAll }) => {
  return (
    <div className="h-10 bg-[#060a14] border-t border-slate-800/90 px-4 flex items-center justify-between text-xs sticky bottom-0 z-30 select-none backdrop-blur-md">
      {/* Left Badge */}
      <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-slate-800">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-extrabold text-[11px] text-cyan-400 tracking-wider flex items-center gap-1">
          INTELLIGENCE FEED <span className="text-[9px]">▶</span>
        </span>
      </div>

      {/* Marquee / Scrolling Ticker */}
      <div className="flex-1 overflow-hidden mx-4 relative">
        <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
          {/* Loop twice for seamless scrolling */}
          {[...tickerNews, ...tickerNews].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {item.starred ? (
                <span className="text-amber-400 font-bold">★</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              )}
              <span className="text-slate-200 font-medium hover:text-white cursor-pointer transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({item.time})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Link */}
      <div className="flex-shrink-0 pl-4 border-l border-slate-800">
        <button
          onClick={onViewAll}
          className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium group"
        >
          <span>View All Intelligence</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
