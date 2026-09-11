import React, { useState, useEffect } from 'react';
import { Search, X, User, FileText, Car, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { networkNodes, priorityAlerts, honeyTriggers } from '../../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (node: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectNode }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSuspects = networkNodes.filter(
    (n) => n.label.toLowerCase().includes(query.toLowerCase()) || n.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAlerts = priorityAlerts.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.target.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1322] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-[#0d1628]">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suspects, phone records, vehicle plates, case files, FIRs..."
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {/* Suspects Section */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Suspects & Entities ({filteredSuspects.length})
            </span>
            <div className="space-y-1.5">
              {filteredSuspects.length > 0 ? (
                filteredSuspects.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-[#070c18] border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                          {node.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Category: {node.category} {node.details?.role ? `• ${node.details.role}` : ''}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        node.risk === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {node.risk} RISK
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-2 text-center">No entities matched "{query}"</div>
              )}
            </div>
          </div>

          {/* Security Alerts Section */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Recent Alerts ({filteredAlerts.length})
            </span>
            <div className="space-y-1.5">
              {filteredAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-2 rounded-lg bg-[#070c18] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <div>
                      <span className="font-semibold text-slate-200">{alt.title}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{alt.target}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Press ESC to dismiss</span>
          <span className="text-cyan-400 font-mono">CRIMESYNC Global Search Engine</span>
        </div>
      </div>
    </div>
  );
};
