import React, { useState } from 'react';
import {
  Layers,
  FileCheck2,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Building2,
  Lock,
  ArrowRight,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  QrCode,
  Key,
  FileText,
  Eye,
  X,
  Share2,
  RefreshCw,
  Camera,
  ShieldAlert,
  ArrowUpRight,
  Fingerprint,
  Box,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChainOfCustodyPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface CustodyStep {
  id: string;
  action: 'Collected' | 'Transferred' | 'Verified' | 'Stored' | 'Audited' | 'Released';
  actionColor: string;
  circleColor: string;
  iconType: 'user' | 'lab' | 'lock' | 'camera' | 'shield';
  actorName: string;
  actorRole: string;
  actorBadge: string;
  location: string;
  timestamp: string;
  txHash: string;
  signature: string;
  notes?: string;
  verifiedOnChain: boolean;
}

interface CustodyItem {
  id: string;
  evidenceId: string;
  evidenceName: string;
  evidenceType: string;
  caseRef: string;
  currentCustodian: string;
  custodianRole: string;
  currentLocation: string;
  status: 'In Custody' | 'In Transit' | 'In Court' | 'Archived';
  integrityStatus: 'Verified' | 'Flagged';
  complianceScore: number;
  totalHandovers: number;
  totalCustodians: number;
  breaksInChain: number;
  lastUpdated: string;
  sealHash: string;
  steps: CustodyStep[];
}

const SAMPLE_CUSTODY_ITEMS: Record<string, CustodyItem> = {
  'EV-1246': {
    id: 'c-1246',
    evidenceId: 'EV-1246',
    evidenceName: 'FIR_4587_Theft_Case.pdf',
    evidenceType: 'FIR Document',
    caseRef: 'CASE-2026-981',
    currentCustodian: 'Inspector R. Sharma',
    custodianRole: 'Lead Cyber Investigator',
    currentLocation: 'Cyber Crime Unit, Delhi',
    status: 'In Custody',
    integrityStatus: 'Verified',
    complianceScore: 100,
    totalHandovers: 4,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: '27 Aug 2026, 11:38 PM',
    sealHash: '0x7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3918bca4190c42f',
    steps: [
      {
        id: 'step-1',
        action: 'Collected',
        actionColor: 'text-amber-400',
        circleColor: 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        iconType: 'user',
        actorName: 'SI Amit Verma',
        actorRole: 'Sub-Inspector, Crime Scene Unit',
        actorBadge: 'DL-POL-8419',
        location: 'Crime Scene, Lajpat Nagar',
        timestamp: '27 Aug 2026, 09:15 AM',
        txHash: '0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4',
        signature: 'ECDSA-secp256k1 (0x81fa...901c)',
        notes: 'Initial evidence seizure at primary suspect premises. Physical seal #PS-9941 applied.',
        verifiedOnChain: true
      },
      {
        id: 'step-2',
        action: 'Transferred',
        actionColor: 'text-cyan-400',
        circleColor: 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
        iconType: 'user',
        actorName: 'Inspector R. Sharma',
        actorRole: 'Lead Cyber Investigator',
        actorBadge: 'DL-POL-3301',
        location: 'Cyber Crime Unit, Delhi',
        timestamp: '27 Aug 2026, 11:20 AM',
        txHash: '0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984',
        signature: 'ECDSA-secp256k1 (0x44bc...12ef)',
        notes: 'Handover complete. Digital copy generated and signed in presence of witness.',
        verifiedOnChain: true
      },
      {
        id: 'step-3',
        action: 'Verified',
        actionColor: 'text-emerald-400',
        circleColor: 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        iconType: 'lab',
        actorName: 'Forensic Analyst P. Singh',
        actorRole: 'Chief Digital Forensics Officer',
        actorBadge: 'FSL-IND-902',
        location: 'Digital Forensics Lab',
        timestamp: '27 Aug 2026, 02:45 PM',
        txHash: '0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a',
        signature: 'ECDSA-secp256k1 (0x99fe...8831)',
        notes: 'SHA-256 bit-stream verified against original master hash. Zero tampering confirmed.',
        verifiedOnChain: true
      },
      {
        id: 'step-4',
        action: 'Stored',
        actionColor: 'text-purple-400',
        circleColor: 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
        iconType: 'lock',
        actorName: 'Evidence Locker EF-12',
        actorRole: 'Automated Secure Smart Locker',
        actorBadge: 'VAULT-SEC-01',
        location: 'Cyber Crime Evidence Room',
        timestamp: '27 Aug 2026, 05:30 PM',
        txHash: '0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c',
        signature: 'ECDSA-secp256k1 (0x7a3f...8f77)',
        notes: 'Locked under dual-biometric access and RFID telemetry tracking.',
        verifiedOnChain: true
      }
    ]
  },
  'EV-1247': {
    id: 'c-1247',
    evidenceId: 'EV-1247',
    evidenceName: 'Hawala_Ledger_2026_Q2.xlsx',
    evidenceType: 'Financial Ledger',
    caseRef: 'CASE-2026-981',
    currentCustodian: 'Forensic Accountant M. Iyer',
    custodianRole: 'ED Special Task Force',
    currentLocation: 'Enforcement Directorate, HQ',
    status: 'In Custody',
    integrityStatus: 'Verified',
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: '28 Aug 2026, 04:12 PM',
    sealHash: '0x9d4e78ab12c6ef44b09c812a39df110283719bc4892e7d3fa81b490e556c8021',
    steps: [
      {
        id: 'step-21',
        action: 'Collected',
        actionColor: 'text-amber-400',
        circleColor: 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        iconType: 'user',
        actorName: 'Inspector D. Rao',
        actorRole: 'Special Cell Investigator',
        actorBadge: 'DL-POL-4921',
        location: 'Chandni Chowk Hawala Hub',
        timestamp: '28 Aug 2026, 01:10 AM',
        txHash: '0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7',
        signature: 'ECDSA-secp256k1 (0x19a0...334b)',
        notes: 'Encrypted drive recovered during raid. Drive serial #WD-9941829.',
        verifiedOnChain: true
      },
      {
        id: 'step-22',
        action: 'Transferred',
        actionColor: 'text-cyan-400',
        circleColor: 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
        iconType: 'user',
        actorName: 'Forensic Accountant M. Iyer',
        actorRole: 'ED Special Task Force',
        actorBadge: 'ED-FSL-102',
        location: 'Enforcement Directorate, HQ',
        timestamp: '28 Aug 2026, 08:30 AM',
        txHash: '0x4892e7d3fa81b490e556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c',
        signature: 'ECDSA-secp256k1 (0x55ca...0981)',
        notes: 'Forensic write-blocker image created. Decryption analysis initiated.',
        verifiedOnChain: true
      }
    ]
  },
  'EV-1248': {
    id: 'c-1248',
    evidenceId: 'EV-1248',
    evidenceName: 'CCTV_Gate4_Surveillance_Dump.mp4',
    evidenceType: 'Video Recording',
    caseRef: 'CASE-2026-512',
    currentCustodian: 'Technician K. Mehta',
    custodianRole: 'Traffic Command Forensic Unit',
    currentLocation: 'Delhi Traffic Command Center',
    status: 'In Custody',
    integrityStatus: 'Verified',
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: '28 Aug 2026, 07:15 PM',
    sealHash: '0x3c2a11bf78de99aa44b1239c8710293847102938471029384710293847102938',
    steps: [
      {
        id: 'step-31',
        action: 'Collected',
        actionColor: 'text-amber-400',
        circleColor: 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        iconType: 'camera',
        actorName: 'SI Suresh Nair',
        actorRole: 'Highway Surveillance Unit',
        actorBadge: 'DL-POL-1192',
        location: 'NH-48 Toll Plaza CCTV Room',
        timestamp: '28 Aug 2026, 05:00 PM',
        txHash: '0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e',
        signature: 'ECDSA-secp256k1 (0x88bb...3311)',
        notes: 'Lossless raw optical dump extracted from NVR server.',
        verifiedOnChain: true
      }
    ]
  }
};

export const ChainOfCustodyPage: React.FC<ChainOfCustodyPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EV-1246');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [selectedStepDetail, setSelectedStepDetail] = useState<CustodyStep | null>(null);
  const [filterSearch, setFilterSearch] = useState<string>('');

  const currentItem = SAMPLE_CUSTODY_ITEMS[selectedEvidenceId] || SAMPLE_CUSTODY_ITEMS['EV-1246'];

  // Handover form state
  const [handoverTo, setHandoverTo] = useState<string>('Forensic Specialist Dr. A. Sen');
  const [handoverLocation, setHandoverLocation] = useState<string>('Central Forensic Science Lab, CBI');
  const [handoverReason, setHandoverReason] = useState<string>('Court-Mandated Chemical & Document Analysis');
  const [isSubmittingHandover, setIsSubmittingHandover] = useState<boolean>(false);

  const handleInitiateHandover = () => {
    setIsSubmittingHandover(true);
    setTimeout(() => {
      setIsSubmittingHandover(false);
      setIsHandoverModalOpen(false);
      if (onSelectAction) {
        onSelectAction(`Custody of ${currentItem.evidenceId} transferred to ${handoverTo} at ${handoverLocation}`);
      }
    }, 1000);
  };

  // Radial progress gauge
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentItem.complianceScore / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-5 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#111e33]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
              CHAIN OF CUSTODY
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-cyan-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Track evidence handling and custody transfer
          </p>
        </div>

        {/* User Badge / Active Investigator Avatar */}
        <div className="flex items-center gap-3 bg-[#081022] px-3.5 py-2 rounded-xl border border-[#14233c] shadow-sm">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#081022] absolute bottom-0 right-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 font-medium">{currentUser.department} • Lead Custodian</span>
          </div>
        </div>
      </div>

      {/* ── Top 5 Stat Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: TOTAL TRANSACTIONS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-cyan-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Camera className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL TRANSACTIONS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              256
            </div>
            <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
              ↑ 19 this week
            </div>
          </div>
        </div>

        {/* Metric 2: EVIDENCE ITEMS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              EVIDENCE ITEMS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              1,246
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              Active in Chain
            </div>
          </div>
        </div>

        {/* Metric 3: CUSTODY HOLDERS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              CUSTODY HOLDERS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              28
            </div>
            <div className="text-[10px] font-semibold text-purple-400">
              Authorized Users
            </div>
          </div>
        </div>

        {/* Metric 4: PENDING TRANSFERS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-red-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-red-400/90 uppercase tracking-wider">
              PENDING TRANSFERS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              3
            </div>
            <div className="text-[10px] font-semibold text-red-400">
              Requires Action
            </div>
          </div>
        </div>

        {/* Metric 5: COMPLIANCE SCORE */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              COMPLIANCE SCORE
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              100%
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              Fully Compliant
            </div>
          </div>
        </div>

      </div>

      {/* ── Main 3-Column Core Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ── 1. EVIDENCE DETAILS (Left Column - 4 cols) ─────────────────────── */}
        <div className="lg:col-span-4 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Cyan Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                EVIDENCE DETAILS
              </h2>
              {/* Evidence Item Dropdown */}
              <select
                value={selectedEvidenceId}
                onChange={(e) => setSelectedEvidenceId(e.target.value)}
                className="bg-[#091224] border border-slate-700 focus:border-cyan-500 rounded-lg px-2 py-0.5 text-[11px] font-mono text-cyan-300 focus:outline-none cursor-pointer"
              >
                <option value="EV-1246">EV-1246</option>
                <option value="EV-1247">EV-1247</option>
                <option value="EV-1248">EV-1248</option>
              </select>
            </div>

            {/* Evidence Metadata Fields */}
            <div className="space-y-3">
              
              {/* Evidence ID */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Evidence ID</span>
                <span className="text-xs font-bold text-white font-mono bg-[#091224] px-2 py-0.5 rounded border border-slate-700">
                  {currentItem.evidenceId}
                </span>
              </div>

              {/* Evidence Name */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Evidence Name</span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[170px]" title={currentItem.evidenceName}>
                  {currentItem.evidenceName}
                </span>
              </div>

              {/* Evidence Type */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Evidence Type</span>
                <span className="text-xs font-medium text-slate-300">
                  {currentItem.evidenceType}
                </span>
              </div>

              {/* Current Custodian */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Current Custodian</span>
                <span className="text-xs font-semibold text-white">
                  {currentItem.currentCustodian}
                </span>
              </div>

              {/* Current Location */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Current Location</span>
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  {currentItem.currentLocation}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pb-2 border-b border-[#14233c]/60">
                <span className="text-xs text-slate-400 font-medium">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentItem.status}
                </span>
              </div>

              {/* Integrity Status */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-slate-400 font-medium">Integrity Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {currentItem.integrityStatus}
                </span>
              </div>

            </div>
          </div>

          {/* Action Buttons at Bottom */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('evidence-dna');
                } else if (onSelectAction) {
                  onSelectAction(`Viewing Evidence DNA for ${currentItem.evidenceId}`);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Box className="w-4 h-4" />
              <span>VIEW EVIDENCE DNA</span>
            </button>

            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs text-cyan-300 bg-[#0c1830] hover:bg-[#122244] border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Initiate Custody Handover</span>
            </button>
          </div>
        </div>

        {/* ── 2. CUSTODY CHAIN (Middle Column - 5 cols) ─────────────────────── */}
        <div className="lg:col-span-5 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Purple Background Glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                CUSTODY CHAIN
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {currentItem.steps.length} Immutable Events
              </span>
            </div>

            {/* Vertical Custody Chain Timeline Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-red-500 before:via-blue-500 before:to-purple-500">
              {currentItem.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepDetail(step)}
                  className="relative group cursor-pointer transition-all hover:translate-x-1"
                >
                  {/* Stepper Node Circle Icon */}
                  <div
                    className={`absolute -left-6 top-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.circleColor}`}
                  >
                    {step.iconType === 'user' && <User className="w-3.5 h-3.5" />}
                    {step.iconType === 'lab' && <Fingerprint className="w-3.5 h-3.5" />}
                    {step.iconType === 'lock' && <Lock className="w-3.5 h-3.5" />}
                    {step.iconType === 'camera' && <Camera className="w-3.5 h-3.5" />}
                  </div>

                  {/* Step Content Card */}
                  <div className="bg-[#091224]/90 border border-slate-800 group-hover:border-cyan-500/50 rounded-xl p-3 shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {/* Action Title */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-extrabold uppercase tracking-wide ${step.actionColor}`}>
                            {step.action}
                          </span>
                          <span className="text-[11px] font-semibold text-white">
                            {step.action === 'Collected' ? `by ${step.actorName}` : step.action === 'Transferred' ? `to ${step.actorName}` : `by ${step.actorName}`}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{step.location}</span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-mono font-bold text-slate-300">
                          {step.timestamp.split(',')[0]}
                        </div>
                        <div className="text-[9.5px] font-mono text-cyan-400">
                          {step.timestamp.split(',')[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Sync Status at bottom */}
          <div className="pt-3 border-t border-[#14233c] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Cryptographic Chain Intact
            </span>
            <span className="text-slate-500">Block Proof #19842109</span>
          </div>
        </div>

        {/* ── 3. CHAIN SUMMARY (Right Column - 3 cols) ─────────────────────── */}
        <div className="lg:col-span-3 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Blue Background Glow */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                CHAIN SUMMARY
              </h2>
            </div>

            {/* Circular Gauge: 100% Chain Complete */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress Glow Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="url(#custodyGradient)"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}
                  />
                  <defs>
                    <linearGradient id="custodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Text in Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {currentItem.complianceScore}%
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    Chain Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Statistics Breakdown Rows */}
            <div className="space-y-2.5 text-xs pt-2">
              
              {/* Total Handovers */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#091224]/80 border border-slate-800/60">
                <span className="text-slate-400 text-xs">Total Handovers</span>
                <span className="font-extrabold text-white font-mono text-sm">
                  {currentItem.totalHandovers}
                </span>
              </div>

              {/* Total Custodians */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#091224]/80 border border-slate-800/60">
                <span className="text-slate-400 text-xs">Total Custodians</span>
                <span className="font-extrabold text-white font-mono text-sm">
                  {currentItem.totalCustodians}
                </span>
              </div>

              {/* Breaks in Chain */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#091224]/80 border border-slate-800/60">
                <span className="text-slate-400 text-xs">Breaks in Chain</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  {currentItem.breaksInChain}
                </span>
              </div>

              {/* Last Updated */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#091224]/80 border border-slate-800/60">
                <span className="text-slate-400 text-[11px]">Last Updated</span>
                <span className="font-semibold text-slate-200 text-[10px] font-mono">
                  {currentItem.lastUpdated}
                </span>
              </div>

            </div>
          </div>

          {/* Action Button: EXPORT CHAIN LOG */}
          <div className="pt-3 border-t border-[#14233c]">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT CHAIN LOG</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: EXPORT CHAIN LOG / COURT DOSSIER ──────────────────────────── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  EXPORT COURT-READY CHAIN OF CUSTODY LOG • {currentItem.evidenceId}
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs bg-[#050b16]">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#071322] space-y-3">
                <div className="text-center pb-2 border-b border-cyan-900/50">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-cyan-400">
                    NATIONAL JUDICIAL EVIDENCE REPOSITORY
                  </div>
                  <div className="text-base font-extrabold text-white">
                    CHAIN OF CUSTODY MASTER MANIFEST & CUSTODIAL AUDIT
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Form 65B Certified • Cryptographic Non-Repudiation Verified
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-slate-400">Evidence ID:</strong> <span className="text-white font-mono">{currentItem.evidenceId}</span></div>
                  <div><strong className="text-slate-400">Artifact:</strong> <span className="text-white">{currentItem.evidenceName}</span></div>
                  <div><strong className="text-slate-400">Lead Officer:</strong> <span className="text-white">{currentUser.name} ({currentUser.department})</span></div>
                  <div><strong className="text-slate-400">Compliance:</strong> <span className="text-emerald-400 font-bold">100% Unbroken Chain</span></div>
                </div>

                {/* Stepper Table */}
                <div className="pt-2 border-t border-cyan-900/50">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Custodial Movement Trail:</div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {currentItem.steps.map((s, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-[#040812] border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-cyan-300">[{s.action}]</span> {s.actorName} ({s.actorRole})
                        </div>
                        <div className="text-slate-400">{s.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Signed with ECDSA Key of Delhi Police Forensics Division</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Downloading Court Dossier for ${currentItem.evidenceId}`);
                    setIsExportModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
                >
                  Download Master PDF
                </button>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INITIATE CUSTODY HANDOVER ─────────────────────────────────── */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  INITIATE CUSTODY HANDOVER • {currentItem.evidenceId}
                </h3>
              </div>
              <button
                onClick={() => setIsHandoverModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Recipient Custodian</label>
                <input
                  type="text"
                  value={handoverTo}
                  onChange={(e) => setHandoverTo(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Destination Facility</label>
                <input
                  type="text"
                  value={handoverLocation}
                  onChange={(e) => setHandoverLocation(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Transfer Reason & Authorization Mandate</label>
                <textarea
                  rows={2}
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-purple-900/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Current Custodian Signature:</span>
                  <span className="font-mono text-emerald-400 font-bold">{currentUser.name} (Verified)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Ledger Smart Contract:</span>
                  <span className="font-mono text-cyan-400">0xVault_Custody_v4</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button
                onClick={() => setIsHandoverModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateHandover}
                disabled={isSubmittingHandover}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5"
              >
                {isSubmittingHandover ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing on Ledger...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Sign & Transfer Custody</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: STEP DETAIL INSPECTOR ────────────────────────────────────── */}
      {selectedStepDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-blue-500/40 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  CUSTODY EVENT DETAILS • [{selectedStepDetail.action}]
                </h3>
              </div>
              <button
                onClick={() => setSelectedStepDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Actor Name:</span>
                  <span className="text-white font-bold">{selectedStepDetail.actorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-cyan-300">{selectedStepDetail.actorRole}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Badge ID:</span>
                  <span className="text-emerald-400">{selectedStepDetail.actorBadge}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{selectedStepDetail.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-200">{selectedStepDetail.timestamp}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">Cryptographic Transaction Hash:</span>
                  <span className="text-purple-300 text-[10px] break-all">{selectedStepDetail.txHash}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Custodian Signature:</span>
                  <span className="text-emerald-300 text-[10px]">{selectedStepDetail.signature}</span>
                </div>
                {selectedStepDetail.notes && (
                  <div className="pt-1.5 border-t border-slate-800 font-sans">
                    <span className="text-slate-400 text-[10px] block">Operational Field Notes:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{selectedStepDetail.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedStepDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChainOfCustodyPage;
