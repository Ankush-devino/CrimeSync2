import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActiveCasesListProps {
  onViewAllCases?: () => void;
}

export const ActiveCasesList: React.FC<ActiveCasesListProps> = ({ onViewAllCases }) => {
  const cases = [
    {
      id: 'RC-2026-0417',
      severity: 'HIGH',
      badgeClass: 'bg-red-950/70 border border-red-500/50 text-red-400',
      title: 'Organized Theft & Money Laundering',
      officer: 'Investigating Officer: Insp. R. Sharma',
      updated: '10:31 PM',
      progress: 78,
      barColor: 'bg-emerald-400',
    },
    {
      id: 'RC-2026-0398',
      severity: 'MEDIUM',
      badgeClass: 'bg-amber-950/70 border border-amber-500/50 text-amber-400',
      title: 'Cyber Fraud & Identity Theft',
      officer: 'Investigating Officer: SI Meera',
      updated: '09:15 PM',
      progress: 65,
      barColor: 'bg-amber-400',
    },
    {
      id: 'RC-2026-0381',
      severity: 'LOW',
      badgeClass: 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400',
      title: 'Financial Irregularities',
      officer: 'Investigating Officer: Insp. P. Singh',
      updated: '08:40 PM',
      progress: 42,
      barColor: 'bg-emerald-400',
    },
  ];

  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
        <span className="text-xs font-bold text-white tracking-wider uppercase">
          ACTIVE CASES
        </span>
        <button
          onClick={onViewAllCases}
          className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
        >
          <span>View All Cases</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Case cards list */}
      <div className="space-y-2.5 my-2">
        {cases.map((c) => (
          <div
            key={c.id}
            className="p-2 rounded-lg bg-[#081224]/80 hover:bg-[#0c1830] border border-[#142644] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 font-mono">{c.id}</span>
                <span
                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase ${c.badgeClass}`}
                >
                  {c.severity}
                </span>
              </div>
              <span className="text-[9.5px] text-slate-400">
                Updated <span className="text-slate-300 font-mono">{c.updated}</span>
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-[10.5px] font-medium text-slate-200">{c.title}</p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">{c.officer}</p>
              </div>

              <div className="text-right w-24 flex-shrink-0">
                <div className="text-[9.5px] text-slate-400 mb-1">
                  Progress <span className="font-bold text-slate-200">{c.progress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#0e1f3b] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.barColor}`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 text-center border-t border-[#111e33]/80">
        <button
          onClick={onViewAllCases}
          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
        >
          + 15 more cases
        </button>
      </div>
    </div>
  );
};
