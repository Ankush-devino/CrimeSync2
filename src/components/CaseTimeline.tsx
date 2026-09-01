import React from 'react';
import { Phone, IndianRupee, Video, Car, MapPin, ArrowRight } from 'lucide-react';

interface CaseTimelineProps {
  onViewTimeline?: () => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ onViewTimeline }) => {
  const events = [
    {
      id: '1',
      timeDay: 'Today',
      timeClock: '09:21 PM',
      title: 'Call between Aman Khan & Vikram J.',
      detail: '+91 98765 43210 (14 min 32 sec)',
      badge: 'Communication',
      badgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      icon: <Phone className="w-3 h-3" />,
      iconColor: 'bg-purple-600/30 border-purple-500/50 text-purple-300',
    },
    {
      id: '2',
      timeDay: 'Today',
      timeClock: '07:45 PM',
      title: '₹1,50,000 transferred to AC987654',
      detail: 'From AC455566',
      badge: 'Financial',
      badgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      icon: <IndianRupee className="w-3 h-3" />,
      iconColor: 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300',
    },
    {
      id: '3',
      timeDay: 'Today',
      timeClock: '05:32 PM',
      title: 'CCTV spotted at Lajpat Nagar',
      detail: 'Camera 12, 05:31 PM',
      badge: 'Surveillance',
      badgeColor: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
      icon: <Video className="w-3 h-3" />,
      iconColor: 'bg-blue-600/30 border-blue-500/50 text-blue-300',
    },
    {
      id: '4',
      timeDay: 'Today',
      timeClock: '04:20 PM',
      title: 'Vehicle DL12AB1234 near Crime Scene 1',
      detail: 'Lajpat Nagar',
      badge: 'Movement',
      badgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      icon: <Car className="w-3 h-3" />,
      iconColor: 'bg-amber-600/30 border-amber-500/50 text-amber-300',
    },
    {
      id: '5',
      timeDay: 'Yesterday',
      timeClock: '11:10 PM',
      title: 'Location overlap with 2 crime scenes',
      detail: 'Karol Bagh, Lajpat Nagar',
      badge: 'Location',
      badgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      icon: <MapPin className="w-3 h-3" />,
      iconColor: 'bg-cyan-600/30 border-cyan-500/50 text-cyan-300',
    },
  ];

  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
        <span className="text-xs font-bold text-white tracking-wider uppercase">
          CASE TIME LINE <span className="text-[10px] text-slate-400 font-normal">(Last 7 Days)</span>
        </span>
        <button
          onClick={onViewTimeline}
          className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
        >
          <span>View Full Timeline</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Timeline items */}
      <div className="relative my-2 space-y-2.5">
        {/* Connecting vertical line */}
        <div className="absolute left-[3.25rem] top-3 bottom-3 w-px bg-[#162947]" />

        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-2.5 relative z-10">
            {/* Time Stamp */}
            <div className="w-12 text-right flex-shrink-0">
              <span className="text-[9px] text-slate-400 block leading-tight">{event.timeDay}</span>
              <span className="text-[9.5px] font-mono font-medium text-slate-200 block leading-tight">
                {event.timeClock}
              </span>
            </div>

            {/* Icon Node */}
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 shadow-sm ${event.iconColor}`}
            >
              {event.icon}
            </div>

            {/* Event Description Card */}
            <div className="flex-1 p-1.5 rounded-md bg-[#081224]/90 border border-[#142644] flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-slate-100 truncate leading-tight">
                  {event.title}
                </p>
                <p className="text-[9.5px] text-slate-400 truncate leading-tight mt-0.5">
                  {event.detail}
                </p>
              </div>

              <span
                className={`text-[8.5px] font-medium px-2 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${event.badgeColor}`}
              >
                {event.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 text-center border-t border-[#111e33]/80">
        <button
          onClick={onViewTimeline}
          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
        >
          + 24 more events
        </button>
      </div>
    </div>
  );
};
