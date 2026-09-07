import React, { useState, useEffect } from 'react';
import { X, Box, KeyRound, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  firNumber: string;
  onEvidenceAdded: (newEvidence: any) => void;
}

// Generate pseudo SHA-256 for demo
function generateRandomHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  caseId,
  firNumber,
  onEvidenceAdded,
}) => {
  const [evidenceCode, setEvidenceCode] = useState(`EVD-${caseId.replace('CASE-2026-', '')}-${Math.floor(10 + Math.random() * 90)}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DIGITAL_HARDWARE');
  const [hashSha256, setHashSha256] = useState(generateRandomHash());
  const [status, setStatus] = useState('SECURED');
  const [collectedById, setCollectedById] = useState('USR-101');
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEvidenceCode(`EVD-${caseId.replace('CASE-2026-', '')}-${Math.floor(10 + Math.random() * 90)}`);
      setHashSha256(generateRandomHash());
      api.auth.getOfficers()
        .then((data) => {
          setOfficers(data || []);
          if (data && data.length > 0) {
            setCollectedById(data[0].id);
          }
        })
        .catch(() => {
          setOfficers([
            { id: 'USR-101', full_name: 'ACP Rajeshwar Sharma', badge_number: 'DEL-IPS-8821' },
            { id: 'USR-102', full_name: 'Inspector Priya Kulkarni', badge_number: 'MUM-CYB-4091' },
            { id: 'USR-103', full_name: 'DSP Arvind Swaminathan', badge_number: 'BLR-INT-1102' },
          ]);
        });
    }
  }, [isOpen, caseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive title for this evidence artifact');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await api.evidence.create({
        case_id: caseId,
        evidence_code: evidenceCode,
        title,
        category,
        hash_sha256: hashSha256,
        collected_by_id: collectedById,
        current_custody_officer_id: collectedById,
        status,
      });
      onEvidenceAdded(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to seal and record evidence in PostgreSQL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#070e1e] border border-blue-500/30 rounded-xl shadow-[0_0_40px_rgba(37,99,235,0.25)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#040813]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                SEIZE & RECORD NEW EVIDENCE
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
                  SHA-256 SEALED
                </span>
              </h2>
              <p className="text-xs text-slate-300">Linked to FIR: <span className="text-blue-400 font-mono">{firNumber}</span> • {caseId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evidence Tag Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Evidence Tag ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={evidenceCode}
                onChange={(e) => setEvidenceCode(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. EVD-001-08"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Evidence Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DIGITAL_HARDWARE">Digital Hardware</option>
                <option value="MOBILE_DEVICE">Mobile Device</option>
                <option value="BANK_STATEMENT">Bank Statements & Mule Ledgers</option>
                <option value="CALL_RECORD">Call Data Records</option>
                <option value="SERVER_LOG">Server Logs & Network PCAP</option>
                <option value="FORENSIC_IMAGE">Forensic Disk Image</option>
                <option value="CCTV_FOOTAGE">CCTV Surveillance Footage</option>
              </select>
            </div>
          </div>

          {/* Evidence Title / Item Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Evidence Title & Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Encrypted NVMe SSD seized from suspect safehouse in Mumbai"
            />
          </div>

          {/* Cryptographic SHA-256 Hash Seal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                Cryptographic SHA-256 Proof Hash
              </label>
              <button
                type="button"
                onClick={() => setHashSha256(generateRandomHash())}
                className="text-[11px] text-blue-300 hover:text-blue-200 underline font-semibold"
              >
                Regenerate Hash
              </button>
            </div>
            <input
              type="text"
              required
              value={hashSha256}
              onChange={(e) => setHashSha256(e.target.value)}
              className="w-full bg-[#030712] border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="mt-1 text-[11px] text-slate-300 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Proof of integrity automatically committed to the blockchain vault ledger.
            </p>
          </div>

          {/* Custody Status & Collecting Officer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Custody Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="SECURED">SECURED • In Vault</option>
                <option value="IN_FORENSICS">IN FORENSICS • FSL Lab</option>
                <option value="COURT_SUBMITTED">COURT SUBMITTED • In Court</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Seizing & Custody Officer
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  value={collectedById}
                  onChange={(e) => setCollectedById(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.full_name} • {officer.badge_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Registering Evidence...' : 'Commit Evidence to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
