import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  RotateCcw,
  User, 
  Phone, 
  Car, 
  Landmark, 
  Building, 
  MapPin,
  ExternalLink,
  ShieldAlert,
  X,
  Share2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { getActiveCaseIntelligence } from '../data/activeCaseNetworks';
import type { NetworkNode } from '../types/dashboard';

interface CriminalNetworkGraphProps {
  onSelectNode: (node: NetworkNode) => void;
  onExploreGraph: () => void;
  customCase?: any;
  caseId?: string;
}

export const CriminalNetworkGraph: React.FC<CriminalNetworkGraphProps> = ({
  onSelectNode,
  onExploreGraph,
  customCase,
  caseId,
}) => {
  const { selectedCase: contextCase, selectedCaseId: contextCaseId } = useCaseContext();
  const effectiveCase = customCase !== undefined ? customCase : contextCase;
  const effectiveCaseId = caseId || effectiveCase?.id || contextCaseId;

  const caseIntel = useMemo(() => {
    return getActiveCaseIntelligence(effectiveCase || { id: effectiveCaseId });
  }, [effectiveCase, effectiveCaseId]);

  // Graph state: Zoom, Pan & Selected Entity
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeModalNode, setActiveModalNode] = useState<any | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when active case changes
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveModalNode(null);
    setSearchQuery('');
  }, [effectiveCaseId, effectiveCase?.id]);

  // Pan dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-interactive-node') || (e.target as HTMLElement).closest('.graph-controls')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, prev + delta), 2.2));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getNodeIcon = (category: string) => {
    switch (category) {
      case 'People':
        return <User className="w-3.5 h-3.5 text-purple-300" />;
      case 'Phones':
        return <Phone className="w-3.5 h-3.5 text-blue-300" />;
      case 'Vehicles':
        return <Car className="w-3.5 h-3.5 text-amber-300" />;
      case 'Accounts':
        return <Landmark className="w-3.5 h-3.5 text-emerald-300" />;
      case 'Organisations':
        return <Building className="w-3.5 h-3.5 text-red-300" />;
      case 'Locations':
      default:
        return <MapPin className="w-3.5 h-3.5 text-cyan-300" />;
    }
  };

  const getRiskBorderColor = (risk: string, isCenter = false) => {
    if (isCenter) return 'border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.7)]';
    switch (risk) {
      case 'HIGH':
        return 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'MEDIUM':
        return 'border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'LOW':
      default:
        return 'border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    }
  };

  const nodes = caseIntel.nodes;
  const edges = caseIntel.edges;

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesCategory = activeCategoryFilter === 'ALL' || n.category === activeCategoryFilter;
      const matchesSearch = !searchQuery.trim() || 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sublabel?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [nodes, activeCategoryFilter, searchQuery]);

  return (
    <div 
      key={effectiveCaseId || 'criminal-network-graph'}
      ref={containerRef}
      className="p-4 rounded-2xl bg-gradient-to-b from-[#060f22]/95 via-[#040a18]/95 to-[#020610]/95 border border-blue-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col justify-between h-full relative overflow-hidden select-none group"
    >
      {/* Background Cyber Grid lines */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#3b82f6 1px, #030712 1px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* Header & Graph Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Share2 className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                LIVE NETWORK GRAPH
              </span>
              <span className="text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 px-2 py-0.2 rounded-full border border-cyan-500/40 animate-pulse">
                {caseIntel.nodes.length} Nodes • {caseIntel.edges.length} Links
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              Case Scope: <strong className="text-cyan-300">{effectiveCase?.fir_number || effectiveCase?.firNumber || effectiveCaseId}</strong> — {effectiveCase?.title || effectiveCase?.suspectName || 'Active Case Scope'}
            </span>
          </div>
        </div>

        {/* Action Buttons & Category Filters */}
        <div className="flex items-center gap-2 graph-controls">
          {/* Search in Graph */}
          <div className="relative hidden xl:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter nodes..."
              className="w-32 focus:w-44 transition-all text-[11px] bg-[#071329] border border-slate-700/80 rounded-lg pl-7 pr-2 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-sans"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-[#071329] border border-slate-700/80 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 text-slate-300 hover:text-white hover:bg-blue-600/30 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 text-slate-300 hover:text-white hover:bg-blue-600/30 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-slate-300 hover:text-white hover:bg-blue-600/30 rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Explore Full Graph Button */}
          <button
            onClick={onExploreGraph}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            <span>Full Graph</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Category Pills Filter Row */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-none relative z-20">
        {['ALL', 'People', 'Phones', 'Accounts', 'Vehicles', 'Locations'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-all ${
              activeCategoryFilter === cat
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border border-blue-400'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── INTERACTIVE GRAPH CANVAS ───────────────────────────────────────── */}
      <div 
        className="relative flex-1 min-h-[380px] w-full bg-[#030814]/90 rounded-xl border border-slate-900/80 overflow-hidden cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center my-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* SVG Connection Edges Layer */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edgeGlowRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="edgeGlowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glowEdge" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const edgeKey = `${edge.from}-${edge.to}`;
              const isHovered = hoveredEdge === edgeKey || hoveredNode === edge.from || hoveredNode === edge.to;
              const isRed = edge.isHighRisk;

              return (
                <g key={idx} className="transition-all">
                  {/* Outer Glow Line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isRed ? '#ef4444' : '#3b82f6'}
                    strokeWidth={isHovered ? '1.8' : '0.8'}
                    strokeOpacity={isHovered ? 1 : 0.45}
                    strokeDasharray={isHovered ? 'none' : '2 2'}
                    filter="url(#glowEdge)"
                  />

                  {/* Animated Pulsing Data Flow Particle */}
                  <circle r={isHovered ? "1.2" : "0.8"} fill={isRed ? "#f87171" : "#67e8f9"}>
                    <animateMotion
                      path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                      dur={`${isRed ? '2.4s' : '3.6s'}`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {filteredNodes.map((node) => {
            const isCenter = node.type === 'center';
            const isSelected = activeModalNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalNode(node);
                  onSelectNode(node as any);
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 graph-interactive-node cursor-pointer z-10 transition-colors duration-150 hover:brightness-125 hover:drop-shadow-[0_0_14px_rgba(6,182,212,0.4)] ${
                  isSelected ? 'z-30' : ''
                }`}
              >
                {/* Center Target Node (Mastermind) */}
                {isCenter ? (
                  <div className="flex flex-col items-center group pointer-events-none select-none">
                    <div className="relative">
                      {/* Pulse Ring */}
                      <div className="absolute -inset-2.5 rounded-full bg-red-600/30 animate-ping opacity-75 pointer-events-none" />
                      
                      <div className={`w-14 h-14 rounded-full border-2 ${getRiskBorderColor('HIGH', true)} overflow-hidden bg-[#0a1226] relative`}>
                        {node.avatar ? (
                          <img src={node.avatar} alt={node.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-red-950 text-red-300">
                            <User className="w-7 h-7" />
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#040a18] shadow-[0_0_8px_#ef4444]" />
                      </div>
                    </div>

                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex flex-col items-center text-center">
                      <span className="text-[11px] font-black text-white tracking-wide whitespace-nowrap">
                        {node.label}
                      </span>
                      <span className="text-[9px] font-mono text-red-300 font-bold">
                        {node.sublabel || 'MASTERMIND'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Connected Entity Nodes */
                  <div className="flex flex-col items-center group pointer-events-none select-none">
                    <div className={`w-9 h-9 rounded-xl border ${getRiskBorderColor(node.risk)} flex items-center justify-center bg-[#07132a] shadow-lg relative group-hover:border-cyan-400 transition-colors`}>
                      {getNodeIcon(node.category)}
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        node.risk === 'HIGH' ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <div className="mt-1 px-2 py-0.5 rounded-md bg-[#050e20]/90 border border-slate-800 shadow-md flex flex-col items-center text-center max-w-[120px]">
                      <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-[110px]">
                        {node.label}
                      </span>
                      {node.sublabel && (
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[110px]">
                          {node.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── NODE DETAILS MINI MODAL / DRAWER ──────────────────────────────── */}
        {activeModalNode && (
          <div className="absolute right-3 top-3 bottom-3 w-72 bg-[#061026]/95 border border-blue-500/60 rounded-2xl p-3.5 z-40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
                    Entity Profile ({activeModalNode.category})
                  </span>
                </div>
                <button
                  onClick={() => setActiveModalNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-3 flex items-center gap-3">
                {activeModalNode.avatar ? (
                  <img src={activeModalNode.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border border-blue-500/50" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-300">
                    {getNodeIcon(activeModalNode.category)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-white">{activeModalNode.label}</h4>
                  <div className="text-[10px] text-cyan-300 font-mono font-semibold">
                    Risk Score: {activeModalNode.riskScore || 85}/100
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    activeModalNode.risk === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-500/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {activeModalNode.risk} THREAT
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-1.5 text-[11px] bg-[#030814] p-2.5 rounded-xl border border-slate-800">
                {activeModalNode.details?.role && (
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-slate-400 text-[10px]">Role:</span>
                    <span className="text-slate-200 font-medium text-right">{activeModalNode.details.role}</span>
                  </div>
                )}
                {activeModalNode.details?.phone && (
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-slate-400 text-[10px]">Phone/IMEI:</span>
                    <span className="text-blue-300 font-mono font-medium">{activeModalNode.details.phone}</span>
                  </div>
                )}
                {activeModalNode.details?.location && (
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-slate-400 text-[10px]">Location:</span>
                    <span className="text-slate-200 font-medium">{activeModalNode.details.location}</span>
                  </div>
                )}
                {activeModalNode.details?.vehicleNumber && (
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-slate-400 text-[10px]">Vehicle:</span>
                    <span className="text-amber-300 font-mono font-bold">{activeModalNode.details.vehicleNumber}</span>
                  </div>
                )}
                {activeModalNode.details?.notes && (
                  <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 leading-tight">
                    {activeModalNode.details.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={onExploreGraph}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-md"
              >
                <span>Traverse in Network Graph</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono relative z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> High Risk Target
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Co-Conspirator
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Telecom / C2
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mule Account
          </span>
        </div>

        <span className="text-slate-400 hidden sm:inline">
          Drag to pan • Scroll to zoom • Click node for dossier
        </span>
      </div>
    </div>
  );
};
