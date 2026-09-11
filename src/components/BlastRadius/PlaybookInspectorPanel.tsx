import React, { useState } from 'react';
import type {
  CrimeNode,
  CrimeEdge,
  PlaybookAction,
} from '../../types/blastRadius';
import {
  ShieldAlert,
  Lock,
  Unlock,
  Radio,
  FileBadge,
  Ban,
  Activity,
  Phone,
  Landmark,
  Car,
  MapPin,
  FileText,
  Clock,
  Zap,
  CheckCircle2,
  DollarSign,
  AlertOctagon,
} from 'lucide-react';

interface PlaybookInspectorPanelProps {
  selectedNode: CrimeNode | null;
  edges: CrimeEdge[];
  allNodes: CrimeNode[];
  isContained: boolean;
  onToggleContainment: (nodeId: string, actionName: string) => void;
  onExecutePlaybookAction: (action: PlaybookAction) => void;
  disruptionRate: number;
}

export const PlaybookInspectorPanel: React.FC<PlaybookInspectorPanelProps> = ({
  selectedNode,
  edges,
  allNodes,
  isContained,
  onToggleContainment,
  onExecutePlaybookAction,
  disruptionRate,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'playbook' | 'connections'>('playbook');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // CHECK 4: Graceful fallback when node is unselected or filtered out
  if (!selectedNode) {
    return (
      <div className="w-full h-full bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-cyan-400 animate-pulse">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Entity Selected</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Click any suspect, bank mule, burner line, or shell asset node on the radar shockwave canvas to inspect risk vectors and execute containment orders.
        </p>
      </div>
    );
  }

  // Find incident connections safely
  const incidentEdges = edges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id
  );

  const nodeMap = new Map<string, CrimeNode>(allNodes.map((n) => [n.id, n]));

  const triggerAction = (
    type: 'LOC' | 'FREEZE_ACCOUNT' | 'TELECOM_TAP' | 'SECTION_91' | 'RAID_SEIZE',
    title: string,
    impact: string
  ) => {
    const action: PlaybookAction = {
      id: `act-${Date.now()}`,
      targetNodeId: selectedNode.id,
      targetNodeName: selectedNode.name,
      actionType: type,
      title,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      officer: 'ACP Rajeshwar Sharma (Lead Investigator)',
      status: 'EXECUTED',
      impactDescription: impact,
    };

    onExecutePlaybookAction(action);
    setActionSuccessMsg(`Executed: ${title}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);

    // Enforce containment upon executing statutory action
    if (!isContained) {
      onToggleContainment(selectedNode.id, title);
    }
  };

  const getHopBadge = (hop: number) => {
    switch (hop) {
      case 0:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-700">
            HOP 0 • GROUND ZERO EPICENTER
          </span>
        );
      case 1:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-700">
            HOP 1 • DIRECT SYNDICATE
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-700">
            HOP 2 • INTERMEDIARY LAYER
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-700">
            HOP 3 • PERIPHERY CHANNELS
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
      {/* Entity Header Banner */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getHopBadge(selectedNode.hop)}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isContained
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                }`}
              >
                {isContained ? 'CONTAINED & ISOLATED' : 'ACTIVE CONTAGION'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              {selectedNode.name}
            </h2>
            <p className="text-xs text-slate-400">{selectedNode.role}</p>
          </div>

          {/* Risk Score Gauge */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black text-base border shadow-lg ${
                selectedNode.riskScore >= 90
                  ? 'bg-red-950/80 text-red-400 border-red-600/80 shadow-red-900/30'
                  : selectedNode.riskScore >= 75
                  ? 'bg-amber-950/80 text-amber-400 border-amber-600/80 shadow-amber-900/30'
                  : 'bg-cyan-950/80 text-cyan-400 border-cyan-600/80 shadow-cyan-900/30'
              }`}
            >
              {selectedNode.riskScore}
              <span className="text-[8px] font-sans font-bold text-slate-400 -mt-1">
                RISK
              </span>
            </div>
          </div>
        </div>

        {/* Action Success Alert Notification */}
        {actionSuccessMsg && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
        )}

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 mt-3 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('playbook')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition flex items-center justify-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Police Playbook
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Asset Dossier
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition flex items-center justify-center gap-1.5 ${
              activeTab === 'connections'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Pivots ({incidentEdges.length})
          </button>
        </div>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: POLICE OPERATIONAL PLAYBOOK */}
        {activeTab === 'playbook' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Immediate Containment Actions
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Disruption: {disruptionRate}%
              </span>
            </div>

            {/* Playbook Action Button 1: Issue LOC */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-red-500/50 transition flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <FileBadge className="w-4 h-4 text-rose-400" />
                    Issue LOC / Intercept Order
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Transmit immediate Lookout Circular to Bureau of Immigration & Airport Seaports.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  triggerAction(
                    'LOC',
                    `Issue LOC for ${selectedNode.name}`,
                    'Border immigration alert triggered across all international exits.'
                  )
                }
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition"
              >
                <Ban className="w-3.5 h-3.5" />
                Enforce LOC & Detention Notice
              </button>
            </div>

            {/* Playbook Action Button 2: Freeze Bank Accounts */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    Freeze Bank Accounts (Sec 102 CrPC)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dispatch statutory asset freeze mandate to RBI, FIU-IND, and nodal bank branches.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  triggerAction(
                    'FREEZE_ACCOUNT',
                    `Freeze Bank Accounts for ${selectedNode.name}`,
                    'All outward debit transactions and UPI settlement gateways frozen instantly.'
                  )
                }
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Issue Debit Freeze & Seize Escrow
              </button>
            </div>

            {/* Playbook Action Button 3: Apply Telecom Tap */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Apply Telecom Tap / Section 91 Notice
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authorise real-time lawful interception on CDR, IMEI, and tower handoff triangulation.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  triggerAction(
                    'TELECOM_TAP',
                    `Telecom Interception on ${selectedNode.name}`,
                    'Real-time voice packet capture and cellular ping surveillance deployed.'
                  )
                }
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition"
              >
                <Radio className="w-3.5 h-3.5" />
                Deploy Live CDR & VoIP Interceptor
              </button>
            </div>

            {/* Universal Containment Switch */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() =>
                  onToggleContainment(
                    selectedNode.id,
                    isContained ? 'Restored Entity Flow' : 'Full Tactical Quarantine'
                  )
                }
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                  isContained
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                    : 'bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-600 hover:to-rose-600 text-white border border-red-500'
                }`}
              >
                {isContained ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    Restore Entity / Lift Containment
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white animate-pulse" />
                    Execute Complete Network Containment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED ASSET DOSSIER */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Forensic Identifiers
              </div>

              {selectedNode.details?.phone && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone / SIM:
                  </span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {selectedNode.details.phone}
                  </span>
                </div>
              )}

              {selectedNode.details?.accountNumber && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-400" /> Account #:
                  </span>
                  <span className="font-mono font-semibold text-emerald-300">
                    {selectedNode.details.accountNumber}
                  </span>
                </div>
              )}

              {selectedNode.details?.bankName && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Nodal Bank:</span>
                  <span className="font-medium text-slate-200">
                    {selectedNode.details.bankName}
                  </span>
                </div>
              )}

              {selectedNode.details?.amount && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Exposed Value:
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {selectedNode.details.amount}
                  </span>
                </div>
              )}

              {selectedNode.details?.location && (
                <div className="flex items-start justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Location:
                  </span>
                  <span className="text-right text-slate-200">
                    {selectedNode.details.location}
                  </span>
                </div>
              )}

              {selectedNode.details?.firNumber && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> Case / FIR:
                  </span>
                  <span className="font-mono font-bold text-purple-300">
                    {selectedNode.details.firNumber}
                  </span>
                </div>
              )}

              {selectedNode.details?.vehicleNumber && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-orange-400" /> Vehicle:
                  </span>
                  <span className="font-mono font-bold text-orange-300">
                    {selectedNode.details.vehicleNumber}
                  </span>
                </div>
              )}

              {selectedNode.details?.lastActive && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Active:
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {selectedNode.details.lastActive}
                  </span>
                </div>
              )}
            </div>

            {/* Intel Notes */}
            {selectedNode.details?.notes && (
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Intelligence Officer Assessment
                </div>
                <p className="text-slate-300 leading-relaxed italic">
                  "{selectedNode.details.notes}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONNECTED CONTAGION PIVOTS */}
        {activeTab === 'connections' && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Incident Contagion Vectors</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {incidentEdges.length} Channels
              </span>
            </div>

            {incidentEdges.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No active vectors connected to this entity.
              </p>
            ) : (
              incidentEdges.map((edge) => {
                const isSource = edge.source === selectedNode.id;
                const peerId = isSource ? edge.target : edge.source;
                const peerNode = nodeMap.get(peerId);

                return (
                  <div
                    key={edge.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-300">
                        {isSource ? 'Outgoing to' : 'Incoming from'}:{' '}
                        <span className="text-cyan-300">
                          {peerNode ? peerNode.name : peerId}
                        </span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                        {edge.relation}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{edge.label}</div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
