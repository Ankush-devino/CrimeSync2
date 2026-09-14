import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Lock,
  CheckCircle2,
  Sliders,
  Ban,
  Check,
  X,
  FileLock,
  Laptop,
  MapPin,
  Clock,
  Globe,
  FileText,
  AlertOctagon,
  Fingerprint,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth, type ThreatMode } from '../context/AuthContext';
import { useCaseContext } from '../context/CaseContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { logOfficerAction } from '../services/activityLogger';
import { IdentityDoppelganger } from '../components/IdentityDoppelganger';
import { ThreatAlert } from '../components/ThreatAlert';

interface IdentitySecurityPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const IdentitySecurityPage: React.FC<IdentitySecurityPageProps> = ({
  onSelectAction,
}) => {
  const { currentUser, threatMode, setThreatMode } = useAuth();
  const { selectedCaseId } = useCaseContext();
  const { trustScore: dbTrustScore, logEvent } = useAuditLog();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [isQuarantining, setIsQuarantining] = useState(false);
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [actionNotice, setActionNotice] = useState<{ title: string; message: string; type: 'DENIED' | 'ALLOWED' } | null>(null);

  // Fetch telemetry from live backend API
  const fetchBehavioralData = useCallback(async (modeOverride?: ThreatMode) => {
    try {
      const mode = modeOverride || threatMode;
      const res = await api.identity.getBehavioralSession({
        officerId: currentUser.id || 'USR-101',
        mode: (mode === 'TRUSTED' ? 'NORMAL' : mode) as any,
      });

      if (res) {
        if (currentUser.name) {
          res.officer.name = currentUser.name;
          res.officer.badgeNumber = currentUser.badgeNumber || 'DEL-IPS-8821';
          res.officer.department = currentUser.department || 'Special Cell / Cyber Crime Unit';
        }
        setData(res);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('[Identity] Failed to fetch behavioral telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [threatMode, currentUser]);

  useEffect(() => {
    fetchBehavioralData();
    const interval = setInterval(() => {
      fetchBehavioralData();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchBehavioralData]);

  // Handle scenario mode switch globally across entire application
  const handleModeSwitch = async (newMode: ThreatMode) => {
    setIsQuarantined(false);
    setActionNotice(null);
    try {
      if (newMode === 'HONEY_TRIGGERED') {
        logEvent('EVIDENCE_VIEW', { id: 'EV-9999', title: 'Swiss Secret Banking Hawala Ledger & Wiretap Dump', isHoneyDecoy: true }, { module: 'Deception Layer', category: 'EVIDENCE', severity: 'CRITICAL', details: 'Planted decoy EV9999 inspected' });
      } else if (newMode === 'COMPROMISED') {
        logEvent('LOGIN', { device: 'MacBook Pro M3 (Unregistered)', location: 'Mumbai, MH' }, { module: 'Auth Engine', category: 'AUTH', severity: 'SUSPICIOUS', details: 'Unregistered device login from Mumbai at 02:00 AM' });
      }

      await setThreatMode(newMode);
      await fetchBehavioralData(newMode);

      if (onSelectAction) {
        onSelectAction(`Switched Threat Containment Mode: ${newMode}`);
      }
      logOfficerAction({
        action: `Simulated Threat State: ${newMode}`,
        module: 'Identity Doppelgänger',
        caseId: selectedCaseId || 'GENERAL',
        status: 'Authorized',
        category: 'SECURITY',
        details: `Adaptive account protection engine updated session risk profile to ${newMode}`,
      });
    } catch (err) {
      console.error('[Identity] Mode switch error:', err);
    }
  };

  // Action test simulator to prove containment
  const handleTestPermissionAction = (actionName: string, isBlocked: boolean) => {
    if (isBlocked) {
      setActionNotice({
        title: `ACTION CONTAINED & BLOCKED: ${actionName}`,
        message: 'Action restricted due to High-Risk session behavior (Trust Score < 50). Exfiltration pathways automatically contained by Adaptive Protection Engine.',
        type: 'DENIED',
      });
      logOfficerAction({
        action: `CONTAINMENT BLOCKED: ${actionName}`,
        module: 'Adaptive Account Protection',
        caseId: selectedCaseId || 'GENERAL',
        status: 'Active',
        category: 'SECURITY',
        details: `Autonomous policy enforcement contained unauthorized attempt: ${actionName}.`,
      });
    } else {
      setActionNotice({
        title: `ACTION AUTHORIZED: ${actionName}`,
        message: 'Trust Score ≥ 50. Cryptographic clearance verified for current operational session.',
        type: 'ALLOWED',
      });
    }
    setTimeout(() => {
      setActionNotice(null);
    }, 5000);
  };

  // Handle SOAR Quarantine action
  const handleQuarantineSession = async () => {
    setIsQuarantining(true);
    try {
      await api.identity.quarantineBehavioralSession({
        officerId: currentUser.id || 'USR-101',
        reason: 'Officer behavioral Trust Score dropped below threshold. Autonomous SOAR isolation enforced.',
      });
      setIsQuarantined(true);
      if (onSelectAction) {
        onSelectAction('Enforced Autonomous Session Quarantine');
      }
    } catch (err) {
      console.error('[Identity] Quarantine error:', err);
    } finally {
      setIsQuarantining(false);
    }
  };

  // Strict Trust Score & Risk styling calculation combining API data & live event-driven trust engine
  const score = Math.min(data?.trustScore ?? 100, dbTrustScore);
  const isRestricted = score < 50;

  const { colorHex, textClass, strokeClass, statusText, riskText, containmentBadge } = useMemo(() => {
    if (score >= 80) {
      return {
        colorHex: '#10b981',
        textClass: 'text-emerald-400',
        strokeClass: 'stroke-emerald-400',
        statusText: 'Status: Trusted (Nominal)',
        riskText: 'Session Risk: Low (Full Clearance)',
        containmentBadge: '🟢 NOMINAL BASELINE (TRUST: 100)',
      };
    } else if (score >= 50) {
      return {
        colorHex: '#f59e0b',
        textClass: 'text-amber-400',
        strokeClass: 'stroke-amber-400',
        statusText: 'Status: Suspicious Drift',
        riskText: 'Session Risk: Medium (Monitored)',
        containmentBadge: '🟡 MONITORED DRIFT PATTERN',
      };
    } else {
      return {
        colorHex: '#ef4444',
        textClass: 'text-red-400',
        strokeClass: 'stroke-red-500',
        statusText: 'Status: High Risk / Compromised',
        riskText: 'Session Risk: Critical (Exfiltration Risk)',
        containmentBadge: '🚨 ADAPTIVE CONTAINMENT ACTIVE',
      };
    }
  }, [score]);

  // Circular gauge calculation
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#030712] text-slate-300 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="font-mono text-xs tracking-wider text-slate-400 uppercase">
            Loading Adaptive Protection System...
          </span>
        </div>
      </div>
    );
  }

  const officer = data?.officer || {
    name: currentUser.name || 'ACP Rajeshwar Sharma',
    badgeNumber: currentUser.badgeNumber || 'DEL-IPS-8821',
    rank: 'Assistant Commissioner of Police',
    department: 'Special Cell / Cyber Crime Unit',
  };

  const session = data?.session || {
    sessionId: 'SES-2026-9921',
    status: 'Active (Trusted)',
    loginTime: '09:14 AM IST',
    ipAddress: '10.240.8.21',
    device: 'Dell Latitude 7440',
    browser: 'Chrome Enterprise v128',
    location: 'Delhi Police HQ',
  };

  // Behavioral parameters
  const behavioralParams = [
    {
      title: 'Hardware TPM & Device',
      icon: Laptop,
      historical: 'Dell Latitude 7440 (Asset #NCRB-DL-9821)',
      current: isRestricted ? 'Apple MacBook Pro M3 (Unregistered)' : 'Dell Latitude 7440',
      isMatch: !isRestricted,
      status: isRestricted ? 'UNREGISTERED HARDWARE' : 'VERIFIED ASSET',
    },
    {
      title: 'Egress IP & Geolocation',
      icon: MapPin,
      historical: 'Delhi Police HQ (10.240.8.21)',
      current: isRestricted ? 'Mumbai, MH (185.220.101.44 Tor)' : 'Delhi Police HQ (10.240.8.21)',
      isMatch: !isRestricted,
      status: isRestricted ? 'ANOMALOUS TOR EGRESS' : 'AUTHORIZED INTRANET',
    },
    {
      title: 'User-Agent & Browser',
      icon: Globe,
      historical: 'Chrome Enterprise v128',
      current: isRestricted ? 'Safari 17.4 (macOS)' : 'Chrome Enterprise v128',
      isMatch: !isRestricted,
      status: isRestricted ? 'BROWSER DRIFT' : 'STANDARD PROFILE',
    },
    {
      title: 'Circadian Access Schedule',
      icon: Clock,
      historical: '09:00 AM - 06:30 PM IST (Mon-Fri)',
      current: isRestricted ? '02:44 AM IST (Off-Hours Velocity)' : '10:45 AM IST (In Schedule)',
      isMatch: !isRestricted,
      status: isRestricted ? 'CIRCADIAN ANOMALY' : 'WITHIN SHIFT',
    },
  ];

  // Adaptive Permissions
  const permissionsList = [
    {
      feature: 'Export Judicial Dossier PDF (Section 65B)',
      category: 'EXFILTRATION',
      isBlocked: isRestricted,
      status: isRestricted ? 'Disabled (HTTP 403 Contained)' : 'Authorized',
      reason: isRestricted ? 'Session Trust Score < 50. File download blocked to prevent judicial data leakage.' : 'Cryptographic clearance verified.',
    },
    {
      feature: 'Hyperledger Blockchain Ledger Write',
      category: 'INTEGRITY',
      isBlocked: isRestricted,
      status: isRestricted ? 'Revoked (Write Lock)' : 'Clearance Verified',
      reason: isRestricted ? 'Session Trust Score < 50. Tamper-proof ledger write lock enforced.' : 'Officer has full ledger append permissions.',
    },
    {
      feature: 'Cell Tower CDR Telemetry Download',
      category: 'EXFILTRATION',
      isBlocked: isRestricted,
      status: isRestricted ? 'Disabled (HTTP 403 Contained)' : 'Authorized',
      reason: isRestricted ? 'Raw telecommunication CDR dump export quarantined.' : 'Authorized investigator clearance verified.',
    },
    {
      feature: 'Case Management & Read-Only Investigation',
      category: 'CASES',
      isBlocked: false,
      status: 'Preserved (Read-Only Access)',
      reason: 'Read-only access is kept active so legitimate officers are not immediately locked out.',
    },
  ];

  return (
    <div className="flex-1 bg-[#030712] text-slate-100 flex flex-col overflow-y-auto px-4 sm:px-6 py-5 space-y-5 select-none font-sans">
      
      {/* ── 1. CLEAN HEADER BAR & SIMULATION SWITCHER ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#050c1e]/90 border border-[#132240] shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-mono">
              Identity Shield
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40 uppercase tracking-widest">
              ADAPTIVE ACCOUNT PROTECTION
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
              isRestricted
                ? 'bg-red-950/90 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            }`}>
              {containmentBadge}
            </span>
          </div>

          {/* Meta line */}
          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Officer: <strong className="text-white">{officer.name}</strong> ({officer.badgeNumber})</span>
            </div>
            <span>•</span>
            <span>Session: <strong className="text-cyan-300">{session.sessionId}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Live Sync ({lastSyncTime})</span>
          </div>
        </div>

        {/* Quick Threat Scenario Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-[#030814] border border-[#14233c] flex-wrap gap-1">
            <button
              onClick={() => handleModeSwitch('TRUSTED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                threatMode === 'TRUSTED' && !isRestricted
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 Normal (100)
            </button>
            <button
              onClick={() => handleModeSwitch('SUSPICIOUS')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                threatMode === 'SUSPICIOUS'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟡 Suspicious (65)
            </button>
            <button
              onClick={() => handleModeSwitch('COMPROMISED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                threatMode === 'COMPROMISED' || (isRestricted && threatMode !== 'HONEY_TRIGGERED')
                  ? 'bg-red-600/30 text-red-300 border border-red-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔴 High Risk (40)
            </button>
            <button
              onClick={() => handleModeSwitch('HONEY_TRIGGERED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                threatMode === 'HONEY_TRIGGERED'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-purple-400 hover:text-purple-200 bg-purple-950/20'
              }`}
            >
              🍯 Honey Tripwire (EV9999)
            </button>
          </div>

          <button
            onClick={handleQuarantineSession}
            disabled={isQuarantined || isQuarantining}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isQuarantined
                ? 'bg-red-950/60 border-red-500/40 text-red-400 cursor-not-allowed'
                : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border-red-500/50'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{isQuarantined ? 'Quarantined' : 'Quarantine'}</span>
          </button>
        </div>
      </div>

      {/* Permission Notification Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
              actionNotice.type === 'DENIED'
                ? 'bg-red-950/90 border-red-500 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionNotice.type === 'DENIED' ? (
                <Lock className="w-4 h-4 text-red-400 flex-shrink-0 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold tracking-wide uppercase">{actionNotice.title}</span>
                <p className="text-[11px] opacity-90 mt-0.5">{actionNotice.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="p-1 rounded hover:bg-black/30 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. TRUST GAUGE & BEHAVIORAL PARAMETER COMPARISON ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Live Trust Score Circular Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-2xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none blur-3xl transition-colors duration-500"
            style={{ backgroundColor: colorHex }}
          />

          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-[#111e38] pb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              LIVE TRUST SCORE
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">EXPLAINABLE MATH</span>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative flex items-center justify-center my-3">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-slate-800/60 fill-transparent"
                strokeWidth="12"
              />
              <motion.circle
                cx="90"
                cy="90"
                r={radius}
                className={`fill-transparent transition-all duration-700 ease-out ${strokeClass}`}
                strokeWidth="12"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 12px ${colorHex})`,
                }}
              />
            </svg>

            {/* Inner Gauge Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-5xl font-black font-mono tracking-tight ${textClass}`}>
                {score}
              </span>
              <span className="text-[10.5px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                OUT OF 100
              </span>
            </div>
          </div>

          {/* Status & Risk Verdict */}
          <div className="w-full text-center mt-1 space-y-1">
            <div className={`text-sm font-extrabold font-mono tracking-wide ${textClass}`}>
              {statusText}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {riskText}
            </div>
          </div>
        </div>

        {/* Right: Behavioral Parameter Baseline Comparison (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#111e38] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Behavioral Profiling (Baseline vs Active Session)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Threshold: <strong className="text-white">50 pts</strong>
              </span>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {behavioralParams.map((param, idx) => {
                const Icon = param.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      param.isMatch
                        ? 'bg-[#030916] border-emerald-500/30'
                        : 'bg-red-950/20 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold text-[11.5px]">
                        <Icon className={`w-3.5 h-3.5 ${param.isMatch ? 'text-cyan-400' : 'text-red-400'}`} />
                        <span>{param.title}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                        param.isMatch
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-950 text-red-300 border-red-500/50'
                      }`}>
                        {param.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10.5px]">
                      <div>
                        <span className="text-slate-500 block">Baseline:</span>
                        <span className="text-slate-400 truncate block">{param.historical}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Current:</span>
                        <span className={`font-bold truncate block ${param.isMatch ? 'text-slate-200' : 'text-red-300'}`}>
                          {param.current}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#111e38] text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Adaptive Account Protection Rule Engine</span>
            <span className="text-cyan-400 font-bold">Active Continuous Evaluation</span>
          </div>
        </div>

      </div>

      {/* ── 3. DYNAMIC ADAPTIVE PERMISSIONS & RESPONSE ENGINE ─────────────────── */}
      <div className="p-6 rounded-2xl bg-[#050c1e]/95 border border-[#132240] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111e38] pb-3 mb-4">
          <div className="flex items-center gap-2">
            {isRestricted ? (
              <FileLock className="w-4 h-4 text-red-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Automatic Response Engine (Allowed vs Blocked Permissions)
                </h3>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.2 rounded border ${
                  isRestricted
                    ? 'bg-red-950 text-red-300 border-red-500/50'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isRestricted ? 'CONTAINED STATE' : 'UNRESTRICTED STATE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                When Trust Score &lt; 50, sensitive operations are automatically locked while read-only case inspection is preserved.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Export Policy: <strong className={isRestricted ? 'text-red-400' : 'text-emerald-400'}>{isRestricted ? 'HTTP 403 Blocked' : 'Allowed'}</strong>
          </span>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-[#030814]/70">
                <th className="py-2.5 px-3 font-bold">SYSTEM ACTION</th>
                <th className="py-2.5 px-3 font-bold">CATEGORY</th>
                <th className="py-2.5 px-3 font-bold text-center">ACCESS STATUS</th>
                <th className="py-2.5 px-3 font-bold">ENFORCEMENT REASON</th>
                <th className="py-2.5 px-3 font-bold text-right">ACTION TEST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionsList.map((perm, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    perm.isBlocked
                      ? 'bg-red-950/20 hover:bg-red-950/30'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-200 flex items-center gap-2">
                    {perm.isBlocked ? (
                      <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    <span>{perm.feature}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-400 text-[10.5px]">
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px]">
                      {perm.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      perm.isBlocked
                        ? 'bg-red-950 text-red-200 border-red-500/60'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {perm.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-400 text-[10.5px] max-w-sm">
                    {perm.reason}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleTestPermissionAction(perm.feature, perm.isBlocked)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        perm.isBlocked
                          ? 'bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40'
                          : 'bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {perm.isBlocked ? 'Test (Blocked)' : 'Execute (Allowed)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. IDENTITY DOPPELGÄNGER: COMPROMISED PROFILES QUEUE ─────────────── */}
      <IdentityDoppelganger onCaseSelected={(firCase) => {
        if (onSelectAction) {
          onSelectAction(`Inspecting Compromised FIR: ${firCase.firNumber || firCase.id}`);
        }
      }} />

      {/* ── 5. GRANULAR DECEPTION DIAGNOSTIC AUDIT (THREAT ALERT VIEW) ────────── */}
      <ThreatAlert />

    </div>
  );
};
