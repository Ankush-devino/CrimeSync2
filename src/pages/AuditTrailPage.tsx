import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Calendar,
  Users,
  Activity,
  Grid,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Laptop,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  ChevronDown,
  RefreshCw,
  FileText,
  Lock,
  ExternalLink,
  Shield
} from 'lucide-react';

interface AuditTrailPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
  failureReason?: string;
  macAddress: string;
  authMethod: string;
  userAgent: string;
}

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '27 Aug 2026, 10:42 PM',
    user: 'Inspector R. Sharma',
    userRole: 'Lead Cyber Investigator',
    action: 'Viewed Evidence',
    module: 'Evidence DNA',
    details: 'Viewed evidence EV-1246',
    ipAddress: '192.168.1.10',
    status: 'Success',
    macAddress: '00:1A:2B:3C:4D:5E',
    authMethod: 'FIDO2 WebAuthn Biometric Token',
    userAgent: 'CrimeSync Workstation / Windows 11 Enterprise'
  },
  {
    id: 'log-2',
    timestamp: '27 Aug 2026, 10:40 PM',
    user: 'SI Amit Verma',
    userRole: 'Sub-Inspector, Crime Scene Unit',
    action: 'Uploaded Evidence',
    module: 'Blockchain Vault',
    details: 'Uploaded evidence EV-1247',
    ipAddress: '192.168.1.15',
    status: 'Success',
    macAddress: '12:34:56:78:9A:BC',
    authMethod: 'PKI Smart Card + PIN',
    userAgent: 'Field Forensic Terminal v4.2'
  },
  {
    id: 'log-3',
    timestamp: '27 Aug 2026, 10:38 PM',
    user: 'Forensic Analyst P. Singh',
    userRole: 'Chief Digital Forensics Officer',
    action: 'Verified Evidence',
    module: 'Evidence DNA',
    details: 'Verified DNA for EV-1246',
    ipAddress: '192.168.1.20',
    status: 'Success',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    authMethod: 'YubiKey 5C NFC Token',
    userAgent: 'Forensic Lab Terminal / Debian GNU/Linux'
  },
  {
    id: 'log-4',
    timestamp: '27 Aug 2026, 10:36 PM',
    user: 'ACP Raj Verma',
    userRole: 'Assistant Commissioner of Police',
    action: 'Generated Report',
    module: 'Reports & Dossiers',
    details: 'Generated investigation report',
    ipAddress: '192.168.1.25',
    status: 'Success',
    macAddress: '04:D5:90:11:22:33',
    authMethod: 'Hardware Multi-Factor Token',
    userAgent: 'Command Center VIP Station / macOS Sequoia'
  },
  {
    id: 'log-5',
    timestamp: '27 Aug 2026, 10:34 PM',
    user: 'Inspector R. Sharma',
    userRole: 'Lead Cyber Investigator',
    action: 'Transferred Custody',
    module: 'Chain of Custody',
    details: 'Transferred EV-1246 to P. Singh',
    ipAddress: '192.168.1.10',
    status: 'Success',
    macAddress: '00:1A:2B:3C:4D:5E',
    authMethod: 'ECDSA Digital Key Sign-off',
    userAgent: 'CrimeSync Workstation / Windows 11 Enterprise'
  },
  {
    id: 'log-6',
    timestamp: '27 Aug 2026, 10:30 PM',
    user: 'Cyber Analyst N. Kumar',
    userRole: 'Threat Intelligence Specialist',
    action: 'Exported Data',
    module: 'Blockchain Explorer',
    details: 'Exported block data #15842',
    ipAddress: '192.168.1.30',
    status: 'Failed',
    failureReason: 'Unauthorized egress attempt blocked by Zero-Trust circuit breaker.',
    macAddress: '78:90:AB:CD:EF:01',
    authMethod: 'Single-Factor Password Attempt',
    userAgent: 'Guest Terminal / Ubuntu 24.04 LTS'
  },
  {
    id: 'log-7',
    timestamp: '27 Aug 2026, 10:28 PM',
    user: 'SI Amit Verma',
    userRole: 'Sub-Inspector, Crime Scene Unit',
    action: 'Login Attempt',
    module: 'System',
    details: 'User login to system',
    ipAddress: '192.168.1.15',
    status: 'Success',
    macAddress: '12:34:56:78:9A:BC',
    authMethod: 'Biometric Palm Scanner',
    userAgent: 'Field Forensic Terminal v4.2'
  },
  {
    id: 'log-8',
    timestamp: '27 Aug 2026, 10:25 PM',
    user: 'Forensic Analyst P. Singh',
    userRole: 'Chief Digital Forensics Officer',
    action: 'Accessed Evidence',
    module: 'Evidence DNA',
    details: 'Accessed evidence EV-1245',
    ipAddress: '192.168.1.20',
    status: 'Success',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    authMethod: 'YubiKey 5C NFC Token',
    userAgent: 'Forensic Lab Terminal / Debian GNU/Linux'
  },
  {
    id: 'log-9',
    timestamp: '27 Aug 2026, 10:20 PM',
    user: 'Inspector R. Sharma',
    userRole: 'Lead Cyber Investigator',
    action: 'Deleted File',
    module: 'Evidence DNA',
    details: 'Deleted temp_file_7845.pdf',
    ipAddress: '192.168.1.10',
    status: 'Failed',
    failureReason: 'Immutable ledger write protection prevents physical file deletion.',
    macAddress: '00:1A:2B:3C:4D:5E',
    authMethod: 'Privileged Root CLI Token',
    userAgent: 'CrimeSync Workstation / Windows 11 Enterprise'
  },
  {
    id: 'log-10',
    timestamp: '27 Aug 2026, 10:18 PM',
    user: 'ACP Raj Verma',
    userRole: 'Assistant Commissioner of Police',
    action: 'Viewed Audit Trail',
    module: 'Audit Trail',
    details: 'Viewed system audit logs',
    ipAddress: '192.168.1.25',
    status: 'Success',
    macAddress: '04:D5:90:11:22:33',
    authMethod: 'Hardware Multi-Factor Token',
    userAgent: 'Command Center VIP Station / macOS Sequoia'
  }
];

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  // Filter States
  const [selectedUser, setSelectedUser] = useState<string>('All Users');
  const [selectedActionType, setSelectedActionType] = useState<string>('All Actions');
  const [selectedModule, setSelectedModule] = useState<string>('All Modules');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [dateRange, setDateRange] = useState<string>('21 Aug 2026 - 27 Aug 2026');
  const [activityTimeframe, setActivityTimeframe] = useState<string>('Last 7 Days');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals State
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogEntry | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return SAMPLE_LOGS.filter((log) => {
      if (selectedUser !== 'All Users' && !log.user.includes(selectedUser.replace('Inspector ', '').replace('SI ', '').replace('ACP ', ''))) {
        return false;
      }
      if (selectedActionType !== 'All Actions' && log.action !== selectedActionType) {
        return false;
      }
      if (selectedModule !== 'All Modules' && log.module !== selectedModule) {
        return false;
      }
      if (selectedStatus !== 'All Status' && log.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [selectedUser, selectedActionType, selectedModule, selectedStatus]);

  const handleFilterClick = () => {
    if (onSelectAction) {
      onSelectAction(`Applied Audit Filter: [User: ${selectedUser}, Action: ${selectedActionType}, Module: ${selectedModule}, Status: ${selectedStatus}]`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-5 selection:bg-purple-600/30 selection:text-purple-200">
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#111e33]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
              AUDIT TRAIL
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Complete audit log of all system activities and access
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#0c1830] hover:bg-[#122244] text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Compliance Audit</span>
        </button>
      </div>

      {/* ── Top Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-3 shadow-md flex flex-wrap items-center gap-3">
        
        {/* User Filter */}
        <div className="relative min-w-[130px] flex-1">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
          >
            <option value="All Users">All Users</option>
            <option value="Inspector R. Sharma">Inspector R. Sharma</option>
            <option value="SI Amit Verma">SI Amit Verma</option>
            <option value="Forensic Analyst P. Singh">Forensic Analyst P. Singh</option>
            <option value="ACP Raj Verma">ACP Raj Verma</option>
            <option value="Cyber Analyst N. Kumar">Cyber Analyst N. Kumar</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Action Filter */}
        <div className="relative min-w-[130px] flex-1">
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
          >
            <option value="All Actions">All Actions</option>
            <option value="Viewed Evidence">Viewed Evidence</option>
            <option value="Uploaded Evidence">Uploaded Evidence</option>
            <option value="Verified Evidence">Verified Evidence</option>
            <option value="Generated Report">Generated Report</option>
            <option value="Transferred Custody">Transferred Custody</option>
            <option value="Exported Data">Exported Data</option>
            <option value="Login Attempt">Login Attempt</option>
            <option value="Deleted File">Deleted File</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Module Filter */}
        <div className="relative min-w-[130px] flex-1">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
          >
            <option value="All Modules">All Modules</option>
            <option value="Evidence DNA">Evidence DNA</option>
            <option value="Blockchain Vault">Blockchain Vault</option>
            <option value="Chain of Custody">Chain of Custody</option>
            <option value="Blockchain Explorer">Blockchain Explorer</option>
            <option value="Reports & Dossiers">Reports & Dossiers</option>
            <option value="System">System</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[110px] flex-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date Range Box */}
        <div className="flex items-center gap-2 bg-[#091224] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">{dateRange}</span>
        </div>

        {/* Filter Action Button */}
        <button
          onClick={handleFilterClick}
          className="px-5 py-1.5 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
        >
          FILTER
        </button>
      </div>

      {/* ── Top 5 Stat Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: TOTAL USERS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL USERS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              156
            </div>
            <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
              ↑ 12 this week
            </div>
          </div>
        </div>

        {/* Metric 2: TOTAL ACTIONS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              TOTAL ACTIONS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              1,248
            </div>
            <div className="text-[10px] font-semibold text-purple-300">
              ↑ 18% this week
            </div>
          </div>
        </div>

        {/* Metric 3: MODULES ACCESSED */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-teal-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(20,184,166,0.2)]">
            <Grid className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-teal-400/90 uppercase tracking-wider">
              MODULES ACCESSED
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              12
            </div>
            <div className="text-[10px] font-semibold text-teal-400">
              ↑ 2 new this week
            </div>
          </div>
        </div>

        {/* Metric 4: SUCCESSFUL ACTIONS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              SUCCESSFUL ACTIONS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              1,196
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              96.8% Success Rate
            </div>
          </div>
        </div>

        {/* Metric 5: FAILED ATTEMPTS */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-amber-400/90 uppercase tracking-wider">
              FAILED ATTEMPTS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              52
            </div>
            <div className="text-[10px] font-semibold text-amber-400">
              ↓ 8% this week
            </div>
          </div>
        </div>

      </div>

      {/* ── Middle Card: ACTIVITY LOG ─────────────────────────────────────────── */}
      <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80">
          <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            ACTIVITY LOG
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            Real-time Immutable Ledger Audit Stream
          </span>
        </div>

        {/* Activity Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-[#091224]/50">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">USER</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">MODULE</th>
                <th className="py-2.5 px-3">DETAILS</th>
                <th className="py-2.5 px-3 font-mono">IP ADDRESS</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLogDetail(log)}
                  className="hover:bg-[#091428] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {log.user}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#091224] border border-slate-700">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px] truncate max-w-[200px]" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {log.status === 'Success' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_6px_rgba(239,68,68,0.3)]">
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pt-3 border-t border-[#14233c] flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg bg-[#091224] hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === p
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                  : 'bg-[#091224] text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-slate-500 px-1">...</span>
          <button
            onClick={() => setCurrentPage(32)}
            className="w-7 h-7 rounded-lg text-xs font-bold bg-[#091224] text-slate-400 hover:text-white border border-slate-700"
          >
            32
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(32, p + 1))}
            className="w-7 h-7 rounded-lg bg-[#091224] hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Bottom 3 Analytics Panels ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        
        {/* Panel 1: ACTIVITY OVER TIME (Line/Area Chart) */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/80 mb-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
              ACTIVITY OVER TIME
            </h3>
            <select
              value={activityTimeframe}
              onChange={(e) => setActivityTimeframe(e.target.value)}
              className="bg-[#091224] border border-slate-700 text-[10px] text-cyan-300 rounded px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter">Last Quarter</option>
            </select>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="relative h-44 w-full flex items-end pt-4">
            <svg className="w-full h-full" viewBox="0 0 300 150" fill="none">
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Horizontal Lines */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="30" y1="50" x2="290" y2="50" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="30" y1="80" x2="290" y2="80" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="30" y1="110" x2="290" y2="110" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#1e293b" strokeWidth="1" />

              {/* Area Under Curve */}
              <polygon
                points="40,130 80,105 120,70 160,85 200,55 240,68 280,30 280,140 40,140"
                fill="url(#activityGradient)"
              />

              {/* Activity Line */}
              <polyline
                points="40,130 80,105 120,70 160,85 200,55 240,68 280,30"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.7))' }}
              />

              {/* Data Node Points */}
              {[
                { x: 40, y: 130 },
                { x: 80, y: 105 },
                { x: 120, y: 70 },
                { x: 160, y: 85 },
                { x: 200, y: 55 },
                { x: 240, y: 68 },
                { x: 280, y: 30 }
              ].map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#00f0ff"
                  strokeWidth="2"
                  className="hover:scale-150 transition-transform"
                />
              ))}

              {/* Y Axis labels */}
              <text x="5" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">600</text>
              <text x="5" y="54" fill="#64748b" fontSize="8" fontFamily="monospace">400</text>
              <text x="5" y="84" fill="#64748b" fontSize="8" fontFamily="monospace">300</text>
              <text x="5" y="114" fill="#64748b" fontSize="8" fontFamily="monospace">100</text>
              <text x="15" y="144" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>
            </svg>
          </div>

          {/* X Axis Day Labels */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-[#14233c] px-2">
            <span>21 Aug</span>
            <span>22 Aug</span>
            <span>23 Aug</span>
            <span>24 Aug</span>
            <span>25 Aug</span>
            <span>26 Aug</span>
            <span>27 Aug</span>
          </div>
        </div>

        {/* Panel 2: ACTIONS BY MODULE (Donut Chart) */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/80 mb-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
              ACTIONS BY MODULE
            </h3>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center my-auto">
            {/* Donut Graphic (5 cols) */}
            <div className="col-span-5 flex items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="0" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#a855f7" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="76.3" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="128.8" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="171.8" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#00f0ff" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="210.0" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-white font-mono leading-none">1,248</span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Total Actions</span>
                </div>
              </div>
            </div>

            {/* Legend List (7 cols) */}
            <div className="col-span-7 space-y-1 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-slate-300">Evidence DNA</span>
                </div>
                <span className="font-bold text-white font-mono">32%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                  <span className="text-slate-300">Blockchain Vault</span>
                </div>
                <span className="font-bold text-white font-mono">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span className="text-slate-300">Chain of Custody</span>
                </div>
                <span className="font-bold text-white font-mono">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-300">Reports & Dossiers</span>
                </div>
                <span className="font-bold text-white font-mono">16%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                  <span className="text-slate-300">Blockchain Explorer</span>
                </div>
                <span className="font-bold text-white font-mono">8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500" />
                  <span className="text-slate-300">Others</span>
                </div>
                <span className="font-bold text-white font-mono">4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: STATUS DISTRIBUTION (Donut Chart) */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/80 mb-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
              STATUS DISTRIBUTION
            </h3>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center my-auto">
            {/* Donut Graphic (5 cols) */}
            <div className="col-span-5 flex items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Success Arc (96.8%) */}
                  <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="0" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }} />
                  {/* Failed Arc (4.2%) */}
                  <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="231.0" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-white font-mono leading-none">1,248</span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Total Actions</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Legend (7 cols) */}
            <div className="col-span-7 space-y-3 text-xs">
              <div className="p-2 rounded-xl bg-[#091224] border border-emerald-900/50 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Success
                  </span>
                  <span className="font-mono font-extrabold text-white">1,196</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4">96.8% of all interactions</div>
              </div>

              <div className="p-2 rounded-xl bg-[#091224] border border-red-900/50 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    Failed
                  </span>
                  <span className="font-mono font-extrabold text-white">52</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4">4.2% security blocked</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: AUDIT LOG ENTRY FORENSIC INSPECTION ──────────────────────── */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  AUDIT LOG FORENSIC INSPECTOR • [{selectedLogDetail.id}]
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-white font-bold">{selectedLogDetail.timestamp}</span>
                </div>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Authenticated User:</span>
                  <span className="text-cyan-300 font-bold">{selectedLogDetail.user} ({selectedLogDetail.userRole})</span>
                </div>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Action Performed:</span>
                  <span className="text-purple-300 font-bold">{selectedLogDetail.action}</span>
                </div>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Target Module:</span>
                  <span className="text-white">{selectedLogDetail.module}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedLogDetail.status === 'Success' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                    {selectedLogDetail.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">IP Address & Physical MAC:</span>
                  <span className="text-cyan-400">{selectedLogDetail.ipAddress} • {selectedLogDetail.macAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">Authentication Mechanism:</span>
                  <span className="text-slate-200">{selectedLogDetail.authMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">Client Workstation User-Agent:</span>
                  <span className="text-slate-300 text-[10.5px]">{selectedLogDetail.userAgent}</span>
                </div>
                {selectedLogDetail.failureReason && (
                  <div className="p-2 rounded bg-red-950/50 border border-red-800 font-sans text-red-300 text-[11px] mt-1">
                    <strong>Security Flag:</strong> {selectedLogDetail.failureReason}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EXPORT COMPLIANCE AUDIT ──────────────────────────────────── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  EXPORT SYSTEM AUDIT COMPLIANCE REPORT
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-300 font-semibold">Select Compliance Package:</div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-purple-600 rounded" />
                    <span>Indian Evidence Act Section 65B Audit Trail</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-purple-600 rounded" />
                    <span>ISO/IEC 27001 Access & Privileged Operations Manifest</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-purple-600 rounded" />
                    <span>Cryptographic Blockchain Immutable Transaction Proofs</span>
                  </label>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Log Period: 21 Aug 2026 – 27 Aug 2026 • 1,248 Records Included
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('Exported Full System Audit Package (1,248 records)');
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
              >
                Download Signed Audit CSV & PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditTrailPage;
