import React from 'react';
import { 
  FolderPlus, 
  Users, 
  AlertTriangle, 
  FileText, 
  Network
} from 'lucide-react';

interface TopMetricsProps {
  onSelectMetric?: (metricId: string) => void;
}

export const TopMetrics: React.FC<TopMetricsProps> = ({ onSelectMetric }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. ACTIVE CASES */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('active_cases')}
        className="p-3 rounded-lg bg-[#061229] border border-[#12284c] flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0a224d] border border-blue-500/40 text-blue-400 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
              ACTIVE CASES
            </span>
            <div className="text-xl font-black text-white leading-tight">248</div>
            <span className="text-[10px] text-emerald-400 font-medium">↑ 12 this week</span>
          </div>
        </div>
      </div>

      {/* 2. HIGH RISK SUSPECTS */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('high_risk_suspects')}
        className="p-3 rounded-lg bg-[#140b25] border border-[#2b184a] flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#271347] border border-purple-500/40 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
              HIGH RISK SUSPECTS
            </span>
            <div className="text-xl font-black text-white leading-tight">91</div>
            <span className="text-[10px] text-rose-400 font-medium">↑ 8 this week</span>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL ALERTS */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('critical_alerts')}
        className="p-3 rounded-lg bg-[#1f0b12] border border-[#421625] flex items-center justify-between cursor-pointer hover:border-red-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#3d1222] border border-red-500/40 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
              CRITICAL ALERTS
            </span>
            <div className="text-xl font-black text-white leading-tight">12</div>
            <span className="text-[10px] text-amber-400 font-medium">3 Critical</span>
          </div>
        </div>
      </div>

      {/* 4. EVIDENCE FILES */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('evidence_files')}
        className="p-3 rounded-lg bg-[#061817] border border-[#113a36] flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0c312e] border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
              EVIDENCE FILES
            </span>
            <div className="text-xl font-black text-white leading-tight">1,246</div>
            <span className="text-[10px] text-emerald-400 font-medium">↑ 156 this week</span>
          </div>
        </div>
      </div>

      {/* 5. CONNECTED ENTITIES */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('connected_entities')}
        className="p-3 rounded-lg bg-[#07192b] border border-[#103b60] flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0c3254] border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
              CONNECTED ENTITIES
            </span>
            <div className="text-xl font-black text-white leading-tight">12,843</div>
            <span className="text-[10px] text-cyan-400 font-medium">↑ 1,342 this week</span>
          </div>
        </div>
      </div>

      {/* 6. OVERALL THREAT LEVEL */}
      <div 
        onClick={() => onSelectMetric && onSelectMetric('threat_level')}
        className="p-3 rounded-lg bg-[#1c0c14] border border-[#3e1728] flex flex-col justify-between cursor-pointer hover:border-red-500/50 transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">
            OVERALL THREAT LEVEL
          </span>
          <svg className="w-12 h-4 stroke-red-500 fill-none" viewBox="0 0 50 15">
            <path d="M0 12 L12 8 L22 13 L32 4 L42 10 L50 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="2" r="1.5" className="fill-red-500" />
          </svg>
        </div>

        <div className="my-1">
          <span className="text-xl font-black text-red-500 tracking-wide">
            HIGH
          </span>
        </div>

        {/* 10-step Segmented LED bar */}
        <div className="flex items-center gap-1 mt-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-sm ${
                step <= 7 ? 'bg-orange-500' : 'bg-[#2a1b24]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
