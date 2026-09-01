import React, { useState } from 'react';
import { ChevronDown, MapPin, Navigation, ArrowRight, Car, AlertCircle } from 'lucide-react';

interface GeoIntelligenceProps {
  onOpenGeo?: () => void;
}

export const GeoIntelligence: React.FC<GeoIntelligenceProps> = ({ onOpenGeo }) => {
  const [range, setRange] = useState('Last 7 Days');

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
          GEO INTELLIGENCE OVERVIEW
        </span>
        <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white">
          <span>{range}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Dark Map Canvas with Routes & Crime Scene Pin */}
      <div className="relative flex-1 min-h-[160px] w-full my-2 bg-[#050811] rounded-lg border border-slate-900 overflow-hidden">
        {/* Street Road Grid Matrix */}
        <svg className="w-full h-full" viewBox="0 0 320 180">
          <defs>
            <linearGradient id="routeCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="routeRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Street lines */}
          <path d="M 0 40 L 320 40 M 0 90 L 320 90 M 0 140 L 320 140" stroke="#131d33" strokeWidth="2" />
          <path d="M 60 0 L 60 180 M 140 0 L 140 180 M 220 0 L 220 180 M 280 0 L 280 180" stroke="#131d33" strokeWidth="2" />
          <path d="M 0 170 L 140 40 L 320 120" stroke="#1e2d4d" strokeWidth="3" />

          {/* Active Tracked Suspect Route (Glowing Line) */}
          <path
            d="M 20 150 Q 80 120, 140 90 T 210 110 T 290 60"
            fill="none"
            stroke="url(#routeRed)"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
          />

          <path
            d="M 50 30 Q 110 50, 180 85 T 260 140"
            fill="none"
            stroke="url(#routeCyan)"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Waypoint Nodes */}
          <circle cx="20" cy="150" r="4" fill="#f59e0b" />
          <circle cx="140" cy="90" r="4" fill="#ef4444" className="animate-ping" />
          <circle cx="140" cy="90" r="4" fill="#ef4444" />
          <circle cx="210" cy="110" r="4" fill="#ef4444" />
          <circle cx="265" cy="110" r="4" fill="#ef4444" />
          <circle cx="290" cy="60" r="4" fill="#38bdf8" />
        </svg>

        {/* Floating Crime Scene 1 Callout Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c1426]/95 border border-red-500/60 rounded-lg p-2 shadow-2xl backdrop-blur-md z-20 min-w-[150px]">
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="p-0.5 rounded bg-red-500/20 border border-red-500/40">
              <MapPin className="w-3 h-3" />
            </span>
            <span className="text-xs font-bold text-white leading-none">Crime Scene 1</span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">Lajpat Nagar</p>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
            <span>08:25 PM</span>
            <span className="text-red-400 font-semibold">3 Related Events</span>
          </div>
        </div>
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
        <div className="p-1.5 rounded bg-[#070c18] border border-slate-800">
          <span className="text-[9px] text-slate-400 block leading-tight">Unique Locations</span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-sm font-bold text-white font-mono">128</span>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 15%</span>
          </div>
        </div>

        <div className="p-1.5 rounded bg-[#070c18] border border-slate-800">
          <span className="text-[9px] text-slate-400 block leading-tight">Route Overlaps</span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-sm font-bold text-white font-mono">32</span>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 8%</span>
          </div>
        </div>

        <div className="p-1.5 rounded bg-[#070c18] border border-slate-800">
          <span className="text-[9px] text-slate-400 block leading-tight">Hotspot Score</span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-sm font-bold text-white font-mono">87</span>
            <span className="text-[10px] text-red-400 font-semibold">High</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-right border-t border-slate-800/60 mt-1">
        <button
          onClick={onOpenGeo}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>Open Geo Intelligence</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
