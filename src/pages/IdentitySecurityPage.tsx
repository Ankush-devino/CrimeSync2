import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Fingerprint,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Key,
  Smartphone,
  Laptop,
  Radio,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  Camera,
  Lock,
  Flame,
  AlertOctagon,
  Sparkles,
  Search,
  Filter,
  Download,
  RefreshCw,
  Copy,
  Check,
  Zap,
  RadioTower,
  Sliders,
  FileText,
  FileSpreadsheet,
  Ban,
  ShieldX,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { logOfficerAction } from '../services/activityLogger';

interface IdentitySecurityPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export interface OfficerBiometricProfile {
  id: string;
  name: string;
  rank: string;
  department: string;
  badgeNumber: string;
  enrolledDate: string;
  status: 'live' | 'flagged' | 'quarantined';
  matchConfidence: number;
  faceGeometryMatch: boolean;
  voiceprintMatch: boolean;
  typingCadenceMatch: boolean;
  deviceFingerprintMatch: boolean;
  badgeCertMatch: boolean;
  faceConfidence: number;
  deviceInfo: string;
  locationInfo: string;
  lastActive: string;
  ipAddress: string;
  assignedCaseId?: string;
}

export interface IdentityTrailEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  officerName: string;
  badgeNumber: string;
  action: string;
  category: 'BIOMETRIC_PASS' | 'IMPOSSIBLE_TRAVEL' | 'FAILED_CHALLENGE' | 'SESSION_HIJACK' | 'QUARANTINE_ENFORCED' | 'CREDENTIAL_REFRESH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'VERIFIED' | 'FLAGGED' | 'BLOCKED' | 'QUARANTINED';
  caseId: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  confidenceScore: number;
  hashSha256: string;
  details: string;
  rawTelemetry?: {
    faceScore?: number;
    voiceDriftPercent?: number;
    typingCadenceDeviation?: number;
    geoDriftKm?: number;
    speedKmph?: number;
  };
}

export interface DoppelgangerWatchlistItem {
  id: string;
  profileId: string;
  officerName: string;
  badgeNumber: string;
  flagReason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  flaggedAt: string;
  timeAgo: string;
  anomalyType: 'VOICE_DRIFT' | 'IMPOSSIBLE_TRAVEL' | 'KEYBOARD_CADENCE' | 'UNAUTHORIZED_DEVICE' | 'CLONED_SESSION';
  deviceInfo: string;
  location: string;
  status: 'ACTIVE_ALERT' | 'QUARANTINED' | 'INVESTIGATING';
  confidenceMatch: number;
}

