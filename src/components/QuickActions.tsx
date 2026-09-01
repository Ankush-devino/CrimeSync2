import React from 'react';
import { 
  Plus, 
  Upload, 
  Cpu, 
  FileText, 
  Crosshair, 
  FileCheck, 
  Bot, 
  User,
  Sparkles
} from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (actionName: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
          QUICK ACTIONS
        </span>
      </div>

      {/* 6 Action Tiles Grid */}
      <div className="grid grid-cols-2 gap-2 my-2">
        <button
          onClick={() => onActionClick('New Investigation')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">New Investigation</span>
        </button>

        <button
          onClick={() => onActionClick('Upload Evidence')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
            <Upload className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">Upload Evidence</span>
        </button>

        <button
          onClick={() => onActionClick('Run AI Analysis')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">Run AI Analysis</span>
        </button>

        <button
          onClick={() => onActionClick('Generate Report')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">Generate Report</span>
        </button>

        <button
          onClick={() => onActionClick('Threat Hunting')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
            <Crosshair className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">Threat Hunting</span>
        </button>

        <button
          onClick={() => onActionClick('View Audit Trail')}
          className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 group text-left shadow-sm"
        >
          <div className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300 group-hover:scale-110 transition-transform">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">View Audit Trail</span>
        </button>
      </div>

      {/* AI Agents Online Status Box */}
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#0d2238] via-[#091829] to-[#070c18] border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-bold text-cyan-300">AI Agents Online: 12 / 12</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">100% HEALTH</span>
        </div>

        {/* 12 glowing Agent Avatars */}
        <div className="flex items-center justify-between px-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="relative group cursor-pointer"
              title={`Autonomous Agent #${i + 1}: Active`}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 group-hover:scale-125 transition-transform shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                <User className="w-3 h-3" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-[#060a14]"></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
