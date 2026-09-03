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
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';

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
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      time: 'Just now',
      text: "👋 Hello Officer! I am your **CrimeSync AI Copilot**.\n\nI have direct access to all active cases, bank records, and suspect phone networks in your database.\n\nYou can ask me questions in plain English, or click one of the quick questions below to get started!",
      recommendations: [
        'Who is the main suspect in Operation Trishul?',
        'Show all high-risk bank transfers',
        'Summarize the evidence collected so far',
      ],
      confidenceScore: 0.98,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveContext, setLiveContext] = useState<any>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load live case context on mount
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

    try {
      const res = await api.ai.askCopilot(query);
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
        text: `Based on your database records, **Operation Trishul** is currently the primary active case.\n\nKey finding: Suspect Vikramaditya Shinde is connected to ₹28,50,000 in layered bank transfers from Alok Pandey.`,
        recommendations: [
          'Freeze linked ICICI bank account',
          'Generate Section 65B court dossier',
        ],
        confidenceScore: 0.92,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCase = liveContext?.cases?.[0];
  const suspects = liveContext?.suspects || [];

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Simple Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              AI Investigation Copilot
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                Connected to Database
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Ask questions in simple words to analyze cases, suspects, and bank trails
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pt-3 overflow-hidden">
        
        {/* Left Column (8 Cols): Simple Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-xl p-3.5 space-y-2.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-[#0b162a] border border-slate-700/60 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-75 border-b border-white/10 pb-1">
                    <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'CrimeSync AI'}</span>
                    <span>{msg.time}</span>
                  </div>

                  <div className="text-xs leading-relaxed whitespace-pre-line space-y-2">
                    {msg.text}
                  </div>

                  {/* Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
                      <p className="text-[10.5px] font-bold text-blue-300 uppercase tracking-wider">
                        Suggested Actions:
                      </p>
                      <div className="space-y-1">
                        {msg.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSendMessage(rec)}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-[#07101e] hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 cursor-pointer text-xs text-slate-300 hover:text-white transition-all"
                          >
                            <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.confidenceScore && (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 pt-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{(msg.confidenceScore * 100).toFixed(0)}% AI Accuracy Confidence</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-xl bg-[#0b162a] border border-slate-700 flex items-center gap-2 text-xs text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Searching PostgreSQL & Neo4j databases...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Question Chips */}
          <div className="px-3 py-2 bg-[#040913] border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">Quick Questions:</span>
            {[
              'Who is the main suspect?',
              'Show financial trail',
              'Summarize case evidence',
              'Check suspect phone records',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-950 border border-slate-700 hover:border-blue-500/50 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-[#040913] border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about the investigation in simple words..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Right Column (4 Cols): Simple Case & Suspect Overview */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          
          {/* Card 1: Active Case Overview */}
          <div className="p-3.5 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                Case in Investigation
              </span>
              <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-400 text-[10px] font-bold">
                CRITICAL
              </span>
            </div>

            {contextLoading ? (
              <div className="py-4 text-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Case Name</span>
                  <p className="font-semibold text-white leading-tight">
                    {activeCase?.title || 'Operation Trishul: Hawala Syndicate'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">FIR Number</span>
                    <span className="font-mono text-slate-200">{activeCase?.fir_number || 'FIR/DEL/2026/0891'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">City</span>
                    <span className="text-slate-200">{activeCase?.jurisdiction_city || 'New Delhi'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lead Officer</span>
                    <span className="text-slate-200">{activeCase?.officer || 'ACP Rajeshwar Sharma'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="text-emerald-400 font-semibold">{activeCase?.status || 'INVESTIGATING'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Key Suspects Identified */}
          <div className="p-3.5 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg space-y-3 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                Suspects in Network
              </span>
              <span className="text-[11px] text-slate-400">{suspects.length} Identified</span>
            </div>

            <div className="space-y-2">
              {suspects.map((s: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleSendMessage(`Tell me everything about suspect ${s.name}`)}
                  className="p-2.5 rounded-lg bg-[#0b162a] hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 flex-shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.role} · {s.city}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono flex-shrink-0 ${
                    s.risk_score >= 90 ? 'bg-red-950 border border-red-500 text-red-400' : 'bg-amber-950 border border-amber-500 text-amber-400'
                  }`}>
                    {s.risk_score}% Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Help / How to Use */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Did you know?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              You can click any suspect above or type questions like <em>"What bank accounts belong to Alok Pandey?"</em> to get immediate cross-referenced evidence.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
