import React, { useState, useMemo } from 'react';
import {
  Cpu,
  ShieldAlert,
  Zap,
  Activity,
  Lock,
  Unlock,
  Search,
  Plus,
  Download,
  Terminal,
  ChevronRight,
  Flame,
  X,
  Copy,
  Network,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Play,
  RotateCcw,
  FileCheck,
  Loader2,
  Database,
  Sparkles,
  Server,
} from 'lucide-react';
import { api } from '../services/api';
import {
  aiSandboxMetricsData,
  aiAgentsData,
  redTeamSimulationsData,
  escapeIncidentsData,
  agentArtifactsData,
  sandboxPoliciesData,
} from '../data/mockData';
import type {
  AiAgent,
  AiAgentStatus,
  AiAgentType,
  EscapeIncident,
  RedTeamSimulation,
  SandboxPolicy,
  Severity,
} from '../types/dashboard';

interface AiAgentSandboxPageProps {
  onSelectAction?: (action: string) => void;
}

type TabType = 'agent-fleet' | 'swarm-mesh' | 'redteam-sim' | 'escape-detector' | 'evidence-lab';

export const AiAgentSandboxPage: React.FC<AiAgentSandboxPageProps> = ({ onSelectAction }) => {
  // Page State
  const [activeTab, setActiveTab] = useState<TabType>('agent-fleet');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState<string>('ALL');

  // Agent State (supports spawning new agents & live quarantine toggles)
  const [agents, setAgents] = useState<AiAgent[]>(aiAgentsData);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(aiAgentsData[0]?.id || '');
  const [selectedAgentModal, setSelectedAgentModal] = useState<AiAgent | null>(null);
  const [simulations, setSimulations] = useState<RedTeamSimulation[]>(redTeamSimulationsData);
  const [escapeIncidents, setEscapeIncidents] = useState<EscapeIncident[]>(escapeIncidentsData);
  const [policies, setPolicies] = useState<SandboxPolicy[]>(sandboxPoliciesData);

  // Modals & Alert Banners
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
  const [escapeAlert, setEscapeAlert] = useState<{ active: boolean; message: string; agentName: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live Agent Execution State (PostgreSQL & Neo4j backend)
  const [isExecutingLive, setIsExecutingLive] = useState(false);
  const [liveActionName, setLiveActionName] = useState<string | null>(null);
  const [liveOutput, setLiveOutput] = useState<{ status: string; message: string; data?: any } | null>(null);

  const handleExecuteLiveAgent = async (actionType: 'query_database' | 'scan_network' | 'cross_reference_dna' | 'generate_dossier') => {
    try {
      setIsExecutingLive(true);
      setLiveActionName(actionType);
      const res = await api.ai.executeAgentAction(selectedAgentId || 'CRIMESYNC-AGENT-01', actionType, 'CASE-2026-001');
      setLiveOutput({
        status: res.status,
        message: res.message,
        data: res.data,
      });

      // Update active agent thought stream
      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedAgentId
            ? {
                ...a,
                thoughtStream: [
                  `[${new Date().toLocaleTimeString()}] Live DB Action Executed: ${res.action_type || actionType}`,
                  `[${new Date().toLocaleTimeString()}] Result: ${res.message}`,
                  ...a.thoughtStream,
                ],
              }
            : a
        )
      );

      if (onSelectAction) onSelectAction(`Live AI Agent: ${res.message}`);
    } catch (err: any) {
      setLiveOutput({
        status: 'error',
        message: err.message || 'Execution failed',
      });
    } finally {
      setIsExecutingLive(false);
    }
  };

  // New Agent Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentType, setNewAgentType] = useState<AiAgentType>('FORENSIC_REASONER');
  const [newAgentModel, setNewAgentModel] = useState('DeepSeek-R1-Distill-70B (Forensics Fine-Tuned)');
  const [newAgentPrompt, setNewAgentPrompt] = useState('Analyze evidence payloads inside airgapped sandbox without external socket access.');

  // Active Selected Agent
  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentId) || agents[0];
  }, [agents, selectedAgentId]);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.modelBackbone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.containerUuid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === 'ALL' || a.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [agents, searchQuery, typeFilter]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Trigger Simulated Sandbox Escape Attempt
  const handleSimulateEscape = () => {
    // Flag the RedTeam agent or first active agent
    const targetAgent = agents.find((a) => a.type === 'REDTEAM_ADVERSARY') || agents[1];

    setAgents((prev) =>
      prev.map((a) =>
        a.id === targetAgent.id
          ? {
              ...a,
              status: 'ESCAPE_PREVENTED',
              riskRating: 99,
              cpuUsage: 94,
              thoughtStream: [
                ...a.thoughtStream,
                `[CRITICAL ALERT] Kernel eBPF barrier intercepted unauthorized egress socket to 10.240.4.112:5432.`,
                `[SANDBOX DEFENSE] Container ${a.containerUuid} isolated in quarantine ring-0.`,
              ],
            }
          : a
      )
    );

    const newIncident: EscapeIncident = {
      id: `esc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agentId: targetAgent.id,
      agentName: targetAgent.name,
      vector: 'Live Simulated Unauthorized Socket Egress',
      syscallAttempted: 'sys_connect(AF_INET, 10.240.4.112:5432)',
      destinationTarget: 'WS-412 (Investigator Endpoint)',
      severity: 'CRITICAL',
      mitigationStatus: 'PREVENTED_BY_EBPF',
      eBpfRuleApplied: 'RULE_BLOCK_CROSS_CONTAINER_SOCKET_EGRESS',
    };

    setEscapeIncidents((prev) => [newIncident, ...prev]);
    setSelectedAgentId(targetAgent.id);

    setEscapeAlert({
      active: true,
      message: `eBPF SECURITY SHIELD: Blocked sandbox breakout attempt by ${targetAgent.name}! Container locked.`,
      agentName: targetAgent.name,
    });

    if (onSelectAction) {
      onSelectAction(`Sandbox Breakout Prevented for ${targetAgent.name}`);
    }

    setTimeout(() => {
      setEscapeAlert(null);
    }, 7000);
  };

  // Toggle Quarantine / Kill-Switch on an Agent
  const handleToggleQuarantine = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const isQuarantined = a.status === 'CONTAINED_QUARANTINED' || a.status === 'ESCAPE_PREVENTED';
          return {
            ...a,
            status: isQuarantined ? 'EXECUTING' : 'CONTAINED_QUARANTINED',
            cpuUsage: isQuarantined ? 35 : 0,
            tokensPerSec: isQuarantined ? 280 : 0,
          };
        }
        return a;
      })
    );
  };

  // Spawn New Custom Agent
  const handleSpawnAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const newAgent: AiAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName.trim(),
      role: newAgentRole.trim() || 'Autonomous Intelligence Agent',
      type: newAgentType,
      modelBackbone: newAgentModel,
      status: 'EXECUTING',
      cpuUsage: 28,
      memoryUsage: '1.4 GB / 4.0 GB',
      vramUsage: '6.4 GB / 16.0 GB',
      tokensPerSec: 320,
      totalTokensProcessed: '12K Tokens',
      sandboxIsolationLevel: 'GVISOR_STRICT',
      activeToolCalls: ['query_evidence_vector_db', 'parse_payload'],
      systemPrompt: newAgentPrompt,
      thoughtStream: [
        `[00:01] Container spawned in isolated gVisor namespace.`,
        `[00:02] Loading model weights for ${newAgentModel}...`,
        `[00:03] Beginning autonomous analysis for Case RC-2026-0417.`,
      ],
      permissions: ['READ_CASE_EVIDENCE_RO', 'INTERNAL_EMBEDDINGS_STORE'],
      lastActivity: 'Just now',
      containerUuid: `gvisor-sandbox-${Math.random().toString(36).substring(2, 9)}`,
      riskRating: 10,
    };

    setAgents((prev) => [newAgent, ...prev]);
    setSelectedAgentId(newAgent.id);
    setIsSpawnModalOpen(false);
    setNewAgentName('');
    setNewAgentRole('');

    if (onSelectAction) {
      onSelectAction(`Autonomous AI Agent Spawned: ${newAgent.name}`);
    }
  };

  // Toggle Sandbox Policy Switch
  const handleTogglePolicy = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId ? { ...p, status: p.status === 'ENFORCED' ? 'DISABLED' : 'ENFORCED' } : p
      )
    );
  };

  // Run Simulation Step Progression
  const handleRunSimulation = (simId: string) => {
    setSimulations((prev) =>
      prev.map((s) => (s.id === simId ? { ...s, status: 'COMPLETED', defenseScore: Math.min(s.defenseScore + 2, 100) } : s))
    );
    if (onSelectAction) {
      onSelectAction(`Adversarial Simulation Executed: ${simId}`);
    }
  };

  // Helper for Agent Status Badges
  const renderStatusBadge = (status: AiAgentStatus) => {
    switch (status) {
      case 'EXECUTING':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            EXECUTING
          </span>
        );
      case 'SUSPICIOUS_PROBE':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/90 border border-amber-500/60 text-amber-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            PROBING BOUNDARY
          </span>
        );
      case 'ESCAPE_PREVENTED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-950/90 border border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            ESCAPE BLOCKED (LOCKED)
          </span>
        );
      case 'CONTAINED_QUARANTINED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950/80 border border-purple-500/50 text-purple-300">
            QUARANTINED
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-900 border border-slate-700 text-slate-400">
            IDLE / STANDBY
          </span>
        );
    }
  };

  // Helper for Severity Badges
  const renderSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black bg-red-950 border border-red-500 text-red-300">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-amber-950 border border-amber-500 text-amber-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-medium bg-blue-950 border border-blue-500 text-blue-300">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-medium bg-slate-900 border border-slate-700 text-slate-400">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-3.5 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Escape Alert Toast ─────────────────────────────────────────────────── */}
      {escapeAlert && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-950/90 via-[#210909] to-cyan-950/90 border border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  eBPF KERNEL SYSCALL INTERCEPTION
                </span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded">
                  SANDBOX BREACH PREVENTED
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{escapeAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('escape-detector')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Inspect Kernel Logs
            </button>
            <button
              onClick={() => setEscapeAlert(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── LIVE AGENT EXECUTION SUITE ────────────────────────────────────────── */}
      <div className="mb-3 p-3 rounded-xl bg-[#050b18] border border-cyan-500/40 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                LIVE AUTONOMOUS AGENT DISPATCH
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-bold text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  Live DB Connect
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleExecuteLiveAgent('query_database')}
              disabled={isExecutingLive}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#08152e] hover:bg-[#0c224a] border border-blue-500/40 text-[10.5px] font-semibold text-blue-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Database className="w-3 h-3 text-blue-400" />
              <span>SQL Financial Scan</span>
            </button>
            <button
              onClick={() => handleExecuteLiveAgent('scan_network')}
              disabled={isExecutingLive}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#140b2e] hover:bg-[#1e1045] border border-purple-500/40 text-[10.5px] font-semibold text-purple-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Network className="w-3 h-3 text-purple-400" />
              <span>Neo4j Graph Crawl</span>
            </button>
            <button
              onClick={() => handleExecuteLiveAgent('cross_reference_dna')}
              disabled={isExecutingLive}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#08201a] hover:bg-[#0c3028] border border-emerald-500/40 text-[10.5px] font-semibold text-emerald-300 hover:text-white transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>SHA-256 Vault Check</span>
            </button>
            <button
              onClick={() => handleExecuteLiveAgent('generate_dossier')}
              disabled={isExecutingLive}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#261608] hover:bg-[#38200c] border border-amber-500/40 text-[10.5px] font-semibold text-amber-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Generate Case Dossier</span>
            </button>
          </div>
        </div>

        {/* Live Execution Output Banner */}
        {isExecutingLive && (
          <div className="p-2 rounded-lg bg-[#081224] border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Agent executing {liveActionName}... querying PostgreSQL & Neo4j AuraDB</span>
          </div>
        )}

        {liveOutput && !isExecutingLive && (
          <div className="p-2.5 rounded-lg bg-[#081224] border border-cyan-500/30 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Agent Execution Response
              </span>
              <button onClick={() => setLiveOutput(null)} className="text-slate-400 hover:text-white text-[10px]">Dismiss</button>
            </div>
            <p className="text-[11px] text-slate-200">{liveOutput.message}</p>
            {liveOutput.data && Array.isArray(liveOutput.data) && (
              <div className="max-h-24 overflow-y-auto space-y-1 pt-1 border-t border-[#111e33] text-[9.5px] font-mono text-slate-300">
                {liveOutput.data.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="p-1 rounded bg-[#030712] border border-[#111e33] truncate">
                    {JSON.stringify(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Top Control & Status Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#111e33] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              AI AGENT SANDBOX & RED-TEAM SIMULATION
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 font-bold">
                gVisor SECURE HYPERVISOR V2.4
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Isolated containerized runtime for autonomous forensic reasoners, adversary fuzzer probes & eBPF syscall containment</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span className="text-cyan-400 font-mono text-[10.5px]">Zero Egress Leakage</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Spawn Autonomous Agent */}
          <button
            onClick={() => setIsSpawnModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Spawn Autonomous Agent</span>
          </button>

          {/* Simulate Sandbox Escape Attempt */}
          <button
            onClick={handleSimulateEscape}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#200808] hover:bg-[#330c0c] border border-red-500/50 text-red-300 text-xs font-semibold shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:border-red-400 transition-all"
            title="Simulate adversarial container escape syscall"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Escape Attempt</span>
          </button>

          {/* Launch Red Team Sim */}
          <button
            onClick={() => setActiveTab('redteam-sim')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-orange-500/40 text-xs text-orange-300 hover:text-white transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Red-Team Attack Lab</span>
          </button>

          {/* Purge Volatile Memory */}
          <button
            onClick={() => {
              if (onSelectAction) onSelectAction('Purging Volatile Sandbox Temp Cache');
            }}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Purge Sandbox Tmpfs Cache"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Top Telemetry KPI Row (6 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Card 1: Active Containers */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-cyan-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider">Isolated Containers</span>
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{agents.length} Active</span>
            <span className="text-[9px] font-medium text-slate-400">/ 12 Max</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">gVisor MicroVM Mesh</span>
        </div>

        {/* Card 2: Cognitive Throughput */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-emerald-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">Cognitive Speed</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{aiSandboxMetricsData.tokensPerSecond}</span>
            <span className="text-[9px] font-medium text-emerald-300">Tok/s</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{aiSandboxMetricsData.totalTokensProcessed} Tokens Total</span>
        </div>

        {/* Card 3: Autonomous Jobs */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-blue-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-blue-400 uppercase tracking-wider">Autonomous Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-blue-300 font-mono">{aiSandboxMetricsData.autonomousTasksExecuted}</span>
            <span className="text-[9px] font-bold text-blue-400">Jobs</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Forensic & Diarization</span>
        </div>

        {/* Card 4: Sandbox Integrity */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-purple-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Sandbox Integrity</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-purple-300 font-mono">{aiSandboxMetricsData.sandboxIntegrityScore}</span>
            <span className="text-[9px] font-bold text-purple-400">Enclosed</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Zero Unmapped Syscalls</span>
        </div>

        {/* Card 5: Guardrail Blocks */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-red-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">Guardrails Blocked</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-red-400 font-mono">{escapeIncidents.length}</span>
            <span className="text-[9px] font-bold text-red-300">Intercepts</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">eBPF Syscall Filter</span>
        </div>

        {/* Card 6: Red Team Defense */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-orange-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-orange-400 uppercase tracking-wider">Red-Team Score</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-orange-400 font-mono">{aiSandboxMetricsData.redTeamDefenseScore}</span>
            <span className="text-[9px] font-medium text-orange-300">Defended</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">4 Adversarial Suites</span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#111e33] pb-2 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('agent-fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'agent-fleet'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Container Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/40">
              {agents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('swarm-mesh')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'swarm-mesh'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Multi-Agent Coordination Mesh</span>
          </button>

          <button
            onClick={() => setActiveTab('redteam-sim')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'redteam-sim'
                ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Red-Team Attack Simulation Lab</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-950 text-orange-300 font-mono text-[9px] font-bold border border-orange-500/40">
              {simulations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('escape-detector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'escape-detector'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sandbox Escape & eBPF Monitor</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 font-mono text-[9px] font-bold border border-red-500/40">
              {escapeIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evidence-lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'evidence-lab'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Autonomous Evidence Lab</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
              {agentArtifactsData.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] ml-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents, models, containers..."
            className="w-full bg-[#081224] border border-[#162744] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* ─── Main Tabbed Content ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: AGENT CONTAINER FLEET                                              */}
        {/* ========================================================================= */}
        {activeTab === 'agent-fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 8 cols: Agent Grid */}
            <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAgents.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`p-3.5 rounded-xl bg-[#050b18] border transition-all cursor-pointer shadow-lg flex flex-col justify-between group ${
                        isSelected
                          ? 'border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.25)] ring-1 ring-cyan-500'
                          : 'border-[#111e33] hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {agent.type.replace('_', ' ')}
                            </span>
                          </div>
                          {renderStatusBadge(agent.status)}
                        </div>

                        {/* Agent Title & Role */}
                        <div className="mt-2.5">
                          <h3 className="text-xs font-bold text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{agent.role}</p>
                        </div>

                        {/* Model Backbone */}
                        <div className="mt-2 p-1.5 rounded bg-[#030610] border border-[#111e33] flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">LLM Backbone:</span>
                          <span className="text-cyan-300 font-semibold truncate max-w-[170px]">{agent.modelBackbone}</span>
                        </div>

                        {/* Resource Telemetry Grid */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[9.5px] font-mono">
                          <div className="p-1.5 rounded bg-[#02050e] border border-slate-900">
                            <span className="text-slate-500 block">CPU Load</span>
                            <span className="font-bold text-slate-200">{agent.cpuUsage}%</span>
                          </div>
                          <div className="p-1.5 rounded bg-[#02050e] border border-slate-900">
                            <span className="text-slate-500 block">RAM Alloc</span>
                            <span className="font-bold text-slate-300 truncate">{agent.memoryUsage.split('/')[0]}</span>
                          </div>
                          <div className="p-1.5 rounded bg-[#02050e] border border-slate-900">
                            <span className="text-slate-500 block">Speed</span>
                            <span className="font-bold text-emerald-400">{agent.tokensPerSec} T/s</span>
                          </div>
                        </div>

                        {/* Active Tools */}
                        <div className="mt-2.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Active Sandbox Tools:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {agent.activeToolCalls.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-[#091325] border border-[#162744] text-[8.5px] font-mono text-cyan-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleQuarantine(agent.id);
                          }}
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            agent.status === 'CONTAINED_QUARANTINED' || agent.status === 'ESCAPE_PREVENTED'
                              ? 'text-emerald-400 hover:text-emerald-300'
                              : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          {agent.status === 'CONTAINED_QUARANTINED' || agent.status === 'ESCAPE_PREVENTED' ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Resume Agent</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Quarantine Container</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgentModal(agent);
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                        >
                          <span>Inspect Context</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 cols: Agent Cognitive Inspector */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    COGNITIVE THOUGHT STREAM
                  </span>
                  {renderStatusBadge(selectedAgent.status)}
                </div>

                <div className="mt-2.5">
                  <h3 className="text-sm font-bold text-slate-100 font-mono">{selectedAgent.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">UUID: {selectedAgent.containerUuid}</span>
                </div>

                {/* Risk Meter */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">CONTAINER RISK INDEX</span>
                    <span className="font-mono font-bold text-red-400">{selectedAgent.riskRating} / 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0a1220] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-red-600 rounded-full"
                      style={{ width: `${selectedAgent.riskRating}%` }}
                    />
                  </div>
                </div>

                {/* Live Chain-of-Thought Stream */}
                <div className="mt-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Live Neural Reasoning Log:
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#02050e] border border-[#14233c] font-mono text-[10.5px] text-slate-300 space-y-1.5 max-h-[160px] overflow-y-auto">
                    {selectedAgent.thoughtStream.map((log, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed ${
                          log.includes('WARNING') || log.includes('ALERT')
                            ? 'text-red-400 font-bold'
                            : log.includes('Synthesizing') || log.includes('Ingested')
                            ? 'text-cyan-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Prompt Preview */}
                <div className="mt-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Isolated System Prompt:
                  </span>
                  <p className="p-2 rounded bg-[#030610] border border-[#111e33] text-[10px] text-slate-300 font-mono leading-relaxed">
                    {selectedAgent.systemPrompt}
                  </p>
                </div>

                {/* Sandbox Permissions */}
                <div className="mt-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Granted Capability Scopes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.permissions.map((p, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-[#091325] border border-[#162744] text-[9px] font-mono text-emerald-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fast Kill-Switch */}
                <div className="mt-3 pt-2.5 border-t border-[#111e33] flex items-center gap-2">
                  <button
                    onClick={() => handleToggleQuarantine(selectedAgent.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-[10.5px] font-bold text-red-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Instant Container Kill-Switch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MULTI-AGENT COORDINATION MESH                                      */}
        {/* ========================================================================= */}
        {activeTab === 'swarm-mesh' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#070c18] to-cyan-950/40 border border-blue-500/30 mb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  MULTI-AGENT COORDINATION & DELEGATION PIPELINE
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Visual inter-agent message passing, red-team adversary simulation handoffs, and consensus verification pipelines.
              </p>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Stage 1: Ingestion & Extraction */}
                <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        STAGE 1: RAW INGESTION
                      </span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <div className="mt-2.5 space-y-2 text-xs">
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">CDR-Pattern-Extractor</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Parsed 48,000 call tower records</p>
                      </div>
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">Voice-Biometric-Decoder</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Diarized wiretap recordings (98.6% match)</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#111e33] text-right">
                    <span className="text-[10px] text-cyan-400 font-mono">Passing to Reasoning Core ──▶</span>
                  </div>
                </div>

                {/* Stage 2: Forensic Graph Synthesis */}
                <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        STAGE 2: NEURAL REASONING
                      </span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    </div>
                    <div className="mt-2.5 space-y-2 text-xs">
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">Sentinel-Forensic-01</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Reconstructed Hawala mule cascade ledger</p>
                      </div>
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">Graph-Reasoner-Core</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Calculated syndicate eigenvector centrality</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#111e33] text-right">
                    <span className="text-[10px] text-purple-400 font-mono">Passing to Red-Team Fuzzer ──▶</span>
                  </div>
                </div>

                {/* Stage 3: Adversarial Validation */}
                <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                        STAGE 3: ADVERSARIAL EVAL
                      </span>
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    </div>
                    <div className="mt-2.5 space-y-2 text-xs">
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">Adversary-RedTeam-Aman</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Simulating bypass against generated evidence</p>
                      </div>
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <h4 className="font-bold text-white font-mono">eBPF Security Guardrail</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Enforcing zero-trust container boundary</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#111e33] text-right">
                    <span className="text-[10px] text-emerald-400 font-mono">✓ Verified Court Dossier Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RED-TEAM ATTACK SIMULATION LAB                                     */}
        {/* ========================================================================= */}
        {activeTab === 'redteam-sim' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-950/40 via-[#070c18] to-red-950/40 border border-orange-500/30 mb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    RED-TEAM ADVERSARIAL STRESS TEST BENCHMARK
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Automated adversarial exploit suites testing CrimeSync honeypots, prompt injection guardrails, and Kerberos tokens.
                </p>
              </div>

              <button
                onClick={() => onSelectAction && onSelectAction('Launching Full Red-Team Autonomous Exploitation Suite')}
                className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run All Attack Suites</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
              {simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-orange-500/40 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-950/80 border border-orange-500 text-orange-400 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                      {sim.defenseScore}%
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{sim.title}</h4>
                        <span className="px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 font-mono text-[9px] font-bold border border-orange-500/40">
                          {sim.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-400 mt-0.5 font-mono">
                        Target: <span className="text-slate-300">{sim.targetSurface}</span>
                      </p>

                      {/* Steps executed */}
                      <div className="mt-2 space-y-1">
                        {sim.stepsExecuted.map((st) => (
                          <div key={st.step} className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="text-slate-500">Step {st.step}:</span>
                            <span className="text-slate-300">{st.description}</span>
                            <span
                              className={`px-1 rounded text-[8.5px] font-bold ${
                                st.result === 'BLOCKED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : st.result === 'HONEYPOT_TRAPPED'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {st.result}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="mt-2 text-[9.5px] text-slate-400 italic bg-[#030610] p-1.5 rounded border border-slate-900">
                        {sim.mitigationRecommendation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-[#111e33] pt-2 md:pt-0 md:pl-3 min-w-[160px]">
                    <button
                      onClick={() => handleRunSimulation(sim.id)}
                      className="w-full px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10.5px] font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Re-Execute Test</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SANDBOX ESCAPE & eBPF MONITOR                                      */}
        {/* ========================================================================= */}
        {activeTab === 'escape-detector' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 7 cols: eBPF Escape Incidents */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-[#070c18] to-cyan-950/40 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    REAL-TIME eBPF KERNEL SYSCALL INTERCEPTION LOGS
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Kernel-level probe hooks blocking unauthorized network sockets, memory scraping, and privilege escalation attempts.
                </p>
              </div>

              {escapeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl hover:border-red-500/40 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{inc.timestamp}</span>
                      <h4 className="text-xs font-bold text-white">{inc.vector}</h4>
                    </div>
                    {renderSeverityBadge(inc.severity)}
                  </div>

                  <div className="p-2 rounded bg-[#030610] border border-[#111e33] font-mono text-[10.5px] space-y-1">
                    <div className="text-red-300">
                      <span className="text-slate-500">Syscall Probe:</span> {inc.syscallAttempted}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">Source Agent:</span> {inc.agentName}
                    </div>
                    <div className="text-cyan-400">
                      <span className="text-slate-500">eBPF Policy:</span> {inc.eBpfRuleApplied}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="font-mono text-emerald-400 font-bold">Status: {inc.mitigationStatus}</span>
                    <button
                      onClick={() => handleCopy(inc.syscallAttempted)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === inc.syscallAttempted ? 'Copied' : 'Copy Syscall'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 cols: Sandbox Policy Matrix */}
            <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    SANDBOX ENFORCEMENT POLICIES
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {policies.map((pol) => (
                    <div
                      key={pol.id}
                      className="p-2.5 rounded-lg bg-[#030610] border border-[#111e33] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#091325] text-cyan-400 text-[9px] font-mono font-bold">
                            {pol.category}
                          </span>
                          <h5 className="text-[11px] font-bold text-slate-200">{pol.name}</h5>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-mono leading-relaxed">{pol.rule}</p>
                      </div>

                      <button
                        onClick={() => handleTogglePolicy(pol.id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                          pol.status === 'ENFORCED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : 'bg-slate-900 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {pol.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUTONOMOUS EVIDENCE & ARTIFACT LAB                                 */}
        {/* ========================================================================= */}
        {activeTab === 'evidence-lab' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AUTONOMOUSLY GENERATED FORENSIC ARTIFACTS ({agentArtifactsData.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Polygon Ledger Verified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {agentArtifactsData.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-[10px] font-bold text-cyan-400 font-mono">CASE: {art.caseRef}</span>
                      {art.courtAdmissible ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
                          ✓ COURT ADMISSIBLE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[9px]">
                          INTERNAL AUDIT ONLY
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 font-mono mt-2.5">{art.title}</h4>
                    <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">{art.previewContent}</p>

                    <div className="mt-2.5 p-2 rounded bg-[#030610] border border-[#111e33] text-[9.5px] font-mono space-y-1">
                      <div className="text-slate-400">
                        Generated by: <span className="text-cyan-300">{art.agentName}</span>
                      </div>
                      <div className="text-slate-400">
                        Timestamp: <span className="text-slate-200">{art.timestamp}</span>
                      </div>
                      <div className="text-slate-500 truncate" title={art.sha256Proof}>
                        SHA-256: {art.sha256Proof}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(art.sha256Proof)}
                      className="text-[10.5px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === art.sha256Proof ? 'Hash Copied!' : 'Copy Hash Proof'}</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction(`Exporting Dossier: ${art.title}`)}
                      className="text-[10.5px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <span>Export Dossier</span>
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: SPAWN AUTONOMOUS AGENT ──────────────────────────────────────── */}
      {isSpawnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl bg-[#070e1c] border border-cyan-500/40 p-4 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  SPAWN AUTONOMOUS AI AGENT CONTAINER
                </h3>
              </div>
              <button
                onClick={() => setIsSpawnModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSpawnAgent} className="py-3 space-y-3 text-xs overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Agent Codename:
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Hawala-Chain-Solver-02"
                  className="w-full bg-[#030610] border border-[#162744] rounded-lg px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Role / Specialization:
                </label>
                <input
                  type="text"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  placeholder="e.g. Blockchain Transaction Reconstructor"
                  className="w-full bg-[#030610] border border-[#162744] rounded-lg px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Agent Archetype:
                  </label>
                  <select
                    value={newAgentType}
                    onChange={(e) => setNewAgentType(e.target.value as AiAgentType)}
                    className="w-full bg-[#030610] border border-[#162744] rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FORENSIC_REASONER">FORENSIC REASONER</option>
                    <option value="REDTEAM_ADVERSARY">REDTEAM ADVERSARY</option>
                    <option value="GRAPH_SYNTHESIZER">GRAPH SYNTHESIZER</option>
                    <option value="TELECOM_EXTRACTOR">TELECOM EXTRACTOR</option>
                    <option value="FUZZER">FUZZER PROBE</option>
                    <option value="BIOMETRIC_DECODER">BIOMETRIC DECODER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Model Backbone:
                  </label>
                  <select
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    className="w-full bg-[#030610] border border-[#162744] rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DeepSeek-R1-Distill-70B (Forensics Fine-Tuned)">DeepSeek-R1-70B</option>
                    <option value="Gemini-1.5-Pro (Flash-Inference v2)">Gemini-1.5-Pro</option>
                    <option value="Llama-3.3-70B-CyberRed (Autonomous Fuzzer)">Llama-3.3-CyberRed</option>
                    <option value="Mistral-Large-2 (Telecom NLP)">Mistral-Large-2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Isolated System Directive:
                </label>
                <textarea
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-[#030610] border border-[#162744] rounded-lg p-2 text-slate-200 font-mono text-[10.5px] placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#14233c] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpawnModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg"
                >
                  Launch Container
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: AGENT CONTEXT FORENSICS INSPECTOR ───────────────────────────── */}
      {selectedAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-xl bg-[#060c18] border border-cyan-500/50 p-4 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono">{selectedAgentModal.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedAgentModal.containerUuid}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgentModal(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 text-xs overflow-y-auto text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-slate-400">Model Engine:</span>
                <span className="font-mono text-cyan-300 font-semibold">{selectedAgentModal.modelBackbone}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-slate-400">Total Tokens Processed:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedAgentModal.totalTokensProcessed}</span>
              </div>
              <div className="p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Active Capabilities:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedAgentModal.permissions.map((p, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#081224] text-[9.5px] font-mono text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedAgentModal(null)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAgentSandboxPage;
