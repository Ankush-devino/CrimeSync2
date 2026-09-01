import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Cpu, Upload, FileText, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActionModalProps {
  actionName: string | null;
  onClose: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ actionName, onClose }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!actionName) return null;

  const handleRun = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#a855f7', '#10b981'],
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1322] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.2)] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0d172a] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{actionName}</h3>
              <p className="text-[10px] text-slate-400">CRIMESYNC Command Module</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {!isSuccess ? (
            <>
              <div className="p-4 rounded-xl bg-[#070c18] border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-200">
                  Ready to trigger command: <span className="text-cyan-400">{actionName}</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Executing this operation will dispatch tasks across the 12 active AI sandbox nodes and synchronize transaction blocks directly with the police evidence ledger.
                </p>
              </div>

              {isExecuting && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-300">
                    Executing neural pipeline & cryptographic verification...
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Action Executed Successfully!</h4>
              <p className="text-xs text-slate-400">
                All changes have been cryptographically stamped to block #92185.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            {isSuccess ? 'Dismiss' : 'Cancel'}
          </button>
          {!isSuccess && (
            <button
              disabled={isExecuting}
              onClick={handleRun}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              {isExecuting ? 'Processing...' : 'Execute Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
