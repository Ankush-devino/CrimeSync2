import React, { useState, useEffect } from 'react';
import {
  Search,
  Box,
  Layers,
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Eye,
  X,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  Zap,
  ArrowRight,
  Server,
  Radio,
  FileText,
  Sliders,
  ChevronRight,
  Sparkles,
  Fingerprint
} from 'lucide-react';

interface BlockchainExplorerPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface BlockItem {
  id: string;
  blockNumber: number;
  hash: string;
  previousHash: string;
  transactionsCount: number;
  timestamp: string;
  size: string;
  validator: string;
  validatorAddress: string;
  status: 'Confirmed' | 'Pending' | 'Finalized';
  gasUsed: string;
  gasLimit: string;
  merkleRoot: string;
  evidenceItems: {
    txHash: string;
    evidenceId: string;
    evidenceName: string;
    action: string;
    sender: string;
    recipient: string;
    gasFee: string;
    timestamp: string;
  }[];
}

const SAMPLE_BLOCKS: BlockItem[] = [
  {
    id: 'b-15842',
    blockNumber: 15842,
    hash: '0x7f1ac09d2e6f11ab09c2de6f8812c9842109eefa418471b021dae984210912bc',
    previousHash: '0x3ab9211f7e854c3b58c2deefa418471b021dae984210912bcde43c99abf28741',
    transactionsCount: 12,
    timestamp: '27 Aug 2026, 10:42 PM',
    size: '1.24 MB',
    validator: 'Node-07 (Delhi Cyber Cell)',
    validatorAddress: '0x71C...9B02',
    status: 'Confirmed',
    gasUsed: '8,412,900 (56.2%)',
    gasLimit: '15,000,000',
    merkleRoot: '0x99fe18471b021dae984210912bcde43c99abf28741e12db984aa712c9842109e',
    evidenceItems: [
      {
        txHash: '0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4',
        evidenceId: 'EV-1246',
        evidenceName: 'FIR_4587_Theft_Case.pdf',
        action: 'Evidence DNA Hash Sealing',
        sender: '0xSI_Amit_Verma (DL-POL-8419)',
        recipient: '0xVault_Master_Contract',
        gasFee: '0.0024 POL',
        timestamp: '10:42:15 PM'
      },
      {
        txHash: '0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984',
        evidenceId: 'EV-1246',
        evidenceName: 'FIR_4587_Theft_Case.pdf',
        action: 'Custody Transfer to Insp. Sharma',
        sender: '0xInsp_R_Sharma (DL-POL-3301)',
        recipient: '0xCustody_Registry_v2',
        gasFee: '0.0019 POL',
        timestamp: '10:42:18 PM'
      },
      {
        txHash: '0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a',
        evidenceId: 'EV-1245',
        evidenceName: 'Call_Record_Dump_Khan.csv',
        action: 'CDR Tower Triangulation Anchor',
        sender: '0xForensic_Analyst_P_Singh',
        recipient: '0xTelecom_Evidence_Vault',
        gasFee: '0.0031 POL',
        timestamp: '10:42:22 PM'
      },
      {
        txHash: '0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e',
        evidenceId: 'EV-1244',
        evidenceName: 'Hawala_Voucher_Stamp_33.jpg',
        action: 'Steganographic Watermark Registration',
        sender: '0xED_Officer_M_Iyer',
        recipient: '0xDeception_Watermark_Hub',
        gasFee: '0.0028 POL',
        timestamp: '10:42:26 PM'
      }
    ]
  },
  {
    id: 'b-15841',
    blockNumber: 15841,
    hash: '0x3ab9211f7e854c3b58c2deefa418471b021dae984210912bcde43c99abf28741',
    previousHash: '0x7d6e9a2b1c6a5e4c88bb3311eefa418471b021dae984210912bcde43c99abf28',
    transactionsCount: 18,
    timestamp: '27 Aug 2026, 10:40 PM',
    size: '2.18 MB',
    validator: 'Node-12 (CBI Forensic Server)',
    validatorAddress: '0x19B...44AA',
    status: 'Finalized',
    gasUsed: '11,840,200 (78.9%)',
    gasLimit: '15,000,000',
    merkleRoot: '0x77aa12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db98',
    evidenceItems: [
      {
        txHash: '0x88bb3311eefa418471b021dae984210912bcde43c99abf28741e12db984aa712',
        evidenceId: 'EV-1243',
        evidenceName: 'Bank_Statement_ICICI_Hawala.pdf',
        action: 'Bank Freeze Signature Attestation',
        sender: '0xED_HQ_Delhi',
        recipient: '0xFinancial_Freeze_Registry',
        gasFee: '0.0042 POL',
        timestamp: '10:40:02 PM'
      }
    ]
  },
  {
    id: 'b-15840',
    blockNumber: 15840,
    hash: '0x7d6e9a2b1c6a5e4c88bb3311eefa418471b021dae984210912bcde43c99abf28',
    previousHash: '0x9f1af06c55d4a1a2334b0981eefa418471b021dae984210912bcde43c99abf28',
    transactionsCount: 15,
    timestamp: '27 Aug 2026, 10:38 PM',
    size: '1.56 MB',
    validator: 'Node-03 (CERT-In Ledger Node)',
    validatorAddress: '0x33C...8811',
    status: 'Finalized',
    gasUsed: '9,210,000 (61.4%)',
    gasLimit: '15,000,000',
    merkleRoot: '0x22bcde43c99abf28741e12db984aa712c9842109eefa418471b021dae9842109',
    evidenceItems: []
  },
  {
    id: 'b-15839',
    blockNumber: 15839,
    hash: '0x9f1af06c55d4a1a2334b0981eefa418471b021dae984210912bcde43c99abf28',
    previousHash: '0x0a1bc2dd44e5fa7b99fe8831eefa418471b021dae984210912bcde43c99abf28',
    transactionsCount: 20,
    timestamp: '27 Aug 2026, 10:36 PM',
    size: '2.45 MB',
    validator: 'Node-09 (NIA Intelligence Cluster)',
    validatorAddress: '0x99D...22EF',
    status: 'Finalized',
    gasUsed: '13,420,100 (89.5%)',
    gasLimit: '15,000,000',
    merkleRoot: '0x55aa418471b021dae984210912bcde43c99abf28741e12db984aa712c9842109',
    evidenceItems: []
  },
  {
    id: 'b-15838',
    blockNumber: 15838,
    hash: '0x0a1bc2dd44e5fa7b99fe8831eefa418471b021dae984210912bcde43c99abf28',
    previousHash: '0x44bc12ef8812c9842109eefa418471b021dae984210912bcde43c99abf28741',
    transactionsCount: 11,
    timestamp: '27 Aug 2026, 10:34 PM',
    size: '1.12 MB',
    validator: 'Node-01 (Primary Police Genesis)',
    validatorAddress: '0x01A...00FF',
    status: 'Finalized',
    gasUsed: '7,100,500 (47.3%)',
    gasLimit: '15,000,000',
    merkleRoot: '0x11bcde43c99abf28741e12db984aa712c9842109eefa418471b021dae9842109',
    evidenceItems: []
  }
];

