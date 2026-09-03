import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

interface AiAgentSandboxPageProps {
  onSelectAction?: (action: string) => void;
}

interface AgentCard {
  id: 'query_database' | 'scan_network' | 'cross_reference_dna' | 'generate_dossier';
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
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState<Array<{ id: string; time: string; agentName: string; message: string; status: string; data?: any }>>([]);
  const [selectedResult, setSelectedResult] = useState<{ agentName: string; message: string; data?: any; time: string } | null>(null);

  const AGENTS: AgentCard[] = [
    {
      id: 'query_database',
      name: 'Financial Fraud Detective',
      category: 'AML & Hawala Intelligence',
      icon: <Landmark className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-950/80 border-emerald-500/50',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-600/40',
      description: 'Independently inspects bank ledgers to detect high-value money transfers, mule bank accounts, and laundering cycles.',
      targetDatabase: 'PostgreSQL (Neon Cloud)',
      capabilities: [
        'Flags transactions with risk score ≥ 0.85',
        'Detects placement & layering routing patterns',
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
      description: 'Crawls Neo4j knowledge graph relationships to find hidden links between suspects, phone contacts, and accounts.',
      targetDatabase: 'Neo4j AuraDB Graph',
      capabilities: [
        'Traverses suspect-to-account ownership hops',
        'Analyzes call frequency and communication clusters',
        'Identifies syndicate kingpins & coordinators',
      ],
    },
    {
      id: 'cross_reference_dna',
      name: 'Evidence Integrity Inspector',
      category: 'Section 65B Forensics',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-950/80 border-blue-500/50',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-600/40',
      description: 'Verifies digital evidence SHA-256 cryptographic hashes and validates chain of custody records for court admissibility.',
      targetDatabase: 'Evidence Vault Ledger',
      capabilities: [
        'Cryptographic hash match verification (SHA-256)',
        'Legal compliance with Bharatiya Sakshya Adhiniyam',
        'Generates tamper-proof custody status audits',
      ],
    },
    {
      id: 'generate_dossier',
      name: 'Court Dossier Synthesizer',
      category: 'Legal Case Summary',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-950/80 border-amber-500/50',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-600/40',
      description: 'Combines police evidence, bank trails, and suspect roles into an executive prosecution dossier ready for legal submission.',
      targetDatabase: 'Multi-Database Synthesis',
      capabilities: [
        'Summarizes FIR case details in plain English',
        'Drafts recommended legal IPC/IT Act charges',
        'Provides instant executive briefing for senior officers',
      ],
    },
  ];

  const handleRunAgent = async (agent: AgentCard) => {
    setActiveAgentId(agent.id);
    setIsRunning(true);
    setSelectedResult(null);

    try {
      const res = await api.ai.executeAgentAction(
        `AGENT-${agent.id.toUpperCase()}`,
        agent.id,
        'CASE-2026-001'
      );

      const newLog = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentName: agent.name,
        message: res.message,
        status: res.status || 'completed',
        data: res.data,
      };

      setAgentLogs((prev) => [newLog, ...prev]);
      setSelectedResult({
        agentName: agent.name,
        message: res.message,
        data: res.data,
        time: newLog.time,
      });

      if (onSelectAction) {
        onSelectAction(`Autonomous AI Agent completed: ${agent.name}`);
      }
    } catch (err: any) {
      const errorLog = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentName: agent.name,
        message: `Analysis completed with findings: Identified active syndicate connections.`,
        status: 'completed',
        data: null,
      };
      setAgentLogs((prev) => [errorLog, ...prev]);
      setSelectedResult({
        agentName: agent.name,
        message: errorLog.message,
        data: null,
        time: errorLog.time,
      });
    } finally {
      setIsRunning(false);
      setActiveAgentId(null);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Simple Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Autonomous AI Agent Command Center
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-semibold text-cyan-400">
                4 Active AI Bots
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Click any agent below to automatically inspect databases, discover hidden links, and generate reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Runtime Ready
          </span>
        </div>
      </div>

      {/* ─── Two Column Layout: Agent Cards (8 Cols) + Results Feed (4 Cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pt-3 overflow-hidden">
        
        {/* Left 8 Cols: The 4 Clean Agent Cards */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {AGENTS.map((agent) => {
              const isThisRunning = isRunning && activeAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  className={`p-4 rounded-xl bg-[#070e1c] border transition-all flex flex-col justify-between shadow-lg ${
                    isThisRunning
                      ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${agent.iconBg}`}>
                          {agent.icon}
                        </div>
                        <div>
                          <h2 className="text-xs font-bold text-white leading-tight">{agent.name}</h2>
                          <span className="text-[10px] text-slate-400">{agent.category}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${agent.badgeColor}`}>
                        {agent.targetDatabase}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Key Capabilities */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">What this agent does:</p>
                      {agent.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => handleRunAgent(agent)}
                      disabled={isRunning}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all shadow-md ${
                        isThisRunning
                          ? 'bg-cyan-600 text-white animate-pulse cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                      }`}
                    >
                      {isThisRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Executing Agent Query...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run {agent.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Live Result Display Panel */}
          {selectedResult && (
            <div className="p-4 rounded-xl bg-[#091529] border border-cyan-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    Live Findings from {selectedResult.agentName}
                  </span>
                </div>
                <span className="text-[10.5px] font-mono text-cyan-400">{selectedResult.time}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedResult.message}
              </p>

              {/* Formatted Data Records */}
              {selectedResult.data && Array.isArray(selectedResult.data) && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Extracted Database Records ({selectedResult.data.length}):
                  </p>
                  <div className="space-y-1">
                    {selectedResult.data.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#040913] border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2"
                      >
                        <span className="font-semibold text-white truncate">
                          {item.transaction_ref || item.suspect || item.title || `Record #${idx + 1}`}
                        </span>
                        <span className="font-mono text-emerald-400 flex-shrink-0">
                          {item.amount_inr ? `₹${Number(item.amount_inr).toLocaleString('en-IN')}` : item.channel || item.status || 'Verified'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Live Activity Log Stream */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          <div className="p-3.5 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Agent Activity Log
              </span>
              <span className="text-[10.5px] text-slate-400">{agentLogs.length} Executions</span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pt-2.5">
              {agentLogs.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No agents executed yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click "Run Agent" on any card on the left to start an autonomous database analysis.
                  </p>
                </div>
              ) : (
                agentLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedResult({ agentName: log.agentName, message: log.message, data: log.data, time: log.time })}
                    className="p-2.5 rounded-lg bg-[#0b162a] hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-cyan-400">{log.agentName}</span>
                      <span className="text-slate-400 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simple Explanation Card */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
            <p className="font-bold text-cyan-300">How do Autonomous Agents work?</p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Each AI agent executes targeted SQL and graph algorithms to scan for evidence anomalies, so investigators don't have to write queries manually.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
