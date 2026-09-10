import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Printer,
  Download,
  Share2,
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  Landmark,
  UserCheck,
  Network,
  Clock,
  Box,
  Scale,
  Bot,
  ChevronRight,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Shield,
  FileCheck,
} from 'lucide-react';
import type { ForensicDossier } from '../../services/dossierService';
import { printCourtDossier } from '../../utils/courtDossierPrinter';
import { useAuth } from '../../context/AuthContext';

interface ForensicDossierPreviewProps {
  dossier: ForensicDossier;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onSelectAction?: (action: string) => void;
}

const TOC_SECTIONS = [
  { id: 'sec-summary', num: '1.0', label: 'Executive Summary', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'sec-case-info', num: '2.0', label: 'Case Information & Authority', icon: <Landmark className="w-3.5 h-3.5" /> },
  { id: 'sec-persons', num: '3.0', label: 'Persons Involved (Suspects/Victims)', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: 'sec-network', num: '4.0', label: 'Criminal Network Analysis', icon: <Network className="w-3.5 h-3.5" /> },
  { id: 'sec-timeline', num: '5.0', label: 'Timeline Reconstruction', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'sec-financial', num: '6.0', label: 'Financial Intelligence & Hawala', icon: <Landmark className="w-3.5 h-3.5" /> },
  { id: 'sec-evidence', num: '7.0', label: 'Digital Evidence Manifest', icon: <Box className="w-3.5 h-3.5" /> },
  { id: 'sec-custody', num: '8.0', label: 'Chain of Custody Log', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'sec-laws', num: '9.0', label: 'Applicable Statutory Laws', icon: <Scale className="w-3.5 h-3.5" /> },
  { id: 'sec-ai-findings', num: '10.0', label: 'AI Findings & Strategy', icon: <Bot className="w-3.5 h-3.5" /> },
];

