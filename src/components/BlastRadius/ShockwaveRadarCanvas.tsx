import React, { useState, useMemo } from 'react';
import type {
  CrimeNode,
  CrimeEdge,
  RelationType,
  NodeType,
} from '../../types/blastRadius';
import {
  User,
  Phone,
  Landmark,
  Car,
  MapPin,
  FileText,
  Lock,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crosshair,
} from 'lucide-react';

interface ShockwaveRadarCanvasProps {
  nodes: CrimeNode[];
  edges: CrimeEdge[];
  nodeCoords: Map<string, { x: number; y: number; angle: number; hop: number }>;
  selectedNodeId: string | null;
  onSelectNode: (node: CrimeNode) => void;
  containedNodeIds: Set<string>;
  isSimulating: boolean;
  maxHops: number;
  relationFilter: string;
}

export const ShockwaveRadarCanvas: React.FC<ShockwaveRadarCanvasProps> = ({
  nodes,
  edges,
  nodeCoords,
  selectedNodeId,
  onSelectNode,
  containedNodeIds,
  isSimulating,
  maxHops,
  relationFilter,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Responsive SVG Canvas Constants
  const viewBoxSize = 800;
  const centerX = 400;
  const centerY = 400;

  // Concentric Hop Radii matching graphEngine calculation
  const hopRadii = [0, 120, 230, 335];

  // Filter edges based on active relation category filter
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      if (relationFilter === 'ALL') return true;
      if (relationFilter === 'CALLED' && e.relation === 'CALLED') return true;
      if (relationFilter === 'TRANSFERRED_FUNDS' && e.relation === 'TRANSFERRED_FUNDS') return true;
      if (relationFilter === 'CO_ACCUSED' && e.relation === 'CO_ACCUSED') return true;
      if (relationFilter === 'OPERATES' && e.relation === 'OPERATES') return true;
      if (relationFilter === 'MET_AT' && e.relation === 'MET_AT') return true;
      return false;
    });
  }, [edges, relationFilter]);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'suspect':
        return <User className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'account':
        return <Landmark className="w-4 h-4" />;
      case 'vehicle':
        return <Car className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'fir':
        return <FileText className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getNodeColorStyles = (node: CrimeNode, isContained: boolean, isSelected: boolean) => {
    if (isContained) {
      return {
        bg: 'bg-slate-800/90',
        border: 'border-slate-600',
        ring: 'ring-1 ring-slate-600/50',
        text: 'text-slate-400',
        glow: 'shadow-none',
        svgFill: '#1e293b',
        svgStroke: '#64748b',
      };
    }

    if (node.hop === 0) {
      return {
        bg: 'bg-red-950/90',
        border: isSelected ? 'border-red-400' : 'border-red-500',
        ring: 'ring-4 ring-red-500/30',
        text: 'text-red-300',
        glow: 'shadow-[0_0_25px_rgba(239,68,68,0.6)]',
        svgFill: '#7f1d1d',
        svgStroke: '#ef4444',
      };
    }

    switch (node.type) {
      case 'suspect':
        return {
          bg: 'bg-rose-950/80',
          border: isSelected ? 'border-rose-300' : 'border-rose-500',
          ring: 'ring-2 ring-rose-500/30',
          text: 'text-rose-200',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          svgFill: '#4c0519',
          svgStroke: '#f43f5e',
        };
      case 'account':
        return {
          bg: 'bg-emerald-950/80',
          border: isSelected ? 'border-emerald-300' : 'border-emerald-500',
          ring: 'ring-2 ring-emerald-500/30',
          text: 'text-emerald-200',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          svgFill: '#064e3b',
          svgStroke: '#10b981',
        };
      case 'phone':
        return {
          bg: 'bg-cyan-950/80',
          border: isSelected ? 'border-cyan-300' : 'border-cyan-500',
          ring: 'ring-2 ring-cyan-500/30',
          text: 'text-cyan-200',
          glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]',
          svgFill: '#083344',
          svgStroke: '#06b6d4',
        };
      case 'location':
        return {
          bg: 'bg-blue-950/80',
          border: isSelected ? 'border-blue-300' : 'border-blue-500',
          ring: 'ring-2 ring-blue-500/30',
          text: 'text-blue-200',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
          svgFill: '#172554',
          svgStroke: '#3b82f6',
        };
      case 'vehicle':
        return {
          bg: 'bg-amber-950/80',
          border: isSelected ? 'border-amber-300' : 'border-amber-500',
          ring: 'ring-2 ring-amber-500/30',
          text: 'text-amber-200',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
          svgFill: '#451a03',
          svgStroke: '#f59e0b',
        };
      case 'fir':
        return {
          bg: 'bg-purple-950/80',
          border: isSelected ? 'border-purple-300' : 'border-purple-500',
          ring: 'ring-2 ring-purple-500/30',
          text: 'text-purple-200',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
          svgFill: '#3b0764',
          svgStroke: '#a855f7',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-500',
          ring: 'ring-1 ring-slate-500',
          text: 'text-slate-200',
          glow: '',
          svgFill: '#1e293b',
          svgStroke: '#64748b',
        };
    }
  };

  const getEdgeStyle = (relation: RelationType, isSevered: boolean) => {
    if (isSevered) {
      return {
        stroke: '#ef4444',
        strokeWidth: 1.5,
        strokeDasharray: '4 4',
        opacity: 0.45,
      };
    }

    switch (relation) {
      case 'TRANSFERRED_FUNDS':
        return {
          stroke: '#10b981',
          strokeWidth: 2.2,
          strokeDasharray: '6 3',
          opacity: 0.85,
        };
      case 'CALLED':
        return {
          stroke: '#06b6d4',
          strokeWidth: 2,
          strokeDasharray: '4 2',
          opacity: 0.85,
        };
      case 'CO_ACCUSED':
        return {
          stroke: '#f43f5e',
          strokeWidth: 2.4,
          strokeDasharray: 'none',
          opacity: 0.9,
        };
      case 'OPERATES':
        return {
          stroke: '#a855f7',
          strokeWidth: 2,
          strokeDasharray: '8 4',
          opacity: 0.85,
        };
      case 'MET_AT':
        return {
          stroke: '#f59e0b',
          strokeWidth: 1.8,
          strokeDasharray: '5 3',
          opacity: 0.8,
        };
      default:
        return {
          stroke: '#64748b',
          strokeWidth: 1.5,
          strokeDasharray: 'none',
          opacity: 0.6,
        };
    }
  };

  return (
    <div className="relative w-full h-full min-h-[640px] max-h-[760px] bg-gradient-to-b from-[#060b18] via-[#091122] to-[#040711] rounded-xl border border-slate-800/80 shadow-2xl overflow-hidden flex items-center justify-center select-none">
      {/* Background Radar Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Floating Canvas Zoom & View Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 100) / 100))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 100) / 100))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono font-semibold px-2 text-cyan-400 border-l border-slate-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Hop Legend Badge */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700/60 shadow-lg flex flex-col gap-1.5 text-[11px]">
        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          Radial Contagion Range
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Hop 0 (Ground Zero)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Hop 1 (Direct)
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Hop 2 (Intermediary)
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Hop 3 (Periphery)
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Radial Shockwave Canvas */}
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <defs>
          {/* Radial Center Pulse Glow */}
          <radialGradient id="groundZeroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Radar Sweep Gradient Beam */}
          <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Crosshair Target Alignment Lines */}
        <g opacity="0.25" stroke="#38bdf8" strokeDasharray="3 3">
          <line x1={centerX} y1={25} x2={centerX} y2={viewBoxSize - 25} />
          <line x1={25} y1={centerY} x2={viewBoxSize - 25} y2={centerY} />
          <line x1={centerX - 240} y1={centerY - 240} x2={centerX + 240} y2={centerY + 240} opacity="0.4" />
          <line x1={centerX - 240} y1={centerY + 240} x2={centerX + 240} y2={centerY - 240} opacity="0.4" />
        </g>

        {/* Concentric Hop Radar Rings */}
        {hopRadii.slice(1).map((radius, idx) => {
          const hopLevel = idx + 1;
          const isHopActive = hopLevel <= maxHops;
          const ringColors = ['#f43f5e', '#06b6d4', '#3b82f6'];
          const ringColor = ringColors[idx] || '#64748b';

          return (
            <g key={`hop-ring-${hopLevel}`} opacity={isHopActive ? 1 : 0.2}>
              {/* Outer Boundary Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={isHopActive ? '1.5' : '1'}
                strokeDasharray={hopLevel === 1 ? '6 4' : hopLevel === 2 ? '8 6' : '10 8'}
                opacity={isHopActive ? 0.45 : 0.15}
              />

              {/* Hop Distance Measurement Label */}
              <text
                x={centerX + 8}
                y={centerY - radius + 13}
                fill={ringColor}
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="700"
                opacity="0.8"
                letterSpacing="0.05em"
              >
                HOP {hopLevel} CONTAGION RADIUS ({radius}px)
              </text>
            </g>
          );
        })}

        {/* Ground Zero Epicenter Fill */}
        <circle
          cx={centerX}
          cy={centerY}
          r={65}
          fill="url(#groundZeroGlow)"
          className={isSimulating ? 'animate-pulse' : ''}
        />

        {/* Simulation Shockwave Expanding Concentric Rings */}
        {isSimulating && (
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r={100}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              opacity="0.75"
            >
              <animate
                attributeName="r"
                values="20;360"
                dur="1.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.95;0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={centerX}
              cy={centerY}
              r={100}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="20;360"
                dur="1.8s"
                begin="0.6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.85;0"
                dur="1.8s"
                begin="0.6s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* CHECK 3: Safe Vector Connecting Edges with NaN/Missing Protection */}
        <g className="edges-layer" pointerEvents="none">
          {filteredEdges.map((edge) => {
            if (!edge) return null;
            const srcCoord = nodeCoords.get(edge.source);
            const tgtCoord = nodeCoords.get(edge.target);

            // Safe fallback: if either source or target node is missing/filtered, gracefully skip
            if (
              !srcCoord ||
              !tgtCoord ||
              isNaN(srcCoord.x) ||
              isNaN(srcCoord.y) ||
              isNaN(tgtCoord.x) ||
              isNaN(tgtCoord.y)
            ) {
              return null;
            }

            const isSevered =
              containedNodeIds.has(edge.source) || containedNodeIds.has(edge.target);
            const isHovered =
              hoveredNodeId === edge.source || hoveredNodeId === edge.target;
            const isSelected =
              selectedNodeId === edge.source || selectedNodeId === edge.target;

            const edgeStyle = getEdgeStyle(edge.relation, isSevered);

            // Calculate subtle curved quadratic bezier control point
            const midX = (srcCoord.x + tgtCoord.x) / 2;
            const midY = (srcCoord.y + tgtCoord.y) / 2;
            const dx = tgtCoord.x - srcCoord.x;
            const dy = tgtCoord.y - srcCoord.y;
            const curvature = 0.08;
            const ctrlX = midX - dy * curvature;
            const ctrlY = midY + dx * curvature;

            const pathD = `M ${srcCoord.x} ${srcCoord.y} Q ${ctrlX} ${ctrlY} ${tgtCoord.x} ${tgtCoord.y}`;

            return (
              <g key={edge.id} pointerEvents="none" className="transition-all duration-300">
                {/* Background Shadow Line for high contrast */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#020617"
                  strokeWidth={edgeStyle.strokeWidth + 3}
                  opacity="0.8"
                  pointerEvents="none"
                />

                {/* Primary Vector Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#38bdf8' : edgeStyle.stroke}
                  strokeWidth={isSelected ? edgeStyle.strokeWidth + 1.5 : edgeStyle.strokeWidth}
                  strokeDasharray={edgeStyle.strokeDasharray}
                  opacity={isSevered ? 0.35 : isSelected ? 1 : isHovered ? 0.95 : edgeStyle.opacity}
                  pointerEvents="none"
                />

                {/* CHECK 5: Severed Line Cross Indicator */}
                {isSevered && (
                  <g transform={`translate(${midX}, ${midY})`} pointerEvents="none">
                    <circle r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke="#ffffff" strokeWidth="2" />
                    <line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}

                {/* Edge Label Tooltip Pill (on Hover or Selection) */}
                {(isSelected || isHovered) && (
                  <g transform={`translate(${ctrlX}, ${ctrlY})`} pointerEvents="none">
                    <rect
                      x="-80"
                      y="-12"
                      width="160"
                      height="24"
                      rx="6"
                      fill="#090d16"
                      stroke={isSelected ? '#38bdf8' : '#475569'}
                      strokeWidth="1.2"
                      className="shadow-md"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes Layer */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            if (!node) return null;
            const coord = nodeCoords.get(node.id);
            if (!coord || isNaN(coord.x) || isNaN(coord.y)) return null;

            const isContained = containedNodeIds.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const styles = getNodeColorStyles(node, isContained, isSelected);

            const isGroundZero = node.hop === 0;
            const nodeRadius = isGroundZero ? 25 : 19;

            return (
              <g
                key={node.id}
                transform={`translate(${coord.x}, ${coord.y})`}
              >
                {/* TIER 1: STATIC HITBOX - Never moves, scales, or transforms on hover */}
                <circle
                  cx={0}
                  cy={0}
                  r={nodeRadius + 14}
                  fill="transparent"
                  pointerEvents="all"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId((curr) => (curr === node.id ? null : curr))}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectNode(node);
                  }}
                />

                {/* TIER 2: VISUAL GROUP - Physics-safe brightness & drop-shadow */}
                <g
                  className="pointer-events-none"
                  style={{
                    filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))' : 'none',
                    transition: 'filter 150ms ease, opacity 140ms ease',
                  }}
                >
                  {/* Selection Halo Ring */}
                  {isSelected && (
                    <circle
                      cx={0}
                      cy={0}
                      r={nodeRadius + 9}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Outer Glow Ring */}
                  <circle
                    cx={0}
                    cy={0}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={styles.svgStroke}
                    strokeWidth="2"
                    opacity={isContained ? 0.3 : isHovered ? 0.95 : 0.5}
                  />

                  {/* Primary Node Badge Circle */}
                  <circle
                    cx={0}
                    cy={0}
                    r={nodeRadius}
                    fill={styles.svgFill}
                    stroke={styles.svgStroke}
                    strokeWidth={isSelected ? 2.5 : 1.8}
                  />

                  {/* Node Center Icon */}
                  <foreignObject
                    x={-nodeRadius}
                    y={-nodeRadius}
                    width={nodeRadius * 2}
                    height={nodeRadius * 2}
                    className="pointer-events-none"
                  >
                    <div
                      className={`w-full h-full flex items-center justify-center ${styles.text}`}
                    >
                      {isContained ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        getNodeIcon(node.type)
                      )}
                    </div>
                  </foreignObject>

                  {/* Status Indicator Badge (Top-Right) */}
                  <g transform={`translate(${nodeRadius - 4}, ${-nodeRadius + 4})`}>
                    {isContained ? (
                      <circle r="5" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                    ) : isGroundZero ? (
                      <circle
                        r="5.5"
                        fill="#ef4444"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    ) : (
                      <circle
                        r="5"
                        fill={styles.svgStroke}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>

                  {/* Risk Score Badge (Top-Left) */}
                  <g transform={`translate(${-nodeRadius + 4}, ${-nodeRadius + 4})`}>
                    <rect
                      x="-14"
                      y="-7"
                      width="22"
                      height="14"
                      rx="4"
                      fill="#090d16"
                      stroke={styles.svgStroke}
                      strokeWidth="1"
                    />
                    <text
                      x="-3"
                      y="3.5"
                      textAnchor="middle"
                      fill={styles.svgStroke}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="800"
                    >
                      {node.riskScore}
                    </text>
                  </g>
                </g>

                {/* TIER 3: STATIC LABEL PILL - Remains geometrically stable */}
                <g transform={`translate(0, ${nodeRadius + 14})`} pointerEvents="none">
                  <rect
                    x="-75"
                    y="-10"
                    width="150"
                    height="20"
                    rx="5"
                    fill="#070b14"
                    fillOpacity="0.9"
                    stroke={isSelected ? '#38bdf8' : isContained ? '#475569' : '#1e293b'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isContained ? '#94a3b8' : isSelected ? '#38bdf8' : isHovered ? '#38bdf8' : '#f1f5f9'}
                    fontSize="10"
                    fontWeight={isSelected || isGroundZero ? '700' : '600'}
                    letterSpacing="0.01em"
                  >
                    {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
                  </text>
                </g>

                {/* Role Sub-caption */}
                <g transform={`translate(0, ${nodeRadius + 30})`} pointerEvents="none">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={isContained ? '#64748b' : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="sans-serif"
                    fontWeight="500"
                  >
                    {isContained
                      ? '[CONTAINED / FROZEN]'
                      : node.role.length > 24
                        ? node.role.slice(0, 22) + '…'
                        : node.role}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
