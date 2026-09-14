import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Globe,
  Network,
  Layers,
  Bug,
  FileText,
  Terminal,
  Database,
  Copy,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuditLog } from '../hooks/useAuditLog';
import { type DbAuditLog } from '../context/DbContext';

interface AttackGraphPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export interface DynamicGraphNode {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL' | 'CONTAINED';
  statusText: string;
  timestamp: string;
  timeOffset: string;
  iconType: 'login' | 'case' | 'evidence' | 'honey' | 'export' | 'containment';
  summary: string;
  rawLog: DbAuditLog;
}

export const TAB_LABELS: Record<string, { title: string; category: string; iconType: DynamicGraphNode['iconType']; module: string }> = {
  'evidence-dna': { title: 'Digital Fingerprint', category: 'BLOCKCHAIN', iconType: 'evidence', module: 'Digital Fingerprint' },
  'ai-sandbox': { title: 'AI Sandbox', category: 'AI_LAB', iconType: 'case', module: 'AI Sandbox' },
  'deception-network': { title: 'Honeypot Decoy', category: 'TRIPWIRE', iconType: 'honey', module: 'Deception Network' },
  'blast-radius': { title: 'Impact Zone', category: 'SOC_BLAST', iconType: 'containment', module: 'Blast Radius' },
  'threat-alerts': { title: 'Live Alerts', category: 'SOC_ALERTS', iconType: 'containment', module: 'Threat Alerts' },
  'attack-graph': { title: 'Attack Map', category: 'KILL_CHAIN', iconType: 'case', module: 'Attack Graph' },
  'identity-security': { title: 'Identity Shield', category: 'IDENTITY', iconType: 'login', module: 'Identity Security' },
  'command-center': { title: 'Live Overview', category: 'HQ_COMMAND', iconType: 'case', module: 'Command Center' },
  'investigations': { title: 'Case Dossiers', category: 'RECON', iconType: 'case', module: 'Investigations' },
  'ai-copilot': { title: 'AI Assistant', category: 'COPILOT', iconType: 'case', module: 'AI Copilot' },
  'knowledge-graph': { title: 'Network Graph', category: 'GRAPH', iconType: 'case', module: 'Knowledge Graph' },
  'time-machine': { title: '4D Timeline', category: 'TIMELINE', iconType: 'case', module: 'Time Machine' },
  'geo-intelligence': { title: 'Geo Map', category: 'GEO_INTEL', iconType: 'case', module: 'Geo Intelligence' },
  'financial-intelligence': { title: 'Money Trail', category: 'FIN_INTEL', iconType: 'case', module: 'Financial Intelligence' },
  'chain-of-custody': { title: 'Custody Log', category: 'LEDGER', iconType: 'evidence', module: 'Chain of Custody' },
  'reports': { title: 'Court Reports', category: 'REPORT', iconType: 'export', module: 'Reports' },
  'audit-trail': { title: 'Activity Audit', category: 'AUDIT', iconType: 'case', module: 'Audit Trail' },
};

export const getTabLabel = (tabId?: string, fallbackModule?: string): string => {
  if (tabId && TAB_LABELS[tabId]) return TAB_LABELS[tabId].title;
  if (fallbackModule) {
    const match = Object.values(TAB_LABELS).find(
      (t) => t.module.toLowerCase() === fallbackModule.toLowerCase() || t.title.toLowerCase() === fallbackModule.toLowerCase()
    );
    if (match) return match.title;
    return fallbackModule;
  }
  return tabId || 'Navigation';
};

