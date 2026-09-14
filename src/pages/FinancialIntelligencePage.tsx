import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  const { selectedCaseId, selectedCase, cases } = useCaseContext();

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
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
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

  // Flow nodes with guaranteed coordinates
  const layoutNodes = useMemo(() => {
    if (!flowNetwork.nodes || flowNetwork.nodes.length === 0) return [];
    return flowNetwork.nodes.map((node) => ({
      ...node,
      x: typeof node.x === 'number' ? node.x : 60,
      y: typeof node.y === 'number' ? node.y : 220,
    }));
  }, [flowNetwork.nodes]);

  // Full canvas dimensions to prevent SVG clipping during horizontal scroll
  const canvasWidth = useMemo(() => {
    if (!layoutNodes || layoutNodes.length === 0) return 2400;
    return Math.max(2400, layoutNodes.reduce((max, n) => Math.max(max, (n.x || 0) + 380), 0));
  }, [layoutNodes]);

  const canvasHeight = useMemo(() => {
    if (!layoutNodes || layoutNodes.length === 0) return 600;
    return Math.max(560, layoutNodes.reduce((max, n) => Math.max(max, (n.y || 0) + 220), 0));
  }, [layoutNodes]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') setZoomLevel((prev) => Math.min(prev + 0.15, 2.0));
    else if (direction === 'out') setZoomLevel((prev) => Math.max(prev - 0.15, 0.4));
    else setZoomLevel(0.85);
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
                MONEY TRAIL & HAWALA TRACER
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
          {/* Active Case Badge (Synced Dynamically from Top Bar) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-amber-300 font-mono shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-slate-400 font-sans text-[11px]">Active:</span>
            <span>{selectedCase?.fir_number || selectedCaseId}</span>
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
          <div className="lg:col-span-8 rounded-xl bg-[#060b18] border border-[#142342] flex flex-col relative overflow-hidden min-h-[580px] shadow-2xl">
            {/* Top Toolbar on Graph */}
            <div className="p-3 border-b border-[#12203c] flex flex-wrap items-center justify-between gap-2.5 z-10 bg-[#070e1f]/95 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MULTI-HOP MONEY LAUNDERING TRAIL</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                  {flowNetwork.links.length} Layering Hops
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40">
                  ₹{(flowNetwork.links.reduce((sum, l) => sum + (l.amount_inr || 0), 0) / 100000).toFixed(1)}L Total Tracked
                </span>
              </div>

              {/* Node Type Legend */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"></span>
                  <span className="text-xs">Victim</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"></span>
                  <span className="text-xs">Mule Tier 1</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"></span>
                  <span className="text-xs">Aggregator</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]"></span>
                  <span className="text-xs">Crypto OTC</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
                  <span className="text-xs">Hawala</span>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom('in')}
                  className="p-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="p-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="px-2 py-1 rounded-md bg-[#091124] border border-[#1b2b4e] text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  title="Reset Zoom"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>{Math.round(zoomLevel * 100)}%</span>
                </button>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="flex-1 relative flex items-start justify-start p-8 cyber-grid-bg overflow-auto select-none min-h-[520px]">
              {/* Scale-aware scroll sizer to guarantee correct scrollWidth for all nodes & SVG */}
              <div
                style={{
                  width: `${canvasWidth * zoomLevel}px`,
                  height: `${canvasHeight * zoomLevel}px`,
                  minWidth: `${canvasWidth * zoomLevel}px`,
                  minHeight: `${canvasHeight * zoomLevel}px`,
                }}
                className="relative flex-shrink-0"
              >
                <div
                  className="relative transition-transform duration-200 ease-out origin-top-left"
                  style={{
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                    minWidth: `${canvasWidth}px`,
                    minHeight: `${canvasHeight}px`,
                    transform: `scale(${zoomLevel})`,
                  }}
                >
                  {/* SVG Connecting Directed Edges (High Visibility Neon Conduits) */}
                  <svg
                    width={canvasWidth}
                    height={canvasHeight}
                    viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                    style={{
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                      minWidth: `${canvasWidth}px`,
                      minHeight: `${canvasHeight}px`,
                    }}
                    className="absolute top-0 left-0 pointer-events-none z-10 overflow-visible"
                  >
                    <defs>
                      {/* Glowing blur filter */}
                      <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* High-visibility Precision Arrow Markers */}
                      <marker
                        id="arrow-cyan"
                        viewBox="0 0 20 20"
                        refX="18"
                        refY="10"
                        markerWidth="16"
                        markerHeight="16"
                        orient="auto"
                      >
                        <path d="M 2 3 L 18 10 L 2 17 L 6 10 Z" fill="#00e5ff" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                      </marker>
                      <marker
                        id="arrow-amber"
                        viewBox="0 0 20 20"
                        refX="18"
                        refY="10"
                        markerWidth="16"
                        markerHeight="16"
                        orient="auto"
                      >
                        <path d="M 2 3 L 18 10 L 2 17 L 6 10 Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                      </marker>
                      <marker
                        id="arrow-purple"
                        viewBox="0 0 20 20"
                        refX="18"
                        refY="10"
                        markerWidth="16"
                        markerHeight="16"
                        orient="auto"
                      >
                        <path d="M 2 3 L 18 10 L 2 17 L 6 10 Z" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                      </marker>
                      <marker
                        id="arrow-emerald"
                        viewBox="0 0 20 20"
                        refX="18"
                        refY="10"
                        markerWidth="16"
                        markerHeight="16"
                        orient="auto"
                      >
                        <path d="M 2 3 L 18 10 L 2 17 L 6 10 Z" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                      </marker>
                      <marker
                        id="arrow-indigo"
                        viewBox="0 0 20 20"
                        refX="18"
                        refY="10"
                        markerWidth="16"
                        markerHeight="16"
                        orient="auto"
                      >
                        <path d="M 2 3 L 18 10 L 2 17 L 6 10 Z" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                      </marker>
                    </defs>

                    {flowNetwork.links.map((link) => {
                      const sourceNode = layoutNodes.find((n) => n.id === link.source);
                      const targetNode = layoutNodes.find((n) => n.id === link.target);
                      if (!sourceNode || !targetNode) return null;

                      const CARD_W = 210;
                      const CARD_H = 92;

                      const sx = sourceNode.x + CARD_W;
                      const sy = sourceNode.y + CARD_H / 2;
                      const tx = targetNode.x - 6;
                      const ty = targetNode.y + CARD_H / 2;

                      const dx = Math.max(Math.abs(tx - sx) * 0.45, 50);
                      const pathD = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

                      const ch = (link.channel || '').toUpperCase();
                      const isCrypto = ch.includes('USDT') || ch.includes('CRYPTO') || ch.includes('BTC') || ch.includes('XMR') || ch.includes('ETH') || ch.includes('TORNADO');
                      const isHawala = ch.includes('CASH') || ch.includes('ANGADIA') || ch.includes('HAWALA') || ch.includes('NOTE') || ch.includes('TOKEN') || ch.includes('COURIER');
                      const isAmber = ch.includes('UPI') || ch.includes('SMURF') || ch.includes('MICRO') || ch.includes('COERCED') || ch.includes('SWEEP') || ch.includes('INVOICING');
                      const isIndigo = ch.includes('COLD') || ch.includes('AIR-GAPPED') || ch.includes('RELAYER') || ch.includes('CROSS-BORDER');

                      const strokeColor = isCrypto ? '#c084fc' : isHawala ? '#34d399' : isAmber ? '#fbbf24' : isIndigo ? '#818cf8' : '#00e5ff';
                      const markerUrl = isCrypto ? 'url(#arrow-purple)' : isHawala ? 'url(#arrow-emerald)' : isAmber ? 'url(#arrow-amber)' : isIndigo ? 'url(#arrow-indigo)' : 'url(#arrow-cyan)';

                      return (
                        <g key={link.id}>
                          {/* Layer 1: Wide Ambient Halo Glow */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="11"
                            strokeLinecap="round"
                            className="opacity-30"
                            filter="url(#edge-glow)"
                          />

                          {/* Layer 2: Animated White Pulse Stream */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.8"
                            strokeDasharray="8 14"
                            strokeLinecap="round"
                            className="opacity-80 flow-dash-anim"
                          />

                          {/* Layer 3: Solid High-Visibility Base Conduit with Directed Arrowhead */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            markerEnd={markerUrl}
                            className="opacity-95"
                          />

                          {/* Source Socket Port */}
                          <circle cx={sx} cy={sy} r="5.5" fill="#060b18" stroke={strokeColor} strokeWidth="2" />
                          <circle cx={sx} cy={sy} r="2.5" fill="#ffffff" />

                          {/* Target Docking Ring Anchor */}
                          <circle cx={targetNode.x} cy={ty} r="4" fill="#060b18" stroke={strokeColor} strokeWidth="1.5" className="opacity-75" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Amount Badges Layer (HTML Overlay with Zero SVG Clipping & Ultra-Crisp Legibility) */}
                  {flowNetwork.links.map((link) => {
                    const sourceNode = layoutNodes.find((n) => n.id === link.source);
                    const targetNode = layoutNodes.find((n) => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const CARD_W = 210;
                    const CARD_H = 92;

                    const sx = sourceNode.x + CARD_W;
                    const sy = sourceNode.y + CARD_H / 2;
                    const tx = targetNode.x;
                    const ty = targetNode.y + CARD_H / 2;

                    const midX = (sx + tx) / 2;
                    const midY = (sy + ty) / 2;

                    const ch = (link.channel || '').toUpperCase();
                    const isCrypto = ch.includes('USDT') || ch.includes('CRYPTO') || ch.includes('BTC') || ch.includes('XMR') || ch.includes('ETH') || ch.includes('TORNADO');
                    const isHawala = ch.includes('CASH') || ch.includes('ANGADIA') || ch.includes('HAWALA') || ch.includes('NOTE') || ch.includes('TOKEN') || ch.includes('COURIER');
                    const isAmber = ch.includes('UPI') || ch.includes('SMURF') || ch.includes('MICRO') || ch.includes('COERCED') || ch.includes('SWEEP') || ch.includes('INVOICING');
                    const isIndigo = ch.includes('COLD') || ch.includes('AIR-GAPPED') || ch.includes('RELAYER') || ch.includes('CROSS-BORDER');

                    const badgeBorder = isCrypto
                      ? 'border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.35)] bg-[#100722]/95 text-purple-200'
                      : isHawala
                      ? 'border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.35)] bg-[#031913]/95 text-emerald-200'
                      : isAmber
                      ? 'border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.35)] bg-[#191103]/95 text-amber-200'
                      : isIndigo
                      ? 'border-indigo-500/70 shadow-[0_0_12px_rgba(99,102,241,0.35)] bg-[#090b1e]/95 text-indigo-200'
                      : 'border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.35)] bg-[#04152a]/95 text-cyan-200';

                    const channelPillColor = isCrypto
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : isHawala
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : isAmber
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : isIndigo
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';

                    const displayAmount =
                      link.amount_inr >= 10000000
                        ? `₹${(link.amount_inr / 10000000).toFixed(2)} Cr`
                        : `₹${(link.amount_inr / 100000).toFixed(1)} L`;

                    return (
                      <div
                        key={`badge-${link.id}`}
                        style={{ left: `${midX}px`, top: `${midY}px` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group"
                      >
                        <div className={`px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 transition-colors duration-150 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:z-30 ${badgeBorder}`}>
                          <span className="font-mono font-extrabold text-xs text-white tracking-tight">
                            {displayAmount}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${channelPillColor}`}>
                            {link.channel}
                          </span>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-[#070e1f] border border-[#1b325c] text-[10px] text-slate-200 px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap z-50 pointer-events-none">
                          <span className="font-bold text-cyan-300">{link.hop_label || 'Layering Hop'}</span>
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">
                            ₹{link.amount_inr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">
                            {link.timestamp} • {link.channel}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Graph Nodes Layer */}
                  {layoutNodes.map((node) => {
                    const isSelected = selectedEntityId === node.id;
                    const isHovered = hoveredNode === node.id;
                    const isFrozen = node.status === 'FROZEN';

                    const nodeColor =
                      node.type === 'VICTIM'
                        ? 'border-blue-500/80 bg-gradient-to-br from-blue-950/90 to-[#06122c] text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:border-blue-400'
                        : node.type === 'MULE_TIER_1'
                        ? 'border-amber-500/80 bg-gradient-to-br from-amber-950/90 to-[#1c1203] text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400'
                        : node.type === 'AGGREGATOR'
                        ? 'border-red-500/80 bg-gradient-to-br from-red-950/90 to-[#22070e] text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.3)] hover:border-red-400'
                        : node.type === 'CRYPTO_GATEWAY'
                        ? 'border-purple-500/80 bg-gradient-to-br from-purple-950/90 to-[#18072a] text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-purple-400'
                        : node.type === 'OFFSHORE'
                        ? 'border-indigo-500/80 bg-gradient-to-br from-indigo-950/90 to-[#0a1030] text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:border-indigo-400'
                        : 'border-emerald-500/80 bg-gradient-to-br from-emerald-950/90 to-[#041a14] text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:border-emerald-400';

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedEntityId(node.id)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ left: `${node.x}px`, top: `${node.y}px` }}
                        className={`graph-interactive-node absolute z-10 w-[210px] p-3 rounded-xl border-2 cursor-pointer transition-colors duration-150 hover:brightness-120 hover:drop-shadow-[0_0_18px_rgba(59,130,246,0.4)] ${nodeColor} ${
                          isSelected ? 'ring-2 ring-white shadow-2xl z-30' : ''
                        }`}
                      >
                        <div className="pointer-events-none select-none flex flex-col w-full">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[8.5px] font-extrabold uppercase tracking-wide font-mono px-2 py-0.5 rounded bg-black/50 border border-white/10">
                              {node.type.replace(/_/g, ' ')}
                            </span>
                            {isFrozen ? (
                              <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono border border-cyan-500/40">
                                🔒 FROZEN
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                                Risk {node.risk_score}%
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-extrabold text-white leading-tight truncate" title={node.label}>
                            {node.label}
                          </div>
                          <div className="text-[10px] text-slate-300 leading-tight truncate mt-0.5 font-mono" title={node.sublabel}>
                            {node.sublabel}
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Balance:</span>
                            <span className="font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              ₹{(node.balance / 100000).toFixed(2)} Lakhs
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Status bar on Graph */}
            <div className="p-2.5 border-t border-[#12203c] bg-[#070e1f]/95 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Interactive money graph synced with Central FIU & Bank Core Banking Gateways</span>
              </div>
              <div className="text-[11px] text-cyan-400">Click any node to view KYC dossier & execute freeze orders</div>
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
