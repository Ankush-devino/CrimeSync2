import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Search, 
  ChevronDown, 
  Lock, 
  Command,
  UserCheck,
  Plus,
  Share2,
  FileDown,
  MoreVertical,
  X,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAlerts?: () => void;
  activeTab: string;
}

const PAGE_META: Record<string, { title: string; subtitle: string; showActionBar: boolean }> = {
  'command-center': {
    title: 'COMMAND CENTER',
    subtitle: 'Live operational overview of all active investigations and threats',
    showActionBar: false,
  },
  'investigations': {
    title: 'INVESTIGATIONS / CASE DASHBOARD',
    subtitle: 'Track, analyze and manage criminal investigations',
    showActionBar: true,
  },
  'ai-copilot': {
    title: 'AI COPILOT',
    subtitle: 'Intelligent assistant for case analysis and hypothesis generation',
    showActionBar: false,
  },
  'knowledge-graph': {
    title: 'KNOWLEDGE GRAPH',
    subtitle: 'Visualize entity networks, relationships and connections',
    showActionBar: false,
  },
  'time-machine': {
    title: 'TIME MACHINE',
    subtitle: 'Visualize how the investigation evolved over time',
    showActionBar: false,
  },
  'geo-intelligence': {
    title: 'GEO INTELLIGENCE',
    subtitle: 'Satellite mapping, movement tracking and geo-spatial analysis',
    showActionBar: false,
  },
  'financial-intelligence': {
    title: 'FINANCIAL INTELLIGENCE',
    subtitle: 'Money flow analysis, hawala tracking and transaction mapping',
    showActionBar: false,
  },
  'identity-security': {
    title: 'IDENTITY SECURITY',
    subtitle: 'Doppelgänger detection, ID fraud and biometric verification',
    showActionBar: false,
  },
  'attack-graph': {
    title: 'ATTACK GRAPH',
    subtitle: 'Intrusion analysis, attack vector mapping and kill-chain visualization',
    showActionBar: false,
  },
  'deception-network': {
    title: 'DECEPTION NETWORK',
    subtitle: 'Honey evidence deployment, canary file triggers and bait monitoring',
    showActionBar: false,
  },
  'blast-radius': {
    title: 'BLAST RADIUS SIMULATOR',
    subtitle: 'Impact simulation and compromise propagation analysis',
    showActionBar: false,
  },
  'ai-sandbox': {
    title: 'AI AGENT SANDBOX',
    subtitle: 'Isolated environments for training and testing autonomous AI agents',
    showActionBar: false,
  },
  'threat-alerts': {
    title: 'THREAT ALERTS',
    subtitle: 'Real-time threat monitoring, anomaly detection and alert management',
    showActionBar: false,
  },
  'evidence-dna': {
    title: 'EVIDENCE DNA',
    subtitle: 'Cryptographic integrity verification and blockchain-sealed evidence',
    showActionBar: false,
  },
  'chain-of-custody': {
    title: 'CHAIN OF CUSTODY',
    subtitle: 'Immutable access records and tamper-proof custody logs',
    showActionBar: false,
  },
  'blockchain-explorer': {
    title: 'BLOCKCHAIN EXPLORER',
    subtitle: 'Public ledger browser for sealed evidence hashes and transactions',
    showActionBar: false,
  },
  'reports': {
    title: 'REPORTS & DOSSIERS',
    subtitle: 'Generate PDF intelligence reports, suspect dossiers and case summaries',
    showActionBar: false,
  },
  'audit-trail': {
    title: 'AUDIT TRAIL',
    subtitle: 'Full system activity log — who accessed what, when and where',
    showActionBar: false,
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAlerts, activeTab }) => {
  const [timeStr, setTimeStr] = useState('10:42 PM');
  const [dateStr, setDateStr] = useState('27 Aug 2026');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const meta = PAGE_META[activeTab] ?? PAGE_META['command-center'];

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

  return (
    <header className="bg-[#060a14]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md flex-shrink-0">
      {/* Main Header Row */}
      <div className="px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Page Title & Subtitle (shown when not ai-copilot) */}
        {activeTab !== 'ai-copilot' && (
          <div className="flex-shrink-0 max-w-xs">
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">{meta.title}</h1>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{meta.subtitle}</p>
          </div>
        )}

        {/* Center/Left: Global Search Bar */}
        <div className={`flex-1 ${activeTab === 'ai-copilot' ? 'max-w-xl' : 'max-w-xl'}`}>
          <button
            onClick={onOpenSearch}
            className="w-full h-9 bg-[#0b1220] border border-slate-700/60 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400 hover:border-cyan-500/50 hover:text-slate-200 transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span>Search people, phones, vehicles, locations, cases, evidence...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800/80 border border-slate-700 rounded text-slate-400">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Status & Profile */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* System Shield */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] text-emerald-500/80 font-normal">System Shield</span>
              <span className="text-[11px] font-semibold text-emerald-400">Active</span>
            </div>
          </div>

          {/* Trust Score circular meter */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0b1220] border border-slate-800 text-xs">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 -rotate-90">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-slate-800" />
                <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2.5" fill="none" strokeDasharray="62.8" strokeDashoffset="11.3" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[9px] font-bold text-emerald-400">82</span>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] text-slate-400">Trust Score</span>
              <span className="text-[11px] font-bold text-emerald-400">82 <span className="text-[9px] font-normal text-slate-500">/ 100</span></span>
            </div>
          </div>

          {/* Session Risk */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0b1220] border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-[10px] text-slate-400">Session Risk:</span>
            <span className="text-[11px] font-medium text-emerald-400">Low</span>
          </div>

          {/* Digital Time & Date */}
          <div className="hidden sm:flex flex-col items-end text-right border-l border-slate-800/80 pl-3">
            <div className="text-xs font-mono font-bold text-slate-200 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              {timeStr}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
          </div>

          {/* Notifications Icon with red badge */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (showProfileMenu) setShowProfileMenu(false); }}
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
                  <div className="p-2 rounded bg-slate-800/60 border border-slate-700/40 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>Blockchain Block #92184</span>
                      <span className="text-[9px]">10:02 PM</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">14 new digital evidence hashes sealed permanently.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); if (showNotifications) setShowNotifications(false); }}
              className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="ACP Raj Verma"
                  className="w-7 h-7 rounded-full object-cover border border-cyan-500/50"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0b1220]"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 leading-tight">ACP Raj Verma</span>
                <span className="text-[10px] text-slate-400 leading-tight">Delhi Police</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0d1527] border border-slate-700/80 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1.5 border-b border-slate-800">
                  <p className="font-bold text-white">ACP Raj Verma</p>
                  <p className="text-[10px] text-slate-400 font-mono">Badge: DEL-CYB-8819</p>
                  <p className="text-[10px] text-cyan-400">Security Clearance: LEVEL 5 (TOP SECRET)</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Police Dossier
                  </button>
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-400" /> PKI Smart Card & MFA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investigations action bar (only shows for Investigations page) */}
      {meta.showActionBar && (
        <div className="px-4 h-10 flex items-center justify-end gap-2 border-t border-slate-800/50 bg-[#04080f]/60">
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold shadow-[0_0_12px_rgba(124,58,237,0.35)] transition-all">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Evidence</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1220] hover:bg-[#0e1a30] border border-slate-700/60 text-slate-200 text-xs font-medium transition-all">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share Case</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1220] hover:bg-[#0e1a30] border border-slate-700/60 text-slate-200 text-xs font-medium transition-all">
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Generate Report</span>
          </button>
          <button className="p-1 rounded-md bg-[#0b1220] hover:bg-[#0e1a30] border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-all" title="More options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
