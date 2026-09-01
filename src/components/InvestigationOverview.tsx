import React, { useState } from 'react';
import { ChevronDown, ArrowRight, TrendingUp } from 'lucide-react';
import { investigationStats } from '../data/mockData';

interface InvestigationOverviewProps {
  onViewAnalytics?: () => void;
}

export const InvestigationOverview: React.FC<InvestigationOverviewProps> = ({ onViewAnalytics }) => {
  const [timeRange, setTimeRange] = useState('This Week');

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
          INVESTIGATION OVERVIEW
        </span>
        <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white">
          <span>{timeRange}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Donut Progress & Metrics Grid */}
      <div className="grid grid-cols-12 gap-3 my-3 items-center">
        {/* Donut Progress */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Background circle */}
            <svg className="w-24 h-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#1e293b"
                strokeWidth="7"
                fill="none"
              />
              {/* Animated Glowing Cyan/Blue Arc */}
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="url(#cyanBlueGrad)"
                strokeWidth="7"
                fill="none"
                strokeDasharray="238.7"
                strokeDashoffset={238.7 - (238.7 * 73) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]"
              />
              <defs>
                <linearGradient id="cyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="60%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-white tracking-tight">73%</span>
            </div>
          </div>
          <span className="text-[10px] text-center text-slate-400 font-medium mt-1">
            AI Analysis Progress
          </span>
        </div>

        {/* Legend Metrics */}
        <div className="col-span-7 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-purple-500 shadow-[0_0_5px_#a855f7]"></span>
              <span>Data Ingested</span>
            </div>
            <span className="font-bold text-slate-200 text-xs font-mono">{investigationStats.dataIngested}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-cyan-400 shadow-[0_0_5px_#00f0ff]"></span>
              <span>Entities Extracted</span>
            </div>
            <span className="font-bold text-slate-200 text-xs font-mono">{investigationStats.entitiesExtracted}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-amber-500 shadow-[0_0_5px_#f59e0b]"></span>
              <span>Relationships Found</span>
            </div>
            <span className="font-bold text-slate-200 text-xs font-mono">{investigationStats.relationshipsFound}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-red-500 shadow-[0_0_5px_#ef4444]"></span>
              <span>Anomalies Detected</span>
            </div>
            <span className="font-bold text-slate-200 text-xs font-mono">{investigationStats.anomaliesDetected}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-pink-400 shadow-[0_0_5px_#f472b6]"></span>
              <span>Hypotheses Generated</span>
            </div>
            <span className="font-bold text-slate-200 text-xs font-mono">{investigationStats.hypothesesGenerated}</span>
          </div>
        </div>
      </div>

      {/* Mini Area Chart (21 Aug - 27 Aug) */}
      <div className="pt-2">
        <div className="relative h-14 w-full">
          <svg className="w-full h-full" viewBox="0 0 280 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid line */}
            <line x1="0" y1="50" x2="280" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="25" x2="280" y2="25" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* Filled Area */}
            <path
              d="M0 45 Q 40 38, 80 40 T 160 28 T 220 22 L 280 10 L 280 50 L 0 50 Z"
              fill="url(#purpleArea)"
            />

            {/* Glowing Line */}
            <path
              d="M0 45 Q 40 38, 80 40 T 160 28 T 220 22 L 280 10"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2"
              className="drop-shadow-[0_0_6px_#c084fc]"
            />

            {/* Spark points */}
            <circle cx="280" cy="10" r="3" fill="#c084fc" className="shadow-[0_0_8px_#c084fc]" />
          </svg>
        </div>

        {/* Date Labels */}
        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
          <span>21 Aug</span>
          <span>22 Aug</span>
          <span>23 Aug</span>
          <span>24 Aug</span>
          <span>25 Aug</span>
          <span>26 Aug</span>
          <span>27 Aug</span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2 text-center border-t border-slate-800/60 mt-2">
        <button
          onClick={onViewAnalytics}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>View Full Analytics</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
