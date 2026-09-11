import React from 'react';
import { Clock, Phone, CircleDollarSign, Camera, ShieldAlert, ArrowRight, Radio, MapPin } from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { getActiveCaseIntelligence } from '../data/activeCaseNetworks';

interface CrimeTimeMachineProps {
  onNavigateTab?: (tab: string) => void;
  onOpenTimeMachine?: () => void;
}

export const CrimeTimeMachine: React.FC<CrimeTimeMachineProps> = ({ onNavigateTab, onOpenTimeMachine }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();

  const caseIntel = React.useMemo(() => {
    return getActiveCaseIntelligence(selectedCase || { id: selectedCaseId });
  }, [selectedCase, selectedCaseId]);

  const handleClick = () => {
    if (onNavigateTab) {
      onNavigateTab('time-machine');
    } else if (onOpenTimeMachine) {
      onOpenTimeMachine();
    }
  };

  // Exactly 3 latest events for the active case
  const latestEvents = caseIntel.timeMachineEvents.slice(0, 3);

  const getSemanticIcon = (category: string) => {
    switch (category) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'transaction':
        return <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cctv':
        return <Camera className="w-3.5 h-3.5 text-purple-400" />;
      case 'location':
        return <MapPin className="w-3.5 h-3.5 text-amber-400" />;
      case 'cyber':
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/80 border border-red-500/50 text-red-400';
      case 'HIGH':
        return 'bg-amber-950/80 border border-amber-500/50 text-amber-400';
      default:
        return 'bg-blue-950/80 border border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="p-4 rounded-2xl bg-gradient-to-b from-[#110c26]/95 via-[#080515]/95 to-[#030209]/95 border border-purple-500/30 hover:border-purple-400/70 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer transition-all duration-250"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                CRIME TIME MACHINE
              </span>
              <span className="text-[9px] text-slate-400 block">4D Temporal Forensic Sequence</span>
            </div>
          </div>

          <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-950/90 px-2 py-0.5 rounded-full border border-purple-500/40">
            Latest 3 Events
          </span>
        </div>
      </div>

      {/* Compact Vertical Chronological Timeline */}
      <div className="my-2.5 relative space-y-3 pl-3">
        {/* Continuous Vertical Timeline Line */}
        <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-emerald-500 opacity-60" />

        {latestEvents.map((evt, idx) => (
          <div key={evt.id} className="relative flex items-start gap-2.5 group/item">
            {/* Timeline Semantic Node Icon */}
            <div className="w-6 h-6 rounded-lg bg-[#0c051a] border border-purple-500/50 flex items-center justify-center flex-shrink-0 z-10 shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover/item:scale-110 transition-transform">
              {getSemanticIcon(evt.category)}
            </div>

            {/* Event Details Card */}
            <div className="flex-1 p-2 rounded-xl bg-[#090414] border border-purple-950 hover:border-purple-500/40 transition-colors shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-cyan-300">
                  {evt.time}
                </span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${getSeverityBadge(evt.riskSeverity)}`}>
                  {evt.riskSeverity}
                </span>
              </div>

              <div className="text-[11px] font-bold text-white truncate leading-tight">
                {evt.title}
              </div>

              <div className="text-[9.5px] text-slate-400 truncate leading-tight mt-0.5 font-sans">
                {evt.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-purple-900/60 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-mono">
          Synchronized CDR & CCTV Replay
        </span>
        <span className="text-purple-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
          <span>Full Replay</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
