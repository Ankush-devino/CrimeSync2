import React, { useState } from 'react';
import { Play, Pause, Phone, CircleDollarSign, MapPin, Camera, ArrowRight, Clock } from 'lucide-react';
import { timelineEvents } from '../data/mockData';

interface CrimeTimeMachineProps {
  onOpenTimeMachine?: () => void;
}

export const CrimeTimeMachine: React.FC<CrimeTimeMachineProps> = ({ onOpenTimeMachine }) => {
  const [selectedSlot, setSelectedSlot] = useState('10:00 PM');
  const [isPlaying, setIsPlaying] = useState(false);

  const slots = ['06:00', '08:00', '10:00 PM', '12:00', '14:00', '16:00', '18:00'];
  const events = timelineEvents[selectedSlot] || timelineEvents['10:00 PM'];

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'call':
        return <Phone className="w-3 h-3 text-cyan-400" />;
      case 'transaction':
        return <CircleDollarSign className="w-3 h-3 text-emerald-400" />;
      case 'location':
        return <MapPin className="w-3 h-3 text-amber-400" />;
      case 'cctv':
      default:
        return <Camera className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
              CRIME TIME MACHINE
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-purple-400" />}
            <span>1x</span>
          </button>
        </div>

        {/* Timeline Scrubber Bar */}
        <div className="flex items-center justify-between gap-1 py-2.5 overflow-x-auto scrollbar-none">
          {slots.map((slot) => {
            const isActive = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-400 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split: Event Stack on Left + Visualizer Curve on Right */}
      <div className="grid grid-cols-12 gap-3 my-1 items-center">
        {/* Event List Stack */}
        <div className="col-span-7 bg-[#070c18]/90 rounded-lg p-2.5 border border-slate-800/90 shadow-inner">
          <span className="text-[10px] font-bold text-slate-400 block mb-2">
            Events at {selectedSlot}
          </span>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded bg-slate-800 flex-shrink-0">
                    {getEventIcon(evt.category)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-slate-200 truncate">
                      {evt.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{evt.time}</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 pl-1 font-mono">
                  {evt.category === 'cctv' ? '🎥' : evt.category === 'call' ? '📞' : '📍'}
                </div>
              </div>
            ))}

            <div className="text-[10px] text-slate-500 text-center pt-1 font-medium">
              + 6 more events
            </div>
          </div>
        </div>

        {/* Sinusoidal Curve / Node Flow Visualizer */}
        <div className="col-span-5 h-full min-h-[140px] flex items-center justify-center relative bg-[#060a14] rounded-lg border border-slate-900 p-2 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 160 120">
            <defs>
              <linearGradient id="timeLineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Sinusoidal Path */}
            <path
              d="M 10 60 C 40 10, 50 110, 80 60 C 110 10, 120 110, 150 60"
              fill="none"
              stroke="url(#timeLineGlow)"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"
            />

            {/* Node indicators along the path */}
            <g transform="translate(10, 60)">
              <circle r="4" fill="#a855f7" className="shadow-[0_0_8px_#a855f7]" />
              <circle r="2" fill="#fff" />
            </g>

            <g transform="translate(45, 28)">
              <circle r="5" fill="#38bdf8" className="shadow-[0_0_8px_#38bdf8]" />
              <circle r="2.5" fill="#fff" />
            </g>

            <g transform="translate(80, 60)">
              <circle r="6" fill="#a855f7" className="animate-ping opacity-75" />
              <circle r="5" fill="#a855f7" className="shadow-[0_0_10px_#a855f7]" />
              <circle r="2.5" fill="#fff" />
            </g>

            <g transform="translate(115, 92)">
              <circle r="5" fill="#10b981" className="shadow-[0_0_8px_#10b981]" />
              <circle r="2.5" fill="#fff" />
            </g>

            <g transform="translate(150, 60)">
              <circle r="4" fill="#00f0ff" />
              <circle r="2" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-right border-t border-slate-800/80 mt-1">
        <button
          onClick={onOpenTimeMachine}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 group font-medium"
        >
          <span>Open Time Machine</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
