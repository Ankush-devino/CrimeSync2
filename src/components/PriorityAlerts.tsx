import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Lock, 
  Database, 
  Key, 
  UserX, 
  Radio, 
  FileWarning, 
  Zap, 
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import type { Severity } from '../types/dashboard';

export interface SocAlertEvent {
  id: string;
  title: string;
  type: 'Unusual Login' | 'Trust Score Drop' | 'Export Attempt' | 'Honey Evidence Access' | 'Blockchain Verification Failure' | 'SCADA Probe' | 'Unauthorized Egress';
  target: string;
  officerOrIp: string;
  caseId: string;
  timeAgo: string;
  timestamp: number;
  severity: Severity;
  status: 'BLOCKED_BY_EBPF' | 'CONTAINMENT_ACTIVE' | 'TRIPWIRE_ENGAGED' | 'LEDGER_VERIFIED' | 'UNDER_ANALYSIS';
}

const INITIAL_ALERTS: SocAlertEvent[] = [
  {
    id: 'soc-1',
    title: 'Honey Evidence Access Attempt',
    type: 'Honey Evidence Access',
    target: 'FIR_999_HONEY.pdf',
    officerOrIp: 'IP: 194.26.29.112 (External)',
    caseId: 'CASE-2026-002',
    timeAgo: 'Just now',
    timestamp: Date.now(),
    severity: 'CRITICAL',
    status: 'TRIPWIRE_ENGAGED',
  },
  {
    id: 'soc-2',
    title: 'Session Trust Score Drop (94 ➔ 42)',
    type: 'Trust Score Drop',
    target: 'Officer USR-102 (Suspicious Keystroke Velocity)',
    officerOrIp: 'Inspector Priya Kulkarni',
    caseId: 'CASE-2026-005',
    timeAgo: '12s ago',
    timestamp: Date.now() - 12000,
    severity: 'HIGH',
    status: 'CONTAINMENT_ACTIVE',
  },
  {
    id: 'soc-3',
    title: 'Bulk Evidence Export Attempt Intercepted',
    type: 'Export Attempt',
    target: 'Evidence SQL Table / 42 Dossiers',
    officerOrIp: 'Unauthorized Session #9941',
    caseId: 'CASE-2026-001',
    timeAgo: '45s ago',
    timestamp: Date.now() - 45000,
    severity: 'HIGH',
    status: 'BLOCKED_BY_EBPF',
  },
  {
    id: 'soc-4',
    title: 'Zero-Day SCADA Modbus Command Probe',
    type: 'SCADA Probe',
    target: 'Port 502 / Kalwa 400kV Substation',
    officerOrIp: 'IP: 194.26.29.112',
    caseId: 'CASE-2026-002',
    timeAgo: '1m ago',
    timestamp: Date.now() - 65000,
    severity: 'CRITICAL',
    status: 'BLOCKED_BY_EBPF',
  },
  {
    id: 'soc-5',
    title: 'Blockchain Merkle Audit Failure Alert',
    type: 'Blockchain Verification Failure',
    target: 'Ledger Block #19,401 (Hash Mismatch Checked)',
    officerOrIp: 'Node: MHA-HYD-04',
    caseId: 'CASE-2026-003',
    timeAgo: '2m ago',
    timestamp: Date.now() - 130000,
    severity: 'MEDIUM',
    status: 'LEDGER_VERIFIED',
  },
];

const INCOMING_SIMULATION_POOL: Omit<SocAlertEvent, 'id' | 'timestamp' | 'timeAgo'>[] = [
  {
    title: 'Unauthorized Socket Egress sys_connect',
    type: 'Unauthorized Egress',
    target: 'gVisor MicroVM #AG-04 (Port 443 Outbound)',
    officerOrIp: 'AI RedTeam Agent #3',
    caseId: 'CASE-2026-002',
    severity: 'CRITICAL',
    status: 'BLOCKED_BY_EBPF',
  },
  {
    title: 'Unusual Geographical Login (Dubai Subnet)',
    type: 'Unusual Login',
    target: 'Terminal Login #DEL-IPS-8821',
    officerOrIp: 'IP: 185.220.101.5',
    caseId: 'CASE-2026-001',
    severity: 'HIGH',
    status: 'CONTAINMENT_ACTIVE',
  },
  {
    title: 'Steganographic Watermark Breach Detected',
    type: 'Honey Evidence Access',
    target: 'Leaked FIR Dossier Document (Zero-Width Tag)',
    officerOrIp: 'Officer Badge: MUM-CYB-4091',
    caseId: 'CASE-2026-005',
    severity: 'CRITICAL',
    status: 'TRIPWIRE_ENGAGED',
  },
  {
    title: 'Adaptive Identity Quarantine Triggered',
    type: 'Trust Score Drop',
    target: 'Exfiltration Threshold Exceeded',
    officerOrIp: 'Session Token #9812A',
    caseId: 'CASE-2026-004',
    severity: 'HIGH',
    status: 'CONTAINMENT_ACTIVE',
  },
];

