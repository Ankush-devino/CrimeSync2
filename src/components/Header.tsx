import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Search, 
  ChevronDown, 
  Lock, 
  UserCheck, 
  X,
  FolderKanban,
  Check,
  LogOut,
  Sparkles,
  RefreshCw,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCaseContext } from '../context/CaseContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts?: () => void;
  activeTab: string;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  'command-center': {
    title: 'COMMAND CENTER',
    subtitle: 'Live operational overview of all active investigations and threats',
  },
  'investigations': {
    title: 'INVESTIGATIONS / CASE DASHBOARD',
    subtitle: 'Track, analyze and manage criminal investigations',
  },
  'ai-copilot': {
    title: 'AI COPILOT',
    subtitle: 'Intelligent assistant for case analysis and hypothesis generation',
  },
  'knowledge-graph': {
    title: 'KNOWLEDGE GRAPH',
    subtitle: 'Visualize entity networks, relationships and connections',
  },
  'time-machine': {
    title: 'TIME MACHINE',
    subtitle: 'Visualize how the investigation evolved over time',
  },
  'geo-intelligence': {
    title: 'GEO INTELLIGENCE',
    subtitle: 'Satellite mapping, movement tracking and geo-spatial analysis',
  },
  'financial-intelligence': {
    title: 'FINANCIAL INTELLIGENCE',
    subtitle: 'Money flow analysis, hawala tracking and transaction mapping',
  },
  'identity-security': {
    title: 'IDENTITY SECURITY',
    subtitle: 'Doppelgänger detection, ID fraud and biometric verification',
  },
  'attack-graph': {
    title: 'ATTACK GRAPH',
    subtitle: 'Intrusion analysis, attack vector mapping and kill-chain visualization',
  },
  'deception-network': {
    title: 'DECEPTION NETWORK',
    subtitle: 'Honey evidence deployment, canary file triggers and bait monitoring',
  },
  'blast-radius': {
    title: 'BLAST RADIUS SIMULATOR',
    subtitle: 'Impact simulation and compromise propagation analysis',
  },
  'ai-sandbox': {
    title: 'AI AGENT SANDBOX',
    subtitle: 'Isolated environments for training and testing autonomous AI agents',
  },
  'threat-alerts': {
    title: 'THREAT ALERTS',
    subtitle: 'Real-time threat monitoring, anomaly detection and alert management',
  },
  'evidence-dna': {
    title: 'EVIDENCE DNA',
    subtitle: 'Cryptographic integrity verification and blockchain-sealed evidence',
  },
  'chain-of-custody': {
    title: 'CHAIN OF CUSTODY',
    subtitle: 'Immutable access records and tamper-proof custody logs',
  },
  'blockchain-explorer': {
    title: 'BLOCKCHAIN EXPLORER',
    subtitle: 'Public ledger browser for sealed evidence hashes and transactions',
  },
  'reports': {
    title: 'REPORTS & DOSSIERS',
    subtitle: 'Generate PDF intelligence reports, suspect dossiers and case summaries',
  },
  'audit-trail': {
    title: 'AUDIT TRAIL',
    subtitle: 'Full system activity log — who accessed what, when and where',
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeTab }) => {
  const { currentUser, logout, permissions } = useAuth();
  const { cases, selectedCaseId, selectedCase, setSelectedCaseId, loading } = useCaseContext();

  const [timeStr, setTimeStr] = useState('10:42 PM');
  const [dateStr, setDateStr] = useState('27 Aug 2026');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCaseSwitcher, setShowCaseSwitcher] = useState(false);
  const [caseFilterQuery, setCaseFilterQuery] = useState('');

  const caseSwitcherRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const meta = PAGE_META[activeTab] ?? PAGE_META['command-center'];

  // Digital clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

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

  // Filter cases in switcher
  const filteredSwitcherCases = cases.filter((c) => {
    if (!caseFilterQuery.trim()) return true;
    const q = caseFilterQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.fir_number?.toLowerCase().includes(q) ||
      c.jurisdiction_city?.toLowerCase().includes(q)
    );
  });

  return (
    <header className="bg-[#040814]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md flex-shrink-0">
      {/* Main Header Row */}
      <div className="px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Page Title & Subtitle */}
        {activeTab !== 'ai-copilot' && (
          <div className="flex-shrink-0 max-w-[200px] xl:max-w-xs hidden md:block">
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide leading-tight truncate">
              {meta.title}
            </h1>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{meta.subtitle}</p>
          </div>
        )}

        {/* ─── GLOBAL ACTIVE CASE SWITCHER (TOP BAR SELECTOR) ─────────── */}
        <div className="relative" ref={caseSwitcherRef}>
          <button
            onClick={() => {
              setShowCaseSwitcher(!showCaseSwitcher);
              if (showProfileMenu) setShowProfileMenu(false);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#08132e] border border-blue-500/40 hover:border-blue-400 text-left transition-all shadow-[0_0_12px_rgba(37,99,235,0.2)] group"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>

            <div className="flex flex-col min-w-0 pr-1 max-w-[170px] sm:max-w-[240px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">
                  Active Investigation
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-mono font-bold text-white truncate group-hover:text-blue-200">
                {selectedCase ? (
                  <>
                    <span className="text-cyan-300 mr-1.5">{selectedCase.fir_number}</span>
                    <span className="text-slate-200 font-sans">{selectedCase.title}</span>
                  </>
                ) : (
                  'No Case Selected'
                )}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-blue-400 ml-1 transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* Case Switcher Dropdown */}
          {showCaseSwitcher && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#061026] border border-blue-500/50 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
              {/* Dropdown Header */}
              <div className="p-3 border-b border-slate-800 bg-[#040c20] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-white flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-blue-400" />
                    <span>Authorized Active Cases ({cases.length})</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Scoped to role: <strong className="text-blue-300">{currentUser.roleTitle}</strong>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  {currentUser.role}
                </span>
              </div>

              {/* Search Filter */}
              <div className="p-2 border-b border-slate-800 bg-[#030918]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={caseFilterQuery}
                    onChange={(e) => setCaseFilterQuery(e.target.value)}
                    placeholder="Search authorized cases..."
                    className="w-full bg-[#061026] border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-sans"
                  />
                </div>
              </div>

              {/* Case Items List */}
              <div className="divide-y divide-slate-800/80 overflow-y-auto flex-1 p-1">
                {loading ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Loading cases...</span>
                  </div>
                ) : filteredSwitcherCases.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No authorized cases match query.
                  </div>
                ) : (
                  filteredSwitcherCases.map((c) => {
                    const isSelected = c.id === selectedCaseId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setShowCaseSwitcher(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-950/90 border border-blue-500 text-white'
                            : 'hover:bg-slate-900/90 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              {c.fir_number}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                c.priority === 'CRITICAL'
                                  ? 'bg-red-950 text-red-300 border border-red-600/60'
                                  : 'bg-amber-950 text-amber-300 border border-amber-600/60'
                              }`}
                            >
                              {c.priority}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white truncate">{c.title}</div>

                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {c.jurisdiction_city}
                            </span>
                            <span>•</span>
                            <span className="text-blue-300">{c.status}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white">
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

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden lg:block">
          <button
            onClick={onOpenSearch}
            className="w-full h-9 bg-[#0b1220] border border-slate-700/60 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400 hover:border-cyan-500/50 hover:text-slate-200 transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span>Search people, phones, cases, evidence...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800/80 border border-slate-700 rounded text-slate-400">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Security Meters, Time, Persona Dropdown */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* System Shield */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] text-emerald-500/80 font-normal">System Shield</span>
              <span className="text-[11px] font-semibold text-emerald-400">Active</span>
            </div>
          </div>

          {/* Digital Clock */}
          <div className="hidden sm:flex flex-col items-end text-right border-l border-slate-800/80 pl-2.5">
            <div className="text-xs font-mono font-bold text-slate-200 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {timeStr}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
          </div>

          {/* Notifications Icon with red badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showProfileMenu) setShowProfileMenu(false);
                if (showCaseSwitcher) setShowCaseSwitcher(false);
              }}
              className="relative p-2 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#060a14] shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                7
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0d1527] border border-slate-700/80 rounded-xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" /> Notifications (7)
                  </span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-xs">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-xs">
                    <div className="flex items-center justify-between text-red-400 font-semibold">
                      <span>Critical Alert: Honeypot Hit</span>
                      <span className="text-[9px]">10:21 PM</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">FIR_999_HONEY.pdf accessed without decryption token.</p>
                  </div>
                  <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs">
                    <div className="flex items-center justify-between text-cyan-400 font-semibold">
                      <span>AI Copilot Hypothesis</span>
                      <span className="text-[9px]">10:14 PM</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">Aman Khan central node connection updated with 92% confidence.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── OFFICER PROFILE & DEMO PERSONA SWITCHER ─────────────── */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                if (showNotifications) setShowNotifications(false);
                if (showCaseSwitcher) setShowCaseSwitcher(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-[#0b1220] border border-slate-700/80 hover:border-cyan-500/60 transition-all group"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-cyan-500/60 group-hover:border-cyan-400"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0b1220]" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight font-mono">
                  {currentUser.role} • {currentUser.badgeNumber}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform group-hover:translate-y-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#061026] border border-slate-700 rounded-xl shadow-2xl z-50 p-3 text-xs space-y-3">
                {/* Active Officer Header */}
                <div className="p-2.5 rounded-lg bg-[#030918] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">{currentUser.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/50">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-semibold">{currentUser.roleTitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Badge: {currentUser.badgeNumber}</p>
                  <p className="text-[10px] text-slate-400 font-sans">{currentUser.department}</p>
                  <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-cyan-300 font-mono flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span>Clearance: {currentUser.clearanceLevel}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">NIC Gateway: Active</span>
                  </div>
                </div>

                {/* Secure Session Meta */}
                <div className="p-2 rounded-lg bg-[#030818] border border-slate-800 space-y-1 text-[10.5px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jurisdiction Command:</span>
                    <span className="font-bold text-white">{currentUser.jurisdiction}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Authorized FIRs:</span>
                    <span className="font-mono text-cyan-300 font-bold">{cases.length} Live Dockets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cryptographic Seal:</span>
                    <span className="font-mono text-emerald-400 font-bold">JWT HMAC-SHA256</span>
                  </div>
                </div>

                {/* Lock Terminal / Logout Button */}
                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-600/50 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lock Terminal & Sign Out</span>
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
