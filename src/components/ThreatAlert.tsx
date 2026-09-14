import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  MapPin,
  Clock,
  User,
  FileText,
  AlertOctagon,
  Info,
  Radio,
} from 'lucide-react';
import { useFIR } from '../context/FIRContext';
import type { AnalysisResult } from '../types/fir';
import { isCompromisedReport } from '../utils/reportFilters';

export interface ThreatAlertProps {
  className?: string;
  customCase?: AnalysisResult | null;
}

export const ThreatAlert: React.FC<ThreatAlertProps> = ({
  className = '',
  customCase,
}) => {
  const { cases, selectedCase: contextCase, selectCase } = useFIR();
  const activeCase: AnalysisResult | null = customCase !== undefined ? customCase : contextCase;

  // Strict threat queue: filter exclusively for fake/compromised cases
  const compromisedCases = useMemo<AnalysisResult[]>(() => {
    return cases.filter((c: AnalysisResult) => c.isCompromised === true || isCompromisedReport(c));
  }, [cases]);

  return (
    <div
      className={`p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-xl backdrop-blur-md space-y-6 ${className}`}
    >
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#111e38] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                Threat Alert: Deception Diagnostic Audit
              </h3>
              {activeCase?.isCompromised && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1 animate-pulse">
                  <Radio className="w-2.5 h-2.5 text-red-500" /> LIVE THREAT DETECTED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Granular telemetry audit, spatio-temporal kinematic checks & cross-jurisdictional proofs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Strict Compromised Threat Selector Dropdown */}
          <select
            value={activeCase?.id || ''}
            onChange={(e) => {
              if (e.target.value) {
                selectCase(e.target.value);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[220px] truncate shadow-sm"
          >
            {compromisedCases.length === 0 ? (
              <option value="" disabled className="bg-slate-900 text-slate-500">
                No Compromised Reports
              </option>
            ) : (
              <>
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Select Threat Case ({compromisedCases.length})
                </option>
                {compromisedCases.map((c: AnalysisResult) => (
                  <option key={c.id} value={c.id} className="bg-red-600 text-white font-bold py-1.5">
                    🚨 [{c.firNumber || c.id}] {c.suspectName} ({c.confidenceScore || 99}% Risk)
                  </option>
                ))}
              </>
            )}
          </select>

          {activeCase && (
            <span className="hidden sm:inline-block font-mono text-xs px-3 py-1 rounded-lg border bg-slate-900 border-slate-700/80 text-cyan-300 font-bold">
              {activeCase.firNumber || activeCase.id}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeCase ? (
          /* Empty State */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-12 text-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3 font-mono"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-500">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-300">No Profile Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a compromised profile from the Doppelgänger queue to view threat diagnostics.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Granular Diagnostics View */
          <motion.div
            key={activeCase.id}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6 font-mono text-xs"
          >
            {/* 1. Core Metadata Header Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#071129] via-[#050c1e] to-[#040a18] border border-cyan-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      FIR Identifier
                    </span>
                    <span className="text-sm font-black text-cyan-300">
                      {activeCase.firNumber || activeCase.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border tracking-wider flex items-center gap-1.5 ${
                      activeCase.isCompromised
                        ? 'bg-red-950/80 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    }`}
                  >
                    {activeCase.isCompromised ? (
                      <>
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        COMPROMISED ({activeCase.confidenceScore || 99}% RISK)
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        NOMINAL BASELINE
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Suspect & Officer Metadata Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-400" /> Suspect Name:
                  </span>
                  <span className="text-white font-bold text-xs truncate block">
                    {activeCase.suspectName}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" /> Reporting Officer:
                  </span>
                  <span className="text-white font-semibold text-xs truncate block">
                    {activeCase.reportingOfficer}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-0.5 sm:col-span-2 md:col-span-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-emerald-400" /> Complainant Entity:
                  </span>
                  <span className="text-white font-semibold text-xs truncate block">
                    {activeCase.complainantName || 'State Cyber Crime Unit'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Spatio-Temporal Comparison Grid (Contrast Valid vs Spoofed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incident Claim */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Registered Incident Location
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                    Filing Claim
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{activeCase.location}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" /> Time of Incident: {activeCase.timestamp}
                </div>
              </div>

              {/* Biometric Verification */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-rose-400" /> Physical Biometric Terminal
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      activeCase.isCompromised
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {activeCase.isCompromised ? 'Location Collision' : 'Verified'}
                  </span>
                </div>
                <div className={`text-sm font-bold ${activeCase.isCompromised ? 'text-red-300' : 'text-white'}`}>
                  {activeCase.biometricLocation}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" /> Biometric Scan Time:{' '}
                  {activeCase.biometricTimestamp || activeCase.timestamp}
                </div>
              </div>
            </div>

            {/* 3. Dedicated "Deception Analysis" Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Deception Analysis & Anomaly Proofs ({activeCase.flaggedParameters?.length || 0})
                </h4>
                {activeCase.isCompromised && (
                  <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                    Spatio-Temporal Contradiction Flagged
                  </span>
                )}
              </div>

              {activeCase.anomalySummary && (
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-slate-300 leading-relaxed text-xs">
                  <span className="font-bold text-red-400 block mb-1">Incident Anomaly Summary:</span>
                  {activeCase.anomalySummary}
                </div>
              )}

              {/* Warning Item Cards with distinct red left-border */}
              <div className="space-y-2.5">
                {activeCase.flaggedParameters && activeCase.flaggedParameters.length > 0 ? (
                  activeCase.flaggedParameters.map((paramStr: string, idx: number) => {
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#030917] border border-slate-800 border-l-4 border-l-red-500 shadow-md flex items-start gap-3 transition-colors hover:bg-slate-900/60"
                      >
                        <div className="w-6 h-6 rounded-md bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-black text-red-400 tracking-wider">
                              Flagged Discrepancy #{idx + 1}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40">
                              ANOMALY
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium leading-relaxed break-words">
                            {paramStr}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 border-l-4 border-l-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No deceptive parameters or spatio-temporal anomalies detected. Profile within operational baseline.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThreatAlert;
