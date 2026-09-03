import React, { useState, useEffect, useCallback } from 'react';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Phone,
  Landmark,
  User,
  Building2,
  RefreshCw,
  Loader2,
  ArrowRight,
  Info,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface KnowledgeGraphPageProps {
  onSelectAction?: (action: string) => void;
}

interface RenderNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  sublabel?: string;
  sublabel2?: string;
  bgClass: string;
  borderColor: string;
  properties: Record<string, any>;
}

interface RenderEdge {
  source: string;
  target: string;
  relationship: string;
  properties: Record<string, any>;
}

function computeCleanLayout(
  nodes: Array<{ id: string; label: string; category: string; properties: any }>,
  edges: Array<{ source: string; target: string; relationship: string; properties: any }>
): { renderNodes: RenderNode[]; renderEdges: RenderEdge[] } {
  const CATEGORY_STYLES: Record<string, { bg: string; border: string }> = {
    Suspect: { bg: 'bg-red-600 text-white', border: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
    Account: { bg: 'bg-emerald-600 text-white', border: 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
    Phone: { bg: 'bg-blue-600 text-white', border: 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
    IPAddress: { bg: 'bg-amber-600 text-white', border: 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' },
    Case: { bg: 'bg-purple-600 text-white', border: 'border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]' },
  };

  const sortedNodes = [...nodes].sort((a, b) => (b.category === 'Suspect' ? 1 : -1));
  const centerNode = sortedNodes[0] || { id: 'center', label: 'Investigation Center', category: 'Case', properties: {} };
  const orbitingNodes = sortedNodes.slice(1);

  const renderNodes: RenderNode[] = [];

  // 1. Center node
  const centerStyle = CATEGORY_STYLES[centerNode.category] || CATEGORY_STYLES.Suspect;
  renderNodes.push({
    id: centerNode.id,
    name: centerNode.label,
    category: centerNode.category,
    x: 50,
    y: 46,
    sublabel: centerNode.properties?.role || centerNode.category,
    sublabel2: centerNode.properties?.risk_score ? `Risk: ${centerNode.properties.risk_score}%` : '',
    bgClass: centerStyle.bg,
    borderColor: centerStyle.border,
    properties: centerNode.properties,
  });

  // 2. Circular distribution for all connected nodes
  const total = orbitingNodes.length;
  const radiusX = 36;
  const radiusY = 34;

  orbitingNodes.forEach((node, idx) => {
    const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 46 + radiusY * Math.sin(angle);
    const style = CATEGORY_STYLES[node.category] || { bg: 'bg-slate-700 text-white', border: 'border-slate-500' };

    renderNodes.push({
      id: node.id,
      name: node.label,
      category: node.category,
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(88, y)),
      sublabel: node.properties?.role || node.properties?.account_number || node.properties?.phone_number || node.category,
      sublabel2: node.properties?.risk_score ? `${node.properties.risk_score}%` : '',
      bgClass: style.bg,
      borderColor: style.border,
      properties: node.properties,
    });
  });

  const renderEdges: RenderEdge[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
    relationship: e.relationship,
    properties: e.properties,
  }));

  return { renderNodes, renderEdges };
}

const EDGE_COLORS: Record<string, string> = {
  TRANSFERRED_INR: '#10b981',
  COMMUNICATES_WITH: '#38bdf8',
  OPERATES_ACCOUNT: '#a855f7',
  OWNS_DEVICE: '#f59e0b',
  IMPLICATED_IN: '#ef4444',
  CONTROLS_INFRA: '#f97316',
};

export const KnowledgeGraphPage: React.FC<KnowledgeGraphPageProps> = ({ onSelectAction }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderNodes, setRenderNodes] = useState<RenderNode[]>([]);
  const [renderEdges, setRenderEdges] = useState<RenderEdge[]>([]);

  const loadGraph = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.knowledgeGraph.getFullGraph(100);
      const { renderNodes: rn, renderEdges: re } = computeCleanLayout(data.nodes, data.edges);
      setRenderNodes(rn);
      setRenderEdges(re);
      if (rn.length > 0) setSelectedNodeId(rn[0].id);
    } catch (err) {
      console.warn('Knowledge graph load warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const selectedNode = renderNodes.find((n) => n.id === selectedNodeId) || renderNodes[0];

  const filteredNodes = renderNodes.filter((n) => {
    const matchCat = !activeCategoryFilter || n.category === activeCategoryFilter;
    const matchSearch =
      !searchQuery ||
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = [
    { label: 'Suspect', color: 'bg-red-500', text: 'Suspects (5)' },
    { label: 'Account', color: 'bg-emerald-500', text: 'Bank Accounts (3)' },
    { label: 'Phone', color: 'bg-blue-500', text: 'Phones (3)' },
    { label: 'Case', color: 'bg-purple-500', text: 'FIR Cases (1)' },
  ];

  const renderIcon = (cat: string) => {
    switch (cat) {
      case 'Suspect': return <User className="w-4 h-4" />;
      case 'Account': return <Landmark className="w-4 h-4" />;
      case 'Phone': return <Phone className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Simple Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Criminal Syndicate Knowledge Graph
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] font-semibold text-purple-300">
                Neo4j AuraDB Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive map of connections between suspects, bank accounts, and phone numbers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.8))}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={loadGraph}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Refresh from Neo4j"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Legend & Filter Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2.5 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Click to filter:</span>
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.label ? null : cat.label)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                activeCategoryFilter === cat.label
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-[#070e1c] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              <span>{cat.text}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search person or account..."
            className="bg-[#070e1c] border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48"
          />
        </div>
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left 8 Cols: Visual Interactive Graph Canvas */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#020612] border border-slate-800 rounded-xl relative overflow-hidden shadow-lg">
          
          {isLoading && (
            <div className="absolute inset-0 bg-[#020612]/80 z-30 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading graph from Neo4j database...</p>
            </div>
          )}

          {/* Background subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {renderEdges.map((edge, idx) => {
              const src = renderNodes.find((n) => n.id === edge.source);
              const tgt = renderNodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const color = EDGE_COLORS[edge.relationship] || '#94a3b8';
              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={`${src.x}%`} y1={`${src.y}%`}
                    x2={`${tgt.x}%`} y2={`${tgt.y}%`}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeOpacity="0.75"
                  />
                  <text
                    x={`${midX}%`} y={`${midY}%`}
                    fill={color}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dy="-3"
                    className="select-none font-sans"
                  >
                    {edge.relationship.replace(/_/g, ' ')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Nodes Layer */}
          <div
            className="absolute inset-0 transition-transform duration-200 pointer-events-auto"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute cursor-pointer flex flex-col items-center group z-10 transition-all hover:scale-110"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
                      node.bgClass
                    } ${node.borderColor} ${
                      isSelected ? 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-900 scale-110' : ''
                    }`}
                  >
                    {renderIcon(node.category)}
                  </div>

                  <div className="mt-1.5 px-2 py-0.5 rounded-md bg-[#050b18]/95 border border-slate-700 text-center shadow-md backdrop-blur-sm max-w-[130px]">
                    <p className="text-[11px] font-bold text-white leading-tight truncate">{node.name}</p>
                    {node.sublabel && (
                      <p className="text-[9.5px] text-slate-400 leading-tight truncate">{node.sublabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm">
            💡 Click any circle to view its full case profile on the right
          </div>
        </div>

        {/* Right 4 Cols: Clean Node Profile Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {selectedNode ? (
            <div className="p-4 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Entity Details
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedNode.category === 'Suspect' ? 'bg-red-950 text-red-400 border border-red-500/40' :
                  selectedNode.category === 'Account' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                  'bg-blue-950 text-blue-400 border border-blue-500/40'
                }`}>
                  {selectedNode.category}
                </span>
              </div>

              {/* Profile Header */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white border-2 ${selectedNode.bgClass} ${selectedNode.borderColor}`}>
                  {renderIcon(selectedNode.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.sublabel || selectedNode.category}</p>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                {selectedNode.properties?.role && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-semibold text-white">{selectedNode.properties.role}</span>
                  </div>
                )}
                {selectedNode.properties?.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jurisdiction City:</span>
                    <span className="font-semibold text-white">{selectedNode.properties.city}</span>
                  </div>
                )}
                {selectedNode.properties?.risk_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Threat Risk Score:</span>
                    <span className="font-mono font-bold text-red-400">{selectedNode.properties.risk_score} / 100</span>
                  </div>
                )}
                {selectedNode.properties?.account_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono text-emerald-400">{selectedNode.properties.account_number}</span>
                  </div>
                )}
                {selectedNode.properties?.phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone Intercept:</span>
                    <span className="font-mono text-blue-400">{selectedNode.properties.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Connections in Network:
                </p>
                <div className="space-y-1.5">
                  {renderEdges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, i) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const other = renderNodes.find((n) => n.id === otherId);
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedNodeId(otherId)}
                          className="p-2 rounded-lg bg-[#0b162a] hover:bg-slate-800 border border-slate-700/60 cursor-pointer text-xs flex items-center justify-between transition-all"
                        >
                          <span className="text-slate-300 font-medium truncate">{other?.name || otherId}</span>
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 text-purple-300">
                            {edge.relationship.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#070e1c] border border-slate-800 text-center text-xs text-slate-400">
              Click any node to view details
            </div>
          )}

          {/* Plain English Guide */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1">
            <p className="font-bold text-purple-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              What this graph reveals:
            </p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Red circles indicate syndicate members. Green circles show bank accounts where layered funds were transferred. Blue circles represent phone numbers intercepted during investigations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
