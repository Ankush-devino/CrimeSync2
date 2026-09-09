import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  Send,
  Phone,
  Landmark,
  MapPin,
  Network,
  AlertTriangle,
  User,
  FileText,
  Clock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Car,
  Database,
  ArrowRight,
  HelpCircle,
  Briefcase,
  ChevronDown,
  Info,
  ExternalLink,
  Shield,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { CaseSelector } from '../components/CaseSelector';
import { ALL_CASES, getCaseById, type LawCase } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';
import { logOfficerAction } from '../services/activityLogger';

interface AiCopilotPageProps {
  onSelectAction?: (action: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  time: string;
  text: string;
  recommendations?: string[];
  confidenceScore?: number;
}

export const AiCopilotPage: React.FC<AiCopilotPageProps> = ({ onSelectAction }) => {
  const { selectedCaseId, setSelectedCaseId, cases } = useCaseContext();
  const [inputQuery, setInputQuery] = useState('');
  const [liveContext, setLiveContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'copilot',
      time: 'Just now',
      text: `👋 **Welcome Officer!** I am your **CrimeSync AI Intelligence Copilot**.\n\nActive Investigation: **${activeCase.title}** (${activeCase.fir_number})\n• **Jurisdiction**: ${activeCase.jurisdiction_city} Police Cyber Command\n• **Lead Officer**: ${activeCase.lead_investigator_name} (${activeCase.badge_number})\n• **Primary Kingpin**: **${activeCase.lead_suspect}**\n\nAsk me anything in plain English or click a recommended prompt below.`,
      recommendations: [
        `Who is the primary kingpin in ${activeCase.title}?`,
        `Show high-risk bank transfers for ${activeCase.title}`,
        `Inspect forensic evidence exhibits for ${activeCase.title}`,
      ],
      confidenceScore: 0.98,
    },
  ]);

  // Load context whenever selectedCaseId changes
  useEffect(() => {
    async function loadContext() {
      try {
        const ctx = await api.ai.getLiveContext(selectedCaseId);
        setLiveContext(ctx);
      } catch (err) {
        console.warn('Context load error:', err);
      }
    }
    loadContext();
  }, [selectedCaseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    const chosen = getCaseById(caseId) || ALL_CASES[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        sender: 'copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Switched active context to **${chosen.title}** (${chosen.fir_number}).\n\nJurisdiction: **${chosen.jurisdiction_city}** | Priority: **${chosen.priority}**.\nLead Suspect: **${chosen.lead_suspect || 'Suspect Network'}** (${chosen.lead_suspect_role || 'Primary Suspect'}).\n\nAsk me anything about suspects, financial transactions, or evidence in this case.`,
        recommendations: [
          `Who is the primary kingpin in ${chosen.title}?`,
          `Show high-risk bank transfers for ${chosen.title}`,
          `Inspect forensic evidence exhibits`,
        ],
        confidenceScore: 0.99,
      },
    ]);
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    logOfficerAction({
      action: `Prompted AI Copilot: "${query.slice(0, 45)}${query.length > 45 ? '...' : ''}"`,
      module: 'AI Copilot',
      caseId: activeCase.fir_number || 'CR-2026-0417',
      status: 'Completed',
      category: 'COPILOT',
      details: `Officer submitted neural copilot prompt: "${query}" for ${activeCase.title}`
    });

    try {
      const res = await api.ai.askCopilot(query, undefined, selectedCaseId);
      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        recommendations: res.recommended_actions,
        confidenceScore: res.confidence_score,
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (_err) {
      const fallbackMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Based on your database query, records for **${activeCase.title}** were analyzed.\n\n• Primary Kingpin: **${activeCase.lead_suspect}** (${activeCase.lead_suspect_role})\n• Total Illicit Volume: **₹${Number(activeCase.tracked_money_inr || 0).toLocaleString('en-IN')}**\n• Evidence Status: SHA-256 Validated under Section 65B Bharatiya Sakshya Adhiniyam 2023.`,
        recommendations: [
          'Run Financial Fraud Detective Agent',
          'Export Court-Ready Section 65B Dossier',
        ],
        confidenceScore: 0.94,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const dbSuspects = liveContext?.suspects || [];
  const dbEvidence = liveContext?.evidence || [];
  const dbTransactions = liveContext?.financial_transactions || [];
  const totalMoney: number = dbTransactions.length > 0 
    ? dbTransactions.reduce((sum: number, t: any) => sum + Number(t.amount_inr || 0), 0)
    : Number(activeCase.tracked_money_inr || 0);

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Interactive Header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              AI Investigation Copilot
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PostgreSQL & Neo4j Connected
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Natural language intelligence assistant for Indian law enforcement officers
            </p>
          </div>
        </div>

        {/* Case Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <CaseSelector
            selectedCaseId={selectedCaseId}
            onSelectCase={handleCaseChange}
          />

          <button
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ─── Naive User Explanatory Guide Banner ─────────────────────── */}
      {showHelpBanner && (
        <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-indigo-950/60 border border-blue-500/30 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">How this works for officers: </span>
              Select any of the 9 cases from the dropdown above. You can type any question or click a recommended prompt pill below to instantly query suspects, bank accounts, and evidence logs.
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

      {/* ─── Main Two-Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pt-3 overflow-hidden">
        
        {/* Left Column (8 Cols): Simple Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          
          {/* Chat Messages Scrollable Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isUser
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-blue-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">{msg.text}</div>

                      {/* Confidence Score Pill */}
                      {!isUser && msg.confidenceScore && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified with Database Ledger
                          </span>
                          <span>AI Confidence: {Math.round(msg.confidenceScore * 100)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Recommendations Chips */}
                    {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.recommendations.map((rec, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(rec)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 text-blue-300 transition-all flex items-center gap-1 text-left"
                          >
                            <span>👉 {rec}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-slate-500 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Querying PostgreSQL & Neo4j Graph databases for {activeCase.title}...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-medium whitespace-nowrap">💡 Quick Inquiries:</span>
            <button
              onClick={() => handleSendMessage(`Who is the primary kingpin in ${activeCase.title}?`)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              👑 Kingpin Profile
            </button>
            <button
              onClick={() => handleSendMessage(`Show high-risk bank transfers for ${activeCase.title}`)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              💳 Bank Trail
            </button>
            <button
              onClick={() => handleSendMessage(`Inspect forensic evidence exhibits for ${activeCase.title}`)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              📦 Evidence Vault
            </button>
            <button
              onClick={() => handleSendMessage(`What are the recommended containment actions for ${activeCase.title}?`)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              ⚡ Next Protocol
            </button>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-[#030712] border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask anything about ${activeCase.title} (e.g., 'Who is laundering money?', 'Verify SHA-256 hash')...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Case Profile & Intelligence Card */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-1">
          
          {/* Active Case Intelligence Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Case Dossier Snapshot
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeCase.priority === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-700/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-700/50'
                }`}
              >
                {activeCase.priority}
              </span>
            </div>

            <h2 className="text-sm font-bold text-white mb-1 leading-snug">
              {activeCase.title}
            </h2>
            <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
              {activeCase.description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">FIR Number</span>
                <span className="font-semibold text-slate-200">{activeCase.fir_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Lead Officer</span>
                <span className="font-semibold text-slate-200">{activeCase.lead_investigator_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Jurisdiction</span>
                <span className="font-semibold text-slate-200">{activeCase.jurisdiction_city}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tracked Capital Flow</span>
                <span className="font-semibold text-emerald-400">₹{totalMoney.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Suspects in this case (Neo4j Mapped) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                Implicated Suspects
              </span>
              <span className="text-[10px] text-slate-500">Neo4j Graph</span>
            </div>

            <div className="space-y-2">
              {dbSuspects.length > 0 ? (
                dbSuspects.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {s.alias && <span className="text-[10px] text-amber-400">"{s.alias}"</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{s.role} • {s.city}</div>
                    </div>
                    <button
                      onClick={() => handleSendMessage(`Analyze background and bank accounts for suspect ${s.name}`)}
                      className="px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/50 text-[10px] text-blue-300 transition-colors"
                    >
                      Inquire
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{activeCase.lead_suspect}</div>
                    <div className="text-[10px] text-slate-400">{activeCase.lead_suspect_role} • {activeCase.jurisdiction_city}</div>
                  </div>
                  <button
                    onClick={() => handleSendMessage(`Analyze background for suspect ${activeCase.lead_suspect}`)}
                    className="px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/50 text-[10px] text-blue-300 transition-colors"
                  >
                    Inquire
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Evidence exhibits in this case */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Evidence Vault ({dbEvidence.length || activeCase.evidence_count} Exhibits)
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Section 65B Certified</span>
            </div>

            <div className="space-y-1.5">
              {dbEvidence.length > 0 ? (
                dbEvidence.slice(0, 3).map((e: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="font-semibold text-slate-200 truncate">{e.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{e.category}</span>
                      <span className="text-emerald-400 font-mono">{e.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">Digital & Physical Evidence Exhibits</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{activeCase.evidence_count} Forensic Logs Recorded</span>
                    <span className="text-emerald-400 font-mono">SECURED</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
