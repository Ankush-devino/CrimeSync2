import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  X,
  Share2,
  Check,
  Printer,
  FileCheck,
  Lock,
  Loader2,
  AlertTriangle,
  Landmark,
  Shield,
  FolderKanban,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { logOfficerAction } from '../services/activityLogger';
import {
  getAllForensicDossiers,
  buildDossierForCase,
  type ForensicDossier,
} from '../services/dossierService';
import { printCourtDossier } from '../utils/courtDossierPrinter';
import { AICollationTerminal } from '../components/Reports/AICollationTerminal';
import { ForensicDossierPreview } from '../components/Reports/ForensicDossierPreview';
import { ShareReportModal } from '../components/Reports/ShareReportModal';

interface ReportsPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onSelectAction,
  onNavigateTab,
}) => {
  const { selectedCaseId, selectedCase, cases, setSelectedCaseId } = useCaseContext();
  const { currentUser, permissions } = useAuth();

  // Master dossiers repository state scoped to authorized cases
  const [dossiers, setDossiers] = useState<ForensicDossier[]>(() => {
    return getAllForensicDossiers(currentUser.name, currentUser.badgeNumber, currentUser.department, cases);
  });

  useEffect(() => {
    setDossiers(getAllForensicDossiers(currentUser.name, currentUser.badgeNumber, currentUser.department, cases));
  }, [currentUser, cases]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Certified' | 'Outdated'>('All');
  const [scopeActiveOnly, setScopeActiveOnly] = useState(false);

  // Selected dossier for preview, collation, or sharing
  const [activeDossierForPreview, setActiveDossierForPreview] = useState<ForensicDossier | null>(null);
  const [activeDossierForCollation, setActiveDossierForCollation] = useState<ForensicDossier | null>(null);
  const [activeDossierForShare, setActiveDossierForShare] = useState<ForensicDossier | null>(null);

  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // When active case changes, if scoping is enabled or user wants active case highlighted
  useEffect(() => {
    // Log viewing reports
    logOfficerAction({
      action: 'Audited Forensic Reports & Dossiers Library',
      module: 'Reports & Dossiers',
      caseId: selectedCaseId || 'GENERAL',
      status: 'Authorized',
      category: 'REPORT',
      details: `${currentUser.name} accessed court-ready forensic reports registry for ${selectedCase?.title || 'active cases'}.`,
    });
  }, [selectedCaseId]);

  // Filtered dossiers list
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      // Scoping to active case if toggled
      if (scopeActiveOnly && selectedCaseId && d.caseId !== selectedCaseId) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All' && d.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'All' && d.type !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.reportName.toLowerCase().includes(q) ||
          d.firNumber.toLowerCase().includes(q) ||
          d.caseId.toLowerCase().includes(q) ||
          d.author.toLowerCase().includes(q) ||
          d.blockchainHash.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [dossiers, scopeActiveOnly, selectedCaseId, statusFilter, typeFilter, searchQuery]);

  // Collation completion handler
  const handleCollationComplete = (updatedDossier: ForensicDossier) => {
    setDossiers((prev) =>
      prev.map((d) => (d.id === updatedDossier.id ? updatedDossier : d))
    );
    setActiveDossierForCollation(null);
    setActiveDossierForPreview(updatedDossier);

    logOfficerAction({
      action: `Regenerated & Sealed Section 65B Dossier: ${updatedDossier.firNumber}`,
      module: 'Reports & Dossiers',
      caseId: updatedDossier.caseId,
      status: 'Completed',
      category: 'REPORT',
      details: `${currentUser.name} executed AI Collation pipeline. Dossier re-sealed with Merkle hash ${updatedDossier.merkleRoot}.`,
    });

    if (onSelectAction) {
      onSelectAction(`Regenerated & Certified Court Dossier: ${updatedDossier.firNumber}`);
    }
  };

  // Generate New Dossier for Active Case
  const handleGenerateNewForActiveCase = () => {
    const targetCase = selectedCase || cases[0];
    if (!targetCase) return;

    const newDossier = buildDossierForCase(
      targetCase,
      currentUser.name,
      currentUser.badgeNumber,
      currentUser.department,
      false
    );

    setActiveDossierForCollation(newDossier);
  };

  const handleCopyHash = (dossier: ForensicDossier, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(dossier.merkleRoot || dossier.blockchainHash);
    setCopiedHashId(dossier.id);
    setTimeout(() => setCopiedHashId(null), 2000);
    if (onSelectAction) {
      onSelectAction(`Copied Merkle Hash for ${dossier.firNumber}`);
    }
  };

  // Stats
  const totalCount = dossiers.length;
  const certifiedCount = dossiers.filter((d) => d.status === 'Certified').length;
  const outdatedCount = dossiers.filter((d) => d.status === 'Outdated').length;
  const activeCaseDossiersCount = dossiers.filter((d) => d.caseId === selectedCaseId).length;

  const typePills = ['All', 'Investigation Master', 'Financial Crime', 'Cyber Intrusion', 'Suspect Dossier'];

  return (
    <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans space-y-4">
      
      {/* ── 1. HEADER SECTION ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-white uppercase font-mono">
                  REPORTS & DOSSIERS
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Section 65B BSA 2023 Certified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Court-Ready Automated Forensic Charge Sheets & Blockchain-Verified Evidence Dossiers
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setDossiers(getAllForensicDossiers(currentUser.name, currentUser.badgeNumber, currentUser.department, cases));
              if (onSelectAction) onSelectAction('Refreshed Reports Registry from PostgreSQL');
            }}
            className="p-2 rounded-xl bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleGenerateNewForActiveCase}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate New Dossier</span>
          </button>
        </div>
      </div>

      {/* ── 2. TOP METRIC CARDS (4 COMPACT CARDS) ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-[#14233c] flex items-center gap-3 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black font-mono block text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Total Dossiers</span>
          </div>
        </div>

        {/* Metric 2: Section 65B Certified */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex items-center gap-3 shadow-sm hover:border-emerald-500/50 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black font-mono block text-emerald-400">{certifiedCount}</span>
            <span className="text-[10px] text-emerald-300/80 font-mono block uppercase">Certified On-Chain</span>
          </div>
        </div>

        {/* Metric 3: Outdated / Re-seal Required */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-amber-500/30 flex items-center gap-3 shadow-sm hover:border-amber-500/50 transition-all">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black font-mono block text-amber-400">{outdatedCount}</span>
            <span className="text-[10px] text-amber-300/80 font-mono block uppercase">Re-Seal Required</span>
          </div>
        </div>

        {/* Metric 4: Active Case Scope */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-purple-500/30 flex items-center gap-3 shadow-sm hover:border-purple-500/50 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black font-mono block text-purple-300">{activeCaseDossiersCount}</span>
            <span className="text-[10px] text-slate-400 font-mono block uppercase truncate max-w-[120px]" title={selectedCase?.fir_number}>
              {selectedCase?.fir_number || 'Active Scope'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH CONTROL BAR ────────────────────────────────────── */}
      <div className="bg-[#050b18] border border-[#14233c] rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dossiers by Title, FIR, Hash, or Suspect..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#081224] border border-slate-700/80 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {typePills.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === t
                  ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                  : 'bg-[#081224] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-1 bg-[#081224] p-0.5 rounded-xl border border-slate-800">
          {(['All', 'Certified', 'Outdated'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? st === 'Certified'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : st === 'Outdated'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Active Case Scoping Toggle Button */}
        <button
          onClick={() => setScopeActiveOnly(!scopeActiveOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer whitespace-nowrap ${
            scopeActiveOnly
              ? 'bg-purple-950/70 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-[#081224] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{scopeActiveOnly ? 'Scoped to Active FIR' : 'All Authorized FIRs'}</span>
        </button>
      </div>

      {/* ── 4. REPORTS LIBRARY DATA GRID ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {filteredDossiers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3 bg-[#050b18] border border-[#14233c] rounded-2xl">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-sm text-slate-300 font-mono">No matching forensic dossiers found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query, status filters, or case scoping.
            </p>
            <button
              onClick={handleGenerateNewForActiveCase}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Dossier for Active Case</span>
            </button>
          </div>
        ) : (
          filteredDossiers.map((dossier) => {
            const isCertified = dossier.status === 'Certified';
            const isCopied = copiedHashId === dossier.id;

            return (
              <div
                key={dossier.id}
                onClick={() => setActiveDossierForPreview(dossier)}
                className={`p-4 rounded-2xl bg-[#050b18] border transition-all duration-200 shadow-lg cursor-pointer group hover:bg-[#070f22] ${
                  isCertified
                    ? 'border-[#14233c] hover:border-cyan-500/50'
                    : 'border-amber-500/40 hover:border-amber-400/80 bg-[#090b14]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Dossier Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105 ${
                        isCertified
                          ? 'bg-blue-950/60 border-blue-500/40 text-cyan-400'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors truncate max-w-xl">
                          {dossier.reportName}
                        </h3>

                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border ${dossier.typeColor}`}>
                          {dossier.type}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isCertified
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                              : 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
                          }`}
                        >
                          {isCertified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Certified (Sec 65B)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Outdated (New Evidence Logged)</span>
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {dossier.summary}
                      </p>

                      {/* Footer Metadata */}
                      <div className="flex items-center gap-3 pt-1 text-[10.5px] font-mono text-slate-400 flex-wrap">
                        <span className="text-white font-bold">{dossier.firNumber}</span>
                        <span>·</span>
                        <span className="text-slate-300">IO: {dossier.author}</span>
                        <span>·</span>
                        <span>Generated: {dossier.generatedOn}</span>
                        <span>·</span>
                        <span>{dossier.pages} Pages</span>
                        <span>·</span>
                        <span className="text-cyan-300 font-bold">{dossier.fileSize}</span>
                        <span>·</span>
                        <span className="text-slate-500">{dossier.lastEvidenceSync}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Blockchain Hash Snippet */}
                  <div className="flex items-center gap-2 bg-[#02050e] px-3 py-2 rounded-xl border border-slate-800 self-start lg:self-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                        BLOCKCHAIN PROOF (SHA-256)
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 truncate max-w-[140px]">
                        {dossier.blockchainHash}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCopyHash(dossier, e)}
                      title="Copy Merkle Root Hash"
                      className="p-1 rounded-lg bg-[#081224] hover:bg-[#0e1d38] text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* View Preview Button */}
                    <button
                      onClick={() => setActiveDossierForPreview(dossier)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      title="Open Full Court-Ready Dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {/* Download PDF Button */}
                    <button
                      onClick={() => {
                        printCourtDossier(dossier);
                        if (onSelectAction) onSelectAction(`Exported Court PDF: ${dossier.firNumber}`);
                      }}
                      className="p-1.5 px-2.5 rounded-xl bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Download Court PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Regenerate Button */}
                    <button
                      onClick={() => setActiveDossierForCollation(dossier)}
                      className={`p-1.5 px-2.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        !isCertified
                          ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-[#081224] hover:bg-[#0e1d38] border-[#162744] text-slate-300 hover:text-white'
                      }`}
                      title={!isCertified ? 'New Evidence Uploaded — Click to Re-Seal' : 'Regenerate Dossier'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Regenerate</span>
                    </button>

                    {/* Share Modal Button */}
                    <button
                      onClick={() => setActiveDossierForShare(dossier)}
                      className="p-1.5 rounded-xl bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Share Electronic Verification Link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 5. MODALS & SUB-COMPONENTS ────────────────────────────────────────── */}
      
      {/* 1. AI Collation Terminal Modal */}
      {activeDossierForCollation && (
        <AICollationTerminal
          dossier={activeDossierForCollation}
          isOpen={Boolean(activeDossierForCollation)}
          onClose={() => setActiveDossierForCollation(null)}
          onComplete={handleCollationComplete}
        />
      )}

      {/* 2. Full-Screen Forensic Dossier Preview Workspace */}
      {activeDossierForPreview && (
        <ForensicDossierPreview
          dossier={activeDossierForPreview}
          isOpen={Boolean(activeDossierForPreview)}
          onClose={() => setActiveDossierForPreview(null)}
          onRegenerate={() => {
            const d = activeDossierForPreview;
            setActiveDossierForPreview(null);
            setActiveDossierForCollation(d);
          }}
          onSelectAction={onSelectAction}
        />
      )}

      {/* 3. Judicial Share & Verification Link Modal */}
      {activeDossierForShare && (
        <ShareReportModal
          dossier={activeDossierForShare}
          isOpen={Boolean(activeDossierForShare)}
          onClose={() => setActiveDossierForShare(null)}
        />
      )}

    </div>
  );
};
