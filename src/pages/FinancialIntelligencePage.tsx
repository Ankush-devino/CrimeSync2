import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Filter,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  Landmark,
  User,
  ArrowRight,
  ShieldAlert,
  Layers,
  Activity,
  GitFork,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  Building2,
  Phone,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Unlock,
  Coins,
  DollarSign,
  Download,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  CreditCard,
  Send,
  Radio,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { useCaseContext } from '../context/CaseContext';
import { logOfficerAction } from '../services/activityLogger';

interface FinancialIntelligencePageProps {
  onSelectAction?: (action: string) => void;
}

export const FinancialIntelligencePage: React.FC<FinancialIntelligencePageProps> = ({
  onSelectAction,
}) => {
  const { selectedCaseId, selectedCase, cases, setSelectedCaseId } = useCaseContext();

  // State for data
  const [summary, setSummary] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [flowNetwork, setFlowNetwork] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [cryptoTrails, setCryptoTrails] = useState<any[]>([]);
  const [hawalaLedger, setHawalaLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View & UI State
  const [activeTab, setActiveTab] = useState<'graph' | 'accounts' | 'crypto' | 'hawala' | 'transactions'>('graph');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState<string>('Last 30 Days');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modal State
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState<boolean>(false);
  const [accountToFreeze, setAccountToFreeze] = useState<any | null>(null);
  const [freezeReason, setFreezeReason] = useState<string>('Section 106 BNSS 2023 - Immediate Debit Freeze for Proceeds of Crime');
  const [isFreezing, setIsFreezing] = useState<boolean>(false);
  const [freezeSuccessData, setFreezeSuccessData] = useState<any | null>(null);

  // Load Financial Intelligence Data
  const loadFinancialData = useCallback(async () => {
    setLoading(true);
    try {
      const caseFilter = selectedCaseId !== 'ALL' ? selectedCaseId : undefined;
      const [sumRes, accRes, txnRes, flowRes, cryRes, hawRes] = await Promise.all([
        api.financial.getSummary(caseFilter),
        api.financial.getAccounts(caseFilter),
        api.financial.getTransactions(caseFilter),
        api.financial.getFlowNetwork(caseFilter),
        api.financial.getCryptoTrails(caseFilter),
        api.financial.getHawalaLedger(caseFilter),
      ]);

      if (sumRes) setSummary(sumRes);
      if (accRes) {
        setAccounts(accRes);
        setSelectedEntityId(accRes.length > 0 ? accRes[0].id : null);
      }
      if (txnRes) setTransactions(txnRes);
      if (flowRes) setFlowNetwork(flowRes);
      if (cryRes) setCryptoTrails(cryRes);
      if (hawRes) setHawalaLedger(hawRes);
    } catch (err) {
      console.error('Failed to load financial intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Selected Account Object
  const selectedAccount = useMemo(() => {
    if (!selectedEntityId) return accounts[0] || null;
    return (
      accounts.find((a) => a.id === selectedEntityId || a.account_number === selectedEntityId) ||
      accounts[0] ||
      null
    );
  }, [accounts, selectedEntityId]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
    else if (direction === 'out') setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
    else setZoomLevel(1);
  };

  // Execute Freeze Account Action
  const handleExecuteFreeze = async () => {
    if (!accountToFreeze) return;
    setIsFreezing(true);
    try {
      const res = await api.financial.freezeAccount({
        account_id: accountToFreeze.id,
        reason: freezeReason,
        officer_name: selectedCase?.lead_investigator_name || 'Superintendent Ananya Sengupta',
      });

      if (res) {
        setFreezeSuccessData(res);
        // Update account locally
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === accountToFreeze.id ? { ...a, status: 'FROZEN', freeze_order_ref: res.freeze_order_ref } : a
          )
        );
        // Refresh summary
        loadFinancialData();

        logOfficerAction({
          action: 'Executed Bank Account Debit Freeze Order (Sec 106 BNSS)',
          module: 'Financial Intelligence',
          details: `Frozen account ${accountToFreeze.account_number} (${accountToFreeze.bank_name}) amounting to ₹${accountToFreeze.current_balance_inr.toLocaleString('en-IN')}. Ref: ${res.freeze_order_ref}`,
        });
      }
    } catch (err: any) {
      alert(`Freeze Requisition Error: ${err.message}`);
    } finally {
      setIsFreezing(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.transaction_ref.toLowerCase().includes(q) ||
        t.source_holder.toLowerCase().includes(q) ||
        t.target_holder.toLowerCase().includes(q) ||
        t.channel.toLowerCase().includes(q) ||
        t.flag_reason.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Transaction Ref', 'Source Holder', 'Source Account', 'Target Holder', 'Target Account', 'Amount (INR)', 'Channel', 'Timestamp', 'Suspicious Score', 'Flag Reason'];
    const rows = filteredTransactions.map((t) => [
      t.transaction_ref,
      `"${t.source_holder}"`,
      t.source_account,
      `"${t.target_holder}"`,
      t.target_account,
      t.amount_inr,
      t.channel,
      t.timestamp,
      t.suspicious_score,
      `"${t.flag_reason}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRIMESYNC_FINANCIAL_LEDGER_${selectedCaseId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Landmark className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white uppercase">
                FINANCIAL INTELLIGENCE & HAWALA TRACER
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                PMLA / FIU SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-hop money laundering tracking, mule bank account freeze, crypto OTC off-ramp & Angadia Hawala reconciliation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Case Selector */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 pointer-events-none text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="pl-8 pr-8 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] hover:border-amber-500/60 focus:border-amber-500 text-xs font-semibold text-amber-300 font-mono focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
              title="Select Active Investigation Case"
            >
              {cases && cases.length > 0 ? (
                cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#091122] text-slate-200 font-sans">
                    {c.id} — {c.title || c.name || 'Investigation'}
                  </option>
                ))
              ) : (
                <option value={selectedCaseId} className="bg-[#091122] text-slate-200">
                  {selectedCaseId}
                </option>
              )}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-blue-500/60 flex items-center gap-2 transition-all shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeDateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#091122] border border-[#1e3866] rounded-lg shadow-2xl p-1.5 z-50 text-xs">
                {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Current Financial Year', 'Entire Investigation'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setActiveDateRange(range);
                      setIsDatePickerOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-600/20 hover:text-blue-300 transition-colors ${
                      activeDateRange === range ? 'bg-blue-600/30 text-blue-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-emerald-500/60 flex items-center gap-1.5 transition-all shadow-sm"
            title="Export Ledger CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Ledger</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadFinancialData}
            className="p-2 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white hover:border-blue-500/60 transition-all shadow-sm"
            title="Refresh Financial Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Top 5 KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Tracked Volume */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] hover:border-emerald-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>TRACKED SYNDICATE VOLUME</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1">
            ₹{summary ? (summary.total_volume_inr / 100000).toFixed(2) : '41.30'} Lakhs
          </div>
          <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
            <span>●</span> {transactions.length} Verified Transfers
          </div>
        </div>

        {/* Metric 2: Frozen Funds */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] hover:border-cyan-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>ATTACHED / FROZEN FUNDS</span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 mt-1">
            ₹{summary ? (summary.frozen_amount_inr / 100000).toFixed(2) : '0.00'} Lakhs
          </div>
          <div className="text-[11px] font-medium text-cyan-300 flex items-center gap-1 mt-0.5">
            <span>🛡</span> Sec 106 BNSS Requisition Active
          </div>
        </div>

        {/* Metric 3: Recovery Rate */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] hover:border-purple-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>RECOVERY / ATTACHMENT RATE</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-400 mt-1">
            {summary ? summary.recovery_rate_percent : 0}%
          </div>
          <div className="text-[11px] font-medium text-purple-300 flex items-center gap-1 mt-0.5">
            <span>↑</span> Target: 65% Threshold
          </div>
        </div>

        {/* Metric 4: High Risk Mule Accounts */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] hover:border-red-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>HIGH RISK MULE ACCOUNTS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xl font-extrabold text-red-400 mt-1">
            {accounts.filter((a) => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH').length}
          </div>
          <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-0.5">
            <span>⚠</span> {accounts.filter((a) => a.status === 'FROZEN').length} Frozen • {accounts.filter((a) => a.status === 'ACTIVE').length} Under Watch
          </div>
        </div>

        {/* Metric 5: Crypto & Hawala Volume */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] hover:border-amber-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>CRYPTO OTC & HAWALA EXIT</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            ₹{summary ? (summary.crypto_volume_inr / 100000).toFixed(2) : '19.50'} Lakhs
          </div>
          <div className="text-[11px] font-medium text-amber-300 flex items-center gap-1 mt-0.5">
            <span>●</span> TRC-20 USDT & Angadia Notes
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#142342] pb-2">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'graph'
              ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
              : 'bg-[#081023] border border-[#132342] text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Money Flow Network ({flowNetwork.nodes.length} Nodes)</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-[#081023] border border-[#132342] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Mule Bank Accounts ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'crypto'
              ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-[#081023] border border-[#132342] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Crypto & Blockchain Trails ({cryptoTrails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hawala')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'hawala'
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'bg-[#081023] border border-[#132342] text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Hawala & Angadia Ledger ({hawalaLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-[#081023] border border-[#132342] text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Transaction Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: MONEY FLOW NETWORK GRAPH ─── */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Main Visual Flow Network Canvas (Spans 8 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[#070e1f] border border-[#132342] flex flex-col relative overflow-hidden min-h-[560px] shadow-xl">
            {/* Top Toolbar on Graph */}
            <div className="p-3 border-b border-[#12203c] flex flex-wrap items-center justify-between gap-2 z-10 bg-[#070e1f]/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MULTI-HOP MONEY LAUNDERING TRAIL</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {flowNetwork.links.length} Layering Hops
                </span>
              </div>

              {/* Node Type Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Victim</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Tier 1 Mule</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Aggregator</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Crypto OTC</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Hawala Drop</span>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom('in')}
                  className="p-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="p-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="p-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white"
                  title="Reset Zoom"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="flex-1 relative flex items-center justify-center p-6 cyber-grid-bg overflow-auto select-none min-h-[460px]">
              <div
                className="w-[960px] h-[480px] relative transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* SVG Connecting Directed Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <marker
                      id="arrow-cyan"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                    </marker>
                    <marker
                      id="arrow-amber"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                    </marker>
                    <marker
                      id="arrow-purple"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                    </marker>
                  </defs>

                  {flowNetwork.links.map((link) => {
                    const sourceNode = flowNetwork.nodes.find((n) => n.id === link.source);
                    const targetNode = flowNetwork.nodes.find((n) => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const sx = sourceNode.x + 80;
                    const sy = sourceNode.y + 35;
                    const tx = targetNode.x;
                    const ty = targetNode.y + 35;
                    const midX = (sx + tx) / 2;
                    const midY = (sy + ty) / 2;

                    return (
                      <g key={link.id}>
                        {/* Glowing Curve Line */}
                        <path
                          d={`M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`}
                          fill="none"
                          stroke={link.channel.includes('USDT') ? '#a855f7' : '#06b6d4'}
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          markerEnd={link.channel.includes('USDT') ? 'url(#arrow-purple)' : 'url(#arrow-cyan)'}
                          className="opacity-80"
                        />
                        {/* Edge Label Badge */}
                        <foreignObject
                          x={midX - 50}
                          y={midY - 14}
                          width="100"
                          height="28"
                          className="overflow-visible pointer-events-auto"
                        >
                          <div className="px-1.5 py-0.5 rounded bg-[#060e1d] border border-cyan-500/40 text-[9px] font-mono font-bold text-center text-cyan-300 shadow-md">
                            ₹{(link.amount_inr / 100000).toFixed(1)}L • {link.channel}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>

                {/* Graph Nodes Layer */}
                {flowNetwork.nodes.map((node) => {
                  const isSelected = selectedEntityId === node.id;
                  const isHovered = hoveredNode === node.id;
                  const isFrozen = node.status === 'FROZEN';

                  const nodeColor =
                    node.type === 'VICTIM'
                      ? 'border-blue-500 bg-blue-950/80 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : node.type === 'MULE_TIER_1'
                      ? 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : node.type === 'AGGREGATOR'
                      ? 'border-red-500 bg-red-950/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : node.type === 'CRYPTO_GATEWAY'
                      ? 'border-purple-500 bg-purple-950/80 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]';

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedEntityId(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                      className={`absolute w-[180px] p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 z-10 ${nodeColor} ${
                        isSelected
                          ? 'ring-2 ring-white scale-105 shadow-2xl'
                          : isHovered
                          ? 'scale-105'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8.5px] font-extrabold uppercase tracking-wide font-mono px-1.5 py-0.5 rounded bg-black/40">
                          {node.type.replace('_', ' ')}
                        </span>
                        {isFrozen ? (
                          <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono">
                            🔒 FROZEN
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-red-400">
                            Risk {node.risk_score}%
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-extrabold text-white leading-tight truncate">
                        {node.label}
                      </div>
                      <div className="text-[10px] text-slate-300 leading-tight truncate mt-0.5">
                        {node.sublabel}
                      </div>

                      {node.balance > 0 && (
                        <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Balance:</span>
                          <span className="font-bold text-emerald-300">
                            ₹{(node.balance / 100000).toFixed(2)} Lakhs
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status bar on Graph */}
            <div className="p-2.5 border-t border-[#12203c] bg-[#070e1f]/95 text-xs flex items-center justify-between text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Interactive money graph synced with Central FIU & Bank Core Banking Gateways</span>
              </div>
              <div>Click any node to view KYC dossier & execute freeze orders</div>
            </div>
          </div>

          {/* Right Sidebar: Selected Account Dossier & Quick Actions (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-3.5">
            {selectedAccount ? (
              <div className="rounded-xl bg-[#081023] border border-[#132342] p-4 flex flex-col space-y-3.5 shadow-xl">
                {/* Account Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#12203c]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-white block leading-tight">
                        {selectedAccount.holder_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedAccount.bank_name} • {selectedAccount.account_type}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                      selectedAccount.status === 'FROZEN'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : selectedAccount.risk_level === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedAccount.status === 'FROZEN' ? '🔒 DEBIT FROZEN' : `${selectedAccount.risk_level} RISK`}
                  </span>
                </div>

                {/* Account Balance Card */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-[#0d1c3a] to-[#071126] border border-emerald-500/40 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Available Live Balance</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ₹{selectedAccount.current_balance_inr.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-700/60">
                    <span>Total Inflow: ₹{(selectedAccount.total_received_inr / 100000).toFixed(1)}L</span>
                    <span>Total Outflow: ₹{(selectedAccount.total_sent_inr / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Account Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono bg-[#050b16] p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Account Number</span>
                    <span className="font-bold text-slate-200">{selectedAccount.account_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">IFSC Code</span>
                    <span className="font-bold text-cyan-300">{selectedAccount.ifsc_code}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Branch</span>
                    <span className="text-slate-300 truncate block">{selectedAccount.branch}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Role / Tier</span>
                    <span className="text-amber-400 font-bold">{selectedAccount.tier.replace(/_/g, ' ')}</span>
                  </div>
                  {selectedAccount.pan_card && (
                    <div>
                      <span className="text-slate-500 block text-[9px]">PAN Card</span>
                      <span className="text-slate-300">{selectedAccount.pan_card}</span>
                    </div>
                  )}
                  {selectedAccount.phone && (
                    <div>
                      <span className="text-slate-500 block text-[9px]">Registered Mobile</span>
                      <span className="text-slate-300">{selectedAccount.phone}</span>
                    </div>
                  )}
                </div>

                {/* Freeze Status Alert / Order Information */}
                {selectedAccount.status === 'FROZEN' ? (
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/50 space-y-1 text-xs">
                    <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>STATUTORY FREEZE REQUISITION EXECUTED</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      Ref: <b>{selectedAccount.freeze_order_ref || 'BNSS-106-FREEZE-991204'}</b>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Bank nodal officer notified under Section 106 BNSS 2023. Debit operations blocked.
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAccountToFreeze(selectedAccount);
                      setIsFreezeModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>EMERGENCY ACCOUNT FREEZE (SEC 106 BNSS)</span>
                  </button>
                )}

                {/* Laundering Pattern Diagnosis */}
                <div className="p-2.5 rounded-lg bg-[#050b16] border border-slate-800 text-[11px] space-y-1">
                  <div className="font-bold text-amber-400 uppercase tracking-wide text-[10px]">
                    AI Forensics & AML Anomaly Diagnosis
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[10.5px]">
                    Account exhibits high velocity structuring (smurfing). Inward overseas wire was layered across mule accounts within 15 minutes of receipt without economic rationale.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#081023] border border-[#132342] p-6 text-center text-slate-400 text-xs">
                Select an account from the money flow graph or mule accounts list to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MULE BANK ACCOUNTS REGISTRY ─── */}
      {activeTab === 'accounts' && (
        <div className="rounded-xl bg-[#081023] border border-[#132342] p-4 flex flex-col space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12203c]">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                MULE & SYNDICATE BANK ACCOUNTS REGISTRY
              </h2>
              <p className="text-xs text-slate-400">
                Identified beneficiary and intermediary bank accounts flagged for proceeds of crime
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded border border-cyan-500/30 font-bold">
              {accounts.length} Monitored Accounts
            </div>
          </div>

          {/* Accounts Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans">
                  <th className="py-2.5 px-3">Account Holder</th>
                  <th className="py-2.5 px-3">Account No & IFSC</th>
                  <th className="py-2.5 px-3">Bank & Branch</th>
                  <th className="py-2.5 px-3">Role Tier</th>
                  <th className="py-2.5 px-3">Current Balance</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#0c162b] transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      <div>{acc.holder_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{acc.account_type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-cyan-300 font-bold">{acc.account_number}</div>
                      <div className="text-[10px] text-slate-500">{acc.ifsc_code}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="text-slate-200">{acc.bank_name}</div>
                      <div className="text-[10px] text-slate-400">{acc.branch}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                        {acc.tier.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400 text-sm">
                      ₹{acc.current_balance_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          acc.risk_level === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {acc.risk_score}% ({acc.risk_level})
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {acc.status === 'FROZEN' ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                          🔒 FROZEN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-300 border border-red-500/40 font-mono animate-pulse">
                          ● ACTIVE DEBIT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {acc.status === 'FROZEN' ? (
                        <span className="text-[10px] font-mono text-slate-500">Order Dispatched</span>
                      ) : (
                        <button
                          onClick={() => {
                            setAccountToFreeze(acc);
                            setIsFreezeModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        >
                          Freeze Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CRYPTO & BLOCKCHAIN TRAILS ─── */}
      {activeTab === 'crypto' && (
        <div className="rounded-xl bg-[#081023] border border-[#132342] p-4 flex flex-col space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12203c]">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>BLOCKCHAIN & CRYPTO OTC OFF-RAMP TRAILS</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking Tether (TRC-20 USDT), Ethereum mixer hops, and peer-to-peer crypto OTC cash brokers
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded border border-amber-500/30 font-bold">
              {cryptoTrails.length} Verified Crypto Hops
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cryptoTrails.map((trail) => (
              <div
                key={trail.id}
                className="p-3.5 rounded-xl bg-[#0c162b] border border-[#192b4d] hover:border-amber-500/60 transition-all space-y-2.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-950 text-amber-300 border border-amber-500/40">
                    {trail.blockchain} • {trail.asset}
                  </span>
                  <span className="text-[10px] text-cyan-300">
                    {new Date(trail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-extrabold text-white">
                    {trail.amount.toLocaleString()} {trail.asset}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    ≈ ₹{trail.amount_inr_equivalent.toLocaleString('en-IN')} INR
                  </div>
                </div>

                <div className="space-y-1 bg-[#060c18] p-2 rounded border border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Source Wallet:</span>
                    <span className="text-slate-300 truncate block">{trail.source_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Destination / OTC Desk:</span>
                    <span className="text-amber-300 truncate block">{trail.target_address}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="font-sans font-semibold text-slate-400">{trail.service_tag}</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[9px] font-bold">
                    {trail.risk_category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[9px] text-slate-500">
                  <div className="truncate max-w-[180px]">Tx: {trail.tx_hash}</div>
                  <button
                    onClick={() => handleCopy(trail.tx_hash)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    {copiedText === trail.tx_hash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === trail.tx_hash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: HAWALA & ANGADIA LEDGER ─── */}
      {activeTab === 'hawala' && (
        <div className="rounded-xl bg-[#081023] border border-[#132342] p-4 flex flex-col space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12203c]">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>HAWALA & ANGADIA CASH SETTLEMENT LEDGER</span>
              </h2>
              <p className="text-xs text-slate-400">
                Physical cash token serials, currency note half matches, and courier handover records
              </p>
            </div>
            <div className="text-xs font-mono text-purple-400 bg-purple-950/80 px-3 py-1 rounded border border-purple-500/30 font-bold">
              {hawalaLedger.length} Hawala Settlement Entries
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hawalaLedger.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0c162b] border border-[#192b4d] hover:border-purple-500/60 transition-all space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-500/40">
                    TOKEN: #{item.token_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans">Settlement Value</div>
                    <div className="text-xl font-extrabold text-white font-mono">
                      ₹{item.amount_inr.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-sans">Corridor</div>
                    <div className="text-xs font-bold text-cyan-300 font-sans">
                      {item.origin_city} ➔ {item.destination_city}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#060c18] border border-slate-800 space-y-1 text-[10.5px]">
                  <div className="text-amber-400 font-bold">Note Serial Token Match:</div>
                  <div className="text-slate-200">{item.note_serial_prefix}</div>
                  <div className="text-slate-400 pt-1 border-t border-slate-800/80">
                    Courier: <b className="text-white">{item.angadia_courier_name}</b>
                  </div>
                </div>

                <div className="p-2 rounded bg-purple-950/20 border border-purple-500/30 text-[10px] text-slate-300 leading-relaxed font-sans">
                  <b>Forensic Evidence:</b> {item.forensic_note}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: ALL TRANSACTIONS LEDGER ─── */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl bg-[#081023] border border-[#132342] p-4 flex flex-col space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12203c]">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                COMPREHENSIVE FINANCIAL TRANSACTION LEDGER
              </h2>
              <p className="text-xs text-slate-400">
                Detailed UTR logs, IMPS, RTGS, UPI, and crypto transfers with suspicious risk scoring
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search UTR, holder, channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c162b] border border-[#192b4d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans">
                  <th className="py-2.5 px-3">Transaction Ref / UTR</th>
                  <th className="py-2.5 px-3">Source Account</th>
                  <th className="py-2.5 px-3">Beneficiary Target</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Amount (INR)</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Flag Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#0c162b] transition-colors">
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{t.transaction_ref}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-white font-bold">{t.source_holder}</div>
                      <div className="text-[10px] font-mono text-slate-500">{t.source_account}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-white font-bold">{t.target_holder}</div>
                      <div className="text-[10px] font-mono text-slate-500">{t.target_account}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-200">
                        {t.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400 text-sm">
                      ₹{t.amount_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.suspicious_score >= 90
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {t.suspicious_score}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[11px] text-slate-300 max-w-xs truncate">
                      {t.flag_reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: EMERGENCY ACCOUNT FREEZE REQUISITION (SEC 106 BNSS) ─── */}
      {isFreezeModalOpen && accountToFreeze && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#091122] border border-red-500/60 rounded-xl shadow-2xl p-5 space-y-4 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                    EMERGENCY DEBIT FREEZE REQUISITION
                  </h3>
                  <span className="text-[10px] text-red-400 font-mono">
                    Statutory Provision: Section 106 BNSS 2023 / Section 5 PMLA 2002
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFreezeModalOpen(false);
                  setFreezeSuccessData(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {freezeSuccessData ? (
              /* Freeze Success Screen */
              <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-500/60 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>DEBIT FREEZE ORDER DISPATCHED & REGISTERED</span>
                </div>

                <div className="space-y-1 bg-[#050b16] p-3 rounded-lg border border-slate-800 text-[11px]">
                  <div>Order Reference Token: <b className="text-white">{freezeSuccessData.freeze_order_ref}</b></div>
                  <div>Account Number: <b className="text-cyan-300">{freezeSuccessData.account_number}</b></div>
                  <div>Bank / Branch: <b className="text-slate-200">{freezeSuccessData.bank_name}</b></div>
                  <div>Amount Attached: <b className="text-emerald-400">₹{freezeSuccessData.amount_frozen_inr.toLocaleString('en-IN')}</b></div>
                  <div>Authorized Officer: <b className="text-slate-200">{freezeSuccessData.freezing_officer}</b></div>
                  <div>Timestamp: <b className="text-slate-400">{new Date(freezeSuccessData.timestamp).toLocaleString()}</b></div>
                </div>

                <div className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  Notice transmitted through automated API to the Bank's Chief Vigilance & Nodal Operations Officer. All debit and withdrawal channels locked.
                </div>

                <button
                  onClick={() => {
                    setIsFreezeModalOpen(false);
                    setFreezeSuccessData(null);
                  }}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Close & Return to Dossier
                </button>
              </div>
            ) : (
              /* Freeze Confirmation Form */
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-lg bg-[#060c18] border border-slate-800 space-y-1.5 font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-sans">Target Bank Account</div>
                  <div className="text-sm font-bold text-white">{accountToFreeze.holder_name}</div>
                  <div className="text-cyan-300">A/C: {accountToFreeze.account_number} • IFSC: {accountToFreeze.ifsc_code}</div>
                  <div className="text-slate-400">{accountToFreeze.bank_name} ({accountToFreeze.branch})</div>
                  <div className="text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    Live Attached Balance: ₹{accountToFreeze.current_balance_inr.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Statutory Requisition Justification:
                  </label>
                  <textarea
                    rows={3}
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="w-full bg-[#060c18] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-300 leading-relaxed font-sans">
                  ⚠ <b>Legal Warning:</b> Executing this freeze will immediately lock all outward transactions and ATM withdrawals on this account under emergency powers.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setIsFreezeModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteFreeze}
                    disabled={isFreezing}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  >
                    {isFreezing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Execute Freeze Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
