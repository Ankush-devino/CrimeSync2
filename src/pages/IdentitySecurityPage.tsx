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
  Share2,
  Skull,
  Eye,
  Siren,
  Terminal,
  Crosshair
} from 'lucide-react';
import { api } from '../services/api';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { logOfficerAction } from '../services/activityLogger';

interface IdentitySecurityPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export interface OfficerBaselinePattern {
  typicalWorkingHours: string;
  typicalWorkDays: string;
  authorizedSubnets: string[];
  registeredDevices: string[];
  primaryGeofence: string;
  averageTypingWpm: number;
  averageFlightTimeMs: number;
  averageDwellTimeMs: number;
  usualCaseCategories: string[];
  dailyAvgQueryCount: number;
  baselineTrustRating: number;
}

export interface PatternDissimilarityAnalysis {
  isCompromised: boolean;
  threatVerdict: 'NORMAL' | 'SUSPICIOUS_DRIFT' | 'HACK_DETECTED_UNAUTHORIZED_ACTOR';
  overallDissimilarityScore: number;
  timeAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  deviceAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  geoAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  cadenceAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  actionAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  intruderIndicators: string[];
  recommendedAction: string;
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
  baselinePattern?: OfficerBaselinePattern;
  currentDissimilarity?: PatternDissimilarityAnalysis;
}

export interface IdentityTrailEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  officerName: string;
  badgeNumber: string;
  action: string;
  category: 'BIOMETRIC_PASS' | 'IMPOSSIBLE_TRAVEL' | 'FAILED_CHALLENGE' | 'SESSION_HIJACK' | 'QUARANTINE_ENFORCED' | 'CREDENTIAL_REFRESH' | 'HACK_PATTERN_ALERT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'VERIFIED' | 'FLAGGED' | 'BLOCKED' | 'QUARANTINED' | 'HACKED_ALERT';
  caseId: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  confidenceScore: number;
  patternDissimilarityScore: number;
  isHackedAnomaly: boolean;
  hashSha256: string;
  details: string;
  dissimilarityBreakdown?: {
    timeShift: string;
    deviceDiscrepancy: string;
    geoDrift: string;
    keystrokeDeviation: string;
    unauthorizedActions: string;
  };
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
  anomalyType: 'VOICE_DRIFT' | 'IMPOSSIBLE_TRAVEL' | 'KEYBOARD_CADENCE' | 'UNAUTHORIZED_DEVICE' | 'CLONED_SESSION' | 'PATTERN_DISSIMILARITY_HACK';
  deviceInfo: string;
  location: string;
  status: 'ACTIVE_ALERT' | 'QUARANTINED' | 'INVESTIGATING';
  confidenceMatch: number;
  dissimilarityScore: number;
  isAccountHijacked: boolean;
}

