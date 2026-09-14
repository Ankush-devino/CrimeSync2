import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Radio, FileText, 
  RotateCcw, Play, CheckCircle2, Lock, UserX, Database, BadgeAlert, MapPin,
  X, Sparkles, Cpu, AlertTriangle, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCaseContext } from '../context/CaseContext';
import type { LawCase } from '../constants/cases';

export type NodeType = 'hacker' | 'case' | 'officer' | 'info';
export type NodeStatus = 'active' | 'contained';

export interface CrimeNode {
  id: string;
  name: string;
  role: string;
  type: NodeType;
  status: NodeStatus;
  riskScore: number;
  hop: number;
  details: {
    identifier?: string;
    location?: string;
    exposureValue?: string;
  };
}

export interface CrimeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  hop?: number;
}

// Fallback baseline breach graph
const BREACH_NODES: CrimeNode[] = [
  { id: 'n0', name: 'Karthik Ramanathan', role: 'APT Exploit Developer', type: 'hacker', status: 'active', riskScore: 99, hop: 0, details: { identifier: 'IP: 192.168.1.45', location: 'Chennai Darknet' } },
  { id: 'n1', name: 'Operation Chakra Dossier', role: 'Stolen Case File', type: 'case', status: 'active', riskScore: 92, hop: 1, details: { identifier: 'FIR/DEL/2026/1428', exposureValue: 'Classified Informants' } },
  { id: 'n2', name: 'Operation Rudra DB', role: 'Stolen Case File', type: 'case', status: 'active', riskScore: 88, hop: 1, details: { identifier: 'FIR/CHE/2026/0204', exposureValue: 'Grid Schematics' } },
  { id: 'n3', name: 'ACP Rajeshwar Sharma', role: 'Lead Investigator', type: 'officer', status: 'active', riskScore: 95, hop: 2, details: { identifier: 'Badge #DEL-IPS-8821', location: 'Delhi HQ' } },
  { id: 'n4', name: 'Inspector Vikram', role: 'Field Officer', type: 'officer', status: 'active', riskScore: 85, hop: 2, details: { identifier: 'Badge #DEL-CID-441', location: 'Mumbai Branch' } },
  { id: 'n5', name: 'DCP Ananya Rao', role: 'Supervising Officer', type: 'officer', status: 'active', riskScore: 90, hop: 2, details: { identifier: 'Badge #CHE-IPS-102', location: 'Chennai HQ' } },
  { id: 'n6', name: 'Sharma Family Residence', role: 'Doxxed Address', type: 'info', status: 'active', riskScore: 100, hop: 3, details: { identifier: 'Vasant Vihar, Delhi', exposureValue: 'Physical Threat' } },
  { id: 'n7', name: 'WS-412 Terminal Credentials', role: 'Exposed Login', type: 'info', status: 'active', riskScore: 98, hop: 3, details: { identifier: 'Hash: 0x8F9A...', exposureValue: 'System Access' } },
  { id: 'n8', name: 'Undercover Alias Docs', role: 'Compromised Identity', type: 'info', status: 'active', riskScore: 100, hop: 3, details: { identifier: 'Alias: "Raju Bhai"', exposureValue: 'Cover Blown' } }
];

const BREACH_EDGES: CrimeEdge[] = [
  { id: 'e1', source: 'n0', target: 'n1', label: 'DB Exfiltration', weight: 3, hop: 1 },
  { id: 'e2', source: 'n0', target: 'n2', label: 'Zero-Day Exploit', weight: 3, hop: 1 },
  { id: 'e3', source: 'n1', target: 'n3', label: 'Assigned Lead', weight: 2, hop: 2 },
  { id: 'e4', source: 'n1', target: 'n4', label: 'Assigned Field Agent', weight: 2, hop: 2 },
  { id: 'e5', source: 'n2', target: 'n5', label: 'Assigned Supervisor', weight: 2, hop: 2 },
  { id: 'e6', source: 'n3', target: 'n6', label: 'Records Scraped', weight: 3, hop: 3 },
  { id: 'e7', source: 'n4', target: 'n7', label: 'Keylogger Installed', weight: 3, hop: 3 },
  { id: 'e8', source: 'n5', target: 'n8', label: 'File Decrypted', weight: 3, hop: 3 }
];