export const IdentitySecurityPage: React.FC<IdentitySecurityPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  const { selectedCaseId, cases, setSelectedCaseId } = useCaseContext();
  const { currentUser } = useAuth();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'match' | 'trail' | 'watchlist' | 'behavior'>('match');

  // Backend Data State
  const [profiles, setProfiles] = useState<OfficerBiometricProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('acp_raj_verma');
  const [trailEvents, setTrailEvents] = useState<IdentityTrailEvent[]>([]);
  const [watchlist, setWatchlist] = useState<DoppelgangerWatchlistItem[]>([]);
  const [stats, setStats] = useState<any>({
    verifiedIdentities: 1842,
    totalActiveAccounts: 1847,
    doppelgangersFlagged: 5,
    behaviorAnomalies: 14,
    avgTrustScore: 91,
    mfaEnrollment: '1,839 / 1,847',
    hardwareKeyAdoptionRate: '78%'
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search State for Identity Trail tab
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Verification Scanner Modal State
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [verifyingOfficerId, setVerifyingOfficerId] = useState<string>('acp_raj_verma');

  // Quarantine Modal State
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState<boolean>(false);
  const [targetQuarantineProfile, setTargetQuarantineProfile] = useState<OfficerBiometricProfile | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>('Doppelganger behavioral biometric mismatch detected during active session');
  const [isQuarantining, setIsQuarantining] = useState<boolean>(false);

  // Simulation Modal State
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch all identity data
  const loadIdentityData = useCallback(async () => {
    setLoading(true);
    try {
      const caseFilter = selectedCaseId !== 'ALL' ? selectedCaseId : undefined;
      const [profRes, trailRes, watchRes, statRes] = await Promise.all([
        api.identity.getProfiles(caseFilter),
        api.identity.getIdentityTrail({ caseId: caseFilter }),
        api.identity.getWatchlist(caseFilter),
        api.identity.getStats(caseFilter)
      ]);

      if (profRes && Array.isArray(profRes)) {
        setProfiles(profRes);
        if (profRes.length > 0 && !profRes.some((p) => p.id === selectedProfileId)) {
          setSelectedProfileId(profRes[0].id);
        }
      }
      if (trailRes && Array.isArray(trailRes)) {
        setTrailEvents(trailRes);
      }
      if (watchRes && Array.isArray(watchRes)) {
        setWatchlist(watchRes);
      }
      if (statRes) {
        setStats(statRes);
      }
    } catch (err) {
      console.error('Failed to load identity intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    loadIdentityData();
  }, [loadIdentityData]);

  // Selected Profile
  const currentProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedProfileId) || profiles[0] || {
      id: 'acp_raj_verma',
      name: 'ACP Raj Verma',
      rank: 'Assistant Commissioner of Police',
      department: 'Special Cyber Crime Cell',
      badgeNumber: 'DL-POL-8842',
      enrolledDate: '14 Mar 2024',
      status: 'live',
      matchConfidence: 98.6,
      faceGeometryMatch: true,
      voiceprintMatch: true,
      typingCadenceMatch: true,
      deviceFingerprintMatch: true,
      badgeCertMatch: true,
      faceConfidence: 99.2,
      deviceInfo: 'Dell Latitude 7440 (Encrypted TPM 2.0)',
      locationInfo: 'Delhi HQ - Command Room B',
      lastActive: 'Just now',
      ipAddress: '10.14.22.84',
      assignedCaseId: 'CASE-2026-001'
    };
  }, [profiles, selectedProfileId]);

  // Filtered trail events
  const filteredTrailEvents = useMemo(() => {
    return trailEvents.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          item.officerName.toLowerCase().includes(q) ||
          item.badgeNumber.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.deviceInfo.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.caseId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trailEvents, selectedCategory, searchFilter]);

  // Show Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger Live Verification Scanner
  const handleStartVerificationScan = (officerId?: string) => {
    const targetId = officerId || currentProfile.id;
    setVerifyingOfficerId(targetId);
    setIsVerifyingModalOpen(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1500);
    setTimeout(() => {
      setScanStep(4);
      // Call backend API verify
      api.identity.verify(targetId).then((res) => {
        if (res) {
          logOfficerAction({
            action: 'Executed Zero-Knowledge Biometric Identity Challenge',
            module: 'Identity Security',
            details: `Validated biometric telemetry for ${res.officerName} (${res.badgeNumber}). Confidence: ${res.confidence}%`,
            category: 'SECURITY'
          });
          loadIdentityData();
        }
      });
    }, 2400);
  };

  // Open Quarantine Modal
  const handleOpenQuarantine = (profile: OfficerBiometricProfile) => {
    setTargetQuarantineProfile(profile);
    setIsQuarantineModalOpen(true);
  };

  // Execute Quarantine
  const handleExecuteQuarantine = async () => {
    if (!targetQuarantineProfile) return;
    setIsQuarantining(true);
    try {
      const res = await api.identity.quarantine(targetQuarantineProfile.id, quarantineReason);
      if (res) {
        logOfficerAction({
          action: 'Enforced Emergency Officer Session Quarantine & Invalidation',
          module: 'Identity Security',
          details: `Quarantined ${targetQuarantineProfile.name} (${targetQuarantineProfile.badgeNumber}). Reason: ${quarantineReason}. Ref: ${res.quarantineId}`,
          category: 'SECURITY'
        });
        triggerToast(`✓ Session Quarantined for ${targetQuarantineProfile.name}`);
        setIsQuarantineModalOpen(false);
        loadIdentityData();
      }
    } catch (err: any) {
      alert(`Quarantine Error: ${err.message}`);
    } finally {
      setIsQuarantining(false);
    }
  };

  // Escalate Watchlist to CSOC
  const handleEscalateWatchlist = async (profileId: string) => {
    try {
      const res = await api.identity.escalate(profileId, 'Doppelganger biometric mismatch flagged during live case investigation');
      if (res) {
        logOfficerAction({
          action: 'Escalated Doppelganger Anomaly to CSOC & CERT-In',
          module: 'Identity Security',
          details: `Dispatched incident ticket #${res.escalationTicket} for ${res.targetOfficer} to Cyber Security Operations Center.`,
          category: 'SECURITY'
        });
        triggerToast(`🚨 Escalated to CSOC: Ticket #${res.escalationTicket}`);
        loadIdentityData();
      }
    } catch (err: any) {
      alert(`Escalation Error: ${err.message}`);
    }
  };

  // Ingest Simulated Anomaly
  const handleSimulateAnomaly = (type: 'IMPOSSIBLE_TRAVEL' | 'VOICE_DRIFT' | 'CLONED_KEY' | 'CADENCE_DRIFT') => {
    let actionText = '';
    let category: any = 'SESSION_HIJACK';
    let severity: any = 'CRITICAL';
    let detailsText = '';

    if (type === 'IMPOSSIBLE_TRAVEL') {
      actionText = 'Impossible Travel Telemetry Detected: Delhi to Pune in 12 minutes';
      category = 'IMPOSSIBLE_TRAVEL';
      detailsText = 'Authentication attempt from Pune cell tower while primary terminal in Delhi HQ is actively authenticated.';
    } else if (type === 'VOICE_DRIFT') {
      actionText = 'Voiceprint Spectral Harmonics Drift: 24.8% AI Synthesis Anomaly';
      category = 'FAILED_CHALLENGE';
      severity = 'HIGH';
      detailsText = 'Audio waveform during tactical voice dispatch matched generative deepfake acoustics signature.';
    } else if (type === 'CLONED_KEY') {
      actionText = 'Hardware Smart-Card Token Clone Detected: Duplicate Nonce Counter';
      category = 'SESSION_HIJACK';
      detailsText = 'Simultaneous cryptographic handshake detected on two distinct physical network adapters.';
    } else {
      actionText = 'Keyboard Flight-Time & Dwell-Time Cadence Drift: 32% Anomaly';
      category = 'FAILED_CHALLENGE';
      severity = 'MEDIUM';
      detailsText = 'Keystroke velocity profile significantly deviates from 90-day enrolled baseline envelope.';
    }

    const newEvent: IdentityTrailEvent = {
      id: `ID-SIM-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      officerName: 'Insp. R. Sharma',
      badgeNumber: 'DL-POL-4192',
      action: actionText,
      category,
      severity,
      status: 'FLAGGED',
      caseId: selectedCaseId !== 'ALL' ? selectedCaseId : 'CASE-2026-004',
      deviceInfo: 'Unregistered Terminal #9 (Simulated Anomaly)',
      ipAddress: '152.57.19.202',
      location: 'Pune Cyber Cell Sector 12',
      confidenceScore: 54.2,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      details: detailsText
    };

    setTrailEvents((prev) => [newEvent, ...prev]);
    logOfficerAction({
      action: `Identity Threat: ${actionText}`,
      module: 'Identity Security',
      details: detailsText,
      caseId: selectedCaseId,
      category: 'SECURITY'
    });

    setIsSimulateModalOpen(false);
    triggerToast(`⚠️ Injected Live Anomaly: ${actionText}`);
  };

  // Copy Hash
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export Trail to CSV
  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Officer Name', 'Badge Number', 'Action', 'Category', 'Severity', 'Status', 'Case ID', 'Device', 'IP Address', 'Location', 'Trust Score', 'SHA-256 Hash', 'Details'];
    const rows = filteredTrailEvents.map((e) => [
      e.id,
      e.timestamp,
      `"${e.officerName}"`,
      e.badgeNumber,
      `"${e.action}"`,
      e.category,
      e.severity,
      e.status,
      e.caseId,
      `"${e.deviceInfo}"`,
      e.ipAddress,
      `"${e.location}"`,
      e.confidenceScore,
      e.hashSha256,
      `"${e.details}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRIMESYNC_IDENTITY_TRAIL_${selectedCaseId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('✓ Identity Trail CSV Exported');
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto selection:bg-cyan-600/30 selection:text-cyan-200">
      
      {/* ─── Toast Notification ─── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-[#0c1a36] border border-cyan-500 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white uppercase">
                IDENTITY SECURITY &amp; DOPPELGANGER TRAIL
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                ZERO-TRUST BIOMETRIC SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Behavioral biometrics, anti-spoofing face/voice harmonics &amp; continuous session authentication trail
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Case Selector */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 pointer-events-none text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="pl-8 pr-8 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] hover:border-cyan-500/60 focus:border-cyan-500 text-xs font-semibold text-cyan-300 font-mono focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
              title="Select Active Investigation Case"
            >
              {cases && cases.length > 0 ? (
                cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#091122] text-slate-200 font-sans">
                    {c.id} — {c.title || c.name || 'Investigation'}
                  </option>
                ))
              ) : (
                <option value={selectedCaseId} className="bg-[#091122] text-slate-200">
                  {selectedCaseId}
                </option>
              )}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Simulate Anomaly Trigger */}
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-amber-300 hover:text-white hover:border-amber-500/60 flex items-center gap-1.5 transition-all shadow-sm"
            title="Simulate Anomaly for Testing"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Anomaly</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/60 flex items-center gap-1.5 transition-all shadow-sm"
            title="Export Identity Trail CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Trail</span>
          </button>

          {/* Verify Now Action Button */}
          <button
            onClick={() => handleStartVerificationScan(currentProfile.id)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Verify Identity Now</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: VERIFIED IDENTITIES */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              VERIFIED IDENTITIES
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {stats.verifiedIdentities?.toLocaleString('en-IN') || '1,842'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              of {stats.totalActiveAccounts?.toLocaleString('en-IN') || '1,847'} active officer accounts
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: DOPPELGANGERS FLAGGED */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-red-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              DOPPELGANGERS FLAGGED
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">
              {stats.doppelgangersFlagged || watchlist.length || 5}
            </div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-1">
              <span>↑</span> 2 compromised sessions isolated
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: BEHAVIOR ANOMALIES */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              BEHAVIOR &amp; CADENCE DRIFT
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {stats.behaviorAnomalies || 14}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              keystroke dynamics &amp; voiceprint variations
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Fingerprint className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: AVG TRUST SCORE */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-cyan-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AVG ZERO-TRUST SCORE
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats.avgTrustScore || 91}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑</span> Hardware FIDO2 adoption: {stats.hardwareKeyAdoptionRate || '78%'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#142342] pb-2">
        <button
          onClick={() => setActiveTab('match')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'match'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-[#081023] text-slate-400 border border-[#142342] hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Biometric Match &amp; Profiles</span>
        </button>

        <button
          onClick={() => setActiveTab('trail')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'trail'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-[#081023] text-slate-400 border border-[#142342] hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Identity Audit Trail</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">
            {filteredTrailEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'watchlist'
              ? 'bg-red-600/20 text-red-300 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              : 'bg-[#081023] text-slate-400 border border-[#142342] hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>Doppelganger Watchlist</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-mono">
            {watchlist.filter((w) => w.status === 'ACTIVE_ALERT').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('behavior')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'behavior'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-[#081023] text-slate-400 border border-[#142342] hover:text-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Behavioral Dynamics &amp; Geo-Consistency</span>
        </button>
      </div>

      {/* ─── TAB 1: BIOMETRIC MATCH & PROFILES ─── */}
      {activeTab === 'match' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Left: Officer Profile Selection List (Spans 4 cols on lg) */}
          <div className="lg:col-span-4 rounded-xl bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Active Officer Sessions ({profiles.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Continuous ZK Sync</span>
              </div>

              <div className="space-y-2 pt-3 text-xs overflow-y-auto max-h-[480px] pr-1">
                {profiles.map((prof) => {
                  const isSelected = prof.id === currentProfile.id;
                  return (
                    <div
                      key={prof.id}
                      onClick={() => setSelectedProfileId(prof.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-[#050b18] border-[#101c34] hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            <OfficerAvatarIcon className="w-6 h-6 text-slate-200" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                              <span>{prof.name}</span>
                              {prof.status === 'live' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-slate-400">
                              {prof.badgeNumber} · {prof.rank}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase shrink-0 ${
                            prof.status === 'live'
                              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                              : prof.status === 'quarantined'
                              ? 'bg-rose-950 border border-rose-500 text-rose-300'
                              : 'bg-amber-950 border border-amber-500 text-amber-300'
                          }`}
                        >
                          {prof.status}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#0f1b33] flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[160px]">📍 {prof.locationInfo}</span>
                        <span className={`font-mono font-bold ${prof.matchConfidence > 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {prof.matchConfidence}% confidence
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Challenge Trigger */}
            <div className="pt-3 border-t border-[#12203c] mt-3">
              <button
                onClick={() => handleStartVerificationScan(currentProfile.id)}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Camera className="w-4 h-4" />
                <span>Re-Challenge {currentProfile.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Right: Detailed Biometric Telemetry & Radar (Spans 8 cols on lg) */}
          <div className="lg:col-span-8 rounded-xl bg-[#070e1f] border border-[#132342] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#12203c]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Biometric Identity Profile — {currentProfile.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-semibold flex items-center gap-1 border ${
                    currentProfile.status === 'live'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                      : currentProfile.status === 'quarantined'
                      ? 'bg-rose-950/80 border-rose-500/60 text-rose-400'
                      : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentProfile.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                    {currentProfile.status} session
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDetailModal('biometric_log')}
                    className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>Full Biometric Log</span>
                    <span className="text-xs">→</span>
                  </button>

                  {currentProfile.status !== 'quarantined' && (
                    <button
                      onClick={() => handleOpenQuarantine(currentProfile)}
                      className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900/80 border border-red-500/60 text-red-300 text-[10.5px] font-bold flex items-center gap-1 transition-all"
                      title="Quarantine this officer session immediately"
                    >
                      <Ban className="w-3 h-3 text-red-400" />
                      <span>Quarantine</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Biometric Analysis Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
                {/* Biometric Scanner Radar Circle (5 cols on md) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Outer Glow Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>

                    {/* Inner Radar Rings */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        fill="none"
                        stroke="#0a1d33"
                        strokeWidth="4"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        fill="none"
                        stroke={currentProfile.matchConfidence > 75 ? '#10b981' : '#ef4444'}
                        strokeWidth="4.5"
                        strokeDasharray="528"
                        strokeDashoffset={528 - (528 * currentProfile.matchConfidence) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      />
                    </svg>

                    {/* Registered Profile Tag */}
                    <div className="absolute -top-1 px-2.5 py-0.5 rounded-full bg-[#070e1f] border border-cyan-400/80 text-cyan-300 text-[8.5px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                      <span>REGISTERED PROFILE</span>
                      <div className="w-3 h-3 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Center Officer Avatar Portrait */}
                    <div className="w-24 h-24 rounded-full bg-[#050b18] border-2 border-cyan-400 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.4)] relative">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900/60 to-slate-900">
                        <OfficerAvatarIcon className="w-16 h-16 text-slate-100" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-4 w-full animate-bounce"></div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono mt-2">
                    Enrolled {currentProfile.enrolledDate} · Badge {currentProfile.badgeNumber}
                  </span>
                </div>

                {/* Right Confidence & Factor Checklist (7 cols on md) */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      MATCH CONFIDENCE SCORE
                    </div>
                    <div className="text-3xl font-extrabold text-cyan-400 mt-0.5 flex items-baseline gap-2">
                      <span>{currentProfile.matchConfidence}%</span>
                      <span className="text-xs font-normal text-slate-400 font-sans">
                        {currentProfile.matchConfidence > 75 ? 'Optimal zero-trust baseline' : 'Anomalous deviation detected'}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-[#0c1830] rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          currentProfile.matchConfidence > 75
                            ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                            : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                        }`}
                        style={{ width: `${currentProfile.matchConfidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 5 Biometric Factor Rows */}
                  <div className="space-y-2 text-xs pt-1">
                    {/* Factor 1: Face Geometry */}
                    <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Face Geometry &amp; 3D Depth Map</span>
                      </span>
                      <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.faceGeometryMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentProfile.faceGeometryMatch ? '✓ Valid (99.2%)' : '✗ Mismatch (61.0%)'}
                      </span>
                    </div>

                    {/* Factor 2: Voiceprint */}
                    <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" />
                        <span>Voiceprint Acoustic Resonance (24-Band FFT)</span>
                      </span>
                      <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.voiceprintMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentProfile.voiceprintMatch ? '✓ Valid' : '⚠ Acoustic Drift (22%)'}
                      </span>
                    </div>

                    {/* Factor 3: Typing Cadence */}
                    <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-400" />
                        <span>Keystroke Flight &amp; Dwell Dynamics</span>
                      </span>
                      <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.typingCadenceMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentProfile.typingCadenceMatch ? '✓ Nominal' : '⚠ Cadence Variance'}
                      </span>
                    </div>

                    {/* Factor 4: Device + Location */}
                    <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Device TPM 2.0 &amp; BSSID Geolocation</span>
                      </span>
                      <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.deviceFingerprintMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentProfile.deviceFingerprintMatch ? '✓ Verified Hardware' : '✗ Unenrolled Device'}
                      </span>
                    </div>

                    {/* Factor 5: Badge Cert */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Smart-Card X.509 Cryptographic Cert</span>
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        ✓ Police Root CA Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Metadata Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-[#12203c] text-[11px] bg-[#050b18]/60 p-2.5 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px]">REGISTERED HARDWARE</span>
                <span className="text-slate-200 font-semibold font-mono">{currentProfile.deviceInfo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT GEO LOCATION</span>
                <span className="text-slate-200 font-semibold">{currentProfile.locationInfo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SESSION IP ADDRESS</span>
                <span className="text-cyan-300 font-mono font-semibold">{currentProfile.ipAddress}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: IDENTITY AUDIT TRAIL ─── */}
      {activeTab === 'trail' && (
        <div className="space-y-4">
          {/* Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search identity trail by officer, badge, IP, device, action or case..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#050b18] border border-[#162747] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'BIOMETRIC_PASS', label: 'Biometric Pass' },
                { id: 'IMPOSSIBLE_TRAVEL', label: 'Impossible Travel' },
                { id: 'SESSION_HIJACK', label: 'Session Hijack' },
                { id: 'FAILED_CHALLENGE', label: 'Failed Challenge' },
                { id: 'QUARANTINE_ENFORCED', label: 'Quarantines' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/60'
                      : 'bg-[#050b18] text-slate-400 border border-[#142342] hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chronological Event Feed */}
          <div className="space-y-2.5">
            {filteredTrailEvents.length === 0 ? (
              <div className="p-8 text-center bg-[#070e1f] border border-[#132342] rounded-xl text-slate-400 text-xs">
                No identity trail logs matching your search criteria.
              </div>
            ) : (
              filteredTrailEvents.map((evt) => {
                const isExpanded = expandedEventId === evt.id;
                return (
                  <div
                    key={evt.id}
                    className={`rounded-xl border transition-all ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-[#12060c] border-rose-900/60 hover:border-rose-500/80'
                        : evt.severity === 'HIGH'
                        ? 'bg-[#140b05] border-amber-900/60 hover:border-amber-500/80'
                        : 'bg-[#070e1f] border-[#132342] hover:border-cyan-500/50'
                    }`}
                  >
                    {/* Event Summary Bar */}
                    <div
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-950 border-rose-500/60 text-rose-400'
                              : evt.severity === 'HIGH'
                              ? 'bg-amber-950 border-amber-500/60 text-amber-400'
                              : 'bg-cyan-950 border-cyan-500/60 text-cyan-400'
                          }`}
                        >
                          {evt.severity === 'CRITICAL' ? (
                            <AlertOctagon className="w-4 h-4" />
                          ) : evt.severity === 'HIGH' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-white">{evt.action}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                                evt.status === 'VERIFIED'
                                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                                  : evt.status === 'QUARANTINED'
                                  ? 'bg-rose-950 border-rose-500/60 text-rose-300'
                                  : 'bg-amber-950 border-amber-500/60 text-amber-300'
                              }`}
                            >
                              {evt.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="text-slate-200 font-semibold">{evt.officerName}</span>
                            <span>({evt.badgeNumber})</span>
                            <span>·</span>
                            <span>📍 {evt.location}</span>
                            <span>·</span>
                            <span className="font-mono text-cyan-300">{evt.caseId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-slate-300 block">{evt.timeAgo}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expandable Technical Details Tray */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#12203c] space-y-3 text-xs bg-[#050b18]/70 rounded-b-xl">
                        <p className="text-slate-300 leading-relaxed">{evt.details}</p>

                        {/* Technical Metadata Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#030712] p-3 rounded-lg border border-[#101c34] font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 text-[9.5px] block">HARDWARE &amp; OS DEVICE</span>
                            <span className="text-slate-200">{evt.deviceInfo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9.5px] block">IP &amp; BSSID TELEMETRY</span>
                            <span className="text-cyan-300">{evt.ipAddress}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9.5px] block">BIOMETRIC CONFIDENCE</span>
                            <span className={`font-bold ${evt.confidenceScore > 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {evt.confidenceScore}% match
                            </span>
                          </div>
                        </div>

                        {/* Cryptographic SHA-256 Hash Chain */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#0f1b33]">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono uppercase">SHA-256 PROOF:</span>
                            <span className="text-[10.5px] font-mono text-slate-400 truncate max-w-[280px] sm:max-w-md">
                              {evt.hashSha256}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyHash(evt.hashSha256);
                            }}
                            className="text-[10.5px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono shrink-0"
                          >
                            {copiedHash === evt.hashSha256 ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Hash</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: DOPPELGANGER WATCHLIST & QUARANTINES ─── */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#142342]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Active Doppelganger &amp; Impersonation Alerts ({watchlist.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Flagged sessions exhibiting biometric drift, impossible travel, or credential cloning
              </p>
            </div>

            <button
              onClick={() => handleEscalateWatchlist('insp_r_sharma')}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Escalate All to CSOC</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#090e1f] border border-[#1a2c4e] hover:border-red-500/60 transition-all shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 font-bold shrink-0">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{item.officerName}</span>
                          <span className="text-xs font-mono text-slate-400">({item.badgeNumber})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Flagged {item.timeAgo} · {item.anomalyType.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase border ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : 'bg-amber-950 border-amber-500 text-amber-300'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-[#050b18] p-2.5 rounded-lg border border-[#101c34]">
                    {item.flagReason}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px] text-slate-400 font-mono">
                    <div>
                      <span className="text-[9.5px] text-slate-500 block">DEVICE</span>
                      <span className="text-slate-200">{item.deviceInfo}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-500 block">LOCATION</span>
                      <span className="text-slate-200">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#142444] flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-mono font-bold ${item.confidenceMatch > 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    Biometric: {item.confidenceMatch}%
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartVerificationScan(item.profileId)}
                      className="px-2.5 py-1 rounded bg-[#0e1c36] hover:bg-cyan-900/40 border border-[#1d355f] text-cyan-300 text-xs font-semibold"
                    >
                      Re-Challenge
                    </button>
                    <button
                      onClick={() => {
                        const prof = profiles.find((p) => p.id === item.profileId) || currentProfile;
                        handleOpenQuarantine(prof);
                      }}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                    >
                      Quarantine Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: BEHAVIORAL DYNAMICS & GEO-CONSISTENCY ─── */}
      {activeTab === 'behavior' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Keystroke & Mouse Dynamics Waveform (Spans 6 cols on lg) */}
          <div className="lg:col-span-6 rounded-xl bg-[#070e1f] border border-[#132342] p-4 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  Live Keystroke &amp; Mouse Dynamics
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-[10px] text-cyan-300 border border-cyan-500/40 font-mono">
                  Active Baseline: Nominal (98.6%)
                </span>
              </div>

              {/* Dynamic Waveform SVG */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-full h-24 flex items-center bg-[#040813] rounded-lg p-2 border border-[#101c34]">
                  <svg className="w-full h-full stroke-cyan-400 fill-none" viewBox="0 0 400 60">
                    <rect x="0" y="12" width="400" height="36" fill="rgba(6, 182, 212, 0.05)" />
                    <path
                      d="M0 30 L30 30 L45 14 L60 46 L75 30 L100 30 L115 8 L130 52 L145 30 L170 18 L185 42 L200 10 L215 50 L230 30 L260 30 L275 22 L290 38 L310 30 L340 15 L355 45 L370 30 L400 30"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                    />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-400 font-mono text-center mt-3">
                  Flight-time dwell variance · 24-sample continuous biometric envelope
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#12203c] text-center text-xs">
              <div className="bg-[#050b18] p-2 rounded border border-[#101c34]">
                <span className="text-[10px] text-slate-400 block">DWELL TIME</span>
                <span className="font-mono font-bold text-emerald-400">84 ms ± 3ms</span>
              </div>
              <div className="bg-[#050b18] p-2 rounded border border-[#101c34]">
                <span className="text-[10px] text-slate-400 block">FLIGHT TIME</span>
                <span className="font-mono font-bold text-emerald-400">112 ms ± 6ms</span>
              </div>
              <div className="bg-[#050b18] p-2 rounded border border-[#101c34]">
                <span className="text-[10px] text-slate-400 block">VELOCITY DRIFT</span>
                <span className="font-mono font-bold text-cyan-300">1.2% (Nominal)</span>
              </div>
            </div>
          </div>

          {/* Login Geo-Consistency & Credential Health (Spans 6 cols on lg) */}
          <div className="lg:col-span-6 space-y-3.5">
            {/* Geo Consistency Card */}
            <div className="rounded-xl bg-[#070e1f] border border-[#132342] p-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Login Geo-Consistency Breakdown
                </span>
              </div>

              <div className="space-y-2.5 pt-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#101c34]">
                  <span className="text-slate-300">Delhi HQ Command Room B (Registered Primary)</span>
                  <span className="text-emerald-400 font-bold font-mono">96% nominal</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101c34]">
                  <span className="text-slate-300">Field Tablet Terminal (Lajpat Nagar)</span>
                  <span className="text-emerald-400 font-bold font-mono">89% confidence</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#101c34]">
                  <span className="text-slate-300">Gov VPN Gateway (Gurugram Node)</span>
                  <span className="text-amber-400 font-bold font-mono">61% heightened check</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Unrecognized Cell Tower (Pune Sector 12)</span>
                  <span className="text-red-400 font-bold font-mono">12% [QUARANTINE ENFORCED]</span>
                </div>
              </div>
            </div>

            {/* Credential Health Card */}
            <div className="rounded-xl bg-[#070e1f] border border-[#132342] p-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Department Credential Health &amp; Zero-Trust Compliance
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs font-mono">
                <div className="bg-[#050b18] p-2.5 rounded-lg border border-[#101c34]">
                  <span className="text-[10px] text-slate-400 font-sans block">MFA ENROLLMENT</span>
                  <span className="text-emerald-400 font-bold text-sm">1,839 / 1,847 (99.5%)</span>
                </div>
                <div className="bg-[#050b18] p-2.5 rounded-lg border border-[#101c34]">
                  <span className="text-[10px] text-slate-400 font-sans block">HARDWARE FIDO2 ADOPTION</span>
                  <span className="text-cyan-300 font-bold text-sm">78% Enrolled</span>
                </div>
                <div className="bg-[#050b18] p-2.5 rounded-lg border border-[#101c34]">
                  <span className="text-[10px] text-slate-400 font-sans block">STALE CREDENTIALS (&gt;90d)</span>
                  <span className="text-amber-400 font-bold text-sm">37 Accounts</span>
                </div>
                <div className="bg-[#050b18] p-2.5 rounded-lg border border-[#101c34]">
                  <span className="text-[10px] text-slate-400 font-sans block">ACTIVE QUARANTINES</span>
                  <span className="text-rose-400 font-bold text-sm">2 Sessions Blocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: LIVE BIOMETRIC VERIFICATION SCANNER ─── */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-cyan-500/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
                Live Zero-Knowledge Biometric Session Challenge
              </h3>
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 space-y-4">
              <div className="w-28 h-28 mx-auto rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <OfficerAvatarIcon className="w-20 h-20 text-slate-200" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-6 w-full animate-bounce"></div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-white">
                  {scanStep === 1 && '1/4 Scanning 3D facial topology & micro-expressions...'}
                  {scanStep === 2 && '2/4 Sampling audio harmonics for anti-spoof voiceprint...'}
                  {scanStep === 3 && '3/4 Verifying keystroke flight timing & mouse dynamics...'}
                  {scanStep === 4 && '✓ Multi-Factor Biometric Verification Complete: 98.6% Match!'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Officer: {currentProfile.name} ({currentProfile.badgeNumber})
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0c1830] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#06b6d4]"
                  style={{ width: `${(scanStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#162747]">
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow"
              >
                {scanStep === 4 ? 'Confirm & Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: QUARANTINE SESSION CONFIRMATION ─── */}
      {isQuarantineModalOpen && targetQuarantineProfile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#081023] border border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Ban className="w-4 h-4 text-rose-400" />
                Enforce Emergency Session Quarantine
              </h3>
              <button onClick={() => setIsQuarantineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-200">
                ⚠️ You are about to forcibly terminate and revoke the session token for <strong>{targetQuarantineProfile.name}</strong> ({targetQuarantineProfile.badgeNumber}). This will invalidate all active cryptographic keypairs and disconnect the hardware terminal.
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Reason for Emergency Quarantine (Statutory Audit Trail)
                </label>
                <textarea
                  value={quarantineReason}
                  onChange={(e) => setQuarantineReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#050b18] border border-[#162747] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#162747]">
              <button
                onClick={() => setIsQuarantineModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0e1c36] hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteQuarantine}
                disabled={isQuarantining}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isQuarantining ? 'Quarantining...' : 'Confirm Session Quarantine'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SIMULATE ANOMALY ─── */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                Simulate Identity Anomaly Event
              </h3>
              <button onClick={() => setIsSimulateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300 mb-3">
                Select an anomaly to inject into the live identity security telemetry stream:
              </p>

              <button
                onClick={() => handleSimulateAnomaly('IMPOSSIBLE_TRAVEL')}
                className="w-full p-3 rounded-lg bg-[#050b18] hover:bg-amber-950/40 border border-[#142444] hover:border-amber-500/60 text-left transition-all"
              >
                <div className="font-bold text-amber-300 text-xs">📍 Impossible Travel (1,180 km in 12m)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Delhi HQ to Pune cell tower impossible flight speed.</div>
              </button>

              <button
                onClick={() => handleSimulateAnomaly('VOICE_DRIFT')}
                className="w-full p-3 rounded-lg bg-[#050b18] hover:bg-amber-950/40 border border-[#142444] hover:border-amber-500/60 text-left transition-all"
              >
                <div className="font-bold text-amber-300 text-xs">🎙️ AI Synthetic Voiceprint Drift (24.8%)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Detects deepfake pitch quantization during dispatch.</div>
              </button>

              <button
                onClick={() => handleSimulateAnomaly('CLONED_KEY')}
                className="w-full p-3 rounded-lg bg-[#050b18] hover:bg-amber-950/40 border border-[#142444] hover:border-amber-500/60 text-left transition-all"
              >
                <div className="font-bold text-amber-300 text-xs">🔑 Cloned Smart-Card Nonce Replay</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Concurrent cryptographic handshakes on 2 devices.</div>
              </button>

              <button
                onClick={() => handleSimulateAnomaly('CADENCE_DRIFT')}
                className="w-full p-3 rounded-lg bg-[#050b18] hover:bg-amber-950/40 border border-[#142444] hover:border-amber-500/60 text-left transition-all"
              >
                <div className="font-bold text-amber-300 text-xs">⌨️ Keystroke Dynamics 32% Deviation</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Typing cadence flight-time anomaly outside nominal envelope.</div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#162747]">
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0e1c36] hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: BIOMETRIC LOG MODAL ─── */}
      {activeDetailModal === 'biometric_log' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#081023] border border-cyan-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                Zero-Knowledge Biometric Audit Log — {currentProfile.name}
              </h3>
              <button onClick={() => setActiveDetailModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="p-3 bg-[#050b18] rounded-lg border border-[#142340] leading-relaxed">
                All biometric vectors (3D facial landmarks, 24-band voice FFT harmonics, flight-time keystroke tensors) are converted into one-way cryptographic Zero-Knowledge Proofs (ZK-SNARKs). Plaintext biometrics are never transmitted over the network or stored in databases in compliance with Digital Personal Data Protection (DPDP) Act 2023.
              </div>
              <div className="p-3 bg-[#030712] rounded-lg border border-[#101c34] text-[11px] space-y-1">
                <div>ENROLLED CA: <span className="text-cyan-300">National Police PKI Root CA 2024</span></div>
                <div>KEY TYPE: <span className="text-cyan-300">Ed25519 Hardware TPM Enclave</span></div>
                <div>LEGAL COMPLIANCE: <span className="text-emerald-400 font-bold">Section 65B Bharatiya Sakshya Adhiniyam 2023</span></div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#162747]">
              <button
                onClick={() => setActiveDetailModal(null)}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow"
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

function OfficerAvatarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 64 64"
      fill="currentColor"
    >
      {/* Officer Cap */}
      <path
        d="M20 18 C20 12 44 12 44 18 L48 22 C48 24 16 24 16 22 Z"
        fill="#1e3a8a"
      />
      <rect x="22" y="16" width="20" height="3" fill="#f59e0b" />
      {/* Gold Badge on Cap */}
      <circle cx="32" cy="17.5" r="2" fill="#fbbf24" />
      {/* Face */}
      <circle cx="32" cy="30" r="11" fill="#fcd34d" />
      {/* Hair */}
      <path d="M22 26 C22 22 42 22 42 26 Z" fill="#1f2937" />
      {/* Eyes & Mustache */}
      <circle cx="28" cy="28" r="1.2" fill="#111827" />
      <circle cx="36" cy="28" r="1.2" fill="#111827" />
      <path d="M28 34 Q32 32 36 34 Q32 36 28 34" fill="#374151" />
      {/* Uniform Shoulders */}
      <path
        d="M14 52 C14 42 24 40 32 40 C40 40 50 42 50 52 Z"
        fill="#1e293b"
      />
      {/* Tie & Collar */}
      <polygon points="32,40 28,45 32,54 36,45" fill="#f59e0b" />
    </svg>
  );
}
