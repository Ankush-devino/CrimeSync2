import React, { useState, useEffect, useCallback } from 'react';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  MousePointer,
  Share2,
  Download,
  RotateCw,
  ChevronDown,
  Info,
  Phone,
  Landmark,
  MapPin,
  Car,
  Building2,
  Calendar,
  User,
  Filter,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Database,
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
  properties: Record<string, any>;
}

interface RenderEdge {
  source: string;
  target: string;
  relationship: string;
  properties: Record<string, any>;
}

// Deterministic layout algorithm: place nodes in concentric rings
function computeLayout(
  nodes: Array<{ id: string; label: string; category: string; properties: any }>,
  edges: Array<{ source: string; target: string; relationship: string; properties: any }>
): { renderNodes: RenderNode[]; renderEdges: RenderEdge[] } {
  const CATEGORY_STYLES: Record<string, string> = {
    Suspect: 'bg-red-600 border-red-500 text-white',
    Account: 'bg-emerald-600 border-emerald-400 text-white',
    Phone: 'bg-blue-600 border-blue-400 text-white',
    IPAddress: 'bg-amber-600 border-amber-400 text-white',
    Case: 'bg-purple-600 border-purple-400 text-white',
    Entity: 'bg-slate-600 border-slate-400 text-white',
  };

  // Group by category
  const categoryMap = new Map<string, typeof nodes>();
  for (const n of nodes) {
    if (!categoryMap.has(n.category)) categoryMap.set(n.category, []);
    categoryMap.get(n.category)!.push(n);
  }

  // Find center node: prefer Suspect with most edges, else first node
  const edgeCounts = new Map<string, number>();
  for (const e of edges) {
    edgeCounts.set(e.source, (edgeCounts.get(e.source) || 0) + 1);
    edgeCounts.set(e.target, (edgeCounts.get(e.target) || 0) + 1);
  }
  const sortedByEdges = [...nodes].sort((a, b) => (edgeCounts.get(b.id) || 0) - (edgeCounts.get(a.id) || 0));
  const centerNode = sortedByEdges[0];
  const otherNodes = sortedByEdges.slice(1);

  const renderNodes: RenderNode[] = [];

  // Center node
  renderNodes.push({
    id: centerNode.id,
    name: centerNode.label,
    category: centerNode.category,
    x: 50,
    y: 45,
    sublabel: centerNode.properties?.role || centerNode.category,
    sublabel2: centerNode.properties?.risk_score ? `Risk: ${centerNode.properties.risk_score}%` : '',
    bgClass: CATEGORY_STYLES[centerNode.category] || CATEGORY_STYLES.Entity,
    properties: centerNode.properties,
  });

  // Concentric ring layout for other nodes
  const RINGS = [
    { radius: 28, maxNodes: 6 },
    { radius: 42, maxNodes: 8 },
    { radius: 56, maxNodes: 10 },
  ];

  let nodeIdx = 0;
  for (const ring of RINGS) {
    const ringNodes = otherNodes.slice(nodeIdx, nodeIdx + ring.maxNodes);
    const angleStep = (2 * Math.PI) / Math.max(ringNodes.length, 1);
    const startAngle = -Math.PI / 2;
    ringNodes.forEach((node, i) => {
      const angle = startAngle + i * angleStep;
      // Scale radius to percentage (canvas is 100x100)
      const rx = ring.radius * 0.75; // compress X slightly for aspect ratio
      const ry = ring.radius;
      const x = 50 + rx * Math.cos(angle);
      const y = 45 + ry * Math.sin(angle);
      renderNodes.push({
        id: node.id,
        name: node.label,
        category: node.category,
        x: Math.max(8, Math.min(92, x)),
        y: Math.max(8, Math.min(90, y)),
        sublabel:
          node.properties?.role ||
          node.properties?.account_number ||
          node.properties?.phone_number ||
          node.properties?.ip ||
          node.category,
        sublabel2: node.properties?.risk_score ? `Risk: ${node.properties.risk_score}%` : '',
        bgClass: CATEGORY_STYLES[node.category] || CATEGORY_STYLES.Entity,
        properties: node.properties,
      });
    });
    nodeIdx += ringNodes.length;
    if (nodeIdx >= otherNodes.length) break;
  }

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
  COMMUNICATES_WITH: '#a855f7',
  OPERATES_ACCOUNT: '#3b82f6',
  OWNS_DEVICE: '#06b6d4',
  IMPLICATED_IN: '#ef4444',
  CONTROLS_INFRA: '#f59e0b',
  ROUTES_TRAFFIC_THROUGH: '#f43f5e',
  TARGETS_INFRASTRUCTURE: '#dc2626',
};