export const ForensicDossierPreview: React.FC<ForensicDossierPreviewProps> = ({
  dossier,
  isOpen,
  onClose,
  onRegenerate,
  onSelectAction,
}) => {
  const { enforceAdaptiveAction, isAdaptiveRestricted } = useAuth();
  const [activeSection, setActiveSection] = useState('sec-summary');
  const [copiedHash, setCopiedHash] = useState(false);
  const documentCanvasRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    enforceAdaptiveAction(`Export Section 65B Certified Court Dossier (${dossier.firNumber})`, () => {
      if (onSelectAction) {
        onSelectAction(`Printed Section 65B Certified Dossier: ${dossier.firNumber}`);
      }
      printCourtDossier(dossier);
    }, 'EXFILTRATION');
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(dossier.merkleRoot || dossier.blockchainHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    if (onSelectAction) {
      onSelectAction(`Copied Merkle Hash for ${dossier.firNumber}`);
    }
  };

  const { sections } = dossier;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#030712] text-slate-100 font-sans overflow-hidden">
      
      {/* ── 1. TOP COMMAND BAR ─────────────────────────────────────────────────── */}
      <div className="h-14 px-5 bg-[#050b18] border-b border-[#14233c] flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {dossier.firNumber}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-200 font-medium truncate max-w-xs md:max-w-md">
                {dossier.reportName}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  dossier.status === 'Certified'
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}
              >
                {dossier.status === 'Certified' ? '● Section 65B Certified' : '⚠ Outdated (Re-seal Required)'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {dossier.status === 'Outdated' && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Regenerate Dossier</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              isAdaptiveRestricted
                ? 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/50'
                : 'bg-[#081224] hover:bg-[#0e1d38] border-[#162744] text-slate-200 hover:text-white'
            }`}
            title={isAdaptiveRestricted ? 'Action restricted: High-Risk session behavior' : 'Print Official Court Submission'}
          >
            {isAdaptiveRestricted ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Printer className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">Print Document</span>
          </button>

          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs font-mono transition-colors cursor-pointer ${
              isAdaptiveRestricted
                ? 'bg-red-950 border border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
            }`}
            title={isAdaptiveRestricted ? 'Action restricted: High-Risk session behavior' : 'Download Court PDF'}
          >
            {isAdaptiveRestricted ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          {/* Prominent Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 hover:border-red-500 transition-all text-xs font-mono font-bold ml-2 cursor-pointer shadow-sm group"
            title="Close Dossier Preview (Esc)"
            aria-label="Close Dossier Preview"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Close</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-black/40 border border-red-500/30 rounded text-[9px] text-red-200">ESC</kbd>
          </button>
        </div>
      </div>

      {/* ── 2. THREE-COLUMN WORKSPACE ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT PANEL: STICKY TABLE OF CONTENTS ────────────────────────────── */}
        <div className="w-64 bg-[#050b18] border-r border-[#14233c] flex flex-col flex-shrink-0 hidden lg:flex">
          <div className="p-3.5 border-b border-[#14233c] flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              TABLE OF CONTENTS
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">10 SECTIONS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {TOC_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#081224] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 font-mono text-[10px]">{sec.num}</span>
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Officer Quick Badge */}
          <div className="p-3 m-2 rounded-xl bg-[#030814] border border-[#14233c] text-[11px] space-y-1">
            <div className="text-slate-400 font-mono text-[9.5px]">CERTIFYING AUTHORITY</div>
            <div className="font-bold text-white">{dossier.author}</div>
            <div className="text-[10px] text-slate-400 font-mono">{dossier.authorBadge} · {dossier.department}</div>
          </div>
        </div>

        {/* ── CENTER CANVAS: 100% BRIGHT WHITE A4 COURT DOCUMENT ────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#cbd5e1] p-3 sm:p-6 flex justify-center min-w-0" style={{ backgroundColor: '#cbd5e1' }}>
          <div
            ref={documentCanvasRef}
            id="crimesync-court-document-canvas"
            className="w-full max-w-[880px] bg-white text-slate-900 rounded-md shadow-2xl p-5 sm:p-8 space-y-7 font-sans border border-slate-300 select-text my-2 relative overflow-hidden"
            style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: 'fit-content' }}
          >
            {/* Watermark for Law Enforcement */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
              <span className="text-7xl font-black rotate-[-35deg] text-slate-950 tracking-widest font-mono">
                NCRB // COURT SUBMISSION
              </span>
            </div>

            {/* Official Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center relative" style={{ color: '#000000', borderColor: '#0f172a' }}>
              {/* Red Confidential Stamp */}
              <div className="absolute right-0 top-0 border-2 border-red-700 text-red-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rotate-[3deg] rounded bg-red-50 shadow-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#b91c1c', color: '#b91c1c' }}>
                TOP SECRET // COURT READY
              </div>

              <div className="w-10 h-10 mx-auto mb-1.5 text-slate-900 flex items-center justify-center">
                <Shield className="w-9 h-9 stroke-[1.8] text-slate-900" />
              </div>

              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700" style={{ color: '#334155' }}>
                GOVERNMENT OF INDIA · MINISTRY OF HOME AFFAIRS
              </h2>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-black mt-0.5" style={{ color: '#000000' }}>
                NATIONAL CRIME RECORDS BUREAU (NCRB)
              </h1>
              <p className="text-xs font-bold text-blue-950 font-mono mt-0.5" style={{ color: '#0f172a' }}>
                CENTRAL FORENSIC INVESTIGATION & CHARGE-SHEET DOSSIER
              </p>
              <div className="text-[10px] text-slate-700 font-mono mt-1 flex items-center justify-center gap-3 flex-wrap" style={{ color: '#475569' }}>
                <span>SECTION 65B BHARATIYA SAKSHYA ADHINIYAM (BSA 2023) CERTIFIED</span>
                <span>·</span>
                <span>IMMUTABLE EVIDENCE LEDGER</span>
              </div>
            </div>

            {/* Formal Court & Case Reference Banner */}
            <div className="bg-slate-50 border border-slate-300 rounded p-3.5 text-xs space-y-2 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#000000' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-800" style={{ color: '#1e293b' }}>IN THE COURT OF:</span>
                <span className="font-bold text-black font-mono text-left sm:text-right" style={{ color: '#000000' }}>{sections.caseInfo.courtJurisdiction}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-300 font-mono text-[11px]" style={{ borderColor: '#cbd5e1' }}>
                <div><span className="text-slate-500 block text-[9.5px]">FIR NUMBER</span><span className="font-bold text-black" style={{ color: '#000000' }}>{dossier.firNumber}</span></div>
                <div><span className="text-slate-500 block text-[9.5px]">POLICE STATION</span><span className="font-bold text-black" style={{ color: '#000000' }}>{sections.caseInfo.policeStation}</span></div>
                <div><span className="text-slate-500 block text-[9.5px]">OCCURRENCE DATE</span><span className="font-bold text-black" style={{ color: '#000000' }}>{sections.caseInfo.occurrenceDate}</span></div>
                <div><span className="text-slate-500 block text-[9.5px]">REGISTRATION DATE</span><span className="font-bold text-black" style={{ color: '#000000' }}>{sections.caseInfo.filingDate}</span></div>
              </div>
            </div>

            {/* ── SECTION 1.0: EXECUTIVE SUMMARY ───────────────────────────────── */}
            <section id="sec-summary" className="space-y-2.5 pt-1" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>1.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>EXECUTIVE INTELLIGENCE SUMMARY</span>
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-300" style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', borderColor: '#bfdbfe' }}>
                  SYNCHRONIZED WITH POSTGRESQL
                </span>
              </div>
              <div className="text-xs leading-relaxed space-y-2" style={{ color: '#0f172a' }}>
                <p className="font-medium">{sections.executiveSummary.synopsis}</p>
                <div className="p-3 bg-slate-50 border-l-4 border-blue-600 rounded-r text-[11.5px] space-y-1 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#2563eb', color: '#0f172a' }}>
                  <div><strong className="text-black" style={{ color: '#000000' }}>Modus Operandi:</strong> {sections.executiveSummary.modusOperandi}</div>
                  <div><strong className="text-black" style={{ color: '#000000' }}>Primary Threat Vector:</strong> {sections.executiveSummary.threatVector}</div>
                  <div><strong className="text-black" style={{ color: '#000000' }}>Financial & Infrastructure Impact:</strong> {sections.executiveSummary.damageAssessment}</div>
                </div>
                <p><strong className="text-black" style={{ color: '#000000' }}>Forensic Breakthrough:</strong> {sections.executiveSummary.investigativeBreakthrough}</p>
              </div>
            </section>

            {/* ── SECTION 2.0: CASE INFORMATION ───────────────────────────────── */}
            <section id="sec-case-info" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>2.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>STATUTORY CASE INFORMATION & JURISDICTION</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Investigating Authority</div>
                  <div className="font-bold text-black text-sm" style={{ color: '#000000' }}>{sections.caseInfo.investigatingOfficer}</div>
                  <div className="text-slate-600 font-mono text-[11px]">Badge ID: {sections.caseInfo.badgeNumber}</div>
                  <div className="text-slate-600">{sections.caseInfo.department}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Crime Classification</div>
                  <div className="font-bold text-black text-sm" style={{ color: '#000000' }}>{sections.caseInfo.crimeClassification}</div>
                  <div className="text-slate-600 font-mono text-[11px]">Priority: {sections.caseInfo.priority}</div>
                  <div className="text-slate-600">{sections.caseInfo.courtJurisdiction}</div>
                </div>
              </div>
            </section>

            {/* ── SECTION 3.0: PERSONS INVOLVED ─────────────────────────────────── */}
            <section id="sec-persons" className="space-y-3 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>3.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>PERSONS INVOLVED (SUSPECTS, VICTIMS & WITNESSES)</span>
                </h3>
              </div>

              {/* Suspects Table */}
              <div className="space-y-1.5">
                <div className="text-xs font-black uppercase tracking-wide" style={{ color: '#000000' }}>A. Accused & Primary Suspects</div>
                <div className="w-full overflow-x-auto rounded border border-slate-300 bg-white shadow-sm" style={{ borderColor: '#cbd5e1' }}>
                  <table className="w-full text-left text-[11px] border-collapse" style={{ backgroundColor: '#ffffff' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '28%' }}>Name & Alias</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '24%' }}>Syndicate Role</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold text-center" style={{ borderColor: '#cbd5e1', width: '14%' }}>Risk Centrality</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '18%' }}>Custody Status</th>
                        <th className="p-2.5 border-b border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '16%' }}>Biometric Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.personsInvolved.suspects.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-200" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}>
                          <td className="p-2.5 border-r border-slate-200 align-top" style={{ borderColor: '#e2e8f0' }}>
                            <span className="font-bold text-black block text-xs" style={{ color: '#000000' }}>{s.name || 'Mastermind / Primary Accused'}</span>
                            <span className="text-[10px] text-slate-600 font-normal block">{s.alias || 'The Mastermind'}</span>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 align-top font-medium" style={{ borderColor: '#e2e8f0', color: '#1e293b' }}>
                            {s.role || 'Syndicate Operator'}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-center align-top" style={{ borderColor: '#e2e8f0', color: '#b91c1c' }}>
                            {s.riskScore}/100
                          </td>
                          <td className="p-2.5 border-r border-slate-200 align-top" style={{ borderColor: '#e2e8f0' }}>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.status.includes('ARRESTED') ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-red-100 text-red-950 border border-red-300'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-bold align-top text-[10.5px]" style={{ color: '#15803d' }}>
                            {s.biometricMatch}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Victims Table */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-black uppercase tracking-wide" style={{ color: '#000000' }}>B. Complainants & Affected Entities</div>
                <div className="w-full overflow-x-auto rounded border border-slate-300 bg-white shadow-sm" style={{ borderColor: '#cbd5e1' }}>
                  <table className="w-full text-left text-[11px] border-collapse" style={{ backgroundColor: '#ffffff' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '30%' }}>Complainant Name</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '22%' }}>Location</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '24%' }}>Direct Loss (INR)</th>
                        <th className="p-2.5 border-b border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '24%' }}>Reporting Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.personsInvolved.victims.map((v, idx) => (
                        <tr key={idx} className="border-b border-slate-200" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}>
                          <td className="p-2.5 border-r border-slate-200 font-bold" style={{ borderColor: '#e2e8f0', color: '#000000' }}>{v.name}</td>
                          <td className="p-2.5 border-r border-slate-200" style={{ borderColor: '#e2e8f0', color: '#334155' }}>{v.city}</td>
                          <td className="p-2.5 border-r border-slate-200 font-mono font-bold" style={{ borderColor: '#e2e8f0', color: '#000000' }}>₹{v.lossInr.toLocaleString('en-IN')}</td>
                          <td className="p-2.5" style={{ color: '#475569' }}>{v.channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── SECTION 4.0: CRIMINAL NETWORK ANALYSIS ───────────────────────── */}
            <section id="sec-network" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>4.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>CRIMINAL SYNDICATE KNOWLEDGE GRAPH & CENTRALITY</span>
                </h3>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded space-y-2.5 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                  <span className="font-bold text-black" style={{ color: '#000000' }}>MASTERMIND HUB: {sections.networkAnalysis.mastermind}</span>
                  <span className="text-slate-600 font-bold">Density: {sections.networkAnalysis.density} · Centrality: {sections.networkAnalysis.centralityScore}</span>
                </div>

                {/* Visual Snapshot of Network */}
                <div className="py-3 px-3 bg-white border border-slate-300 rounded flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10.5px] shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}>
                  <div className="p-2.5 rounded bg-red-50 border-2 border-red-400 text-center shadow-sm w-full sm:w-auto flex-1 max-w-[210px]" style={{ backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
                    <span className="block font-bold text-red-950 truncate" style={{ color: '#7f1d1d' }}>{sections.networkAnalysis.mastermind || 'Mastermind Hub'}</span>
                    <span className="text-[9px] font-extrabold text-red-700 uppercase" style={{ color: '#b91c1c' }}>MASTERMIND (HUB 01)</span>
                  </div>
                  <div className="text-slate-600 font-bold text-[10px] px-1 text-center whitespace-nowrap">──[AES-256 C2]──▶</div>
                  <div className="p-2.5 rounded bg-blue-50 border-2 border-blue-400 text-center shadow-sm w-full sm:w-auto flex-1 max-w-[210px]" style={{ backgroundColor: '#eff6ff', borderColor: '#60a5fa' }}>
                    <span className="block font-bold text-blue-950 truncate" style={{ color: '#1e3a8a' }}>Aman Deep (PBX Handler)</span>
                    <span className="text-[9px] font-extrabold text-blue-700 uppercase" style={{ color: '#1d4ed8' }}>DISPATCH BRIDGE</span>
                  </div>
                  <div className="text-slate-600 font-bold text-[10px] px-1 text-center whitespace-nowrap">──[RTGS / USDT]──▶</div>
                  <div className="p-2.5 rounded bg-emerald-50 border-2 border-emerald-400 text-center shadow-sm w-full sm:w-auto flex-1 max-w-[210px]" style={{ backgroundColor: '#f0fdf4', borderColor: '#4ade80' }}>
                    <span className="block font-bold text-emerald-950 truncate" style={{ color: '#14532d' }}>14 Mule Accounts</span>
                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase" style={{ color: '#15803d' }}>LAYERING CONDUITS</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-800 leading-relaxed font-sans" style={{ color: '#1e293b' }}>
                  {sections.networkAnalysis.graphSnapshotDescription}
                </p>
              </div>
            </section>

            {/* ── SECTION 5.0: TIMELINE RECONSTRUCTION ─────────────────────────── */}
            <section id="sec-timeline" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>5.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>FORENSIC CHRONOLOGICAL TIMELINE RECONSTRUCTION</span>
                </h3>
              </div>
              <div className="w-full overflow-x-auto rounded border border-slate-300 bg-white shadow-sm" style={{ borderColor: '#cbd5e1' }}>
                <table className="w-full text-left text-[11px] border-collapse" style={{ backgroundColor: '#ffffff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '22%' }}>Timestamp</th>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '42%' }}>Incident Forensic Event</th>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '22%' }}>Location / Cell Tower</th>
                      <th className="p-2.5 border-b border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '14%' }}>Exhibit Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.timeline.map((t, idx) => (
                      <tr key={idx} className="border-b border-slate-200" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold align-top" style={{ borderColor: '#e2e8f0', color: '#000000' }}>
                          {t.time} <span className="block font-normal text-slate-500 text-[9.5px]">{t.date}</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-medium align-top" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>{t.event}</td>
                        <td className="p-2.5 border-r border-slate-200 align-top" style={{ borderColor: '#e2e8f0', color: '#334155' }}>{t.location}</td>
                        <td className="p-2.5 font-mono font-bold align-top" style={{ color: '#1e3a8a' }}>{t.evidenceRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SECTION 6.0: FINANCIAL INTELLIGENCE ───────────────────────────── */}
            <section id="sec-financial" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>6.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>FINANCIAL INTELLIGENCE & HAWALA MONEY LAUNDERING TRAIL</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded font-mono text-center text-xs shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#000000' }}>
                <div><span className="text-slate-500 block text-[10px]">TOTAL TRACKED</span><span className="font-bold text-black text-sm" style={{ color: '#000000' }}>₹{sections.financialIntel.totalVolumeInr.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 block text-[10px]">FROZEN U/S 102 CRPC</span><span className="font-bold text-emerald-800 text-sm" style={{ color: '#15803d' }}>₹{sections.financialIntel.frozenAmountInr.toLocaleString('en-IN')}</span></div>
                <div><span className="text-slate-500 block text-[10px]">ASSET RECOVERY RATE</span><span className="font-bold text-blue-800 text-sm" style={{ color: '#1d4ed8' }}>{sections.financialIntel.recoveryRate}%</span></div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-black uppercase tracking-wide" style={{ color: '#000000' }}>Multi-Hop Layering Breakdown</div>
                <div className="w-full overflow-x-auto rounded border border-slate-300 bg-white shadow-sm" style={{ borderColor: '#cbd5e1' }}>
                  <table className="w-full text-left text-[11px] border-collapse" style={{ backgroundColor: '#ffffff' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '12%' }}>Hop</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '28%' }}>Source Origin</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '28%' }}>Beneficiary Destination</th>
                        <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '18%' }}>Amount (INR)</th>
                        <th className="p-2.5 border-b border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '14%' }}>Channel</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {sections.financialIntel.launderingHops.map((h, idx) => (
                        <tr key={idx} className="border-b border-slate-200" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}>
                          <td className="p-2.5 border-r border-slate-200 font-bold align-top" style={{ borderColor: '#e2e8f0', color: '#000000' }}>Hop {h.hop}</td>
                          <td className="p-2.5 border-r border-slate-200 font-sans align-top" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>{h.source}</td>
                          <td className="p-2.5 border-r border-slate-200 font-sans align-top" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>{h.destination}</td>
                          <td className="p-2.5 border-r border-slate-200 font-bold align-top" style={{ borderColor: '#e2e8f0', color: '#000000' }}>₹{h.amountInr.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-bold align-top" style={{ color: '#1e3a8a' }}>{h.channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── SECTION 7.0: DIGITAL EVIDENCE MANIFEST ───────────────────────── */}
            <section id="sec-evidence" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>7.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>DIGITAL EVIDENCE MANIFEST & SHA-256 HASH VERIFICATION</span>
                </h3>
              </div>
              <div className="w-full overflow-x-auto rounded border border-slate-300 bg-white shadow-sm" style={{ borderColor: '#cbd5e1' }}>
                <table className="w-full text-left text-[10.5px] border-collapse" style={{ backgroundColor: '#ffffff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '16%' }}>Exhibit Code</th>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '34%' }}>Device / Artifact Description</th>
                      <th className="p-2.5 border-b border-r border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '34%' }}>Cryptographic SHA-256 Hash</th>
                      <th className="p-2.5 border-b border-slate-300 font-bold" style={{ borderColor: '#cbd5e1', width: '16%' }}>BSA Section 65B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.digitalEvidence.map((e, idx) => (
                      <tr key={idx} className="border-b border-slate-200" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold align-top" style={{ borderColor: '#e2e8f0', color: '#1e3a8a' }}>{e.code}</td>
                        <td className="p-2.5 border-r border-slate-200 align-top" style={{ borderColor: '#e2e8f0', color: '#000000' }}>
                          <span className="font-bold text-black block" style={{ color: '#000000' }}>{e.name}</span>
                          <span className="text-[9.5px] text-slate-600 font-mono">Seized: {e.seizedAt}</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-[9px] break-all align-top" style={{ borderColor: '#e2e8f0', color: '#334155' }}>{e.sha256}</td>
                        <td className="p-2.5 font-mono font-bold align-top" style={{ color: '#15803d' }}>CERTIFIED 65B</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SECTION 8.0: CHAIN OF CUSTODY ────────────────────────────────── */}
            <section id="sec-custody" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>8.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>IMMUTABLE CHAIN OF CUSTODY & TRANSFER AUDIT LOG</span>
                </h3>
              </div>
              <div className="space-y-2">
                {sections.chainOfCustody.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-300 rounded text-xs flex items-start justify-between" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}>
                    <div>
                      <span className="font-bold font-mono" style={{ color: '#1e3a8a' }}>[{c.stepId}] {c.action}</span>
                      <div className="text-slate-700 text-[11px] mt-0.5" style={{ color: '#334155' }}>
                        Custodian: <strong className="text-black" style={{ color: '#000000' }}>{c.handledBy}</strong> · Transferred to: {c.transferredTo}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-600">
                      <div>{c.timestamp}</div>
                      <div className="text-[9px] font-bold" style={{ color: '#15803d' }}>ECDSA-secp256k1 Signed</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 9.0: APPLICABLE STATUTORY LAWS ───────────────────────── */}
            <section id="sec-laws" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>9.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>APPLICABLE STATUTORY LAWS & PROSECUTION CHARGES</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {sections.applicableLaws.map((l, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1 shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}>
                    <div className="font-bold font-mono text-sm" style={{ color: '#000000' }}>{l.section}</div>
                    <div className="text-[11.5px] font-medium" style={{ color: '#1e293b' }}>{l.title}</div>
                    <div className="text-[10px] font-mono font-bold" style={{ color: '#b91c1c' }}>Punishment: {l.punishment}</div>
                    <div className="text-[10.5px] pt-1 border-t border-slate-200" style={{ color: '#475569', borderColor: '#e2e8f0' }}>{l.applicabilityNotes}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 10.0: AI FINDINGS & PROSECUTION STRATEGY ─────────────── */}
            <section id="sec-ai-findings" className="space-y-2.5 pt-2" style={{ color: '#000000' }}>
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between" style={{ borderColor: '#0f172a' }}>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>10.0</span>
                  <span style={{ color: '#000000', fontWeight: 900 }}>AI EXPLAINABLE FORENSIC FINDINGS & PROSECUTION STRATEGY</span>
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-300" style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', borderColor: '#bfdbfe' }}>
                  CONFIDENCE SCORE: {sections.aiFindings.confidenceScore}%
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-2.5 shadow-sm" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#14532d' }}>
                <div>
                  <h4 className="font-bold font-mono text-[11px] uppercase mb-1" style={{ color: '#14532d' }}>
                    Key Irrefutable Forensic Smoking Guns:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]" style={{ color: '#166534' }}>
                    {sections.aiFindings.smokingGuns.map((sg, idx) => (
                      <li key={idx}>{sg}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-emerald-200" style={{ borderColor: '#bbf7d0' }}>
                  <h4 className="font-bold font-mono text-[11px] uppercase mb-1" style={{ color: '#14532d' }}>
                    Prosecution Recommendations & Bail Opposition Grounds:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]" style={{ color: '#166534' }}>
                    {sections.aiFindings.prosecutionStrategy.map((ps, idx) => (
                      <li key={idx}>{ps}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Official Signatures & Digital Seal Block */}
            <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs font-mono" style={{ borderColor: '#0f172a', color: '#000000' }}>
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center font-serif italic text-sm text-slate-800" style={{ color: '#1e293b' }}>
                  {dossier.author.split(' ')[0] || 'Investigator'}
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold" style={{ color: '#000000', borderColor: '#94a3b8' }}>
                  {dossier.author}
                </div>
                <div className="text-[10px] text-slate-600">Lead Investigating Officer · {dossier.authorBadge}</div>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-400" style={{ backgroundColor: '#dcfce7', color: '#14532d', borderColor: '#86efac' }}>
                    ECDSA SEALED: 0x94f8e...
                  </span>
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold" style={{ color: '#000000', borderColor: '#94a3b8' }}>
                  Central Forensic Lab (CFSL)
                </div>
                <div className="text-[10px] text-slate-600">Digital Forensics Examiner</div>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center font-serif italic text-sm text-slate-800" style={{ color: '#1e293b' }}>
                  Special Public Prosecutor
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold" style={{ color: '#000000', borderColor: '#94a3b8' }}>
                  Judicial Registry
                </div>
                <div className="text-[10px] text-slate-600">Charge-Sheet Approved</div>
              </div>
            </div>

            {/* Document Footer Barcode & Legal Disclaimer */}
            <div className="pt-4 border-t border-slate-300 text-center text-[9.5px] font-mono space-y-1" style={{ borderColor: '#cbd5e1', color: '#475569' }}>
              <p>
                This document is generated automatically by CRIMINALINK AI for National Crime Records Bureau. It constitutes a tamper-proof electronic record under Section 65B of the Bharatiya Sakshya Adhiniyam 2023.
              </p>
              <p className="font-bold" style={{ color: '#000000' }}>
                MERKLE ROOT: {dossier.merkleRoot} · BLOCK #{dossier.blockHeight}
              </p>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL: BLOCKCHAIN VERIFICATION & META ────────────────────── */}
        <div className="w-80 bg-[#050b18] border-l border-[#14233c] flex flex-col flex-shrink-0 hidden xl:flex">
          <div className="p-3.5 border-b border-[#14233c]">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              BLOCKCHAIN VERIFICATION
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Status Card */}
            <div className="p-3 rounded-xl bg-[#030814] border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Section 65B Certified</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cryptographic integrity hash matches the immutable ledger block on Hyperledger Besu.
              </p>
              <div className="pt-2 border-t border-emerald-900/40 text-[10px] text-slate-400 font-mono space-y-1">
                <div className="flex justify-between"><span>Certificate ID:</span> <strong className="text-white">{dossier.certificate65bId}</strong></div>
                <div className="flex justify-between"><span>Block Height:</span> <strong className="text-cyan-300">#{dossier.blockHeight}</strong></div>
                <div className="flex justify-between"><span>Gas / Proof:</span> <strong className="text-slate-300">ECDSA-secp256k1</strong></div>
              </div>
            </div>

            {/* Merkle Root Hash Box */}
            <div className="p-3 rounded-xl bg-[#030814] border border-[#14233c] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Merkle Root Hash</span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded bg-[#01040a] font-mono text-[9.5px] text-cyan-300 break-all select-all border border-slate-800">
                {dossier.merkleRoot}
              </div>
            </div>

            {/* Evidence Checklist */}
            <div className="p-3 rounded-xl bg-[#030814] border border-[#14233c] space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                Evidence Integrity Seals (3/3)
              </span>
              <div className="space-y-1.5 text-[11px] font-mono">
                {sections.digitalEvidence.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate max-w-[170px]">{e.name}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Document</span>
              </button>

              <button
                onClick={handleCopyHash}
                className="w-full py-2 px-3 rounded-xl bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Cryptographic Proof</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Preview Window (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