// Helper to construct breach nodes dynamically based on active case
function buildCaseBreachDataset(activeCase?: LawCase | null): { nodes: CrimeNode[]; edges: CrimeEdge[] } {
  if (!activeCase) {
    return { nodes: BREACH_NODES, edges: BREACH_EDGES };
  }

  const hackerName = activeCase.lead_suspect || 'Karthik Ramanathan';
  const hackerRole = activeCase.lead_suspect_role || 'APT Exploit Developer';
  const caseTitle = activeCase.title || 'Operation Chakra Dossier';
  const firNum = activeCase.fir_number || 'FIR/DEL/2026/1428';
  const investigatorName = activeCase.lead_investigator_name || 'ACP Rajeshwar Sharma';
  const badge = activeCase.badge_number ? `Badge #${activeCase.badge_number}` : 'Badge #DEL-IPS-8821';
  const locationCity = activeCase.jurisdiction_city || 'Delhi HQ';
  const ipSuffix = Math.abs(activeCase.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 250 + 1;

  const caseNodes: CrimeNode[] = [
    {
      id: 'n0',
      name: hackerName,
      role: hackerRole,
      type: 'hacker',
      status: 'active',
      riskScore: activeCase.priority === 'CRITICAL' ? 99 : 91,
      hop: 0,
      details: {
        identifier: `IP: 192.168.${ipSuffix}.45`,
        location: `${locationCity} Darknet Gateway`
      }
    },
    {
      id: 'n1',
      name: `${caseTitle.slice(0, 24)} Dossier`,
      role: 'Stolen Case File',
      type: 'case',
      status: 'active',
      riskScore: 92,
      hop: 1,
      details: {
        identifier: firNum,
        exposureValue: 'Classified Informants & Vault'
      }
    },
    {
      id: 'n2',
      name: `${activeCase.department?.slice(0, 18) || 'Special Cell'} DB`,
      role: 'Stolen Database Segment',
      type: 'case',
      status: 'active',
      riskScore: 88,
      hop: 1,
      details: {
        identifier: `SEC-${activeCase.id.slice(-4)}`,
        exposureValue: 'Grid Schematics & Intercepts'
      }
    },
    {
      id: 'n3',
      name: investigatorName,
      role: 'Lead Case Investigator',
      type: 'officer',
      status: 'active',
      riskScore: 95,
      hop: 2,
      details: {
        identifier: badge,
        location: `${locationCity} Command HQ`
      }
    },
    {
      id: 'n4',
      name: 'Inspector Vikram',
      role: 'Field Officer',
      type: 'officer',
      status: 'active',
      riskScore: 85,
      hop: 2,
      details: {
        identifier: 'Badge #DEL-CID-441',
        location: 'Zonal Field Unit'
      }
    },
    {
      id: 'n5',
      name: 'DCP Ananya Rao',
      role: 'Supervising Officer',
      type: 'officer',
      status: 'active',
      riskScore: 90,
      hop: 2,
      details: {
        identifier: 'Badge #CHE-IPS-102',
        location: `${locationCity} Branch`
      }
    },
    {
      id: 'n6',
      name: `${investigatorName.split(' ')[1] || 'Officer'} Family Residence`,
      role: 'Doxxed Address',
      type: 'info',
      status: 'active',
      riskScore: 100,
      hop: 3,
      details: {
        identifier: `${locationCity} Zonal Sector`,
        exposureValue: 'Physical Threat & Surveillance'
      }
    },
    {
      id: 'n7',
      name: `WS-${badge.replace(/\D/g, '') || '412'} Terminal Credentials`,
      role: 'Exposed Login',
      type: 'info',
      status: 'active',
      riskScore: 98,
      hop: 3,
      details: {
        identifier: 'Hash: 0x8F9A...SECURE',
        exposureValue: 'Police Terminal Access'
      }
    },
    {
      id: 'n8',
      name: 'Undercover Alias Dossier',
      role: 'Compromised Identity',
      type: 'info',
      status: 'active',
      riskScore: 100,
      hop: 3,
      details: {
        identifier: 'Alias: "Raju Bhai / Covert 9"',
        exposureValue: 'Undercover Identity Exposed'
      }
    }
  ];

  return { nodes: caseNodes, edges: BREACH_EDGES };
}

export interface BlastRadiusSimulatorProps {
  onSelectAction?: (action: string) => void;
}

interface PendingPlaybookAction {
  type: 'restore' | 'lockdown' | 'dispatch';
  nodeId: string;
  nodeName: string;
  title: string;
  description: string;
}

export const BlastRadiusSimulator: React.FC<BlastRadiusSimulatorProps> = ({ onSelectAction }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();

  const [nodes, setNodes] = useState<CrimeNode[]>(() => buildCaseBreachDataset(selectedCase).nodes);
  const [edges] = useState<CrimeEdge[]>(BREACH_EDGES);
  const [selectedHop, setSelectedHop] = useState<number | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('n0');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Simulation State Machine & Typed Timer Ref
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentSimStep, setCurrentSimStep] = useState<number>(3); // 0 = Epicenter, 1 = Case Files, 2 = Officers, 3 = Info/Doxxed
  const simulationTimerRef = useRef<any>(null);

  // Security Playbook Action Confirmation Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingPlaybookAction | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);

  // Timer Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, []);

  // Re-synchronize dataset and reset simulation when selectedCase changes
  useEffect(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    const dataset = buildCaseBreachDataset(selectedCase);
    setNodes(dataset.nodes);
    setSelectedNodeId('n0');
    setSelectedHop('all');
    setIsSimulating(false);
    setCurrentSimStep(3);
    setIsActionModalOpen(false);
    setPendingAction(null);
    setIsProcessingAction(false);
    setActionSuccess(false);
  }, [selectedCase, selectedCaseId]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || nodes[0], [nodes, selectedNodeId]);

  // Compute Disruption Rate
  const disruptionRate = useMemo(() => {
    const totalWeights = edges.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeights === 0) return 0;
    const containedIds = new Set(nodes.filter(n => n.status === 'contained').map(n => n.id));
    const severedWeight = edges
      .filter(e => containedIds.has(e.source) || containedIds.has(e.target))
      .reduce((sum, e) => sum + e.weight, 0);
    return Math.round((severedWeight / totalWeights) * 100);
  }, [nodes, edges]);

  // Polar Coordinate Math for Radar View (SVG 800x800)
  const CX = 400;
  const CY = 400;
  const HOP_RADII = [0, 120, 230, 340];
  const HOP_LABELS = ['The Hacker', 'Stolen Case Files', 'Assigned Inspectors', 'Exposed Officer Info'];
  const HOP_DESCRIPTIONS = [
    'Stage 0: Patient Zero Darknet Ingress (Epicenter)',
    'Stage 1: Exfiltration of Case Dossiers & Police DBs',
    'Stage 2: Lateral Compromise of Investigating Officers',
    'Stage 3: Doxxing Officer Residences & Decrypting Secrets'
  ];
  const COLOR_MAP = ['#ef4444', '#f59e0b', '#06b6d4', '#a855f7'];

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    [0, 1, 2, 3].forEach(hop => {
      const hopNodes = nodes.filter(n => n.hop === hop);
      const total = hopNodes.length;
      hopNodes.forEach((node, idx) => {
        if (hop === 0) {
          positions[node.id] = { x: CX, y: CY };
        } else {
          const angle = (2 * Math.PI * idx) / (total || 1) - Math.PI / 2 + (hop * 0.4);
          positions[node.id] = {
            x: CX + HOP_RADII[hop] * Math.cos(angle),
            y: CY + HOP_RADII[hop] * Math.sin(angle)
          };
        }
      });
    });
    return positions;
  }, [nodes]);

  // INSTANT SEQUENTIAL STEP-BY-STEP SIMULATION ENGINE (Zero confirmation dialogs/modals)
  const runSimulation = () => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    setIsSimulating(true);
    setCurrentSimStep(0); // Reset to Epicenter only
    setSelectedHop('all'); // Expand view to capture full propagation trail
    
    let step = 0;
    simulationTimerRef.current = setInterval(() => {
      step += 1;
      setCurrentSimStep(step);
      
      if (step >= 3) {
        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current);
          simulationTimerRef.current = null;
        }
        setIsSimulating(false);
      }
    }, 800); // Ticks every 800ms to reveal each hop sequentially
  };

  // Visibility logic (handles both the filter tabs and the running simulation)
  const isVisible = (hop: number) => {
    const passesFilter = selectedHop === 'all' || selectedHop === hop;
    return passesFilter;
  };

  // Modal Dismissal Handler: strictly closes the modal with NO state or containment alterations
  const handleDismissModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsActionModalOpen(false);
    setPendingAction(null);
    setIsProcessingAction(false);
    setActionSuccess(false);
  };

  // Modal Execution Handler: ONLY triggered by clicking 'Execute Now'
  const handleExecuteModalAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pendingAction) return;

    setIsProcessingAction(true);

    setTimeout(() => {
      const targetId = pendingAction.nodeId;
      const newStatus: NodeStatus = pendingAction.type === 'restore' ? 'active' : 'contained';

      setNodes(prev => prev.map(n => n.id === targetId ? { ...n, status: newStatus } : n));
      setIsProcessingAction(false);
      setActionSuccess(true);

      if (onSelectAction) {
        onSelectAction(
          pendingAction.type === 'restore'
            ? `Restored Access: ${pendingAction.nodeName}`
            : pendingAction.type === 'lockdown'
            ? `Secured / Revoked Access: ${pendingAction.nodeName}`
            : `Dispatched Incident Response Team to ${pendingAction.nodeName}`
        );
      }

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#10b981', '#06b6d4'],
      });
    }, 1000);
  };

  // Prompt the confirmation modal for playbook action (does not execute yet)
  const handlePromptAction = (
    e: React.MouseEvent<HTMLButtonElement>,
    type: 'restore' | 'lockdown' | 'dispatch'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const title =
      type === 'restore'
        ? `Restore Access: ${selectedNode.name}`
        : type === 'lockdown'
        ? `Lock Down / Revoke Credentials: ${selectedNode.name}`
        : `Dispatch Incident Response Team: ${selectedNode.name}`;

    const description =
      type === 'restore'
        ? `Re-enabling digital certificates, network sessions, and platform access authorization for ${selectedNode.name}.`
        : type === 'lockdown'
        ? `Quarantining node and revoking all digital credentials, session tokens, and access routes for ${selectedNode.name}.`
        : `Mobilizing rapid tactical response cyber forensics unit to secure and isolate ${selectedNode.name}.`;

    setPendingAction({
      type,
      nodeId: selectedNode.id,
      nodeName: selectedNode.name,
      title,
      description,
    });
    setIsProcessingAction(false);
    setActionSuccess(false);
    setIsActionModalOpen(true);
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#060a12] text-slate-200 overflow-y-auto custom-scrollbar p-6 space-y-6 select-none">
      
      {/* Top Header - Clean and Uncrowded */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800 rounded flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Contagion Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {selectedCase ? `Active Scope: ${selectedCase.fir_number}` : 'Internal Threat & Breach Traversal'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide mt-1">Data Breach Impact Zone</h1>
        </div>

        {/* Live Simulation Status Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-400 shadow-inner">
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
          <span className="font-mono text-slate-300">
            {isSimulating ? `Active Propagation: Hop ${currentSimStep}/3` : 'Realtime Topology Synced'}
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Breach Epicenter</div>
            <div className="text-base font-bold text-white mt-1">{nodes[0]?.name || 'Primary Suspect'}</div>
            <div className="text-xs text-red-400 font-mono mt-0.5">{nodes[0]?.role} (Risk: {nodes[0]?.riskScore}/100)</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-400"/>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data at Risk</div>
            <div className="text-base font-bold text-amber-400 mt-1">{nodes.length - 1} Exposed Files & Officers</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">Includes Residential & Credential Data</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400"/>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Breach Containment</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{disruptionRate}%</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {nodes.filter(n => n.status === 'contained').length} of {nodes.length} Nodes Secured
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-400"/>
          </div>
        </div>
      </div>

      {/* Main Workspace: Radar Canvas (Left) + Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Interactive SVG Radial Radar Canvas with Absolute Overlay Controls */}
        <div className="lg:col-span-8 bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-inner min-h-[580px]">
          
          {/* Canvas Top Bar: Mesh Indicator */}
          <div className="flex items-center justify-between mb-2 z-10 pr-96">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse"/>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Data Exfiltration Mesh {selectedCase ? `(${selectedCase.fir_number})` : ''}
              </span>
            </div>
          </div>

          {/* ABSOLUTE OVERLAY CONTROLS - Positioned directly over the top-right of the graph canvas */}
          <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2.5 bg-[#070c18]/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Hop Filter Buttons Group */}
            <div className="flex items-center bg-[#050811] border border-slate-800 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (simulationTimerRef.current) {
                    clearInterval(simulationTimerRef.current);
                    simulationTimerRef.current = null;
                  }
                  setIsSimulating(false);
                  setSelectedHop('all');
                  setCurrentSimStep(3);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  selectedHop === 'all' && currentSimStep === 3
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                All Hops
              </button>
              {[0, 1, 2, 3].map(hop => (
                <button
                  key={hop}
                  type="button"
                  onClick={() => {
                    if (simulationTimerRef.current) {
                      clearInterval(simulationTimerRef.current);
                      simulationTimerRef.current = null;
                    }
                    setIsSimulating(false);
                    setSelectedHop(hop);
                    setCurrentSimStep(hop);
                  }}
                  className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    currentSimStep === hop && selectedHop !== 'all'
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Hop {hop}
                </button>
              ))}
            </div>

            {/* Run Simulation Button - Instant Execution */}
            <button
              type="button"
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white rounded-lg text-xs font-bold tracking-wider shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all disabled:opacity-60 cursor-pointer ${
                isSimulating ? 'ring-2 ring-red-400/60 shadow-[0_0_24px_rgba(239,68,68,0.7)]' : ''
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin text-red-200' : ''}`} />
              <span>{isSimulating ? `Breach Hop ${currentSimStep}/3...` : 'Run Simulation'}</span>
            </button>
          </div>

          {/* Bottom Overlay: Dynamic Legend & Live Stage Description */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 bg-[#070c18]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 pointer-events-auto shadow-lg">
              {HOP_LABELS.map((label, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLOR_MAP[idx] }} />
                  <span className="font-mono text-[10px] text-slate-400">Hop {idx}:</span>
                  <span className="font-medium text-slate-200">{label}</span>
                </span>
              ))}
            </div>

            {isSimulating && (
              <div className="flex items-center gap-2 text-xs text-red-400 font-mono bg-red-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-red-800/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{HOP_DESCRIPTIONS[Math.min(currentSimStep, 3)]}</span>
              </div>
            )}
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
            <svg viewBox="0 0 800 800" className="w-full h-full max-h-[560px] object-contain select-none">
              <defs>
                <radialGradient id="epicenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(220, 38, 38, 0.3)" />
                  <stop offset="30%" stopColor="rgba(220, 38, 38, 0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Dedicated Center Glow */}
              <circle cx={CX} cy={CY} r="400" fill="url(#epicenterGlow)" pointerEvents="none" />

              {/* Background Rings with progressive breach illumination */}
              {HOP_RADII.map((r, i) => {
                if (r === 0) return null;
                const isRingReached = i <= currentSimStep;
                return (
                  <circle
                    key={r}
                    cx={CX}
                    cy={CY}
                    r={r}
                    fill="none"
                    stroke={isRingReached ? '#dc2626' : '#334155'}
                    strokeWidth={isRingReached ? '1.5' : '1'}
                    strokeOpacity={isRingReached ? 0.6 : 0.25}
                    strokeDasharray={i > 1 ? "6 6" : "none"}
                    className="transition-all duration-700 ease-out pointer-events-none"
                  />
                );
              })}

              {/* 1. RENDER EDGES FIRST (Z-Index Bottom) WITH FRAMER-MOTION SEQUENTIAL PATH-DRAWING */}
              {edges.map(edge => {
                if (!edge) return null;
                const s = nodePositions[edge.source];
                const t = nodePositions[edge.target];
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!s || !t || !sourceNode || !targetNode) return null;

                const isSevered = sourceNode.status === 'contained' || targetNode.status === 'contained';
                const edgeHop = edge.hop ?? targetNode.hop;
                const isEdgeDrawn = edgeHop <= currentSimStep;

                return (
                  <g key={edge.id}>
                    {/* Animated Edge Line that sequentially draws its pathLength from 0 to 1 */}
                    <motion.line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isSevered ? '#475569' : '#dc2626'}
                      strokeWidth={isSevered ? 1.5 : (isEdgeDrawn ? 2.5 : 1.5)}
                      strokeDasharray={isSevered ? "4 4" : "none"}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: edgeHop <= currentSimStep ? 1 : 0,
                        opacity: edgeHop <= currentSimStep ? (isSevered ? 0.35 : 0.6) : 0,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                      pointerEvents="none"
                    />

                    {/* Step-by-Step Animated Pulse Particle Traveling Across Active Breached Path */}
                    {isEdgeDrawn && !isSevered && (
                      <circle r="3" fill="#ef4444" opacity="0.9" pointerEvents="none">
                        <animateMotion
                          path={`M ${s.x} ${s.y} L ${t.x} ${t.y}`}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* 2. RENDER NODES SECOND (Z-Index Top) - STATIC AND ALWAYS FULLY VISIBLE */}
              {nodes.map(node => {
                if (!node) return null;
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const isContained = node.status === 'contained';
                const nodeColor = isContained ? '#64748b' : COLOR_MAP[node.hop] || '#ef4444';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                  >
                    {/* TIER 1: STATIC HITBOX */}
                    <circle
                      cx={0}
                      cy={0}
                      r={node.hop === 0 ? 36 : 28}
                      fill="transparent"
                      pointerEvents="all"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId((curr) => (curr === node.id ? null : curr))}
                      onClick={(e: React.MouseEvent<SVGCircleElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                    />

                    {/* TIER 2: VISUAL GROUP */}
                    <g
                      className="pointer-events-none"
                      style={{
                        filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))' : 'none',
                        transition: 'filter 150ms ease, opacity 140ms ease',
                      }}
                    >
                      {(node.hop === 0 || isSelected) && !isContained && (
                        <circle
                          cx={0}
                          cy={0}
                          r={node.hop === 0 ? 28 : 22}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={0}
                        cy={0}
                        r={node.hop === 0 ? 22 : 16}
                        fill="#0b1120"
                        stroke={nodeColor}
                        strokeWidth={isSelected || isHovered ? 3 : 2}
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={node.hop === 0 ? 10 : 7}
                        fill={isContained ? '#475569' : nodeColor}
                      />
                    </g>

                    {/* TIER 3: STATIC LABEL */}
                    <text
                      x={0}
                      y={node.hop === 0 ? 36 : 28}
                      textAnchor="middle"
                      pointerEvents="none"
                      className={`text-[11px] font-medium select-none ${
                        isContained
                          ? 'fill-slate-500'
                          : isSelected
                          ? 'fill-white font-bold'
                          : isHovered
                          ? 'fill-white font-semibold'
                          : 'fill-slate-300'
                      }`}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Drawer: Asset Inspector & Police Playbook */}
        <div className="lg:col-span-4 bg-[#0c1322] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-400"/>
                <span className="text-xs font-bold uppercase tracking-wider text-white">Exposure Inspector</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                selectedNode.status === 'contained' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-red-950 text-red-400 border-red-800'
              }`}>
                {selectedNode.status === 'contained' ? 'Secured / Isolated' : 'Active Breach'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.name}</h3>
                <p className="text-xs text-red-400 font-medium">{selectedNode.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#070b14] border border-slate-800/80 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Hop Tier</span>
                  <p className="font-semibold text-white">Hop {selectedNode.hop}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Compromise Risk</span>
                  <p className="font-bold text-red-400">{selectedNode.riskScore} / 100</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase">System Record / Badge</span>
                  <p className="font-mono text-slate-300">{selectedNode.details.identifier || 'N/A'}</p>
                </div>
                {selectedNode.details.location && (
                  <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400"/>
                    <p className="text-slate-300">{selectedNode.details.location}</p>
                  </div>
                )}
                {selectedNode.details.exposureValue && (
                  <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
                    <BadgeAlert className="w-3.5 h-3.5 text-amber-400"/>
                    <p className="font-semibold text-amber-400">Data Exposed: {selectedNode.details.exposureValue}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400"/>
              Security Playbook Actions
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handlePromptAction(e, selectedNode.status === 'contained' ? 'restore' : 'lockdown')
                }
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow ${
                  selectedNode.status === 'contained'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {selectedNode.status === 'contained' ? (
                  <><RotateCcw className="w-3.5 h-3.5"/> Restore Access</>
                ) : (
                  <><ShieldAlert className="w-3.5 h-3.5"/> Lock Down / Revoke Credentials</>
                )}
              </button>

              <button
                type="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handlePromptAction(e, 'dispatch')}
                disabled={selectedNode.status === 'contained'}
                className="w-full py-2 px-3 bg-[#070b14] hover:bg-slate-800/80 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
                Dispatch Incident Response Team
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Security Playbook Action Modal */}
      {isActionModalOpen && pendingAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0b1322] border border-red-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.25)] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#0d172a] border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{pendingAction.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">CRIMESYNC Security Playbook Command</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissModal}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Dismiss modal without executing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {!actionSuccess ? (
                <>
                  <div className="p-4 rounded-xl bg-[#070c18] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        Target Entity: <span className="text-red-400 font-bold">{pendingAction.nodeName}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                        Node: {pendingAction.nodeId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pendingAction.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Clicking 'X' or 'Cancel' will dismiss this prompt without modifying access.</span>
                  </div>

                  {isProcessingAction && (
                    <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-red-400 animate-spin" />
                      <span className="text-xs font-mono text-red-300">
                        Executing containment protocol & ledger timestamping...
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Playbook Action Executed!</h4>
                  <p className="text-xs text-slate-400">
                    Network disruption updated. Changes recorded to immutable incident log.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDismissModal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {actionSuccess ? 'Dismiss' : 'Cancel'}
              </button>
              {!actionSuccess && (
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={handleExecuteModalAction}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-1.5"
                >
                  {isProcessingAction ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Execute Now'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlastRadiusSimulator;