interface PriorityAlertsProps {
  onSelectAlert?: (alert: any) => void;
  onViewAll?: () => void;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({ onSelectAlert, onViewAll }) => {
  const [alerts, setAlerts] = useState<SocAlertEvent[]>(INITIAL_ALERTS);

  // Simulate live Socket.io feed stream emitting new events every 6 seconds
  useEffect(() => {
    let poolIndex = 0;
    const interval = setInterval(() => {
      const template = INCOMING_SIMULATION_POOL[poolIndex % INCOMING_SIMULATION_POOL.length];
      poolIndex++;

      const newAlert: SocAlertEvent = {
        ...template,
        id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: Date.now(),
        timeAgo: 'Just now',
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Honey Evidence Access':
        return <FileWarning className="w-3.5 h-3.5 text-red-400" />;
      case 'Trust Score Drop':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      case 'Export Attempt':
        return <Database className="w-3.5 h-3.5 text-red-400" />;
      case 'SCADA Probe':
      case 'Unauthorized Egress':
        return <Zap className="w-3.5 h-3.5 text-rose-400" />;
      case 'Unusual Login':
        return <UserX className="w-3.5 h-3.5 text-amber-400" />;
      case 'Blockchain Verification Failure':
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/90 border border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      case 'HIGH':
        return 'bg-amber-950/90 border border-amber-500/70 text-amber-300';
      case 'MEDIUM':
      default:
        return 'bg-blue-950/90 border border-blue-500/60 text-blue-300';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18080f]/95 via-[#0e0308]/95 to-[#060103]/95 border border-red-500/40 shadow-[0_12px_40px_rgba(239,68,68,0.15)] flex flex-col justify-between h-full relative overflow-hidden group isolate">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/25 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-red-900/60 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                LIVE THREAT ALERTS (SOCKET.IO)
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="text-[10px] text-red-300/80 font-sans block">
              Real-Time SOC Event Stream • Automated Mitigation
            </span>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-[11px] text-red-400 hover:text-red-300 transition-colors font-bold font-mono px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-900/80 hover:border-red-500/50 shadow-sm"
        >
          Full SOC Feed
        </button>
      </div>

      {/* Real-time Event Stream Container with Framer Motion */}
      <div className="flex-1 flex flex-col justify-between gap-2.5 my-3 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {alerts.slice(0, 3).map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-[#120409]/90 hover:bg-[#1e0710] border border-red-900/50 hover:border-red-500/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm group/item"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-red-950/90 border border-red-800/80 flex-shrink-0 group-hover/item:scale-105 transition-transform shadow-inner">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover/item:text-red-200 transition-colors truncate">
                      {alert.title}
                    </span>
                    <span className="text-[8.5px] font-mono bg-red-950/90 text-red-300 px-1.5 py-0.5 rounded border border-red-800/80 flex-shrink-0 font-semibold">
                      {alert.caseId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">{alert.target}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-red-300/90 font-mono flex-shrink-0">{alert.officerOrIp}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] text-slate-400 font-mono font-medium">
                    {alert.timeAgo}
                  </span>
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${getSeverityStyle(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow-sm">
                  {alert.status.replace(/_/g, ' ')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-red-900/60 flex items-center justify-between text-[11px] flex-shrink-0">
        <span className="text-slate-400 font-mono text-[10.5px]">
          Socket.io Stream: <strong className="text-emerald-400 font-semibold">CONNECTED (0ms LATENCY)</strong>
        </span>
        <button
          onClick={onViewAll}
          className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 group/btn text-[11px] transition-colors"
        >
          <span>Acknowledge & Contain</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
