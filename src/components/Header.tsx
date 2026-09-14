import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Search, 
  ChevronDown, 
  Lock, 
  FolderKanban,
  Check,
  LogOut,
  MapPin,
  RefreshCw,
  X,
  User,
  Shield,
  Clock,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCaseContext } from '../context/CaseContext';
import { useTheme } from '../context/ThemeContext';
import { useAuditLog } from '../hooks/useAuditLog';
import type { LawCase } from '../constants/cases';
import { isCompromisedReport, isCompromiseSensitivePage } from '../utils/reportFilters';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts?: () => void;
  activeTab: string;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  'command-center': {
    title: 'NATIONAL COMMAND CENTER',
    subtitle: 'National Cyber-Intelligence & Security Operations Center (SOC)',
  },
  'investigations': {
    title: 'CASES / CASE REGISTRY',
    subtitle: 'Track, analyze and manage statutory criminal investigations',
  },
  'ai-copilot': {
    title: 'AI ASSISTANT',
    subtitle: 'Autonomous forensic reasoning and modus operandi hypothesis generation',
  },
  'knowledge-graph': {
    title: 'NETWORK GRAPH ENGINE',
    subtitle: 'Multi-hop syndicate entity traversal and centrality mapping',
  },
  'time-machine': {
    title: 'TIMELINE RECONSTRUCTION',
    subtitle: 'Forensic temporal replay with synchronized CDR tower handoffs and CCTV',
  },
  'geo-intelligence': {
    title: 'GEO MAP (GIS)',
    subtitle: 'Satellite tracking, cell tower triangulation, and threat density',
  },
  'financial-intelligence': {
    title: 'MONEY TRAIL INTELLIGENCE',
    subtitle: 'Hawala smurfing, crypto wallet analysis, and mule network mapping',
  },
  'identity-security': {
    title: 'IDENTITY SHIELD',
    subtitle: 'Session trust scoring, behavioral biometrics and honeypots',
  },
  'attack-graph': {
    title: 'ATTACK MAP & LATERAL MOVEMENT',
    subtitle: 'MITRE ATT&CK intrusion kill-chain and breach simulation',
  },
  'deception-network': {
    title: 'HONEYPOT DEFENSE NETWORK',
    subtitle: 'Canary tokens, ghost database tripwires and steganography',
  },
  'blast-radius': {
    title: 'IMPACT ZONE SIMULATOR',
    subtitle: 'Hop-0 breach propagation and circuit breaker isolation',
  },
  'ai-sandbox': {
    title: 'AI SANDBOX (GVISOR)',
    subtitle: 'Containerized autonomous red-team and eBPF kernel monitoring',
  },
  'threat-alerts': {
    title: 'LIVE ALERTS (SOC FEED)',
    subtitle: 'Real-time SIEM event stream, anomaly detection and tripwires',
  },
  'evidence-dna': {
    title: 'DIGITAL FINGERPRINT VAULT',
    subtitle: 'Section 65B BSA 2023 cryptographic hashing and Merkle root sealing',
  },
  'chain-of-custody': {
    title: 'CUSTODY LOG',
    subtitle: 'Immutable electronic evidence transfer ledger',
  },
  'reports': {
    title: 'REPORTS & LEGAL DOSSIERS',
    subtitle: 'Section 65B Bharatiya Sakshya Adhiniyam 2023 legal dossiers',
  },
  'audit-trail': {
    title: 'ACTIVITY LOG (AUDIT TRAIL)',
    subtitle: 'Tamper-proof system activity log and officer access records',
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeTab }) => {
  const { currentUser, logout, trustScore, isAdaptiveRestricted } = useAuth();
  const { cases, selectedCaseId, selectedCase, setSelectedCaseId, loading } = useCaseContext();
  const { setActiveCaseId } = useAuditLog();
  const { theme, toggleTheme } = useTheme();

  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCaseSwitcher, setShowCaseSwitcher] = useState(false);
  const [caseFilterQuery, setCaseFilterQuery] = useState('');

  const caseSwitcherRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const meta = PAGE_META[activeTab] ?? PAGE_META['command-center'];

  // Digital clock updating every 1000ms (every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener for Universal Search (CMD+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (caseSwitcherRef.current && !caseSwitcherRef.current.contains(e.target as Node)) {
        setShowCaseSwitcher(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect compromise-sensitive pages (Threat Alerts & Identity Doppelgänger)
  const isSensitive = isCompromiseSensitivePage(activeTab);

  // Derived filtered reports for the active view (never mutates master dataset)
  const availableCases = useMemo<LawCase[]>(() => {
    if (isSensitive) {
      return (cases as LawCase[]).filter(isCompromisedReport);
    }
    return cases as LawCase[];
  }, [cases, isSensitive]);

  // Safe active selection reconciliation: if on a sensitive page and current case is not compromised,
  // select the first available compromised report without triggering route loops or infinite effects.
  useEffect(() => {
    if (isSensitive && availableCases.length > 0) {
      const isCurrentValid = availableCases.some((c: LawCase) => c.id === selectedCaseId);
      if (!isCurrentValid) {
        setSelectedCaseId(availableCases[0].id);
        setActiveCaseId(availableCases[0].id);
      }
    }
  }, [isSensitive, availableCases, selectedCaseId, setSelectedCaseId, setActiveCaseId]);

  // Filter cases in switcher via search query on top of available page-scoped reports
  const filteredSwitcherCases = useMemo<LawCase[]>(() => {
    if (!caseFilterQuery.trim()) return availableCases;
    const q = caseFilterQuery.toLowerCase();
    return availableCases.filter((c: LawCase) => {
      return (
        c.title?.toLowerCase().includes(q) ||
        c.fir_number?.toLowerCase().includes(q) ||
        c.jurisdiction_city?.toLowerCase().includes(q) ||
        c.crime_category?.toLowerCase().includes(q)
      );
    });
  }, [availableCases, caseFilterQuery]);

  return (
    <header className="bg-[#040814]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl flex-shrink-0 select-none shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="px-4 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Page Title & Meta Badge */}
        <div className="flex items-center gap-2.5 flex-shrink min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)] flex-shrink-0">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-white tracking-wider leading-tight truncate">
                {meta.title}
              </h1>
              <span className="text-[8px] font-mono font-bold bg-blue-950/80 text-cyan-300 px-1 py-0.2 rounded border border-blue-500/30 hidden 2xl:inline-block">
                LIVE SOC
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-tight truncate hidden sm:block">{meta.subtitle}</p>
          </div>
        </div>

        {/* ─── 1. GLOBAL ACTIVE INVESTIGATION SWITCHER ───────────────────────── */}
        <div className="relative flex-shrink-0" ref={caseSwitcherRef}>
          <button
            onClick={() => {
              setShowCaseSwitcher(!showCaseSwitcher);
              if (showProfileMenu) setShowProfileMenu(false);
              if (showNotifications) setShowNotifications(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all group ${
              isSensitive
                ? 'bg-gradient-to-r from-red-950/80 via-[#18040a] to-[#120409] border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.3)] hover:border-red-400'
                : 'bg-gradient-to-r from-[#08132e] via-[#0b1b3d] to-[#08132e] border-blue-500/50 hover:border-blue-400 shadow-[0_0_16px_rgba(37,99,235,0.25)]'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 ${
              isSensitive
                ? 'bg-red-900/40 border-red-500/50 text-red-300'
                : 'bg-blue-600/30 border-blue-400/50 text-blue-300'
            }`}>
              <FolderKanban className="w-3.5 h-3.5 text-cyan-300" />
            </div>

            <div className="flex flex-col min-w-0 pr-1 max-w-[130px] sm:max-w-[170px] lg:max-w-[210px]">
              <div className="flex items-center gap-1.5">
                <span className={`text-[8.5px] font-extrabold uppercase tracking-wider ${
                  isSensitive ? 'text-red-300' : 'text-blue-300'
                }`}>
                  {isSensitive ? 'Threat Queue' : 'Active Case'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isSensitive ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                }`} />
              </div>
              <div className="text-[11px] font-mono font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
                {selectedCase ? (
                  <>
                    <span className="text-cyan-300 mr-1 font-black">{selectedCase.fir_number || selectedCase.id}</span>
                    <span className="text-slate-200 font-sans font-semibold hidden md:inline">{selectedCase.title}</span>
                  </>
                ) : (
                  'Select Investigation'
                )}
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
              isSensitive ? 'text-red-400' : 'text-blue-400'
            } ${showCaseSwitcher ? 'rotate-180 text-cyan-300' : 'group-hover:translate-y-0.5'}`} />
          </button>

          {/* Case Switcher Dropdown */}
          {showCaseSwitcher && (
            <div className={`absolute left-0 top-full mt-2 w-88 sm:w-96 bg-[#061026] border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-[1100] overflow-hidden flex flex-col max-h-[520px] backdrop-blur-2xl ${
              isSensitive ? 'border-red-500/60' : 'border-blue-500/60'
            }`}>
              {/* Dropdown Header */}
              <div className="p-3.5 border-b border-slate-800/90 bg-gradient-to-r from-[#06122e] to-[#040c20] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-white flex items-center gap-2">
                    <FolderKanban className={`w-4 h-4 ${isSensitive ? 'text-red-400' : 'text-blue-400'}`} />
                    <span>
                      {isSensitive ? 'Compromised Threat Queue' : 'Authorized Investigations'} ({availableCases.length})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Logged Officer: <strong className="text-blue-300">{currentUser.name}</strong>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${
                  isSensitive
                    ? 'text-red-300 bg-red-950/80 border-red-500/40'
                    : 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40'
                }`}>
                  {isSensitive ? 'COMPROMISED ONLY' : currentUser.role}
                </span>
              </div>

              {/* Search Filter */}
              <div className="p-2.5 border-b border-slate-800/90 bg-[#030918]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={caseFilterQuery}
                    onChange={(e) => setCaseFilterQuery(e.target.value)}
                    placeholder={
                      isSensitive
                        ? 'Search compromised reports by FIR, Suspect...'
                        : 'Search by FIR, Title, City or Category...'
                    }
                    className="w-full bg-[#061026] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 font-sans"
                    autoFocus
                  />
                </div>
              </div>

              {/* Case Items List */}
              <div className="divide-y divide-slate-800/60 overflow-y-auto flex-1 p-1.5 space-y-1">
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Querying PostgreSQL Case Registry...</span>
                  </div>
                ) : filteredSwitcherCases.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {isSensitive
                      ? 'No compromised threat investigations matched query.'
                      : 'No authorized investigations matched query.'}
                  </div>
                ) : (
                  filteredSwitcherCases.map((c: LawCase) => {
                    const isSelected = c.id === selectedCaseId;
                    const isCompromised = isCompromisedReport(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setActiveCaseId(c.id);
                          setShowCaseSwitcher(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? isCompromised || isSensitive
                              ? 'bg-red-950/90 border border-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]'
                              : 'bg-blue-950/90 border border-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                            : isCompromised
                            ? 'bg-gradient-to-r from-red-950/40 via-red-950/20 to-slate-900/90 hover:bg-red-950/60 border border-red-500/40 hover:border-red-400 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                            : 'hover:bg-slate-900/90 text-slate-300 border border-transparent hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              {c.fir_number || (c as any).firNumber || c.id}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                c.priority === 'CRITICAL' || isCompromisedReport(c)
                                  ? 'bg-red-950/90 text-red-300 border border-red-600/60'
                                  : 'bg-amber-950/90 text-amber-300 border border-amber-600/60'
                              }`}
                            >
                              {isCompromisedReport(c) ? 'COMPROMISED' : c.priority}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white truncate">{c.title || (c as any).suspectName}</div>

                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {c.jurisdiction_city || (c as any).location || 'National Scope'}
                            </span>
                            <span>•</span>
                            <span className="text-blue-300 font-medium">{c.status}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full text-white shrink-0 shadow-md ${
                            isSensitive ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── 2. UNIVERSAL SEARCH (CMD + K / CTRL + K) ─────────────────────────────────── */}
        <div className="flex-1 max-w-xs hidden 2xl:block">
          <button
            onClick={onOpenSearch}
            className="w-full h-8 bg-[#070e1c] border border-slate-700/60 rounded-xl px-3 flex items-center justify-between text-xs text-slate-400 hover:border-cyan-500/60 hover:text-slate-200 transition-all group shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <span className="truncate text-[11px]">Universal Search...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-800/90 border border-slate-700 rounded-md text-slate-300 shadow-sm flex-shrink-0 ml-1.5">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ─── 3. SECURITY META, LIVE CLOCK & OFFICER PROFILE ────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live Trust Score Badge */}
          <div
            className={`hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all shadow-sm ${
              isAdaptiveRestricted
                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : trustScore < 80
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
            }`}
            title={`Session Trust Score: ${trustScore}/100 • Evaluated via Behavioral Biometrics`}
          >
            {isAdaptiveRestricted ? (
              <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0 animate-bounce" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            )}
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                TRUST
              </span>
              <span className={`text-[10px] font-black ${isAdaptiveRestricted ? 'text-red-300' : 'text-white'}`}>
                {trustScore}
              </span>
            </div>
          </div>

          {/* Current Date & Live Clock */}
          <div className="hidden 2xl:flex flex-col items-end text-right border-l border-slate-800/80 pl-2">
            <div className="text-[11px] font-mono font-black text-slate-100 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{timeStr || '00:00:00'}</span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium">{dateStr || '2026'}</div>
          </div>

          {/* PROMINENT THEME SWITCHER BUTTON */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`relative px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400 hover:border-blue-600 text-blue-900 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]'
            }`}
            title={theme === 'dark' ? 'Click to switch to Light Theme' : 'Click to switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-[10.5px] font-black font-mono tracking-wider">LIGHT ☀️</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-[10.5px] font-black font-mono tracking-wider">DARK 🌙</span>
              </>
            )}
          </button>

          {/* Notifications Bell Icon with live alert badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showProfileMenu) setShowProfileMenu(false);
                if (showCaseSwitcher) setShowCaseSwitcher(false);
              }}
              className="relative p-2 rounded-xl bg-[#081122] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#040814] shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse">
                7
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#061026] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3.5 backdrop-blur-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" /> SOC Notifications (7)
                  </span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-xs">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs">
                    <div className="flex items-center justify-between text-red-400 font-bold">
                      <span>Critical Honeypot Hit</span>
                      <span className="text-[9px] font-mono">Just now</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">FIR_999_HONEY.pdf accessed without token authorization.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span>Unusual Login Alert</span>
                      <span className="text-[9px] font-mono">2m ago</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">New IP login detected from external subnet for ACP Raj Verma.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                    <div className="flex items-center justify-between text-blue-400 font-bold">
                      <span>Merkle Root Anchored</span>
                      <span className="text-[9px] font-mono">14m ago</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">Evidence Block #19,402 committed to BSA 2023 Ledger.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Officer Persona Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                if (showNotifications) setShowNotifications(false);
                if (showCaseSwitcher) setShowCaseSwitcher(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-[#081122] border border-slate-800 hover:border-slate-700 transition-all text-left group"
            >
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {currentUser.badge_number || currentUser.role}
                </span>
              </div>

              <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/40 relative shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                    <User className="w-4 h-4 text-blue-300" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#040814]" />
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#061026] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3 backdrop-blur-2xl">
                <div className="pb-3 border-b border-slate-800 space-y-1">
                  <div className="text-xs font-black text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-cyan-300 font-mono">{currentUser.email}</div>
                  <div className="text-[10px] text-slate-400">{currentUser.department}</div>
                </div>

                <div className="py-2 text-xs space-y-1 text-slate-300">
                  <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 text-[10px]">Clearance</span>
                    <span className="font-mono text-emerald-400 text-[10px] font-bold">LEVEL 5 TOP SECRET</span>
                  </div>
                  <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 text-[10px]">Officer ID</span>
                    <span className="font-mono text-blue-300 text-[10px] font-bold">{currentUser.badge_number || 'USR-101'}</span>
                  </div>
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <span className="text-slate-400 text-[10px] flex items-center gap-1.5">
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                      Appearance Theme
                    </span>
                    <span className="font-mono text-cyan-300 text-[10px] font-bold uppercase">
                      {theme} mode
                    </span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Secure Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
