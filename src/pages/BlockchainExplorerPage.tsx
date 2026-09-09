import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Box, Layers, Activity, Clock, ShieldCheck, CheckCircle2, Copy,
  Check, Eye, X, RefreshCw, Database, Lock, Zap, FileText,
  Fingerprint, AlertTriangle, ShieldAlert, Hash, GitBranch, Send,
  PlusCircle, Network, ListChecks, CircuitBoard, BrainCircuit, Radio,
  Server, Award, TrendingUp, ArrowRight, Cpu, Link, Globe
} from 'lucide-react';
import { api } from '../services/api';

interface BlockchainExplorerPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}
interface TxItem {
  txHash: string; evidenceId: string; evidenceTitle: string;
  officerBadge: string; action: string; fromOfficer?: string;
  toOfficer?: string; location?: string; sha256Hash: string;
  digitalSignature: string; timestamp: string; blockNumber?: number;
  status: 'Confirmed' | 'Pending';
}
interface BlockItem {
  blockNumber: number; blockHash: string; previousHash: string;
  transactionsCount: number; merkleRoot: string; nonce: number;
  timestamp: string; validator: string; validatorAddress: string;
  gasUsed: string; sizeKb: string; status: 'Finalized' | 'Validating';
  transactions: TxItem[];
}
interface ChainStats {
  chainNetwork: string; smartContractAddress: string; latestBlockHeight: number;
  totalBlocks: number; totalTransactions: number; totalAnchoredEvidences: number;
  integrityScore: number; avgBlockTimeSec: number; activeValidators: number; isChainIntact: boolean;
}
interface VerifyResult {
  verified: boolean; hash: string; blockNumber: number; blockHash: string;
  merkleRoot: string; merkleProof: string[]; timestamp: string;
  validator: string; validatorAddress: string; transaction: TxItem | null;
  evidence: any; zkSnarkProof: string; smartContract: string; status: string;
}
interface AuditResult {
  isValid: boolean; totalBlocks: number; totalTransactions: number;
  violations: string[]; rootHash: string;
}

const ACTION_STYLES: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  COLLECTED:   { text: 'text-emerald-300', bg: 'bg-emerald-950/60', border: 'border-emerald-500/50', dot: 'bg-emerald-400' },
  TRANSFERRED: { text: 'text-cyan-300',    bg: 'bg-cyan-950/60',    border: 'border-cyan-500/50',    dot: 'bg-cyan-400'    },
  ANALYZED:    { text: 'text-purple-300',  bg: 'bg-purple-950/60',  border: 'border-purple-500/50',  dot: 'bg-purple-400'  },
  SEALED:      { text: 'text-amber-300',   bg: 'bg-amber-950/60',   border: 'border-amber-500/50',   dot: 'bg-amber-400'   },
  VERIFIED:    { text: 'text-blue-300',    bg: 'bg-blue-950/60',    border: 'border-blue-500/50',    dot: 'bg-blue-400'    },
  SUBMITTED:   { text: 'text-pink-300',    bg: 'bg-pink-950/60',    border: 'border-pink-500/50',    dot: 'bg-pink-400'    },
};
const gAS = (a: string) => ACTION_STYLES[a?.toUpperCase()] ?? { text: 'text-slate-300', bg: 'bg-slate-800/60', border: 'border-slate-600/40', dot: 'bg-slate-400' };

