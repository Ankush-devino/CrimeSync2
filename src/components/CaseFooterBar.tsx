import React from 'react';
import { ChevronDown } from 'lucide-react';

export const CaseFooterBar: React.FC = () => {
  return (
    <footer className="h-9 bg-[#040813] border-t border-[#111e33] px-4 flex items-center justify-between text-[11px] text-slate-400 select-none z-20">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        <div>
          <span>Case ID: </span>
          <span className="font-semibold text-slate-200 font-mono">RC-2026-0417</span>
        </div>

        <div>
          <span>Investigating Officer: </span>
          <span className="font-semibold text-slate-200">Inspector R. Sharma</span>
        </div>

        <div>
          <span>Created On: </span>
          <span className="font-semibold text-slate-200">21 Aug 2026</span>
        </div>

        <div>
          <span>Last Updated: </span>
          <span className="font-semibold text-slate-200">27 Aug 2026, 10:30 PM</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 flex-shrink-0">
        <span>Case Status: </span>
        <span className="flex items-center gap-1 font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </footer>
  );
};
