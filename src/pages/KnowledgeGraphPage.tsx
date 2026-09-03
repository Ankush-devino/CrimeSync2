import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Crosshair, 
  MousePointer, 
  Plus, 
  Share2, 
  Download, 
  RotateCw, 
  ChevronDown, 
  ChevronUp, 
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
  Radio
} from 'lucide-react';
import { api } from '../services/api';

interface KnowledgeGraphPageProps {
  onSelectAction?: (action: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  category: 'Person' | 'Phone' | 'Vehicle' | 'Account' | 'Location' | 'Organization' | 'Event';
  type: string;
  x: number; // percentage in SVG canvas
  y: number;
  sublabel?: string;
  sublabel2?: string;
  riskScore?: number;
  riskLevel?: 'High' | 'Medium' | 'Low';
  avatar?: string;
  iconBg: string;
  edgeLabel?: string;
  edgeColor?: string;
  edgeDash?: string;
}

export const KnowledgeGraphPage: React.FC<KnowledgeGraphPageProps> = ({ onSelectAction }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'connect' | 'target'>('select');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('aman_khan');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [neo4jStats, setNeo4jStats] = useState<{ nodes: number; edges: number } | null>(null);

  useEffect(() => {
    async function loadNeo4jGraph() {
      try {
        const graphData = await api.knowledgeGraph.getFullGraph(50);
        if (graphData) {
          setNeo4jStats({
            nodes: graphData.total_nodes,
            edges: graphData.total_edges,
          });
        }
      } catch (err) {
        console.warn("Neo4j live sync:", err);
      }
    }
    loadNeo4jGraph();
  }, []);

  // Central Aman Khan and surrounding 10 nodes matching reference image
  const nodes: GraphNode[] = [
    {
      id: 'aman_khan',
      name: 'Aman Khan',
      category: 'Person',
      type: 'person',
      x: 48,
      y: 44,
      sublabel: 'Risk Score: 92',
      sublabel2: 'High Risk',
      riskScore: 92,
      riskLevel: 'High',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      iconBg: 'bg-red-600 border-red-500 text-white',
    },
    {
      id: 'phone_98765',
      name: '+91 98765 43210',
      category: 'Phone',
      type: 'phone',
      x: 48,
      y: 16,
      sublabel: '28 Calls',
      iconBg: 'bg-blue-600/90 border-blue-400 text-white',
      edgeLabel: 'Uses',
      edgeColor: '#3b82f6',
      edgeDash: '3 3',
    },
    {
      id: 'rahul_sharma',
      name: 'Rahul Sharma',
      category: 'Person',
      type: 'person',
      x: 27,
      y: 20,
      sublabel: '28 Calls',
      iconBg: 'bg-purple-600/90 border-purple-400 text-white',
      edgeLabel: 'Communication',
      edgeColor: '#c084fc',
      edgeDash: '4 4',
    },
    {
      id: 'vikram_j',
      name: 'Vikram J.',
      category: 'Person',
      type: 'person',
      x: 72,
      y: 20,
      sublabel: '18 Calls',
      iconBg: 'bg-purple-600/90 border-purple-400 text-white',
      edgeLabel: 'Communication',
      edgeColor: '#c084fc',
      edgeDash: '4 4',
    },
    {
      id: 'ac_987654',
      name: 'AC987654',
      category: 'Account',
      type: 'account',
      x: 78,
      y: 43,
      sublabel: 'Bank Account',
      sublabel2: '₹4,20,000',
      iconBg: 'bg-emerald-600/90 border-emerald-400 text-white',
      edgeLabel: 'Transactions (6)',
      edgeColor: '#10b981',
      edgeDash: '3 3',
    },
    {
      id: 'ac_455566',
      name: 'AC455566',
      category: 'Account',
      type: 'account',
      x: 73,
      y: 68,
      sublabel: 'Bank Account',
      sublabel2: '₹1,15,000',
      iconBg: 'bg-emerald-600/90 border-emerald-400 text-white',
      edgeLabel: 'Transactions (4)',
      edgeColor: '#10b981',
      edgeDash: '3 3',
    },
    {
      id: 'loc_karol_bagh',
      name: 'Karol Bagh',
      category: 'Location',
      type: 'location',
      x: 60,
      y: 78,
      sublabel: 'Location',
      sublabel2: '3 Events',
      iconBg: 'bg-cyan-600/90 border-cyan-400 text-white',
      edgeLabel: 'Visited',
      edgeColor: '#06b6d4',
      edgeDash: '3 3',
    },
    {
      id: 'org_shakti',
      name: 'Shakti Transport Pvt. Ltd.',
      category: 'Organization',
      type: 'organization',
      x: 48,
      y: 84,
      sublabel: 'Organization',
      iconBg: 'bg-pink-600/90 border-pink-400 text-white',
      edgeLabel: 'Associated',
      edgeColor: '#f43f5e',
      edgeDash: '4 4',
    },
    {
      id: 'loc_lajpat',
      name: 'Lajpat Nagar',
      category: 'Location',
      type: 'location',
      x: 35,
      y: 78,
      sublabel: 'Location',
      sublabel2: '2 Events',
      iconBg: 'bg-cyan-600/90 border-cyan-400 text-white',
      edgeLabel: 'Visited',
      edgeColor: '#06b6d4',
      edgeDash: '3 3',
    },
    {
      id: 'veh_dl12',
      name: 'DL12AB1234',
      category: 'Vehicle',
      type: 'vehicle',
      x: 24,
      y: 65,
      sublabel: 'Vehicle',
      sublabel2: '3 Sightings',
      iconBg: 'bg-amber-600/90 border-amber-400 text-white',
      edgeLabel: 'Associated',
      edgeColor: '#f59e0b',
      edgeDash: '4 4',
    },
    {
      id: 'phone_91234',
      name: '+91 91234 56789',
      category: 'Phone',
      type: 'phone',
      x: 21,
      y: 43,
      sublabel: '15 Calls',
      iconBg: 'bg-blue-600/90 border-blue-400 text-white',
      edgeLabel: 'Uses',
      edgeColor: '#3b82f6',
      edgeDash: '3 3',
    },
  ];

  const filterCategories = [
    { label: 'Person', color: '#a855f7', icon: <User className="w-3 h-3 text-purple-400" /> },
    { label: 'Phone', color: '#3b82f6', icon: <Phone className="w-3 h-3 text-blue-400" /> },
    { label: 'Vehicle', color: '#f59e0b', icon: <Car className="w-3 h-3 text-amber-400" /> },
    { label: 'Account', color: '#10b981', icon: <Landmark className="w-3 h-3 text-emerald-400" /> },
    { label: 'Location', color: '#06b6d4', icon: <MapPin className="w-3 h-3 text-cyan-400" /> },
    { label: 'Organization', color: '#f43f5e', icon: <Building2 className="w-3 h-3 text-pink-400" /> },
    { label: 'Event', color: '#8b5cf6', icon: <Calendar className="w-3 h-3 text-violet-400" /> },
  ];

  const recentActivities = [
    {
      time: '27 Aug 2026, 10:31 PM',
      type: 'Communication',
      typeIcon: <Phone className="w-3 h-3 text-purple-400" />,
      details: 'Call between Aman Khan & Vikram J.',
      entities: 'Aman Khan, Vikram J.',
    },
    {
      time: '27 Aug 2026, 09:58 PM',
      type: 'Financial Transaction',
      typeIcon: <Landmark className="w-3 h-3 text-emerald-400" />,
      details: '₹1,50,000 transferred to AC987654',
      entities: 'Aman Khan, AC987654',
    },
    {
      time: '27 Aug 2026, 09:21 PM',
      type: 'Visited',
      typeIcon: <MapPin className="w-3 h-3 text-cyan-400" />,
      details: 'Location overlap at Karol Bagh',
      entities: 'Aman Khan, Karol Bagh',
    },
    {
      time: '27 Aug 2026, 08:45 PM',
      type: 'Vehicle Sighted',
      typeIcon: <Car className="w-3 h-3 text-amber-400" />,
      details: 'Vehicle DL12AB1234 near Crime Scene 1',
      entities: 'Aman Khan, DL12AB1234',
    },
    {
      time: '27 Aug 2026, 07:12 PM',
      type: 'Association',
      typeIcon: <Building2 className="w-3 h-3 text-pink-400" />,
      details: 'Associated with Shakti Transport Pvt. Ltd.',
      entities: 'Aman Khan, Shakti Transport',
    },
  ];

  const relationshipTypes = [
    { label: 'Communication', count: 42, color: '#a855f7' },
    { label: 'Financial Transaction', count: 22, color: '#10b981' },
    { label: 'Association', count: 18, color: '#f43f5e' },
    { label: 'Visited', count: 15, color: '#06b6d4' },
    { label: 'Ownership', count: 9, color: '#f59e0b' },
    { label: 'Used', count: 8, color: '#3b82f6' },
    { label: 'Other', count: 6, color: '#64748b' },
  ];

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      if (onSelectAction) onSelectAction('Centrality & Network Metrics Recalculated');
    }, 800);
  };

  const renderNodeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'account':
        return <Landmark className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'vehicle':
        return <Car className="w-4 h-4" />;
      case 'organization':
        return <Building2 className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'person':
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const selectedEntity = nodes.find((n) => n.id === selectedEntityId) || nodes[0];

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      {/* Top Knowledge Graph Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111e33]">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">
              KNOWLEDGE GRAPH
            </h1>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>
          <p className="text-[10px] text-slate-400">
            Explore entities and relationships in the criminal network
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Neo4j Live AuraDB Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Neo4j AuraDB: {neo4jStats ? `${neo4jStats.nodes} Nodes / ${neo4jStats.edges} Edges` : 'Connected'}</span>
          </div>

          {/* Auto Layout dropdown */}
          <button 
            onClick={() => onSelectAction && onSelectAction('Layout Algorithm Changed to Force-Directed')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 transition-colors"
          >
            <span>Auto Layout</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Fullscreen icon */}
          <button 
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Export Graph button */}
          <button 
            onClick={() => onSelectAction && onSelectAction('Exporting Graph JSON / Gephi')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>Export Graph</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Grid: Center Graph (8 cols) + Right Entity Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 pt-3 overflow-hidden">
        {/* Left 8 Cols: Graph Area + Bottom Cards */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0 overflow-y-auto pr-0.5">
          {/* Main Graph Card */}
          <div className="rounded-xl bg-[#050b18] border border-[#111e33] flex flex-col relative overflow-hidden shadow-xl min-h-[440px]">
            {/* Filter Pills Toolbar */}
            <div className="px-3 py-2 border-b border-[#111e33] flex items-center justify-between bg-[#040813] text-xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#091224] border border-[#162744] text-[11px] text-slate-300 font-medium whitespace-nowrap">
                  <span>Entity Types</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

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
              </div>

              <button 
                onClick={() => onSelectAction && onSelectAction('Open Advanced Graph Filters')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#091224] border border-[#162744] text-[10.5px] text-slate-400 hover:text-white whitespace-nowrap ml-2"
              >
                <Filter className="w-3 h-3 text-slate-400" />
                <span>More Filters</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 min-h-[380px] bg-[#020612] overflow-hidden">
              {/* Subtle background grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-30"></div>

              {/* Left Floating Toolbar */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`p-2 rounded-lg border transition-all ${
                    activeTool === 'select'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : 'bg-[#081224]/90 text-slate-400 hover:text-white border-[#162744]'
                  }`}
                  title="Select / Move"
                >
                  <MousePointer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTool('connect')}
                  className={`p-2 rounded-lg border transition-all ${
                    activeTool === 'connect'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : 'bg-[#081224]/90 text-slate-400 hover:text-white border-[#162744]'
                  }`}
                  title="Connect Entities"
                >
                  <Network className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
                  className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744] transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.7))}
                  className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744] transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-lg bg-[#081224]/90 text-slate-400 hover:text-white border border-[#162744] transition-all"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTool('target')}
                  className={`p-2 rounded-lg border transition-all ${
                    activeTool === 'target'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : 'bg-[#081224]/90 text-slate-400 hover:text-white border-[#162744]'
                  }`}
                  title="Focus Central Node"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Minimap Box (Bottom Right) */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-[#050b18]/90 border border-[#162744] rounded-lg p-1.5 z-20 shadow-xl backdrop-blur-md">
                <div className="relative w-full h-full border border-blue-500/20 rounded">
                  {/* Miniature node dots matching graph */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]"></div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                  <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
              </div>

              {/* SVG Edges & Labels */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                {nodes.slice(1).map((node, idx) => {
                  const center = nodes[0];
                  const midX = (center.x + node.x) / 2;
                  const midY = (center.y + node.y) / 2;

                  return (
                    <g key={idx}>
                      <line
                        x1={`${center.x}%`}
                        y1={`${center.y}%`}
                        x2={`${node.x}%`}
                        y2={`${node.y}%`}
                        stroke={node.edgeColor || '#38bdf8'}
                        strokeWidth="1.5"
                        strokeDasharray={node.edgeDash || '3 3'}
                        strokeOpacity="0.75"
                      />
                      {/* Edge text label */}
                      {node.edgeLabel && (
                        <text
                          x={`${midX}%`}
                          y={`${midY}%`}
                          fill={node.edgeColor || '#94a3b8'}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          dy="-4"
                          className="select-none font-mono"
                        >
                          {node.edgeLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Graph Nodes Layer */}
              <div
                className="absolute inset-0 transition-transform duration-200 pointer-events-auto"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                {nodes.map((node) => {
                  const isCenter = node.id === 'aman_khan';
                  const isSelected = selectedEntityId === node.id;
                  const isFiltered = activeFilter && node.category !== activeFilter && !isCenter;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedEntityId(node.id)}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                        opacity: isFiltered ? 0.3 : 1,
                      }}
                      className="absolute cursor-pointer flex flex-col items-center group z-10 transition-all"
                    >
                      {isCenter ? (
                        /* Center Node: Aman Khan */
                        <div className="relative flex flex-col items-center">
                          <div className="relative flex items-center justify-center">
                            {/* Glowing pulsating radar rings */}
                            <div className="absolute -inset-4 rounded-full border border-orange-500/30 animate-pulse"></div>
                            <div className="absolute -inset-2 rounded-full border border-red-500/60"></div>
                            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-orange-500 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] overflow-hidden">
                              <img
                                src={node.avatar}
                                alt={node.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                          </div>

                          <div className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[#050b18]/95 border border-[#162744] text-center shadow-lg backdrop-blur-sm">
                            <span className="text-[11px] font-bold text-white block leading-tight">
                              {node.name}
                            </span>
                            <span className="text-[9.5px] font-bold text-red-500 block leading-tight">
                              {node.sublabel}
                            </span>
                            <span className="text-[8.5px] font-semibold text-red-400 block leading-tight">
                              {node.sublabel2}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Orbiting Nodes */
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-md transition-transform group-hover:scale-110 ${
                              node.iconBg
                            } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                          >
                            {renderNodeIcon(node.type)}
                          </div>
                          <div className="mt-1 text-center bg-[#050b18]/80 px-1.5 py-0.5 rounded border border-[#111e33] backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-slate-200 block leading-tight whitespace-nowrap">
                              {node.name}
                            </span>
                            {node.sublabel && (
                              <span className="text-[8.5px] text-slate-400 block leading-tight whitespace-nowrap">
                                {node.sublabel}
                              </span>
                            )}
                            {node.sublabel2 && (
                              <span className="text-[8.5px] text-emerald-400 font-semibold block leading-tight whitespace-nowrap">
                                {node.sublabel2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Grid: RELATIONSHIP TYPES (4 cols) + RECENT ACTIVITIES (8 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* RELATIONSHIP TYPES Card (4 cols) */}
            <div className="md:col-span-4 p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    RELATIONSHIP TYPES
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <button 
                  onClick={() => onSelectAction && onSelectAction('View All Relationship Types')}
                  className="text-[10.5px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 my-2 text-xs">
                {relationshipTypes.map((rel) => (
                  <div key={rel.label} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: rel.color }}></span>
                      <span className="text-slate-300">{rel.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">{rel.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITIES Card (8 cols) */}
            <div className="md:col-span-8 p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  RECENT ACTIVITIES
                </span>
                <button 
                  onClick={() => onSelectAction && onSelectAction('View Full Activity Log')}
                  className="text-[10.5px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All
                </button>
              </div>

              {/* Table headers */}
              <div className="grid grid-cols-12 text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-1.5 pb-1 border-b border-[#111e33]/50">
                <div className="col-span-3">TIME</div>
                <div className="col-span-3">TYPE</div>
                <div className="col-span-3">DETAILS</div>
                <div className="col-span-3">ENTITIES</div>
              </div>

              {/* Activity rows */}
              <div className="space-y-1.5 my-1.5 text-xs">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center px-1 py-1 hover:bg-[#0c1830] rounded transition-colors text-[10.5px]">
                    <div className="col-span-3 text-slate-400 font-mono text-[9.5px]">
                      {act.time}
                    </div>
                    <div className="col-span-3 flex items-center gap-1.5 text-slate-200 truncate">
                      {act.typeIcon}
                      <span className="truncate">{act.type}</span>
                    </div>
                    <div className="col-span-3 text-slate-300 truncate">
                      {act.details}
                    </div>
                    <div className="col-span-3 text-slate-400 truncate text-[10px]">
                      {act.entities}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Entity Details + Centrality + Top Relationships + Statistics */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Card 1: ENTITY DETAILS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ENTITY DETAILS
              </span>
              <ChevronUp className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Entity Header Profile */}
            <div className="flex items-center gap-3 my-2.5">
              <img
                src={selectedEntity.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={selectedEntity.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-red-500/70 shadow-md"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white leading-tight">
                    {selectedEntity.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-red-950/70 border border-red-500/50 text-[8.5px] font-bold text-red-400">
                    High Risk
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">Key Coordinator</span>
              </div>
            </div>

            {/* Metadata attributes list */}
            <div className="space-y-1.5 text-xs text-[11px] pt-1 border-t border-[#111e33]/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role</span>
                <span className="font-semibold text-slate-200">Key Coordinator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Entity Type</span>
                <span className="font-semibold text-slate-200">Person</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Score</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-red-500">92 / 100</span>
                  <div className="w-16 h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[92%] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone Numbers</span>
                <span className="font-mono font-semibold text-slate-200">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Accounts</span>
                <span className="font-mono font-semibold text-slate-200">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vehicles</span>
                <span className="font-mono font-semibold text-slate-200">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Locations Visited</span>
                <span className="font-mono font-semibold text-slate-200">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">First Seen</span>
                <span className="font-mono font-semibold text-slate-200">12 May 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Seen</span>
                <span className="font-mono font-semibold text-slate-200">27 Aug 2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: CENTRALITY SCORES */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CENTRALITY SCORES
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2 mt-2.5 text-[11px]">
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Degree Centrality</span>
                  <span className="font-mono font-bold text-red-400">0.86</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[86%] rounded-full shadow-[0_0_6px_#ef4444]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Betweenness Centrality</span>
                  <span className="font-mono font-bold text-amber-400">0.78</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[78%] rounded-full shadow-[0_0_6px_#f59e0b]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Closeness Centrality</span>
                  <span className="font-mono font-bold text-blue-400">0.73</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[73%] rounded-full shadow-[0_0_6px_#3b82f6]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Eigenvector Centrality</span>
                  <span className="font-mono font-bold text-emerald-400">0.69</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[69%] rounded-full shadow-[0_0_6px_#10b981]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: TOP RELATIONSHIPS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  TOP RELATIONSHIPS
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button 
                onClick={() => onSelectAction && onSelectAction('View All Relationships')}
                className="text-[10.5px] text-blue-400 hover:text-blue-300 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-1.5 mt-2.5 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded bg-[#081224] border border-[#142646]">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-200 font-medium text-[11px]">Rahul Sharma</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">28 Calls</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[#081224] border border-[#142646]">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-200 font-medium text-[11px]">Vikram J.</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">18 Calls</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[#081224] border border-[#142646]">
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200 font-medium text-[11px]">AC987654</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">6 Transactions</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[#081224] border border-[#142646]">
                <div className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-200 font-medium text-[11px]">DL12AB1234</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">3 Sightings</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[#081224] border border-[#142646]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-200 font-medium text-[11px]">+91 98765 43210</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400">28 Calls</span>
              </div>
            </div>
          </div>

          {/* Card 4: GRAPH STATISTICS & Recalculate Button */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block pb-2 border-b border-[#111e33]">
              GRAPH STATISTICS
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Entities</span>
                <span className="font-mono font-bold text-white">1,203</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Relationships</span>
                <span className="font-mono font-bold text-white">2,846</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connected Components</span>
                <span className="font-mono font-bold text-red-400">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Degree</span>
                <span className="font-mono font-bold text-white">4.72</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network Density</span>
                <span className="font-mono font-bold text-white">0.038</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#111e33]/80">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-mono text-slate-300 text-[10px]">27 Aug 2026, 10:40 PM</span>
              </div>
            </div>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Recalculating Metrics...' : 'Recalculate Metrics'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
