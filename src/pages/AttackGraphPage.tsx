import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Terminal,
  Mail,
  Key,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Info,
  Layers,
  Clock,
  ArrowRight,
  X,
  FileCode,
  HardDrive,
  Network
} from 'lucide-react';

interface AttackGraphPageProps {
  onSelectAction?: (action: string) => void;
}

interface KillChainNode {
  id: string;
  title: string;
  tacticId: string;
  tacticName: string;
  category: 'initial-access' | 'execution' | 'persistence' | 'priv-esc' | 'defense-evasion' | 'lateral' | 'exfiltration';
  status: 'active' | 'chokepoint' | 'contained' | 'blocked';
  x: number; // percent
  y: number; // percent
  icon: string;
  details: string;
  ioc: string;
  timestamp: string;
  payload?: string;
}

export const AttackGraphPage: React.FC<AttackGraphPageProps> = ({ onSelectAction }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('token_theft');
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayStep, setReplayStep] = useState<number>(0);
  const [chokepointsIsolated, setChokepointsIsolated] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Nodes for kill-chain graph
  const killChainNodes: KillChainNode[] = [
    {
      id: 'phishing_email',
      title: 'Phishing Email',
      tacticId: 'TA0001',
      tacticName: 'Initial Access',
      category: 'initial-access',
      status: 'active',
      x: 12,
      y: 54,
      icon: 'mail',
      details: 'Spear-phishing attachment delivered via invoice_aug2026.iso containing weaponized LNK',
      ioc: 'SHA256: 8f4b23...e4c1 · Sender: billing-notice@secure-update.cc',
      timestamp: '27 Aug, 08:14 PM',
      payload: 'Powershell download cradle execution from staging server',
    },
    {
      id: 'powershell_exec',
      title: 'PowerShell Exec',
      tacticId: 'TA0002',
      tacticName: 'Execution',
      category: 'execution',
      status: 'active',
      x: 26,
      y: 30,
      icon: 'terminal',
      details: 'Obfuscated PowerShell script invoked with -EncodedCommand and bypass flags',
      ioc: 'Process: powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA...',
      timestamp: '27 Aug, 08:22 PM',
      payload: 'AMSI bypass script injection into memory space',
    },
    {
      id: 'registry_run',
      title: 'Registry Run Key',
      tacticId: 'TA0003',
      tacticName: 'Persistence',
      category: 'persistence',
      status: 'active',
      x: 40,
      y: 54,
      icon: 'database',
      details: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run entry added for persistence',
      ioc: 'Key: HKCU\\Software\\...\\WindowsUpdateService -> C:\\ProgramData\\svc.exe',
      timestamp: '27 Aug, 08:35 PM',
      payload: 'Scheduled autorun persistence beacon',
    },
    {
      id: 'token_theft',
      title: 'Token Theft',
      tacticId: 'TA0004',
      tacticName: 'Privilege Escalation',
      category: 'priv-esc',
      status: 'chokepoint',
      x: 54,
      y: 30,
      icon: 'key',
      details: 'LSASS memory dump and Primary Token impersonation to gain SYSTEM privileges (CHOKEPOINT)',
      ioc: 'Target: lsass.exe · Tool: Modified Mimikatz / Sekurlsa::pth',
      timestamp: '27 Aug, 08:52 PM',
      payload: 'Pass-the-Ticket kerberos injection into domain admin session',
    },
    {
      id: 'log_clearing',
      title: 'Log Clearing',
      tacticId: 'TA0005',
      tacticName: 'Defense Evasion',
      category: 'defense-evasion',
      status: 'active',
      x: 68,
      y: 54,
      icon: 'filecode',
      details: 'Security and System Event Logs wiped using wevtutil cl Security',
      ioc: 'Event ID 1102: The audit log was cleared by Administrator',
      timestamp: '27 Aug, 09:18 PM',
      payload: 'Log wiping and timestamp stomping on compromised host',
    },
    {
      id: 'smb_lateral',
      title: 'SMB Lateral Move',
      tacticId: 'TA0008',
      tacticName: 'Lateral Movement',
      category: 'lateral',
      status: 'active',
      x: 82,
      y: 30,
      icon: 'network',
      details: 'Admin share C$ accessed on DC01 and FS-CLUSTER via port 445',
      ioc: 'Port: 445 SMB · Target IP: 10.0.4.12 (DC01.INTERNAL)',
      timestamp: '27 Aug, 09:34 PM',
      payload: 'PsExec service creation over Named Pipe \\pipe\\psexecsvc',
    },
    {
      id: 'cloud_exfil',
      title: 'Cloud Exfiltration',
      tacticId: 'TA0010',
      tacticName: 'Exfiltration',
      category: 'exfiltration',
      status: 'active',
      x: 93,
      y: 54,
      icon: 'cloud',
      details: '2.3 GB of sensitive financial dossiers and case files uploaded to encrypted S3 bucket',
      ioc: 'Destination: https://s3.ap-south-1.amazonaws.com/backup-sync-049281',
      timestamp: '27 Aug, 09:58 PM',
      payload: 'Rclone encrypted multi-part sync over HTTPS/443',
    },
  ];

  // Replay Intrusion animation simulation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isReplaying) {
      timer = setInterval(() => {
        setReplayStep((prev) => {
          if (prev >= killChainNodes.length - 1) {
            setIsReplaying(false);
            return 0;
          }
          const next = prev + 1;
          setSelectedNodeId(killChainNodes[next].id);
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isReplaying]);

  const handleStartReplay = () => {
    setReplayStep(0);
    setSelectedNodeId(killChainNodes[0].id);
    setIsReplaying(true);
  };

  const handleIsolateChokepoints = () => {
    setChokepointsIsolated(true);
    onSelectAction?.('Isolate Chokepoints: Tokens revoked and SMB ports isolated');
  };

  const currentNode = killChainNodes.find((n) => n.id === selectedNodeId) || killChainNodes[3];

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Breadcrumbs & Header Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">
            CYBER DEFENSE <span className="text-slate-500">/</span> Attack Graph
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            Attack Graph — Intrusion Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reconstructed kill-chain across compromised infrastructure · Case #DEL-2026-0417
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartReplay}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              isReplaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isReplaying ? `Replaying (${replayStep + 1}/${killChainNodes.length})` : 'Replay Intrusion'}</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: ACTIVE INTRUSIONS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-red-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              ACTIVE INTRUSIONS
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">4</div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-1">
              <span>↑</span> 2 new since 6 PM
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <Zap className="w-4.5 h-4.5 fill-current" />
          </div>
        </div>

        {/* Card 2: ATTACK PATHS MAPPED */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-blue-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              ATTACK PATHS MAPPED
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">37</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              across 6 entry vectors
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 3: CRITICAL CHOKEPOINTS */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              CRITICAL CHOKEPOINTS
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">3</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              isolate to break chain
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 4: AVG TIME TO DETECT */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AVG TIME TO DETECT
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">6m 12s</div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
              <span>↓</span> 41% this month
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* ─── Middle Section: Kill-Chain Reconstruction Graph + Top Attack Paths ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Kill-Chain Reconstruction (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 rounded-lg bg-[#070e1f] border border-[#132342] flex flex-col relative overflow-hidden min-h-[440px] shadow-md">
          {/* Header */}
          <div className="p-3 border-b border-[#12203c] flex items-center justify-between z-10 bg-[#070e1f]/90">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Kill-Chain Reconstruction
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 font-mono">
                MITRE ATT&amp;CK mapped
              </span>
            </div>

            <button
              onClick={() => setActiveModal('full_graph')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <span>Full Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 relative flex items-center justify-center p-4 cyber-grid-bg overflow-hidden select-none min-h-[360px]">
            {/* SVG Connecting Paths Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Dashed zigzag connection lines */}
              {/* 1. Phishing Email (12%, 54%) -> PowerShell Exec (26%, 30%) */}
              <line
                x1="12%"
                y1="54%"
                x2="26%"
                y2="30%"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80"
              />

              {/* 2. PowerShell Exec (26%, 30%) -> Registry Run (40%, 54%) */}
              <line
                x1="26%"
                y1="30%"
                x2="40%"
                y2="54%"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80"
              />

              {/* Branch 1 from Registry Run (40%, 54%) down to Scheduled task (40%, 75%) */}
              <line
                x1="40%"
                y1="54%"
                x2="40%"
                y2="75%"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-60"
              />

              {/* 3. Registry Run (40%, 54%) -> Token Theft (54%, 30%) */}
              <line
                x1="40%"
                y1="54%"
                x2="54%"
                y2="30%"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-90"
              />

              {/* Branch 2 from Token Theft (54%, 30%) down to UAC Bypass (54%, 75%) */}
              <line
                x1="54%"
                y1="30%"
                x2="54%"
                y2="75%"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-60"
              />

              {/* 4. Token Theft (54%, 30%) -> Log Clearing (68%, 54%) */}
              <line
                x1="54%"
                y1="30%"
                x2="68%"
                y2="54%"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80"
              />

              {/* 5. Log Clearing (68%, 54%) -> SMB Lateral (82%, 30%) */}
              <line
                x1="68%"
                y1="54%"
                x2="82%"
                y2="30%"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80"
              />

              {/* 6. SMB Lateral (82%, 30%) -> Cloud Exfil (93%, 54%) */}
              <line
                x1="82%"
                y1="30%"
                x2="93%"
                y2="54%"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-90"
              />
            </svg>

            {/* ─── GRAPH NODES ─── */}

            {/* Node 1: Phishing Email */}
            <div
              onClick={() => setSelectedNodeId('phishing_email')}
              className="absolute top-[54%] left-[12%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'phishing_email'
                    ? 'bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.8)] ring-2 ring-red-400 scale-110'
                    : 'bg-red-950/80 border border-red-500/70 text-red-300 hover:scale-105'
                }`}
              >
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-200 mt-1.5 text-center">
                Phishing Email
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">TA0001 Initial Access</span>
            </div>

            {/* Node 2: PowerShell Exec */}
            <div
              onClick={() => setSelectedNodeId('powershell_exec')}
              className="absolute top-[30%] left-[26%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <span className="text-[9.5px] text-amber-400 font-bold mb-1">PowerShell Exec</span>
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'powershell_exec'
                    ? 'bg-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 scale-110'
                    : 'bg-amber-950/80 border border-amber-500/70 text-amber-300 hover:scale-105'
                }`}
              >
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-[8.5px] text-slate-400 font-mono mt-1">TA0002 Execution</span>
            </div>

            {/* Node 3: Registry Run Key */}
            <div
              onClick={() => setSelectedNodeId('registry_run')}
              className="absolute top-[54%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'registry_run'
                    ? 'bg-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 scale-110'
                    : 'bg-amber-950/80 border border-amber-500/70 text-amber-300 hover:scale-105'
                }`}
              >
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-200 mt-1.5 text-center">
                Registry Run Key
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">TA0003 Persistence</span>
            </div>

            {/* Branching below Registry Run: Scheduled task — contained */}
            <div className="absolute top-[75%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] text-cyan-300 font-medium mt-0.5 whitespace-nowrap">
                Scheduled task — contained
              </span>
            </div>

            {/* Node 4: Token Theft (CHOKEPOINT) */}
            <div
              onClick={() => setSelectedNodeId('token_theft')}
              className="absolute top-[30%] left-[54%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20"
            >
              <div className="flex flex-col items-center mb-1">
                <span className="text-[9.5px] text-white font-bold">Token Theft</span>
                <span className="text-[8px] font-extrabold text-red-400 tracking-wider">
                  CHOKEPOINT · TA0004
                </span>
              </div>
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all p-3 ${
                  selectedNodeId === 'token_theft'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_24px_rgba(239,68,68,0.9)] ring-2 ring-red-400 scale-110'
                    : 'bg-red-950 border-2 border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.6)] hover:scale-105'
                } ${chokepointsIsolated ? 'ring-4 ring-emerald-400' : ''}`}
              >
                <Key className="w-6 h-6 fill-current animate-pulse" />
              </div>
              {chokepointsIsolated && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-900 border border-emerald-400 text-emerald-300 text-[8px] font-bold mt-1">
                  ISOLATED
                </span>
              )}
            </div>

            {/* Branching below Token Theft: UAC bypass — blocked */}
            <div className="absolute top-[75%] left-[54%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] text-emerald-300 font-medium mt-0.5 whitespace-nowrap">
                UAC bypass — blocked
              </span>
            </div>

            {/* Node 5: Log Clearing */}
            <div
              onClick={() => setSelectedNodeId('log_clearing')}
              className="absolute top-[54%] left-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'log_clearing'
                    ? 'bg-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 scale-110'
                    : 'bg-amber-950/80 border border-amber-500/70 text-amber-300 hover:scale-105'
                }`}
              >
                <FileCode className="w-5 h-5" />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-200 mt-1.5 text-center">
                Log Clearing
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">TA0005 Evasion</span>
            </div>

            {/* Node 6: SMB Lateral Move */}
            <div
              onClick={() => setSelectedNodeId('smb_lateral')}
              className="absolute top-[30%] left-[82%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <span className="text-[9.5px] text-amber-400 font-bold mb-1">SMB Lateral Move</span>
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'smb_lateral'
                    ? 'bg-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 scale-110'
                    : 'bg-amber-950/80 border border-amber-500/70 text-amber-300 hover:scale-105'
                }`}
              >
                <Network className="w-5 h-5" />
              </div>
              <span className="text-[8.5px] text-slate-400 font-mono mt-1">TA0008 Lateral</span>
            </div>

            {/* Node 7: Cloud Exfiltration (FINAL TARGET) */}
            <div
              onClick={() => setSelectedNodeId('cloud_exfil')}
              className="absolute top-[54%] left-[93%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedNodeId === 'cloud_exfil'
                    ? 'bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.8)] ring-2 ring-red-400 scale-110'
                    : 'bg-red-950/80 border border-red-500/70 text-red-300 hover:scale-105'
                }`}
              >
                <Cloud className="w-5 h-5" />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-200 mt-1.5 text-center whitespace-nowrap">
                Cloud Exfiltration
              </span>
              <span className="text-[8.5px] text-red-400 font-mono">TA0010 · 2.3 GB moved</span>
            </div>
          </div>
        </div>

        {/* Right: Top Attack Paths (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <span>◆</span> Top Attack Paths
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Ranked by risk</span>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              {/* Path 1: Critical */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">
                    Phishing → Token Theft → Exfil
                  </span>
                  <span className="px-2 py-0.2 rounded bg-purple-950 border border-purple-500 text-purple-300 text-[9px] font-extrabold tracking-wider">
                    CRITICAL
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-[95%] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                </div>
              </div>

              {/* Path 2: High */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">
                    VPN Leak → RDP → Lateral Move
                  </span>
                  <span className="px-2 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 text-[9px] font-bold">
                    HIGH
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full w-[85%] shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                </div>
              </div>

              {/* Path 3: High */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">
                    Malicious USB → Local Exec
                  </span>
                  <span className="px-2 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 text-[9px] font-bold">
                    HIGH
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[75%]"></div>
                </div>
              </div>

              {/* Path 4: Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">
                    Cred Stuffing → API Abuse
                  </span>
                  <span className="px-2 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[9px] font-bold">
                    MEDIUM
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[50%]"></div>
                </div>
              </div>

              {/* Path 5: Low */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">
                    Insider USB → Slow Exfil
                  </span>
                  <span className="px-2 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[9px] font-bold">
                    LOW
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0d1830] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[30%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Isolate Chokepoints Button */}
          <div className="pt-3 border-t border-[#12203c] mt-3">
            <button
              onClick={handleIsolateChokepoints}
              disabled={chokepointsIsolated}
              className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                chokepointsIsolated
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_14px_rgba(6,182,212,0.4)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{chokepointsIsolated ? '✓ All Chokepoints Isolated' : 'Isolate All Chokepoints'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: MITRE ATT&CK Tactic Coverage + Live Detection Feed ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Bottom Left: MITRE ATT&CK Tactic Coverage (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>■</span> MITRE ATT&amp;CK Tactic Coverage
            </span>
            <span className="text-[10.5px] text-slate-400 font-mono">14 tactics · this case</span>
          </div>

          {/* 14 MITRE Tactics Grid */}
          <div className="grid grid-cols-7 gap-2 pt-3">
            {/* Row 1 */}
            {/* 1. Initial Access */}
            <div className="p-2 rounded bg-[#3b1520] border border-red-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-red-200 uppercase leading-tight">Initial Access</div>
              <div className="text-sm font-extrabold text-red-400 font-mono">9</div>
            </div>

            {/* 2. Execution */}
            <div className="p-2 rounded bg-[#3a2817] border border-amber-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-amber-200 uppercase leading-tight">Execution</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">6</div>
            </div>

            {/* 3. Persistence */}
            <div className="p-2 rounded bg-[#3a301a] border border-amber-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-amber-200 uppercase leading-tight">Persistence</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">5</div>
            </div>

            {/* 4. Priv. Escalation */}
            <div className="p-2 rounded bg-[#401724] border border-red-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-red-200 uppercase leading-tight">Priv. Escalation</div>
              <div className="text-sm font-extrabold text-red-400 font-mono">8</div>
            </div>

            {/* 5. Defense Evasion */}
            <div className="p-2 rounded bg-[#3b2c15] border border-amber-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-amber-200 uppercase leading-tight">Defense Evasion</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">7</div>
            </div>

            {/* 6. Cred. Access */}
            <div className="p-2 rounded bg-[#133032] border border-cyan-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-cyan-200 uppercase leading-tight">Cred. Access</div>
              <div className="text-sm font-extrabold text-cyan-400 font-mono">2</div>
            </div>

            {/* 7. Discovery */}
            <div className="p-2 rounded bg-[#122b3a] border border-blue-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-blue-200 uppercase leading-tight">Discovery</div>
              <div className="text-sm font-extrabold text-blue-400 font-mono">3</div>
            </div>

            {/* Row 2 */}
            {/* 8. Lateral Movement */}
            <div className="p-2 rounded bg-[#143336] border border-cyan-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-cyan-200 uppercase leading-tight">Lateral Movement</div>
              <div className="text-sm font-extrabold text-cyan-400 font-mono">4</div>
            </div>

            {/* 9. Collection */}
            <div className="p-2 rounded bg-[#141b2b] border border-slate-700 text-center flex flex-col justify-between min-h-[55px] opacity-70">
              <div className="text-[9px] font-medium text-slate-400 uppercase leading-tight">Collection</div>
              <div className="text-sm font-semibold text-slate-500 font-mono">0</div>
            </div>

            {/* 10. Exfiltration */}
            <div className="p-2 rounded bg-[#3d1520] border border-red-500/60 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-bold text-red-200 uppercase leading-tight">Exfiltration</div>
              <div className="text-sm font-extrabold text-red-400 font-mono">6</div>
            </div>

            {/* 11. Command & Control (C2) */}
            <div className="p-2 rounded bg-[#141b2b] border border-slate-700 text-center flex flex-col justify-between min-h-[55px] opacity-70">
              <div className="text-[9px] font-medium text-slate-400 uppercase leading-tight">C2</div>
              <div className="text-sm font-semibold text-slate-500 font-mono">0</div>
            </div>

            {/* 12. Impact */}
            <div className="p-2 rounded bg-[#141b2b] border border-slate-700 text-center flex flex-col justify-between min-h-[55px] opacity-70">
              <div className="text-[9px] font-medium text-slate-400 uppercase leading-tight">Impact</div>
              <div className="text-sm font-semibold text-slate-500 font-mono">0</div>
            </div>

            {/* 13. Recon */}
            <div className="p-2 rounded bg-[#1b253b] border border-slate-600 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-medium text-slate-300 uppercase leading-tight">Recon</div>
              <div className="text-sm font-semibold text-slate-300 font-mono">1</div>
            </div>

            {/* 14. Resource Dev. */}
            <div className="p-2 rounded bg-[#1b253b] border border-slate-600 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-[9px] font-medium text-slate-300 uppercase leading-tight">Resource Dev.</div>
              <div className="text-sm font-semibold text-slate-300 font-mono">1</div>
            </div>
          </div>
        </div>

        {/* Bottom Right: Live Detection Feed (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Live Detection Feed
            </span>
            <span className="text-[10px] text-slate-400 font-mono">auto-refresh</span>
          </div>

          <div className="space-y-2.5 pt-2.5 text-xs flex-1">
            {/* Feed 1 */}
            <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
              <div className="text-slate-200 font-medium truncate pr-2 text-[11px]">
                Suspicious PowerShell -EncodedCommand
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">10:41 PM</span>
            </div>

            {/* Feed 2 */}
            <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
              <div className="text-slate-200 font-medium truncate pr-2 text-[11px]">
                Registry autorun key modified
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">10:33 PM</span>
            </div>

            {/* Feed 3 */}
            <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
              <div className="text-slate-200 font-medium truncate pr-2 text-[11px]">
                Token impersonation attempt blocked
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">10:21 PM</span>
            </div>

            {/* Feed 4 */}
            <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
              <div className="text-slate-200 font-medium truncate pr-2 text-[11px]">
                Windows event log cleared
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">10:14 PM</span>
            </div>

            {/* Feed 5 */}
            <div className="flex items-center justify-between p-1 rounded hover:bg-slate-800/40 transition-colors">
              <div className="text-slate-200 font-medium truncate pr-2 text-[11px]">
                Outbound transfer to unknown S3 bucket
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">09:58 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Node Detail Inspection Drawer / Modal ─── */}
      {selectedNodeId && (
        <div className="rounded-lg bg-[#070e1f] border border-[#132342] p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/70 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentNode.title}</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/60 text-blue-300 text-[10px] font-mono">
                  {currentNode.tacticId}: {currentNode.tacticName}
                </span>
                {currentNode.status === 'chokepoint' && (
                  <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/60 text-red-400 text-[10px] font-bold">
                    CRITICAL CHOKEPOINT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">{currentNode.details}</p>
              <div className="flex items-center gap-3 text-[10.5px] text-slate-400 font-mono mt-1">
                <span>IOC: {currentNode.ioc}</span>
                <span>•</span>
                <span>Logged at: {currentNode.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectAction?.(`Remediate: ${currentNode.title}`)}
              className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            >
              Remediate Node
            </button>
            <button
              onClick={() => onSelectAction?.(`Inspect Memory Dump: ${currentNode.title}`)}
              className="px-3.5 py-1.5 rounded bg-[#091124] border border-[#1b2b4e] hover:bg-slate-800 text-slate-200 text-xs"
            >
              Inspect Artifacts
            </button>
          </div>
        </div>
      )}

      {/* ─── Full Graph Modal ─── */}
      {activeModal === 'full_graph' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Complete Infrastructure Compromise Kill-Chain
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-[#050b18] rounded-lg border border-[#142340] text-xs text-slate-300 space-y-3">
              <p>
                Full attack tree spanning 4 active intrusion corridors, 37 mapped pivot edges, and 3 high-priority isolation chokepoints across the enterprise network.
              </p>
              <div className="grid grid-cols-3 gap-3 text-slate-300">
                <div className="p-2.5 rounded bg-[#070e1e] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Entry Vector</div>
                  <div className="font-bold text-white mt-0.5">Phishing ISO / LNK</div>
                </div>
                <div className="p-2.5 rounded bg-[#070e1e] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Lateral Target</div>
                  <div className="font-bold text-white mt-0.5">DC01.INTERNAL (10.0.4.12)</div>
                </div>
                <div className="p-2.5 rounded bg-[#070e1e] border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Exfiltration Channel</div>
                  <div className="font-bold text-white mt-0.5">AWS S3 (Encrypted Rclone)</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
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
