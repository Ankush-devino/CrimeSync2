import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Link2,
  Info,
  Car,
  Phone,
  Landmark,
  MapPin,
  User,
  ExternalLink
} from 'lucide-react';
import type { NetworkNode } from '../types/dashboard';

interface CriminalNetworkGraphProps {
  onSelectNode: (node: NetworkNode) => void;
  onExploreGraph: () => void;
}

export const CriminalNetworkGraph: React.FC<CriminalNetworkGraphProps> = ({
  onSelectNode,
  onExploreGraph,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);

  // Exact nodes from reference image
  const nodes = [
    {
      id: 'aman_khan',
      label: 'Aman Khan',
      sublabel: 'Risk Score: 92',
      category: 'Person',
      type: 'center',
      x: 50,
      y: 48,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      risk: 'HIGH' as const,
      riskScore: 92,
    },
    {
      id: 'phone_98765',
      label: '+91 98765 43210',
      category: 'Phone',
      type: 'phone',
      x: 51,
      y: 19,
      iconColor: 'bg-blue-600 border-blue-400 text-blue-100',
    },
    {
      id: 'rahul_sharma',
      label: 'Rahul Sharma',
      category: 'Person',
      type: 'person',
      x: 29,
      y: 28,
      iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
    },
    {
      id: 'ac_987654',
      label: 'AC987654',
      category: 'Account',
      type: 'account',
      x: 74,
      y: 28,
      iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
    },
    {
      id: 'veh_up32',
      label: 'UP32KY9911',
      category: 'Vehicle',
      type: 'vehicle',
      x: 22,
      y: 53,
      iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
    },
    {
      id: 'vikram_j',
      label: 'Vikram J.',
      sublabel: 'High Risk',
      category: 'Person',
      type: 'person',
      x: 80,
      y: 52,
      iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
      risk: 'HIGH' as const,
    },
    {
      id: 'riya_singh',
      label: 'Riya Singh',
      category: 'Person',
      type: 'person',
      x: 27,
      y: 76,
      iconColor: 'bg-purple-600 border-purple-400 text-purple-100',
    },
    {
      id: 'ac_455566',
      label: 'AC455566',
      category: 'Account',
      type: 'account',
      x: 41,
      y: 84,
      iconColor: 'bg-emerald-600 border-emerald-400 text-emerald-100',
    },
    {
      id: 'loc_lajpat',
      label: 'Lajpat Nagar',
      category: 'Location',
      type: 'location',
      x: 58,
      y: 84,
      iconColor: 'bg-cyan-600 border-cyan-400 text-cyan-100',
    },
    {
      id: 'veh_dl12',
      label: 'DL12AB1234',
      category: 'Vehicle',
      type: 'vehicle',
      x: 76,
      y: 74,
      iconColor: 'bg-amber-600 border-amber-400 text-amber-100',
    },
  ];

  // Connections from center and interconnections
  const edges = [
    { from: 'aman_khan', to: 'phone_98765', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'rahul_sharma', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'ac_987654', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'veh_up32', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'vikram_j', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'riya_singh', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'ac_455566', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'loc_lajpat', color: '#f59e0b', dash: '3 3' },
    { from: 'aman_khan', to: 'veh_dl12', color: '#f59e0b', dash: '3 3' },
    // Interconnections matching the image
    { from: 'phone_98765', to: 'rahul_sharma', color: '#1e3a5f', dash: '4 4' },
    { from: 'phone_98765', to: 'ac_987654', color: '#1e3a5f', dash: '4 4' },
    { from: 'rahul_sharma', to: 'veh_up32', color: '#1e3a5f', dash: '4 4' },
    { from: 'ac_987654', to: 'vikram_j', color: '#1e3a5f', dash: '4 4' },
    { from: 'veh_up32', to: 'riya_singh', color: '#1e3a5f', dash: '4 4' },
    { from: 'vikram_j', to: 'veh_dl12', color: '#1e3a5f', dash: '4 4' },
    { from: 'riya_singh', to: 'ac_455566', color: '#1e3a5f', dash: '4 4' },
    { from: 'veh_dl12', to: 'loc_lajpat', color: '#1e3a5f', dash: '4 4' },
  ];

  const categories = [
    { label: 'Person', color: '#a855f7' },
    { label: 'Phone', color: '#3b82f6' },
    { label: 'Vehicle', color: '#f59e0b' },
    { label: 'Account', color: '#10b981' },
    { label: 'Location', color: '#06b6d4' },
    { label: 'Organization', color: '#ec4899' },
    { label: 'Event', color: '#8b5cf6' },
    { label: 'Unknown', color: '#64748b' },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-3.5 h-3.5" />;
      case 'account':
        return <Landmark className="w-3.5 h-3.5" />;
      case 'vehicle':
        return <Car className="w-3.5 h-3.5" />;
      case 'location':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'person':
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full relative overflow-hidden shadow-xl">
      {/* Header & Legend */}
      <div className="p-3 border-b border-[#111e33]/80">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              LIVE CRIMINAL NETWORK SNAPSHOT
            </span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>

          <button 
            onClick={onExploreGraph}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <span>Expand Graph</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 overflow-x-auto text-[10px] text-slate-400 py-1 scrollbar-none">
          {categories.map((cat) => (
            <div 
              key={cat.label} 
              onClick={() => setSelectedLegend(selectedLegend === cat.label ? null : cat.label)}
              className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:text-slate-200"
            >
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: cat.color }}></span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Canvas */}
      <div className="relative flex-1 min-h-[300px] w-full overflow-hidden bg-[#030712]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-25"></div>

        {/* Right Floating Graph Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button 
            className="p-1.5 rounded bg-[#0b162c]/90 border border-[#1a3055] hover:border-slate-400 text-slate-300 hover:text-white transition-all shadow-md"
            title="Search Graph"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
            className="p-1.5 rounded bg-[#0b162c]/90 border border-[#1a3055] hover:border-slate-400 text-slate-300 hover:text-white transition-all shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.7))}
            className="p-1.5 rounded bg-[#0b162c]/90 border border-[#1a3055] hover:border-slate-400 text-slate-300 hover:text-white transition-all shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1.5 rounded bg-[#0b162c]/90 border border-[#1a3055] hover:border-slate-400 text-slate-300 hover:text-white transition-all shadow-md"
            title="Link Properties"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SVG Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {edges.map((edge, idx) => {
            const source = nodes.find((n) => n.id === edge.from);
            const target = nodes.find((n) => n.id === edge.to);
            if (!source || !target) return null;

            return (
              <line
                key={idx}
                x1={`${source.x}%`}
                y1={`${source.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke={edge.color}
                strokeWidth={edge.from === 'aman_khan' ? '1.5' : '1'}
                strokeDasharray={edge.dash}
                strokeOpacity={edge.from === 'aman_khan' ? '0.7' : '0.4'}
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div
          className="absolute inset-0 transition-transform duration-200 pointer-events-auto"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {nodes.map((node) => {
            if (node.type === 'center') {
              return (
                /* Central Aman Khan Node */
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node as any)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute cursor-pointer flex flex-col items-center z-10 group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer rings */}
                    <div className="absolute -inset-4 rounded-full border border-orange-500/30 animate-pulse"></div>
                    <div className="absolute -inset-2 rounded-full border border-red-500/50"></div>
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-orange-500 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] overflow-hidden">
                      <img
                        src={node.avatar}
                        alt={node.label}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Node Label badge */}
                  <div className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[#050b18]/95 border border-[#162744] text-center shadow-lg">
                    <span className="text-[11px] font-bold text-white block leading-tight">
                      {node.label}
                    </span>
                    <span className="text-[9.5px] font-semibold text-red-500 block leading-tight">
                      {node.sublabel}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              /* Surrounding Node */
              <div
                key={node.id}
                onClick={() => onSelectNode(node as any)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute cursor-pointer flex flex-col items-center z-10 group"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-transform group-hover:scale-110 ${node.iconColor}`}
                >
                  {renderIcon(node.type)}
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] font-medium text-slate-200 block leading-tight">
                    {node.label}
                  </span>
                  {node.sublabel && (
                    <span className="text-[8.5px] font-bold text-red-400 block leading-tight">
                      {node.sublabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="p-2.5 bg-[#040813] border-t border-[#111e33] grid grid-cols-6 text-center text-xs">
        <div className="border-r border-[#111e33]/80">
          <div className="text-[9px] font-bold text-slate-400 uppercase">NODES</div>
          <div className="text-sm font-bold text-white">1,203</div>
        </div>
        <div className="border-r border-[#111e33]/80">
          <div className="text-[9px] font-bold text-slate-400 uppercase">EDGES</div>
          <div className="text-sm font-bold text-white">2,846</div>
        </div>
        <div className="border-r border-[#111e33]/80">
          <div className="text-[9px] font-bold text-slate-400 uppercase">COMMUNITIES</div>
          <div className="text-sm font-bold text-red-500">8</div>
        </div>
        <div className="border-r border-[#111e33]/80">
          <div className="text-[9px] font-bold text-slate-400 uppercase">INTERMEDIARIES</div>
          <div className="text-sm font-bold text-amber-500">14</div>
        </div>
        <div className="border-r border-[#111e33]/80">
          <div className="text-[9px] font-bold text-slate-400 uppercase">DENSITY</div>
          <div className="text-sm font-bold text-white">0.038</div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase">CENTRALIZATION</div>
          <div className="text-sm font-bold text-white">0.78</div>
        </div>
      </div>
    </div>
  );
};
