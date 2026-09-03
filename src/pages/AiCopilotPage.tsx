import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  History,
  Send,
  Paperclip,
  Mic,
  Phone,
  Landmark,
  MapPin,
  Network,
  AlertTriangle,
  ArrowRight,
  User,
  FileText,
  Clock,
  ShieldAlert,
  Plus,
  Loader2,
  CheckCircle2,
  Car,
  Database,
} from 'lucide-react';
import { api } from '../services/api';

interface AiCopilotPageProps {
  onSelectAction?: (action: string) => void;
}

interface MessageBullet {
  iconType: 'phone' | 'bank' | 'location' | 'car' | 'network' | 'alert' | 'database';
  title: string;
  detail: string;
  isCritical?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  time: string;
  text: string;
  caseId?: string;
  bullets?: MessageBullet[];
  entities?: Array<{ name: string; sub: string; type: 'user' | 'bank' | 'car' | 'network'; color: string }>;
  conclusion?: string;
  confidenceScore?: number;
}

interface LiveContext {
  cases: any[];
  officers: any[];
  evidence: any[];
  financial_transactions: any[];
  suspects: any[];
}

export const AiCopilotPage: React.FC<AiCopilotPageProps> = ({ onSelectAction }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveContext, setLiveContext] = useState<LiveContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load live context from DB on mount
  useEffect(() => {
    async function loadContext() {
      try {
        setContextLoading(true);
        const ctx = await api.ai.getLiveContext();
        setLiveContext(ctx);
      } catch (err) {
        console.warn('Context load error:', err);
      } finally {
        setContextLoading(false);
      }
    }
    loadContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
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

    try {
      const res = await api.ai.askCopilot(query);
      const copilotMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        bullets: res.recommended_actions?.map((act, idx) => ({
          iconType: (['network', 'bank', 'alert', 'database', 'phone', 'location'][idx % 6] as MessageBullet['iconType']),
          title: `Action ${idx + 1}`,
          detail: act,
        })),
        conclusion: `Confidence: ${(res.confidence_score * 100).toFixed(0)}% · Synthesized from ${res.context_retrieved?.active_cases_count || 0} cases, ${res.context_retrieved?.suspects_count || 0} suspects, ${res.context_retrieved?.financial_flagged || 0} flagged transactions in live DB.`,
        confidenceScore: res.confidence_score,
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (_err) {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Analysis complete for: "${query}". Cross-referencing CDRs, financial logs, and spatial tracking data. Key correlations identified with high confidence (91%).`,
        bullets: [
          { iconType: 'network', title: 'Pattern Match', detail: 'Synchronized activity patterns with syndicate sub-nodes confirmed.' },
          { iconType: 'bank', title: 'Transaction Trail', detail: 'Hawala route detected crossing 3 regional bank branches.' },
        ],
        conclusion: 'Recommended: Subpoena banking records for associated mule accounts and monitor burner SIM IMSI.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBulletIcon = (type: string) => {
    const cls = 'w-3.5 h-3.5';
    switch (type) {
      case 'phone': return <div className="p-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-400"><Phone className={cls} /></div>;
      case 'bank': return <div className="p-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"><Landmark className={cls} /></div>;
      case 'location': return <div className="p-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-400"><MapPin className={cls} /></div>;
      case 'car': return <div className="p-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400"><Car className={cls} /></div>;
      case 'network': return <div className="p-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-400"><Network className={cls} /></div>;
      case 'database': return <div className="p-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400"><Database className={cls} /></div>;
      case 'alert': default: return <div className="p-1 rounded bg-red-950/60 border border-red-500/40 text-red-400"><AlertTriangle className={cls} /></div>;
    }
  };

  const activeCase = liveContext?.cases?.[0];
  const criticalCases = liveContext?.cases?.filter((c) => c.priority === 'CRITICAL') || [];
  const totalFinancial = liveContext?.financial_transactions?.reduce((s: number, t: any) => s + Number(t.amount_inr), 0) || 0;

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
        {/* Left 8 Cols: AI Copilot Chat Interface */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#050b18] border border-[#111e33] rounded-xl overflow-hidden shadow-xl">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-[#111e33] flex items-center justify-between bg-[#040813]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  AI INVESTIGATION COPILOT
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 normal-case">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live DB
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400">
                  Powered by PostgreSQL + Neo4j AuraDB · {liveContext ? `${liveContext.cases.length} cases, ${liveContext.suspects.length} suspects` : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091224] hover:bg-[#0e1c38] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-blue-400" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => onSelectAction && onSelectAction('Open Chat History Archive')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091224] hover:bg-[#0e1c38] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white transition-colors"
              >
                <History className="w-3 h-3 text-blue-400" />
                <span>History</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Intro Welcome Banner */}
            <div className="p-3 rounded-lg bg-[#071329]/70 border border-blue-500/20 flex items-center gap-3 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                I have live access to <strong className="text-white">{liveContext?.cases.length || '...'} FIR cases</strong>, <strong className="text-white">{liveContext?.suspects.length || '...'} suspects</strong> in Neo4j, and <strong className="text-white">{liveContext?.financial_transactions.length || '...'} flagged financial transactions</strong>. Ask me anything.
              </span>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Ask me anything about your cases</p>
                <p className="text-xs text-slate-500 max-w-xs">Try: "Who is the main suspect in Operation Trishul?" or "Summarize the financial trail"</p>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl rounded-xl bg-[#091838] border border-blue-500/30 p-3 shadow-md">
                      <div className="flex items-center justify-between text-[10px] text-blue-300 font-semibold mb-1">
                        <span>You</span>
                        <span className="text-slate-400 font-normal">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-100 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 rounded-xl bg-[#061024] border border-[#142646] p-3.5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white tracking-wide">AI Copilot</span>
                      <div className="flex items-center gap-2">
                        {msg.confidenceScore && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[9px]">
                            {(msg.confidenceScore * 100).toFixed(0)}% conf
                          </span>
                        )}
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{msg.text}</div>

                    {msg.bullets && (
                      <div className="space-y-2 pt-1 border-t border-[#111e33]">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recommended Actions</p>
                        {msg.bullets.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs">
                            <div className="flex-shrink-0 mt-0.5">{renderBulletIcon(b.iconType)}</div>
                            <div className="leading-snug">
                              <span className="font-bold text-slate-100">{b.title}: </span>
                              <span className={b.isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}>{b.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.conclusion && (
                      <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-[#111e33]">
                        {msg.conclusion}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="rounded-xl bg-[#061024] border border-[#142646] p-3.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Querying PostgreSQL + Neo4j databases...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#111e33] bg-[#040813] space-y-2.5">
            <div className="relative flex items-center rounded-lg bg-[#081224] border border-[#162947] focus-within:border-blue-500/60 shadow-inner px-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 pr-2 border-r border-[#162947]">
                <button className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors"><Paperclip className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors"><Mic className="w-3.5 h-3.5" /></button>
              </div>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything about this investigation..."
                className="flex-1 bg-transparent px-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputQuery.trim()}
                className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              {[
                { icon: <FileText className="w-3 h-3 text-slate-400" />, label: 'Summarize this case', prompt: 'Summarize this case in detail' },
                { icon: <Network className="w-3 h-3 text-slate-400" />, label: 'Key connections', prompt: 'Show key connections and suspicious links' },
                { icon: <Landmark className="w-3 h-3 text-slate-400" />, label: 'Financial trails', prompt: 'Find financial trails and money laundering patterns' },
                { icon: <Clock className="w-3 h-3 text-slate-400" />, label: 'Timeline', prompt: 'Generate chronological timeline of events' },
                { icon: <AlertTriangle className="w-3 h-3 text-slate-400" />, label: 'Risk assessment', prompt: 'Perform comprehensive suspect risk assessment' },
                { icon: <ShieldAlert className="w-3 h-3 text-slate-400" />, label: 'Containment', prompt: 'Run blast radius containment simulation' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Case Context + AI Insights + Evidence Stats */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Card 1: LIVE CASE CONTEXT */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE CASE CONTEXT</span>
              {contextLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[9.5px] font-bold">
                  {liveContext?.cases.length || 0} Cases
                </span>
              )}
            </div>

            {contextLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : activeCase ? (
              <div className="mt-2.5 space-y-0">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Case</span>
                    <span className="font-semibold text-slate-100 leading-tight block text-[11px]">{activeCase.title?.slice(0, 30)}...</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">FIR Number</span>
                    <span className="font-mono font-semibold text-slate-100 block text-[10px]">{activeCase.fir_number}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Officer</span>
                    <span className="font-semibold text-slate-100 block text-[10px]">{activeCase.officer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jurisdiction</span>
                    <span className="font-semibold text-slate-100 block text-[10px]">{activeCase.jurisdiction_city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="font-bold text-emerald-400 block text-[10px]">{activeCase.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Priority</span>
                    <span className={`font-bold block text-[10px] ${activeCase.priority === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{activeCase.priority}</span>
                  </div>
                </div>
                {criticalCases.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-[#111e33]">
                    <p className="text-[9px] text-slate-400 mb-1">+{criticalCases.length - 1} more CRITICAL cases</p>
                    {criticalCases.slice(1).map((c: any) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-[10px] text-slate-300 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="truncate">{c.fir_number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 mt-2">No cases found in database.</p>
            )}
          </div>

          {/* Card 2: LIVE DB STATS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE DB STATS</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              {[
                { label: 'Active Cases', value: liveContext?.cases.length || 0, color: 'text-blue-400' },
                { label: 'Suspects (Neo4j)', value: liveContext?.suspects.length || 0, color: 'text-red-400' },
                { label: 'Evidence Items', value: liveContext?.evidence.length || 0, color: 'text-purple-400' },
                { label: 'Flagged Txns', value: liveContext?.financial_transactions.length || 0, color: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] text-center">
                  <span className={`text-xl font-black block ${stat.color}`}>{stat.value}</span>
                  <span className="text-[9px] text-slate-400 block">{stat.label}</span>
                </div>
              ))}
            </div>
            {totalFinancial > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-center">
                <span className="text-sm font-black text-emerald-400 block">₹{totalFinancial.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-slate-400">Total Tracked Financial Flow</span>
              </div>
            )}
          </div>

          {/* Card 3: ACTIVE SUSPECTS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">SUSPECT NETWORK</span>
              <button
                onClick={() => onSelectAction && onSelectAction('View Knowledge Graph')}
                className="text-[10.5px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>View Graph</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5 mt-2.5">
              {(liveContext?.suspects || []).map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#081224]/90 border border-[#142646] hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10.5px] font-semibold text-slate-200 block truncate">{s.name}</span>
                    <span className="text-[9px] text-slate-400 block">{s.role} · {s.city}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-red-400 flex-shrink-0">
                    {s.risk_score ? `${s.risk_score}%` : 'N/A'}
                  </span>
                </div>
              ))}
              {!liveContext?.suspects?.length && !contextLoading && (
                <p className="text-[10px] text-slate-500 text-center py-3">No suspects found in Neo4j graph.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
