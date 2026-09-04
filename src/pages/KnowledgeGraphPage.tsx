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
  Sparkles,
  Briefcase,
  Layers,
  HelpCircle,
  ExternalLink,
  Shield
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
  id?: string;
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
    sublabel2: centerNode.properties?.risk_level ? `Risk: ${centerNode.properties.risk_level}` : '',
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
      sublabel2: node.properties?.risk_level ? `Risk: ${node.properties.risk_level}` : '',
      bgClass: style.bg,
      borderColor: style.border,
      properties: node.properties,
    });
  });

  return { renderNodes, renderEdges: edges };
}

export const KnowledgeGraphPage: React.FC<KnowledgeGraphPageProps> = ({ onSelectAction }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-004');
  const [casesList, setCasesList] = useState<any[]>([]);
  const [nodes, setNodes] = useState<RenderNode[]>([]);
  const [edges, setEdges] = useState<RenderEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<RenderNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHelpBanner, setShowHelpBanner] = useState(true);

  // Load cases list
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await api.cases.getAll();
        if (res) setCasesList(res);
      } catch (err) {
        console.warn('Failed to load cases:', err);
      }
    }
    loadCases();
  }, []);

  const loadGraphData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.knowledgeGraph.getFullGraph(100, selectedCaseId);
      if (res && res.nodes) {
        const layout = computeCleanLayout(res.nodes, res.edges || []);
        setNodes(layout.renderNodes);
        setEdges(layout.renderEdges);
        setSelectedNode(layout.renderNodes[0] || null);
      }
    } catch (err) {
      console.warn('Live graph load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.sublabel && n.sublabel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategoryFilter === 'ALL' || n.category === activeCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const CATEGORY_COLORS = [
    { label: 'All Entities', value: 'ALL', color: 'bg-slate-700' },
    { label: 'Suspects', value: 'Suspect', color: 'bg-red-600' },
    { label: 'Bank Accounts', value: 'Account', color: 'bg-emerald-600' },
    { label: 'Phones / SIMs', value: 'Phone', color: 'bg-blue-600' },
    { label: 'Cyber IPs / C2', value: 'IPAddress', color: 'bg-amber-600' },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Header & Case Switcher ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Syndicate Knowledge Graph & Link Discovery
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                Neo4j AuraDB Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive entity-relationship network mapping suspects, bank accounts, phones, and cyber assets
            </p>
          </div>
        </div>

        {/* Top Controls: Case Select & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
            <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Cases (Global Syndicate)</option>
              {casesList.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.fir_number} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadGraphData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Explanatory Guide Banner ─────────────────────────────────── */}
      {showHelpBanner && (
        <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-blue-950/60 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">How Knowledge Graphs Work: </span>
              Circles represent physical people, accounts, or phone lines. Click any node in the canvas below to reveal suspect aliases, money laundering routes, and call intercept history in the right-hand panel.
            </div>
          </div>
          <button
            onClick={() => setShowHelpBanner(false)}
            className="text-slate-400 hover:text-slate-200 font-bold px-2 py-0.5 text-[11px]"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ─── Toolbar: Legend & Search ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
        {/* Category Filters / Legend */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORY_COLORS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategoryFilter(cat.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeCategoryFilter === cat.value
                  ? 'bg-slate-800 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suspect, account, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column (8 Cols): Interactive SVG Graph Canvas */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden relative shadow-lg">
          
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Graph Visualization */}
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-xs">Traversing Neo4j AuraDB knowledge graph...</span>
            </div>
          ) : (
            <div
              className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-grab select-none"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
            >
              {/* SVG Edges Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                </defs>

                {edges.map((edge, i) => {
                  const sNode = nodes.find((n) => n.id === edge.source);
                  const tNode = nodes.find((n) => n.id === edge.target);
                  if (!sNode || !tNode) return null;

                  return (
                    <g key={i}>
                      <line
                        x1={`${sNode.x}%`}
                        y1={`${sNode.y}%`}
                        x2={`${tNode.x}%`}
                        y2={`${tNode.y}%`}
                        stroke="#334155"
                        strokeWidth="1.5"
                        strokeDasharray={edge.relationship === 'COMMUNICATES_WITH' ? '4 2' : 'none'}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HTML Nodes Layer */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-10 p-2.5 rounded-xl cursor-pointer border-2 transition-all flex flex-col items-center text-center shadow-lg ${
                      node.bgClass
                    } ${isSelected ? 'ring-4 ring-purple-500 scale-110 z-30' : 'hover:scale-105'}`}
                  >
                    <div className="font-bold text-xs truncate max-w-[120px]">{node.name}</div>
                    {node.sublabel && (
                      <div className="text-[10px] opacity-90 truncate max-w-[120px]">{node.sublabel}</div>
                    )}
                    {node.sublabel2 && (
                      <div className="text-[9px] font-mono bg-black/40 px-1.5 py-0.5 rounded-full mt-1">
                        {node.sublabel2}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Graph Stats Bar */}
          <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>Nodes: <strong className="text-white">{filteredNodes.length}</strong></span>
              <span>Edges: <strong className="text-white">{edges.length}</strong></span>
            </div>
            <span>Click any node to inspect intelligence profile</span>
          </div>
        </div>

        {/* Right Column (4 Cols): Selected Entity Profile & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {selectedNode ? (
            <>
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Entity Profile Inspector
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 border border-purple-600/40 text-purple-300">
                    {selectedNode.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{selectedNode.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{selectedNode.sublabel || 'Active Entity'}</p>

                {/* Attributes Table */}
                <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between py-0.5 border-b border-slate-900 last:border-0">
                      <span className="text-slate-500 text-[11px] uppercase">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-slate-200 max-w-[140px] truncate text-right">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Relationships in Graph */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Direct Graph Connections
                </span>
                <div className="space-y-1.5">
                  {edges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, idx) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const otherNode = nodes.find((n) => n.id === otherId);
                      return (
                        <div
                          key={idx}
                          onClick={() => otherNode && setSelectedNode(otherNode)}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="text-slate-400 text-[10px] block font-mono">{edge.relationship}</span>
                            <span className="font-bold text-white">{otherNode?.name || otherId}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Network className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs">Click any node on the graph canvas to inspect full properties and links.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
