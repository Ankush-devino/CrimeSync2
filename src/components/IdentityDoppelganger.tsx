import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  Fingerprint,
  Sparkles,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useFIR } from '../context/FIRContext';
import type { AnalysisResult } from '../types/fir';
import { isCompromisedReport } from '../utils/reportFilters';

export interface IdentityDoppelgangerProps {
  className?: string;
  onCaseSelected?: (firCase: AnalysisResult) => void;
}

export const IdentityDoppelganger: React.FC<IdentityDoppelgangerProps> = ({
  className = '',
  onCaseSelected,
}) => {
  const { cases, selectedCase, selectCase, injectDeceptiveSample } = useFIR();

  // Dynamically filter only compromised profiles
  const compromisedCases = useMemo<AnalysisResult[]>(() => {
    return cases.filter((c: AnalysisResult) => c.isCompromised === true || isCompromisedReport(c));
  }, [cases]);

  const handleCardClick = (caseItem: AnalysisResult): void => {
    selectCase(caseItem.id);
    if (onCaseSelected) {
      onCaseSelected(caseItem);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-xl backdrop-blur-md space-y-5 ${className}`}
    >
      {/* Header & Live Simulation Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#111e38] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                Identity Doppelgänger: Compromised Profile Queue
              </h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-red-400" /> REAL-TIME MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Strictly filters and streams FIR filings flagged as compromised by the autonomous deception engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Strict Threat Queue Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400">Queue:</span>
            <select
              value={selectedCase?.id || ''}
              onChange={(e) => {
                if (e.target.value) {
                  const targetCase = compromisedCases.find((c: AnalysisResult) => c.id === e.target.value);
                  if (targetCase) {
                    handleCardClick(targetCase);
                  }
                }
              }}
              className="bg-slate-900 border border-red-500/40 text-red-300 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer max-w-[210px] truncate shadow-sm"
            >
              {compromisedCases.length === 0 ? (
                <option value="" disabled className="bg-slate-900 text-slate-500">
                  No Compromised Cases
                </option>
              ) : (
                <>
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    Select Threat Profile ({compromisedCases.length})
                  </option>
                  {compromisedCases.map((c: AnalysisResult) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 py-1">
                      [{c.firNumber || c.id}] {c.suspectName}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Compromised: <strong className="text-red-400">{compromisedCases.length} Detected</strong>
          </span>

          <button
            type="button"
            onClick={() => injectDeceptiveSample()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-xs font-bold shadow-[0_0_16px_rgba(239,68,68,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>Simulate Deceptive FIR Ingestion</span>
          </button>
        </div>
      </div>

      {/* Compromised Profiles List with Framer Motion Animations */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {compromisedCases.map((caseItem: AnalysisResult) => {
            const isSelected = selectedCase?.id === caseItem.id;
            return (
              <motion.div
                key={caseItem.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => handleCardClick(caseItem)}
                className={`p-4 rounded-xl transition-all cursor-pointer font-mono text-xs space-y-3 border ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-2 ring-red-500'
                    : 'bg-gradient-to-r from-red-950/20 via-slate-900/90 to-slate-900/95 border-red-500/30 hover:border-red-500/60 hover:bg-slate-900'
                }`}
              >
                {/* Card Top Row: FIR Identifiers & Pulsing Alert Badge */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-red-400" />
                      {caseItem.firNumber || caseItem.id}
                    </span>
                    <span className="font-bold text-white text-sm">
                      Suspect: {caseItem.suspectName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ID: {caseItem.id}
                    </span>
                  </div>

                  {/* Pulsing COMPROMISED Alert Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      COMPROMISED
                    </span>
                    {caseItem.confidenceScore && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/50">
                        {caseItem.confidenceScore}% RISK
                      </span>
                    )}
                  </div>
                </div>

                {/* Key FIR Identifiers: Location, Timestamp, Reporting Officer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white font-semibold truncate">{caseItem.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-white font-semibold truncate">{caseItem.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Officer:</span>
                    <span className="text-white font-semibold truncate">{caseItem.reportingOfficer}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {compromisedCases.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs font-mono">
            No compromised FIR profiles detected in active registry.
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityDoppelganger;
