import React, { useState, useMemo } from 'react';
import { 
  X, 
  Crosshair, 
  Search, 
  Phone, 
  Car, 
  Landmark, 
  User, 
  Radio, 
  MapPin, 
  ShieldAlert, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useCaseContext } from '../../context/CaseContext';
import { logOfficerAction } from '../../services/activityLogger';

interface ThreatHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

interface CrossCaseEntity {
  id: string;
  type: 'PHONE' | 'VEHICLE' | 'BANK_ACCOUNT' | 'IMEI' | 'IP_ADDRESS' | 'AADHAAR_ID';
  identifier: string;
  linkedSuspect: string;
  role: string;
  riskScore: number;
  matchedCases: Array<{ caseId: string; firNumber: string; title: string }>;
  location: string;
  status: 'ACTIVE_INTERCEPT' | 'FROZEN' | 'UNDER_SURVEILLANCE' | 'CONFISCATED';
  lastSeen: string;
}

const GLOBAL_THREAT_ENTITY_REGISTRY: CrossCaseEntity[] = [
  {
    id: 'ent-1',
    type: 'PHONE',
    identifier: '+91 98201 10440',
    linkedSuspect: 'Tariq "Zero-Day" Qureshi',
    role: 'Primary C2 Satellite Link',
    riskScore: 96,
    matchedCases: [
      { caseId: 'CASE-2026-002', firNumber: 'FIR/MUM/2026/1044', title: 'GridShield SCADA Cyber Attack' },
      { caseId: 'CASE-2026-009', firNumber: 'FIR/CHE/2026/0204', title: 'Operation Rudra SCADA Ransomware' },
    ],
    location: 'Bandra Kurla Complex, Mumbai',
    status: 'ACTIVE_INTERCEPT',
    lastSeen: '12m ago • Bandra BTS Tower MH-4091',
  },
  {
    id: 'ent-2',
    type: 'VEHICLE',
    identifier: 'DL3CAY8819',
    linkedSuspect: 'Deepak Soni (Angadia Courier)',
    role: 'Physical Cash & Hawala Transport',
    riskScore: 88,
    matchedCases: [
      { caseId: 'CASE-2026-001', firNumber: 'FIR/DEL/2026/0891', title: 'Operation Trishul Hawala Syndicate' },
      { caseId: 'CASE-2026-008', firNumber: 'FIR/PUN/2026/1129', title: 'Operation Kuber Instant Loan App' },
    ],
    location: 'Karol Bagh / Chandni Chowk, Delhi',
    status: 'UNDER_SURVEILLANCE',
    lastSeen: '45m ago • ANPR Camera DL-CP-08',
  },
  {
    id: 'ent-3',
    type: 'BANK_ACCOUNT',
    identifier: 'HDFC AC: 502000491823',
    linkedSuspect: 'Harshvardhan Singhania',
    role: 'Tier-1 Phishing & Hawala Mule Account',
    riskScore: 94,
    matchedCases: [
      { caseId: 'CASE-2026-001', firNumber: 'FIR/DEL/2026/0891', title: 'Operation Trishul Hawala Syndicate' },
    ],
    location: 'Old Delhi Branch',
    status: 'FROZEN',
    lastSeen: '2h ago • ₹48,50,000 Layering Flow Intercepted',
  },
  {
    id: 'ent-4',
    type: 'IMEI',
    identifier: '864910284719201',
    linkedSuspect: 'Mohd. Irfan Sheikh',
    role: '128-Port SIM Box Master Module',
    riskScore: 92,
    matchedCases: [
      { caseId: 'CASE-2026-003', firNumber: 'FIR/BLR/2026/0332', title: 'Operation Garud Counterfeit SIM Ring' },
    ],
    location: 'Peenya Industrial Area, Bengaluru',
    status: 'UNDER_SURVEILLANCE',
    lastSeen: '4h ago • 1,400 OTP Spoofs Routed',
  },
  {
    id: 'ent-5',
    type: 'IP_ADDRESS',
    identifier: '194.26.29.112',
    linkedSuspect: 'Bulgarian C2 Syndicate',
    role: 'Cobalt Strike Command & Control Relay',
    riskScore: 98,
    matchedCases: [
      { caseId: 'CASE-2026-002', firNumber: 'FIR/MUM/2026/1044', title: 'GridShield SCADA Cyber Attack' },
      { caseId: 'CASE-2026-005', firNumber: 'FIR/MUM/2026/1842', title: 'Operation Vajra Digital Arrest' },
    ],
    location: 'Sofia, Bulgaria (Offshore Relay)',
    status: 'ACTIVE_INTERCEPT',
    lastSeen: 'Just now • Port 443 TLS Beacon',
  },
];

