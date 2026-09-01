import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Move,
  MapPin,
  Car,
  AlertTriangle,
  Flame,
  Shield,
  Layers,
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight,
  Radio,
  Eye,
  Camera,
  Building2,
  Clock,
  Compass,
  X,
  Target,
  User,
  Activity,
  Share2,
  Download
} from 'lucide-react';

interface GeoIntelligencePageProps {
  onSelectAction?: (action: string) => void;
}

export const GeoIntelligencePage: React.FC<GeoIntelligencePageProps> = ({
  onSelectAction,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<'pointer' | 'network' | 'target'>('pointer');
  const [activeTimeRange, setActiveTimeRange] = useState<string>('Last 7 Days');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<string>('Lajpat Nagar');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Layer toggles
  const [layers, setLayers] = useState({
    crimeScenes: true,
    suspectMovements: true,
    highRiskAreas: true,
    safeLocations: true,
    cctvCameras: false,
    policeStations: false,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
    else if (type === 'out') setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
    else setZoomLevel(1);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            GEO INTELLIGENCE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Map of locations, movements and crime scenes
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-3 py-1.5 rounded-md bg-[#091124] border border-[#1b2b4e] text-xs font-medium text-slate-300 hover:text-white hover:border-blue-500/50 flex items-center gap-2 transition-all shadow-sm"
            >
              <span>{activeTimeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#070e1e] border border-[#1c3057] rounded-lg shadow-2xl p-1.5 z-50 text-xs">
                {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Custom Range'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setActiveTimeRange(range);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-600/20 hover:text-blue-300 transition-colors ${
                      activeTimeRange === range ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Picker Button */}
          <button
            onClick={() => onSelectAction?.('Custom Date Range Picker')}
            className="p-2 rounded-md bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white hover:border-blue-500/50 transition-all shadow-sm"
            title="Date Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>

      {/* ─── Top 5 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: CRIME SCENES */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-purple-500/40 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              CRIME SCENES
            </div>
            <div className="text-xl font-extrabold text-white">23</div>
            <div className="text-[11px] font-medium text-purple-400 flex items-center gap-1">
              <span>↑</span> 3 this week
            </div>
          </div>
        </div>

        {/* Card 2: SUSPECT MOVEMENTS */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-cyan-500/40 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              SUSPECT MOVEMENTS
            </div>
            <div className="text-xl font-extrabold text-white">128</div>
            <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              <span>↑</span> 16 this week
            </div>
          </div>
        </div>

        {/* Card 3: LOCATION OVERLAPS */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-amber-500/40 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              LOCATION OVERLAPS
            </div>
            <div className="text-xl font-extrabold text-white">15</div>
            <div className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
              <span>↑</span> 4 this week
            </div>
          </div>
        </div>

        {/* Card 4: HOTSPOTS IDENTIFIED */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-red-500/40 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              HOTSPOTS IDENTIFIED
            </div>
            <div className="text-xl font-extrabold text-red-500">7</div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1">
              <span>↑</span> 2 this week
            </div>
          </div>
        </div>

        {/* Card 5: HIGH RISK AREAS */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              HIGH RISK AREAS
            </div>
            <div className="text-xl font-extrabold text-emerald-400">5</div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <span>↑</span> 1 this week
            </div>
          </div>
        </div>
      </div>

      {/* ─── Middle Section: Interactive Map + Right Column (3 Cards) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Map View (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 rounded-lg bg-[#070e1f] border border-[#132342] flex flex-col relative overflow-hidden min-h-[500px] shadow-md">
          {/* Top Bar on Map */}
          <div className="p-3 border-b border-[#12203c] flex items-center justify-between z-20 bg-[#070e1f]/90 backdrop-blur-sm">
            {/* Top Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></span>
                <span>Crime Scenes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></span>
                <span>Suspect Movements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                <span>High Risk Areas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                <span>Safe Locations</span>
              </div>
            </div>

            <button
              onClick={() => onSelectAction?.('Expand Geo Map View')}
              className="text-slate-400 hover:text-slate-200"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Map Canvas with Satellite & Radial Grid */}
          <div className="flex-1 relative flex items-center justify-center p-4 cyber-grid-bg overflow-hidden select-none min-h-[420px]">
            {/* Left Toolbar */}
            <div className="absolute left-3 top-4 flex flex-col gap-1.5 z-30">
              <button
                onClick={() => setActiveTool('pointer')}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors shadow ${
                  activeTool === 'pointer'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                    : 'bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white'
                }`}
                title="Select Pointer"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTool('network')}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors shadow ${
                  activeTool === 'network'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                    : 'bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white'
                }`}
                title="Network Draw"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <div className="h-px bg-[#142340] my-0.5"></div>
              <button
                onClick={() => handleZoom('in')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom('reset')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Reset View"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectAction?.('Target Center')}
                className="w-7 h-7 rounded bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
                title="Center Hotspot"
              >
                <Target className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Radar / Geospatial Map Elements */}
            <div
              className="w-full h-full relative transition-transform duration-300 ease-out flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Radar Circles and Polar Grid lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Concentric Radar Rings centered at (50%, 48%) */}
                <circle
                  cx="50%"
                  cy="48%"
                  r="55"
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="rgba(239, 68, 68, 0.6)"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                <circle
                  cx="50%"
                  cy="48%"
                  r="110"
                  fill="rgba(239, 68, 68, 0.05)"
                  stroke="rgba(239, 68, 68, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="50%"
                  cy="48%"
                  r="170"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="1"
                />
                <circle
                  cx="50%"
                  cy="48%"
                  r="230"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.1)"
                  strokeWidth="1"
                />
                <circle
                  cx="50%"
                  cy="48%"
                  r="290"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.06)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Radial Grid lines */}
                <line
                  x1="50%"
                  y1="5%"
                  x2="50%"
                  y2="92%"
                  stroke="rgba(56, 189, 248, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1="5%"
                  y1="48%"
                  x2="95%"
                  y2="48%"
                  stroke="rgba(56, 189, 248, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1="18%"
                  y1="18%"
                  x2="82%"
                  y2="78%"
                  stroke="rgba(56, 189, 248, 0.08)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1="18%"
                  y1="78%"
                  x2="82%"
                  y2="18%"
                  stroke="rgba(56, 189, 248, 0.08)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Movement Route Trails between nodes */}
                {/* Karol Bagh (25%, 30%) to Connaught Place (50%, 25%) */}
                <line
                  x1="25%"
                  y1="30%"
                  x2="50%"
                  y2="25%"
                  stroke="rgba(245, 158, 11, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Connaught Place to Center Red Hotspot */}
                <line
                  x1="50%"
                  y1="25%"
                  x2="50%"
                  y2="48%"
                  stroke="rgba(59, 130, 246, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Center to Nehru Place (68%, 42%) */}
                <line
                  x1="50%"
                  y1="48%"
                  x2="68%"
                  y2="42%"
                  stroke="rgba(245, 158, 11, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Center to Lajpat Nagar (48%, 56%) */}
                <line
                  x1="50%"
                  y1="48%"
                  x2="48%"
                  y2="56%"
                  stroke="rgba(239, 68, 68, 0.8)"
                  strokeWidth="2"
                />
                {/* Lajpat Nagar to Saket (44%, 68%) */}
                <line
                  x1="48%"
                  y1="56%"
                  x2="44%"
                  y2="68%"
                  stroke="rgba(16, 185, 129, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Karol Bagh to Dwarka (23%, 58%) */}
                <line
                  x1="25%"
                  y1="30%"
                  x2="23%"
                  y2="58%"
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>

              {/* ─── MAP NODES & MARKERS ─── */}

              {/* CENTER RED HOTSPOT (Central Hub / High Risk Metro/Station) */}
              {layers.highRiskAreas && (
                <div
                  onClick={() => setSelectedZone('Lajpat Nagar')}
                  className="absolute top-[48%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-11 h-11 rounded-full bg-red-600/90 border-2 border-red-400 flex items-center justify-center text-white shadow-[0_0_24px_rgba(239,68,68,0.9)] group-hover:scale-110 transition-transform">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Node 1: Karol Bagh (Top Left: 25%, 30%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Karol Bagh')}
                  className="absolute top-[30%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">Karol Bagh</span>
                </div>
              )}

              {/* Node 2: Connaught Place (Top Center: 50%, 25%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Connaught Place')}
                  className="absolute top-[25%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">
                    Connaught Place
                  </span>
                </div>
              )}

              {/* Node 3: Nehru Place (Right: 68%, 42%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Nehru Place')}
                  className="absolute top-[42%] left-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">Nehru Place</span>
                </div>
              )}

              {/* Node 4: Lajpat Nagar (Center-Bottom: 48%, 56%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Lajpat Nagar')}
                  className="absolute top-[56%] left-[48%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">
                    Lajpat Nagar
                  </span>
                </div>
              )}

              {/* Node 5: Saket (Bottom: 44%, 68%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Saket')}
                  className="absolute top-[68%] left-[44%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">Saket</span>
                </div>
              )}

              {/* Node 6: Dwarka (Bottom Left: 23%, 58%) */}
              {layers.crimeScenes && (
                <div
                  onClick={() => setSelectedZone('Dwarka')}
                  className="absolute top-[58%] left-[23%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-200 mt-1">Dwarka</span>
                </div>
              )}

              {/* ─── MOVING CARS / SUSPECT MARKERS ─── */}
              {layers.suspectMovements && (
                <>
                  {/* Orange Car 1 (Karol Bagh -> Connaught Place) */}
                  <div className="absolute top-[34%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-amber-600/90 border border-amber-400 text-white shadow-[0_0_8px_#f59e0b] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Blue Car 2 (Connaught Place -> Center) */}
                  <div className="absolute top-[30%] left-[56%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-blue-600/90 border border-blue-400 text-white shadow-[0_0_8px_#3b82f6] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Green Safe Marker 1 */}
                  <div className="absolute top-[34%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-emerald-600/90 border border-emerald-400 text-white shadow-[0_0_8px_#10b981] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Orange Node / Escort */}
                  <div className="absolute top-[33%] left-[64%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-amber-600/90 border border-amber-400 text-white shadow-[0_0_8px_#f59e0b] z-10">
                    <Shield className="w-3 h-3" />
                  </div>

                  {/* Blue Car 3 (Center to Nehru) */}
                  <div className="absolute top-[40%] left-[58%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-blue-600/90 border border-blue-400 text-white shadow-[0_0_8px_#3b82f6] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Orange Car 4 */}
                  <div className="absolute top-[45%] left-[58%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-amber-600/90 border border-amber-400 text-white shadow-[0_0_8px_#f59e0b] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Green Safe Marker 2 */}
                  <div className="absolute top-[47%] left-[52%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-emerald-600/90 border border-emerald-400 text-white shadow-[0_0_8px_#10b981] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Blue Car 5 (Left area) */}
                  <div className="absolute top-[40%] left-[38%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-blue-600/90 border border-blue-400 text-white shadow-[0_0_8px_#3b82f6] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Green Safe Marker 3 (West) */}
                  <div className="absolute top-[42%] left-[27%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-emerald-600/90 border border-emerald-400 text-white shadow-[0_0_8px_#10b981] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Blue Car 6 (South-West) */}
                  <div className="absolute top-[48%] left-[37%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-blue-600/90 border border-blue-400 text-white shadow-[0_0_8px_#3b82f6] z-10">
                    <Car className="w-3 h-3" />
                  </div>

                  {/* Green Safe Marker 4 (South) */}
                  <div className="absolute top-[55%] left-[39%] transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-emerald-600/90 border border-emerald-400 text-white shadow-[0_0_8px_#10b981] z-10">
                    <Car className="w-3 h-3" />
                  </div>
                </>
              )}
            </div>

            {/* Bottom Left: Heatmap Intensity Scale */}
            <div className="absolute bottom-3 left-3 p-2.5 rounded-lg bg-[#060c1c]/90 border border-[#142340] backdrop-blur-md text-[10px] space-y-1 z-20 shadow-lg pointer-events-auto w-48">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Heatmap Intensity
              </div>
              <div className="h-2 w-full rounded bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 shadow-inner"></div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium pt-0.5">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Bottom Right: Map Layers Floating Widget */}
            <div className="absolute bottom-3 right-3 p-3 rounded-lg bg-[#060c1c]/90 border border-[#142340] backdrop-blur-md text-[10.5px] space-y-2 z-20 shadow-lg pointer-events-auto min-w-[150px]">
              <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Map Layers
              </div>
              <div className="space-y-1.5 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.crimeScenes}
                    onChange={() => toggleLayer('crimeScenes')}
                    className="rounded accent-purple-600 w-3.5 h-3.5"
                  />
                  <span>Crime Scenes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.suspectMovements}
                    onChange={() => toggleLayer('suspectMovements')}
                    className="rounded accent-blue-600 w-3.5 h-3.5"
                  />
                  <span>Suspect Movements</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.highRiskAreas}
                    onChange={() => toggleLayer('highRiskAreas')}
                    className="rounded accent-red-600 w-3.5 h-3.5"
                  />
                  <span>High Risk Areas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.safeLocations}
                    onChange={() => toggleLayer('safeLocations')}
                    className="rounded accent-emerald-500 w-3.5 h-3.5"
                  />
                  <span>Safe Locations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-400 text-slate-500">
                  <input
                    type="checkbox"
                    checked={layers.cctvCameras}
                    onChange={() => toggleLayer('cctvCameras')}
                    className="rounded accent-slate-600 w-3.5 h-3.5"
                  />
                  <span>CCTV Cameras</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-400 text-slate-500">
                  <input
                    type="checkbox"
                    checked={layers.policeStations}
                    onChange={() => toggleLayer('policeStations')}
                    className="rounded accent-slate-600 w-3.5 h-3.5"
                  />
                  <span>Police Stations</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Stacked Cards (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 justify-between">
          {/* Card 1: TOP LOCATIONS BY ACTIVITY */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                TOP LOCATIONS BY ACTIVITY
              </span>
              <button
                onClick={() => setActiveModal('top_locations')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {/* Row 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Lajpat Nagar</span>
                  <span className="text-slate-400 font-mono text-[10px]">12 Events</span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full w-[90%] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Karol Bagh</span>
                  <span className="text-slate-400 font-mono text-[10px]">9 Events</span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[70%] shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Connaught Place</span>
                  <span className="text-slate-400 font-mono text-[10px]">7 Events</span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[55%]"></div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Nehru Place</span>
                  <span className="text-slate-400 font-mono text-[10px]">6 Events</span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[45%]"></div>
                </div>
              </div>

              {/* Row 5 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Saket</span>
                  <span className="text-slate-400 font-mono text-[10px]">4 Events</span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[30%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: LOCATION OVERLAPS */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                LOCATION OVERLAPS
              </span>
              <button
                onClick={() => setActiveModal('overlaps')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
                    <Target className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">
                    Lajpat Nagar ↔ Karol Bagh
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  5 Overlaps
                </span>
              </div>

              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
                    <Target className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">
                    Karol Bagh ↔ Connaught Place
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  4 Overlaps
                </span>
              </div>

              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400">
                    <Target className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">
                    Lajpat Nagar ↔ Nehru Place
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  3 Overlaps
                </span>
              </div>

              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
                    <Target className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">
                    Saket ↔ Lajpat Nagar
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  3 Overlaps
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: SUSPECT MOVEMENT TIMELINE */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                SUSPECT MOVEMENT TIMELINE
              </span>
              <button
                onClick={() => setActiveModal('timeline')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View Full Timeline
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {/* Suspect 1 */}
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white text-[11px]">Aman Khan</span>
                    <span className="text-[9.5px] text-slate-400 ml-1.5">21 Aug, 08:30 PM</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-medium">
                  Karol Bagh → Lajpat Nagar
                </span>
              </div>

              {/* Suspect 2 */}
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white text-[11px]">Vikram J.</span>
                    <span className="text-[9.5px] text-slate-400 ml-1.5">21 Aug, 09:15 PM</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-medium">
                  Connaught Place → Karol Bagh
                </span>
              </div>

              {/* Suspect 3 */}
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white text-[11px]">Riya Singh</span>
                    <span className="text-[9.5px] text-slate-400 ml-1.5">21 Aug, 09:45 PM</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-medium">
                  Lajpat Nagar → Nehru Place
                </span>
              </div>

              {/* Suspect 4 */}
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white text-[11px]">Aman Khan</span>
                    <span className="text-[9.5px] text-slate-400 ml-1.5">22 Aug, 07:30 PM</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-medium">
                  Lajpat Nagar → Saket
                </span>
              </div>

              {/* Suspect 5 */}
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-950/90 border border-purple-500/70 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white text-[11px]">Vikram J.</span>
                    <span className="text-[9.5px] text-slate-400 ml-1.5">22 Aug, 08:10 PM</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-medium">
                  Saket → Connaught Place
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Area Risk Score + High Risk Zones + (Geo Alerts & CCTV Snapshots) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Bottom Left: AREA RISK SCORE Map Diagram (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              AREA RISK SCORE
            </span>
            <button
              onClick={() => onSelectAction?.('Area Risk Methodology')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View Methodology
            </button>
          </div>

          <div className="flex-1 flex items-center justify-between gap-3 pt-3">
            {/* Polygonal Voronoi Risk Map */}
            <div className="w-28 h-28 relative flex items-center justify-center shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Outer Green Region */}
                <path
                  d="M10,25 Q15,5 45,10 Q80,5 90,30 Q95,70 75,90 Q40,95 20,85 Q5,70 10,25 Z"
                  fill="#065f46"
                  stroke="#10b981"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Middle Orange Region */}
                <path
                  d="M25,35 Q35,20 60,25 Q75,35 70,65 Q55,80 35,75 Q20,65 25,35 Z"
                  fill="#9a3412"
                  stroke="#f97316"
                  strokeWidth="1"
                  opacity="0.85"
                />
                {/* Center Red Region */}
                <circle
                  cx="50"
                  cy="50"
                  r="16"
                  fill="#991b1b"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Center Hub icon */}
                <circle cx="50" cy="50" r="6" fill="#fca5a5" />
              </svg>
            </div>

            {/* Legend Breakdown */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                <div>
                  <div className="font-bold text-white text-[11px]">High Risk</div>
                  <div className="text-[10px] text-slate-400">5 Areas</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
                <div>
                  <div className="font-bold text-white text-[11px]">Medium Risk</div>
                  <div className="text-[10px] text-slate-400">11 Areas</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                <div>
                  <div className="font-bold text-white text-[11px]">Low Risk</div>
                  <div className="text-[10px] text-slate-400">9 Areas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Center: HIGH RISK ZONES Table (Spans 5 cols on lg) */}
        <div className="lg:col-span-5 rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              HIGH RISK ZONES
            </span>
            <button
              onClick={() => setActiveModal('high_risk_zones')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[9.5px] font-bold text-slate-500 uppercase border-b border-[#12203c]/60">
                  <th className="pb-1.5 font-semibold">ZONE</th>
                  <th className="pb-1.5 font-semibold text-center">RISK SCORE</th>
                  <th className="pb-1.5 font-semibold">REASON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101b33]">
                {/* Row 1 */}
                <tr
                  onClick={() => setSelectedZone('Lajpat Nagar')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-slate-200 font-medium">Lajpat Nagar</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 font-bold font-mono text-[10px]">
                      92 / 100
                    </span>
                  </td>
                  <td className="py-2 text-slate-400 text-[10.5px]">
                    High overlap, frequent movements
                  </td>
                </tr>

                {/* Row 2 */}
                <tr
                  onClick={() => setSelectedZone('Karol Bagh')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-slate-200 font-medium">Karol Bagh</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-400 font-bold font-mono text-[10px]">
                      78 / 100
                    </span>
                  </td>
                  <td className="py-2 text-slate-400 text-[10.5px]">
                    Multiple crime scenes, suspects
                  </td>
                </tr>

                {/* Row 3 */}
                <tr
                  onClick={() => setSelectedZone('Connaught Place')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-slate-200 font-medium">Connaught Place</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-400 font-bold font-mono text-[10px]">
                      63 / 100
                    </span>
                  </td>
                  <td className="py-2 text-slate-400 text-[10.5px]">
                    Financial activity concentration
                  </td>
                </tr>

                {/* Row 4 */}
                <tr
                  onClick={() => setSelectedZone('Nehru Place')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-slate-200 font-medium">Nehru Place</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-400 font-bold font-mono text-[10px]">
                      58 / 100
                    </span>
                  </td>
                  <td className="py-2 text-slate-400 text-[10.5px]">Movement overlap detected</td>
                </tr>

                {/* Row 5 */}
                <tr
                  onClick={() => setSelectedZone('Saket')}
                  className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-slate-200 font-medium">Saket</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-bold font-mono text-[10px]">
                      45 / 100
                    </span>
                  </td>
                  <td className="py-2 text-slate-400 text-[10.5px]">Watchlist movements</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Right: RECENT GEO ALERTS + CCTV SNAPSHOTS (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Top: RECENT GEO ALERTS */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                RECENT GEO ALERTS
              </span>
              <button
                onClick={() => setActiveModal('geo_alerts')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {/* Alert 1 */}
              <div className="flex items-start justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      High overlap detected
                    </div>
                    <div className="text-[9.5px] text-slate-400">Lajpat Nagar & Karol Bagh</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 shrink-0">10:31 PM</span>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      Suspect movement in hotspot
                    </div>
                    <div className="text-[9.5px] text-slate-400">Aman Khan in Karol Bagh</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 shrink-0">09:58 PM</span>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      New crime scene added
                    </div>
                    <div className="text-[9.5px] text-slate-400">Saket, Delhi</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-mono text-slate-400 shrink-0">08:45 PM</span>
              </div>
            </div>
          </div>

          {/* Bottom: CCTV SNAPSHOTS */}
          <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-3 flex flex-col shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase">
                CCTV SNAPSHOTS
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('cctv')}
                  className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline mr-1"
                >
                  View All
                </button>
                <button className="p-1 rounded bg-[#091124] border border-[#1b2b4e] text-slate-400 hover:text-white">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button className="p-1 rounded bg-[#091124] border border-[#1b2b4e] text-slate-400 hover:text-white">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3 CCTV Thumbnails */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px]">
              {/* Snapshot 1 */}
              <div
                onClick={() => setSelectedVideo('Lajpat Nagar - 21 Aug, 08:25 PM')}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video rounded bg-slate-900 border border-[#1b2b4e] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&auto=format&fit=crop&q=80"
                    alt="Lajpat Nagar CCTV"
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Play className="w-2.5 h-2.5 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-slate-200 mt-1 truncate">Lajpat Nagar</div>
                <div className="text-[8.5px] text-slate-400 font-mono">21 Aug, 08:25 PM</div>
              </div>

              {/* Snapshot 2 */}
              <div
                onClick={() => setSelectedVideo('Karol Bagh - 21 Aug, 09:10 PM')}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video rounded bg-slate-900 border border-[#1b2b4e] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=200&auto=format&fit=crop&q=80"
                    alt="Karol Bagh CCTV"
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Play className="w-2.5 h-2.5 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-slate-200 mt-1 truncate">Karol Bagh</div>
                <div className="text-[8.5px] text-slate-400 font-mono">21 Aug, 09:10 PM</div>
              </div>

              {/* Snapshot 3 */}
              <div
                onClick={() => setSelectedVideo('Connaught Place - 22 Aug, 07:45 PM')}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video rounded bg-slate-900 border border-[#1b2b4e] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80"
                    alt="Connaught Place CCTV"
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Play className="w-2.5 h-2.5 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-slate-200 mt-1 truncate">Connaught Place</div>
                <div className="text-[8.5px] text-slate-400 font-mono">22 Aug, 07:45 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Video Modal ─── */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#162747] pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">CCTV Surveillance Feed: {selectedVideo}</h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-800">
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                LIVE REC • CAM-04
              </div>
              <div className="text-center space-y-1">
                <Play className="w-10 h-10 text-cyan-400 mx-auto opacity-70" />
                <p className="text-xs text-slate-400">Footage synchronized with Central Police Feed</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
              >
                Close Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeModal === 'top_locations' && 'All Locations By Activity'}
                {activeModal === 'overlaps' && 'All Geospatial Location Overlaps'}
                {activeModal === 'timeline' && 'Full Suspect Movement Trajectory'}
                {activeModal === 'high_risk_zones' && 'High Risk Zone Dossiers'}
                {activeModal === 'geo_alerts' && 'All Geospatial Threat Alerts'}
                {activeModal === 'cctv' && 'All CCTV Camera Grid Feeds'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-[#050b18] rounded-lg border border-[#142340] text-xs text-slate-300 space-y-2">
              <p>
                All location triangulations and geospatial suspect traces are verified with cell tower logs, satellite telemetry, and ANPR license plate readers.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
