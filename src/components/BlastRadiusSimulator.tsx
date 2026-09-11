import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Radio, FileText, 
  RotateCcw, Play, CheckCircle2, Lock, UserX, Database, BadgeAlert, MapPin
} from 'lucide-react';

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
}

// 1. EXACT DATASET: POLICE PLATFORM BREACH
const BREACH_NODES: CrimeNode[] = [
  { id: 'n0', name: 'Karthik Ramanathan', role: 'APT Exploit Developer', type: 'hacker', status: 'active', riskScore: 99, hop: 0, details: { identifier: 'IP: 192.168.1.45', location: 'Chennai Darknet' } },
  
  // Hop 1: The case whose information he stole
  { id: 'n1', name: 'Operation Chakra Dossier', role: 'Stolen Case File', type: 'case', status: 'active', riskScore: 92, hop: 1, details: { identifier: 'FIR/DEL/2026/1428', exposureValue: 'Classified Informants' } },
  { id: 'n2', name: 'Operation Rudra DB', role: 'Stolen Case File', type: 'case', status: 'active', riskScore: 88, hop: 1, details: { identifier: 'FIR/CHE/2026/0204', exposureValue: 'Grid Schematics' } },
  
  // Hop 2: The inspectors assigned to that case
  { id: 'n3', name: 'ACP Rajeshwar Sharma', role: 'Lead Investigator', type: 'officer', status: 'active', riskScore: 95, hop: 2, details: { identifier: 'Badge #DEL-IPS-8821', location: 'Delhi HQ' } },
  { id: 'n4', name: 'Inspector Vikram', role: 'Field Officer', type: 'officer', status: 'active', riskScore: 85, hop: 2, details: { identifier: 'Badge #DEL-CID-441', location: 'Mumbai Branch' } },
  { id: 'n5', name: 'DCP Ananya Rao', role: 'Supervising Officer', type: 'officer', status: 'active', riskScore: 90, hop: 2, details: { identifier: 'Badge #CHE-IPS-102', location: 'Chennai HQ' } },
  
  // Hop 3: The assigned officers' information
  { id: 'n6', name: 'Sharma Family Residence', role: 'Doxxed Address', type: 'info', status: 'active', riskScore: 100, hop: 3, details: { identifier: 'Vasant Vihar, Delhi', exposureValue: 'Physical Threat' } },
  { id: 'n7', name: 'WS-412 Terminal Credentials', role: 'Exposed Login', type: 'info', status: 'active', riskScore: 98, hop: 3, details: { identifier: 'Hash: 0x8F9A...', exposureValue: 'System Access' } },
  { id: 'n8', name: 'Undercover Alias Docs', role: 'Compromised Identity', type: 'info', status: 'active', riskScore: 100, hop: 3, details: { identifier: 'Alias: "Raju Bhai"', exposureValue: 'Cover Blown' } }
];

const BREACH_EDGES: CrimeEdge[] = [
  { id: 'e1', source: 'n0', target: 'n1', label: 'DB Exfiltration', weight: 3 },
  { id: 'e2', source: 'n0', target: 'n2', label: 'Zero-Day Exploit', weight: 3 },
  { id: 'e3', source: 'n1', target: 'n3', label: 'Assigned Lead', weight: 2 },
  { id: 'e4', source: 'n1', target: 'n4', label: 'Assigned Field Agent', weight: 2 },
  { id: 'e5', source: 'n2', target: 'n5', label: 'Assigned Supervisor', weight: 2 },
  { id: 'e6', source: 'n3', target: 'n6', label: 'Records Scraped', weight: 3 },
  { id: 'e7', source: 'n4', target: 'n7', label: 'Keylogger Installed', weight: 3 },
  { id: 'e8', source: 'n5', target: 'n8', label: 'File Decrypted', weight: 3 }
];

export interface BlastRadiusSimulatorProps {
  onSelectAction?: (action: string) => void;
}

