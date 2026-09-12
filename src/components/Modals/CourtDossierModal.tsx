import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Layers,
  FileBadge
} from 'lucide-react';
import { useCaseContext } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { logOfficerAction } from '../../services/activityLogger';

interface CourtDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReports?: () => void;
}

export const CourtDossierModal: React.FC<CourtDossierModalProps> = ({
  isOpen,
  onClose,
  onNavigateToReports,
}) => {
  const { selectedCase, selectedCaseId, showToast } = useCaseContext();
  const { currentUser } = useAuth();

  const [isExporting, setIsExporting] = useState(false);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeFinancialFlow, setIncludeFinancialFlow] = useState(true);
  const [includeSection65bCert, setIncludeSection65bCert] = useState(true);
  const [includeKnowledgeGraph, setIncludeKnowledgeGraph] = useState(true);

  if (!isOpen) return null;

  const handleTriggerExport = () => {
    setIsExporting(true);
    logOfficerAction({
      action: `Generated Section 65B BSA Court Dossier: ${selectedCase?.fir_number || selectedCaseId}`,
      module: 'Dossier Engine',
      caseId: selectedCase?.fir_number || selectedCaseId,
      status: 'Success',
      category: 'REPORT',
      details: `${currentUser.name} generated 10-section charge-sheet package for ${selectedCase?.title}.`,
    });

    setTimeout(() => {
      setIsExporting(false);
      showToast(`Section 65B Court Dossier compiled and signed!`, 'success');
      if (onNavigateToReports) {
        onClose();
        onNavigateToReports();
      } else {
        window.print();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#061026] border border-emerald-500/50 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-[#031d16] to-[#040c1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wider uppercase font-mono">
                  SECTION 65B BSA 2023 COURT DOSSIER
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/40">
                  STATUTORY CHARGE-SHEET
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Bharatiya Sakshya Adhiniyam 2023 Electronic Evidence Certificate & 10-Section Dossier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {/* Active Case Target */}
          <div className="p-3.5 rounded-xl bg-[#031410] border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-emerald-400 uppercase font-mono">Target Case FIR</span>
              <div className="text-xs font-black text-white">{selectedCase?.fir_number} — {selectedCase?.title}</div>
              <div className="text-[10px] text-slate-400">
                Jurisdiction: <strong className="text-slate-200">{selectedCase?.jurisdiction_city || 'National'}</strong> • Certifying Officer: <strong className="text-emerald-300">{currentUser.name}</strong>
              </div>
            </div>
            <Scale className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>

          {/* 10-Section Legal Dossier Manifest Breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Compiled Statutory Dossier Sections (Included by Default)
            </span>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              {[
                '1. Executive Intelligence Summary',
                '2. Statutory Case & Court Jurisdiction',
                '3. Accused Persons & Complainants Table',
                '4. Syndicate Network Graph & Centrality',
                '5. Chronological Forensic Timeline',
                '6. Money Trail & Hawala Flows',
                '7. Digital Evidence Manifest & SHA-256',
                '8. Immutable Custody Transfer Logs',
                '9. Statutory Penal Laws (BNS, IT Act, PMLA)',
                '10. Section 65B BSA Admissibility Certificate',
              ].map((sec, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-[#030917] border border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{sec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="p-3 rounded-xl bg-[#030917] border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Export Preferences
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={includeSection65bCert} 
                  onChange={(e) => setIncludeSection65bCert(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Include Officer §65B Signature</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={includeKnowledgeGraph} 
                  onChange={(e) => setIncludeKnowledgeGraph(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Include Neo4j Visual Graph</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#040813] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {onNavigateToReports && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToReports();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <span>Open in Reports Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleTriggerExport}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isExporting ? 'Compiling Legal Dossier...' : 'Export Court PDF Package'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