export const KnowledgeGraphPage: React.FC<KnowledgeGraphPageProps> = ({ onSelectAction }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'connect' | 'target'>('select');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [renderNodes, setRenderNodes] = useState<RenderNode[]>([]);
  const [renderEdges, setRenderEdges] = useState<RenderEdge[]>([]);
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useCallback(async (showRefresh = false) => {
    try {
      showRefresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const data = await api.knowledgeGraph.getFullGraph(100);
      const { renderNodes: rn, renderEdges: re } = computeLayout(data.nodes, data.edges);
      setRenderNodes(rn);
      setRenderEdges(re);
      setGraphStats({ nodes: data.total_nodes, edges: data.total_edges });
      if (rn.length > 0) setSelectedNodeId(rn[0].id);
    } catch (err: any) {
      setError(err.message);
      console.warn('Graph load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const selectedNode = renderNodes.find((n) => n.id === selectedNodeId);
  const filteredNodes = renderNodes.filter((n) => {
    const matchFilter = !activeFilter || n.category === activeFilter;
    const matchSearch =
      !searchQuery ||
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter || matchSearch ? true : false;
  });

  const filterCategories = [
    { label: 'Suspect', color: '#ef4444', icon: <User className="w-3 h-3 text-red-400" /> },
    { label: 'Account', color: '#10b981', icon: <Landmark className="w-3 h-3 text-emerald-400" /> },
    { label: 'Phone', color: '#3b82f6', icon: <Phone className="w-3 h-3 text-blue-400" /> },
    { label: 'IPAddress', color: '#f59e0b', icon: <Network className="w-3 h-3 text-amber-400" /> },
    { label: 'Case', color: '#a855f7', icon: <Building2 className="w-3 h-3 text-purple-400" /> },
  ];

  const renderNodeIcon = (category: string, cls = 'w-4 h-4') => {
    switch (category) {
      case 'Phone': return <Phone className={cls} />;
      case 'Account': return <Landmark className={cls} />;
      case 'IPAddress': return <Network className={cls} />;
      case 'Case': return <Building2 className={cls} />;
      case 'Suspect': return <User className={cls} />;
      default: return <User className={cls} />;
    }
  };

  // Relationship stats from live edges
  const relationshipCounts = renderEdges.reduce((acc, e) => {
    acc[e.relationship] = (acc[e.relationship] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111e33]">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">KNOWLEDGE GRAPH</h1>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>
          <p className="text-[10px] text-slate-400">Live Neo4j AuraDB · Criminal network entity-relationship map</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Neo4j Live Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Neo4j AuraDB: {isLoading ? '...' : `${graphStats.nodes} Nodes / ${graphStats.edges} Edges`}</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="pl-7 pr-3 py-1.5 bg-[#081224] border border-[#162744] rounded-lg text-[10.5px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-36"
            />
          </div>

          <button
            onClick={() => loadGraph(true)}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-white transition-colors"
            title="Refresh Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-white transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Graph JSON')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>Export</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 pt-3 overflow-hidden">
        {/* Left 8 Cols: Graph Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0 overflow-y-auto pr-0.5">
          <div className="rounded-xl bg-[#050b18] border border-[#111e33] flex flex-col relative overflow-hidden shadow-xl min-h-[440px]">
            {/* Filter Toolbar */}
            <div className="px-3 py-2 border-b border-[#111e33] flex items-center justify-between bg-[#040813] text-xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2">
                {filterCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveFilter(activeFilter === cat.label ? null : cat.label)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all whitespace-nowrap border ${
                      activeFilter === cat.label
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                        : 'bg-[#091224] border-[#162744] text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
                {activeFilter && (
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="text-[10px] text-slate-400 hover:text-white px-1.5"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 min-h-[380px] bg-[#020612] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-30" />

              {/* Left Floating Toolbar */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                {[
                  { tool: 'select' as const, icon: <MousePointer className="w-4 h-4" />, title: 'Select' },
                  { tool: 'connect' as const, icon: <Network className="w-4 h-4" />, title: 'Connect' },
                ].map(({ tool, icon, title }) => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`p-2 rounded-lg border transition-all ${
                      activeTool === tool
                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                        : 'bg-[#081224]/90 text-slate-400 hover:text-white border-[#162744]'
                    }`}
                    title={title}
                  >
                    {icon}
                  </button>
                ))}
                <button onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2))} className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744]" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))} className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744]" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={() => setZoomLevel(1)} className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744]" title="Fit Screen"><Maximize2 className="w-4 h-4" /></button>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#020612]/80 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-400">Loading Neo4j Knowledge Graph...</p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 gap-3 p-8 text-center">
                  <Database className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400">Could not connect to Neo4j AuraDB</p>
                  <p className="text-[10px] text-slate-600">{error}</p>
                  <button onClick={() => loadGraph()} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              {/* SVG Edges */}
              {!isLoading && renderNodes.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                >
                  {renderEdges.map((edge, idx) => {
                    const srcNode = renderNodes.find((n) => n.id === edge.source);
                    const tgtNode = renderNodes.find((n) => n.id === edge.target);
                    if (!srcNode || !tgtNode) return null;

                    const edgeColor = EDGE_COLORS[edge.relationship] || '#38bdf8';
                    const midX = (srcNode.x + tgtNode.x) / 2;
                    const midY = (srcNode.y + tgtNode.y) / 2;

                    return (
                      <g key={idx}>
                        <line
                          x1={`${srcNode.x}%`} y1={`${srcNode.y}%`}
                          x2={`${tgtNode.x}%`} y2={`${tgtNode.y}%`}
                          stroke={edgeColor}
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          strokeOpacity="0.7"
                        />
                        <text
                          x={`${midX}%`} y={`${midY}%`}
                          fill={edgeColor}
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                          dy="-4"
                          className="select-none"
                        >
                          {edge.relationship.replace(/_/g, ' ')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Nodes Layer */}
              {!isLoading && (
                <div
                  className="absolute inset-0 transition-transform duration-200 pointer-events-auto"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                >
                  {filteredNodes.map((node) => {
                    const isCenter = renderNodes[0]?.id === node.id;
                    const isSelected = selectedNodeId === node.id;
                    const dimmed = activeFilter && node.category !== activeFilter && !isCenter;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{
                          left: `${node.x}%`,
                          top: `${node.y}%`,
                          transform: 'translate(-50%, -50%)',
                          opacity: dimmed ? 0.25 : 1,
                        }}
                        className="absolute cursor-pointer flex flex-col items-center group z-10 transition-all"
                      >
                        {isCenter ? (
                          <div className="relative flex flex-col items-center">
                            <div className="relative flex items-center justify-center">
                              <div className="absolute -inset-4 rounded-full border border-red-500/30 animate-pulse" />
                              <div className="absolute -inset-2 rounded-full border border-red-500/50" />
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(239,68,68,0.6)] ${node.bgClass}`}>
                                {renderNodeIcon(node.category, 'w-5 h-5')}
                              </div>
                            </div>
                            <div className="mt-2 px-2.5 py-0.5 rounded-md bg-[#050b18]/95 border border-[#162744] text-center shadow-lg">
                              <span className="text-[10px] font-bold text-white block">{node.name}</span>
                              {node.sublabel && <span className="text-[8.5px] text-red-400 block">{node.sublabel}</span>}
                              {node.sublabel2 && <span className="text-[8px] text-red-300 block">{node.sublabel2}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-md transition-transform group-hover:scale-110 ${node.bgClass} ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                              {renderNodeIcon(node.category)}
                            </div>
                            <div className="mt-1 text-center bg-[#050b18]/80 px-1.5 py-0.5 rounded border border-[#111e33]">
                              <span className="text-[9.5px] font-bold text-slate-200 block leading-tight whitespace-nowrap">{node.name.slice(0, 18)}</span>
                              {node.sublabel && <span className="text-[8px] text-slate-400 block leading-tight whitespace-nowrap">{node.sublabel.toString().slice(0, 20)}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Minimap */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-[#050b18]/90 border border-[#162744] rounded-lg p-1.5 z-20 shadow-xl">
                <div className="relative w-full h-full border border-blue-500/20 rounded">
                  {renderNodes.map((n) => (
                    <div
                      key={n.id}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        left: `${n.x}%`,
                        top: `${n.y}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor:
                          n.category === 'Suspect' ? '#ef4444' :
                          n.category === 'Account' ? '#10b981' :
                          n.category === 'Phone' ? '#3b82f6' :
                          n.category === 'IPAddress' ? '#f59e0b' : '#a855f7',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Relationship Types + Live Edge Activity */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">RELATIONSHIP TYPES</span>
              </div>
              <div className="space-y-2 mt-2.5 text-xs">
                {Object.entries(relationshipCounts).map(([rel, count]) => (
                  <div key={rel} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: EDGE_COLORS[rel] || '#64748b' }} />
                      <span className="text-slate-300">{rel.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">{count}</span>
                  </div>
                ))}
                {Object.keys(relationshipCounts).length === 0 && (
                  <p className="text-[10px] text-slate-500 text-center py-2">No relationships loaded yet</p>
                )}
              </div>
            </div>

            <div className="md:col-span-8 p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE GRAPH EDGES</span>
                <span className="text-[10px] text-slate-400">{renderEdges.length} relationships</span>
              </div>
              <div className="space-y-1.5 mt-1.5 text-xs overflow-y-auto max-h-32">
                {renderEdges.slice(0, 8).map((edge, idx) => {
                  const srcNode = renderNodes.find((n) => n.id === edge.source);
                  const tgtNode = renderNodes.find((n) => n.id === edge.target);
                  return (
                    <div key={idx} className="grid grid-cols-12 items-center px-1 py-1 hover:bg-[#0c1830] rounded text-[10px]">
                      <div className="col-span-4 text-slate-300 truncate">{srcNode?.name || edge.source}</div>
                      <div className="col-span-4 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono" style={{ color: EDGE_COLORS[edge.relationship] || '#94a3b8', backgroundColor: '#0a1628', border: `1px solid ${EDGE_COLORS[edge.relationship] || '#1e293b'}30` }}>
                          {edge.relationship.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-300 truncate text-right">{tgtNode?.name || edge.target}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Entity Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Entity Details */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">ENTITY DETAILS</span>
            </div>

            {selectedNode ? (
              <>
                <div className="flex items-center gap-3 my-2.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${selectedNode.bgClass}`}>
                    {renderNodeIcon(selectedNode.category, 'w-5 h-5')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{selectedNode.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-[8.5px] font-bold text-blue-400">{selectedNode.category}</span>
                    </div>
                    {selectedNode.sublabel && <span className="text-[10px] text-slate-400">{selectedNode.sublabel}</span>}
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px] border-t border-[#111e33] pt-2">
                  {Object.entries(selectedNode.properties)
                    .filter(([k]) => !['id'].includes(k))
                    .slice(0, 8)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-slate-200 max-w-[150px] truncate text-right">
                          {String(value?.toString ? value.toString() : value || '—')}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Connections</span>
                    <span className="font-semibold text-slate-200">
                      {renderEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <MousePointer className="w-6 h-6 text-slate-600" />
                <p className="text-[10px] text-slate-500">Click a node to inspect it</p>
              </div>
            )}
          </div>

          {/* Graph Statistics */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">GRAPH STATISTICS</span>
            </div>
            <div className="space-y-2 mt-2.5 text-[11px]">
              {filterCategories.map((cat) => {
                const count = renderNodes.filter((n) => n.category === cat.label).length;
                return (
                  <div key={cat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-300">{cat.label} Nodes</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">{count}</span>
                  </div>
                );
              })}
              <div className="border-t border-[#111e33] pt-1.5 flex items-center justify-between">
                <span className="text-slate-400">Total Edges</span>
                <span className="font-mono font-bold text-blue-400">{renderEdges.length}</span>
              </div>
            </div>
          </div>

          {/* Node List */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">ALL NODES</span>
              <span className="text-[10px] text-slate-400">{renderNodes.length} total</span>
            </div>
            <div className="space-y-1.5 mt-2 overflow-y-auto max-h-52">
              {renderNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all ${
                    selectedNodeId === node.id ? 'bg-blue-950/40 border border-blue-500/30' : 'hover:bg-[#0c1830] border border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${node.bgClass}`}>
                    {renderNodeIcon(node.category, 'w-3 h-3')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-200 block truncate">{node.name}</span>
                    <span className="text-[8.5px] text-slate-500">{node.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
