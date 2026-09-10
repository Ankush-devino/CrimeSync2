import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  X,
  ExternalLink,
  QrCode,
  Landmark,
} from 'lucide-react';
import type { ForensicDossier } from '../../services/dossierService';

interface ShareReportModalProps {
  dossier: ForensicDossier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  dossier,
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen || !dossier) return null;

  const secureLink = `https://crimesync.ncrb.gov.in/dossier/verify?token=SEC-65B-${dossier.firNumber.replace(/\//g, '-')}&merkle=${dossier.blockchainHash.slice(0, 16)}`;
  const bearerToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(dossier.firNumber)}.${dossier.blockchainHash.slice(2, 20)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(secureLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(bearerToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#050b18] border border-[#162744] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#030814]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">COURT TRANSMISSION & SHARE</h3>
              <p className="text-[10px] text-slate-400 font-mono">{dossier.firNumber} · {dossier.reportName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-300 font-mono text-[11px]">Section 65B Certified Electronic Link</span>
              <p className="text-[10.5px] text-slate-300">
                Authorized for direct judicial submission before Special CBI / Sessions Court. Access is recorded in the National Audit Trail.
              </p>
            </div>
          </div>

          {/* Secure URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Secure Access Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-[#02050e] border border-[#162744] rounded-xl font-mono text-[10.5px] text-slate-200 truncate select-all">
                {secureLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Verification Bearer Token */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Court Verifier JWT Token</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-[#02050e] border border-[#162744] rounded-xl font-mono text-[10.5px] text-cyan-300 truncate select-all">
                {bearerToken}
              </div>
              <button
                onClick={handleCopyToken}
                className="px-3 py-2 rounded-xl bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="p-3 rounded-xl bg-[#030814] border border-[#14233c] text-[10.5px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Certificate:</span> <strong className="text-white">{dossier.certificate65bId}</strong></div>
            <div className="flex justify-between"><span>Merkle Hash:</span> <strong className="text-cyan-300 truncate max-w-[200px]">{dossier.merkleRoot}</strong></div>
            <div className="flex justify-between"><span>Ledger Block:</span> <strong className="text-slate-300">#{dossier.blockHeight}</strong></div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#14233c] flex items-center justify-end bg-[#030814]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#081224] hover:bg-slate-800 border border-[#162744] text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
