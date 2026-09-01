import React from 'react';
import { CheckCircle2, ArrowRight, Dna, Lock, FileCheck } from 'lucide-react';

interface EvidenceIntegrityProps {
  onOpenVault?: () => void;
}

export const EvidenceIntegrity: React.FC<EvidenceIntegrityProps> = ({ onOpenVault }) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
            EVIDENCE INTEGRITY
          </span>
          <span className="text-[10px] text-slate-400 ml-1 font-normal">(Blockchain Verified)</span>
        </div>
      </div>

      {/* Main Content: 100% Circle Gauge + Stats */}
      <div className="grid grid-cols-12 gap-3 my-2 items-center">
        {/* Circular Progress Gauge */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#10b981"
                strokeWidth="6"
                fill="none"
                strokeDasharray="201"
                strokeDashoffset="0"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-white leading-none">100%</span>
              <span className="text-[9px] text-emerald-400 font-bold leading-tight mt-0.5">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="col-span-7 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Total Evidence Files</span>
            <span className="font-bold text-slate-200 text-xs font-mono">1,246</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Verified on Blockchain</span>
            <span className="font-bold text-emerald-400 text-xs font-mono">1,246</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Tampered Files</span>
            <span className="font-bold text-slate-200 text-xs font-mono">0</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Verification Pending</span>
            <span className="font-bold text-slate-200 text-xs font-mono">0</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-right border-t border-slate-800/80">
        <button
          onClick={onOpenVault}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>Open Evidence Vault</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
