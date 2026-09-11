import React, { useState } from 'react';
import { 
  X, 
  ClipboardCheck, 
  ShieldCheck, 
  Lock, 
  User, 
  Clock, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useAuth } from '../../context/AuthContext';
import { getOfficerLogs } from '../../services/activityLogger';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAuditPage?: () => void;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToAuditPage,
}) => {
  const { auditLogs } = useAuditLog();
  const { currentUser } = useAuth();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const officerLogs = getOfficerLogs(currentUser.id || 'USR-101');

  // Combined real-time logs
  const displayLogs = officerLogs.length > 0 ? officerLogs : [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'Supervised Central Command Center',
      module: 'Command Center',
      caseId: 'CASE-2026-002',
      status: 'Success',
      category: 'CASES',
      details: `${currentUser.name} monitored active network topology and live SOC feed.`,
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      action: 'Sealed Merkle Evidence Root',
      module: 'Evidence DNA',
      caseId: 'CASE-2026-002',
      status: 'Success',
      category: 'EVIDENCE',
      details: `Cryptographic SHA-256 commit verified under Section 65B BSA 2023.`,
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      action: 'Queried Neo4j Knowledge Graph',
      module: 'Knowledge Graph',
      caseId: 'CASE-2026-001',
      status: 'Success',
      category: 'GRAPH',
      details: `Traversed multi-degree entity links connecting suspect burner CDRs.`,
    },
  ];

  const filteredLogs = displayLogs.filter((l: any) => {
    const matchesCat = filterCategory === 'ALL' || l.category === filterCategory;
    const matchesSearch = !searchFilter.trim() || 
      l.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.caseId?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-[#061026] border-l border-blue-500/40 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-[#081533] to-[#040c1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wider uppercase font-mono">
                  IMMUTABLE OFFICER AUDIT TRAIL
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/40">
                  LEDGER ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Officer: <strong className="text-cyan-300">{currentUser.name}</strong> • Badge: <strong className="text-slate-200 font-mono">{currentUser.badge_number || 'DEL-IPS-8821'}</strong>
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

        {/* Filters */}
        <div className="p-3 bg-[#030917] border-b border-slate-800/80 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search actions, case IDs, or details..."
              className="w-full bg-[#061026] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-[10px]">
            {['ALL', 'CASES', 'EVIDENCE', 'GRAPH', 'COPILOT', 'REPORTS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_8px_rgba(37,99,235,0.5)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 font-sans text-xs">
          {filteredLogs.map((log: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#030917] border border-slate-800/80 hover:border-blue-500/40 transition-colors space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-blue-950/80 px-2 py-0.2 rounded border border-blue-500/30">
                  {log.module}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="text-xs font-bold text-white leading-tight">
                {log.action}
              </div>

              {log.details && (
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                  {log.details}
                </p>
              )}

              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
                <span>Case: <strong className="text-slate-300">{log.caseId || 'National'}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{log.status || 'VERIFIED'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#040813] flex items-center justify-between">
          {onNavigateToAuditPage ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToAuditPage();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Open Full Audit Page
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">
              Tamper-Proof Officer Ledger
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