export const AttackGraphPage: React.FC<AttackGraphPageProps> = ({ onSelectAction }) => {
  const {
    auditLogs,
    trustScore,
    simulateCyberAttack,
    resetSessionState,
    isSimulatingAttack,
  } = useAuditLog();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [maxPlaybackStep, setMaxPlaybackStep] = useState<number>(100);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Dynamically generate directed graph nodes directly from live audit_logs in real-time
  const dynamicNodes: DynamicGraphNode[] = useMemo(() => {
    const sortedLogs = [...auditLogs].reverse();
    if (sortedLogs.length === 0) return [];

    const nodes: DynamicGraphNode[] = [];
    let stepCount = 1;

    sortedLogs.forEach((log) => {
      let iconType: DynamicGraphNode['iconType'] = 'evidence';
      let title: string = log.action;
      let category: string = log.category;

      if (log.action === 'LOGIN') {
        iconType = 'login';
        title = 'Session Ingress';
        category = 'INGRESS';
      } else if (log.action === 'TAB_SWITCH') {
        const tabKey = log.payload?.tabId || log.targetId || '';
        const tabInfo = TAB_LABELS[tabKey];
        if (tabInfo) {
          title = tabInfo.title;
          category = tabInfo.category;
          iconType = tabInfo.iconType;
        } else {
          title = getTabLabel(tabKey, log.payload?.tabName || log.module);
          category = 'NAVIGATION';
          iconType = 'case';
        }
      } else if (log.action === 'CASE_OPEN') {
        iconType = 'case';
        title = `Accessed ${log.targetId || 'Case'}`;
        category = 'RECON';
      } else if (log.action === 'EVIDENCE_VIEW') {
        if (log.targetId === 'EV-9999' || log.payload?.isHoneyDecoy) {
          iconType = 'honey';
          title = 'Honey Decoy EV9999';
          category = 'TRIPWIRE';
        } else {
          iconType = 'evidence';
          title = `Viewed ${log.targetId || 'Exhibit'}`;
          category = 'EVIDENCE';
        }
      } else if (log.action === 'REPORT_EXPORT' || log.action === 'FILE_DOWNLOAD') {
        iconType = 'export';
        title = log.severity === 'CONTAINED' ? 'Export Intercepted' : 'Export Attempt';
        category = 'EXFILTRATION';
      } else if (log.action === 'SECURITY_CONTAINMENT' || log.severity === 'CONTAINED') {
        iconType = 'containment';
        title = 'Autonomous Lock';
        category = 'CONTAINMENT';
      }

      let summaryText = log.payload?.title || log.payload?.details || log.action;
      if (log.action === 'TAB_SWITCH') {
        const tabKey = log.payload?.tabId || log.targetId || '';
        const label = getTabLabel(tabKey, log.payload?.tabName || log.module);
        summaryText = `Navigated to ${label}`;
      }

      nodes.push({
        id: log.id,
        stepNumber: stepCount++,
        title,
        category,
        severity: log.severity,
        statusText: log.verdict || (log.severity === 'NORMAL' ? 'Authorized' : 'Anomaly Detected'),
        timestamp: log.displayTime,
        timeOffset: log.timeOffset,
        iconType,
        summary: summaryText,
        rawLog: log,
      });
    });

    return nodes.slice(-8);
  }, [auditLogs]);

  // Keep latest selected by default
  useEffect(() => {
    if (dynamicNodes.length > 0 && !selectedNodeId) {
      setSelectedNodeId(dynamicNodes[dynamicNodes.length - 1].id);
    }
  }, [dynamicNodes, selectedNodeId]);

  const activeSelectedNode = useMemo(() => {
    return dynamicNodes.find((n) => n.id === selectedNodeId) || dynamicNodes[dynamicNodes.length - 1];
  }, [dynamicNodes, selectedNodeId]);

  // Sequential Playback loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setMaxPlaybackStep((prev) => {
          if (prev >= dynamicNodes.length) {
            setIsPlaying(false);
            return dynamicNodes.length;
          }
          const next = prev + 1;
          if (dynamicNodes[next - 1]) {
            setSelectedNodeId(dynamicNodes[next - 1].id);
          }
          return next;
        });
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, dynamicNodes]);

  const handlePlayReplay = () => {
    setMaxPlaybackStep(1);
    if (dynamicNodes[0]) {
      setSelectedNodeId(dynamicNodes[0].id);
    }
    setIsPlaying(true);
  };

  const handleTriggerSimulatedAttack = async () => {
    setIsPlaying(false);
    await simulateCyberAttack();
    setMaxPlaybackStep(100);
    if (onSelectAction) {
      onSelectAction('Triggered Cyber Simulation: Rapid Bot Scraping & Honey Tripwire');
    }
  };

  const handleResetBaseline = () => {
    setIsPlaying(false);
    resetSessionState();
    setMaxPlaybackStep(100);
    setSelectedNodeId(null);
    if (onSelectAction) {
      onSelectAction('Cleared Simulation Telemetry: Trust Restored to 100/100');
    }
  };

  const handleCopyRawJson = (logObj: any) => {
    navigator.clipboard.writeText(JSON.stringify(logObj, null, 2));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const isRestricted = trustScore < 50;

  // Filtered log list
  const filteredLogs = useMemo(() => {
    if (!searchFilter.trim()) return auditLogs;
    const q = searchFilter.toLowerCase();
    return auditLogs.filter((l) => {
      const tabLabel = l.action === 'TAB_SWITCH' ? getTabLabel(l.payload?.tabId, l.payload?.tabName || l.module) : '';
      return (
        l.action.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        tabLabel.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, searchFilter]);

  return (
    <div className="flex-1 bg-[#030712] text-slate-100 flex flex-col overflow-y-auto px-4 sm:px-6 py-5 space-y-5 select-none font-sans">
      
      {/* ── 1. CLEAN HEADER & FAST ACTION BAR ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#050c1e]/90 border border-[#132240] shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-mono">
              Attack Map & Threat Reconstruction
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40 uppercase tracking-widest">
              LIVE EVENT-DRIVEN REPLAY
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border transition-all ${
                isRestricted
                  ? 'bg-red-950/90 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isRestricted ? '🚨 ADAPTIVE CONTAINMENT ACTIVE' : '🟢 NOMINAL BASELINE (TRUST: 100)'}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 font-mono">
            Mathematical Reconstruction • Dynamically Driven by In-Memory <code className="text-cyan-400">audit_logs</code> Transactions
          </p>
        </div>

        {/* Action Controls: Simulate Cyber Attack Burst & Reset */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleTriggerSimulatedAttack}
            disabled={isSimulatingAttack}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border shadow-lg ${
              isSimulatingAttack
                ? 'bg-red-950 text-red-300 border-red-500/60 animate-pulse'
                : 'bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
            }`}
            title="Simulate Bot Scraping Cyber Attack: Fires 10 rapid events in 2 seconds to test live Trust Engine reactivity"
          >
            <Zap className={`w-4 h-4 text-red-400 ${isSimulatingAttack ? 'animate-spin' : ''}`} />
            <span>{isSimulatingAttack ? 'Firing Burst...' : '⚡ Simulate Cyber Attack (Burst)'}</span>
          </button>

          <button
            onClick={handleResetBaseline}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title="Reset Trust Score to 100/100 nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Trust (100)</span>
          </button>
        </div>
      </div>

      {/* ── 2. CORE DIRECTED GRAPH CANVAS ────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-2xl backdrop-blur-md flex flex-col space-y-3">
        
        {/* Graph Header & Step Playback */}
        <div className="flex items-center justify-between border-b border-[#111e38] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                Reconstructed Attack Kill-Chain ({dynamicNodes.length} Nodes)
              </h2>
              <p className="text-[10.5px] text-slate-400 font-mono">
                Directed graph auto-populates as actions happen across CrimeSync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#030814] border border-[#162744]">
            <button
              onClick={handlePlayReplay}
              disabled={isPlaying || dynamicNodes.length <= 1}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-blue-600/40 text-blue-300 border border-blue-500/40'
                  : 'bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/40 disabled:opacity-40'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isPlaying ? 'Replaying...' : 'Replay'}</span>
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              disabled={!isPlaying}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer border border-slate-800"
            >
              <Pause className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Nodes Visual Path */}
        <div className="relative overflow-x-auto py-4 px-2 select-none min-h-[170px]">
          {dynamicNodes.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Awaiting session events...</span>
            </div>
          ) : (
            <div className="min-w-[760px] flex items-center justify-between relative py-4">
              
              {/* SVG Connecting Directed Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="liveEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                <line
                  x1="5%"
                  y1="50%"
                  x2="95%"
                  y2="50%"
                  stroke="#1e293b"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />

                <motion.line
                  x1="5%"
                  y1="50%"
                  x2={`${5 + (Math.min(maxPlaybackStep, dynamicNodes.length) / dynamicNodes.length) * 90}%`}
                  y2="50%"
                  stroke={isRestricted ? 'url(#liveEdgeGrad)' : '#10b981'}
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>

              {/* Dynamic Node Orbs */}
              {dynamicNodes.map((node, index) => {
                const isVisible = index + 1 <= maxPlaybackStep;
                const isSelected = activeSelectedNode?.id === node.id;
                const isCrit = node.severity === 'CRITICAL';
                const isWarn = node.severity === 'SUSPICIOUS';
                const isBlock = node.severity === 'CONTAINED';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`relative z-10 flex flex-col items-center cursor-pointer w-24 sm:w-32 transition-colors duration-150 hover:brightness-125 hover:drop-shadow-[0_0_16px_rgba(6,182,212,0.5)] ${
                      !isVisible ? 'pointer-events-none' : ''
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isVisible ? 1 : 0.2,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center w-full pointer-events-none select-none"
                    >
                      {/* Node Orb */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-lg ${
                          isSelected ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#030712]' : ''
                        } ${
                          isBlock
                            ? 'bg-blue-950 border-blue-400 text-cyan-300 shadow-[0_0_18px_rgba(59,130,246,0.6)] animate-pulse'
                            : isCrit
                            ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.5)]'
                            : isWarn
                            ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                            : 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        }`}
                      >
                        {node.iconType === 'login' && <Globe className="w-4 h-4" />}
                        {node.iconType === 'case' && <Network className="w-4 h-4" />}
                        {node.iconType === 'evidence' && <Layers className="w-4 h-4" />}
                        {node.iconType === 'honey' && <Bug className="w-4 h-4 animate-bounce" />}
                        {node.iconType === 'export' && <FileText className="w-4 h-4" />}
                        {node.iconType === 'containment' && <ShieldAlert className="w-5 h-5" />}
                      </div>

                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded mt-2 border ${
                        isBlock
                          ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                          : isCrit
                          ? 'bg-red-950 text-red-300 border-red-500/40'
                          : isWarn
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      }`}>
                        0{node.stepNumber} • {node.category}
                      </span>

                      <div className="text-center mt-1 px-1">
                        <div className="font-bold text-white text-[10.5px] font-mono leading-tight truncate max-w-[110px]">
                          {node.title}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {node.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. CLEAN 2-COLUMN SPLIT: NODE INSPECTOR & REAL-TIME AUDIT STREAM ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Selected Node Raw Log Forensic Inspector (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111e38] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Event Inspector: {activeSelectedNode?.rawLog.eventId || 'No Selection'}
                </h3>
              </div>
              {activeSelectedNode && (
                <button
                  onClick={() => handleCopyRawJson(activeSelectedNode.rawLog)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer border border-slate-700"
                  title="Copy JSON record"
                >
                  {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                  <span>{copiedLog ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {activeSelectedNode ? (
              <div className="space-y-3 font-mono text-xs">
                {/* Action & Verdict */}
                <div className="p-3 rounded-xl bg-[#02050e] border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">ACTION TYPE</span>
                    <strong className="text-white text-sm">
                      {activeSelectedNode.rawLog.action === 'TAB_SWITCH'
                        ? `[TAB] ${getTabLabel(activeSelectedNode.rawLog.payload?.tabId, activeSelectedNode.rawLog.payload?.tabName || activeSelectedNode.rawLog.module)}`
                        : `\`${activeSelectedNode.rawLog.action}\``}
                    </strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    activeSelectedNode.severity === 'CONTAINED'
                      ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                      : activeSelectedNode.severity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border-red-500/40'
                      : activeSelectedNode.severity === 'SUSPICIOUS'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {activeSelectedNode.rawLog.verdict}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#040915] border border-slate-800">
                    <span className="text-slate-500 text-[9px] uppercase block">Principal</span>
                    <span className="text-slate-200 font-bold truncate block">{activeSelectedNode.rawLog.userName}</span>
                    <span className="text-slate-400 text-[9.5px]">({activeSelectedNode.rawLog.userId})</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#040915] border border-slate-800">
                    <span className="text-slate-500 text-[9px] uppercase block">Module / Category</span>
                    <span className="text-amber-300 font-bold truncate block">
                      {activeSelectedNode.rawLog.action === 'TAB_SWITCH'
                        ? getTabLabel(activeSelectedNode.rawLog.payload?.tabId, activeSelectedNode.rawLog.payload?.tabName || activeSelectedNode.rawLog.module)
                        : activeSelectedNode.rawLog.module}
                    </span>
                    <span className="text-slate-400 text-[9.5px]">({activeSelectedNode.category})</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#040915] border border-slate-800">
                    <span className="text-slate-500 text-[9px] uppercase block">Egress IP & Location</span>
                    <span className="text-cyan-300 font-bold block">{activeSelectedNode.rawLog.ipAddress}</span>
                    <span className="text-slate-400 text-[9.5px]">{activeSelectedNode.rawLog.location}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#040915] border border-slate-800">
                    <span className="text-slate-500 text-[9px] uppercase block">Threat Penalty</span>
                    <span className={`font-bold block ${activeSelectedNode.rawLog.threatPenalty > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {activeSelectedNode.rawLog.threatPenalty > 0 ? `-${activeSelectedNode.rawLog.threatPenalty} pts` : '0 pts (Nominal)'}
                    </span>
                    <span className="text-slate-400 text-[9.5px]">{activeSelectedNode.rawLog.displayTime}</span>
                  </div>
                </div>

                {/* Payload & SHA-256 */}
                <div className="p-2.5 rounded-lg bg-[#040915] border border-slate-800 space-y-1 text-[10.5px]">
                  <div className="text-slate-300">
                    <span className="text-slate-500">Payload: </span>
                    <code>{JSON.stringify(activeSelectedNode.rawLog.payload)}</code>
                  </div>
                  <div className="text-slate-500 text-[9.5px]">
                    SHA-256: <code className="text-cyan-400">{activeSelectedNode.rawLog.sha256}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Select any node from the graph above to inspect its PostgreSQL audit payload.
              </div>
            )}
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#111e38] text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Adaptive Account Protection</span>
            <span className={isRestricted ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isRestricted ? 'EXFILTRATION BLOCKED' : 'NOMINAL CLEARANCE'}
            </span>
          </div>
        </div>

        {/* Right Column: Real-Time Audit Log Stream (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111e38] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Live Audit Stream ({filteredLogs.length} Events)
                </h3>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-7 pr-2.5 py-0.5 rounded-lg bg-[#02050e] border border-slate-800 text-slate-200 text-[11px] focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 w-32 sm:w-40 font-mono"
                />
              </div>
            </div>

            {/* Scrollable Event List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No matching audit logs found.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isCrit = log.severity === 'CRITICAL';
                  const isWarn = log.severity === 'SUSPICIOUS';
                  const isContain = log.severity === 'CONTAINED';
                  const isSelected = activeSelectedNode?.id === log.id;
                  const isTabSwitch = log.action === 'TAB_SWITCH';
                  const tabLabel = isTabSwitch
                    ? getTabLabel(log.payload?.tabId, log.payload?.tabName || log.module)
                    : null;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedNodeId(log.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 font-mono text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                          : isCrit
                          ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/35'
                          : isWarn
                          ? 'bg-amber-950/15 border-amber-500/40 hover:bg-amber-950/25'
                          : isContain
                          ? 'bg-blue-950/20 border-blue-500/40 hover:bg-blue-950/30'
                          : 'bg-[#030916] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                          {log.displayTime}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded border font-bold text-[10px] ${
                          isTabSwitch
                            ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                            : 'bg-[#02050e] border-slate-700 text-cyan-300'
                        }`}>
                          {isTabSwitch ? tabLabel : log.action}
                        </span>
                        <span className="text-slate-300 text-[11px] truncate">
                          {isTabSwitch ? `Navigated to ${tabLabel}` : log.module}
                        </span>
                      </div>

                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border flex-shrink-0 ${
                        isCrit
                          ? 'bg-red-950 text-red-300 border-red-500/50'
                          : isWarn
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : isContain
                          ? 'bg-blue-950 text-blue-300 border-blue-500/50'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {log.verdict}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#111e38] text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Live SQLite / PostgreSQL Event Stream</span>
            <span className="text-cyan-400 font-bold">Auto-Appends on User Click</span>
          </div>
        </div>

      </div>

    </div>
  );
};
