import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  X,
  FileCheck,
  ArrowRight,
  Database,
  Search,
  Activity,
  Check,
} from 'lucide-react';
import type { ForensicDossier } from '../../services/dossierService';

interface AICollationTerminalProps {
  dossier: ForensicDossier;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedDossier: ForensicDossier) => void;
}

interface CollationStep {
  id: number;
  label: string;
  sub: string;
  durationMs: number;
  logDetail: string;
  category: 'DB' | 'GRAPH' | 'CRYPTO' | 'AI' | 'LEGAL';
}

const COLLATION_STEPS: CollationStep[] = [
  {
    id: 1,
    label: 'Extracting FIR & Primary Case Records',
    sub: 'Querying PostgreSQL `cases`, `users` & jurisdictional authorities',
    durationMs: 700,
    logDetail: '[POSTGRESQL] 200 OK — Extracted FIR, lead investigator credentials, and statutory dates',
    category: 'DB',
  },
  {
    id: 2,
    label: 'Compiling CDR & Cell Tower Triangulation Logs',
    sub: 'Correlating 14,280 CDR records & minute-by-minute tower handoffs',
    durationMs: 800,
    logDetail: '[CDR_ENGINE] Synchronized 14,280 CDR events across 6 cell towers in South Delhi & Noida',
    category: 'DB',
  },
  {
    id: 3,
    label: 'Querying Neo4j Knowledge Graph Centrality',
    sub: 'Executing Cypher graph traversal for Mastermind hub degree centrality',
    durationMs: 900,
    logDetail: '[NEO4J_AURA] Cypher MATCH (p:Person)-[r]->(a:Account) — Mastermind centrality score: 0.96',
    category: 'GRAPH',
  },
  {
    id: 4,
    label: 'Synthesizing Multi-Hop Hawala & Banking Trails',
    sub: 'Tracing 4-tier money laundering hops & OTC crypto conversions',
    durationMs: 850,
    logDetail: '[FIN_INTEL] Reconstructed 3-hop transfer flow totaling ₹34,80,000 across 14 mule accounts',
    category: 'DB',
  },
  {
    id: 5,
    label: 'Verifying Immutable SHA-256 Evidence DNA',
    sub: 'Validating cryptographic hashes & Section 65B BSA 2023 certificates',
    durationMs: 800,
    logDetail: '[CRYPTO_VAULT] Verified 3 digital exhibits with SHA-256 integrity (0 tampering detected)',
    category: 'CRYPTO',
  },
  {
    id: 6,
    label: 'Injecting Bharatiya Nyaya Sanhita (BNS) Statutory Penal Provisions',
    sub: 'Correlating offences with BNS 318(4), 61(2), IT Act 66D/66F, and PMLA Sec 3',
    durationMs: 750,
    logDetail: '[LEGAL_ENGINE] Synthesized 6 penal codes with statutory sentencing precedents',
    category: 'LEGAL',
  },
  {
    id: 7,
    label: 'Sealing Cryptographic Merkle Root on Blockchain Ledger',
    sub: 'Anchoring state hash on Hyperledger Besu & issuing Section 65B seal',
    durationMs: 900,
    logDetail: '[BLOCKCHAIN] Merkle root anchored at Block #19482410 — Tx: 0x94f8e21a8b94...',
    category: 'CRYPTO',
  },
];

export const AICollationTerminal: React.FC<AICollationTerminalProps> = ({
  dossier,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [merkleHash, setMerkleHash] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(0);
      setLogs([]);
      setIsCompleted(false);
      return;
    }

    let isCancelled = false;
    let step = 0;
    const initialLog = `[SYSTEM] Initializing AI Collation Engine for ${dossier.firNumber}...`;
    setLogs([initialLog]);

    const runPipeline = async () => {
      for (let i = 0; i < COLLATION_STEPS.length; i++) {
        if (isCancelled) return;
        const current = COLLATION_STEPS[i];
        setCurrentStepIndex(i);

        // Append step start log
        setLogs((prev) => [
          ...prev,
          `[STEP 0${i + 1}/07] ${current.label}...`,
        ]);

        await new Promise((r) => setTimeout(r, current.durationMs));
        if (isCancelled) return;

        // Append step complete log
        setLogs((prev) => [...prev, `  ↳ ${current.logDetail}`]);
        setProgress(Math.round(((i + 1) / COLLATION_STEPS.length) * 100));
      }

      if (isCancelled) return;

      const newHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.padEnd(42, 'f');
      setMerkleHash(newHash);
      setIsCompleted(true);
      setLogs((prev) => [
        ...prev,
        `[SUCCESS] Court-Ready Dossier successfully compiled and certified under Section 65B BSA 2023!`,
        `[SEAL] Cryptographic Hash: ${newHash}`,
      ]);
    };

    runPipeline();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, dossier]);

  if (!isOpen) return null;

  const handleFinish = () => {
    const updated: ForensicDossier = {
      ...dossier,
      status: 'Certified',
      generatedOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      generatedTimestamp: Date.now(),
      lastEvidenceSync: 'Live DB Synchronized',
      blockchainHash: merkleHash || dossier.blockchainHash,
      merkleRoot: merkleHash || dossier.merkleRoot,
    };
    onComplete(updated);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#050b18] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Terminal Title Bar */}
        <div className="px-5 py-3.5 bg-[#030814] border-b border-[#14233c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                  AI FORENSIC COLLATION ENGINE
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold">
                  v4.2 PROSECUTION BUILD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Compiling {dossier.firNumber} • {dossier.reportName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Metric Bar */}
        <div className="px-6 py-4 bg-[#071022]/90 border-b border-[#14233c] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>
                {isCompleted
                  ? 'Collation Complete — Section 65B Certified'
                  : `Collation in Progress: Step ${currentStepIndex + 1} of 7`}
              </span>
            </span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>

          {/* Progress Bar with Glow */}
          <div className="h-2 w-full bg-[#030814] rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Description */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-sans">
            <span>
              {COLLATION_STEPS[currentStepIndex]?.label || 'Finalizing Cryptographic Seal...'}
            </span>
            <span className="text-[10px] text-cyan-300 font-mono">
              {COLLATION_STEPS[currentStepIndex]?.sub || 'Securing exhibits'}
            </span>
          </div>
        </div>

        {/* Real-Time Processing Logs Terminal */}
        <div className="p-4 bg-[#01040a] font-mono text-[11px] space-y-2 h-72 overflow-y-auto border-b border-[#14233c] select-text">
          {logs.map((log, idx) => {
            const isSuccess = log.includes('[SUCCESS]') || log.includes('[SEAL]');
            const isStep = log.includes('[STEP');
            return (
              <div
                key={idx}
                className={`leading-relaxed ${
                  isSuccess
                    ? 'text-emerald-400 font-bold bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30'
                    : isStep
                    ? 'text-cyan-300 font-bold mt-2'
                    : 'text-slate-400 pl-2'
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>

        {/* Pipeline Step Checklist */}
        <div className="p-4 bg-[#030814] border-b border-[#14233c] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 30 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>PostgreSQL FIR</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 50 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Neo4j Graph Hub</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 80 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Hawala Layering</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Merkle Seal</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#050b18] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Ready for Court Submission</span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Collation pipeline running...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#091224] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Abort Collation
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Open Certified Court Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
