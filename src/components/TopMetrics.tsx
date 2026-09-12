import React from 'react';
import { 
  FolderKanban, 
  Users, 
  AlertOctagon, 
  ShieldCheck, 
  Network,
  TrendingUp
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';

interface TopMetricsProps {
  onNavigateTab?: (tab: string) => void;
  onSelectMetric?: (metricId: string) => void;
}

export const TopMetrics: React.FC<TopMetricsProps> = ({ onNavigateTab, onSelectMetric }) => {
  const { cases } = useCaseContext();

  const handleCardClick = (tab: string, metricId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onSelectMetric) {
      onSelectMetric(metricId);
    }
  };

  const activeCasesCount = cases.length || 10;
  const highRiskCount = 91;
  const criticalAlertsCount = 12;
  const verifiedEvidenceCount = 1246;
  const connectedEntitiesCount = 12843;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      
      {/* 1. ACTIVE CASES */}
      <div 
        onClick={() => handleCardClick('investigations', 'active_cases')}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#081530]/95 to-[#040c1d]/95 border border-blue-500/30 hover:border-blue-400/80 transition-all duration-250 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <FolderKanban className="w-5 h-5 text-cyan-300" />
          </div>
          
          {/* Subtle Sparkline SVG */}
          <div className="flex flex-col items-end">
            <svg className="w-16 h-5 stroke-cyan-400 fill-none opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 60 20">
              <path d="M0 16 Q 15 4, 30 12 T 60 4" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-cyan-300 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              <span>+12% wk</span>
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-0.5">
            ACTIVE CASES
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-tight leading-none group-hover:text-cyan-200 transition-colors">
            {activeCasesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>PostgreSQL Registry</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">9 Priority FIRs</span>
          </div>
        </div>
      </div>

      {/* 2. HIGH RISK SUSPECTS */}
      <div 
        onClick={() => handleCardClick('investigations', 'high_risk_suspects')}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#180a24]/95 to-[#0c0514]/95 border border-purple-500/30 hover:border-purple-400/80 transition-all duration-250 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Users className="w-5 h-5 text-purple-300" />
          </div>

          {/* Subtle Sparkline SVG */}
          <div className="flex flex-col items-end">
            <svg className="w-16 h-5 stroke-purple-400 fill-none opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 60 20">
              <path d="M0 14 Q 20 18, 35 6 T 60 2" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-purple-300 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5 text-rose-400" />
              <span>+8 flagged</span>
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-0.5">
            HIGH RISK SUSPECTS
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-tight leading-none group-hover:text-purple-200 transition-colors">
            {highRiskCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Identity Centrality</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-medium">4 Critical Tier-1</span>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL ALERTS */}
      <div 
        onClick={() => handleCardClick('threat-alerts', 'critical_alerts')}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#22070e]/95 to-[#120307]/95 border border-red-500/30 hover:border-red-400/80 transition-all duration-250 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(239,68,68,0.35)] group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/20 transition-all" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
          </div>

          {/* Subtle Sparkline SVG */}
          <div className="flex flex-col items-end">
            <svg className="w-16 h-5 stroke-red-400 fill-none opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 60 20">
              <path d="M0 12 L 15 16 L 30 6 L 45 14 L 60 4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-red-300 mt-0.5">
              3 Active Breaches
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-0.5">
            CRITICAL ALERTS
          </span>
          <div className="text-2xl font-black text-red-400 font-mono tracking-tight leading-none group-hover:text-red-300 transition-colors">
            {criticalAlertsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>SOC Event Stream</span>
            <span className="text-slate-600">•</span>
            <span className="text-red-400 font-medium">2 Active Breach Flags</span>
          </div>
        </div>
      </div>

      {/* 4. VERIFIED EVIDENCE FILES */}
      <div 
        onClick={() => handleCardClick('evidence-dna', 'evidence_files')}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#051c19]/95 to-[#020e0d]/95 border border-emerald-500/30 hover:border-emerald-400/80 transition-all duration-250 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>

          {/* Subtle Sparkline SVG */}
          <div className="flex flex-col items-end">
            <svg className="w-16 h-5 stroke-emerald-400 fill-none opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 60 20">
              <path d="M0 16 Q 20 12, 40 8 T 60 2" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-emerald-300 mt-0.5">
              100% Sealed
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-0.5">
            VERIFIED EVIDENCE
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-tight leading-none group-hover:text-emerald-200 transition-colors">
            {verifiedEvidenceCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>BSA 2023 §65B</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">Merkle Root Sealed</span>
          </div>
        </div>
      </div>

      {/* 5. CONNECTED ENTITIES */}
      <div 
        onClick={() => handleCardClick('knowledge-graph', 'connected_entities')}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#06182c]/95 to-[#030c17]/95 border border-cyan-500/30 hover:border-cyan-400/80 transition-all duration-250 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Network className="w-5 h-5 text-cyan-300" />
          </div>

          {/* Subtle Sparkline SVG */}
          <div className="flex flex-col items-end">
            <svg className="w-16 h-5 stroke-cyan-400 fill-none opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 60 20">
              <path d="M0 14 Q 15 2, 35 12 T 60 4" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-cyan-300 mt-0.5">
              Network Graph
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-0.5">
            CONNECTED ENTITIES
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-tight leading-none group-hover:text-cyan-200 transition-colors">
            {connectedEntitiesCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Graph Intelligence Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-medium">Across 9 Syndicates</span>
          </div>
        </div>
      </div>

    </div>
  );
};
