import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Layers,
  Box,
  Share2,
  ExternalLink,
  Eye,
  Download,
  RefreshCw,
  Search,
  Sliders,
  Database,
  Lock,
  Shield,
  AlertCircle,
  Filter,
  Sparkles,
  Zap,
  Cpu,
  Fingerprint,
  FileSpreadsheet,
  Film,
  Music,
  FileCode,
  CheckCircle,
  X,
  Radio
} from 'lucide-react';
import { useAuditLog } from '../hooks/useAuditLog';

interface EvidenceDnaPageProps {
  onSelectAction?: (action: string) => void;
}

interface EvidenceCase {
  id: string;
  evidenceId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sha256: string;
  aiFingerprint: string;
  createdOn: string;
  integrityStatus: 'Verified' | 'Tampered' | 'Pending';
  matchScore: number;
  algorithm: string;
  blockHeight: number;
  txHash: string;
  merkleRoot: string;
  highConfidenceCount: number;
  medConfidenceCount: number;
  lowConfidenceCount: number;
  noMatchCount: number;
  matches: {
    id: string;
    targetEvidenceId: string;
    targetFileName: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    caseRef: string;
    suspect: string;
    matchType: string;
  }[];
}

const SAMPLE_CASES: Record<number, EvidenceCase> = {
  1: {
    id: 'case-1',
    evidenceId: 'EV-1246',
    fileName: 'FIR_4587_Theft_Case.pdf',
    fileType: 'PDF Document',
    fileSize: '4.82 MB',
    sha256: '0x7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3918bca4190c42f',
    aiFingerprint: '7A3F-9C2D-4B1E-8F77',
    createdOn: '27 Aug 2026, 10:31 PM',
    integrityStatus: 'Verified',
    matchScore: 28.4,
    algorithm: 'SHA-256 + AI Fingerprint',
    blockHeight: 19842109,
    txHash: '0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4',
    merkleRoot: '0x88f4e1902ba9841029cba8712398410928371029384710928371029384710293',
    highConfidenceCount: 12,
    medConfidenceCount: 12,
    lowConfidenceCount: 3,
    noMatchCount: 279,
    matches: [
      {
        id: 'm-1',
        targetEvidenceId: 'EV-0982',
        targetFileName: 'FIR_CyberFraud_Khan.pdf',
        similarity: 94.2,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-981',
        suspect: 'Aman Khan',
        matchType: 'Semantic Text & Header DNA Overlap'
      },
      {
        id: 'm-2',
        targetEvidenceId: 'EV-1104',
        targetFileName: 'Audio_Wiretap_Dubai.wav',
        similarity: 86.8,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-772',
        suspect: 'Farooq "The Shadow"',
        matchType: 'Acoustic Voiceprint Biometric Hash'
      },
      {
        id: 'm-3',
        targetEvidenceId: 'EV-0451',
        targetFileName: 'Ledger_Hawala_Karachi.xlsx',
        similarity: 64.1,
        confidence: 'MEDIUM',
        caseRef: 'CASE-2026-440',
        suspect: 'Shell Corp Alpha',
        matchType: 'Hawala Beneficiary Account Match'
      },
      {
        id: 'm-4',
        targetEvidenceId: 'EV-0831',
        targetFileName: 'CCTV_Gate3_Dropoff.mp4',
        similarity: 59.4,
        confidence: 'MEDIUM',
        caseRef: 'CASE-2026-619',
        suspect: 'Vikram J.',
        matchType: 'Facial Landmark Geometric DNA'
      }
    ]
  },
  2: {
    id: 'case-2',
    evidenceId: 'EV-1247',
    fileName: 'Hawala_Ledger_2026_Q2.xlsx',
    fileType: 'Excel Spreadsheet',
    fileSize: '12.4 MB',
    sha256: '0x9d4e78ab12c6ef44b09c812a39df110283719bc4892e7d3fa81b490e556c8021',
    aiFingerprint: '4B8E-1F92-6C3A-90E1',
    createdOn: '28 Aug 2026, 02:15 AM',
    integrityStatus: 'Verified',
    matchScore: 89.2,
    algorithm: 'BLAKE3 + Neural Vector Hash',
    blockHeight: 19842250,
    txHash: '0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a',
    merkleRoot: '0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7',
    highConfidenceCount: 38,
    medConfidenceCount: 14,
    lowConfidenceCount: 2,
    noMatchCount: 190,
    matches: [
      {
        id: 'm-21',
        targetEvidenceId: 'EV-0711',
        targetFileName: 'Swiss_Escrow_Transfer_Logs.csv',
        similarity: 98.4,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-981',
        suspect: 'Aman Khan',
        matchType: 'Exact IBAN & Transaction Cluster'
      },
      {
        id: 'm-22',
        targetEvidenceId: 'EV-0620',
        targetFileName: 'Invoice_DummyGoods_Dubai.pdf',
        similarity: 91.5,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-880',
        suspect: 'Al-Zubair Trading LLC',
        matchType: 'GSTIN & Routing Node Fingerprint'
      }
    ]
  },
  3: {
    id: 'case-3',
    evidenceId: 'EV-1248',
    fileName: 'CCTV_Gate4_Surveillance_Dump.mp4',
    fileType: 'H.265 Video Stream',
    fileSize: '842.1 MB',
    sha256: '0x3c2a11bf78de99aa44b1239c8710293847102938471029384710293847102938',
    aiFingerprint: '9E21-7D44-0A88-33BC',
    createdOn: '28 Aug 2026, 06:40 PM',
    integrityStatus: 'Verified',
    matchScore: 64.5,
    algorithm: 'Keccak-256 + Perceptual Video Hash',
    blockHeight: 19842410,
    txHash: '0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984',
    merkleRoot: '0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e',
    highConfidenceCount: 22,
    medConfidenceCount: 19,
    lowConfidenceCount: 8,
    noMatchCount: 215,
    matches: [
      {
        id: 'm-31',
        targetEvidenceId: 'EV-0312',
        targetFileName: 'ANPR_Vehicle_DL01CA9999.jpg',
        similarity: 88.7,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-512',
        suspect: 'Farooq Network',
        matchType: 'License Plate & Chassis Geometry'
      }
    ]
  },
  4: {
    id: 'case-4',
    evidenceId: 'EV-1249',
    fileName: 'Encrypted_Telegram_Export.json',
    fileType: 'JSON Forensic Payload',
    fileSize: '18.9 MB',
    sha256: '0xae8821bc493df1104e76a91b2837102938471029384710293847102938471029',
    aiFingerprint: '3C11-88AA-22EF-901B',
    createdOn: '29 Aug 2026, 09:12 AM',
    integrityStatus: 'Verified',
    matchScore: 97.8,
    algorithm: 'SHA-256 + AI Fingerprint',
    blockHeight: 19842600,
    txHash: '0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c',
    merkleRoot: '0x4892e7d3fa81b490e556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c',
    highConfidenceCount: 45,
    medConfidenceCount: 6,
    lowConfidenceCount: 1,
    noMatchCount: 110,
    matches: [
      {
        id: 'm-41',
        targetEvidenceId: 'EV-0511',
        targetFileName: 'Signal_Chat_Intercept_Khan.json',
        similarity: 99.1,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-981',
        suspect: 'Aman Khan',
        matchType: 'Stylometric Author Fingerprint & PGP Key'
      }
    ]
  },
  5: {
    id: 'case-5',
    evidenceId: 'EV-1250',
    fileName: 'Wiretap_Intercept_CallRec_08.wav',
    fileType: 'PCM Audio Recording',
    fileSize: '34.2 MB',
    sha256: '0x61f5c3da987beea124bb904539df110283719bc4892e7d3fa81b490e556c8021',
    aiFingerprint: '6F44-90B1-5E22-881C',
    createdOn: '29 Aug 2026, 04:55 PM',
    integrityStatus: 'Verified',
    matchScore: 42.1,
    algorithm: 'Keccak-256 + Acoustic Perceptual Hash',
    blockHeight: 19842780,
    txHash: '0x1e12db984aa712c9842109eefa418471b021dae984210912bcde43c99abf2874',
    merkleRoot: '0x918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3',
    highConfidenceCount: 16,
    medConfidenceCount: 18,
    lowConfidenceCount: 5,
    noMatchCount: 240,
    matches: [
      {
        id: 'm-51',
        targetEvidenceId: 'EV-0881',
        targetFileName: 'Dubai_VoIP_Intercept_03.wav',
        similarity: 82.4,
        confidence: 'HIGH',
        caseRef: 'CASE-2026-772',
        suspect: 'Farooq Network',
        matchType: 'Spectrogram Formant Frequency DNA'
      }
    ]
  }
};

