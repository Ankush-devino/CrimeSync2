import React from 'react';
import { ShieldCheck, ArrowRight, Layers, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { getActiveCaseIntelligence } from '../data/activeCaseNetworks';

interface EvidenceIntegrityProps {
  onNavigateTab?: (tab: string) => void;
  onOpenVault?: () => void;
}

export const EvidenceIntegrity: React.FC<EvidenceIntegrityProps> = ({ onNavigateTab, onOpenVault }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();

  const caseIntel = React.useMemo(() => {
    return getActiveCaseIntelligence(selectedCase || { id: selectedCaseId });
  }, [selectedCase, selectedCaseId]);

  const handleClick = () => {
    if (onNavigateTab) {
      onNavigateTab('evidence-dna');
    } else if (onOpenVault) {
      onOpenVault();
    }
  };

  const { evidenceSummary } = caseIntel;

  return (
    <div 
      onClick={handleClick}
      className="p-4 rounded-2xl bg-gradient-to-b from-[#051c19]/95 via-[#020e0d]/95 to-[#010606]/95 border border-emerald-500/30 hover:border-emerald-400/70 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer transition-all duration-250"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-emerald-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                BLOCKCHAIN EVIDENCE INTEGRITY
              </span>
              <span className="text-[9px] text-slate-400 block">Section 65B BSA 2023 Merkle Ledger</span>
            </div>
          </div>

          <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
            {evidenceSummary.section65bStatus}
          </span>
        </div>
      </div>

      {/* Main Content: 100% Circular Gauge + Clean Breakdown */}
      <div className="grid grid-cols-12 gap-3 my-2 items-center">
        {/* Circular Progress Gauge */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="28" stroke="#1e293b" strokeWidth="5" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="28"
                stroke="#10b981"
                strokeWidth="5"
                fill="none"
                strokeDasharray="175.9"
                strokeDashoffset="0"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-white font-mono leading-none">100%</span>
              <span className="text-[8px] text-emerald-400 font-bold leading-tight mt-0.5 uppercase">
                Sealed
              </span>
            </div>
          </div>
        </div>

        {/* Clean Ledger Breakdown (No raw hashes) */}
        <div className="col-span-7 space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-1 rounded bg-[#031411]/80 border border-emerald-950">
            <span className="text-slate-400 text-[10.5px]">Total Case Evidence:</span>
            <span className="font-mono font-black text-white text-[11px]">{evidenceSummary.total} Files</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#031411]/80 border border-emerald-950">
            <span className="text-emerald-400 text-[10.5px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified (Ledger):
            </span>
            <span className="font-mono font-black text-emerald-400 text-[11px]">{evidenceSummary.verified}</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#031411]/80 border border-emerald-950">
            <span className="text-red-400 text-[10.5px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-400" /> Tampered Files:
            </span>
            <span className="font-mono font-black text-slate-400 text-[11px]">{evidenceSummary.tampered}</span>
          </div>

          <div className="flex items-center justify-between p-1 rounded bg-[#031411]/80 border border-emerald-950">
            <span className="text-amber-400 text-[10.5px]">Pending Verification:</span>
            <span className="font-mono font-black text-slate-400 text-[11px]">{evidenceSummary.pending}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-mono">
          Court-Admissible BSA Electronic Seal
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
          <span>Evidence DNA</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
