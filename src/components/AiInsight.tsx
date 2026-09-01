import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';

interface AiInsightProps {
  onViewAnalysis?: () => void;
}

export const AiInsight: React.FC<AiInsightProps> = ({ onViewAnalysis }) => {
  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full relative overflow-hidden shadow-xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
          <div className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              AI INVESTIGATION INSIGHT
            </span>
          </div>

          <button
            onClick={onViewAnalysis}
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 group font-medium"
          >
            <span>View Full Analysis</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Content & Brain Hologram */}
        <div className="flex items-center justify-between gap-3 my-2.5">
          <div className="flex-1">
            <p className="text-[11px] text-slate-200 leading-relaxed mb-2 font-normal">
              Aman Khan is the central node connecting multiple high risk entities across communication, financial transactions and locations.
            </p>

            <ul className="space-y-1 text-[10.5px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Frequent communication with Vikram J. and Riya Singh.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>28 calls with Rahul Sharma in last 7 days.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Large cash transactions across 2 accounts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Vehicle DL12AB1234 seen in multiple crime scenes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>High centrality score (0.78) in the network.</span>
              </li>
            </ul>
          </div>

          {/* Glowing Neural Brain Vector */}
          <div className="w-28 h-28 flex-shrink-0 relative flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
              {/* Outer faint orbits */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1d4ed8" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
              <circle cx="60" cy="60" r="35" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
              
              {/* Neural Synaptic Mesh Lines */}
              <g stroke="#3b82f6" strokeWidth="0.8" opacity="0.85">
                {/* Left hemisphere */}
                <line x1="38" y1="42" x2="52" y2="30" />
                <line x1="38" y1="42" x2="30" y2="60" />
                <line x1="30" y1="60" x2="42" y2="78" />
                <line x1="42" y1="78" x2="58" y2="88" />
                <line x1="52" y1="30" x2="60" y2="22" />
                <line x1="38" y1="42" x2="50" y2="54" />
                <line x1="30" y1="60" x2="50" y2="54" />
                <line x1="42" y1="78" x2="50" y2="54" />
                <line x1="50" y1="54" x2="58" y2="72" />
                <line x1="58" y1="72" x2="58" y2="88" />

                {/* Right hemisphere */}
                <line x1="60" y1="22" x2="68" y2="30" />
                <line x1="68" y1="30" x2="82" y2="42" />
                <line x1="82" y1="42" x2="90" y2="60" />
                <line x1="90" y1="60" x2="78" y2="78" />
                <line x1="78" y1="78" x2="62" y2="88" />
                <line x1="82" y1="42" x2="70" y2="54" />
                <line x1="90" y1="60" x2="70" y2="54" />
                <line x1="78" y1="78" x2="70" y2="54" />
                <line x1="70" y1="54" x2="62" y2="72" />

                {/* Center bridge */}
                <line x1="50" y1="54" x2="70" y2="54" />
                <line x1="52" y1="30" x2="68" y2="30" />
                <line x1="58" y1="72" x2="62" y2="72" />
                <line x1="38" y1="42" x2="60" y2="22" />
                <line x1="82" y1="42" x2="60" y2="22" />
              </g>

              {/* Glowing Synaptic Nodes */}
              <circle cx="60" cy="22" r="3" fill="#60a5fa" className="animate-pulse" />
              <circle cx="52" cy="30" r="2.5" fill="#93c5fd" />
              <circle cx="68" cy="30" r="2.5" fill="#93c5fd" />
              <circle cx="38" cy="42" r="3" fill="#3b82f6" />
              <circle cx="82" cy="42" r="3" fill="#3b82f6" />
              <circle cx="30" cy="60" r="2.5" fill="#60a5fa" />
              <circle cx="90" cy="60" r="2.5" fill="#60a5fa" />
              <circle cx="50" cy="54" r="3.5" fill="#93c5fd" />
              <circle cx="70" cy="54" r="3.5" fill="#93c5fd" />
              <circle cx="42" cy="78" r="2.5" fill="#3b82f6" />
              <circle cx="78" cy="78" r="2.5" fill="#3b82f6" />
              <circle cx="58" cy="72" r="2.5" fill="#60a5fa" />
              <circle cx="62" cy="72" r="2.5" fill="#60a5fa" />
              <circle cx="58" cy="88" r="2.5" fill="#93c5fd" />
              <circle cx="62" cy="88" r="2.5" fill="#93c5fd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#111e33]/80">
        <span className="text-xs font-bold text-emerald-400">
          Confidence Score: 92%
        </span>
      </div>
    </div>
  );
};