export const EvidenceDnaPage: React.FC<EvidenceDnaPageProps> = ({ onSelectAction }) => {
  const { logEvent } = useAuditLog();
  const [selectedCaseNum, setSelectedCaseNum] = useState<number>(1);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('SHA-256 + AI Fingerprint');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState<boolean>(false);

  // Modals state
  const [isViewAllMatchesOpen, setIsViewAllMatchesOpen] = useState<boolean>(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<any | null>(null);

  const currentCase = SAMPLE_CASES[selectedCaseNum] || SAMPLE_CASES[1];

  // Auto-log exhibit inspection when case changes
  useEffect(() => {
    logEvent(
      'EVIDENCE_VIEW',
      { id: currentCase.evidenceId, fileName: currentCase.fileName, sha256: currentCase.sha256 },
      { module: 'Evidence DNA Lab', category: 'EVIDENCE', targetId: currentCase.evidenceId }
    );
  }, [selectedCaseNum]);

  // Handle Generate DNA button click
  const handleGenerateDna = () => {
    logEvent(
      'AI_QUERY',
      { action: 'GENERATE_DNA_VECTOR', evidenceId: currentCase.evidenceId, algorithm: selectedAlgorithm },
      { module: 'Neural DNA Engine', category: 'AI' }
    );
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStage('Reading binary stream & computing cryptographic hash...');

    setTimeout(() => {
      setGenerationProgress(35);
      setGenerationStage('Extracting neural token embeddings with Forensic LLM...');
    }, 600);

    setTimeout(() => {
      setGenerationProgress(70);
      setGenerationStage('Generating 128-dimensional invariant DNA vector...');
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(90);
      setGenerationStage('Sealing Merkle proof & anchoring to Polygon POS blockchain...');
    }, 1800);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage('Evidence DNA Generated & Verified on Ledger!');
      setTimeout(() => {
        setIsGenerating(false);
        if (onSelectAction) {
          onSelectAction(`Evidence DNA Generated for ${currentCase.fileName} [${currentCase.aiFingerprint}]`);
        }
      }, 500);
    }, 2400);
  };

  const copyToClipboard = (text: string, type: 'hash' | 'fingerprint') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.type || 'Binary Document'
      });
    }
  };

  // Helper for radial match chart gauge
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentCase.matchScore / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-5 selection:bg-purple-600/30 selection:text-purple-200">
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#111e33]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <Box className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
              EVIDENCE DNA
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Generate unique fingerprint for evidence using AI & hashing
          </p>
        </div>

        {/* Step / Case Switcher (1 2 3 4 5) */}
        <div className="flex items-center gap-2 bg-[#081022] p-1.5 rounded-xl border border-[#14233c] shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
            Evidence Case:
          </span>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => {
                setSelectedCaseNum(num);
                setUploadedFile(null);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                selectedCaseNum === num
                  ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] scale-110'
                  : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top 5 Stat Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: TOTAL EVIDENCE */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL EVIDENCE
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              1,246
            </div>
            <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
              ↑ 156 this week
            </div>
          </div>
        </div>

        {/* Metric 2: DNA PROFILES */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              DNA PROFILES
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              1,203
            </div>
            <div className="text-[10px] font-semibold text-fuchsia-400">
              96.5% Generated
            </div>
          </div>
        </div>

        {/* Metric 3: MATCHED PROFILES */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-amber-400/90 uppercase tracking-wider">
              MATCHED PROFILES
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              342
            </div>
            <div className="text-[10px] font-semibold text-amber-400">
              28.4% Matched
            </div>
          </div>
        </div>

        {/* Metric 4: UNIQUE SIGNATURES */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-sky-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-sky-400/90 uppercase tracking-wider">
              UNIQUE SIGNATURES
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              861
            </div>
            <div className="text-[10px] font-semibold text-sky-400">
              71.6% Unique
            </div>
          </div>
        </div>

        {/* Metric 5: INTEGRITY SCORE */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              INTEGRITY SCORE
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              99.8%
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              Excellent
            </div>
          </div>
        </div>

      </div>

      {/* ── Main 3-Column Core Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ── 1. EVIDENCE DNA GENERATOR (Left Column - 4 cols) ───────────────── */}
        <div className="lg:col-span-4 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                EVIDENCE DNA GENERATOR
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                v3.4 Engine
              </span>
            </div>

            {/* Upload Section */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold text-slate-300 block">
                Upload Evidence File
              </label>

              {/* Drag & Drop Box */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-purple-500/70 rounded-xl p-4 text-center transition-all bg-[#091224]/60 hover:bg-[#0c1830] group cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-purple-400 group-hover:border-purple-400 transition-all">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {uploadedFile ? uploadedFile.name : 'Drag & drop file here'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {uploadedFile ? `${uploadedFile.size} • ${uploadedFile.type}` : 'or browse to upload'}
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded bg-[#070d1a] border border-slate-800">
                    Supports: PDF, DOCX, JPG, PNG, MP4, CSV
                  </div>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] text-slate-500">Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => setUploadedFile({ name: 'FIR_Theft_Case_Delhi.pdf', size: '3.4 MB', type: 'PDF Document' })}
                  className="px-2 py-0.5 text-[9px] rounded bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 border border-slate-700/60"
                >
                  FIR PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadedFile({ name: 'Hawala_Ledger_Dubai.xlsx', size: '8.1 MB', type: 'Spreadsheet' })}
                  className="px-2 py-0.5 text-[9px] rounded bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 border border-slate-700/60"
                >
                  Ledger XLS
                </button>
                <button
                  type="button"
                  onClick={() => setUploadedFile({ name: 'CCTV_Gate_Night.mp4', size: '124 MB', type: 'H.264 Video' })}
                  className="px-2 py-0.5 text-[9px] rounded bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 border border-slate-700/60"
                >
                  CCTV Clip
                </button>
              </div>
            </div>

            {/* Select Algorithm Dropdown */}
            <div className="space-y-1.5 mb-4">
              <label className="text-[11px] font-bold text-slate-300 block">
                Select Algorithm
              </label>
              <div className="relative">
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="SHA-256 + AI Fingerprint">SHA-256 + AI Fingerprint</option>
                  <option value="SHA-512 + Neural Vector Hash (CLIP v2)">SHA-512 + Neural Vector Hash (CLIP v2)</option>
                  <option value="Keccak-256 + Acoustic Perceptual Hash">Keccak-256 + Acoustic Perceptual Hash</option>
                  <option value="BLAKE3 + Multi-Modal Forensic Vector">BLAKE3 + Multi-Modal Forensic Vector</option>
                  <option value="Ethereum zk-SNARK Merkle Proof">Ethereum zk-SNARK Merkle Proof</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Security Anchoring Badges */}
            <div className="p-2.5 rounded-xl bg-[#091224]/80 border border-[#14233c] space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  Anchor Ledger:
                </span>
                <span className="font-mono text-cyan-300 font-semibold">Polygon PoS #19842109</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Neural Model:
                </span>
                <span className="font-mono text-emerald-300 font-semibold">DeepSeek-Forensic-R1</span>
              </div>
            </div>
          </div>

          {/* Generate Button & Progress State */}
          <div className="space-y-2 pt-2">
            {isGenerating && (
              <div className="space-y-1.5 bg-[#091224] p-2.5 rounded-xl border border-purple-800/50 animate-pulse">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono">
                  <span className="truncate pr-2">{generationStage}</span>
                  <span className="font-bold">{generationProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateDna}
              disabled={isGenerating}
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                isGenerating
                  ? 'bg-purple-900/60 text-purple-300 cursor-not-allowed border border-purple-700/50'
                  : 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>PROCESSING EVIDENCE DNA...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-purple-200 fill-purple-200" />
                  <span>GENERATE DNA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 2. EVIDENCE DNA PROFILE (Middle Column - 5 cols) ──────────────── */}
        <div className="lg:col-span-5 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Cyan Background Glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                EVIDENCE DNA PROFILE
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE IMMUTABLE</span>
              </div>
            </div>

            {/* Profile Content Body: Left DNA Helix Visual + Right Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-4">
              
              {/* Left: Glowing Neon DNA Helix Animated Graphic (4 cols) */}
              <div className="md:col-span-4 flex items-center justify-center p-2">
                <div className="relative w-28 h-64 flex items-center justify-center">
                  {/* Glowing Animated SVG DNA Double Helix */}
                  <svg className="w-full h-full" viewBox="0 0 100 240" fill="none">
                    <defs>
                      <linearGradient id="cyanHelix" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="magentaHelix" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
                      </linearGradient>
                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* DNA Base Pairs Rungs (10 rungs) */}
                    {[20, 42, 64, 86, 108, 130, 152, 174, 196, 218].map((y, idx) => {
                      const phase = (idx * Math.PI) / 4;
                      const x1 = 50 + 35 * Math.sin(phase);
                      const x2 = 50 - 35 * Math.sin(phase);
                      const isEven = idx % 2 === 0;

                      return (
                        <g key={idx} className="transition-all duration-700">
                          {/* Base-pair Connector Line */}
                          <line
                            x1={x1}
                            y1={y}
                            x2={x2}
                            y2={y}
                            stroke={isEven ? '#c084fc' : '#38bdf8'}
                            strokeWidth="2"
                            strokeOpacity="0.75"
                            strokeDasharray="2 2"
                            filter="url(#neonGlow)"
                          />
                          {/* Left Strand Node */}
                          <circle
                            cx={x1}
                            cy={y}
                            r="5"
                            fill="url(#magentaHelix)"
                            stroke="#ffffff"
                            strokeWidth="1"
                            filter="url(#neonGlow)"
                            className="animate-pulse"
                          />
                          {/* Right Strand Node */}
                          <circle
                            cx={x2}
                            cy={y}
                            r="5"
                            fill="url(#cyanHelix)"
                            stroke="#ffffff"
                            strokeWidth="1"
                            filter="url(#neonGlow)"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    })}

                    {/* Left Smooth Strand Backbone */}
                    <path
                      d="M 50 10 Q 90 40, 50 70 T 50 130 T 50 190 T 50 230"
                      stroke="url(#magentaHelix)"
                      strokeWidth="2.5"
                      fill="none"
                      filter="url(#neonGlow)"
                    />
                    {/* Right Smooth Strand Backbone */}
                    <path
                      d="M 50 10 Q 10 40, 50 70 T 50 130 T 50 190 T 50 230"
                      stroke="url(#cyanHelix)"
                      strokeWidth="2.5"
                      fill="none"
                      filter="url(#neonGlow)"
                    />
                  </svg>
                </div>
              </div>

              {/* Right: Detailed Metadata List (8 cols) */}
              <div className="md:col-span-8 space-y-3">
                
                {/* Evidence ID */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#14233c]/60">
                  <span className="text-[11px] text-slate-400">Evidence ID</span>
                  <span className="text-xs font-bold text-white font-mono bg-[#091224] px-2 py-0.5 rounded border border-slate-700/60">
                    {currentCase.evidenceId}
                  </span>
                </div>

                {/* File Name */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#14233c]/60">
                  <span className="text-[11px] text-slate-400">File Name</span>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[170px]" title={currentCase.fileName}>
                    {currentCase.fileName}
                  </span>
                </div>

                {/* File Type */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#14233c]/60">
                  <span className="text-[11px] text-slate-400">File Type</span>
                  <span className="text-xs font-medium text-slate-300">
                    {currentCase.fileType}
                  </span>
                </div>

                {/* DNA Hash (SHA-256) with Copy */}
                <div className="space-y-1 pb-1.5 border-b border-[#14233c]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">DNA Hash (SHA-256)</span>
                    <button
                      onClick={() => copyToClipboard(currentCase.sha256, 'hash')}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className="font-mono text-[10px] text-slate-300 bg-[#091224] p-1.5 rounded border border-slate-800 truncate cursor-pointer hover:border-slate-600"
                    title={currentCase.sha256}
                    onClick={() => copyToClipboard(currentCase.sha256, 'hash')}
                  >
                    {currentCase.sha256.substring(0, 24)}...
                  </div>
                </div>

                {/* AI Fingerprint */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#14233c]/60">
                  <span className="text-[11px] text-slate-400">AI Fingerprint</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-fuchsia-300 font-mono tracking-wider bg-fuchsia-950/50 px-2 py-0.5 rounded border border-fuchsia-800/50">
                      {currentCase.aiFingerprint}
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentCase.aiFingerprint, 'fingerprint')}
                      className="text-slate-400 hover:text-fuchsia-300"
                      title="Copy Fingerprint"
                    >
                      {copiedFingerprint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Created On */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#14233c]/60">
                  <span className="text-[11px] text-slate-400">Created On</span>
                  <span className="text-xs font-medium text-slate-300">
                    {currentCase.createdOn}
                  </span>
                </div>

                {/* Integrity Status */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-slate-400">Integrity Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#14233c]">
            <button
              onClick={() => setIsBlockchainModalOpen(true)}
              className="py-1.5 px-2.5 rounded-lg bg-[#0c1830] hover:bg-[#122244] text-cyan-300 border border-cyan-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-[0_0_10px_rgba(6,182,212,0.25)]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify on Chain</span>
            </button>
            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="py-1.5 px-2.5 rounded-lg bg-[#0c1830] hover:bg-[#122244] text-purple-300 border border-purple-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-[0_0_10px_rgba(168,85,247,0.25)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Court Certificate</span>
            </button>
          </div>
        </div>

        {/* ── 3. DNA MATCH RESULTS (Right Column - 3 cols) ─────────────────── */}
        <div className="lg:col-span-3 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Violet Glow */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                DNA MATCH RESULTS
              </h2>
            </div>

            {/* Circular Progress Radial Gauge */}
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
                    stroke="url(#matchGradient)"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))' }}
                  />
                  <defs>
                    <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Text in Gauge Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {currentCase.matchScore}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    Match Score
                  </span>
                </div>
              </div>
            </div>

            {/* Potential Matches Header + View All button */}
            <div className="flex items-center justify-between pt-2 pb-1.5 mb-2">
              <span className="text-xs font-bold text-slate-200">Potential Matches</span>
              <button
                onClick={() => setIsViewAllMatchesOpen(true)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-all"
              >
                View All
              </button>
            </div>

            {/* Match Breakdown Rows (High, Medium, Low, No Match) */}
            <div className="space-y-2 text-xs">
              
              {/* High Confidence */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#091224]/80 hover:bg-[#0c1830] transition-colors border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                  <span className="text-slate-300 text-[11px]">High Confidence</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {currentCase.highConfidenceCount}
                </span>
              </div>

              {/* Medium Confidence */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#091224]/80 hover:bg-[#0c1830] transition-colors border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                  <span className="text-slate-300 text-[11px]">Medium Confidence</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {currentCase.medConfidenceCount}
                </span>
              </div>

              {/* Low Confidence */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#091224]/80 hover:bg-[#0c1830] transition-colors border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                  <span className="text-slate-300 text-[11px]">Low Confidence</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {currentCase.lowConfidenceCount}
                </span>
              </div>

              {/* No Match */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#091224]/80 hover:bg-[#0c1830] transition-colors border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                  <span className="text-slate-300 text-[11px]">No Match</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {currentCase.noMatchCount}
                </span>
              </div>

            </div>
          </div>

          {/* Quick Match Preview Item */}
          <div className="pt-3 mt-3 border-t border-[#14233c]">
            <div
              onClick={() => setSelectedMatchDetail(currentCase.matches[0])}
              className="p-2 rounded-xl bg-[#091224] hover:bg-[#0d1c3a] border border-orange-500/30 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                  <span>★ Top Match: {currentCase.matches[0]?.targetEvidenceId}</span>
                </div>
                <div className="text-[11px] text-white font-semibold truncate">
                  {currentCase.matches[0]?.targetFileName}
                </div>
                <div className="text-[9.5px] text-slate-400">
                  Suspect: {currentCase.matches[0]?.suspect}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-orange-950 text-orange-300 border border-orange-700">
                  {currentCase.matches[0]?.similarity}%
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Additional Forensic Comparison Table ───────────────────────────────── */}
      <div className="bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#14233c] mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              CROSS-CASE EVIDENCE RECONCILIATION & CORRELATION MESH
            </h3>
            <p className="text-xs text-slate-400">
              Multi-dimensional cosine similarity matching against 1,246 seized intelligence artifacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Algorithm:</span>
            <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-700 text-purple-300 text-xs font-mono font-bold">
              {currentCase.algorithm}
            </span>
          </div>
        </div>

        {/* Evidence Correlation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-[#091224]/50">
                <th className="py-2.5 px-3">Target Evidence ID</th>
                <th className="py-2.5 px-3">Artifact File Name</th>
                <th className="py-2.5 px-3">Case Reference</th>
                <th className="py-2.5 px-3">Attributed Suspect</th>
                <th className="py-2.5 px-3">Biometric & Semantic Vector Match</th>
                <th className="py-2.5 px-3">Similarity</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {currentCase.matches.map((match) => (
                <tr key={match.id} className="hover:bg-[#091428] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                    {match.targetEvidenceId}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {match.targetFileName}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {match.caseRef}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    {match.suspect}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {match.matchType}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        match.confidence === 'HIGH'
                          ? 'bg-orange-950/80 text-orange-300 border border-orange-700'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {match.similarity}% {match.confidence}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedMatchDetail(match)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-900/50 text-slate-200 hover:text-purple-300 border border-slate-700 text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: VIEW ALL MATCHES ──────────────────────────────────────────── */}
      {isViewAllMatchesOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  ALL POTENTIAL EVIDENCE MATCHES ({currentCase.highConfidenceCount + currentCase.medConfidenceCount + currentCase.lowConfidenceCount})
                </h3>
              </div>
              <button
                onClick={() => setIsViewAllMatchesOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentCase.matches.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#091224] border border-slate-700/80 hover:border-cyan-500/50 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-300 font-bold text-xs">
                        {item.targetEvidenceId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {item.similarity}% Similarity
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {item.targetFileName}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div><strong className="text-slate-300">Case:</strong> {item.caseRef}</div>
                      <div><strong className="text-slate-300">Suspect:</strong> {item.suspect}</div>
                      <div><strong className="text-slate-300">Match Basis:</strong> {item.matchType}</div>
                    </div>
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setSelectedMatchDetail(item);
                          setIsViewAllMatchesOpen(false);
                        }}
                        className="text-[10px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Deep Forensic Compare →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between text-xs text-slate-400">
              <span>Sorted by Cosine Distance (Highest Similarity First)</span>
              <button
                onClick={() => setIsViewAllMatchesOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: BLOCKCHAIN PROOF INSPECTION ──────────────────────────────── */}
      {isBlockchainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  IMMUTABLE LEDGER PROOF • {currentCase.evidenceId}
                </h3>
              </div>
              <button
                onClick={() => setIsBlockchainModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Artifact:</span>
                  <span className="text-white font-semibold">{currentCase.fileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Blockchain Network:</span>
                  <span className="text-cyan-400 font-bold">Polygon PoS (Mainnet)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Block Height:</span>
                  <span className="text-white font-bold">#{currentCase.blockHeight.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consensus Confirmations:</span>
                  <span className="text-emerald-400 font-bold">4,812 Blocks (Finalized)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Transaction Hash</span>
                  <span className="text-purple-300 break-all text-[11px]">{currentCase.txHash}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Merkle Tree Root</span>
                  <span className="text-cyan-300 break-all text-[11px]">{currentCase.merkleRoot}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">SHA-256 Digest Seal</span>
                  <span className="text-emerald-300 break-all text-[11px]">{currentCase.sha256}</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-mono">✓ Cryptographically Non-Repudiable</span>
              <button
                onClick={() => setIsBlockchainModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: COURT-READY DNA CERTIFICATE ──────────────────────────────── */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  JUDICIAL EVIDENCE DNA CERTIFICATE • {currentCase.evidenceId}
                </h3>
              </div>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs bg-[#050b16]">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#071322] space-y-3">
                <div className="text-center pb-2 border-b border-emerald-900/50">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-emerald-400">
                    NATIONAL CYBER FORENSIC & EVIDENCE VAULT
                  </div>
                  <div className="text-base font-extrabold text-white">
                    CERTIFICATE OF FORENSIC AUTHENTICITY & NON-TAMPERING
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Issued under Section 65B Indian Evidence Act / ISO/IEC 27037 Digital Forensics Standards
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-slate-400">Evidence ID:</strong> <span className="text-white font-mono">{currentCase.evidenceId}</span></div>
                  <div><strong className="text-slate-400">File Name:</strong> <span className="text-white">{currentCase.fileName}</span></div>
                  <div><strong className="text-slate-400">Timestamp:</strong> <span className="text-white">{currentCase.createdOn}</span></div>
                  <div><strong className="text-slate-400">Integrity:</strong> <span className="text-emerald-400 font-bold">100% Intact (Zero Drift)</span></div>
                </div>

                <div className="pt-2 border-t border-emerald-900/50 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Permanent SHA-256 Ledger Hash:</div>
                  <div className="font-mono text-[10px] text-emerald-300 bg-[#030810] p-2 rounded border border-emerald-900/60 break-all">
                    {currentCase.sha256}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">AI Vector Fingerprint</div>
                    <div className="font-mono font-extrabold text-fuchsia-300 text-xs">{currentCase.aiFingerprint}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase">Ledger Merkle Proof</div>
                    <div className="font-mono text-cyan-300 text-[10px]">Root: {currentCase.merkleRoot.substring(0, 16)}...</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Cryptographically signed by CrimeSync Vault Authority</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Exporting PDF Certificate for ${currentCase.evidenceId}`);
                    setIsCertificateModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DEEP MATCH INSPECTION ────────────────────────────────────── */}
      {selectedMatchDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-orange-500/40 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(249,115,22,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-base text-white">
                  FORENSIC CORRELATION INSPECTOR
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatchDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-cyan-400">Source Evidence</div>
                  <div className="font-bold text-white text-sm">{currentCase.evidenceId}</div>
                  <div className="text-slate-300">{currentCase.fileName}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-orange-400">Matched Target</div>
                  <div className="font-bold text-white text-sm">{selectedMatchDetail.targetEvidenceId}</div>
                  <div className="text-slate-300">{selectedMatchDetail.targetFileName}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091224] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Match Confidence:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-700">
                    {selectedMatchDetail.similarity}% {selectedMatchDetail.confidence}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Linked Case Dossier:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedMatchDetail.caseRef}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Attributed Suspect:</span>
                  <span className="font-semibold text-white">{selectedMatchDetail.suspect}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1">Neural Matching Vector Rationale</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedMatchDetail.matchType}. Both artifacts exhibit identical acoustic or structural token vectors in latent parameter space (cosine distance &lt; 0.058).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction(`Linking ${currentCase.evidenceId} with ${selectedMatchDetail.targetEvidenceId}`);
                  setSelectedMatchDetail(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
              >
                Merge Case Evidence Graph
              </button>
              <button
                onClick={() => setSelectedMatchDetail(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
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

export default EvidenceDnaPage;