export const BlockchainExplorerPage: React.FC<BlockchainExplorerPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [selectedBlockId, setSelectedBlockId] = useState<number>(15842);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);
  const [isBlockDetailModalOpen, setIsBlockDetailModalOpen] = useState<boolean>(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<any | null>(null);

  const currentBlock = SAMPLE_BLOCKS.find((b) => b.blockNumber === selectedBlockId) || SAMPLE_BLOCKS[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();
    
    // Search by block number
    const num = parseInt(query.replace('#', ''));
    if (!isNaN(num)) {
      const match = SAMPLE_BLOCKS.find((b) => b.blockNumber === num);
      if (match) {
        setSelectedBlockId(match.blockNumber);
        if (onSelectAction) onSelectAction(`Navigated to Block #${match.blockNumber}`);
        return;
      }
    }

    // Search by hash
    const matchHash = SAMPLE_BLOCKS.find((b) => b.hash.toLowerCase().includes(query));
    if (matchHash) {
      setSelectedBlockId(matchHash.blockNumber);
      if (onSelectAction) onSelectAction(`Located Block for Hash: ${query}`);
      return;
    }

    if (onSelectAction) onSelectAction(`Executed Blockchain Query: ${searchQuery}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-5 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#111e33]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <Search className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
              BLOCKCHAIN EXPLORER
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Explore blockchain network for evidence transactions
          </p>
        </div>

        {/* Page / Block Filter Pagination Pills (1 2 3 4 5) */}
        <div className="flex items-center gap-2 bg-[#081022] p-1.5 rounded-xl border border-[#14233c] shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
            Epoch:
          </span>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => {
                setSelectedPageNum(num);
                const blockNum = 15842 - (num - 1);
                setSelectedBlockId(blockNum);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                selectedPageNum === num
                  ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] scale-110'
                  : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top 5 Stat Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: TOTAL BLOCKS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Box className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL BLOCKS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              15,842
            </div>
            <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
              ↑ 218 this week
            </div>
          </div>
        </div>

        {/* Metric 2: TOTAL TRANSACTIONS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              TOTAL TRANSACTIONS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              32,456
            </div>
            <div className="text-[10px] font-semibold text-purple-300">
              ↑ 346 this week
            </div>
          </div>
        </div>

        {/* Metric 3: EVIDENCE ON CHAIN */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              EVIDENCE ON CHAIN
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              1,246
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              100% Verified
            </div>
          </div>
        </div>

        {/* Metric 4: NETWORK HEALTH */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-teal-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(20,184,166,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-teal-400/90 uppercase tracking-wider">
              NETWORK HEALTH
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              99.9%
            </div>
            <div className="text-[10px] font-semibold text-teal-400">
              Excellent
            </div>
          </div>
        </div>

        {/* Metric 5: AVG BLOCK TIME */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-amber-400/90 uppercase tracking-wider">
              AVG BLOCK TIME
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              2.3 sec
            </div>
            <div className="text-[10px] font-semibold text-amber-400">
              Polygon PoS
            </div>
          </div>
        </div>

      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-[#070e1c] border border-[#14233c] focus-within:border-purple-500 rounded-xl px-3.5 py-2 shadow-inner transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Block Number (#15842), Block Hash (0x7f1ac...), or Evidence Transaction..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* ── Main Two-Column Core Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ── 1. LATEST BLOCKS TABLE (Left Column - 8 cols) ───────────────────── */}
        <div className="lg:col-span-8 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Blue Background Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                LATEST BLOCKS
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE CONSENSUS</span>
              </div>
            </div>

            {/* Blocks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-[#091224]/50">
                    <th className="py-2.5 px-3">BLOCK ID</th>
                    <th className="py-2.5 px-3">HASH</th>
                    <th className="py-2.5 px-3 text-center">TRANSACTIONS</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">SIZE</th>
                    <th className="py-2.5 px-3">VALIDATOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono">
                  {SAMPLE_BLOCKS.map((block) => {
                    const isSelected = block.blockNumber === currentBlock.blockNumber;
                    return (
                      <tr
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.blockNumber)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0f1e3d] border-l-2 border-l-purple-500 text-white font-semibold'
                            : 'hover:bg-[#091428] text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-white">
                          #{block.blockNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline">
                            {block.hash.substring(0, 18)}...
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          {block.transactionsCount}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">
                          {block.timestamp}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {block.size}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-200">
                          {block.validator.split(' ')[0]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Centered Action Button: VIEW ALL BLOCKS */}
          <div className="pt-4 mt-4 border-t border-[#14233c] flex items-center justify-center">
            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="py-2.5 px-8 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all flex items-center gap-2 active:scale-[0.99]"
            >
              <Database className="w-4 h-4" />
              <span>VIEW ALL BLOCKS</span>
            </button>
          </div>
        </div>

        {/* ── 2. BLOCK DETAILS (Right Column - 4 cols) ───────────────────────── */}
        <div className="lg:col-span-4 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Purple Glow */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                BLOCK DETAILS
              </h2>
              <span className="font-mono text-xs font-bold text-white bg-[#091224] px-2 py-0.5 rounded border border-slate-700">
                #{currentBlock.blockNumber}
              </span>
            </div>

            {/* Key-Value Block Metadata */}
            <div className="space-y-3 font-mono text-xs">
              
              {/* Block ID */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans">Block ID</span>
                <span className="font-bold text-white">#{currentBlock.blockNumber}</span>
              </div>

              {/* Hash with Copy */}
              <div className="space-y-1 pb-2 border-b border-[#14233c]/60">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Hash</span>
                  <button
                    onClick={() => copyToClipboard(currentBlock.hash)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  onClick={() => copyToClipboard(currentBlock.hash)}
                  className="text-[11px] text-cyan-300 bg-[#091224] p-1.5 rounded border border-slate-800 break-all cursor-pointer hover:border-slate-600"
                  title={currentBlock.hash}
                >
                  {currentBlock.hash.substring(0, 26)}...
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans">Timestamp</span>
                <span className="text-slate-200 text-[11px]">{currentBlock.timestamp}</span>
              </div>

              {/* Transactions */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans">Transactions</span>
                <span className="font-bold text-white">{currentBlock.transactionsCount}</span>
              </div>

              {/* Size */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans">Size</span>
                <span className="text-slate-200">{currentBlock.size}</span>
              </div>

              {/* Previous Hash */}
              <div className="space-y-1 pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans block">Previous Hash</span>
                <div
                  className="text-[10.5px] text-slate-300 bg-[#091224] p-1.5 rounded border border-slate-800 break-all cursor-pointer hover:border-slate-600"
                  title={currentBlock.previousHash}
                >
                  {currentBlock.previousHash.substring(0, 26)}...
                </div>
              </div>

              {/* Validator */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-slate-400 font-sans">Validator</span>
                <span className="font-medium text-slate-200 text-[11px]">{currentBlock.validator.split(' ')[0]}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-sans">Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Confirmed
                </span>
              </div>

            </div>
          </div>

          {/* Full-width Button: VIEW BLOCK */}
          <div className="pt-4 mt-4 border-t border-[#14233c]">
            <button
              onClick={() => setIsBlockDetailModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Eye className="w-4 h-4" />
              <span>VIEW BLOCK</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: VIEW ALL BLOCKS (Comprehensive Explorer) ───────────────────── */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  NATIONAL CRIMINAL BLOCKCHAIN MASTER LEDGER • 15,842 BLOCKS
                </h3>
              </div>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Search & Table */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-[#091224]/80">
                      <th className="py-2.5 px-3">Block</th>
                      <th className="py-2.5 px-3">Hash Digest</th>
                      <th className="py-2.5 px-3">Gas Consumed</th>
                      <th className="py-2.5 px-3">Tx Count</th>
                      <th className="py-2.5 px-3">Validator Node</th>
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {SAMPLE_BLOCKS.map((b) => (
                      <tr key={b.id} className="hover:bg-[#091428] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">#{b.blockNumber}</td>
                        <td className="py-2.5 px-3 text-cyan-400 truncate max-w-[160px]">{b.hash}</td>
                        <td className="py-2.5 px-3 text-slate-300">{b.gasUsed}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{b.transactionsCount}</td>
                        <td className="py-2.5 px-3 text-slate-200">{b.validator}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedBlockId(b.blockNumber);
                              setIsViewAllModalOpen(false);
                              setIsBlockDetailModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[10px] font-semibold transition-all"
                          >
                            View Block
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between text-xs text-slate-400">
              <span>Polygon PoS Consensus • Proof of Authority Architecture</span>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DEEP BLOCK & TRANSACTIONS INSPECTOR ──────────────────────── */}
      {isBlockDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  BLOCK #{currentBlock.blockNumber} • TRANSACTIONS MANIFEST
                </h3>
              </div>
              <button
                onClick={() => setIsBlockDetailModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto text-xs font-mono">
              {/* Block Header Summary */}
              <div className="p-3.5 rounded-xl bg-[#091224] border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Block Height</span>
                  <span className="font-bold text-white">#{currentBlock.blockNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Txs</span>
                  <span className="font-bold text-cyan-400">{currentBlock.transactionsCount} Transactions</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gas Utilized</span>
                  <span className="font-bold text-purple-300">{currentBlock.gasUsed}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consensus Status</span>
                  <span className="font-bold text-emerald-400">Finalized (100%)</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300 font-sans flex items-center justify-between">
                  <span>Sealed Evidence Transactions ({currentBlock.evidenceItems.length}):</span>
                  <span className="text-slate-500 text-[10px]">Sorted by Nonce Index</span>
                </div>

                {currentBlock.evidenceItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#091224] text-center text-slate-400 font-sans">
                    No individual transaction payloads cached for this historical block.
                  </div>
                ) : (
                  currentBlock.evidenceItems.map((tx, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedTxDetail(tx)}
                      className="p-3 rounded-xl bg-[#091224] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold text-xs">{tx.action}</span>
                        <span className="text-slate-400 text-[10px]">{tx.timestamp}</span>
                      </div>
                      <div className="text-slate-200 text-xs font-sans font-semibold">
                        {tx.evidenceId} • {tx.evidenceName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="truncate pr-2">Tx: {tx.txHash.substring(0, 30)}...</span>
                        <span className="text-purple-300 flex-shrink-0 font-bold">{tx.gasFee}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('evidence-dna');
                    setIsBlockDetailModalOpen(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Inspect in Evidence DNA →
              </button>
              <button
                onClick={() => setIsBlockDetailModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: TX PAYLOAD DETAIL MODAL ──────────────────────────────────── */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  TRANSACTION FORENSIC PAYLOAD
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Action:</span>
                  <span className="text-white font-bold">{selectedTxDetail.action}</span>
                </div>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-slate-400">Target Evidence:</span>
                  <span className="text-cyan-300 font-bold">{selectedTxDetail.evidenceId} ({selectedTxDetail.evidenceName})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gas Fee:</span>
                  <span className="text-emerald-400 font-bold">{selectedTxDetail.gasFee}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">Sender Key:</span>
                  <span className="text-purple-300 break-all text-[10px]">{selectedTxDetail.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">Smart Contract Recipient:</span>
                  <span className="text-cyan-300 break-all text-[10px]">{selectedTxDetail.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans">Transaction Hash:</span>
                  <span className="text-emerald-300 break-all text-[10px]">{selectedTxDetail.txHash}</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
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

export default BlockchainExplorerPage;
