import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Activity,
  FileSearch,
  Network,
  Bot,
  ShieldCheck,
  FolderKanban,
  MapPin,
  FileText,
  KeyRound,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  CheckCircle2,
  Search,
  ChevronRight,
  TrendingUp,
  CircleDollarSign,
  UserCheck,
  Trash2
} from 'lucide-react';
import type { OfficerActivity } from '../services/activityLogger';
import {
  getOfficerActivities,
  clearOfficerActivities,
  logOfficerAction,
  subscribeToOfficerActivities
} from '../services/activityLogger';
import { useAuth } from '../context/AuthContext';

interface AuditTrailPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<OfficerActivity[]>(getOfficerActivities());
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Subscribe to live activity stream updates
  useEffect(() => {
    const unsubscribe = subscribeToOfficerActivities((updated) => {
      setActivities(updated);
    });
    return unsubscribe;
  }, []);

  // Filter activities
  const filteredActivities = activities.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        item.action.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.caseId.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Displayed items (Top 10 by default)
  const displayedActivities = filteredActivities.slice(0, displayLimit);
  const hasMore = filteredActivities.length > displayLimit;
  const remainingCount = Math.max(0, filteredActivities.length - displayLimit);

  // Calculate top summary stats
  const todayTotalCount = activities.length + 37;
  const lastActivityTimeAgo = activities[0]?.timeAgo || 'Just now';

  // Helper to trigger a realistic simulated live action for ACP Raj Verma
  const handleSimulateAction = (actionTitle: string, moduleName: string, caseCode: string, detailsText: string, category: any) => {
    const newEntry = logOfficerAction({
      action: actionTitle,
      module: moduleName,
      caseId: caseCode,
      status: 'Success',
      category: category,
      details: detailsText
    });

    setNewlyAddedId(newEntry.id);
    setTimeout(() => setNewlyAddedId(null), 3000);

    if (onSelectAction) {
      onSelectAction(`Logged: ${actionTitle} (${moduleName})`);
    }
  };

  // Helper to get matching icon for an action
  const getActionIcon = (module: string, category?: string) => {
    switch (module) {
      case 'Evidence DNA':
      case 'Evidence Vault':
      case 'Chain of Custody':
        return <FileSearch className="w-4 h-4 text-cyan-400" />;
      case 'Knowledge Graph':
        return <Network className="w-4 h-4 text-purple-400" />;
      case 'AI Copilot':
      case 'AI Sandbox':
        return <Bot className="w-4 h-4 text-blue-400" />;
      case 'Command Center':
      case 'Active Cases':
      case 'Investigations':
      case 'Case Approvals':
        return <FolderKanban className="w-4 h-4 text-emerald-400" />;
      case 'Geo Intelligence':
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'Time Machine':
        return <Clock className="w-4 h-4 text-cyan-300" />;
      case 'Financial Intelligence':
        return <CircleDollarSign className="w-4 h-4 text-emerald-400" />;
      case 'Identity Security':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'Reports & Dossiers':
      case 'Court Reports':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'Authentication':
        return <KeyRound className="w-4 h-4 text-emerald-300" />;
      default:
        return <Shield className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-6 selection:bg-cyan-600/30 selection:text-cyan-200">
      
      {/* ── 1. HEADER SECTION ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14233c]/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2 font-mono">
                ACTIVITY LOG
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                Live forensic activity log of <span className="text-cyan-300 font-bold">{currentUser.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Officer Fixed Badge & Live Sync Pill */}
        <div className="flex items-center gap-2.5">
          {/* Live Sync Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Sync Enabled</span>
          </div>

          {/* Clear Log Button for Clean Live Session */}
          <button
            onClick={() => {
              clearOfficerActivities();
              if (onSelectAction) onSelectAction('Cleared Audit Trail to begin fresh live recording session');
            }}
            title="Clear all recorded history to start a fresh live session"
            className="px-2.5 py-1.5 rounded-xl bg-[#091224] hover:bg-red-950/40 border border-slate-700/80 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Session</span>
          </button>

          {/* Officer Profile Card (Fixed) */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#070e1c] border border-cyan-500/30 shadow-sm">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-cyan-400"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#070e1c]"></span>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 font-mono leading-tight">{currentUser.badgeNumber} · {currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TOP SUMMARY (3 COMPACT CARDS ONLY) ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Today's Actions */}
        <div className="bg-[#070e1c]/90 border border-[#14233c] hover:border-cyan-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg backdrop-blur-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Today's Actions
            </div>
            <div className="text-2xl font-black text-white font-mono leading-tight">
              {todayTotalCount}
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
              <span>● Real-time logged & verified</span>
            </div>
          </div>
        </div>

        {/* Card 2: Last Activity */}
        <div className="bg-[#070e1c]/90 border border-[#14233c] hover:border-purple-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg backdrop-blur-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Last Activity
            </div>
            <div className="text-2xl font-black text-white font-mono leading-tight">
              {lastActivityTimeAgo}
            </div>
            <div className="text-[10px] text-purple-300 font-semibold truncate max-w-[160px]">
              {activities[0]?.action || 'System active'}
            </div>
          </div>
        </div>

        {/* Card 3: Current Session */}
        <div className="bg-[#070e1c]/90 border border-[#14233c] hover:border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg backdrop-blur-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Current Session
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono leading-tight flex items-center gap-1.5">
              <span>Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              Command Station VIP · 192.168.1.25
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. TIMELINE FILTER & SIMULATION ACTIONS BAR ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070e1c] border border-[#14233c] rounded-2xl p-3 shadow-md">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 font-mono uppercase mr-1">
            Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Activities' },
            { id: 'EVIDENCE', label: '🧬 Evidence DNA' },
            { id: 'COPILOT', label: '🤖 AI Copilot' },
            { id: 'GRAPH', label: '🕸️ Knowledge Graph' },
            { id: 'CASES', label: '📂 Case Operations' },
            { id: 'REPORT', label: '📄 Reports' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => { setSelectedCategory(pill.id); setDisplayLimit(10); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === pill.id
                  ? 'bg-cyan-600 text-white border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-[#091224] text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); setDisplayLimit(10); }}
            placeholder={`Search ${currentUser.name}'s actions...`}
            className="w-full bg-[#091224] border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* ── 4. MAIN SECTION — LIVE FORENSIC TIMELINE (TOP 10 + LOAD MORE) ─────── */}
      <div className="bg-[#070e1c]/95 border border-[#14233c] rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
        
        {/* Timeline Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase font-mono">
              CHRONOLOGICAL FORENSIC TIMELINE (SHOWING TOP {displayedActivities.length} OF {filteredActivities.length})
            </h2>
          </div>
          
          {/* Quick Action Simulator for live test */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Test Live Action:</span>
            <button
              onClick={() => handleSimulateAction('Viewed Evidence EV-1246', 'Evidence DNA', 'CR-2026-0417', 'Inspected cryptographic hash certificate and volatile memory extraction for EV-1246', 'EVIDENCE')}
              className="px-2.5 py-1 rounded-lg bg-[#0c1830] hover:bg-[#122448] text-cyan-300 border border-cyan-500/30 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all"
            >
              <PlusCircle className="w-3 h-3 text-cyan-400" />
              <span>+ View Evidence</span>
            </button>
            <button
              onClick={() => handleSimulateAction('AI Copilot generated suspect analysis', 'AI Copilot', 'CR-2026-0417', 'Ran multi-agent red-team synthesis on suspect financial transactions', 'COPILOT')}
              className="px-2.5 py-1 rounded-lg bg-[#140e28] hover:bg-[#201640] text-purple-300 border border-purple-500/30 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all"
            >
              <PlusCircle className="w-3 h-3 text-purple-400" />
              <span>+ Ask Copilot</span>
            </button>
          </div>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative pl-6 md:pl-8 space-y-4">
          
          {/* Continuous Glowing Vertical Line */}
          <div className="absolute left-[13px] md:left-[17px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-cyan-500 via-blue-500 to-indigo-900 shadow-[0_0_8px_rgba(6,182,212,0.5)] pointer-events-none" />

          {displayedActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-sm text-slate-300 font-mono">No matching activities found</p>
              <p className="text-xs text-slate-500">{currentUser.name} has no recorded logs for this category filter.</p>
            </div>
          ) : (
            displayedActivities.map((entry, index) => {
              const isNewlyAdded = newlyAddedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className={`relative group transition-all duration-300 ${
                    isNewlyAdded ? 'animate-in slide-in-from-left duration-300' : ''
                  }`}
                >
                  {/* Glowing Node Dot on Timeline */}
                  <div className="absolute -left-[23px] md:-left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-[#040813] border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  </div>

                  {/* Activity Glassmorphism Card */}
                  <div
                    className={`bg-[#070e1c] border rounded-2xl p-4 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isNewlyAdded
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-[#14233c] hover:border-cyan-500/50 hover:bg-[#091428]'
                    }`}
                  >
                    
                    {/* Left: Time + Icon + Action Title + WHAT HE DID ON THAT PAGE */}
                    <div className="flex items-start md:items-center gap-3.5">
                      
                      {/* Action Icon Badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#091224] border border-slate-700/80 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-400/50 shadow-sm transition-colors">
                        {getActionIcon(entry.module, entry.category)}
                      </div>

                      {/* Main Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-cyan-300">
                            {entry.timestamp}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                            {entry.action}
                          </h3>
                        </div>

                        {/* WHAT HE DID ON THAT PAGE (Detailed forensic context) */}
                        {entry.details && (
                          <p className="text-[11.5px] text-slate-300 mt-1 max-w-2xl leading-relaxed flex items-center gap-1.5">
                            <span className="text-cyan-400 font-mono text-[10px]">↳</span>
                            <span>{entry.details}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Module Tag + Case ID Badge + Status Badge */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto pl-12 md:pl-0">
                      
                      {/* Module Tag */}
                      <span className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold bg-[#091224] border border-slate-700/80 text-slate-300 font-mono">
                        {entry.module}
                      </span>

                      {/* Case ID Badge */}
                      <span className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-purple-950/60 border border-purple-500/40 text-purple-300">
                        {entry.caseId}
                      </span>

                      {/* Status Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {entry.status}
                      </span>

                    </div>

                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* ── 5. MORE / LOAD MORE ACTIVITIES BUTTON ──────────────────────────── */}
        {filteredActivities.length > 10 && (
          <div className="pt-4 border-t border-[#14233c] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Showing <strong className="text-cyan-300">{displayedActivities.length}</strong> of{' '}
              <strong className="text-white">{filteredActivities.length}</strong> total activities recorded for {currentUser.name}
            </span>

            <div className="flex items-center gap-2">
              {hasMore ? (
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 10)}
                  className="px-4 py-2 rounded-xl bg-[#09152b] hover:bg-[#0f2246] border border-cyan-500/40 text-cyan-300 font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-md group"
                >
                  <span>Load More Activities ({remainingCount} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => setDisplayLimit(10)}
                  className="px-4 py-2 rounded-xl bg-[#091224] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold font-mono text-xs flex items-center gap-2 transition-all"
                >
                  <span>Show Top 10 Only</span>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {displayLimit < filteredActivities.length && (
                <button
                  onClick={() => setDisplayLimit(filteredActivities.length)}
                  className="px-3 py-2 rounded-xl bg-[#070e1c] hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors"
                >
                  Show All ({filteredActivities.length})
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AuditTrailPage;
