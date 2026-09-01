import React from 'react';
import { X, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import type { NetworkNode } from '../../types/dashboard';

interface SuspectModalProps {
  node: NetworkNode | null;
  onClose: () => void;
}

export const SuspectModal: React.FC<SuspectModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1322] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 via-[#0d172a] to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">{node.label}</h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    node.risk === 'HIGH'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {node.risk} RISK (Score: {node.riskScore || 85})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Entity ID: <span className="font-mono text-cyan-400">{node.id.toUpperCase()}</span> • Category: {node.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Profile Summary */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#070c18] p-4 rounded-xl border border-slate-800">
            {node.avatar ? (
              <img
                src={node.avatar}
                alt={node.label}
                className="w-20 h-20 rounded-xl object-cover border-2 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-2xl font-bold font-mono">
                {node.label.charAt(0)}
              </div>
            )}

            <div className="flex-1 space-y-1 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Assigned Case</span>
                <span className="font-semibold text-white">FIR #2026/DEL/CYB-992</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Investigation Status</span>
                <span className="font-semibold text-amber-400">Active Surveillance / Interception</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Primary Location</span>
                <span className="font-semibold text-slate-200">{node.details?.location || 'NCR / Delhi Central'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Identified Phone / IMEI</span>
                <span className="font-semibold text-cyan-400 font-mono">{node.details?.phone || '+91 98112-44219'}</span>
              </div>
            </div>
          </div>

          {/* AI Threat Assessment Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> AI Behavioral & Network Analysis
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-[#070c18] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Centrality Index</span>
                <span className="text-sm font-bold text-red-400 font-mono">0.78 (Critical)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#070c18] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Direct Affiliates</span>
                <span className="text-sm font-bold text-white font-mono">9 Entities</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#070c18] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Blockchain DNA Hash</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">0x9F82...A1C3</span>
              </div>
            </div>
          </div>

          {/* Intelligence Notes */}
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs space-y-1">
            <span className="font-bold text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Intelligence Directive:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Subject identified as the key operative connecting mule accounts to ground logistics in Lajpat Nagar. Maintain active passive monitoring and capture all packet transfers.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Exported full intelligence dossier for ${node.label}`);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            Download Certified Dossier (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
