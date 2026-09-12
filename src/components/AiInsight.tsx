import React from 'react';
import { Brain, ArrowRight, Sparkles, ShieldAlert, Cpu, Fingerprint, Radio, FileText, CheckCircle2 } from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { getActiveCaseIntelligence } from '../data/activeCaseNetworks';

interface AiInsightProps {
  onViewAnalysis?: () => void;
}

export const AiInsight: React.FC<AiInsightProps> = ({ onViewAnalysis }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();

  const caseIntel = React.useMemo(() => {
    return getActiveCaseIntelligence(selectedCase || { id: selectedCaseId });
  }, [selectedCase, selectedCaseId]);

  const { aiInsight } = caseIntel;

  const renderEvidenceIcon = (type: string) => {
    switch (type) {
      case 'biometric':
      case 'cctv':
        return <Fingerprint className="w-3.5 h-3.5 text-purple-400" />;
      case 'crypto':
      case 'financial':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'telecom':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'cyber':
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#140a28]/95 via-[#0c0519]/95 to-[#06020c]/95 border border-purple-500/40 shadow-[0_12px_40px_rgba(168,85,247,0.15)] flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background Neural Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/30 transition-all" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Brain className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                  AI ASSISTANT INSIGHTS
                </span>
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-purple-300/80 font-sans">
                Neural Deduction Engine • DeepSeek-R1 / Gemini 1.5 Pro
              </span>
            </div>
          </div>

          {/* Confidence Score Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-black text-purple-200">
              {aiInsight.confidenceScore}% CONFIDENCE
            </span>
          </div>
        </div>

        {/* Primary Suspect & Syndicate Badge */}
        <div className="my-3 p-2.5 rounded-xl bg-[#1b0d36]/70 border border-purple-500/30 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-purple-300 uppercase tracking-wider block">
              Primary Identified Suspect
            </span>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{aiInsight.suspectName}</span>
              <span className="text-[9px] font-mono text-purple-300 bg-purple-900/60 px-1.5 py-0.2 rounded border border-purple-500/40">
                {aiInsight.syndicateName}
              </span>
            </div>
          </div>
        </div>

        {/* AI Deduction Paragraph */}
        <p className="text-[11px] text-slate-200 leading-relaxed mb-3 font-sans bg-[#0d051c]/60 p-2.5 rounded-xl border border-purple-900/40">
          {aiInsight.explanation}
        </p>

        {/* Bulleted Forensic Evidence Summary */}
        <div className="space-y-1.5 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Corroborated Forensic Evidence
          </span>
          {aiInsight.evidenceSummary.map((ev) => (
            <div
              key={ev.id}
              className="p-2 rounded-lg bg-[#0e061e] border border-purple-900/50 flex items-start gap-2 text-xs hover:border-purple-500/50 transition-colors"
            >
              <div className="p-1 rounded bg-purple-950/80 border border-purple-500/30 flex-shrink-0 mt-0.5">
                {renderEvidenceIcon(ev.iconType)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-purple-200 leading-tight">
                  {ev.title}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {ev.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action: Open Full Analysis Button */}
      <div className="pt-3 border-t border-purple-900/60 mt-1">
        <button
          onClick={onViewAnalysis}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 group"
        >
          <span>Open Full Analysis (AI Assistant)</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