export const ThreatHuntModal: React.FC<ThreatHuntModalProps> = ({
  isOpen,
  onClose,
  onSelectCase,
}) => {
  const { setSelectedCaseId, showToast } = useCaseContext();
  const [query, setQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<CrossCaseEntity | null>(null);

  if (!isOpen) return null;

  const filteredEntities = GLOBAL_THREAT_ENTITY_REGISTRY.filter((ent) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      ent.identifier.toLowerCase().includes(q) ||
      ent.linkedSuspect.toLowerCase().includes(q) ||
      ent.type.toLowerCase().includes(q) ||
      ent.location.toLowerCase().includes(q) ||
      ent.matchedCases.some((c) => c.title.toLowerCase().includes(q) || c.firNumber.toLowerCase().includes(q))
    );
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PHONE':
        return <Phone className="w-4 h-4 text-blue-400" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'BANK_ACCOUNT':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'IMEI':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'IP_ADDRESS':
      default:
        return <Crosshair className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleJumpToCase = (caseId: string, firNumber: string) => {
    setSelectedCaseId(caseId);
    if (onSelectCase) onSelectCase(caseId);
    showToast(`Switched active investigation to ${firNumber}`, 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#061026] border border-amber-500/50 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-[#1d1203] to-[#040c1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wider uppercase font-mono">
                  CROSS-CASE THREAT HUNT CONSOLE
                </h3>
                <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 px-2 py-0.2 rounded border border-amber-500/40">
                  NATIONAL SEARCH
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Unified cross-case intelligence query across Phone numbers, Vehicles, Mule Bank Accounts & IMEIs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-[#030917] border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Phone (+91...), Vehicle Plate (DL3C...), Bank AC, IMEI, IP, or Suspect..."
              className="w-full bg-[#061026] border border-amber-500/40 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 font-sans"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results & Unified Profile Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 font-sans text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Discovered Threat Entities ({filteredEntities.length})
          </span>

          <div className="space-y-2.5">
            {filteredEntities.map((ent) => (
              <div
                key={ent.id}
                className="p-3.5 rounded-xl bg-[#030917] border border-slate-800 hover:border-amber-500/50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      {getEntityIcon(ent.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white font-mono">{ent.identifier}</span>
                        <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                          {ent.type}
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-500/40">
                          Risk: {ent.riskScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Linked Suspect: <strong className="text-cyan-300">{ent.linkedSuspect}</strong> ({ent.role})
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    {ent.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Multi-Case Linkage Badges */}
                <div className="p-2.5 rounded-lg bg-[#061026] border border-slate-800/80 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    Correlated Criminal Cases ({ent.matchedCases.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ent.matchedCases.map((c) => (
                      <button
                        key={c.caseId}
                        onClick={() => handleJumpToCase(c.caseId, c.firNumber)}
                        className="p-1.5 px-2.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-[10px] text-cyan-300 font-bold flex items-center gap-1.5 transition-colors group"
                      >
                        <span className="font-mono">{c.firNumber}</span>
                        <span className="text-slate-300 font-normal">({c.title})</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[9.5px] text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {ent.location}
                  </span>
                  <span>{ent.lastSeen}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#040813] flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            Real-Time Cross-Case Entity Intercept
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
