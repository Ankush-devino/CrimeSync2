import React from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { type LawCase, getCaseById } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { useAuditLog } from '../hooks/useAuditLog';

interface CaseSelectorProps {
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  cases?: any[];
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  selectedCaseId,
  onSelectCase,
  cases: propCases,
  allowAll = false,
  allLabel = 'All Authorized Cases',
  className = '',
}) => {
  const { cases: contextCases } = useCaseContext();
  const { permissions } = useAuth();
  const { logEvent, setActiveCaseId } = useAuditLog();

  const caseList = (propCases && propCases.length > 0) ? propCases : contextCases;
  const activeCase: LawCase | undefined = caseList.find((c: any) => c.id === selectedCaseId) || getCaseById(selectedCaseId);

  // allowAll should only be available if the officer has supervisory clearance (canViewAllCases)
  const canShowAll = allowAll && permissions.canViewAllCases;

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
            if (val !== 'ALL') {
              setActiveCaseId(val);
            }
          }}
          className="appearance-none bg-transparent text-xs font-bold text-white pr-7 focus:outline-none cursor-pointer max-w-[280px] sm:max-w-[340px] truncate"
        >
          {canShowAll && (
            <option value="ALL" className="bg-slate-900 text-slate-200">
              🌐 {allLabel}
            </option>
          )}
          {caseList.map((c: any) => (
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
