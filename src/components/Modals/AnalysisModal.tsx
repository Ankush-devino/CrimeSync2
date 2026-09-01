import React from 'react';
import { X, Brain, CheckCircle2, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1322] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0d172a] via-[#10203a] to-[#0d172a] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Full AI Syndicate Behavioral Report</h3>
              <p className="text-xs text-slate-400">Model: NeuroCrime-LLM v4.2 • Confidence: 92.4%</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
            <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Executive Summary
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Multi-source intelligence correlation confirms subject <strong>Aman Khan</strong> acts as the central hub bridging financial money-mule operations with ground field couriers in Delhi-NCR. Location overlaps at Lajpat Nagar match timestamps of encrypted burner calls.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Financial Layering</span>
              <p className="text-slate-200 font-semibold">₹1,84,00,000 tracked across 14 mule accounts</p>
              <p className="text-[11px] text-slate-400">92% converted to crypto on decentralized bridges.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Physical Geo Overlap</span>
              <p className="text-slate-200 font-semibold">2 Crime Scenes within 3.4km</p>
              <p className="text-[11px] text-slate-400">DL12AB1234 vehicle captured by Lajpat Nagar CCTV.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended Tactical Interventions</span>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Issue section 91 notice to freeze bank accounts AC045566 and AC987654.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Deploy live GPS beacon surveillance on vehicle DL12AB1234.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Activate cyber honeypot decoys across the suspect's known darknet relays.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
