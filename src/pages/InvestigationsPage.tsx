import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Shield,
  MapPin,
  UserCheck,
  FileText,
  Box,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Network,
  CircleDollarSign,
  Clock,
  RefreshCw,
  Sparkles,
  Scale,
  Info,
  Smartphone,
  HardDrive,
  Landmark,
  Video,
  FileCode,
  Pencil,
  Trash2,
  X,
  Lock,
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { NewCaseModal } from '../components/Investigations/NewCaseModal';
import { AddEvidenceModal } from '../components/Investigations/AddEvidenceModal';
import type { NetworkNode, AlertItem } from '../types/dashboard';

interface InvestigationsPageProps {
  onSelectNode?: (node: NetworkNode) => void;
  onSelectAlert?: (alert: AlertItem) => void;
  onSelectAction?: (action: string) => void;
  onOpenAnalysis?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  onSelectAction,
  onNavigateTab,
}) => {
  const { currentUser, permissions } = useAuth();
  const {
    cases,
    selectedCaseId,
    selectedCase,
    applicableLaw,
    loading,
    detailsLoading,
    toastMessage,
    fetchCases,
    fetchCaseDetails,
    updateCaseStatus,
    addCaseNote,
    editCaseNote,
    deleteCaseNote,
    editEvidence,
    deleteEvidence,
    showToast,
  } = useCaseContext();


  // Main Active Tab in Case Dossier Workbench
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'suspects' | 'diary'>('overview');

  // How it works guide banner toggle (compact single-line strip matching other pages)
  const [showHelpBanner, setShowHelpBanner] = useState<boolean>(true);

  // Modals
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);

  // Note input state
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('INVESTIGATION_NOTE');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Note editing & deleting state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>('');
  const [editNoteCategory, setEditNoteCategory] = useState<string>('INVESTIGATION_NOTE');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Evidence editing & deleting state
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [editEvidenceTitle, setEditEvidenceTitle] = useState<string>('');
  const [editEvidenceCategory, setEditEvidenceCategory] = useState<string>('DIGITAL_HARDWARE');
  const [editEvidenceStatus, setEditEvidenceStatus] = useState<string>('SECURED');
  const [isSavingEvidenceEdit, setIsSavingEvidenceEdit] = useState<boolean>(false);
  const [deletingEvidenceId, setDeletingEvidenceId] = useState<string | null>(null);

  // Copied hash state
  const [copiedHash, setCopiedHash] = useState<string | null>(null);


  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedCase) return;

    try {
      setIsSubmittingNote(true);
      await addCaseNote(noteText.trim(), noteCategory);
      setNoteText('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Start Editing Note
  const handleStartEdit = (note: any) => {
    let parsed: any = {};
    try {
      parsed = typeof note.details === 'string' ? JSON.parse(note.details) : note.details || {};
    } catch {
      parsed = { note: String(note.details) };
    }
    setEditingNoteId(note.id);
    setEditNoteText(parsed.note || '');
    setEditNoteCategory(parsed.category || note.action || 'INVESTIGATION_NOTE');
  };

  // Cancel Editing Note
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  // Save Note Edit
  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    try {
      setIsSavingEdit(true);
      await editCaseNote(noteId, editNoteText.trim(), editNoteCategory);
      setEditingNoteId(null);
      setEditNoteText('');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      setDeletingNoteId(noteId);
      await deleteCaseNote(noteId);
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Start Editing Evidence
  const handleStartEditEvidence = (ev: any) => {
    setEditingEvidenceId(ev.id);
    setEditEvidenceTitle(ev.title || '');
    setEditEvidenceCategory(ev.category || 'DIGITAL_HARDWARE');
    setEditEvidenceStatus(ev.status || 'SECURED');
  };

  // Cancel Editing Evidence
  const handleCancelEditEvidence = () => {
    setEditingEvidenceId(null);
    setEditEvidenceTitle('');
  };

  // Save Evidence Edit
  const handleSaveEvidenceEdit = async (evidenceId: string) => {
    if (!editEvidenceTitle.trim()) return;
    try {
      setIsSavingEvidenceEdit(true);
      await editEvidence(evidenceId, {
        title: editEvidenceTitle.trim(),
        category: editEvidenceCategory,
        status: editEvidenceStatus,
      });
      setEditingEvidenceId(null);
      setEditEvidenceTitle('');
    } finally {
      setIsSavingEvidenceEdit(false);
    }
  };

  // Delete Evidence
  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      setDeletingEvidenceId(evidenceId);
      await deleteEvidence(evidenceId);
    } finally {
      setDeletingEvidenceId(null);
    }
  };

  // Copy Evidence Hash
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast('SHA-256 hash copied to clipboard');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Quick Navigation to other modules
  const handleQuickNavigate = (tab: string, label: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    if (onSelectAction) {
      onSelectAction(`Navigated to ${label} for ${selectedCase?.title || 'Active Case'}`);
    }
    showToast(`Opening ${label}...`, 'info');
  };

  const getEvidenceCategoryIcon = (category: string) => {
    switch (category) {
      case 'MOBILE_DEVICE':
        return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
      case 'DIGITAL_HARDWARE':
        return <HardDrive className="w-3.5 h-3.5 text-purple-400" />;
      case 'BANK_STATEMENT':
        return <Landmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CCTV_FOOTAGE':
        return <Video className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020612] text-slate-200 select-none overflow-hidden">
      {/* ─── TOAST NOTIFICATION ─────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-2 rounded-lg text-xs font-bold shadow-[0_0_20px_rgba(0,0,0,0.8)] border flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 shadow-emerald-900/30'
                : 'bg-blue-950 text-blue-300 border-blue-500/80 shadow-blue-900/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
      <header className="px-5 py-3 border-b border-slate-700/80 bg-[#040a1c] flex flex-row items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/60 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(37,99,235,0.4)]">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              CASES WORKBENCH
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-200 border border-blue-400/50 font-mono font-bold">
                {cases.length} Active FIRs
              </span>
            </h1>
            {/* Active Case Badge */}
            {selectedCase && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#08132e] border border-blue-500/40 text-xs font-mono">
                <span className="text-slate-400 font-sans">Active:</span>
                <span className="font-bold text-cyan-300">{selectedCase.fir_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Active Officer Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#08132e] border border-slate-700 text-xs font-mono">
            <span className="text-slate-400 font-sans">Officer:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <span className="text-[10px] text-blue-300 font-extrabold bg-blue-950 px-1.5 py-0.2 rounded border border-blue-500/40">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={() => fetchCases()}
            title="Refresh database records"
            className="p-2 text-slate-200 hover:text-white bg-[#08132e] border border-slate-700 rounded-lg hover:border-slate-500 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : 'text-slate-200'}`} />
          </button>

          {permissions.canLodgeFIR ? (
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-[0_0_14px_rgba(37,99,235,0.5)] flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lodge New FIR</span>
            </button>
          ) : (
            <button
              disabled
              title={`Lodge FIR requires Inspector or ACP authorization. Current role: ${currentUser.roleTitle}`}
              className="px-3.5 py-2 bg-slate-800/60 text-slate-400 border border-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-75"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lodge FIR (Restricted)</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── Explanatory Guide Banner & RBAC Scope Alert ─── */}
      {showHelpBanner && (
        <div className="mx-4 mt-2.5 p-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-900/80 via-slate-900/95 to-purple-900/80 border border-blue-400/50 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-100 flex-shrink-0 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-500/30 border border-blue-400/60 flex items-center justify-center text-blue-200 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-xs sm:text-sm">
              <span className="font-bold text-white">RBAC Session: </span>
              Logged in as <strong className="text-cyan-300">{currentUser.name}</strong> ({currentUser.roleTitle}).
              {currentUser.role === 'ACP' ? (
                <span> Supervisor view enabled — all national jurisdiction cases accessible.</span>
              ) : currentUser.role === 'FORENSIC_ANALYST' ? (
                <span className="text-amber-300"> Forensic Read-Only mode active — exhibit verification permitted.</span>
              ) : (
                <span> Filtered to {cases.length} assigned investigation cases via <code>user_cases</code> relational join.</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowHelpBanner(false)}
            className="text-slate-300 hover:text-white font-bold px-2 py-0.5 text-xs shrink-0"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ─── MAIN WORKSPACE (EXPANDED FULL-WIDTH CASE DOSSIER) ── */}
      <div className="flex-1 flex flex-col overflow-hidden mt-1.5">
        {/* ─── MAIN CASE DOSSIER WORKBENCH (FULL WIDTH) ───── */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#020716] min-w-0">
          {detailsLoading && !selectedCase ? (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-100 text-sm gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span>Loading Case Dossier & Forensics...</span>
            </div>
          ) : !selectedCase ? (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-200 text-sm">
              Select an active investigation from the top bar to view case details.
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* ─── ACTIVE CASE HEADER & 1-CLICK STATUS CHANGER ─── */}
              <div className="p-3 px-5 border-b border-slate-700 bg-[#06112a]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-200 bg-blue-950 px-2.5 py-0.5 rounded border border-blue-500">
                        {selectedCase.fir_number}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-white font-bold">
                        {selectedCase.crime_category?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-200 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {selectedCase.jurisdiction_city}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                      {selectedCase.title}
                    </h2>
                  </div>

                  {/* 1-Click Status Toggles (Guarded by RBAC) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      Status:
                    </span>
                    <div className="flex items-center bg-[#040d24] p-1 rounded-lg border border-slate-700">
                      {['INVESTIGATING', 'UNDER_REVIEW', 'CLOSED'].map((st) => {
                        const isActive = selectedCase.status === st;
                        return (
                          <button
                            key={st}
                            disabled={!permissions.canEditCaseStatus}
                            onClick={() => updateCaseStatus(st)}
                            title={!permissions.canEditCaseStatus ? 'Status modification requires Investigator or ACP role' : undefined}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              isActive
                                ? st === 'CLOSED'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : st === 'UNDER_REVIEW'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-200 hover:text-white hover:bg-slate-800'
                            } ${!permissions.canEditCaseStatus ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            {st === 'UNDER_REVIEW' ? 'Review' : st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lead Investigator Bar & Tabs Selector */}
                <div className="mt-3 pt-2 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 font-medium">Lead Officer:</span>
                    <span className="font-extrabold text-white">
                      {selectedCase.lead_investigator_name || 'ACP Rajeshwar Sharma'}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-medium">
                      • {selectedCase.badge_number || 'DEL-IPS-8821'} • {selectedCase.department || 'Special Cell'}
                    </span>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'overview', label: 'Overview & Law', count: null, icon: FileText },
                      { id: 'evidence', label: 'Evidence', count: selectedCase.evidence?.length || 0, icon: Box },
                      { id: 'suspects', label: 'Suspects', count: selectedCase.suspects?.length || 0, icon: Users },
                      { id: 'diary', label: 'Diary', count: selectedCase.case_notes?.length || 0, icon: Sparkles },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isCurrent = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-200 hover:text-white hover:bg-slate-800 bg-[#06112a] border border-slate-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                          {tab.count !== null && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-extrabold ${
                                isCurrent
                                  ? 'bg-blue-800 text-white'
                                  : 'bg-[#040d24] text-blue-300 border border-blue-700'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ─── TAB CONTENTS ───────────────────────────────────────── */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
                {/* ─── TAB 1: OVERVIEW & CASE-SPECIFIC APPLICABLE LAW ─────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    {/* Synopsis Card */}
                    <div className="p-3.5 bg-[#081534] border border-slate-700 rounded-xl space-y-1.5 shadow-sm">
                      <div className="text-xs sm:text-sm font-bold text-blue-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Case Synopsis</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
                        {selectedCase.description || 'No summary recorded.'}
                      </p>
                    </div>

                    {/* Case-Specific Applicable Statutory Law */}
                    {applicableLaw && (
                      <div className="p-3.5 bg-[#081534] border border-amber-500/60 rounded-xl space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-400" />
                            <span>Applicable Laws: {applicableLaw.primaryAct}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-red-950 text-red-200 border border-red-600">
                              {applicableLaw.overallBailStatus === 'NON-BAILABLE' ? 'Non-Bailable' : 'Bail Allowed'}
                            </span>
                            <span className="text-xs font-mono text-slate-100 font-bold">
                              Police Custody: Up to {applicableLaw.statutoryRemandDeadlineDays} Days
                            </span>
                          </div>
                        </div>

                        {/* 1-Line Simple Crime Summary */}
                        {applicableLaw.legalSynopsis && (
                          <p className="text-xs sm:text-sm text-slate-100 bg-[#040c20] p-2.5 px-3 rounded-lg border border-slate-700 leading-relaxed font-medium">
                            <strong className="text-amber-300 font-bold">Crime Summary: </strong>
                            {applicableLaw.legalSynopsis}
                          </p>
                        )}

                        {/* Charges Chips Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {applicableLaw.charges.map((charge, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-[#040c20] border border-slate-700 hover:border-slate-500 rounded-lg space-y-1 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-extrabold text-blue-300">
                                  {charge.code}
                                </span>
                                <span className="text-[10px] font-extrabold text-red-200 bg-red-950 px-2 py-0.5 rounded border border-red-600">
                                  {charge.bailable === 'NON-BAILABLE' ? 'No Bail' : 'Bailable'}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                                {charge.offence}
                              </p>
                              <div className="text-xs text-slate-200 font-mono flex items-center justify-between pt-1 border-t border-slate-700">
                                <span>Max: <strong className="text-white font-bold">{charge.maxPenalty}</strong></span>
                                <span className="text-slate-300 truncate max-w-[150px] font-medium">{charge.courtJurisdiction}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Evidence & Suspects Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 px-4 bg-[#081534] border border-slate-700 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
                            Seized Evidence Exhibits
                          </span>
                          <div className="text-sm font-extrabold text-emerald-300 font-mono mt-0.5">
                            {selectedCase.evidence?.length || 0} Cryptographically Verified
                          </div>
                        </div>
                        <Box className="w-5 h-5 text-emerald-400" />
                      </div>

                      <div className="p-3 px-4 bg-[#081534] border border-slate-700 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
                            Syndicate Accused Targets
                          </span>
                          <div className="text-sm font-extrabold text-red-300 font-mono mt-0.5">
                            {selectedCase.suspects?.length || 0} Connected in Graph
                          </div>
                        </div>
                        <Users className="w-5 h-5 text-red-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: EVIDENCE LOCKER ───────────────────────────── */}
                {activeTab === 'evidence' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-400" />
                        <span>Seized Forensic Exhibits • {selectedCase.evidence?.length || 0}</span>
                      </div>
                      <button
                        onClick={() => setIsAddEvidenceModalOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Seize Evidence</span>
                      </button>
                    </div>

                    {!selectedCase.evidence || selectedCase.evidence.length === 0 ? (
                      <div className="p-8 text-center bg-[#081534] border border-slate-700 rounded-xl text-slate-200 text-sm">
                        No evidence logged yet. Click "+ Seize Evidence" to add.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedCase.evidence.map((ev: any) => {
                          const isEditing = editingEvidenceId === ev.id;

                          return (
                            <div
                              key={ev.id}
                              className="p-3.5 bg-[#081534] border border-slate-700 hover:border-slate-500 rounded-xl space-y-2.5 shadow-sm transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getEvidenceCategoryIcon(ev.category)}
                                  <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-600">
                                    {ev.evidence_code}
                                  </span>
                                  <span className="text-xs text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-600 font-bold">
                                    {ev.category?.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-extrabold text-blue-300">
                                    {ev.status}
                                  </span>
                                </div>

                                {/* Right Side Actions: Verified + Edit & Delete */}
                                {!isEditing && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="font-extrabold text-emerald-300 font-mono">VERIFIED</span>
                                    </div>
                                    <button
                                      onClick={() => handleStartEditEvidence(ev)}
                                      title="Edit evidence details"
                                      className="px-2 py-1 text-slate-200 hover:text-blue-200 hover:bg-blue-950/90 rounded border border-slate-700 hover:border-blue-500 transition-all flex items-center gap-1 text-xs font-bold"
                                    >
                                      <Pencil className="w-3 h-3 text-blue-400" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvidence(ev.id)}
                                      disabled={deletingEvidenceId === ev.id}
                                      title="Delete evidence record"
                                      className="px-2 py-1 text-slate-200 hover:text-red-200 hover:bg-red-950/90 rounded border border-slate-700 hover:border-red-500 transition-all flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                      <span>{deletingEvidenceId === ev.id ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-2.5 pt-1">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Category</label>
                                      <select
                                        value={editEvidenceCategory}
                                        onChange={(e) => setEditEvidenceCategory(e.target.value)}
                                        className="w-full bg-[#040c20] border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                                      >
                                        <option value="DIGITAL_HARDWARE">Digital Hardware</option>
                                        <option value="MOBILE_DEVICE">Mobile Device</option>
                                        <option value="BANK_STATEMENT">Bank Statements & Mule Ledgers</option>
                                        <option value="CALL_RECORD">Call Data Records</option>
                                        <option value="SERVER_LOG">Server Logs & Network PCAP</option>
                                        <option value="FORENSIC_IMAGE">Forensic Disk Image</option>
                                        <option value="CCTV_FOOTAGE">CCTV Surveillance Footage</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Custody Status</label>
                                      <select
                                        value={editEvidenceStatus}
                                        onChange={(e) => setEditEvidenceStatus(e.target.value)}
                                        className="w-full bg-[#040c20] border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                                      >
                                        <option value="SECURED">SECURED • In Vault</option>
                                        <option value="IN_FORENSICS">IN FORENSICS • FSL Lab</option>
                                        <option value="COURT_SUBMITTED">COURT SUBMITTED • In Court</option>
                                        <option value="ARCHIVED">ARCHIVED</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Evidence Title & Description</label>
                                    <input
                                      type="text"
                                      value={editEvidenceTitle}
                                      onChange={(e) => setEditEvidenceTitle(e.target.value)}
                                      placeholder="Evidence title and description..."
                                      className="w-full bg-[#040c20] border border-blue-500 rounded-lg p-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans"
                                    />
                                  </div>

                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditEvidence}
                                      className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Cancel</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSavingEvidenceEdit || !editEvidenceTitle.trim()}
                                      onClick={() => handleSaveEvidenceEdit(ev.id)}
                                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{isSavingEvidenceEdit ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-sm font-bold text-white">{ev.title}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-200">
                                    <span className="font-mono text-slate-200 font-medium">
                                      SHA-256: {ev.hash_sha256 ? `${ev.hash_sha256.slice(0, 24)}...` : 'N/A'}
                                    </span>
                                    {ev.hash_sha256 && (
                                      <button
                                        onClick={() => handleCopyHash(ev.hash_sha256)}
                                        className="text-blue-300 hover:text-blue-100 font-bold flex items-center gap-1"
                                      >
                                        {copiedHash === ev.hash_sha256 ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                        <span>Copy</span>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 3: SUSPECTS MANIFEST ─────────────────────────── */}
                {activeTab === 'suspects' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <span>Syndicate Suspects • {selectedCase.suspects?.length || 0}</span>
                      </div>
                      <button
                        onClick={() => handleQuickNavigate('knowledge-graph', 'Knowledge Graph')}
                        className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-100 border border-blue-400 text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Network className="w-4 h-4" />
                        <span>Explore in Graph</span>
                      </button>
                    </div>

                    {!selectedCase.suspects || selectedCase.suspects.length === 0 ? (
                      <div className="p-8 text-center bg-[#081534] border border-slate-700 rounded-xl text-slate-200 text-sm">
                        No suspects directly implicated in graph yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCase.suspects.map((suspect: any) => (
                          <div
                            key={suspect.id}
                            className="p-3.5 bg-[#081534] border border-slate-700 hover:border-slate-500 rounded-xl space-y-2 shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-extrabold text-white">
                                {suspect.name} {suspect.alias && <span className="text-amber-300 font-semibold">• {suspect.alias}</span>}
                              </div>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-200 border border-red-600">
                                {suspect.risk_level || 'CRITICAL'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-200 flex items-center justify-between font-medium">
                              <span>Role: <strong className="text-white font-bold">{suspect.case_role || suspect.role}</strong></span>
                              <span>City: <strong className="text-white font-bold">{suspect.city || 'National'}</strong></span>
                            </div>

                            {suspect.phones?.length > 0 && (
                              <div className="text-xs font-mono text-slate-100 bg-[#040c20] p-2 rounded border border-slate-700 font-medium">
                                📱 {suspect.phones.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 4: CASE DIARY & NOTES ────────────────────────── */}
                {activeTab === 'diary' && (
                  <div className="space-y-3">
                    <form onSubmit={handleAddNote} className="space-y-2.5 p-3.5 bg-[#081534] border border-slate-700 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-100">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          Log Investigation Finding & Diary Entry
                        </span>
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="bg-[#040c20] border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                        >
                          <option value="INVESTIGATION_NOTE">General Note</option>
                          <option value="FORENSIC_LEAD">Forensic Discovery</option>
                          <option value="INTERROGATION_LOG">Interrogation Finding</option>
                          <option value="COURT_FILING">Court Filing & Remand</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Type forensic lead, witness statement, or remand update..."
                          className="flex-1 bg-[#040c20] border border-slate-600 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNote || !noteText.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmittingNote ? 'Saving...' : 'Post'}</span>
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5">
                      {selectedCase.case_notes && selectedCase.case_notes.length > 0 ? (
                        selectedCase.case_notes.map((note: any) => {
                          let detailsParsed: any = {};
                          try {
                            detailsParsed =
                              typeof note.details === 'string'
                                ? JSON.parse(note.details)
                                : note.details || {};
                          } catch {
                            detailsParsed = { note: String(note.details) };
                          }

                          const isEditing = editingNoteId === note.id;
                          const noteCat = detailsParsed.category || note.action || 'INVESTIGATION_NOTE';
                          const catLabel =
                            noteCat === 'FORENSIC_LEAD'
                              ? 'Forensic Discovery'
                              : noteCat === 'INTERROGATION_LOG'
                              ? 'Interrogation Finding'
                              : noteCat === 'COURT_FILING'
                              ? 'Court Filing & Remand'
                              : 'General Note';

                          return (
                            <div
                              key={note.id}
                              className="p-3.5 bg-[#081534] border border-slate-700 hover:border-slate-600 rounded-xl space-y-2.5 shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-200">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-blue-200 text-xs sm:text-sm">
                                    {note.officer_name || 'ACP Rajeshwar Sharma'}
                                  </span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#040c20] text-amber-300 border border-amber-600/60">
                                    {catLabel}
                                  </span>
                                  <span className="text-slate-300 font-mono font-medium">
                                    • {note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                                  </span>
                                </div>

                                {/* Edit & Delete Action Buttons */}
                                {!isEditing && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleStartEdit(note)}
                                      title="Edit this diary entry"
                                      className="px-2 py-1 text-slate-200 hover:text-blue-200 hover:bg-blue-950/90 rounded border border-slate-700 hover:border-blue-500 transition-all flex items-center gap-1 text-xs font-bold"
                                    >
                                      <Pencil className="w-3 h-3 text-blue-400" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      disabled={deletingNoteId === note.id}
                                      title="Delete this diary entry"
                                      className="px-2 py-1 text-slate-200 hover:text-red-200 hover:bg-red-950/90 rounded border border-slate-700 hover:border-red-500 transition-all flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                      <span>{deletingNoteId === note.id ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-2 pt-1">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={editNoteCategory}
                                      onChange={(e) => setEditNoteCategory(e.target.value)}
                                      className="bg-[#040c20] border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                                    >
                                      <option value="INVESTIGATION_NOTE">General Note</option>
                                      <option value="FORENSIC_LEAD">Forensic Discovery</option>
                                      <option value="INTERROGATION_LOG">Interrogation Finding</option>
                                      <option value="COURT_FILING">Court Filing & Remand</option>
                                    </select>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={editNoteText}
                                    onChange={(e) => setEditNoteText(e.target.value)}
                                    className="w-full bg-[#040c20] border border-blue-500 rounded-lg p-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none font-sans"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Cancel</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSavingEdit || !editNoteText.trim()}
                                      onClick={() => handleSaveEdit(note.id)}
                                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
                                  {detailsParsed.note || 'Case note logged.'}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center bg-[#081534] border border-slate-700 rounded-xl text-slate-200 text-sm">
                          No notes added yet. Use the box above to write the first note.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── BOTTOM QUICK ACTIONS RIBBON ───────────────────────── */}
              <div className="p-2.5 px-5 border-t border-slate-700 bg-[#040b1e] flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
                <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                  QUICK PIVOTS • {selectedCase.fir_number}:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleQuickNavigate('knowledge-graph', 'Knowledge Graph')}
                    className="px-3.5 py-1.5 bg-[#0a1636] hover:bg-blue-900 border border-blue-500 rounded-lg text-xs sm:text-sm font-bold text-blue-100 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Network className="w-4 h-4 text-blue-400" />
                    <span>Knowledge Graph</span>
                  </button>

                  <button
                    onClick={() => handleQuickNavigate('financial-intelligence', 'Financial Intelligence')}
                    className="px-3.5 py-1.5 bg-[#08201a] hover:bg-emerald-900 border border-emerald-500 rounded-lg text-xs sm:text-sm font-bold text-emerald-100 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Hawala Trail</span>
                  </button>

                  <button
                    onClick={() => handleQuickNavigate('time-machine', 'Time Machine')}
                    className="px-3.5 py-1.5 bg-[#1b1030] hover:bg-purple-900 border border-purple-500 rounded-lg text-xs sm:text-sm font-bold text-purple-100 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Time Machine</span>
                  </button>

                  <button
                    onClick={() => handleQuickNavigate('reports', 'Reports & Court Dossier')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export PDF Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>


      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────── */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onCaseCreated={(newCase) => {
          showToast(`FIR ${newCase.fir_number} registered!`);
          fetchCases(newCase?.id);
        }}
      />

      {selectedCase && (
        <AddEvidenceModal
          isOpen={isAddEvidenceModalOpen}
          onClose={() => setIsAddEvidenceModalOpen(false)}
          caseId={selectedCase.id}
          firNumber={selectedCase.fir_number}
          onEvidenceAdded={(newEv) => {
            showToast(`Evidence ${newEv.evidence_code} added!`);
            fetchCaseDetails(selectedCase.id);
          }}
        />
      )}
    </div>
  );
};
