import React, { useState } from 'react';
import {
  Calendar,
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
  FileSpreadsheet
} from 'lucide-react';

interface FinancialIntelligencePageProps {
  onSelectAction?: (action: string) => void;
}

interface AccountInfo {
  id: string;
  accountNumber: string;
  holderName: string;
  accountType: string;
  bankName: string;
  ifscCode: string;
  openingDate: string;
  currentBalance: string;
  totalReceived: string;
  totalSent: string;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Frozen' | 'Flagged';
  avatar?: string;
}

export const FinancialIntelligencePage: React.FC<FinancialIntelligencePageProps> = ({
  onSelectAction,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('AC987654');
  const [activeDateRange, setActiveDateRange] = useState<string>('14 Aug 2026 - 27 Aug 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [activeViewModal, setActiveViewModal] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Accounts database
  const accountsData: Record<string, AccountInfo> = {
    'AC987654': {
      id: 'AC987654',
      accountNumber: 'AC987654',
      holderName: 'Aman Khan',
      accountType: 'Savings Account',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0001234',
      openingDate: '12 Mar 2024',
      currentBalance: '₹ 4,20,000',
      totalReceived: '₹ 12,45,000',
      totalSent: '₹ 8,25,000',
      riskScore: 92,
      riskLevel: 'High',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    'AC455566': {
      id: 'AC455566',
      accountNumber: 'AC455566',
      holderName: 'Vikram J.',
      accountType: 'Current Account',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0004555',
      openingDate: '08 Jan 2023',
      currentBalance: '₹ 1,15,000',
      totalReceived: '₹ 8,90,000',
      totalSent: '₹ 7,75,000',
      riskScore: 74,
      riskLevel: 'High',
      status: 'Active',
    },
    'AC112233': {
      id: 'AC112233',
      accountNumber: 'AC112233',
      holderName: 'Unknown Entity',
      accountType: 'Corporate Escrow',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0001122',
      openingDate: '19 Nov 2024',
      currentBalance: '₹ 2,80,000',
      totalReceived: '₹ 18,20,000',
      totalSent: '₹ 15,40,000',
      riskScore: 68,
      riskLevel: 'Medium',
      status: 'Active',
    },
    'AC665577': {
      id: 'AC665577',
      accountNumber: 'AC665577',
      holderName: 'Shakti Transport Pvt. Ltd.',
      accountType: 'Commercial Account',
      bankName: 'Axis Bank',
      ifscCode: 'UTIB0006655',
      openingDate: '15 Sep 2021',
      currentBalance: '₹ 70,000',
      totalReceived: '₹ 34,50,000',
      totalSent: '₹ 33,80,000',
      riskScore: 61,
      riskLevel: 'Medium',
      status: 'Active',
    },
    'AC998877': {
      id: 'AC998877',
      accountNumber: 'AC998877',
      holderName: 'Riya Singh',
      accountType: 'Salary Account',
      bankName: 'Punjab National Bank',
      ifscCode: 'PUNB0009988',
      openingDate: '04 Jun 2022',
      currentBalance: '₹ 2,50,000',
      totalReceived: '₹ 6,10,000',
      totalSent: '₹ 3,60,000',
      riskScore: 58,
      riskLevel: 'Medium',
      status: 'Active',
    },
  };

  const selectedAccount = accountsData[selectedEntityId] || accountsData['AC987654'];

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
    else if (direction === 'out') setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
    else setZoomLevel(1);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            FINANCIAL INTELLIGENCE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track, analyze and visualize financial transactions and money flow
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="px-3 py-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-xs font-medium text-slate-300 hover:text-white hover:border-blue-500/50 flex items-center gap-2 transition-all shadow-sm"
            >
              <span>{activeDateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-[#070e1e] border border-[#1c3057] rounded-lg shadow-2xl p-2 z-50 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                  Preset Time Ranges
                </div>
                {[
                  '14 Aug 2026 - 27 Aug 2026',
                  'Last 24 Hours',
                  'Last 7 Days',
                  'Last 30 Days',
                  'Current Financial Quarter',
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setActiveDateRange(range);
                      setIsDatePickerOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-600/20 hover:text-blue-300 transition-colors ${
                      activeDateRange === range ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3 py-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-xs font-medium text-slate-300 hover:text-white hover:border-blue-500/50 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ─── Top 5 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: TOTAL TRANSACTIONS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] hover:border-blue-500/40 transition-all shadow-sm">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL TRANSACTIONS
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">2,348</div>
          <div className="text-[11px] font-medium text-indigo-400 flex items-center gap-1 mt-1">
            <span>↑</span> 156 this week
          </div>
        </div>

        {/* Card 2: TOTAL AMOUNT */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL AMOUNT
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹ 8,42,35,000</div>
          <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
            <span>↑</span> 24% this week
          </div>
        </div>

        {/* Card 3: SUSPICIOUS TRANSACTIONS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] hover:border-red-500/40 transition-all shadow-sm">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            SUSPICIOUS TRANSACTIONS
          </div>
          <div className="text-2xl font-extrabold text-red-500 mt-1">28</div>
          <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-1">
            <span>↑</span> 6 this week
          </div>
        </div>

        {/* Card 4: HIGH RISK ACCOUNTS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] hover:border-amber-500/40 transition-all shadow-sm">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            HIGH RISK ACCOUNTS
          </div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">16</div>
          <div className="text-[11px] font-medium text-amber-400 flex items-center gap-1 mt-1">
            <span>↑</span> 3 this week
          </div>
        </div>

        {/* Card 5: UNUSUAL PATTERNS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] hover:border-cyan-500/40 transition-all shadow-sm">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            UNUSUAL PATTERNS
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">9</div>
          <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1 mt-1">
            <span>↑</span> 2 this week
          </div>
        </div>
      </div>

      {/* ─── Middle Main Section: Network Graph + Transaction Timeline + (Suspicious Patterns & Account Details) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left/Middle Major Column: MONEY FLOW NETWORK (Spans 6 cols on lg) */}
        <div className="lg:col-span-6 rounded-lg bg-[#070e1f] border border-[#132342] flex flex-col relative overflow-hidden min-h-[460px] shadow-md">
          {/* Graph Header Bar */}
          <div className="p-3 border-b border-[#12203c] flex items-center justify-between z-10 bg-[#070e1f]/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                MONEY FLOW NETWORK
              </span>
              <button
                onClick={() => onSelectAction?.('Money Flow Graph Help')}
                className="text-slate-400 hover:text-slate-200"
                title="Graph Information"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></span>
                <span>Person</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                <span>Account</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"></span>
                <span>Transaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                <span>High Risk</span>
              </div>
            </div>
          </div>

          {/* Interactive Network Graph Canvas */}
          <div className="flex-1 relative flex items-center justify-center p-4 cyber-grid-bg overflow-hidden select-none min-h-[380px]">
            <div
              className="w-full h-full relative transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* SVG Edges Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  {/* Arrow Markers */}
                  <marker
                    id="arrow-cyan"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L7,3 z" fill="#06b6d4" />
                  </marker>
                  <marker
                    id="arrow-green"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrow-red"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L7,3 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Edges from/to Aman Khan (Center: 50%, 46%) */}
                {/* 1. Riya Singh (25%, 22%) -> Aman Khan (50%, 46%) */}
                <line
                  x1="25%"
                  y1="22%"
                  x2="47%"
                  y2="43%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow-cyan)"
                  className="opacity-70"
                />

                {/* 2. AC455566 (50%, 15%) -> Aman Khan (50%, 46%) & Vikram J (75%, 22%) */}
                <line
                  x1="50%"
                  y1="19%"
                  x2="50%"
                  y2="40%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow-cyan)"
                  className="opacity-80"
                />
                <line
                  x1="54%"
                  y1="17%"
                  x2="72%"
                  y2="22%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow-cyan)"
                  className="opacity-70"
                />

                {/* 3. Vikram J. (75%, 22%) -> Aman Khan (50%, 46%) */}
                <line
                  x1="73%"
                  y1="25%"
                  x2="54%"
                  y2="43%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow-cyan)"
                  className="opacity-70"
                />

                {/* 4. AC987654 (22%, 46%) <-> Aman Khan (50%, 46%) */}
                <line
                  x1="26%"
                  y1="46%"
                  x2="45%"
                  y2="46%"
                  stroke="#10b981"
                  strokeWidth="2"
                  markerEnd="url(#arrow-green)"
                  className="opacity-85"
                />

                {/* 5. AC665577 (78%, 46%) <-> Aman Khan (50%, 46%) */}
                <line
                  x1="55%"
                  y1="46%"
                  x2="74%"
                  y2="46%"
                  stroke="#10b981"
                  strokeWidth="2"
                  markerEnd="url(#arrow-green)"
                  className="opacity-85"
                />

                {/* 6. Rahul Sharma (30%, 68%) -> Aman Khan (50%, 46%) */}
                <line
                  x1="33%"
                  y1="66%"
                  x2="47%"
                  y2="49%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  className="opacity-70"
                />

                {/* 7. AC112233 (50%, 75%) -> Aman Khan (50%, 46%) */}
                <line
                  x1="50%"
                  y1="70%"
                  x2="50%"
                  y2="52%"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-green)"
                  className="opacity-90"
                />

                {/* 8. Aman Khan (50%, 46%) -> Shakti Transport (75%, 68%) */}
                <line
                  x1="54%"
                  y1="49%"
                  x2="72%"
                  y2="66%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow-cyan)"
                  className="opacity-70"
                />
              </svg>

              {/* Edge Amount Badges / Labels */}
              {/* Riya Singh -> Aman */}
              <div className="absolute top-[31%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-cyan-500/30 text-[9.5px] font-mono text-cyan-300 shadow">
                ₹2,50,000
              </div>

              {/* AC455566 -> Aman */}
              <div className="absolute top-[28%] left-[53%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-cyan-500/30 text-[9.5px] font-mono text-cyan-300 shadow">
                ₹1,15,000
              </div>

              {/* Vikram -> Center */}
              <div className="absolute top-[33%] left-[64%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-cyan-500/30 text-[9.5px] font-mono text-cyan-300 shadow">
                ₹1,15,000
              </div>

              {/* Left AC987654 Connection 1 */}
              <div className="absolute top-[40%] left-[33%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-emerald-500/30 text-[9.5px] font-mono text-emerald-300 shadow">
                ₹1,50,000
              </div>

              {/* Left AC987654 Connection 2 */}
              <div className="absolute top-[48%] left-[37%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-emerald-500/30 text-[9.5px] font-mono text-emerald-300 shadow">
                ₹4,20,000
              </div>

              {/* Right AC665577 Connection */}
              <div className="absolute top-[42%] left-[64%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-emerald-500/30 text-[9.5px] font-mono text-emerald-300 shadow">
                ₹70,000
              </div>

              {/* Shakti Transport */}
              <div className="absolute top-[58%] left-[63%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-cyan-500/30 text-[9.5px] font-mono text-cyan-300 shadow">
                ₹2,00,000
              </div>

              {/* Bottom AC112233 */}
              <div className="absolute top-[62%] left-[53%] transform -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#061226]/90 border border-emerald-500/30 text-[9.5px] font-mono text-emerald-300 shadow">
                ₹3,20,000
              </div>

              {/* ─── GRAPH NODES ─── */}

              {/* 1. Top Left: Riya Singh (Person) */}
              <div
                onClick={() => setSelectedEntityId('AC998877')}
                className="absolute top-[22%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border-2 border-purple-500/80 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200 mt-1">Riya Singh</span>
              </div>

              {/* 2. Top Center: AC455566 (Account) */}
              <div
                onClick={() => setSelectedEntityId('AC455566')}
                className="absolute top-[15%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">AC455566</span>
                <span className="text-[9px] text-slate-400 font-mono">₹ 1,15,000</span>
              </div>

              {/* 3. Top Right: Vikram J. (Person) */}
              <div
                onClick={() => setSelectedEntityId('AC455566')}
                className="absolute top-[22%] left-[75%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border-2 border-purple-500/80 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200 mt-1">Vikram J.</span>
              </div>

              {/* 4. Center-Left: AC987654 (Account) */}
              <div
                onClick={() => setSelectedEntityId('AC987654')}
                className="absolute top-[46%] left-[22%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">AC987654</span>
                <span className="text-[9px] text-slate-400 font-mono">₹ 4,20,000</span>
              </div>

              {/* 5. CENTER NODE: Aman Khan (Suspect) */}
              <div
                onClick={() => setSelectedEntityId('AC987654')}
                className="absolute top-[46%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-r from-red-600 to-amber-600 shadow-[0_0_20px_rgba(239,68,68,0.7)] group-hover:scale-105 transition-transform">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      alt="Aman Khan"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-600 border-2 border-[#070e1f] rounded-full animate-ping"></span>
                </div>
                <span className="text-xs font-bold text-white mt-1.5 tracking-wide">
                  Aman Khan
                </span>
                <span className="text-[10px] text-slate-300 font-medium">
                  Risk Score: <span className="text-red-400 font-bold">92</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 text-[9px] font-bold mt-0.5 shadow">
                  High Risk
                </span>
              </div>

              {/* 6. Center-Right: AC665577 (Account) */}
              <div
                onClick={() => setSelectedEntityId('AC665577')}
                className="absolute top-[46%] left-[78%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">AC665577</span>
                <span className="text-[9px] text-slate-400 font-mono">₹ 70,000</span>
              </div>

              {/* 7. Bottom-Left: Rahul Sharma (Person) */}
              <div
                onClick={() => setSelectedEntityId('AC987654')}
                className="absolute top-[68%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border-2 border-purple-500/80 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200 mt-1">Rahul Sharma</span>
              </div>

              {/* 8. Bottom-Center: AC112233 (Account) */}
              <div
                onClick={() => setSelectedEntityId('AC112233')}
                className="absolute top-[75%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">AC112233</span>
                <span className="text-[9px] text-slate-400 font-mono">₹ 2,80,000</span>
              </div>

              {/* 9. Bottom-Right: Shakti Transport Pvt. Ltd. (Entity) */}
              <div
                onClick={() => setSelectedEntityId('AC665577')}
                className="absolute top-[68%] left-[75%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border-2 border-purple-500/80 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-200 mt-1 text-center max-w-[100px] leading-tight">
                  Shakti Transport Pvt. Ltd.
                </span>
              </div>
            </div>

            {/* Bottom-Left Graph Legend Overlay */}
            <div className="absolute bottom-3 left-3 p-2.5 rounded-lg bg-[#060c1c]/90 border border-[#142340] backdrop-blur-md text-[10px] space-y-2 z-20 shadow-lg pointer-events-auto">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Transaction Volume
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 border-t border-dashed border-cyan-400"></span>
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 border-t border-solid border-cyan-400"></span>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 border-t-2 border-solid border-cyan-400"></span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#142340] pt-1.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Amount Range
                </div>
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>&lt; ₹50K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>₹50K - ₹2L</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>₹2L - ₹10L</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>&gt; ₹10L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right Graph Canvas Controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
              <button
                onClick={() => onSelectAction?.('Expand Money Flow Network')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Expand View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom('reset')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Recenter"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: TRANSACTION TIMELINE (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 rounded-lg bg-[#070e1f] border border-[#132342] flex flex-col min-h-[460px] shadow-md">
          {/* Header */}
          <div className="p-3 border-b border-[#12203c] flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              TRANSACTION TIMELINE
            </span>
            <button
              onClick={() => setActiveViewModal('timeline')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View All
            </button>
          </div>

          {/* Timeline Feed */}
          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3.5 relative overflow-y-auto">
            {/* Vertical timeline connector */}
            <div className="absolute left-[20px] top-6 bottom-10 w-0.5 bg-[#142646] z-0"></div>

            {/* Timeline Item 1 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-emerald-950/90 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Today 10:21 PM</span>
                  <span className="text-xs font-bold text-white">₹1,50,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  AC112233 → AC987654
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">UPI Transfer</div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-purple-950/90 border border-purple-500/80 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Today 08:47 PM</span>
                  <span className="text-xs font-bold text-white">₹2,00,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  Riya Singh → Aman Khan
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">IMPS</div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-emerald-950/90 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Today 07:32 PM</span>
                  <span className="text-xs font-bold text-white">₹70,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  Aman Khan → AC455566
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">NEFT</div>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-purple-950/90 border border-purple-500/80 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Yesterday 10:15 PM</span>
                  <span className="text-xs font-bold text-white">₹3,20,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  Rahul Sharma → Aman Khan
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">IMPS</div>
              </div>
            </div>

            {/* Timeline Item 5 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-emerald-950/90 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Yesterday 08:40 PM</span>
                  <span className="text-xs font-bold text-white">₹1,10,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  AC455566 → Vikram J.
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">UPI</div>
              </div>
            </div>

            {/* Timeline Item 6 */}
            <div className="flex items-start gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded bg-amber-950/90 border border-amber-500/80 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">26 Aug 2026 09:11 PM</span>
                  <span className="text-xs font-bold text-white">₹5,00,000</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                  Unknown → Aman Khan
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">RTGS</div>
              </div>
            </div>

            {/* View More Button */}
            <button
              onClick={() => setActiveViewModal('timeline')}
              className="w-full text-center py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline pt-2 border-t border-[#12203c]"
            >
              + 23 more transactions
            </button>
          </div>
        </div>

        {/* Right Column: SUSPICIOUS PATTERNS + ACCOUNT DETAILS (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 min-h-[460px]">
          {/* Top Half: SUSPICIOUS PATTERNS */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col flex-1 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                SUSPICIOUS PATTERNS
              </span>
              <button
                onClick={() => setActiveViewModal('patterns')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-2 pt-2 text-xs">
              {/* Pattern 1 */}
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-red-950/70 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">Layering detected</div>
                    <div className="text-[9.5px] text-slate-400">5 transactions in 3 accounts</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-red-500 shrink-0">High Risk</span>
              </div>

              {/* Pattern 2 */}
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-amber-950/70 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      Round amount transfers
                    </div>
                    <div className="text-[9.5px] text-slate-400">₹2,80,000 in last 48 hours</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-amber-500 shrink-0">Medium Risk</span>
              </div>

              {/* Pattern 3 */}
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-red-950/70 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      Rapid fund movement
                    </div>
                    <div className="text-[9.5px] text-slate-400">9 transactions within 2 hours</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-red-500 shrink-0">High Risk</span>
              </div>

              {/* Pattern 4 */}
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-amber-950/70 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0">
                    <GitFork className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      Structuring detected
                    </div>
                    <div className="text-[9.5px] text-slate-400">Multiple small transactions</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-amber-500 shrink-0">Medium Risk</span>
              </div>

              {/* Pattern 5 */}
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-red-950/70 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      Dormant account activity
                    </div>
                    <div className="text-[9.5px] text-slate-400">Account inactive for 180+ days</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-red-500 shrink-0">High Risk</span>
              </div>
            </div>
          </div>

          {/* Bottom Half: ACCOUNT DETAILS */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col flex-1 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                ACCOUNT DETAILS
              </span>
              <button
                onClick={() => onSelectAction?.(`Account Profile: ${selectedAccount.accountNumber}`)}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View Full Profile
              </button>
            </div>

            <div className="pt-2 flex-1 flex flex-col justify-between">
              {/* Account Title + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-950/70 border border-emerald-500/70 flex items-center justify-center text-emerald-400">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">{selectedAccount.accountNumber}</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10.5px] my-2 bg-[#050b18] p-2 rounded border border-[#0e1b33]">
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Account Holder</div>
                  <div className="font-semibold text-slate-200 truncate">
                    {selectedAccount.holderName}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Account Type</div>
                  <div className="font-semibold text-slate-200 truncate">
                    {selectedAccount.accountType}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Bank Name</div>
                  <div className="font-semibold text-slate-200 truncate">{selectedAccount.bankName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">IFSC Code</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {selectedAccount.ifscCode}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Opening Date</div>
                  <div className="font-semibold text-slate-200">{selectedAccount.openingDate}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Current Balance</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {selectedAccount.currentBalance}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Total Received</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {selectedAccount.totalReceived}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-medium">Total Sent</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {selectedAccount.totalSent}
                  </div>
                </div>
              </div>

              {/* Bottom Risk Score Meter */}
              <div className="flex items-center justify-between pt-1 border-t border-[#12203c]">
                <span className="text-[11px] font-medium text-slate-400">Risk Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-bold text-xs shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                    {selectedAccount.riskScore}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">/ 100</span>
                  <span className="text-[10px] font-bold text-red-500">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section (3 Columns): HIGH RISK ACCOUNTS + TOP TRANSACTION TYPES + LARGE TRANSACTIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Bottom Left: HIGH RISK ACCOUNTS Table (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              HIGH RISK ACCOUNTS
            </span>
            <button
              onClick={() => setActiveViewModal('high_risk')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[9.5px] font-bold text-slate-500 uppercase border-b border-[#12203c]/60">
                  <th className="pb-1.5 font-semibold">ACCOUNT NUMBER</th>
                  <th className="pb-1.5 font-semibold">ACCOUNT HOLDER</th>
                  <th className="pb-1.5 font-semibold">TOTAL RECEIVED</th>
                  <th className="pb-1.5 font-semibold text-right">RISK SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101b33]">
                {/* Row 1 */}
                <tr
                  onClick={() => setSelectedEntityId('AC987654')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-cyan-400 font-mono font-medium">AC987654</td>
                  <td className="py-2 text-slate-300 font-medium">Aman Khan</td>
                  <td className="py-2 font-mono text-slate-200">₹ 4,20,000</td>
                  <td className="py-2 text-right font-bold text-red-500">92 / 100</td>
                </tr>

                {/* Row 2 */}
                <tr
                  onClick={() => setSelectedEntityId('AC455566')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-cyan-400 font-mono font-medium">AC455566</td>
                  <td className="py-2 text-slate-300 font-medium">Vikram J.</td>
                  <td className="py-2 font-mono text-slate-200">₹ 1,15,000</td>
                  <td className="py-2 text-right font-bold text-amber-500">74 / 100</td>
                </tr>

                {/* Row 3 */}
                <tr
                  onClick={() => setSelectedEntityId('AC112233')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-cyan-400 font-mono font-medium">AC112233</td>
                  <td className="py-2 text-slate-300 font-medium">Unknown Entity</td>
                  <td className="py-2 font-mono text-slate-200">₹ 2,80,000</td>
                  <td className="py-2 text-right font-bold text-amber-500">68 / 100</td>
                </tr>

                {/* Row 4 */}
                <tr
                  onClick={() => setSelectedEntityId('AC665577')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-cyan-400 font-mono font-medium">AC665577</td>
                  <td className="py-2 text-slate-300 font-medium truncate max-w-[110px]">
                    Shakti Transport Pvt. Ltd.
                  </td>
                  <td className="py-2 font-mono text-slate-200">₹ 70,000</td>
                  <td className="py-2 text-right font-bold text-amber-500">61 / 100</td>
                </tr>

                {/* Row 5 */}
                <tr
                  onClick={() => setSelectedEntityId('AC998877')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-cyan-400 font-mono font-medium">AC998877</td>
                  <td className="py-2 text-slate-300 font-medium">Riya Singh</td>
                  <td className="py-2 font-mono text-slate-200">₹ 2,50,000</td>
                  <td className="py-2 text-right font-bold text-amber-500">58 / 100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Center: TOP TRANSACTION TYPES Donut Chart (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
          <div className="pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              TOP TRANSACTION TYPES
            </span>
          </div>

          <div className="flex-1 flex items-center justify-between gap-2 pt-2">
            {/* Donut Chart SVG */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[#0e1a33]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 1. UPI Transfer (53%) - Indigo/Purple */}
                <path
                  className="text-indigo-500 drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]"
                  strokeDasharray="53, 100"
                  strokeDashoffset="0"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 2. IMPS (27%) - Cyan/Blue */}
                <path
                  className="text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]"
                  strokeDasharray="27, 100"
                  strokeDashoffset="-53"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 3. NEFT (13%) - Emerald */}
                <path
                  className="text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                  strokeDasharray="13, 100"
                  strokeDashoffset="-80"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* 4. Cash Deposit (6%) - Amber */}
                <path
                  className="text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                  strokeDasharray="6, 100"
                  strokeDashoffset="-93"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-white leading-tight">2,348</span>
                <span className="text-[8.5px] text-slate-400 font-medium">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 space-y-1 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-indigo-500"></span>
                  <span className="text-slate-300">UPI Transfer</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">1,256 (53%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
                  <span className="text-slate-300">IMPS</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">642 (27%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400"></span>
                  <span className="text-slate-300">NEFT</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">312 (13%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-amber-500"></span>
                  <span className="text-slate-300">Cash Deposit</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">138 (6%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-blue-400"></span>
                  <span className="text-slate-300">RTGS</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">0 (0%)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-slate-500"></span>
                  <span className="text-slate-300">Others</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">0 (0%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right: LARGE TRANSACTIONS Table (Spans 5 cols on lg) */}
        <div className="lg:col-span-5 rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              LARGE TRANSACTIONS
            </span>
            <button
              onClick={() => setActiveViewModal('large_tx')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[9.5px] font-bold text-slate-500 uppercase border-b border-[#12203c]/60">
                  <th className="pb-1.5 font-semibold">DATE & TIME</th>
                  <th className="pb-1.5 font-semibold">FROM</th>
                  <th className="pb-1.5 font-semibold">TO</th>
                  <th className="pb-1.5 font-semibold">AMOUNT</th>
                  <th className="pb-1.5 font-semibold">TYPE</th>
                  <th className="pb-1.5 font-semibold text-right">RISK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101b33]">
                {/* Row 1 */}
                <tr className="hover:bg-blue-600/10 transition-colors">
                  <td className="py-2 text-[10px] text-slate-400">27 Aug 2026, 10:21 PM</td>
                  <td className="py-2 text-cyan-400 font-mono">AC112233</td>
                  <td className="py-2 text-cyan-400 font-mono">AC987654</td>
                  <td className="py-2 font-mono font-medium text-slate-200">₹ 1,50,000</td>
                  <td className="py-2 text-[11px] text-slate-300">UPI</td>
                  <td className="py-2 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 text-[9.5px] font-bold">
                      High
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-blue-600/10 transition-colors">
                  <td className="py-2 text-[10px] text-slate-400">27 Aug 2026, 08:47 PM</td>
                  <td className="py-2 text-slate-300 font-medium">Riya Singh</td>
                  <td className="py-2 text-slate-300 font-medium">Aman Khan</td>
                  <td className="py-2 font-mono font-medium text-slate-200">₹ 2,00,000</td>
                  <td className="py-2 text-[11px] text-slate-300">IMPS</td>
                  <td className="py-2 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 text-[9.5px] font-bold">
                      High
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-blue-600/10 transition-colors">
                  <td className="py-2 text-[10px] text-slate-400">27 Aug 2026, 07:32 PM</td>
                  <td className="py-2 text-slate-300 font-medium">Aman Khan</td>
                  <td className="py-2 text-cyan-400 font-mono">AC455566</td>
                  <td className="py-2 font-mono font-medium text-slate-200">₹ 70,000</td>
                  <td className="py-2 text-[11px] text-slate-300">NEFT</td>
                  <td className="py-2 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-400 text-[9.5px] font-bold">
                      Medium
                    </span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-blue-600/10 transition-colors">
                  <td className="py-2 text-[10px] text-slate-400">26 Aug 2026, 09:11 PM</td>
                  <td className="py-2 text-slate-300 font-medium">Unknown</td>
                  <td className="py-2 text-slate-300 font-medium">Aman Khan</td>
                  <td className="py-2 font-mono font-medium text-slate-200">₹ 5,00,000</td>
                  <td className="py-2 text-[11px] text-slate-300">RTGS</td>
                  <td className="py-2 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 text-[9.5px] font-bold">
                      High
                    </span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-blue-600/10 transition-colors">
                  <td className="py-2 text-[10px] text-slate-400">26 Aug 2026, 06:22 PM</td>
                  <td className="py-2 text-slate-300 font-medium">Vikram J.</td>
                  <td className="py-2 text-cyan-400 font-mono">AC112233</td>
                  <td className="py-2 font-mono font-medium text-slate-200">₹ 1,10,000</td>
                  <td className="py-2 text-[11px] text-slate-300">UPI</td>
                  <td className="py-2 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-400 text-[9.5px] font-bold">
                      Medium
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* View More Large Transactions Link */}
          <button
            onClick={() => setActiveViewModal('large_tx')}
            className="w-full text-center py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline pt-2 border-t border-[#12203c] mt-auto"
          >
            + 15 more large transactions
          </button>
        </div>
      </div>

      {/* ─── Detail Modals ─── */}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                Filter Financial Intelligence
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Minimum Amount Threshold
                </label>
                <input
                  type="text"
                  defaultValue="₹ 50,000"
                  className="w-full px-3 py-1.5 bg-[#050b18] border border-[#172a4e] rounded text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Risk Level
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 rounded bg-red-950/70 border border-red-500/60 text-red-300 font-medium">
                    High Risk
                  </button>
                  <button className="flex-1 py-1.5 rounded bg-amber-950/70 border border-amber-500/60 text-amber-300 font-medium">
                    Medium Risk
                  </button>
                  <button className="flex-1 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                    All
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Transaction Types
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'IMPS', 'NEFT', 'RTGS', 'Cash Deposit', 'Hawala'].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-1.5 text-slate-300 cursor-pointer"
                    >
                      <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#162747]">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Modal */}
      {activeViewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeViewModal === 'timeline' && 'Full Transaction Timeline Feed'}
                {activeViewModal === 'patterns' && 'All Detected Suspicious Patterns'}
                {activeViewModal === 'high_risk' && 'All High Risk Account Dossiers'}
                {activeViewModal === 'large_tx' && 'Large & Anomalous Transactions'}
              </h3>
              <button
                onClick={() => setActiveViewModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              <p className="text-slate-400">
                Detailed audit and ledger verification report generated for{' '}
                <span className="text-cyan-400 font-semibold">{activeDateRange}</span>.
              </p>
              <div className="p-3 bg-[#050b18] rounded-lg border border-[#142340] text-slate-300 leading-relaxed">
                All records have been synchronized with the Central Financial Intelligence Unit (FIU) and verified against the Blockchain Vault with immutable cryptographic audit trail.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#162747]">
              <button
                onClick={() => setActiveViewModal(null)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