export const IdentitySecurityPage: React.FC<IdentitySecurityPageProps> = ({
  onSelectAction,
  onNavigateTab
}) => {
  const { selectedCaseId, cases, setSelectedCaseId } = useCaseContext();
  const { currentUser } = useAuth();


  // Backend Data State
  const [profiles, setProfiles] = useState<OfficerBiometricProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('insp_r_sharma');
  const [trailEvents, setTrailEvents] = useState<IdentityTrailEvent[]>([]);
  const [watchlist, setWatchlist] = useState<DoppelgangerWatchlistItem[]>([]);
  const [hackedAlerts, setHackedAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    verifiedIdentities: 16,
    totalActiveAccounts: 18,
    doppelgangersFlagged: 1,
    hackedAccountsDetected: 1,
    behaviorAnomalies: 2,
    avgTrustScore: 92,
    mfaEnrollment: '17 / 18',
    hardwareKeyAdoptionRate: '89%',
    staleCredentials: 1,
    quarantinedSessions: 1
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
  const [verifyingOfficerId, setVerifyingOfficerId] = useState<string>('insp_r_sharma');

  // Quarantine Modal State
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState<boolean>(false);
  const [targetQuarantineProfile, setTargetQuarantineProfile] = useState<OfficerBiometricProfile | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>('Account hack pattern dissimilarity detected: unauthorized actor dumping database');
  const [isQuarantining, setIsQuarantining] = useState<boolean>(false);

  // Anomaly Simulator State
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null);
  const [selectedHackedAlertModal, setSelectedHackedAlertModal] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dismissBanner, setDismissBanner] = useState<boolean>(false);

  // Fetch all identity data
  const loadIdentityData = useCallback(async () => {
    setLoading(true);
    try {
      const caseFilter = selectedCaseId !== 'ALL' ? selectedCaseId : undefined;
      const [profRes, trailRes, watchRes, statRes, hackRes] = await Promise.all([
        api.identity.getProfiles(caseFilter),
        api.identity.getIdentityTrail({ caseId: caseFilter }),
        api.identity.getWatchlist(caseFilter),
        api.identity.getStats(caseFilter),
        api.identity.getHackedAlerts()
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
      if (hackRes && hackRes.alerts) {
        setHackedAlerts(hackRes.alerts);
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
      id: 'insp_r_sharma',
      name: 'Insp. R. Sharma',
      rank: 'Inspector',
      department: 'Anti-Hawala Unit',
      badgeNumber: 'DL-POL-4192',
      enrolledDate: '22 Nov 2023',
      status: 'flagged',
      matchConfidence: 61.4,
      faceGeometryMatch: false,
      voiceprintMatch: false,
      typingCadenceMatch: true,
      deviceFingerprintMatch: false,
      badgeCertMatch: true,
      faceConfidence: 61.0,
      deviceInfo: 'Unrecognized iPhone 14 Pro (Pune IP)',
      locationInfo: 'Pune - Unknown Cell Tower',
      lastActive: '4m ago',
      ipAddress: '152.57.19.202',
      assignedCaseId: 'CASE-2026-004'
    };
  }, [profiles, selectedProfileId]);

  // Active Compromise Detected Flag
  const activeHackedAlert = useMemo(() => {
    return hackedAlerts.find((h) => h.status === 'ACTIVE_ALERT') || null;
  }, [hackedAlerts]);

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
      api.identity.verify(targetId).then((res) => {
        if (res) {
          logOfficerAction({
            action: 'Executed Zero-Knowledge Biometric Identity Challenge',
            module: 'Identity Security',
            details: `Validated biometric telemetry for ${res.officerName} (${res.badgeNumber}). Confidence: ${res.confidence}% | Pattern Dissimilarity: ${res.patternDissimilarityScore}%`,
            category: 'AUTH'
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

  // Execute Quarantine Kill Switch
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
          category: 'AUTH'
        });
        triggerToast(`🛑 Session Terminated & Quarantined for ${targetQuarantineProfile.name}`);
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
      const res = await api.identity.escalate(profileId, 'Account hacked: Severe pattern dissimilarity & unauthorized database dump');
      if (res) {
        logOfficerAction({
          action: 'Escalated Doppelganger Anomaly to CSOC & CERT-In',
          module: 'Identity Security',
          details: `Dispatched incident ticket #${res.escalationTicket} for ${res.targetOfficer} to Cyber Security Operations Center.`,
          category: 'AUTH'
        });
        triggerToast(`🚨 Escalated to CSOC & CERT-In: Ticket #${res.escalationTicket}`);
        loadIdentityData();
      }
    } catch (err: any) {
      alert(`Escalation Error: ${err.message}`);
    }
  };

  // Ingest Simulated Anomaly (Hack / Dissimilarity)
  const handleSimulateAnomaly = (type: 'HACK_ACCOUNT' | 'IMPOSSIBLE_TRAVEL' | 'VOICE_DRIFT' | 'CADENCE_DRIFT') => {
    let actionText = '';
    let category: any = 'HACK_PATTERN_ALERT';
    let severity: any = 'CRITICAL';
    let dissimilarityScore = 88.6;
    let detailsText = '';

    if (type === 'HACK_ACCOUNT') {
      actionText = '🚨 CRITICAL ACCOUNT COMPROMISE: Pattern Dissimilarity 88.6% — Unauthorized Actor Active!';
      category = 'HACK_PATTERN_ALERT';
      dissimilarityScore = 88.6;
      detailsText = 'Severe baseline pattern breach: 03:14 AM off-hours login from Pune IP, 135 WPM automated burst cadence, and bulk encrypted database dump query. Suspect is actively operating the hacked account.';
    } else if (type === 'IMPOSSIBLE_TRAVEL') {
      actionText = '🚨 IMPOSSIBLE TRAVEL HACK: Pattern Dissimilarity 92.4% — Delhi to Pune in 12m (5,900 km/h)';
      category = 'IMPOSSIBLE_TRAVEL';
      dissimilarityScore = 92.4;
      detailsText = 'Simultaneous session active from Pune cell tower while primary terminal authenticated in Delhi HQ.';
    } else if (type === 'VOICE_DRIFT') {
      actionText = 'Voiceprint Spectral Harmonics Drift: 24.8% Generative AI Voice Anomaly';
      category = 'FAILED_CHALLENGE';
      severity = 'HIGH';
      dissimilarityScore = 48.0;
      detailsText = 'Tactical audio challenge revealed pitch quantization consistent with real-time neural voice conversion software.';
    } else {
      actionText = 'Keystroke Dwell-Time & Flight Dynamics Anomaly: 32% Pattern Shift';
      category = 'FAILED_CHALLENGE';
      severity = 'MEDIUM';
      dissimilarityScore = 32.0;
      detailsText = 'Keystroke timing rhythm deviates substantially from 90-day officer behavioral baseline envelope.';
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
      status: dissimilarityScore > 70 ? 'HACKED_ALERT' : 'FLAGGED',
      caseId: selectedCaseId !== 'ALL' ? selectedCaseId : 'CASE-2026-004',
      deviceInfo: 'Unregistered Terminal (Intruder IP: 152.57.19.202)',
      ipAddress: '152.57.19.202',
      location: 'Pune Cell Tower Sector 12',
      confidenceScore: Math.max(10, 100 - dissimilarityScore),
      patternDissimilarityScore: dissimilarityScore,
      isHackedAnomaly: dissimilarityScore > 70,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      details: detailsText,
      dissimilarityBreakdown: {
        timeShift: '03:14 AM Off-Hours Anomaly (+85%)',
        deviceDiscrepancy: 'Non-Gov iPhone 14 Pro (+95%)',
        geoDrift: 'Pune Cell Tower (+99%)',
        keystrokeDeviation: '135 WPM Automated Script (+90%)',
        unauthorizedActions: 'Bulk Evidence & Credential Scraping (+96%)'
      }
    };

    setTrailEvents((prev) => [newEvent, ...prev]);
    setDismissBanner(false);
    logOfficerAction({
      action: `Identity Threat: ${actionText}`,
      module: 'Identity Security',
      details: detailsText,
      caseId: selectedCaseId,
      category: 'AUTH'
    });

    setIsSimulateModalOpen(false);
    triggerToast(`🚨 Injected Threat: ${actionText}`);
  };

  // Copy Hash
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export Trail to CSV
  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Officer Name', 'Badge Number', 'Action', 'Category', 'Severity', 'Status', 'Case ID', 'Device', 'IP Address', 'Location', 'Trust Score', 'Dissimilarity %', 'Is Hacked', 'SHA-256 Hash', 'Details'];
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
      e.patternDissimilarityScore || 0,
      e.isHackedAnomaly ? 'YES' : 'NO',
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

      {/* ─── 🚨 REAL-TIME COMPROMISE / HACK ALERT BANNER ─── */}
      {activeHackedAlert && !dismissBanner && (
        <div className="rounded-xl bg-gradient-to-r from-red-950/90 via-rose-950/80 to-[#180509] border-2 border-red-500 p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-900/90 border border-red-400 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
              <Siren className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-900 text-white font-black text-[10px] tracking-wider uppercase border border-red-400 animate-pulse">
                  CRITICAL: ACCOUNT COMPROMISED
                </span>
                <span className="text-red-300 text-xs font-mono font-bold">
                  Dissimilarity: {activeHackedAlert.dissimilarityScore}%
                </span>
              </div>
              <h2 className="text-sm font-black text-white mt-1">
                Unauthorized Actor Detected on {activeHackedAlert.officerName} ({activeHackedAlert.badgeNumber})!
              </h2>
              <p className="text-xs text-red-200/90 mt-0.5">
                {activeHackedAlert.flagReason}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const target = profiles.find((p) => p.id === activeHackedAlert.profileId) || currentProfile;
                handleOpenQuarantine(target);
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.7)] transition-all"
            >
              <Ban className="w-4 h-4" />
              <span>EMERGENCY KILL SWITCH</span>
            </button>

            <button
              onClick={() => handleEscalateWatchlist(activeHackedAlert.profileId)}
              className="px-3.5 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-400 text-red-200 font-bold text-xs flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>CSOC S.O.S.</span>
            </button>

            <button
              onClick={() => setDismissBanner(true)}
              className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Dismiss Alert Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                IDENTITY SECURITY &amp; PATTERN DISSIMILARITY TRACER
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                BEHAVIORAL ZERO-TRUST
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Officer baseline pattern modeling, continuous dissimilarity scoring, and compromised session kill switch
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
            title="Simulate Account Hack / Pattern Mismatch"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Hack</span>
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
              {stats.verifiedIdentities ?? 16}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              of {stats.totalActiveAccounts ?? 18} assigned investigators
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: HACKED / COMPROMISED SESSIONS */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-red-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              HACKED / HIJACKED ALERTS
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1 flex items-baseline gap-2">
              <span>{stats.hackedAccountsDetected ?? 1}</span>
              {(stats.hackedAccountsDetected ?? 1) > 0 && (
                <span className="text-xs font-bold text-red-400 font-mono animate-pulse">CRITICAL</span>
              )}
            </div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-1">
              <span>🚨</span> Pattern Dissimilarity &gt; 85%
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <Skull className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: BEHAVIOR ANOMALIES */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              BEHAVIOR &amp; CADENCE DRIFT
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {stats.behaviorAnomalies ?? 2}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              keystroke, voiceprint &amp; geofence variations
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
              AVG ZERO-TRUST RATING
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats.avgTrustScore ?? 92}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑</span> FIDO2 Hardware Adoption: {stats.hardwareKeyAdoptionRate || '89%'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: OFFICER BIOMETRIC & BEHAVIORAL PATTERN PROFILES ─── */}
      <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Left: Officer Profile Selection List (Spans 4 cols on lg) */}
            <div className="lg:col-span-4 rounded-xl bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                  <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Monitored Officer Sessions ({profiles.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Pattern AI Sync</span>
                </div>

                <div className="space-y-2 pt-3 text-xs overflow-y-auto max-h-[460px] pr-1">
                  {profiles.map((prof) => {
                    const isSelected = prof.id === currentProfile.id;
                    const isCompromised = prof.currentDissimilarity?.isCompromised;
                    return (
                      <div
                        key={prof.id}
                        onClick={() => setSelectedProfileId(prof.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? isCompromised
                              ? 'bg-rose-950/50 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                              : 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                            : 'bg-[#050b18] border-[#101c34] hover:bg-slate-800/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden shrink-0 ${isCompromised ? 'bg-red-950 border-red-500 text-red-300' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                              <OfficerAvatarIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                                <span>{prof.name}</span>
                                {isCompromised ? (
                                  <span className="px-1 py-0.2 rounded bg-red-900 text-red-200 text-[8px] font-black animate-pulse">HACKED</span>
                                ) : (
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
                              isCompromised
                                ? 'bg-rose-950 border border-rose-500 text-rose-300'
                                : prof.status === 'live'
                                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                                : 'bg-amber-950 border border-amber-500 text-amber-300'
                            }`}
                          >
                            {isCompromised ? 'INTRUSION' : prof.status}
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#0f1b33] flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[150px]">📍 {prof.locationInfo}</span>
                          <span className={`font-mono font-bold ${isCompromised ? 'text-red-400' : 'text-emerald-400'}`}>
                            Dissimilarity: {prof.currentDissimilarity?.overallDissimilarityScore || 0}%
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
                      Biometric &amp; Pattern Profile — {currentProfile.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-semibold flex items-center gap-1 border ${
                      currentProfile.currentDissimilarity?.isCompromised
                        ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                        : currentProfile.status === 'live'
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                        : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${currentProfile.currentDissimilarity?.isCompromised ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                      {currentProfile.currentDissimilarity?.isCompromised ? 'HACK DETECTED' : 'LIVE SESSION'}
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
                        <span>Kill Switch</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Biometric Analysis Visual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
                  {/* Radar Circle (5 cols on md) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-pulse"></div>
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="84" fill="none" stroke="#0a1d33" strokeWidth="4" />
                        <circle
                          cx="96"
                          cy="96"
                          r="84"
                          fill="none"
                          stroke={currentProfile.currentDissimilarity?.isCompromised ? '#ef4444' : currentProfile.matchConfidence > 75 ? '#10b981' : '#f59e0b'}
                          strokeWidth="4.5"
                          strokeDasharray="528"
                          strokeDashoffset={528 - (528 * currentProfile.matchConfidence) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>

                      <div className="absolute -top-1 px-2.5 py-0.5 rounded-full bg-[#070e1f] border border-cyan-400/80 text-cyan-300 text-[8.5px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        <span>{currentProfile.currentDissimilarity?.isCompromised ? 'INTRUSION DETECTED' : 'REGISTERED PROFILE'}</span>
                      </div>

                      <div className="w-24 h-24 rounded-full bg-[#050b18] border-2 border-cyan-400 flex items-center justify-center overflow-hidden relative">
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
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          MATCH CONFIDENCE
                        </div>
                        <div className="text-[10px] font-bold font-mono text-red-400">
                          Dissimilarity: {currentProfile.currentDissimilarity?.overallDissimilarityScore || 0}%
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-cyan-400 mt-0.5 flex items-baseline gap-2">
                        <span className={currentProfile.currentDissimilarity?.isCompromised ? 'text-red-400' : 'text-cyan-400'}>
                          {currentProfile.matchConfidence}%
                        </span>
                        <span className="text-xs font-normal text-slate-400 font-sans">
                          {currentProfile.currentDissimilarity?.isCompromised
                            ? '🚨 Severe behavioral pattern dissimilarity'
                            : 'Within nominal zero-trust envelope'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#0c1830] rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            currentProfile.currentDissimilarity?.isCompromised
                              ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                              : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                          }`}
                          style={{ width: `${currentProfile.matchConfidence}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 5 Biometric Factor Rows */}
                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Face Geometry &amp; 3D Topology</span>
                        </span>
                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.faceGeometryMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                          {currentProfile.faceGeometryMatch ? '✓ Valid' : '✗ Mismatch (61.0%)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-purple-400" />
                          <span>Voiceprint Acoustic Resonance</span>
                        </span>
                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.voiceprintMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {currentProfile.voiceprintMatch ? '✓ Valid' : '⚠ Acoustic Drift (22%)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-blue-400" />
                          <span>Keystroke Cadence Dynamics</span>
                        </span>
                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.typingCadenceMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {currentProfile.typingCadenceMatch ? '✓ Nominal' : '⚠ Cadence Variance'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[#101b33]">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Device TPM 2.0 &amp; Geolocation</span>
                        </span>
                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${currentProfile.deviceFingerprintMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                          {currentProfile.deviceFingerprintMatch ? '✓ Verified' : '✗ Unenrolled Device'}
                        </span>
                      </div>

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
                  <span className="text-slate-400 block text-[10px]">CURRENT HARDWARE</span>
                  <span className="text-slate-200 font-semibold font-mono">{currentProfile.deviceInfo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GEO TELEMETRY</span>
                  <span className="text-slate-200 font-semibold">{currentProfile.locationInfo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SESSION IP</span>
                  <span className="text-cyan-300 font-mono font-semibold">{currentProfile.ipAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── OFFICER BASELINE PATTERN vs OBSERVED TELEMETRY COMPARISON MATRIX ─── */}
          {currentProfile.baselinePattern && (
            <div className="rounded-xl bg-[#081023] border border-[#142342] p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#142342]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Officer Baseline Operational Pattern vs Live Telemetry ({currentProfile.name})
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold border ${
                  currentProfile.currentDissimilarity?.isCompromised
                    ? 'bg-rose-950 text-rose-300 border-rose-500'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                }`}>
                  Verdict: {currentProfile.currentDissimilarity?.threatVerdict?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                {/* 1. Working Hours */}
                <div className="p-3 bg-[#050b18] rounded-lg border border-[#101c34] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Working Hours</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    <span className="text-slate-500 block text-[9.5px]">BASELINE</span>
                    {currentProfile.baselinePattern.typicalWorkingHours}
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-slate-500 block text-[9.5px]">OBSERVED</span>
                    <span className={currentProfile.currentDissimilarity?.timeAnomaly.isAbnormal ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentProfile.currentDissimilarity?.timeAnomaly.observed}
                    </span>
                  </div>
                </div>

                {/* 2. Registered Devices */}
                <div className="p-3 bg-[#050b18] rounded-lg border border-[#101c34] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-blue-400" />
                    <span>Device Posture</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">BASELINE</span>
                    {currentProfile.baselinePattern.registeredDevices[0] || 'Gov Terminal'}
                  </div>
                  <div className="text-[11px] font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">OBSERVED</span>
                    <span className={currentProfile.currentDissimilarity?.deviceAnomaly.isAbnormal ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentProfile.currentDissimilarity?.deviceAnomaly.observed}
                    </span>
                  </div>
                </div>

                {/* 3. Primary Geofence */}
                <div className="p-3 bg-[#050b18] rounded-lg border border-[#101c34] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Geofence Zone</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">BASELINE</span>
                    {currentProfile.baselinePattern.primaryGeofence}
                  </div>
                  <div className="text-[11px] font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">OBSERVED</span>
                    <span className={currentProfile.currentDissimilarity?.geoAnomaly.isAbnormal ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentProfile.currentDissimilarity?.geoAnomaly.observed}
                    </span>
                  </div>
                </div>

                {/* 4. Typing Cadence */}
                <div className="p-3 bg-[#050b18] rounded-lg border border-[#101c34] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Fingerprint className="w-3 h-3 text-purple-400" />
                    <span>Keystroke Speed</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    <span className="text-slate-500 block text-[9.5px]">BASELINE</span>
                    {currentProfile.baselinePattern.averageTypingWpm} WPM ({currentProfile.baselinePattern.averageFlightTimeMs}ms)
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-slate-500 block text-[9.5px]">OBSERVED</span>
                    <span className={currentProfile.currentDissimilarity?.cadenceAnomaly.isAbnormal ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentProfile.currentDissimilarity?.cadenceAnomaly.observed}
                    </span>
                  </div>
                </div>

                {/* 5. Action Velocity */}
                <div className="p-3 bg-[#050b18] rounded-lg border border-[#101c34] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>Operations Velocity</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">BASELINE</span>
                    {currentProfile.baselinePattern.dailyAvgQueryCount} queries/day
                  </div>
                  <div className="text-[11px] font-mono truncate">
                    <span className="text-slate-500 block text-[9.5px]">OBSERVED</span>
                    <span className={currentProfile.currentDissimilarity?.actionAnomaly.isAbnormal ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {currentProfile.currentDissimilarity?.actionAnomaly.observed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Intruder Indicators Box */}
              {currentProfile.currentDissimilarity?.intruderIndicators && currentProfile.currentDissimilarity.intruderIndicators.length > 0 && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Intruder Anomaly Indicators Flagged:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-red-200/90 space-y-0.5 pl-1">
                    {currentProfile.currentDissimilarity.intruderIndicators.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

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

      {/* ─── MODAL 2: QUARANTINE / KILL SWITCH CONFIRMATION ─── */}
      {isQuarantineModalOpen && targetQuarantineProfile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#081023] border border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Ban className="w-4 h-4 text-rose-400" />
                Emergency Session Kill Switch &amp; Quarantine
              </h3>
              <button onClick={() => setIsQuarantineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-200">
                ⚠️ You are about to forcibly terminate and revoke the session token for <strong>{targetQuarantineProfile.name}</strong> ({targetQuarantineProfile.badgeNumber}). This will invalidate all active cryptographic keypairs, revoke OAuth2 tokens, and disconnect the intruder.
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Statutory Reason for Kill Switch (Logged to Blockchain Custody Trail)
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
                <span>{isQuarantining ? 'Enforcing Kill Switch...' : 'Execute Emergency Kill Switch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SIMULATE ACCOUNT HACK / DISSIMILARITY ─── */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                Simulate Account Hack &amp; Pattern Dissimilarity
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
                onClick={() => handleSimulateAnomaly('HACK_ACCOUNT')}
                className="w-full p-3 rounded-lg bg-[#180509] hover:bg-red-950/60 border border-red-500/60 text-left transition-all"
              >
                <div className="font-bold text-red-300 text-xs flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-red-400" />
                  <span>🚨 Account Hack: Severe Dissimilarity (88.6%)</span>
                </div>
                <div className="text-[11px] text-red-200/80 mt-0.5">Off-hours 03:14 AM login, 135 WPM automated cadence burst, bulk DB dump.</div>
              </button>

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
