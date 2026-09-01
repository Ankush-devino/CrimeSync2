import React from 'react';
import {
  Home,
  FolderKanban,
  Bot,
  Network,
  Clock,
  MapPin,
  CircleDollarSign,
  UserCheck,
  Zap,
  Target,
  Sun,
  Cpu,
  ShieldAlert,
  Box,
  Layers,
  Search,
  FileText,
  ClipboardCheck,
  Scale,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-56 bg-[#040813] border-r border-[#111e33] flex flex-col flex-shrink-0 select-none overflow-y-auto h-screen z-20">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[#111e33]/80 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          <Scale className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-wider text-white">CRIMESYNC</span>
          <span className="text-[7.5px] font-medium text-slate-400 uppercase tracking-tight">
            AI-POWERED • CYBER-SECURE • BLOCKCHAIN-VERIFIED
          </span>
        </div>
      </div>

      <div className="p-2 space-y-3.5 flex-1">
        {/* COMMAND CENTER */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            COMMAND CENTER
          </div>
          <button
            onClick={() => setActiveTab('command-center')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'command-center'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Live Overview</span>
          </button>
        </div>

        {/* INVESTIGATE Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            INVESTIGATE
          </div>
          <button
            onClick={() => setActiveTab('investigations')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'investigations'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Investigations</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-copilot')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'ai-copilot'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge-graph')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'knowledge-graph'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Knowledge Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('time-machine')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'time-machine'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Machine</span>
          </button>
          <button
            onClick={() => setActiveTab('geo-intelligence')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'geo-intelligence'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Geo Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('financial-intelligence')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'financial-intelligence'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            <span>Financial Intelligence</span>
          </button>
        </div>

        {/* CYBER DEFENSE Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            CYBER DEFENSE
          </div>
          <button
            onClick={() => setActiveTab('identity-security')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'identity-security'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Identity Security</span>
          </button>
          <button
            onClick={() => setActiveTab('attack-graph')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'attack-graph'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Attack Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('deception-network')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all ${
              activeTab === 'deception-network'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Target className="w-3.5 h-3.5" />
              <span>Deception Network</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </button>
          <button
            onClick={() => setActiveTab('blast-radius')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all ${
              activeTab === 'blast-radius'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-3.5 h-3.5" />
              <span>Blast Radius</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('ai-sandbox')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all ${
              activeTab === 'ai-sandbox'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Agent Sandbox</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </button>
          <button
            onClick={() => setActiveTab('threat-alerts')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all ${
              activeTab === 'threat-alerts'
                ? 'bg-blue-600 text-white font-medium shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Threat Alerts</span>
            </div>
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-bold rounded-full animate-pulse shadow-[0_0_8px_#ef4444]">
              8
            </span>
          </button>
        </div>

        {/* BLOCKCHAIN VAULT Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            BLOCKCHAIN VAULT
          </div>
          <button
            onClick={() => setActiveTab('evidence-dna')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'evidence-dna'
                ? 'bg-purple-600 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Evidence DNA</span>
          </button>
          <button
            onClick={() => setActiveTab('chain-of-custody')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'chain-of-custody'
                ? 'bg-purple-600 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chain of Custody</span>
          </button>
          <button
            onClick={() => setActiveTab('blockchain-explorer')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'blockchain-explorer'
                ? 'bg-purple-600 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Blockchain Explorer</span>
          </button>
        </div>

        {/* TOOLS Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            TOOLS
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reports & Dossiers</span>
          </button>
          <button
            onClick={() => setActiveTab('audit-trail')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all ${
              activeTab === 'audit-trail'
                ? 'bg-purple-600 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* SYSTEM STATUS at bottom */}
      <div className="p-2.5 m-2 rounded-lg bg-[#070e1c] border border-[#14233c]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            SYSTEM STATUS
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
          <p className="text-[11px] font-semibold text-emerald-400">All Systems Operational</p>
        </div>

        {/* Animated ECG Waveform */}
        <div className="h-6 w-full my-1 relative flex items-center">
          <svg className="w-full h-full stroke-emerald-400 fill-none" viewBox="0 0 160 24">
            <path
              d="M0 12 L30 12 L35 12 L40 6 L45 18 L50 2 L55 22 L60 12 L65 12 L90 12 L95 12 L100 8 L105 16 L110 4 L115 20 L120 12 L125 12 L160 12"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_4px_#10b981]"
            />
          </svg>
        </div>

        <p className="text-[8.5px] text-slate-500 font-mono">Last checked: 10:42:12 PM</p>
      </div>
    </aside>
  );
};
