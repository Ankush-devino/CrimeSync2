import React, { useState, useMemo } from 'react';
import {
  Sun,
  ShieldAlert,
  Zap,
  Activity,
  Maximize2,
  Lock,
  Unlock,
  Search,
  Download,
  Terminal,
  Database,
  Key,
  Server,
  Laptop,
  Layers,
  ChevronRight,
  Flame,
  Check,
  X,
  FolderLock,
  Network,
  CheckCircle2,
  ShieldCheck,
  Globe,
  FileText
} from 'lucide-react';
import {
  blastRadiusMetricsData,
  blastNodesData,
  blastEdgesData,
  killChainStepsData,
  circuitBreakerPoliciesData,
  remediationTasksData,
} from '../data/mockData';
import type {
  BlastNode,
  BlastNodeType,
  CompromiseStatus,
  CircuitBreakerPolicy,
  RemediationTask,
  Severity,
} from '../types/dashboard';

interface BlastRadiusPageProps {
  onSelectAction?: (action: string) => void;
}

type TabType = 'propagation-map' | 'kill-chain' | 'exposed-assets' | 'containment-suite' | 'recovery-planner';

export const BlastRadiusPage: React.FC<BlastRadiusPageProps> = ({ onSelectAction }) => {
  // Page State
  const [activeTab, setActiveTab] = useState<TabType>('propagation-map');
  const [searchQuery, setSearchQuery] = useState('');
  const [hopFilter, setHopFilter] = useState<'ALL' | '0' | '1' | '2' | '3'>('ALL');

  // Data State (supports live lateral pivot simulations & quarantine toggles)
  const [nodes, setNodes] = useState<BlastNode[]>(blastNodesData);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(blastNodesData[0]?.id || '');
  const [selectedNodeModal, setSelectedNodeModal] = useState<BlastNode | null>(null);
  const [circuitPolicies, setCircuitPolicies] = useState<CircuitBreakerPolicy[]>(circuitBreakerPoliciesData);
  const [remediationTasks, setRemediationTasks] = useState<RemediationTask[]>(remediationTasksData);
  const [mapZoom, setMapZoom] = useState<number>(1);

  // Modals & Banners
  const [isCircuitModalOpen, setIsCircuitModalOpen] = useState(false);
  const [simulationAlert, setSimulationAlert] = useState<{ active: boolean; message: string; targetNode: string } | null>(null);

  // Active Selected Node
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchSearch =
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subnet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.ownerOrService.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchHop = hopFilter === 'ALL' || n.hopDistance.toString() === hopFilter;

      return matchSearch && matchHop;
    });
  }, [nodes, searchQuery, hopFilter]);

  // Trigger Simulated Lateral Pivot
  const handleSimulatePivot = () => {
    // Find a node that is not yet COMPROMISED
    const vulnerableNodes = nodes.filter((n) => n.compromiseStatus === 'HIGH_RISK_EXPOSED' || n.compromiseStatus === 'CONTAINED_SHIELDED');
    const target = vulnerableNodes.length > 0 ? vulnerableNodes[Math.floor(Math.random() * vulnerableNodes.length)] : nodes[nodes.length - 1];

    setNodes((prev) =>
      prev.map((n) =>
        n.id === target.id
          ? {
              ...n,
              compromiseStatus: 'COMPROMISED',
              riskScore: Math.min(n.riskScore + 15, 99),
              vulnerabilityVector: 'Active Lateral Movement Probe Registered',
            }
          : n
      )
    );

    setSelectedNodeId(target.id);
    setSimulationAlert({
      active: true,
      message: `LATERAL PIVOT ESCALATION: Intrusion vector propagated to ${target.name}!`,
      targetNode: target.name,
    });

    if (onSelectAction) {
      onSelectAction(`Compromise Propagated to ${target.name} (${target.ip})`);
    }

    setTimeout(() => {
      setSimulationAlert(null);
    }, 6000);
  };

  // Toggle Isolation on a Node
  const handleToggleIsolation = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const isAirgapped = n.containmentStatus === 'AIRGAPPED' || n.containmentStatus === 'REVOKED';
          return {
            ...n,
            containmentStatus: isAirgapped ? 'ACTIVE_MONITORED' : 'AIRGAPPED',
            compromiseStatus: isAirgapped ? 'HIGH_RISK_EXPOSED' : 'CONTAINED_SHIELDED',
          };
        }
        return n;
      })
    );
  };

  // Toggle Circuit Breaker Policy
  const handleTogglePolicy = (policyId: string) => {
    setCircuitPolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, status: p.status === 'TRIGGERED' ? 'STANDBY' : 'TRIGGERED' } : p))
    );
  };

  // Toggle Remediation Task Checkbox
  const handleToggleTask = (taskId: string) => {
    setRemediationTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED' }
          : t
      )
    );
  };

  // Helper for Node Icons
  const renderNodeTypeIcon = (type: BlastNodeType, className = 'w-4 h-4') => {
    switch (type) {
      case 'workstation':
        return <Laptop className={`${className} text-cyan-400`} />;
      case 'database':
        return <Database className={`${className} text-emerald-400`} />;
      case 'server':
        return <Server className={`${className} text-purple-400`} />;
      case 'officer_identity':
        return <Key className={`${className} text-amber-400`} />;
      case 'evidence_vault':
        return <FolderLock className={`${className} text-blue-400`} />;
      case 'case_folder':
        return <FileText className={`${className} text-pink-400`} />;
      case 'cloud_service':
        return <Globe className={`${className} text-indigo-400`} />;
      case 'router':
      default:
        return <Network className={`${className} text-orange-400`} />;
    }
  };

  // Helper for Compromise Status Badges
  const renderStatusBadge = (status: CompromiseStatus) => {
    switch (status) {
      case 'GROUND_ZERO':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-950/90 border border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            GROUND ZERO
          </span>
        );
      case 'COMPROMISED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-950/90 border border-orange-500/60 text-orange-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            COMPROMISED
          </span>
        );
      case 'HIGH_RISK_EXPOSED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300">
            EXPOSED (HIGH RISK)
          </span>
        );
      case 'CONTAINED_SHIELDED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            CONTAINED / AIRGAPPED
          </span>
        );
      case 'UNAFFECTED':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-900 border border-slate-700 text-slate-400">
            UNAFFECTED
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
      {/* ─── Simulation Alert Toast ──────────────────────────────────────────────── */}
      {simulationAlert && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-950/90 via-[#210909] to-orange-950/90 border border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  LATERAL SHOCKWAVE PROPAGATION SIMULATION
                </span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded">
                  CASCADE EVENT
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{simulationAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kill-chain')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Inspect Kill-Chain
            </button>
            <button
              onClick={() => setSimulationAlert(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Top Control & Status Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#111e33] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
              <Sun className="w-4 h-4 animate-spin-slow" />
            </div>
            <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              BLAST RADIUS & LATERAL IMPACT MODELING
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold">
                CONTAGION: TIER 3 REACH
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Compromise propagation simulation, dependency cascade mapping & Zero-Trust circuit breaker isolation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
            <span className="text-red-400 font-mono text-[10.5px]">48 Assets Connected in Mesh</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulate Lateral Pivot */}
          <button
            onClick={handleSimulatePivot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#200808] hover:bg-[#330c0c] border border-red-500/50 text-red-300 text-xs font-semibold shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:border-red-400 transition-all"
            title="Simulate next-hop lateral pivot across network mesh"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Lateral Pivot</span>
          </button>

          {/* Deploy Global Circuit Breakers */}
          <button
            onClick={() => setIsCircuitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-amber-500/40 text-xs text-amber-300 hover:text-white transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Circuit Breakers</span>
          </button>

          {/* Airgap All High-Risk Nodes */}
          <button
            onClick={() => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.compromiseStatus === 'COMPROMISED' || n.compromiseStatus === 'HIGH_RISK_EXPOSED'
                    ? { ...n, containmentStatus: 'AIRGAPPED', compromiseStatus: 'CONTAINED_SHIELDED' }
                    : n
                )
              );
              if (onSelectAction) onSelectAction('Zero-Trust Global Perimeter Airgap Executed');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Airgap Blast Zone</span>
          </button>

          {/* Export Impact Assessment */}
          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Certified Blast Impact Assessment Report')}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Export Blast Assessment Dossier"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Top Telemetry KPI Row (6 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Card 1: Ground Zero */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-red-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">Ground Zero Vector</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xs font-black text-white font-mono truncate">{blastRadiusMetricsData.groundZeroAsset}</span>
          </div>
          <span className="text-[8.5px] text-slate-500 font-mono block truncate">IP: {blastRadiusMetricsData.groundZeroIp}</span>
        </div>

        {/* Card 2: Blast Depth */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-orange-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-orange-400 uppercase tracking-wider">Blast Radius Reach</span>
            <Sun className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-orange-400 font-mono">{blastRadiusMetricsData.blastRadiusDepth}</span>
            <span className="text-[9px] font-medium text-slate-400">48 Nodes</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Cascading lateral scope</span>
        </div>

        {/* Card 3: High Value Assets */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">High-Value at Risk</span>
            <Database className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-red-400 font-mono">{blastRadiusMetricsData.highValueAssetsExposed}</span>
            <span className="text-[9px] font-medium text-red-300">Vaults & DBs</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Includes FIR & Banking schemas</span>
        </div>

        {/* Card 4: Lateral Pivots */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-purple-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Active Lateral Pivots</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-purple-300 font-mono">{blastRadiusMetricsData.lateralPivotVectors}</span>
            <span className="text-[9px] font-bold text-purple-400">Vectors</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">RDP, SQL, SMB, Kerberos</span>
        </div>

        {/* Card 5: Containment Rate */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-emerald-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">Perimeter Containment</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{blastRadiusMetricsData.containmentRate}</span>
            <span className="text-[9px] font-medium text-emerald-300">{blastRadiusMetricsData.quarantinedNodesCount} Airgapped</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Zero-Trust Circuit Active</span>
        </div>

        {/* Card 6: MTTC */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Mean Time to Contain</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{blastRadiusMetricsData.meanTimeToContain}</span>
            <span className="text-[9px] font-medium text-cyan-300">Fast</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Automated VLAN Kill-Switch</span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#111e33] pb-2 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('propagation-map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'propagation-map'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Radial Blast Propagation Map</span>
          </button>

          <button
            onClick={() => setActiveTab('kill-chain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kill-chain'
                ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lateral Kill-Chain Stream</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-950 text-orange-300 font-mono text-[9px] font-bold border border-orange-500/40">
              {killChainStepsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exposed-assets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'exposed-assets'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Exposed Critical Assets</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/40">
              {nodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('containment-suite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'containment-suite'
                ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Zero-Trust Circuit Breakers</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
              {circuitPolicies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recovery-planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'recovery-planner'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recovery Playbook</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
              {remediationTasks.length}
            </span>
          </button>
        </div>

        {/* Global Filter / Search Bar */}
        <div className="relative min-w-[200px] ml-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, IPs, subnets..."
            className="w-full bg-[#081224] border border-[#162744] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* ─── Main Tabbed Views ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: RADIAL BLAST PROPAGATION MAP                                       */}
        {/* ========================================================================= */}
        {activeTab === 'propagation-map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 8 cols: Radial Propagation Shockwave Graph */}
            <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
              <div className="rounded-xl bg-[#050b18] border border-[#111e33] flex flex-col relative overflow-hidden shadow-xl flex-1 min-h-[380px]">
                {/* Visualizer Toolbar */}
                <div className="px-3 py-2 border-b border-[#111e33] flex items-center justify-between bg-[#040813] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Shockwave Hops:
                    </span>
                    {(['ALL', '0', '1', '2', '3'] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => setHopFilter(h)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hopFilter === h ? 'bg-red-600 text-white' : 'bg-[#081224] text-slate-400 hover:text-white'
                        }`}
                      >
                        {h === 'ALL' ? 'All Hops (0-3)' : h === '0' ? 'Ground Zero' : `Hop ${h}`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Mesh: {filteredNodes.length} Nodes Plotted
                    </span>
                    <button
                      onClick={() => setMapZoom((z) => (z === 1 ? 1.15 : 1))}
                      className={`p-1 rounded transition-colors ${
                        mapZoom > 1 ? 'bg-red-600 text-white' : 'bg-[#081224] text-slate-400 hover:text-white'
                      }`}
                      title="Toggle Zoom"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Radial Canvas */}
                <div className="relative flex-1 bg-[#020612] flex items-center justify-center overflow-hidden">
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-30 pointer-events-none" />

                  {/* Concentric Radial Shockwave Rings */}
                  <div
                    className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center pointer-events-none transition-transform duration-300"
                    style={{ transform: `scale(${mapZoom})` }}
                  >
                    {/* Ring 3 - Outer Hop 3 */}
                    <div className="absolute inset-0 rounded-full border border-red-500/20" />
                    <span className="absolute top-2 text-[8px] font-mono text-red-500/50">HOP 3: PERIMETER MESH</span>

                    {/* Ring 2 - Mid Hop 2 */}
                    <div className="absolute inset-12 rounded-full border border-orange-500/30" />
                    <span className="absolute top-14 text-[8px] font-mono text-orange-500/60">HOP 2: CREDENTIAL REPLAY</span>

                    {/* Ring 1 - Inner Hop 1 */}
                    <div className="absolute inset-24 rounded-full border border-red-500/40" />
                    <span className="absolute top-26 text-[8px] font-mono text-red-500/70">HOP 1: DIRECT ACCESS</span>

                    {/* Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-red-500/10" />
                    <div className="absolute h-full w-[1px] bg-red-500/10" />

                    {/* Animated Pulsing Radial Shockwave */}
                    <div className="absolute inset-0 rounded-full bg-red-600/5 animate-ping opacity-25" />
                  </div>

                  {/* SVG Edges connecting nodes */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
                    style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
                  >
                    {blastEdgesData.map((edge) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      // Hop filter check
                      if (hopFilter !== 'ALL') {
                        const hNum = parseInt(hopFilter, 10);
                        if (fromNode.hopDistance !== hNum && toNode.hopDistance !== hNum) return null;
                      }

                      const midX = (fromNode.x + toNode.x) / 2;
                      const midY = (fromNode.y + toNode.y) / 2;

                      return (
                        <g key={edge.id}>
                          <line
                            x1={`${fromNode.x}%`}
                            y1={`${fromNode.y}%`}
                            x2={`${toNode.x}%`}
                            y2={`${toNode.y}%`}
                            stroke={edge.isCompromisedPivot ? '#ef4444' : '#10b981'}
                            strokeWidth={edge.isCompromisedPivot ? '2' : '1.2'}
                            strokeDasharray={edge.isCompromisedPivot ? '4 3' : '2 2'}
                            strokeOpacity={edge.isCompromisedPivot ? '0.85' : '0.4'}
                          />
                          <text
                            x={`${midX}%`}
                            y={`${midY}%`}
                            fill={edge.isCompromisedPivot ? '#fca5a5' : '#6ee7b7'}
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            dy="-3"
                            className="select-none font-mono"
                          >
                            {edge.protocol}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Plotted Blast Nodes on Radial Graph */}
                  <div
                    className="absolute inset-0 pointer-events-auto transition-transform duration-300"
                    style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
                  >
                    {filteredNodes.map((node) => {
                      const isSelected = node.id === selectedNodeId;
                      const isGZ = node.compromiseStatus === 'GROUND_ZERO';
                      const isCompromised = node.compromiseStatus === 'COMPROMISED';
                      const isShielded = node.compromiseStatus === 'CONTAINED_SHIELDED';

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          className={`absolute cursor-pointer flex flex-col items-center group z-20 transition-all ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                          }`}
                        >
                          {/* Pulsing Ring for Ground Zero or Compromised */}
                          {(isGZ || isCompromised) && (
                            <span className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping pointer-events-none" />
                          )}

                          {/* Node Icon Box */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-lg transition-all ${
                              isGZ
                                ? 'bg-red-600 border-white text-white shadow-[0_0_18px_#ef4444]'
                                : isCompromised
                                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_12px_#ef4444]'
                                : isShielded
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_10px_#10b981]'
                                : 'bg-[#081224] border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                          >
                            {renderNodeTypeIcon(node.type, 'w-3.5 h-3.5')}
                          </div>

                          {/* Label Pill */}
                          <div className="mt-1 px-1.5 py-0.5 rounded bg-[#050b18]/95 border border-[#162744] text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-md pointer-events-none group-hover:border-red-400">
                            {node.name}
                            <span className="ml-1 text-red-400 font-mono">(R:{node.riskScore})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Legend */}
                <div className="px-3 py-2 border-t border-[#111e33] bg-[#040813] flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_6px_#ef4444] animate-ping" />
                      <span>Ground Zero</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                      <span>Compromised</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      <span>Exposed High-Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      <span>Airgapped / Shielded</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-500">Propagation Physics: Dijkstra Lateral Mesh</span>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Asset Risk Inspector & Fast Containment */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              {/* Card 1: Selected Node Telemetry */}
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    {renderNodeTypeIcon(selectedNode.type, 'w-4 h-4')}
                    ASSET RISK INSPECTOR
                  </span>
                  {renderStatusBadge(selectedNode.compromiseStatus)}
                </div>

                <div className="mt-2.5">
                  <h3 className="text-sm font-bold text-slate-100 font-mono break-all">{selectedNode.name}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedNode.categoryLabel}</span>
                </div>

                {/* Risk Score Meter */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMPROMISE RISK SCORE</span>
                    <span className="font-mono font-bold text-red-400">{selectedNode.riskScore} / 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0a1220] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full"
                      style={{ width: `${selectedNode.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Metadata list */}
                <div className="mt-3 space-y-2 text-xs border-t border-[#111e33]/80 pt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IP Address / Host</span>
                    <span className="font-mono text-slate-200">{selectedNode.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subnet Segment</span>
                    <span className="font-mono text-slate-300 truncate max-w-[160px]" title={selectedNode.subnet}>
                      {selectedNode.subnet}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Shockwave Distance</span>
                    <span className="font-mono font-bold text-orange-400">
                      {selectedNode.hopDistance === 0 ? 'Hop 0 (Ground Zero)' : `Hop ${selectedNode.hopDistance}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Owner / Custodian</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{selectedNode.ownerOrService}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department Unit</span>
                    <span className="text-slate-300">{selectedNode.department}</span>
                  </div>
                  {selectedNode.dataVolumeExposed && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Exposed Data Cache</span>
                      <span className="font-mono text-amber-300">{selectedNode.dataVolumeExposed}</span>
                    </div>
                  )}
                </div>

                {/* Vulnerability Vector */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Lateral Pivot Vector / Flaw:
                  </span>
                  <p className="text-[10.5px] font-mono text-slate-300 leading-relaxed bg-[#02040a] p-1.5 rounded border border-slate-900">
                    {selectedNode.vulnerabilityVector}
                  </p>
                </div>

                {/* Linked Cases */}
                <div className="mt-2.5">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Exposed Case Dossiers ({selectedNode.linkedCases.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.linkedCases.map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-[#091325] border border-[#162744] text-[9.5px] font-mono text-cyan-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#111e33] flex items-center gap-2">
                  <button
                    onClick={() => handleToggleIsolation(selectedNode.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {selectedNode.containmentStatus === 'AIRGAPPED' ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>Restore Mesh Link</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>Airgap Node Now</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedNodeModal(selectedNode)}
                    className="py-1.5 px-2.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-medium text-slate-200 transition-colors flex items-center justify-center gap-1"
                    title="Deep Forensics"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LATERAL KILL-CHAIN STREAM                                          */}
        {/* ========================================================================= */}
        {activeTab === 'kill-chain' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-[#070c18] to-orange-950/40 border border-red-500/30 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  LATERAL MOVEMENT INTRUSION KILL-CHAIN (MITRE ATT&CK ATTRIBUTION)
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Reconstruction of the adversary's lateral hops across CrimeSync infrastructure, with real-time kill-switches.
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
              {killChainStepsData.map((step) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-red-500/50 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500 text-red-400 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                      {step.stepNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[10px]">{step.timestamp}</span>
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        {renderSeverityBadge(step.severity)}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[10.5px]">
                        <span className="font-mono text-red-300 font-semibold">{step.sourceNode}</span>
                        <span className="text-slate-500">───▶</span>
                        <span className="font-mono text-orange-300 font-semibold">{step.targetNode}</span>
                      </div>

                      <p className="text-[10.5px] text-slate-300 mt-1">{step.vector}</p>

                      <div className="mt-1.5 flex items-center gap-3 text-[9.5px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.2 bg-[#030610] rounded border border-slate-800 text-cyan-300">
                          {step.mitreAttackId}
                        </span>
                        <span>{step.technique}</span>
                      </div>
                    </div>
                  </div>

                  {/* Containment Directive on Hop */}
                  <div className="text-right flex flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-[#111e33] pt-2 md:pt-0 md:pl-3 min-w-[220px]">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CONTAINMENT STATUS</span>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded font-mono ${
                          step.status === 'BLOCKED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : step.status === 'CONTAINED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                            : 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-400 font-mono text-left md:text-right">{step.containmentAction}</p>

                    <button
                      onClick={() => {
                        if (onSelectAction) onSelectAction(`Severing Lateral Hop: ${step.sourceNode} to ${step.targetNode}`);
                      }}
                      className="px-2.5 py-1 rounded bg-[#081224] hover:bg-red-600 border border-red-500/50 text-red-300 hover:text-white text-[10.5px] font-bold transition-all"
                    >
                      Sever Lateral Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXPOSED CRITICAL ASSETS MATRIX                                     */}
        {/* ========================================================================= */}
        {activeTab === 'exposed-assets' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                BLAST ZONE ASSET MANIFEST ({filteredNodes.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sorted by Vulnerability Score</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-red-500/40 transition-all flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <div className="flex items-center gap-2">
                        {renderNodeTypeIcon(node.type, 'w-4 h-4')}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {node.categoryLabel}
                        </span>
                      </div>
                      {renderStatusBadge(node.compromiseStatus)}
                    </div>

                    {/* Title */}
                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-slate-100 font-mono break-all group-hover:text-red-400 transition-colors">
                        {node.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.ip}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-2.5 p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10.5px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Hop Distance:</span>
                        <span className="font-bold text-orange-400 font-mono">
                          {node.hopDistance === 0 ? 'Ground Zero' : `Hop ${node.hopDistance}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Risk Score:</span>
                        <span className="font-mono font-bold text-red-400">{node.riskScore} / 100</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Subnet:</span>
                        <span className="font-mono text-slate-300 truncate max-w-[150px]">{node.subnet}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Exposed Data:</span>
                        <span className="font-mono text-amber-300">{node.dataVolumeExposed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleToggleIsolation(node.id)}
                      className={`text-[10.5px] font-bold flex items-center gap-1 ${
                        node.containmentStatus === 'AIRGAPPED'
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-red-400 hover:text-red-300'
                      }`}
                    >
                      {node.containmentStatus === 'AIRGAPPED' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{node.containmentStatus === 'AIRGAPPED' ? 'Airgapped (Active)' : 'Airgap Node'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setActiveTab('propagation-map');
                      }}
                      className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <span>Locate on Map</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ZERO-TRUST CIRCUIT BREAKERS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'containment-suite' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 7 cols: Circuit Breakers List */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#070c18] to-red-950/40 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AUTOMATED ZERO-TRUST PERIMETER CIRCUIT BREAKERS
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Hardware-level network isolation rules, VLAN blackholing, and automated credential revocation tripwires.
                </p>
              </div>

              {circuitPolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{pol.name}</h4>
                        <span
                          className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold ${
                            pol.status === 'TRIGGERED'
                              ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {pol.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{pol.targetSubnetOrAsset}</span>
                    </div>

                    <button
                      onClick={() => handleTogglePolicy(pol.id)}
                      className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                        pol.status === 'TRIGGERED'
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300'
                      }`}
                    >
                      {pol.status === 'TRIGGERED' ? 'Disengage Circuit' : 'Trip Circuit Now'}
                    </button>
                  </div>

                  <div className="p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10.5px]">
                    <div className="text-slate-300">
                      <span className="text-amber-400 font-bold">Trigger Rule:</span> {pol.triggerCondition}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-cyan-400 font-bold">Action Taken:</span> {pol.actionTaken}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      <span className="font-bold">Protocol:</span> {pol.isolationProtocol}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 cols: Global Containment Matrix */}
            <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#111e33]">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    FIREWALL ACL & SWITCH DIRECTIVES
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-[#02050e] border border-[#14233c] text-emerald-400">
                    <p className="text-slate-400 mb-1"># Instant Hardware VLAN Drop</p>
                    <code>cisco-core(config)# vlan 440</code>
                    <br />
                    <code>cisco-core(config-vlan)# state suspend</code>
                    <br />
                    <code>cisco-core(config-vlan)# exit</code>
                  </div>

                  <div className="p-2 rounded bg-[#02050e] border border-[#14233c] text-amber-300">
                    <p className="text-slate-400 mb-1"># Active Directory Token Revocation</p>
                    <code>Revoke-ADSessionToken -Identity &apos;ACP-23&apos; -Force</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REMEDIATION & RECOVERY PLAYBOOK                                    */}
        {/* ========================================================================= */}
        {activeTab === 'recovery-planner' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#070c18] to-cyan-950/40 border border-emerald-500/30 mb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    POST-BREACH DISASTER RECOVERY & EVIDENCE INTEGRITY PLAYBOOK
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Ordered remediation procedures, cryptographic evidence re-verification, and court affidavit synthesis.
                </p>
              </div>

              <button
                onClick={() => onSelectAction && onSelectAction('Executing Automated Remediation Batch Playbook')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Batch Remediation</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
              {remediationTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    task.status === 'COMPLETED'
                      ? 'bg-[#040c14] border-emerald-500/40 text-slate-300'
                      : 'bg-[#050b18] border-[#111e33] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-[#081224] border-[#162744] text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">Step {task.stepNumber}.</span>
                        <h4
                          className={`text-xs font-bold ${
                            task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-[10px]">
                        <span className="px-1.5 py-0.2 bg-[#091325] rounded text-cyan-400 font-mono">
                          {task.category}
                        </span>
                        <span className="text-slate-400">Assigned: {task.assignedTo}</span>
                        <span className="text-slate-500 font-mono">Est: {task.estimatedTime}</span>
                      </div>

                      {task.automatedScript && (
                        <p className="mt-1 text-[9.5px] font-mono text-slate-500">
                          Command: <span className="text-slate-400">{task.automatedScript}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: DEPLOY CIRCUIT BREAKER ──────────────────────────────────────── */}
      {isCircuitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl bg-[#070e1c] border border-red-500/40 p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    DEPLOY GLOBAL CIRCUIT BREAKER ISOLATION
                  </h3>
                  <span className="text-[10px] text-slate-400">Instant hardware airgap & VLAN isolation</span>
                </div>
              </div>
              <button
                onClick={() => setIsCircuitModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs overflow-y-auto">
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Deploying the global circuit breaker will instantly sever all external routing bridges between Subnet
                <span className="font-mono text-red-400"> 10.240.4.0/24</span> and the core backbone. Active connections to the Evidence Vault will be sealed with cryptographic signatures.
              </p>

              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 space-y-1 text-[10.5px]">
                <span className="font-bold text-red-400 block uppercase tracking-wider text-[9px]">Affected Perimeter:</span>
                <p className="text-slate-300 font-mono">14 Connected Terminals & 2 Internal DB Replicas</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCircuitModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCircuitPolicies((prev) => prev.map((p) => ({ ...p, status: 'TRIGGERED' })));
                  setIsCircuitModalOpen(false);
                  if (onSelectAction) onSelectAction('Global Circuit Breaker Activated: All High-Risk Subnets Airgapped');
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
              >
                Confirm Full Isolation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: NODE FORENSICS INSPECTOR ────────────────────────────────────── */}
      {selectedNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-xl bg-[#060c18] border border-cyan-500/50 p-4 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                {renderNodeTypeIcon(selectedNodeModal.type, 'w-5 h-5')}
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono">{selectedNodeModal.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedNodeModal.ip}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeModal(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 text-xs overflow-y-auto text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-slate-400">Compromise State:</span>
                {renderStatusBadge(selectedNodeModal.compromiseStatus)}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-slate-400">Risk Score:</span>
                <span className="font-mono font-bold text-red-400">{selectedNodeModal.riskScore} / 100</span>
              </div>
              <div className="p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Vulnerability Vector:</span>
                <p className="font-mono text-slate-200">{selectedNodeModal.vulnerabilityVector}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedNodeModal(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close Forensics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlastRadiusPage;