function useCounter(target: number, dur = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let s = 0; const step = target / (dur / 16);
    const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

const BlockChainVisual: React.FC<{ blocks: BlockItem[]; sel: BlockItem | null; onSel: (b: BlockItem) => void }> = ({ blocks, sel, onSel }) => (
  <div className="flex items-center overflow-x-auto py-2 px-1 gap-0">
    {blocks.slice(0, 6).map((block, idx) => {
      const isSel = sel?.blockNumber === block.blockNumber;
      return (
        <React.Fragment key={block.blockNumber}>
          <div onClick={() => onSel(block)}
            className={`flex-shrink-0 cursor-pointer rounded-xl border-2 p-3 transition-all w-36 relative ${isSel ? 'border-purple-400 bg-[#1a0d3d] shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'border-[#1a2d4d] bg-[#081222] hover:border-blue-500/50'}`}>
            {idx === 0 && <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"><span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />LIVE</div>}
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Block</div>
            <div className="text-sm font-black text-white font-mono">#{block.blockNumber}</div>
            <div className="text-[9px] text-cyan-400 font-mono mt-1 truncate">{block.blockHash?.substring(0, 10)}…</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-slate-400">{block.transactionsCount} txs</span>
              <span className={`w-1.5 h-1.5 rounded-full ${block.status === 'Finalized' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[#14233c] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${Math.min(100, (block.transactionsCount / 20) * 100)}%` }} />
            </div>
          </div>
          {idx < Math.min(blocks.length, 6) - 1 && (
            <div className="flex-shrink-0 flex flex-col items-center w-8">
              <div className="w-full h-px bg-gradient-to-r from-cyan-500/60 to-purple-500/60" />
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className="text-[7px] text-slate-600 font-mono">hash</div>
            </div>
          )}
        </React.Fragment>
      );
    })}
    {blocks.length > 6 && <div className="flex-shrink-0 ml-2 text-[10px] text-slate-500 font-mono">+{blocks.length - 6} more</div>}
  </div>
);

const MerkleTreeVisual: React.FC<{ proof: string[]; root: string; leafHash: string }> = ({ proof, root, leafHash }) => {
  const levels = [root, ...proof.slice().reverse(), leafHash];
  return (
    <div className="space-y-1">
      {levels.map((hash, i) => {
        const isRoot = i === 0; const isLeaf = i === levels.length - 1;
        return (
          <div key={i} className="flex items-center gap-2" style={{ marginLeft: i * 14 }}>
            {i > 0 && <div className="w-3 h-3 border-l-2 border-b-2 border-slate-600 rounded-bl-sm flex-shrink-0" />}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono flex-1 min-w-0 ${isRoot ? 'border-purple-500/60 bg-purple-950/40 text-purple-300' : isLeaf ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' : 'border-slate-700/60 bg-[#091224] text-slate-400'}`}>
              <GitBranch className={`w-2.5 h-2.5 flex-shrink-0 ${isRoot ? 'text-purple-400' : isLeaf ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className="truncate">{(hash || '').substring(0, 20)}…</span>
              <span className={`ml-auto flex-shrink-0 text-[8px] font-bold ${isRoot ? 'text-purple-400' : isLeaf ? 'text-emerald-400' : 'text-slate-600'}`}>{isRoot ? 'ROOT' : isLeaf ? 'LEAF' : `N${i}`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MiningAnimation: React.FC<{ active: boolean }> = ({ active }) => {
  const [hashDisplay, setHashDisplay] = useState('0x' + '0'.repeat(62));
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!active) return;
    const chars = '0123456789abcdef';
    const t = setInterval(() => {
      setNonce(n => n + Math.floor(Math.random() * 100));
      setHashDisplay('0x' + Array.from({ length: 62 }, () => chars[Math.floor(Math.random() * 16)]).join(''));
    }, 80);
    return () => clearInterval(t);
  }, [active]);
  if (!active) return null;
  return (
    <div className="p-4 rounded-xl bg-[#020810] border border-cyan-500/30 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
      <div className="flex items-center gap-2 text-xs font-bold text-cyan-400"><Cpu className="w-4 h-4 animate-spin" />MINING — PROOF OF WORK IN PROGRESS</div>
      <div className="font-mono text-[10px] text-cyan-300 break-all animate-pulse">{hashDisplay}</div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-500">Nonce: <span className="text-amber-400 font-mono">{nonce.toLocaleString()}</span></span>
        <span className="text-slate-500">Difficulty: <span className="text-purple-400">0x0000FF</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-[#14233c] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
};

const VD = [
  { id: 'N01', name: 'CBI Delhi Central', city: 'Delhi', status: 'active', blocks: 4821, x: 50, y: 28 },
  { id: 'N03', name: 'FSL Bengaluru', city: 'Bengaluru', status: 'active', blocks: 3901, x: 42, y: 62 },
  { id: 'N07', name: 'Delhi Cyber Cell', city: 'Delhi', status: 'active', blocks: 2944, x: 72, y: 22 },
  { id: 'N09', name: 'NIA Intelligence', city: 'Mumbai', status: 'active', blocks: 2102, x: 18, y: 52 },
  { id: 'N12', name: 'CBI Forensic Lab', city: 'Kolkata', status: 'syncing', blocks: 1890, x: 78, y: 58 },
  { id: 'N14', name: 'CERT-In Ledger', city: 'Hyderabad', status: 'active', blocks: 1204, x: 28, y: 78 },
];

const ValidatorNetwork: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const t = setInterval(() => setPulse(p => (p + 1) % 6), 800); return () => clearInterval(t); }, []);
  return (
    <div className="relative w-full" style={{ paddingBottom: '54%' }}>
      <div className="absolute inset-0">
        <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-20">
          {VD.map((a, i) => VD.slice(i + 1).map(b => (
            <line key={`${a.id}-${b.id}`} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="url(#lg1)" strokeWidth="1" strokeDasharray="4 4" />
          )))}
          <defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
        </svg>
        {VD.map((v, i) => (
          <button key={v.id} onClick={() => setActiveNode(activeNode === v.id ? null : v.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${v.x}%`, top: `${v.y}%` }}>
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${v.status === 'active' ? pulse === i % 6 ? 'border-cyan-400 bg-cyan-950 shadow-[0_0_16px_rgba(6,182,212,0.8)] scale-125' : 'border-cyan-500/70 bg-cyan-950/60' : 'border-amber-500/70 bg-amber-950/60'}`}>
              <Server className={`w-3.5 h-3.5 ${v.status === 'active' ? 'text-cyan-300' : 'text-amber-300'}`} />
            </div>
            <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap ${v.status === 'active' ? 'text-cyan-400' : 'text-amber-400'}`}>{v.id}</div>
            {activeNode === v.id && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-[#070e1c] border border-cyan-500/50 rounded-lg p-2 text-[9px] font-mono whitespace-nowrap shadow-xl">
                <div className="text-white font-bold">{v.name}</div>
                <div className="text-slate-400">{v.city} · {v.blocks.toLocaleString()} blks</div>
                <div className={`font-bold ${v.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{v.status.toUpperCase()}</div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const FA = ['COLLECTED', 'TRANSFERRED', 'ANALYZED', 'SEALED', 'VERIFIED'];
const FI = ['EV-1246', 'EVD-501', 'EV-1247', 'EVD-502', 'EV-2031', 'EV-0892', 'EVD-603'];
const FO = ['SI Amit Verma', 'DSP Arvind Kumar', 'Insp. Priya Kulkarni', 'ACP Rajesh Sharma', 'SI Vikramaditya'];
function mTx() { return { id: Math.random().toString(36).slice(2, 10), action: FA[Math.floor(Math.random() * FA.length)], evidenceId: FI[Math.floor(Math.random() * FI.length)], officer: FO[Math.floor(Math.random() * FO.length)], hash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }; }

const LiveTxFeed: React.FC = () => {
  const [feed, setFeed] = useState(() => Array.from({ length: 10 }, mTx));
  const [newId, setNewId] = useState<string | null>(null);
  useEffect(() => { const t = setInterval(() => { const tx = mTx(); setNewId(tx.id); setFeed(p => [tx, ...p.slice(0, 13)]); setTimeout(() => setNewId(null), 600); }, 2600); return () => clearInterval(t); }, []);
  return (
    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
      {feed.map(tx => {
        const as = gAS(tx.action);
        return (
          <div key={tx.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-300 ${newId === tx.id ? 'border-cyan-500/70 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'border-[#14233c] bg-[#081222]'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${as.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${as.text} ${as.bg} ${as.border}`}>{tx.action}</span>
                <span className="text-[10px] text-white font-bold font-mono">{tx.evidenceId}</span>
              </div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">{tx.officer} · {tx.hash}…</div>
            </div>
            <div className="text-[9px] text-slate-600 font-mono flex-shrink-0">{tx.time}</div>
          </div>
        );
      })}
    </div>
  );
};

const BlockchainCertificate: React.FC<{ tx: any; block: any }> = ({ tx, block }) => {
  const print = () => {
    const win = window.open('', '_blank'); if (!win) return;
    const rows = (label: string, val: string) => `<div class="r"><span class="l">${label}:</span><span class="v">${val}</span></div>`;
    const hash = (label: string, val: string) => `<p style="font-size:10px;color:#888;margin-top:10px">${label}:</p><div class="h">${val}</div>`;
    win.document.write(`<!DOCTYPE html><html><head><title>Blockchain Certificate</title>
<style>body{font-family:Courier New,monospace;background:#000;color:#00ff88;padding:30px}
.box{border:2px solid #00ff88;padding:20px;max-width:700px;margin:auto}
h1{text-align:center;font-size:18px;letter-spacing:4px;border-bottom:1px solid #00ff88;padding-bottom:10px}
.r{display:flex;justify-content:space-between;margin:8px 0;font-size:11px}
.l{color:#888}.v{color:#00ff88;word-break:break-all;max-width:60%;text-align:right}
.h{font-size:9px;background:#001100;padding:6px;border:1px solid #00ff88;margin:8px 0;word-break:break-all}
.ft{text-align:center;font-size:9px;color:#888;margin-top:20px;border-top:1px solid #333;padding-top:10px}
@media print{body{background:#fff;color:#000}.box{border-color:#000}.h{background:#eee;border-color:#000}.v{color:#000}}</style>
</head><body><div class="box">
<h1>BLOCKCHAIN EVIDENCE CERTIFICATE</h1>
<p style="text-align:center;font-size:10px;color:#888">Section 65B Bharatiya Sakshya Adhiniyam 2023 · Immutable Record</p>
${rows('Evidence ID', tx?.evidenceId || '—')}
${rows('Action', tx?.action || '—')}
${rows('Officer Badge', tx?.officerBadge || '—')}
${rows('Block Number', '#' + (block?.blockNumber || '—'))}
${rows('Timestamp', new Date(tx?.timestamp || Date.now()).toUTCString())}
${rows('Status', tx?.status || 'CONFIRMED')}
${rows('Validator', block?.validator || '—')}
${hash('Transaction Hash', tx?.txHash || '—')}
${hash('SHA-256 Evidence Hash', tx?.sha256Hash || '—')}
${hash('ECDSA Digital Signature', tx?.digitalSignature || '—')}
${hash('Block Hash', block?.blockHash || '—')}
${hash('Merkle Root', block?.merkleRoot || '—')}
<div class="ft">CrimeSync National Criminal Blockchain Ledger · Polygon PoS<br/>
Smart Contract: 0xVault_Custody_v4_PolygonPoS<br/>
Generated: ${new Date().toUTCString()}<br/>
This certificate is cryptographically verifiable and court-admissible.</div>
</div></body></html>`);
    win.document.close(); win.print();
  };
  return (
    <button onClick={print} className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2">
      <Award className="w-4 h-4" />Generate Court Certificate
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const BlockchainExplorerPage: React.FC<BlockchainExplorerPageProps> = ({ onSelectAction, onNavigateTab }) => {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selBlock, setSelBlock] = useState<BlockItem | null>(null);
  const [selTx, setSelTx] = useState<TxItem | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'explorer' | 'live' | 'verify' | 'audit' | 'anchor'>('explorer');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [verifyStep, setVerifyStep] = useState(0);
  const [aForm, setAForm] = useState({ evidenceId: '', evidenceTitle: '', officerBadge: '', fromOfficer: '', toOfficer: '', location: '', action: 'COLLECTED', notes: '' });
  const [aLoading, setALoading] = useState(false);
  const [aResult, setAResult] = useState<{ transaction: TxItem; block: BlockItem; merkleProof: string[] } | null>(null);
  const [aError, setAError] = useState('');

  const cntB = useCounter(stats?.totalBlocks || 0);
  const cntT = useCounter(stats?.totalTransactions || 0);
  const cntE = useCounter(stats?.totalAnchoredEvidences || 0);

  const loadBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    try {
      const data = await api.blockchain.getBlocks(20);
      const arr = Array.isArray(data) ? data : [];
      setBlocks(arr);
      if (arr.length) setSelBlock(prev => prev ?? arr[0]);
    } catch { setBlocks([]); }
    finally { setLoadingBlocks(false); }
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try { setStats(await api.blockchain.getStats()); }
    catch { setStats(null); }
    finally { setLoadingStats(false); }
  }, []);

  const loadAudit = useCallback(async () => {
    try { setAudit(await api.blockchain.auditChain()); }
    catch { setAudit(null); }
  }, []);

  useEffect(() => { loadBlocks(); loadStats(); loadAudit(); }, []);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ val, id }: { val: string; id: string }) => (
    <button onClick={() => copy(val, id)} className="text-slate-500 hover:text-cyan-400 transition-colors">
      {copiedId === id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); if (!searchQ.trim()) return;
    const q = searchQ.trim().toLowerCase();
    const found = blocks.find(b => String(b.blockNumber) === q.replace('#', '') || b.blockHash.toLowerCase().includes(q));
    if (found) { setSelBlock(found); setTab('explorer'); setShowBlockModal(true); }
    else { setVerifyInput(searchQ.trim()); setTab('verify'); }
    if (onSelectAction) onSelectAction('Blockchain Query: ' + searchQ);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); if (!verifyInput.trim()) return;
    setVerifyLoading(true); setVerifyResult(null); setVerifyError(''); setVerifyStep(0);
    try {
      for (let s = 1; s <= 4; s++) { await new Promise(r => setTimeout(r, 380)); setVerifyStep(s); }
      setVerifyResult(await api.blockchain.verifyProof(verifyInput.trim()));
      if (onSelectAction) onSelectAction('Verified: ' + verifyInput.trim().substring(0, 20));
    } catch (err: any) { setVerifyError(err.message || 'Verification failed'); }
    finally { setVerifyLoading(false); }
  };

  const handleAnchor = async (e: React.FormEvent) => {
    e.preventDefault(); if (!aForm.evidenceId || !aForm.officerBadge) return;
    setALoading(true); setAResult(null); setAError('');
    try {
      const r = await api.blockchain.anchorEvidence({ ...aForm });
      setAResult(r); await loadBlocks(); await loadStats();
      if (onSelectAction) onSelectAction('Anchored ' + aForm.evidenceId + ' on blockchain');
    } catch (err: any) { setAError(err.message || 'Anchoring failed'); }
    finally { setALoading(false); }
  };

  const TABS = [
    { id: 'explorer', label: 'Chain Explorer',  icon: <CircuitBoard className="w-3.5 h-3.5" /> },
    { id: 'live',     label: 'Live Feed',        icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'verify',   label: 'Verify Hash',      icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'audit',    label: 'Chain Audit',      icon: <ListChecks className="w-3.5 h-3.5" /> },
    { id: 'anchor',   label: 'Anchor Evidence',  icon: <PlusCircle className="w-3.5 h-3.5" /> },
  ];

  const cM: Record<string, string> = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-900/20',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-900/20',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-900/20',
    teal: 'border-teal-500/30 text-teal-400 bg-teal-900/20',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-900/20',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 selection:bg-purple-500/30">

      {/* ══ HEADER ════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-[#111e33]">
        <div className="absolute top-0 left-1/4 w-96 h-40 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-4 md:p-6 space-y-4">

          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-cyan-600/20 border border-purple-500/40 flex items-center justify-center shadow-[0_0_24px_rgba(168,85,247,0.4)]">
                <CircuitBoard className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase">Blockchain Explorer</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />LIVE · Polygon PoS
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] text-slate-400">Indian Law Enforcement Immutable Ledger</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] font-bold text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded">65B BSA 2023</span>
                </div>
              </div>
            </div>
            <button onClick={() => { loadBlocks(); loadStats(); loadAudit(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081022] border border-[#14233c] text-slate-400 hover:text-white hover:border-slate-600 text-xs font-bold transition-all">
              <RefreshCw className="w-3.5 h-3.5" />Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'BLOCK HEIGHT', val: stats ? '#' + stats.latestBlockHeight.toLocaleString() : '—', icon: <Box className="w-4 h-4" />, c: 'blue', sub: cntB.toLocaleString() + ' total' },
              { label: 'TRANSACTIONS', val: loadingStats ? '—' : cntT.toLocaleString(), icon: <Layers className="w-4 h-4" />, c: 'purple', sub: 'Immutable records' },
              { label: 'EVIDENCE ON CHAIN', val: loadingStats ? '—' : cntE.toLocaleString(), icon: <Fingerprint className="w-4 h-4" />, c: 'emerald', sub: '100% Verified' },
              { label: 'INTEGRITY', val: stats ? stats.integrityScore + '%' : '—', icon: <ShieldCheck className="w-4 h-4" />, c: 'teal', sub: stats?.isChainIntact ? '✓ Intact' : '⚠ Check' },
              { label: 'AVG BLOCK TIME', val: stats ? stats.avgBlockTimeSec + 's' : '—', icon: <Clock className="w-4 h-4" />, c: 'amber', sub: (stats?.activeValidators || 14) + ' validators' },
            ].map((m, i) => (
              <div key={i} className={`${i === 4 ? 'col-span-2 md:col-span-1' : ''} bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-slate-700 transition-all`}>
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${cM[m.c]}`}>{m.icon}</div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                  <div className={`text-base font-extrabold font-mono leading-tight ${loadingStats ? 'text-slate-600 animate-pulse' : 'text-white'}`}>{m.val}</div>
                  <div className="text-[9px] text-slate-500">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-[#070e1c] border border-[#14233c] focus-within:border-purple-500/60 rounded-xl px-4 py-2.5 transition-all">
              <Search className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search Block #, Hash 0x…, Evidence ID, SHA-256 — Enter to verify on chain"
                className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none" />
              <button type="submit" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex-shrink-0">Search</button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${tab === t.id ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-[#081022] border border-[#14233c] text-slate-400 hover:text-white hover:border-slate-600'}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 p-4 md:p-6 space-y-5">

        {/* ─ EXPLORER ─ */}
        {tab === 'explorer' && (
          <div className="space-y-5">
            <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><Link className="w-3.5 h-3.5 text-cyan-400" />Visual Block Chain</h2>
                <span className="text-[10px] text-slate-500">Click block to inspect</span>
              </div>
              <div className="p-4">
                {loadingBlocks ? <div className="text-slate-600 text-xs text-center py-4 animate-pulse">Syncing chain…</div>
                  : <BlockChainVisual blocks={blocks} sel={selBlock} onSel={b => setSelBlock(b)} />}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Block Table */}
              <div className="lg:col-span-8 bg-[#070e1c] border border-[#14233c] rounded-2xl flex flex-col overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><Box className="w-3.5 h-3.5 text-cyan-400" />Latest Blocks</h2>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /><span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE</span></div>
                </div>
                <div className="overflow-x-auto flex-1">
                  {loadingBlocks ? <div className="p-8 text-center text-slate-500 animate-pulse">Syncing…</div>
                    : blocks.length === 0 ? <div className="p-8 text-center text-slate-500">No blocks found. Ensure backend is running.</div>
                      : (
                        <table className="w-full text-left text-xs">
                          <thead><tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-500 tracking-wider bg-[#091224]/60">{['Block', 'Hash', 'Txs', 'Timestamp', 'Validator', 'Status'].map(h => <th key={h} className="py-2.5 px-3">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-[#0d1b30] font-mono">
                            {blocks.map(b => {
                              const isSel = selBlock?.blockNumber === b.blockNumber;
                              return (
                                <tr key={b.blockNumber} onClick={() => setSelBlock(b)} className={`cursor-pointer transition-all ${isSel ? 'bg-purple-950/30 border-l-2 border-l-purple-500' : 'hover:bg-[#091428]'}`}>
                                  <td className="py-2.5 px-3 font-bold text-white">#{b.blockNumber}</td>
                                  <td className="py-2.5 px-3 text-cyan-400">{b.blockHash?.substring(0, 14)}…</td>
                                  <td className="py-2.5 px-3 text-center font-bold text-white">{b.transactionsCount}</td>
                                  <td className="py-2.5 px-3 text-slate-400 text-[10px]">{new Date(b.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                  <td className="py-2.5 px-3 text-slate-300 text-[10px]">{b.validator?.split('(')[0]?.trim()}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${b.status === 'Finalized' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40' : 'bg-amber-950/70 text-amber-300 border-amber-600/40'}`}>
                                      {b.status === 'Finalized' ? <CheckCircle2 className="w-2 h-2" /> : <Activity className="w-2 h-2 animate-pulse" />}{b.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                </div>
                <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-mono">{blocks.length} blocks loaded</span>
                  <button onClick={() => setShowAllModal(true)} className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"><Database className="w-3 h-3" />Full Ledger</button>
                </div>
              </div>

              {/* Block Detail */}
              <div className="lg:col-span-4 bg-[#070e1c] border border-[#14233c] rounded-2xl flex flex-col overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-purple-400" />Block Detail</h2>
                  {selBlock && <span className="font-mono text-xs font-bold text-white">#{selBlock.blockNumber}</span>}
                </div>
                {!selBlock ? <div className="flex-1 flex items-center justify-center p-6 text-slate-600 text-sm">Select a block</div> : (
                  <>
                    <div className="p-4 space-y-2.5 font-mono text-xs flex-1 overflow-y-auto">
                      {[
                        { k: 'Height', v: '#' + selBlock.blockNumber, c: 'text-white font-bold' },
                        { k: 'Transactions', v: String(selBlock.transactionsCount), c: 'text-cyan-400 font-bold' },
                        { k: 'Nonce', v: selBlock.nonce?.toString() || '—', c: 'text-purple-300' },
                        { k: 'Gas Used', v: selBlock.gasUsed || '—', c: 'text-amber-300' },
                        { k: 'Size', v: selBlock.sizeKb || '—', c: 'text-slate-300' },
                        { k: 'Status', v: selBlock.status, c: selBlock.status === 'Finalized' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-[#14233c]/50 pb-2">
                          <span className="text-slate-500 font-sans">{r.k}</span><span className={r.c}>{r.v}</span>
                        </div>
                      ))}
                      {[
                        { k: 'Block Hash', v: selBlock.blockHash, id: 'bh', c: 'text-cyan-300' },
                        { k: 'Merkle Root', v: selBlock.merkleRoot, id: 'mr', c: 'text-emerald-300' },
                        { k: 'Prev Hash', v: selBlock.previousHash, id: 'ph', c: 'text-slate-400' },
                        { k: 'Validator Addr', v: selBlock.validatorAddress, id: 'va', c: 'text-purple-300' },
                      ].map(({ k, v, id, c }) => (
                        <div key={id} className="space-y-1 border-b border-[#14233c]/50 pb-2">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-slate-500">{k}</span><CopyBtn val={v || ''} id={id} />
                          </div>
                          <div className={`text-[9px] ${c} bg-[#091224] px-1.5 py-1 rounded border border-slate-800 break-all`}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-[#14233c] space-y-2">
                      <button onClick={() => setShowBlockModal(true)} className="w-full py-2 rounded-xl font-bold text-xs uppercase bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_16px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"><Eye className="w-3.5 h-3.5" />View {selBlock.transactionsCount} Transactions</button>
                      <button onClick={() => { setVerifyInput(selBlock.blockHash); setTab('verify'); }} className="w-full py-1.5 rounded-xl font-bold text-xs uppercase bg-[#091224] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-all flex items-center justify-center gap-2"><ShieldCheck className="w-3.5 h-3.5" />Verify Block Hash</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─ LIVE FEED ─ */}
        {tab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
              <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />Live Evidence Transactions</h2>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /><span className="text-[10px] text-emerald-400 font-bold">REAL-TIME</span></div>
              </div>
              <div className="p-4"><LiveTxFeed /></div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222]"><h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" />Recent Blocks (API)</h2></div>
                <div className="p-4 space-y-2">
                  {blocks.slice(0, 5).map(b => (
                    <div key={b.blockNumber} onClick={() => { setSelBlock(b); setTab('explorer'); }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#081222] border border-[#14233c] hover:border-purple-500/40 cursor-pointer transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center"><Box className="w-4 h-4 text-purple-400" /></div>
                        <div><div className="text-xs font-bold text-white">Block #{b.blockNumber}</div><div className="text-[9px] text-slate-500">{b.transactionsCount} txs · {b.validator?.split('(')[0]?.trim()}</div></div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[9px] font-bold ${b.status === 'Finalized' ? 'text-emerald-400' : 'text-amber-400'}`}>{b.status}</div>
                        <div className="text-[9px] text-slate-600">{new Date(b.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222]"><h2 className="text-xs font-extrabold text-white uppercase flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-cyan-400" />Network Stats</h2></div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[{ label: 'Chain', value: 'Polygon PoS', color: 'text-purple-400' }, { label: 'Consensus', value: 'Proof of Auth', color: 'text-cyan-400' }, { label: 'Validators', value: String(stats?.activeValidators || 14), color: 'text-emerald-400' }, { label: 'Block Time', value: (stats?.avgBlockTimeSec || 2.1) + 's', color: 'text-amber-400' }].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#081222] border border-[#14233c]">
                      <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
                      <div className={`text-sm font-bold ${s.color} font-mono`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ VERIFY ─ */}
        {tab === 'verify' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /><h2 className="text-sm font-extrabold text-white uppercase">Evidence Hash Verifier</h2></div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">Submit any <span className="text-cyan-400 font-mono">SHA-256 hash</span>, transaction hash, or evidence ID to cryptographically verify its existence on the immutable ledger.</p>
                  <form onSubmit={handleVerify} className="space-y-3">
                    <input value={verifyInput} onChange={e => setVerifyInput(e.target.value)} placeholder="0x… or EV-1246 or SHA-256 digest"
                      className="w-full bg-[#091224] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-all" />
                    <button type="submit" disabled={verifyLoading || !verifyInput.trim()} className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {verifyLoading ? <><RefreshCw className="w-4 h-4 animate-spin" />Verifying on chain…</> : <><ShieldCheck className="w-4 h-4" />Verify on Blockchain</>}
                    </button>
                  </form>
                  {verifyLoading && (
                    <div className="space-y-2">
                      {['Computing SHA-256 hash…', 'Querying immutable ledger…', 'Computing Merkle proof path…', 'Generating zk-SNARK proof…'].map((step, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs transition-all ${verifyStep > i ? 'text-emerald-400' : verifyStep === i ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`}>
                          {verifyStep > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : verifyStep === i ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}{step}
                        </div>
                      ))}
                    </div>
                  )}
                  {verifyError && <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/40 text-xs text-red-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{verifyError}</div>}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Quick test IDs:</p>
                    {['EV-1246', 'EVD-501', 'EVD-502', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'].map(h => (
                      <button key={h} onClick={() => setVerifyInput(h)} className="block w-full text-left px-3 py-1.5 rounded-lg bg-[#091224] border border-slate-800 hover:border-cyan-500/50 text-cyan-400 font-mono text-[10px] transition-all truncate">{h}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><Hash className="w-5 h-5 text-cyan-400" /><h2 className="text-sm font-extrabold text-white uppercase">Cryptographic Proof Result</h2></div>
              {!verifyResult ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <Lock className="w-14 h-14 text-slate-800" /><p className="text-sm text-slate-600">Awaiting hash input</p>
                  <p className="text-xs text-slate-700">Results include Merkle proof tree, block anchor, zk-SNARK proof and evidence metadata.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                  <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${verifyResult.verified ? 'bg-emerald-950/50 border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.2)]' : 'bg-red-950/50 border-red-400/60'}`}>
                    {verifyResult.verified ? <CheckCircle2 className="w-10 h-10 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-10 h-10 text-red-400 flex-shrink-0" />}
                    <div>
                      <div className={`font-black text-base ${verifyResult.verified ? 'text-emerald-300' : 'text-red-300'}`}>{verifyResult.verified ? '✓ CRYPTOGRAPHICALLY VERIFIED' : '✗ NOT FOUND ON LEDGER'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{verifyResult.status}</div>
                    </div>
                  </div>
                  {verifyResult.evidence && (
                    <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 font-sans space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1.5">Evidence Record</div>
                      {[['ID', verifyResult.evidence.id || '—', 'text-cyan-300'], ['Title', verifyResult.evidence.title || '—', 'text-white'], ['Status', verifyResult.evidence.status || 'SECURED', 'text-emerald-400 font-bold']].map(([l, v, c], i) => (
                        <div key={i} className="flex justify-between text-[10px]"><span className="text-slate-500">{l}:</span><span className={c as string}>{v as string}</span></div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 font-sans space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1.5">Block Anchor</div>
                      {[['Block', '#' + verifyResult.blockNumber, 'text-white font-bold'], ['Time', new Date(verifyResult.timestamp).toLocaleTimeString(), 'text-slate-300'], ['Contract', (verifyResult.smartContract || '').substring(0, 14) + '…', 'text-amber-300']].map(([l, v, c], i) => (
                        <div key={i} className="flex justify-between text-[10px]"><span className="text-slate-500">{l}:</span><span className={c as string}>{v as string}</span></div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 font-sans space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1.5">Validator</div>
                      <div className="text-[10px] text-purple-300">{verifyResult.validator?.split('(')[0]?.trim()}</div>
                      <div className="text-[9px] text-slate-600 font-mono break-all">{verifyResult.validatorAddress}</div>
                    </div>
                  </div>
                  {verifyResult.merkleProof && verifyResult.merkleProof.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 font-sans"><GitBranch className="w-3.5 h-3.5 text-cyan-400" />Merkle Proof Tree ({verifyResult.merkleProof.length} nodes)</div>
                      <MerkleTreeVisual proof={verifyResult.merkleProof} root={verifyResult.merkleRoot} leafHash={verifyResult.hash} />
                    </div>
                  )}
                  {verifyResult.zkSnarkProof && (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-700/30 space-y-1.5">
                      <div className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1.5 font-sans"><BrainCircuit className="w-3.5 h-3.5" />zk-SNARK Zero-Knowledge Proof</div>
                      <div className="text-[9px] text-purple-300 break-all font-mono bg-[#091224] p-2 rounded border border-purple-800/30">{verifyResult.zkSnarkProof}</div>
                      <p className="text-[9px] text-slate-600 font-sans">Proven without revealing preimage. Court-admissible.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ AUDIT ─ */}
        {tab === 'audit' && (
          <div className="space-y-5">
            <div className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${audit?.isValid ? 'bg-emerald-950/30 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : audit ? 'bg-red-950/30 border-red-400/50' : 'bg-[#070e1c] border-[#14233c]'}`}>
              <div className="flex items-center gap-4">
                {audit?.isValid ? <ShieldCheck className="w-14 h-14 text-emerald-400 flex-shrink-0" /> : <ShieldAlert className="w-14 h-14 text-red-400 flex-shrink-0 animate-pulse" />}
                <div>
                  <div className="text-xl font-black text-white">{!audit ? 'Loading…' : audit.isValid ? 'CHAIN INTEGRITY VERIFIED' : 'VIOLATIONS DETECTED'}</div>
                  <div className="text-xs text-slate-400 mt-1">{audit ? `${audit.totalBlocks} blocks · ${audit.totalTransactions} transactions · ${audit.violations.length} violation(s)` : 'Running cryptographic scan…'}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-4xl font-black font-mono text-white">{stats?.integrityScore ?? '—'}<span className="text-xl">%</span></div>
                <div className="text-[10px] text-slate-500 uppercase">Integrity Score</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><ListChecks className="w-4 h-4 text-emerald-400" /><h2 className="text-xs font-extrabold text-white uppercase">Violations</h2></div>
                <div className="p-4 space-y-3">
                  {!audit ? <div className="text-slate-600 text-xs text-center py-4 animate-pulse">Scanning…</div>
                    : audit.violations.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-center space-y-2"><CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" /><p className="text-emerald-300 font-bold text-xs">No Violations</p><p className="text-[10px] text-slate-500">All blocks pass validation.</p></div>
                    ) : audit.violations.map((v, i) => <div key={i} className="p-2.5 rounded-xl bg-red-950/40 border border-red-600/40 text-[10px] text-red-300 flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{v}</div>)}
                  {audit && <div className="pt-2 border-t border-[#14233c] space-y-1"><div className="text-[9px] font-bold text-slate-500 uppercase">Chain Root Hash</div><div className="text-[9px] text-cyan-400 font-mono bg-[#091224] p-2 rounded border border-slate-800 break-all">{audit.rootHash}</div></div>}
                  <button onClick={loadAudit} className="w-full py-2 rounded-xl font-bold text-xs uppercase bg-[#091224] border border-[#14233c] hover:border-purple-500/40 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Re-run Audit</button>
                </div>
              </div>
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><Globe className="w-4 h-4 text-purple-400" /><h2 className="text-xs font-extrabold text-white uppercase">Network Config</h2></div>
                <div className="p-4 space-y-2 font-mono text-xs">
                  {stats ? [['Chain', stats.chainNetwork, 'text-cyan-300'], ['Contract', stats.smartContractAddress, 'text-purple-300'], ['Latest Block', '#' + stats.latestBlockHeight, 'text-white font-bold'], ['Total Blocks', String(stats.totalBlocks), 'text-white'], ['Total Txs', String(stats.totalTransactions), 'text-white'], ['Evidence', stats.totalAnchoredEvidences.toLocaleString(), 'text-emerald-400'], ['Validators', stats.activeValidators + ' nodes', 'text-teal-300'], ['Block Time', stats.avgBlockTimeSec + 's', 'text-amber-300']].map(([k, v, c], i) => (
                    <div key={i} className="flex justify-between items-center pb-1.5 border-b border-[#14233c]/50"><span className="text-slate-500 font-sans">{k}</span><span className={`${c} text-[10px] text-right max-w-[55%] break-all`}>{v}</span></div>
                  )) : <div className="text-slate-600 text-center animate-pulse py-4">Loading…</div>}
                </div>
              </div>
              <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
                <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center justify-between"><div className="flex items-center gap-2"><Network className="w-4 h-4 text-cyan-400" /><h2 className="text-xs font-extrabold text-white uppercase">Validator Network</h2></div><span className="text-[9px] text-slate-500">Click nodes</span></div>
                <div className="p-4">
                  <ValidatorNetwork />
                  <div className="mt-8 space-y-1">{VD.map(v => (
                    <div key={v.id} className="flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${v.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} /><span className="text-slate-400 font-bold">{v.id}</span><span className="text-slate-600">{v.name}</span></div>
                      <span className="text-slate-500 font-mono">{v.blocks.toLocaleString()} blks</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ ANCHOR ─ */}
        {tab === 'anchor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl overflow-hidden">
              <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><PlusCircle className="w-5 h-5 text-cyan-400" /><h2 className="text-sm font-extrabold text-white uppercase">Anchor Evidence on Blockchain</h2></div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-600/30 text-[11px] text-blue-300 leading-relaxed"><span className="font-bold">Section 65B BSA 2023:</span> Each anchor is ECDSA-signed, timestamped, Merkle-proofed, and permanently committed to Polygon PoS. Immutable. Court-admissible.</div>
                <form onSubmit={handleAnchor} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: 'evidenceId', label: 'Evidence ID *', ph: 'EV-1246', req: true, mono: true }, { key: 'officerBadge', label: 'Officer Badge *', ph: 'DL-POL-8419', req: true, mono: true }].map(f => (
                      <div key={f.key}><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label><input value={(aForm as any)[f.key]} required={f.req} onChange={e => setAForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className={`w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${f.mono ? 'font-mono' : ''}`} /></div>
                    ))}
                  </div>
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Evidence Title</label><input value={aForm.evidenceTitle} onChange={e => setAForm(p => ({ ...p, evidenceTitle: e.target.value }))} placeholder="FIR_4587_Theft_Case.pdf" className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: 'fromOfficer', label: 'From Officer', ph: 'SI Amit Verma' }, { key: 'toOfficer', label: 'To Officer', ph: 'DSP Arvind Kumar' }].map(f => (
                      <div key={f.key}><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label><input value={(aForm as any)[f.key]} onChange={e => setAForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all" /></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Action *</label><select value={aForm.action} onChange={e => setAForm(p => ({ ...p, action: e.target.value }))} className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-all">{['COLLECTED', 'TRANSFERRED', 'ANALYZED', 'SEALED', 'VERIFIED', 'SUBMITTED'].map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Location</label><input value={aForm.location} onChange={e => setAForm(p => ({ ...p, location: e.target.value }))} placeholder="Cyber Crime Unit, Delhi" className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all" /></div>
                  </div>
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes</label><textarea value={aForm.notes} onChange={e => setAForm(p => ({ ...p, notes: e.target.value }))} placeholder="Reason for custody action…" rows={3} className="w-full bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none transition-all" /></div>
                  {aError && <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/40 text-xs text-red-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{aError}</div>}
                  <MiningAnimation active={aLoading} />
                  <button type="submit" disabled={aLoading || !aForm.evidenceId || !aForm.officerBadge} className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {aLoading ? <><Cpu className="w-4 h-4 animate-spin" />Mining Block…</> : <><Send className="w-4 h-4" />Anchor on Blockchain</>}
                  </button>
                </form>
              </div>
            </div>
            <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-[#14233c] bg-[#081222] flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /><h2 className="text-sm font-extrabold text-white uppercase">Transaction Receipt</h2></div>
              {!aResult ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3"><CircuitBoard className="w-16 h-16 text-slate-800" /><p className="text-sm text-slate-600">Receipt will appear here after anchoring</p><p className="text-xs text-slate-700">Tx hash, digital signature, SHA-256, Merkle proof, and block data — ready for court.</p></div>
              ) : (
                <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-950/50 border-2 border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.2)] flex items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 flex-shrink-0" />
                    <div><div className="font-black text-base text-emerald-300">TRANSACTION CONFIRMED</div><div className="text-[10px] text-slate-400 font-sans mt-0.5">Block #{aResult.block?.blockNumber} · {aResult.transaction?.status}</div></div>
                  </div>
                  {aResult.transaction && (
                    <>
                      <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5 font-sans text-[11px]">
                        <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Transaction Details</div>
                        {[['Evidence ID', aResult.transaction.evidenceId, 'text-cyan-300'], ['Action', aResult.transaction.action, 'font-bold ' + gAS(aResult.transaction.action).text], ['Officer', aResult.transaction.officerBadge, 'text-purple-300'], ['Block', '#' + aResult.transaction.blockNumber, 'text-white font-bold'], ['Status', aResult.transaction.status, 'text-emerald-400 font-bold']].map(([l, v, c], i) => (
                          <div key={i} className="flex justify-between"><span className="text-slate-500">{l}:</span><span className={c as string}>{v as string}</span></div>
                        ))}
                      </div>
                      {[{ label: 'Transaction Hash', val: aResult.transaction.txHash, id: 'r-txh', c: 'text-cyan-400' }, { label: 'SHA-256 Evidence Hash', val: aResult.transaction.sha256Hash, id: 'r-sha', c: 'text-emerald-400' }, { label: 'ECDSA Digital Signature', val: aResult.transaction.digitalSignature, id: 'r-sig', c: 'text-purple-400' }].map(({ label, val, id, c }) => (
                        <div key={id} className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase font-sans"><span>{label}</span><CopyBtn val={val || ''} id={id} /></div>
                          <div className={`${c} bg-[#091224] p-2 rounded-lg border border-slate-800 break-all text-[9px]`}>{val}</div>
                        </div>
                      ))}
                      {aResult.merkleProof && aResult.merkleProof.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold text-slate-500 uppercase font-sans flex items-center gap-1.5"><GitBranch className="w-3 h-3 text-cyan-400" />Merkle Proof ({aResult.merkleProof.length} nodes)</div>
                          <MerkleTreeVisual proof={aResult.merkleProof} root={aResult.block?.merkleRoot || ''} leafHash={aResult.transaction.txHash} />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button onClick={() => { setVerifyInput(aResult!.transaction.txHash); setTab('verify'); }} className="py-2 rounded-xl font-bold text-[11px] uppercase bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Verify</button>
                        <BlockchainCertificate tx={aResult.transaction} block={aResult.block} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL: Full Ledger ════════════════════════════════════════════════════ */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.25)]">
            <div className="p-4 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
              <div className="flex items-center gap-2"><Database className="w-5 h-5 text-purple-400" /><h3 className="font-extrabold text-base text-white">NATIONAL CRIMINAL BLOCKCHAIN MASTER LEDGER</h3><span className="text-xs font-mono text-slate-500">{blocks.length} blocks</span></div>
              <button onClick={() => setShowAllModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs font-mono">
                <thead><tr className="border-b border-slate-800 text-[9px] font-bold uppercase text-slate-500 tracking-wider bg-[#091224]/80 sticky top-0">{['Block', 'Hash', 'Merkle Root', 'Txs', 'Validator', 'Status', ''].map(h => <th key={h} className="py-2.5 px-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#0d1b30]">
                  {blocks.map(b => (
                    <tr key={b.blockNumber} className="hover:bg-[#091428] transition-colors">
                      <td className="py-2 px-3 font-bold text-white">#{b.blockNumber}</td>
                      <td className="py-2 px-3 text-cyan-400 text-[9px]">{b.blockHash?.substring(0, 16)}…</td>
                      <td className="py-2 px-3 text-emerald-400 text-[9px]">{b.merkleRoot?.substring(0, 16)}…</td>
                      <td className="py-2 px-3 text-center font-bold text-white">{b.transactionsCount}</td>
                      <td className="py-2 px-3 text-slate-400 text-[9px]">{b.validator?.split('(')[0]?.trim()}</td>
                      <td className="py-2 px-3"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${b.status === 'Finalized' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>{b.status}</span></td>
                      <td className="py-2 px-3"><button onClick={() => { setSelBlock(b); setShowAllModal(false); setShowBlockModal(true); setTab('explorer'); }} className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[9px] font-semibold transition-all">Inspect</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between text-[10px] text-slate-600">
              <span>Polygon PoS · Proof of Authority · {blocks.length} blocks</span>
              <button onClick={() => setShowAllModal(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Block Transactions ═════════════════════════════════════════════ */}
      {showBlockModal && selBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <div className="p-4 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
              <div className="flex items-center gap-2"><Box className="w-5 h-5 text-cyan-400" /><h3 className="font-extrabold text-base text-white">BLOCK #{selBlock.blockNumber} · TRANSACTIONS</h3></div>
              <button onClick={() => setShowBlockModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#091224] border border-slate-800 font-mono text-[11px]">
                {[['Height', '#' + selBlock.blockNumber, 'text-white font-bold'], ['Txs', String(selBlock.transactionsCount), 'text-cyan-400 font-bold'], ['Gas', selBlock.gasUsed || '—', 'text-amber-300'], ['Status', selBlock.status, 'text-emerald-400 font-bold']].map(([l, v, c], i) => (
                  <div key={i}><span className="text-slate-500 block text-[9px]">{l}</span><span className={c as string}>{v as string}</span></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 font-sans">Evidence Transactions ({selBlock.transactions?.length || 0})</div>
                {!selBlock.transactions?.length ? <div className="p-5 rounded-xl bg-[#091224] text-center text-slate-600">No transaction payloads cached for this block.</div>
                  : selBlock.transactions.map((tx, idx) => {
                    const as = gAS(tx.action);
                    return (
                      <div key={idx} onClick={() => setSelTx(tx)} className="p-3 rounded-xl bg-[#091224] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-2">
                        <div className="flex items-center justify-between"><span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${as.text} ${as.bg} ${as.border}`}>{tx.action}</span><span className="text-slate-600 text-[9px] font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span></div>
                        <div className="font-sans"><div className="text-white font-semibold text-[11px]">{tx.evidenceId} · {tx.evidenceTitle}</div><div className="text-slate-500 text-[9px] mt-0.5">{tx.fromOfficer} → {tx.toOfficer}</div></div>
                        <div className="text-[9px] text-slate-700 font-mono truncate">Tx: {tx.txHash}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button onClick={() => { if (onNavigateTab) { onNavigateTab('chain-of-custody'); setShowBlockModal(false); } }} className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">Chain of Custody →</button>
              <button onClick={() => setShowBlockModal(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: TX Detail ══════════════════════════════════════════════════════ */}
      {selTx && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.25)]">
            <div className="p-4 border-b border-[#14233c] bg-[#081222] flex items-center justify-between">
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-purple-400" /><h3 className="font-extrabold text-base text-white">TRANSACTION FORENSIC PAYLOAD</h3></div>
              <button onClick={() => setSelTx(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5 font-sans text-[11px]">
                {[['Action', <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${gAS(selTx.action).text} ${gAS(selTx.action).bg} ${gAS(selTx.action).border}`}>{selTx.action}</span>], ['Evidence ID', <span className="text-cyan-300 font-mono">{selTx.evidenceId}</span>], ['Title', <span className="text-white">{selTx.evidenceTitle}</span>], ['Officer', <span className="text-purple-300 font-mono">{selTx.officerBadge}</span>], ['From → To', <span className="text-slate-300">{selTx.fromOfficer} → {selTx.toOfficer}</span>], ['Location', <span className="text-slate-300">{selTx.location || '—'}</span>], ['Block', <span className="text-white font-bold">#{selTx.blockNumber}</span>], ['Status', <span className="text-emerald-400 font-bold">{selTx.status}</span>], ['Timestamp', <span className="text-slate-300">{new Date(selTx.timestamp).toLocaleString()}</span>]].map(([label, val], i) => (
                  <div key={i} className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#14233c]/50"><span className="text-slate-500 flex-shrink-0">{label as string}:</span><span className="text-right">{val as React.ReactNode}</span></div>
                ))}
              </div>
              {[{ label: 'TX HASH', val: selTx.txHash, id: 'd-txh', c: 'text-cyan-400' }, { label: 'SHA-256 HASH', val: selTx.sha256Hash, id: 'd-sha', c: 'text-emerald-400' }, { label: 'DIGITAL SIGNATURE', val: selTx.digitalSignature, id: 'd-sig', c: 'text-purple-400' }].map(({ label, val, id, c }) => (
                <div key={id} className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase font-sans">{label}<CopyBtn val={val || ''} id={id} /></div>
                  <div className={`${c} bg-[#091224] p-2 rounded border border-slate-800 break-all text-[9px]`}>{val}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button onClick={() => { setVerifyInput(selTx.txHash); setSelTx(null); setTab('verify'); }} className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs transition-all">Verify on Chain →</button>
              <button onClick={() => setSelTx(null)} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorerPage;
