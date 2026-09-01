import React from 'react';
import { ArrowRight, User } from 'lucide-react';

interface TopSuspectsListProps {
  onViewAllSuspects?: () => void;
  onSelectSuspect?: (name: string) => void;
}

export const TopSuspectsList: React.FC<TopSuspectsListProps> = ({ 
  onViewAllSuspects,
  onSelectSuspect
}) => {
  const suspects = [
    {
      id: '1',
      name: 'Aman Khan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      riskScore: '92 / 100',
      riskColor: 'text-red-500',
      connections: '28',
      trendColor: '#ef4444',
      trendPath: 'M0 12 L10 10 L20 14 L30 6 L40 8 L50 2',
    },
    {
      id: '2',
      name: 'Vikram J.',
      isIcon: true,
      riskScore: '89 / 100',
      riskColor: 'text-red-500',
      connections: '18',
      trendColor: '#ef4444',
      trendPath: 'M0 14 L12 10 L22 12 L34 4 L44 8 L50 2',
    },
    {
      id: '3',
      name: 'Riya Singh',
      isIcon: true,
      riskScore: '76 / 100',
      riskColor: 'text-amber-500',
      connections: '15',
      trendColor: '#f59e0b',
      trendPath: 'M0 8 L10 12 L20 6 L30 10 L40 6 L50 8',
    },
    {
      id: '4',
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      riskScore: '68 / 100',
      riskColor: 'text-amber-500',
      connections: '12',
      trendColor: '#f59e0b',
      trendPath: 'M0 6 L12 10 L24 4 L36 12 L44 8 L50 10',
    },
    {
      id: '5',
      name: 'Neha Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      riskScore: '55 / 100',
      riskColor: 'text-amber-400',
      connections: '09',
      trendColor: '#eab308',
      trendPath: 'M0 10 L10 6 L20 12 L30 8 L40 10 L50 6',
    },
  ];

  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
        <span className="text-xs font-bold text-white tracking-wider uppercase">
          TOP HIGH RISK SUSPECTS
        </span>
        <button
          onClick={onViewAllSuspects}
          className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-1.5 pb-1">
        <div className="col-span-5">SUSPECT</div>
        <div className="col-span-3 text-center">RISK SCORE</div>
        <div className="col-span-2 text-center">CONNECTIONS</div>
        <div className="col-span-2 text-right">TREND</div>
      </div>

      {/* Rows */}
      <div className="space-y-1 my-1">
        {suspects.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSuspect && onSelectSuspect(s.name)}
            className="grid grid-cols-12 items-center px-1.5 py-1 rounded hover:bg-[#0c1830] transition-colors cursor-pointer text-xs"
          >
            {/* Suspect Name & Avatar */}
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              {s.isIcon ? (
                <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0">
                  <User className="w-3 h-3" />
                </div>
              ) : (
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700 flex-shrink-0"
                />
              )}
              <span className="font-semibold text-slate-200 truncate text-[11px]">{s.name}</span>
            </div>

            {/* Risk Score */}
            <div className={`col-span-3 text-center font-bold text-[11px] font-mono ${s.riskColor}`}>
              {s.riskScore}
            </div>

            {/* Connections */}
            <div className="col-span-2 text-center text-slate-300 font-mono text-[11px]">
              {s.connections}
            </div>

            {/* Trend Sparkline */}
            <div className="col-span-2 flex justify-end">
              <svg className="w-10 h-4 fill-none" viewBox="0 0 50 16">
                <path
                  d={s.trendPath}
                  stroke={s.trendColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 text-center border-t border-[#111e33]/80">
        <button
          onClick={onViewAllSuspects}
          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
        >
          + 10 more suspects
        </button>
      </div>
    </div>
  );
};
