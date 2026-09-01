import React from 'react';
import { ShieldCheck, ArrowRight, ShieldAlert, Cpu, Lock, Fingerprint } from 'lucide-react';

interface CyberDefenseSummaryProps {
  onOpenDefense?: () => void;
}

export const CyberDefenseSummary: React.FC<CyberDefenseSummaryProps> = ({ onOpenDefense }) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
          CYBER DEFENSE SUMMARY
        </span>
      </div>

      {/* Main Content Split: Big Shield on Left + Stats on Right */}
      <div className="grid grid-cols-12 gap-3 my-2 items-center">
        {/* Big Shield Badge */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-24 flex items-center justify-center">
            {/* SVG Shield with glowing borders */}
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M 50 5 L 90 20 L 90 65 C 90 95, 50 115, 50 115 C 50 115, 10 95, 10 65 L 10 20 Z"
                fill="url(#shieldGrad)"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              />
            </svg>

            {/* Inner Shield Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-center">
              <span className="text-2xl font-black text-white leading-none">82</span>
              <span className="text-[9px] text-slate-300 font-medium leading-tight mt-0.5">
                Trust Score
              </span>
              <span className="text-[9px] text-emerald-400 font-bold leading-tight">
                Good
              </span>
            </div>
          </div>
        </div>

        {/* Defense Items List */}
        <div className="col-span-7 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" /> Identity Security
            </span>
            <span className="font-bold text-emerald-400 text-xs">Protected</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-blue-400" /> Attack Surface
            </span>
            <span className="font-bold text-emerald-400 text-xs">Low</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Active Threats
            </span>
            <span className="font-bold text-amber-400 text-xs font-mono">3</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3 text-cyan-400" /> Deception Hits
            </span>
            <span className="font-bold text-slate-200 text-xs font-mono">7</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" /> Sandbox Agents
            </span>
            <span className="font-bold text-cyan-400 text-xs font-mono">6 / 6</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-right border-t border-slate-800/80">
        <button
          onClick={onOpenDefense}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>Open Cyber Defense</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
