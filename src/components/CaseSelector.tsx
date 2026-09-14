import React from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { type LawCase, getCaseById } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { isCompromisedReport } from '../utils/reportFilters';

interface CaseSelectorProps {
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  cases?: any[];
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
  threatOnly?: boolean;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  selectedCaseId,
  onSelectCase,
  cases: propCases,
  allowAll = false,
  allLabel = 'All Authorized Cases',
  className = '',
  threatOnly = false,
}) => {
  const { cases: contextCases } = useCaseContext();
  const { permissions } = useAuth();
  const { logEvent, setActiveCaseId } = useAuditLog();

  const rawList = (propCases && propCases.length > 0) ? propCases : contextCases;
  const caseList = threatOnly ? rawList.filter(isCompromisedReport) : rawList;
  const activeCase: LawCase | undefined = caseList.find((c: any) => c.id === selectedCaseId) || getCaseById(selectedCaseId);

  // allowAll should only be available if the officer has supervisory clearance (canViewAllCases)
  const canShowAll = allowAll && permissions.canViewAllCases && !threatOnly;

  const isSelectedCaseCompromised = Boolean(activeCase && (activeCase.isCompromised === true || isCompromisedReport(activeCase)));

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-md transition-colors ${
      isSelectedCaseCompromised
        ? 'bg-red-600 border-2 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.5)]'
        : 'bg-slate-900 border border-slate-700/90 hover:border-slate-600'
    } ${className}`}>
      <Briefcase className={`w-4 h-4 shrink-0 ${isSelectedCaseCompromised ? 'text-white' : 'text-blue-400'}`} />
      <span className={`text-xs font-semibold shrink-0 ${isSelectedCaseCompromised ? 'text-white' : 'text-slate-400'}`}>Case:</span>
      
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
          className={`appearance-none bg-transparent text-xs font-bold pr-7 focus:outline-none cursor-pointer max-w-[280px] sm:max-w-[340px] truncate ${
            isSelectedCaseCompromised ? 'text-white font-extrabold' : 'text-white'
          }`}
        >
          {canShowAll && (
            <option value="ALL" className="bg-slate-900 text-slate-200">
              🌐 {allLabel}
            </option>
          )}
          {caseList.length === 0 ? (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              No Compromised Cases
            </option>
          ) : (
            caseList.map((c: any) => {
              const isCompromised = c.isCompromised === true || isCompromisedReport(c);
              return (
                <option
                  key={c.id}
                  value={c.id}
                  className={`${
                    isCompromised
                      ? 'bg-red-600 text-white font-bold tracking-wide border-l-4 border-red-900 hover:bg-red-500 py-1.5'
                      : 'bg-slate-900 text-slate-200 py-1'
                  }`}
                >
                  {isCompromised ? '🚨 [COMPROMISED] ' : ''}
                  [{c.fir_number?.split('/')[1] || c.firNumber || c.id}] {c.title || c.suspectName}
                </option>
              );
            })
          )}
        </select>
        <ChevronDown className={`w-3.5 h-3.5 pointer-events-none absolute right-0 ${
          isSelectedCaseCompromised ? 'text-white' : 'text-slate-400'
        }`} />
      </div>

      {activeCase && selectedCaseId !== 'ALL' && (
        <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ml-1 ${
          isSelectedCaseCompromised
            ? 'bg-red-800 text-white border border-red-300'
            : activeCase.priority === 'CRITICAL'
            ? 'bg-red-950/90 text-red-400 border border-red-700/50'
            : 'bg-amber-950/90 text-amber-400 border border-amber-700/50'
        }`}>
          {isSelectedCaseCompromised ? '🚨 COMPROMISED' : activeCase.priority}
        </span>
      )}
    </div>
  );
};
