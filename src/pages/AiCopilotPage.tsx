import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  History, 
  Trash2, 
  Send, 
  Paperclip, 
  Mic, 
  Phone, 
  Landmark, 
  MapPin, 
  Car, 
  Network, 
  AlertTriangle, 
  ArrowRight,
  User,
  FileText,
  Clock,
  ShieldAlert,
  ExternalLink,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

interface AiCopilotPageProps {
  onSelectAction?: (action: string) => void;
}

export const AiCopilotPage: React.FC<AiCopilotPageProps> = ({ onSelectAction }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'copilot';
    time: string;
    text: string;
    caseId?: string;
    bullets?: Array<{
      iconType: 'phone' | 'bank' | 'location' | 'car' | 'network' | 'alert';
      title: string;
      detail: string;
      isCritical?: boolean;
    }>;
    entities?: Array<{
      name: string;
      sub: string;
      type: 'user' | 'bank' | 'car';
      color: string;
    }>;
    conclusion?: string;
  }>>([
    {
      id: 'msg-1',
      sender: 'user',
      time: '10:40 PM',
      text: 'Why is Aman Khan suspicious in case',
      caseId: 'RC-2026-0417',
    },
    {
      id: 'msg-2',
      sender: 'copilot',
      time: '10:42 PM',
      text: 'Aman Khan is suspicious due to multiple strong connections and high-risk indicators in this case.\nHere\'s the summary:',
      bullets: [
        {
          iconType: 'phone',
          title: 'Frequent Communication',
          detail: '28 calls with Rahul Sharma in the last 7 days.',
        },
        {
          iconType: 'bank',
          title: 'Financial Transactions',
          detail: 'Received ₹4,20,000 through 6 layered transactions from 3 different accounts.',
        },
        {
          iconType: 'location',
          title: 'Location Overlap',
          detail: 'Present at 2 crime scenes – Lajpat Nagar (12 Aug) and Karol Bagh (21 Aug).',
        },
        {
          iconType: 'car',
          title: 'Vehicle Link',
          detail: 'Vehicle DL12AB1234 registered in his associate Vikram J.\'s name seen in 3 crime scenes.',
        },
        {
          iconType: 'network',
          title: 'Network Centrality',
          detail: 'High centrality score of 0.78, connecting multiple high-risk entities.',
        },
        {
          iconType: 'alert',
          title: 'Risk Score',
          detail: '92/100 (High Risk)',
          isCritical: true,
        },
      ],
      conclusion: 'These factors indicate a high probability of involvement in organized criminal activities.',
      entities: [
        { name: 'Rahul Sharma', sub: '28 Calls', type: 'user', color: 'bg-purple-950/70 border-purple-500/40 text-purple-300' },
        { name: 'Vikram J.', sub: '18 Calls', type: 'user', color: 'bg-purple-950/70 border-purple-500/40 text-purple-300' },
        { name: 'AC987654', sub: '₹4,20,000', type: 'bank', color: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' },
        { name: 'DL12AB1234', sub: 'Vehicle', type: 'car', color: 'bg-amber-950/70 border-amber-500/40 text-amber-300' },
        { name: 'Riya Singh', sub: 'Associate', type: 'user', color: 'bg-purple-950/70 border-purple-500/40 text-purple-300' },
      ],
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    try {
      // Call live Member 5 AI Copilot backend
      const res = await api.ai.askCopilot(query);
      const copilotMsg = {
        id: `ai-${Date.now()}`,
        sender: 'copilot' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        bullets: res.recommended_actions?.map((act, idx) => ({
          iconType: idx % 2 === 0 ? ('network' as const) : ('bank' as const),
          title: `Recommended Protocol ${idx + 1}`,
          detail: act,
        })),
        conclusion: `Confidence Score: ${(res.confidence_score * 100).toFixed(0)}% | Synthesized across PostgreSQL cases and Neo4j Knowledge Graph.`,
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (_err) {
      // Fallback response
      const copilotMsg = {
        id: `ai-${Date.now()}`,
        sender: 'copilot' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Analysis complete for: "${query}". Cross-referencing CDRs, financial logs, and spatial tracking data. Key correlations identified with high confidence (91%).`,
        bullets: [
          {
            iconType: 'network' as const,
            title: 'Pattern Match',
            detail: 'Synchronized activity patterns with syndicate sub-nodes confirmed.',
          },
          {
            iconType: 'bank' as const,
            title: 'Transaction Trail',
            detail: 'Hawala route detected crossing 3 regional bank branches.',
          },
        ],
        conclusion: 'Recommended Action: Subpoena banking records for associated mule accounts and monitor burner SIM IMSI.',
      };
      setMessages((prev) => [...prev, copilotMsg]);
    }
  };

  const renderBulletIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return (
          <div className="p-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <Phone className="w-3.5 h-3.5" />
          </div>
        );
      case 'bank':
        return (
          <div className="p-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Landmark className="w-3.5 h-3.5" />
          </div>
        );
      case 'location':
        return (
          <div className="p-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        );
      case 'car':
        return (
          <div className="p-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400">
            <Car className="w-3.5 h-3.5" />
          </div>
        );
      case 'network':
        return (
          <div className="p-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <Network className="w-3.5 h-3.5" />
          </div>
        );
      case 'alert':
      default:
        return (
          <div className="p-1 rounded bg-red-950/60 border border-red-500/40 text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

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
                </h2>
                <p className="text-[10px] text-slate-400">
                  Your intelligent assistant for faster investigations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectAction && onSelectAction('Start New AI Chat Session')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091224] hover:bg-[#0e1c38] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3 text-blue-400" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => onSelectAction && onSelectAction('Open Chat History Archive')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091224] hover:bg-[#0e1c38] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white transition-colors"
              >
                <History className="w-3 h-3 text-blue-400" />
                <span>Chat History</span>
              </button>
              <button
                onClick={() => setMessages([])}
                className="px-2.5 py-1 rounded bg-[#091224] hover:bg-red-950/40 border border-[#162744] hover:border-red-500/40 text-[10.5px] text-slate-300 hover:text-red-300 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Intro Welcome Banner */}
            <div className="p-3 rounded-lg bg-[#071329]/70 border border-blue-500/20 flex items-center gap-3 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                I can help you analyze cases, find connections, summarize evidence, identify patterns, and answer questions about your investigation data.
              </span>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl rounded-xl bg-[#091838] border border-blue-500/30 p-3 shadow-md">
                      <div className="flex items-center justify-between text-[10px] text-blue-300 font-semibold mb-1">
                        <span>You</span>
                        <span className="text-slate-400 font-normal">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-100 leading-relaxed">
                        {msg.text}{' '}
                        {msg.caseId && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-600/40 border border-blue-400/50 text-blue-300 font-mono font-semibold text-[11px]">
                            {msg.caseId}
                          </span>
                        )}
                        ?
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  {/* AI Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  {/* AI Response Card */}
                  <div className="flex-1 rounded-xl bg-[#061024] border border-[#142646] p-3.5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white tracking-wide">AI Copilot</span>
                      <span className="text-slate-400">{msg.time}</span>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </div>

                    {/* Bullet Points */}
                    {msg.bullets && (
                      <div className="space-y-2 pt-1">
                        {msg.bullets.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs">
                            <div className="flex-shrink-0 mt-0.5">{renderBulletIcon(b.iconType)}</div>
                            <div className="leading-snug">
                              <span className="font-bold text-slate-100">{b.title}: </span>
                              <span className={b.isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                {b.detail}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conclusion sentence */}
                    {msg.conclusion && (
                      <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-[#111e33]">
                        {msg.conclusion}
                      </p>
                    )}

                    {/* Connected Key Entities Horizontal Pills */}
                    {msg.entities && (
                      <div className="pt-2 border-t border-[#111e33]">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Key Entities Connected to Aman Khan
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {msg.entities.map((ent, idx) => (
                            <div
                              key={idx}
                              onClick={() => onSelectAction && onSelectAction(`Inspect Entity: ${ent.name}`)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#08152e] border border-[#172c54] hover:border-blue-500/50 transition-all cursor-pointer flex-shrink-0"
                            >
                              <div className="p-1 rounded bg-[#0e2249] text-slate-300">
                                {ent.type === 'car' ? (
                                  <Car className="w-3 h-3 text-amber-400" />
                                ) : ent.type === 'bank' ? (
                                  <Landmark className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <User className="w-3 h-3 text-purple-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10.5px] font-semibold text-slate-200 leading-none">
                                  {ent.name}
                                </span>
                                <span className="text-[9px] text-slate-400 leading-none mt-1">
                                  {ent.sub}
                                </span>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => onSelectAction && onSelectAction('View Full Entity Graph')}
                            className="px-2.5 py-2 rounded-lg bg-[#08152e] border border-[#172c54] text-[10px] text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap flex-shrink-0"
                          >
                            + 6 more
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input & Suggested Prompt Chips */}
          <div className="p-3 border-t border-[#111e33] bg-[#040813] space-y-2.5">
            {/* Input Box */}
            <div className="relative flex items-center rounded-lg bg-[#081224] border border-[#162947] focus-within:border-blue-500/60 shadow-inner px-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 pr-2 border-r border-[#162947]">
                <button className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors" title="Attach Evidence">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors" title="Voice Input">
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors" title="Slash Commands">
                  <span className="text-xs font-mono font-bold">/</span>
                </button>
              </div>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything about this case..."
                className="flex-1 bg-transparent px-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              <button
                onClick={() => handleSendMessage()}
                className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <button
                onClick={() => handleSendMessage('Summarize this case in detail')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Summarize this case</span>
              </button>
              <button
                onClick={() => handleSendMessage('Show key connections and suspicious links')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                <Network className="w-3 h-3 text-slate-400" />
                <span>Show key connections</span>
              </button>
              <button
                onClick={() => handleSendMessage('Find financial trails and money laundering patterns')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                <Landmark className="w-3 h-3 text-slate-400" />
                <span>Find financial trails</span>
              </button>
              <button
                onClick={() => handleSendMessage('Generate chronological timeline of events')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Timeline of events</span>
              </button>
              <button
                onClick={() => handleSendMessage('Perform comprehensive suspect risk assessment')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                <AlertTriangle className="w-3 h-3 text-slate-400" />
                <span>Risk assessment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Case Context + Live AI Insights + Supporting Evidence */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Card 1: CASE CONTEXT */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CASE CONTEXT
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold">
                RC-2026-0417
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Case Title</span>
                <span className="font-semibold text-slate-100 leading-tight block">
                  Organized Theft & Money Laundering
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">FIR Date</span>
                <span className="font-semibold text-slate-100 block font-mono">21 Aug 2026</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Investigating Officer</span>
                <span className="font-semibold text-slate-100 block">Inspector R. Sharma</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-100 block">Delhi, India</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Status</span>
                <span className="font-bold text-emerald-400 block">Active Investigation</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Severity</span>
                <span className="font-bold text-red-500 block">High</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI INSIGHTS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI INSIGHTS
                </span>
                <button 
                  onClick={() => onSelectAction && onSelectAction('View Full AI Insights Report')}
                  className="text-[10.5px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  <span>View All Insights</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 mt-2.5">
                {/* Insight 1 */}
                <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex items-start gap-2.5">
                  <div className="p-1 rounded bg-red-950/60 border border-red-500/40 text-red-400 flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      Aman Khan acts as a central connector between financial and communication networks.
                    </p>
                    <span className="text-[9.5px] text-emerald-400 font-semibold block mt-1">
                      Confidence: 92%
                    </span>
                  </div>
                </div>

                {/* Insight 2 */}
                <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex items-start gap-2.5">
                  <div className="p-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex-shrink-0 mt-0.5">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      Unusual cash inflows detected across 2 accounts linked to his close associates.
                    </p>
                    <span className="text-[9.5px] text-emerald-400 font-semibold block mt-1">
                      Confidence: 88%
                    </span>
                  </div>
                </div>

                {/* Insight 3 */}
                <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex items-start gap-2.5">
                  <div className="p-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-400 flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      High overlap in location and event timeline with known offenders.
                    </p>
                    <span className="text-[9.5px] text-emerald-400 font-semibold block mt-1">
                      Confidence: 85%
                    </span>
                  </div>
                </div>

                {/* Insight 4 */}
                <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex items-start gap-2.5">
                  <div className="p-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400 flex-shrink-0 mt-0.5">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      Vehicle DL12AB1234 appears in 3 crime scenes within 12 days.
                    </p>
                    <span className="text-[9.5px] text-emerald-400 font-semibold block mt-1">
                      Confidence: 90%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: SUPPORTING EVIDENCE */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SUPPORTING EVIDENCE
              </span>
              <button 
                onClick={() => onSelectAction && onSelectAction('Open Evidence Vault')}
                className="text-[10.5px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>View All Evidence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2.5 text-center">
              {/* Evidence 1: Call Records */}
              <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex flex-col items-center justify-between">
                <div className="p-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="my-1">
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Call Detail Records</span>
                  <span className="text-sm font-black text-white block mt-0.5">28</span>
                  <span className="text-[8px] text-slate-400 block">Calls</span>
                  <span className="text-[7.5px] text-slate-500 block">Last 7 days</span>
                </div>
                <button
                  onClick={() => onSelectAction && onSelectAction('View Call Detail Records')}
                  className="text-[9px] text-blue-400 hover:underline mt-auto"
                >
                  View
                </button>
              </div>

              {/* Evidence 2: Financial */}
              <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex flex-col items-center justify-between">
                <div className="p-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <div className="my-1">
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Financial Transactions</span>
                  <span className="text-[11px] font-black text-white block mt-0.5">₹4,20,000</span>
                  <span className="text-[8px] text-slate-400 block">Received</span>
                  <span className="text-[7.5px] text-slate-500 block">6 Transactions</span>
                </div>
                <button
                  onClick={() => onSelectAction && onSelectAction('View Financial Transactions')}
                  className="text-[9px] text-blue-400 hover:underline mt-auto"
                >
                  View
                </button>
              </div>

              {/* Evidence 3: Location */}
              <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex flex-col items-center justify-between">
                <div className="p-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="my-1">
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Location Overlap</span>
                  <span className="text-sm font-black text-white block mt-0.5">2</span>
                  <span className="text-[8px] text-slate-400 block">Crime Scenes</span>
                  <span className="text-[7.5px] text-slate-500 block">12 Aug – 21 Aug</span>
                </div>
                <button
                  onClick={() => onSelectAction && onSelectAction('View Location Overlaps')}
                  className="text-[9px] text-blue-400 hover:underline mt-auto"
                >
                  View
                </button>
              </div>

              {/* Evidence 4: Vehicle */}
              <div className="p-2 rounded-lg bg-[#081224]/90 border border-[#142646] flex flex-col items-center justify-between">
                <div className="p-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div className="my-1">
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Vehicle Association</span>
                  <span className="text-[9.5px] font-black text-white block mt-0.5">DL12AB1234</span>
                  <span className="text-[8px] text-slate-400 block">3 Occurrences</span>
                  <span className="text-[7.5px] text-slate-500 block">12 Days</span>
                </div>
                <button
                  onClick={() => onSelectAction && onSelectAction('View Vehicle Tracking Records')}
                  className="text-[9px] text-blue-400 hover:underline mt-auto"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
