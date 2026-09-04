import React from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { ALL_CASES, type LawCase } from '../constants/cases';

interface CaseSelectorProps {
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  selectedCaseId,
  onSelectCase,
  allowAll = false,
  allLabel = 'All Cases (Global Syndicate)',
  className = '',
}) => {
  const activeCase: LawCase | undefined = ALL_CASES.find((c) => c.id === selectedCaseId);

  return (
    <div className={`flex items-center gap-2 bg-slate-900 border border-slate-700/90 hover:border-slate-600 rounded-xl px-3 py-1.5 shadow-md transition-colors ${className}`}>
      <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
      <span className="text-xs text-slate-400 font-semibold shrink-0">Case:</span>
      
      <div className="relative flex items-center">
        <select
          value={selectedCaseId}
          onChange={(e) => {
            const val = e.target.value;
            onSelectCase(val);
          }}
          className="appearance-none bg-transparent text-xs font-bold text-white pr-7 focus:outline-none cursor-pointer max-w-[280px] sm:max-w-[340px] truncate"
        >
          {allowAll && (
            <option value="ALL" className="bg-slate-900 text-slate-200">
              🌐 {allLabel}
            </option>
          )}
          {ALL_CASES.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 py-1">
              [{c.fir_number?.split('/')[1] || c.id}] {c.title}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
      </div>

      {activeCase && selectedCaseId !== 'ALL' && (
        <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ml-1 ${
          activeCase.priority === 'CRITICAL'
            ? 'bg-red-950/90 text-red-400 border border-red-700/50'
            : 'bg-amber-950/90 text-amber-400 border border-amber-700/50'
        }`}>
          {activeCase.priority}
        </span>
      )}
    </div>
  );
};
