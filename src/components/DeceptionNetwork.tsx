import React from 'react';
import { ShieldAlert, ArrowRight, Radio } from 'lucide-react';
import { honeyTriggers } from '../data/mockData';

interface DeceptionNetworkProps {
  onViewDeception?: () => void;
}

export const DeceptionNetwork: React.FC<DeceptionNetworkProps> = ({ onViewDeception }) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase block">
            DECEPTION NETWORK STATUS
          </span>
          <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Honey Evidence Deployed
          </span>
        </div>
      </div>

      {/* Radar Scanner & Trigger Log Split */}
      <div className="grid grid-cols-12 gap-3 my-2 items-center">
        {/* Radar Honeypot Visual */}
        <div className="col-span-5 relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Concentric Radar Rings */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20"></div>
          <div className="absolute inset-2 rounded-full border border-amber-500/30"></div>
          <div className="absolute inset-5 rounded-full border border-amber-500/40"></div>

          {/* Rotating Radar Sweep Cone */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="w-full h-full radar-sweep bg-gradient-to-tr from-amber-500/30 via-transparent to-transparent"></div>
          </div>

          {/* Center Honeypot Emblem */}
          <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/40 border border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <span className="text-base">🍯</span>
          </div>

          {/* Detected Blip Dots */}
          <span className="absolute top-3 left-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping"></span>
          <span className="absolute bottom-4 right-3 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
          <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-red-400"></span>
        </div>

        {/* Recent Triggers Table */}
        <div className="col-span-7 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Recent Triggers
          </span>

          {honeyTriggers.map((trig) => (
            <div
              key={trig.id}
              className="p-1.5 rounded bg-[#070c18] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[11px] font-bold text-slate-200 font-mono truncate">
                  {trig.resource}
                </span>
                <span className="text-[9px] text-slate-400">
                  {trig.accessor} <span className="font-mono text-slate-500">{trig.time}</span>
                </span>
              </div>

              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                  trig.severity === 'HIGH'
                    ? 'bg-red-950 text-red-400 border border-red-500/40'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                }`}
              >
                {trig.severity === 'HIGH' ? 'High' : 'Medium'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-right border-t border-slate-800/80">
        <button
          onClick={onViewDeception}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>View Deception Network</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
