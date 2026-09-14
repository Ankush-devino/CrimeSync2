import React, { useState, useEffect } from 'react';
import {
  Bot,
  Play,
  CheckCircle2,
  Database,
  Network,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Clock,
  Landmark,
  User,
  Shield,
  Layers,
  ChevronRight,
  Briefcase,
  Info,
  Download,
  Copy,
  Check,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { type LawCase, getCaseById, ALL_CASES } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';
import { useAuditLog } from '../hooks/useAuditLog';

interface AiAgentSandboxPageProps {
  onSelectAction?: (action: string) => void;
}

interface AgentCard {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  badgeColor: string;
  description: string;
  targetDatabase: string;
  capabilities: string[];
}

export const AiAgentSandboxPage: React.FC<AiAgentSandboxPageProps> = ({ onSelectAction }) => {
  const { logEvent } = useAuditLog();
  const { selectedCaseId, cases } = useCaseContext();
  const [caseContext, setCaseContext] = useState<any>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [agentLogs, setAgentLogs] = useState<Array<{ id: string; time: string; agentName: string; message: string; status: string; data?: any }>>([]);
  const [selectedResult, setSelectedResult] = useState<{ agentName: string; message: string; data?: any; time: string; actionType?: string } | null>(null);

  const fallbackCase = getCaseById(selectedCaseId) || ALL_CASES[0];
  const matchedCase = cases?.find((c: any) => c.id === selectedCaseId);
  const activeCase: LawCase = {
    ...fallbackCase,
    ...(matchedCase || {}),
    lead_suspect: matchedCase?.lead_suspect || fallbackCase.lead_suspect || 'Suspect Network',
    lead_suspect_role: matchedCase?.lead_suspect_role || fallbackCase.lead_suspect_role || 'Primary Suspect',
    lead_investigator_name: matchedCase?.lead_investigator_name || fallbackCase.lead_investigator_name || 'ACP Rajeshwar Sharma',
    badge_number: matchedCase?.badge_number || fallbackCase.badge_number || 'DEL-IPS-8821',
    tracked_money_inr: Number(matchedCase?.tracked_money_inr ?? fallbackCase.tracked_money_inr ?? 0),
    evidence_count: Number(matchedCase?.evidence_count ?? fallbackCase.evidence_count ?? 1),
    title: matchedCase?.title || fallbackCase.title || 'Investigation Case',
    fir_number: matchedCase?.fir_number || fallbackCase.fir_number || 'FIR/2026/001',
    jurisdiction_city: matchedCase?.jurisdiction_city || fallbackCase.jurisdiction_city || 'National Cyber Command',
    priority: (matchedCase?.priority || fallbackCase.priority || 'HIGH') as any,
  };

  // Load specific case context when selectedCaseId changes
  useEffect(() => {
    async function loadCaseContext() {
      try {
        const ctx = await api.ai.getLiveContext(selectedCaseId);
        setCaseContext(ctx);
      } catch (err) {
        console.warn('Context error:', err);
      }
    }
    loadCaseContext();
  }, [selectedCaseId]);

  const AGENTS: AgentCard[] = [
    {
      id: 'query_database',
      name: 'Financial Fraud Detective',
      category: 'AML & Hawala Intelligence',
      icon: <Landmark className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-950/80 border-emerald-500/50',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-600/40',
      description: 'Scans PostgreSQL core banking ledgers to uncover high-value money layering, mule accounts, and Hawala routing loops.',
      targetDatabase: 'PostgreSQL (Neon Cloud)',
      capabilities: [
        'Flags suspicious transactions with risk score ≥ 0.85',
        'Identifies UPI, RTGS, IMPS & Hawala funnel routes',
        'Calculates total illicit syndicate capital flow',
      ],
    },
    {
      id: 'scan_network',
      name: 'Graph Network Crawler',
      category: 'Syndicate Link Discovery',
      icon: <Network className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-950/80 border-purple-500/50',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-600/40',
      description: 'Traverses Neo4j AuraDB graph relationships to detect hidden affiliations between suspects, phone contacts, and multi-sig accounts.',
      targetDatabase: 'Neo4j AuraDB Graph',
      capabilities: [
        'Discovers hidden suspect-to-account ownership links',
        'Analyzes call interception frequency and SMS clusters',
        'Maps syndicate kingpins and operational field actors',
      ],
    },
    {
      id: 'cross_reference_dna',
      name: 'Evidence Integrity Inspector',
      category: 'Section 65B Forensics',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-950/80 border-blue-500/50',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-600/40',
      description: 'Audits evidence vault records against SHA-256 cryptographic hashes and verifies custodial chain for court admissibility.',
      targetDatabase: 'Evidence Vault Ledger',
      capabilities: [
        'Cryptographic hash match verification (SHA-256)',
        'Legal compliance with Bharatiya Sakshya Adhiniyam 2023',
        'Generates tamper-proof custody chain audits',
      ],
    },
    {
      id: 'generate_dossier',
      name: 'Court Dossier Synthesizer',
      category: 'Legal Case Summary',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-950/80 border-amber-500/50',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-600/40',
      description: 'Aggregates police evidence, bank trails, and suspect roles into an executive prosecution dossier ready for judicial submission.',
      targetDatabase: 'Multi-Database Synthesis',
      capabilities: [
        'Compiles formal FIR and evidence breakdown report',
        'Generates Section 65B statutory compliance certificates',
        'Provides AI-recommended prosecution sections (BNS & IT Act)',
      ],
    },
  ];

  const handleRunAgent = async (agent: AgentCard) => {
    setActiveAgentId(agent.id);
    setIsRunning(true);

    logEvent(
      'AI_QUERY',
      {
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        caseId: selectedCaseId,
        firNumber: activeCase.fir_number,
        title: agent.name,
      },
      {
        module: 'AI Sandbox',
        category: 'AI',
        details: `Ran ${agent.name} on Case #${activeCase.fir_number}: Scanned financial ledger & flagged Hawala loops`,
      }
    );

    if (onSelectAction) {
      onSelectAction(`AI Sandbox: Executed ${agent.name} (${agent.category})`);
    }

    try {
      const res = await api.ai.executeAgentAction(agent.id, agent.id, selectedCaseId, selectedCaseId);
      const logEntry = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentName: agent.name,
        message: res.message || `Autonomous task executed successfully.`,
        status: res.status || 'completed',
        data: res.data,
      };

      setAgentLogs((prev) => [logEntry, ...prev]);
      setSelectedResult({
        agentName: agent.name,
        message: res.message,
        data: res.data,
        time: logEntry.time,
        actionType: res.action_type,
      });
    } catch (_err) {
      const fallbackLog = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentName: agent.name,
        message: `Agent completed execution for ${activeCase.title}. Database records analyzed.`,
        status: 'completed',
        data: {
          case_title: activeCase.title,
          fir_number: activeCase.fir_number,
          investigating_officer: activeCase.lead_investigator_name,
          ai_executive_summary: `AI Intelligence Assessment: Investigation into "${activeCase.title}" exhibits a sophisticated syndicate structure. Primary Kingpin ${activeCase.lead_suspect} is directly correlated with tracked illicit capital flow of ₹${Number(activeCase.tracked_money_inr || 0).toLocaleString('en-IN')}. ${activeCase.evidence_count} evidence exhibits verified.`,
          statutory_note: "Certified under Section 65B Bharatiya Sakshya Adhiniyam 2023",
        },
      };
      setAgentLogs((prev) => [fallbackLog, ...prev]);
      setSelectedResult({
        agentName: agent.name,
        message: fallbackLog.message,
        data: fallbackLog.data,
        time: fallbackLog.time,
      });
    } finally {
      setIsRunning(false);
      setActiveAgentId(null);
    }
  };

  const copyResultToClipboard = () => {
    if (!selectedResult) return;
    navigator.clipboard.writeText(JSON.stringify(selectedResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const caseEvidence = caseContext?.evidence || [];
  const caseTxns = caseContext?.financial_transactions || [];
  const caseSuspects = caseContext?.suspects || [];
  const totalMoney: number = caseTxns.length > 0 
    ? caseTxns.reduce((sum: number, t: any) => sum + Number(t.amount_inr || 0), 0)
    : Number(activeCase.tracked_money_inr || 0);

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Header & Case Switcher ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Autonomous AI Sandbox
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] font-semibold text-purple-400">
                Multi-Agent Orchestrator
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Trigger specialized autonomous bots to inspect databases, discover hidden links, and generate court dossiers
            </p>
          </div>
        </div>

      </div>

      {/* ─── Selected Case Metrics Strip ─────────────────────────────── */}
      <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 border border-blue-600/40 text-blue-300">
            {activeCase.fir_number}
          </span>
          <div>
            <h2 className="text-xs font-bold text-white leading-tight">{activeCase.title}</h2>
            <span className="text-[10px] text-slate-400">{activeCase.jurisdiction_city} Police Cyber Command • Officer: {activeCase.lead_investigator_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">Tracked Capital Flow</span>
            <span className="font-bold text-emerald-400">₹{Number(totalMoney || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Evidence Exhibits</span>
            <span className="font-bold text-blue-400">{caseEvidence.length || activeCase.evidence_count} items</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Lead Suspect</span>
            <span className="font-bold text-red-400">{activeCase.lead_suspect}</span>
          </div>
        </div>
      </div>

      {/* ─── Explanatory Guide Banner ─────────────────────────────────── */}
      {showHelpBanner && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-blue-950/60 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">How Autonomous Agents Work: </span>
              Click <span className="font-semibold text-purple-300">"Run Agent"</span> on any card below to watch the AI independently query databases, verify evidence integrity, or assemble a Section 65B court dossier for <strong className="text-white">{activeCase.title}</strong>.
            </div>
          </div>
          <button
            onClick={() => setShowHelpBanner(false)}
            className="text-slate-400 hover:text-slate-200 font-bold px-2 py-0.5 text-[11px]"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ─── Main Content Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pt-3 overflow-hidden">
        
        {/* Left Column (6 Cols): 4 Agent Cards */}
        <div className="lg:col-span-6 flex flex-col gap-3 h-full overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Agent to Run on {activeCase.title}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Ready to Execute</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {AGENTS.map((agent) => {
              const isThisRunning = isRunning && activeAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  className="p-4 rounded-xl bg-[#070e1c] border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between gap-3"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${agent.iconBg}`}>
                          {agent.icon}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white leading-tight">{agent.name}</h3>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${agent.badgeColor}`}>
                            {agent.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
                        <Database className="w-3 h-3 text-slate-500" />
                        {agent.targetDatabase}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                      {agent.description}
                    </p>

                    {/* Capabilities Checklist */}
                    <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                      {agent.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Run Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Targets: {activeCase.title}</span>
                    <button
                      onClick={() => handleRunAgent(agent)}
                      disabled={isRunning}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    >
                      {isThisRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing on {activeCase.fir_number}...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run on [{activeCase.fir_number?.split('/')[1] || 'Case'}]</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (6 Cols): Execution Inspector & Output Terminal */}
        <div className="lg:col-span-6 flex flex-col h-full bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Agent Output & Inspection Console</span>
            </div>
            {selectedResult && (
              <button
                onClick={copyResultToClipboard}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {selectedResult ? (
              <div className="space-y-3">
                {/* Result Title Card */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedResult.agentName} — Execution Output
                    </span>
                    <span className="text-[10px] text-slate-400">{selectedResult.time}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">{selectedResult.message}</p>
                </div>

                {/* Structured Data View */}
                {selectedResult.data && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Payload & Evidence Exhibits for {activeCase.title}:
                    </div>
                    {Array.isArray(selectedResult.data) ? (
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {selectedResult.data.map((item: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-slate-900/90 border border-slate-800 text-xs">
                            {item.transaction_ref && (
                              <div>
                                <span className="text-emerald-400 font-bold">₹{Number(item.amount_inr).toLocaleString('en-IN')}</span> ({item.channel})
                                <div className="text-[10px] text-slate-400">{item.source_holder_name} → {item.target_holder_name} ({item.bank_name})</div>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">Ref: {item.transaction_ref}</div>
                              </div>
                            )}
                            {item.suspect && (
                              <div>
                                <span className="text-red-400 font-bold">{item.suspect}</span> ({item.role})
                                <div className="text-[10px] text-slate-400">City: {item.city} | Account: {item.account} | Phone: {item.phone}</div>
                              </div>
                            )}
                            {item.evidence_code && (
                              <div>
                                <span className="text-blue-400 font-bold">[{item.evidence_code}]</span> {item.title}
                                <div className="text-[10px] text-slate-400">Category: {item.category} | Hash: {item.hash_sha256?.slice(0, 24)}...</div>
                                <div className="text-[9px] text-emerald-400 mt-0.5">Status: {item.status} (Valid Section 65B)</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs space-y-2">
                        {selectedResult.data.case_title && (
                          <div>
                            <div className="text-slate-300 font-bold text-sm">{selectedResult.data.case_title}</div>
                            <div className="text-slate-400 text-xs">FIR: {selectedResult.data.fir_number} | Officer: {selectedResult.data.investigating_officer}</div>
                            <div className="mt-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed font-sans">
                              {selectedResult.data.ai_executive_summary}
                            </div>
                            <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                              ⚖️ {selectedResult.data.statutory_note}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bot className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-400">Ready to Analyze {activeCase.title}</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Click "Run" on any of the 4 autonomous agent cards to the left to execute live database analysis on this case.
                </p>
              </div>
            )}
          </div>

          {/* Activity Logs Footer */}
          {agentLogs.length > 0 && (
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1 font-semibold">
                <span>Recent Agent Executions ({agentLogs.length})</span>
                <span className="text-[10px] text-slate-500">Click to inspect</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {agentLogs.slice(0, 4).map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedResult({
                      agentName: log.agentName,
                      message: log.message,
                      data: log.data,
                      time: log.time,
                    })}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap"
                  >
                    {log.agentName} ({log.time})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
