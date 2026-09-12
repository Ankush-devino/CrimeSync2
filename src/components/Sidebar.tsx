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
  Moon,
  Cpu,
  ShieldAlert,
  Box,
  Layers,
  Search,
  FileText,
  ClipboardCheck,
  Scale,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return (
    <aside className="w-60 bg-[#040813] border-r border-[#111e33] flex flex-col flex-shrink-0 select-none h-full z-20 overflow-hidden">
      {/* Brand Header (Fixed at top) */}
      <div className="p-3.5 border-b border-[#111e33]/80 flex items-center gap-2.5 flex-shrink-0 bg-[#040813]">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          <Scale className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm sm:text-base tracking-wider text-white">CRIMESYNC</span>
          <span className="text-[7px] font-medium text-slate-400 uppercase tracking-tight">
            AI-POWERED • CYBER • BLOCKCHAIN
          </span>
        </div>
      </div>

      {/* Scrollable Navigation Menu Area (All 18 pages accessible) */}
      <div className="p-2 space-y-3 flex-1 min-h-0 overflow-y-auto sidebar-scroll">
        {/* COMMAND CENTER */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>COMMAND CENTER</span>
            <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-500/30">HQ</span>
          </div>
          <button
            onClick={() => setActiveTab('command-center')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'command-center'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Overview</span>
          </button>
        </div>

        {/* INVESTIGATE Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>INVESTIGATE</span>
            <span className="text-[8px] font-mono text-slate-400">6 tools</span>
          </div>
          <button
            onClick={() => setActiveTab('investigations')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'investigations'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
            <span>Cases</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-copilot')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'ai-copilot'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Assistant</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.2 bg-cyan-900/80 text-cyan-300 rounded border border-cyan-500/40">AI</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge-graph')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'knowledge-graph'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>Network Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('time-machine')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'time-machine'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeline</span>
            </div>
            <span className="text-[8px] font-bold px-1 py-0.2 bg-amber-950/80 text-amber-300 rounded border border-amber-500/40">4D</span>
          </button>
          <button
            onClick={() => setActiveTab('geo-intelligence')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'geo-intelligence'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Geo Map</span>
          </button>
          <button
            onClick={() => setActiveTab('financial-intelligence')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'financial-intelligence'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Money Trail</span>
            </div>
            <span className="text-[8px] font-bold px-1 py-0.2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-500/40">₹</span>
          </button>
        </div>

        {/* CYBER DEFENSE Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>CYBER DEFENSE</span>
            <span className="text-[8px] font-mono text-red-400">SOC</span>
          </div>
          <button
            onClick={() => setActiveTab('identity-security')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'identity-security'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Identity Shield</span>
          </button>
          <button
            onClick={() => setActiveTab('attack-graph')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'attack-graph'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Attack Map</span>
          </button>
          <button
            onClick={() => setActiveTab('deception-network')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'deception-network'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Honeypot</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </button>
          <button
            onClick={() => setActiveTab('blast-radius')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'blast-radius'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-3.5 h-3.5 text-red-400" />
              <span>Impact Zone</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('ai-sandbox')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'ai-sandbox'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Sandbox</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>
          <button
            onClick={() => setActiveTab('threat-alerts')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'threat-alerts'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Live Alerts</span>
            </div>
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-bold rounded-full animate-pulse shadow-[0_0_8px_#ef4444]">
              8
            </span>
          </button>
        </div>

        {/* BLOCKCHAIN VAULT Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>BLOCKCHAIN</span>
            <span className="text-[8px] font-mono text-emerald-400">LEDGER</span>
          </div>
          <button
            onClick={() => setActiveTab('evidence-dna')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'evidence-dna'
                ? 'bg-purple-600 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Fingerprint</span>
          </button>
          <button
            onClick={() => setActiveTab('chain-of-custody')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'chain-of-custody'
                ? 'bg-purple-600 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custody Log</span>
          </button>
        </div>

        {/* TOOLS & COMPLIANCE Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>REPORTS & COMPLIANCE</span>
            <span className="text-[8px] font-mono text-purple-400">PDF</span>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Reports</span>
            </div>
            <span className="text-[8px] font-bold px-1 py-0.2 bg-blue-950/80 text-blue-300 rounded border border-blue-500/40">65B</span>
          </button>
          <button
            onClick={() => setActiveTab('audit-trail')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-all cursor-pointer ${
              activeTab === 'audit-trail'
                ? 'bg-purple-600 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Activity Log</span>
          </button>
        </div>
      </div>

      {/* Footer Area (Fixed at bottom) */}
      <div className="flex-shrink-0 border-t border-[#111e33]/80 p-2 bg-[#040813]/95 space-y-1.5">
        {/* Dedicated Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#071026] hover:bg-[#0b1b3d] border border-blue-500/40 hover:border-blue-400 flex items-center justify-between text-xs transition-all shadow-sm group cursor-pointer"
          title={`Currently in ${theme} mode. Click to switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode.`}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-500 group-hover:-rotate-12 transition-transform" />
            )}
            <span className="text-[10.5px] font-bold text-slate-200">
              {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </span>
          </div>
          <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            theme === 'dark' 
              ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50' 
              : 'bg-blue-100 text-blue-800 border border-blue-400/50'
          }`}>
            {theme === 'dark' ? 'SUN ☀️' : 'MOON 🌙'}
          </span>
        </button>

        {/* Compact System Status */}
        <div className="px-2 py-1.5 rounded-lg bg-[#070e1c] border border-[#14233c] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-[10px] font-semibold text-emerald-400">All Systems Online</span>
          </div>
          <span className="text-[8px] text-slate-500 font-mono">24/7 NIC</span>
        </div>

        {/* Compact Active Officer Persona Badge */}
        <div className="px-2 py-1.5 rounded-lg bg-[#061026] border border-blue-500/30 flex items-center justify-between text-[10px]">
          <span className="font-bold text-white truncate max-w-[120px]">
            {currentUser.name}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
      </div>
    </aside>
  );
};
