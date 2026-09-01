import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, Crosshair, MapPin } from 'lucide-react';

interface ThreatHeatmapProps {
  onZoom?: (direction: 'in' | 'out') => void;
}

export const ThreatHeatmap: React.FC<ThreatHeatmapProps> = () => {
  const [region, setRegion] = useState('India');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const hotspots = [
    { id: 'delhi', name: 'National Capital Region', x: 38, y: 32, intensity: 'High', alerts: 48, radius: 12 },
    { id: 'mumbai', name: 'Mumbai Financial Hub', x: 28, y: 56, intensity: 'High', alerts: 39, radius: 10 },
    { id: 'kolkata', name: 'Kolkata East Corridor', x: 74, y: 48, intensity: 'Medium', alerts: 21, radius: 8 },
    { id: 'bengaluru', name: 'Bengaluru Tech Corridor', x: 42, y: 76, intensity: 'Medium', alerts: 18, radius: 8 },
    { id: 'hyderabad', name: 'Hyderabad Cyber Zone', x: 46, y: 62, intensity: 'Medium', alerts: 14, radius: 7 },
    { id: 'punjab', name: 'Punjab Border Sector', x: 32, y: 22, intensity: 'High', alerts: 32, radius: 9 },
    { id: 'ahmedabad', name: 'Gujarat Industrial Belt', x: 24, y: 45, intensity: 'Low', alerts: 9, radius: 6 },
    { id: 'chennai', name: 'Chennai Coastal Transit', x: 50, y: 82, intensity: 'Low', alerts: 7, radius: 5 },
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
            THREAT HEATMAP
          </span>
          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">(Last 7 Days)</span>
        </div>

        <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white">
          <span>{region}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Map Interactive Area */}
      <div className="relative flex-1 min-h-[220px] w-full my-2 bg-[#050811] rounded-lg border border-slate-900 overflow-hidden flex items-center justify-center">
        {/* Vector India Map Outline */}
        <svg
          viewBox="0 0 400 480"
          className="w-full h-full p-2 transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <radialGradient id="heatGlowRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heatGlowAmber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* India Boundary SVG Path (Stylized Cyber Polygon) */}
          <path
            d="M 140 40 
               L 180 30 L 210 60 L 230 90 L 220 120 L 260 125 L 310 130 L 350 140 L 365 170 L 330 180 L 290 190 
               L 280 230 L 290 270 L 260 300 L 220 340 L 200 400 L 190 440 L 180 440 L 160 390 L 130 320 
               L 100 270 L 80 230 L 90 180 L 80 150 L 110 120 L 130 80 Z"
            fill="#091122"
            stroke="#1e3a8a"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="filter drop-shadow-[0_0_12px_rgba(30,58,138,0.4)]"
          />

          {/* Inter-state corridor connecting lines */}
          <line x1="152" y1="153" x2="112" y2="268" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="152" y1="153" x2="296" y2="230" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <line x1="112" y1="268" x2="168" y2="364" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="152" y1="153" x2="128" y2="105" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
          <line x1="168" y1="364" x2="184" y2="297" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
          <line x1="184" y1="297" x2="200" y2="393" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

          {/* Render glowing hotspot circles */}
          {hotspots.map((spot) => {
            const cx = (spot.x / 100) * 400;
            const cy = (spot.y / 100) * 480;
            const isHigh = spot.intensity === 'High';

            return (
              <g
                key={spot.id}
                className="cursor-pointer"
                onMouseEnter={() => setActiveCity(spot.name)}
                onMouseLeave={() => setActiveCity(null)}
              >
                {/* Outer Glow */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={spot.radius * 2.5}
                  fill={isHigh ? 'url(#heatGlowRed)' : 'url(#heatGlowAmber)'}
                  className="animate-pulse"
                />

                {/* Core point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHigh ? 4 : 3}
                  fill={isHigh ? '#ef4444' : '#f59e0b'}
                  className="drop-shadow-[0_0_6px_#ef4444]"
                />

                {/* Center dot */}
                <circle cx={cx} cy={cy} r="1.5" fill="#ffffff" />
              </g>
            );
          })}
        </svg>

        {/* Floating Map Zoom/Pan Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
            className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
            className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-lg"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-lg"
          >
            <Crosshair className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

        {/* Tooltip */}
        {activeCity && (
          <div className="absolute bottom-3 left-3 z-30 bg-[#0d1627]/95 border border-cyan-500/40 rounded px-2.5 py-1 text-xs text-white shadow-xl backdrop-blur-sm pointer-events-none">
            <span className="font-bold text-cyan-400">{activeCity}</span>
            <span className="text-[10px] text-slate-300 ml-2">Active Surveillance Cluster</span>
          </div>
        )}

        {/* Legend Vertical Bar on Right */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1 z-20 bg-slate-950/80 p-1.5 rounded border border-slate-800">
          <span className="text-[9px] font-bold text-red-400">High</span>
          <div className="w-2 h-20 rounded-full bg-gradient-to-b from-red-500 via-amber-500 to-blue-500 shadow-inner"></div>
          <span className="text-[9px] font-bold text-blue-400">Low</span>
        </div>
      </div>
    </div>
  );
};
