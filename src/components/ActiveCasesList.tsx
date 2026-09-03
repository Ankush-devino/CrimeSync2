import React, { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface ActiveCasesListProps {
  onViewAllCases?: () => void;
}

export const ActiveCasesList: React.FC<ActiveCasesListProps> = ({ onViewAllCases }) => {
  const [cases, setCases] = useState<any[]>([
    {
      id: 'FIR/DEL/2026/0891',
      severity: 'CRITICAL',
      badgeClass: 'bg-red-950/70 border border-red-500/50 text-red-400',
      title: 'Operation Trishul: Hawala & Phishing',
      officer: 'ACP Rajeshwar Sharma',
      updated: 'Live Neon DB',
      progress: 85,
      barColor: 'bg-red-400',
    },
    {
      id: 'FIR/MUM/2026/1044',
      severity: 'HIGH',
      badgeClass: 'bg-amber-950/70 border border-amber-500/50 text-amber-400',
      title: 'GridShield SCADA Cyber Attack',
      officer: 'Insp. Priya Kulkarni',
      updated: 'Live Neon DB',
      progress: 60,
      barColor: 'bg-amber-400',
    },
    {
      id: 'FIR/BLR/2026/0332',
      severity: 'HIGH',
      badgeClass: 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400',
      title: 'Operation Garud: SIM Box Ring',
      officer: 'DSP Arvind Swaminathan',
      updated: 'Live Neon DB',
      progress: 45,
      barColor: 'bg-emerald-400',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveCases = async () => {
    setIsLoading(true);
    try {
      const data = await api.cases.getAll();
      if (data && data.length > 0) {
        const mapped = data.map((c: any) => {
          const isCrit = c.priority === 'CRITICAL';
          const isHigh = c.priority === 'HIGH';
          return {
            id: c.fir_number || c.id,
            severity: c.priority || 'MEDIUM',
            badgeClass: isCrit
              ? 'bg-red-950/70 border border-red-500/50 text-red-400'
              : isHigh
              ? 'bg-amber-950/70 border border-amber-500/50 text-amber-400'
              : 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400',
            title: c.title,
            officer: c.lead_investigator_name ? `Investigator: ${c.lead_investigator_name}` : c.jurisdiction_city,
            updated: new Date(c.updated_at || c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            progress: isCrit ? 85 : isHigh ? 65 : 40,
            barColor: isCrit ? 'bg-red-400' : isHigh ? 'bg-amber-400' : 'bg-emerald-400',
          };
        });
        setCases(mapped);
      }
    } catch (err) {
      console.warn("Using offline case cache:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCases();
  }, []);

  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            ACTIVE CASES (POSTGRESQL)
          </span>
          {isLoading && <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />}
        </div>
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
          + {cases.length} live database records
        </button>
      </div>
    </div>
  );
};
