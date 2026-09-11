import React from 'react';
import { ShieldCheck, ArrowRight, ShieldAlert, Cpu, Lock, Fingerprint, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CyberDefenseSummaryProps {
  onNavigateTab?: (tab: string) => void;
  onOpenDefense?: () => void;
}

export const CyberDefenseSummary: React.FC<CyberDefenseSummaryProps> = ({ onNavigateTab, onOpenDefense }) => {
  const { trustScore, isAdaptiveRestricted } = useAuth();

  const handleClick = () => {
    if (onNavigateTab) {
      onNavigateTab('identity-security');
    } else if (onOpenDefense) {
      onOpenDefense();
    }
  };

  const isCritical = isAdaptiveRestricted || trustScore < 50;
  const isWarning = trustScore >= 50 && trustScore < 80;

  // Circular gauge calculation (circumference = 2 * PI * r = 2 * 3.14159 * 28 = ~175.9)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  return (
    <div 
      onClick={handleClick}
      className="p-4 rounded-2xl bg-gradient-to-b from-[#09152b]/95 via-[#040c1a]/95 to-[#020610]/95 border border-blue-500/30 hover:border-blue-400/70 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer transition-all duration-250"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                CYBER DEFENSE SUMMARY
              </span>
              <span className="text-[9px] text-slate-400 block">Identity Doppelgänger & Zero-Trust</span>
            </div>
          </div>

          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            isCritical 
              ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
              : isWarning
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
          }`}>
            {isCritical ? 'LOCKED' : isWarning ? 'RESTRICTED' : 'SECURE'}
          </span>
        </div>
      </div>

      {/* Main Content: Radial Trust Score Gauge on Left + 4 Key Defense Metrics on Right */}
      <div className="grid grid-cols-12 gap-3 my-2 items-center">
        {/* Radial Trust Score Gauge */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              {/* Background Track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#1e293b"
                strokeWidth="5"
                fill="none"
              />
              {/* Animated Glowing Progress Ring */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00f0ff'}
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]"
              />
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-base font-black font-mono leading-none ${isCritical ? 'text-red-400' : 'text-white'}`}>
                {trustScore}%
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono mt-0.5 uppercase">
                Trust
              </span>
            </div>
          </div>
        </div>

        {/* 4 Required Defense Metrics */}
        <div className="col-span-7 space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-1 rounded bg-[#061226]/80 border border-slate-800/80">
            <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400" /> Protected Sessions
            </span>
            <span className="font-mono font-bold text-cyan-300 text-[11px]">8 Active</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#061226]/80 border border-slate-800/80">
            <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-red-400" /> Threats Contained
            </span>
            <span className="font-mono font-bold text-emerald-400 text-[11px]">4 Isolated</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#061226]/80 border border-slate-800/80">
            <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3 text-amber-400" /> Honey Triggers
            </span>
            <span className="font-mono font-bold text-amber-400 text-[11px]">7 Tripped</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#061226]/80 border border-slate-800/80">
            <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" /> AI Agents Secure
            </span>
            <span className="font-mono font-bold text-purple-300 text-[11px]">6 / 6 (gVisor)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-mono">
          Adaptive Permission Engine
        </span>
        <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
          <span>Open Doppelgänger</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