export const BlastRadiusSimulator: React.FC<BlastRadiusSimulatorProps> = ({ onSelectAction }) => {
  const [nodes, setNodes] = useState<CrimeNode[]>(BREACH_NODES);
  const [edges] = useState<CrimeEdge[]>(BREACH_EDGES);
  const [selectedHop, setSelectedHop] = useState<number | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('n0');
  
  // Simulation State Machine
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(3); // 3 = fully expanded

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

  const handleToggleContainment = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n, status: n.status === 'contained' ? 'active' : 'contained'
    } : n));
    if (onSelectAction) {
      const target = nodes.find(n => n.id === nodeId);
      if (target) {
        onSelectAction(target.status === 'contained' ? `Restored Access: ${target.name}` : `Secured / Revoked Access: ${target.name}`);
      }
    }
  };

  // STEP-BY-STEP SIMULATION ENGINE
  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(0); // Reset to Epicenter only
    if (onSelectAction) {
      onSelectAction("Breach Ripple Simulation Started: Tracing Stolen Records to Officers");
    }
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      setSimStep(currentStep);
      
      if (currentStep >= 3) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          if (onSelectAction) {
            onSelectAction("Breach Propagation Complete: All 3 Tiers Identified");
          }
        }, 500); // Cool down
      }
    }, 800); // 800ms delay between hops expanding
  };

  // Visibility logic (handles both the filter tabs and the running simulation)
  const isVisible = (hop: number) => {
    const passesFilter = selectedHop === 'all' || selectedHop === hop;
    const passesSimulation = hop <= simStep;
    return passesFilter && passesSimulation;
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#060a12] text-slate-200 overflow-y-auto custom-scrollbar p-6 space-y-6 select-none">
      
      {/* Header & Unified Controls */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800 rounded">
              Contagion Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Internal Threat & Breach Traversal</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide mt-1">Data Breach Blast Radius</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#070b14] border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setSelectedHop('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${selectedHop === 'all' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All Hops
            </button>
            {[0, 1, 2, 3].map(hop => (
              <button
                key={hop}
                onClick={() => setSelectedHop(hop)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${selectedHop === hop ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Hop {hop}
              </button>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold tracking-wider shadow-md transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-ping' : ''}`} />
            {isSimulating ? 'Tracing Breach...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Breach Epicenter</div>
            <div className="text-base font-bold text-white mt-1">Karthik Ramanathan</div>
            <div className="text-xs text-red-400 font-mono mt-0.5">APT Exploit Developer (Risk: 99/100)</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-400"/>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data at Risk</div>
            <div className="text-base font-bold text-amber-400 mt-1">8 Exposed Files & Officers</div>
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
        
        {/* Interactive SVG Radial Radar Canvas */}
        <div className="lg:col-span-8 bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse"/>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Data Exfiltration Mesh</span>
            </div>
            
            {/* Dynamic Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              {HOP_LABELS.map((label, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLOR_MAP[idx] }} />
                  Hop {idx}: {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
            <svg viewBox="0 0 800 800" className="w-full h-full max-h-[560px] object-contain select-none">
              <defs>
                <radialGradient id="epicenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(220, 38, 38, 0.25)" />
                  <stop offset="30%" stopColor="rgba(220, 38, 38, 0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Dedicated Center Glow */}
              <circle cx={CX} cy={CY} r="400" fill="url(#epicenterGlow)" pointerEvents="none" />

              {/* Background Rings (respect simulation step) */}
              {HOP_RADII.map((r, i) => {
                if (r === 0 || i > simStep) return null;
                return (
                  <circle
                    key={r}
                    cx={CX}
                    cy={CY}
                    r={r}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeDasharray={i > 1 ? "6 6" : "none"}
                    className="transition-all duration-700 ease-out pointer-events-none"
                  />
                );
              })}

              {/* 1. RENDER EDGES FIRST (Z-Index Bottom) */}
              {edges.map(edge => {
                const s = nodePositions[edge.source];
                const t = nodePositions[edge.target];
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                // Strict Safety Checks & Visibility Logic
                if (!s || !t || !sourceNode || !targetNode) return null;
                if (!isVisible(sourceNode.hop) || !isVisible(targetNode.hop)) return null;

                const isSevered = sourceNode.status === 'contained' || targetNode.status === 'contained';

                return (
                  <line
                    key={edge.id}
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke={isSevered ? '#475569' : '#dc2626'}
                    strokeWidth={isSevered ? 1 : 2}
                    strokeDasharray={isSevered ? "4 4" : "none"}
                    strokeOpacity={isSevered ? 0.3 : 0.8}
                    className="pointer-events-none transition-all duration-500"
                  />
                );
              })}

              {/* 2. RENDER NODES SECOND (Z-Index Top) */}
              {nodes.map(node => {
                const pos = nodePositions[node.id];
                if (!pos || !isVisible(node.hop)) return null;

                const isSelected = node.id === selectedNodeId;
                const isContained = node.status === 'contained';
                const nodeColor = isContained ? '#64748b' : COLOR_MAP[node.hop] || '#ef4444';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                    className="cursor-pointer group transition-all duration-500"
                    style={{ opacity: isVisible(node.hop) ? 1 : 0 }}
                  >
                    {/* INVISIBLE HITBOX to prevent hover jitter */}
                    <circle r="40" fill="transparent" />

                    <g className="transition-transform duration-200 group-hover:scale-110 pointer-events-none">
                      {(node.hop === 0 || isSelected) && !isContained && (
                        <circle r={node.hop === 0 ? 28 : 22} fill="none" stroke={nodeColor} strokeWidth="2" opacity="0.6" className="animate-ping pointer-events-none" />
                      )}
                      <circle r={node.hop === 0 ? 22 : 16} fill="#0b1120" stroke={nodeColor} strokeWidth={isSelected ? 3 : 2} className="pointer-events-none" />
                      <circle r={node.hop === 0 ? 10 : 7} fill={isContained ? '#475569' : nodeColor} className="pointer-events-none" />
                    </g>

                    {/* STATIC TEXT prevents warping */}
                    <text y={node.hop === 0 ? 36 : 28} textAnchor="middle" className={`text-[11px] pointer-events-none font-medium ${isContained ? 'fill-slate-500' : isSelected ? 'fill-white font-bold' : 'fill-slate-300'}`}>
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
                onClick={(e) => { e.stopPropagation(); handleToggleContainment(selectedNode.id); }}
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
                onClick={(e) => { e.stopPropagation(); handleToggleContainment(selectedNode.id); }}
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
    </div>
  );
};

export default BlastRadiusSimulator;
