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
  X,
  Play,
  Camera,
  Lock,
  Flame,
  AlertOctagon,
  Sparkles,
  Download,
  Search,
  RefreshCw,
  Copy,
  Check,
  Filter,
  FileSpreadsheet,
  Zap,
  Terminal,
  FileText,
  TrendingUp,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { logOfficerAction } from '../services/activityLogger';
import { useCaseContext } from '../context/CaseContext';

interface IdentitySecurityPageProps {
  onSelectAction?: (action: string) => void;
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
  caseId?: string;
  lastActive: string;
  riskCategory: 'LOW' | 'ELEVATED' | 'CRITICAL_DOPPELGANGER';
  activeSessionsCount: number;
}

export interface IdentityTrailEvent {
  id: string;
  profile_id: string;
  identity_name: string;
  badge_or_alias: string;
  event_type:
    | 'BIOMETRIC_VERIFY'
    | 'SESSION_LOGIN'
    | 'IMPOSSIBLE_TRAVEL'
    | 'PRIVILEGE_ELEVATION'
    | 'MFA_CHALLENGE'
    | 'QUARANTINE_LOCK'
    | 'DEVICE_TPM_CHECK'
    | 'EVIDENCE_VAULT_ACCESS'
    | 'TOKEN_RENEWAL';
  severity: 'INFO' | 'WARNING' | 'CRITICAL_ANOMALY';
  status: 'SUCCESS' | 'BLOCKED' | 'CHALLENGED' | 'FLAGGED';
  ip_address: string;
  location: string;
  device: string;
  confidence_score: number;
  timestamp: string;
  details: string;
  session_token_hash: string;
  court_admissible_hash: string;
  case_id?: string;
}

export const IdentitySecurityPage: React.FC<IdentitySecurityPageProps> = ({ onSelectAction }) => {
  const { selectedCaseId } = useCaseContext();

  // State for data
  const [profiles, setProfiles] = useState<OfficerBiometricProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('acp_raj_verma');
  const [trailEvents, setTrailEvents] = useState<IdentityTrailEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab & Filter State
  const [activeTab, setActiveTab] = useState<'trail' | 'biometrics' | 'zerotrust' | 'watchlist'>('trail');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Modal State
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState<boolean>(false);
  const [targetQuarantineProfile, setTargetQuarantineProfile] = useState<OfficerBiometricProfile | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>(
    'Doppelgänger mismatch & impossible travel anomaly detected across unauthorized endpoints.'
  );
  const [isExecutingQuarantine, setIsExecutingQuarantine] = useState<boolean>(false);
  const [quarantineSuccess, setQuarantineSuccess] = useState<any | null>(null);

  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [targetMfaProfile, setTargetMfaProfile] = useState<OfficerBiometricProfile | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<any | null>(null);

  // Load Data
  const loadIdentityData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, trailsRes, statsRes] = await Promise.all([
        api.identity.getProfiles(),
        api.identity.getTrailEvents(),
        api.identity.getStats(),
      ]);

      if (profilesRes && Array.isArray(profilesRes)) {
        setProfiles(profilesRes);
        if (!selectedProfileId && profilesRes.length > 0) {
          setSelectedProfileId(profilesRes[0].id);
        }
      }
      if (trailsRes && Array.isArray(trailsRes)) {
        setTrailEvents(trailsRes);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Failed to load identity security data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProfileId]);

  useEffect(() => {
    loadIdentityData();
  }, [loadIdentityData]);

  // Current Selected Profile
  const currentProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null;
  }, [profiles, selectedProfileId]);

  // Filtered Trails
  const filteredTrails = useMemo(() => {
    return trailEvents.filter((item) => {
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (eventTypeFilter !== 'ALL' && item.event_type !== eventTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.identity_name.toLowerCase().includes(q) ||
          item.badge_or_alias.toLowerCase().includes(q) ||
          item.event_type.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.ip_address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trailEvents, severityFilter, eventTypeFilter, searchQuery]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Start Live Biometric Verification Scan
  const handleStartVerificationScan = async (profileId?: string) => {
    const idToVerify = profileId || selectedProfileId;
    setIsVerifyingModalOpen(true);
    setScanStep(1);
    setScanResult(null);

    setTimeout(() => setScanStep(2), 900);
    setTimeout(() => setScanStep(3), 1800);
    setTimeout(async () => {
      setScanStep(4);
      try {
        const res = await api.identity.verify(idToVerify);
        if (res) {
          setScanResult(res);
          loadIdentityData();
          logOfficerAction({
            action: `Executed Biometric Zero-Trust Identity Verification for ${res.officerName}`,
            module: 'Identity Security',
            caseId: selectedCaseId || 'CASE-2026-001',
            details: `Confidence: ${res.confidence}% | Status: ${res.verified ? 'VERIFIED' : 'FLAGGED_MISMATCH'} | Ref: ${res.trailEventId}`,
            category: 'AUTH',
          });
          onSelectAction?.(`Verified Biometric Profile: ${res.officerName} (${res.confidence}%)`);
        }
      } catch (err: any) {
        alert(`Verification failed: ${err.message}`);
      }
    }, 2700);
  };

  // Execute Quarantine
  const handleExecuteQuarantine = async () => {
    if (!targetQuarantineProfile) return;
    setIsExecutingQuarantine(true);
    try {
      const res = await api.identity.quarantine({
        profileId: targetQuarantineProfile.id,
        reason: quarantineReason,
        officer_name: 'ACP Raj Verma',
      });
      if (res) {
        setQuarantineSuccess(res);
        loadIdentityData();
        logOfficerAction({
          action: `Enforced Zero-Trust Quarantine on ${targetQuarantineProfile.name}`,
          module: 'Identity Security',
          caseId: selectedCaseId || 'CASE-2026-001',
          details: `Account Quarantined & active sessions revoked. Ticket: ${res.ticketId}. Reason: ${quarantineReason}`,
          category: 'AUTH',
        });
        onSelectAction?.(`Quarantined Identity: ${targetQuarantineProfile.name} (${res.ticketId})`);
      }
    } catch (err: any) {
      alert(`Quarantine execution error: ${err.message}`);
    } finally {
      setIsExecutingQuarantine(false);
    }
  };

  // Revoke Session
  const handleRevokeSession = async (profile: OfficerBiometricProfile) => {
    try {
      const res = await api.identity.revokeSession({ profileId: profile.id });
      if (res) {
        loadIdentityData();
        logOfficerAction({
          action: `Revoked Active Kerberos Session Tokens for ${profile.name}`,
          module: 'Identity Security',
          caseId: selectedCaseId || 'CASE-2026-001',
          details: `Session token purged from Redis cache. Forced re-auth triggered.`,
          category: 'AUTH',
        });
        alert(`Session token for ${profile.name} revoked successfully.`);
      }
    } catch (err: any) {
      alert(`Session revocation error: ${err.message}`);
    }
  };

  // Dispatch Step-up MFA
  const handleDispatchMfa = async (profile: OfficerBiometricProfile) => {
    try {
      const res = await api.identity.challengeMfa({ profileId: profile.id });
      if (res) {
        setMfaSuccess(res);
        setIsMfaModalOpen(true);
        loadIdentityData();
        logOfficerAction({
          action: `Dispatched Step-Up FIDO2 Hardware Challenge to ${profile.name}`,
          module: 'Identity Security',
          caseId: selectedCaseId || 'CASE-2026-001',
          details: `Challenge ID: ${res.challengeId} | Hardware Security Module Dispatched`,
          category: 'AUTH',
        });
      }
    } catch (err: any) {
      alert(`MFA dispatch error: ${err.message}`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Event ID',
      'Identity Name',
      'Badge / Alias',
      'Event Type',
      'Severity',
      'Status',
      'Confidence %',
      'IP Address',
      'Location',
      'Device',
      'Timestamp',
      'SHA256 Hash',
      'Details',
    ];
    const rows = filteredTrails.map((t) => [
      t.id,
      `"${t.identity_name}"`,
      t.badge_or_alias,
      t.event_type,
      t.severity,
      t.status,
      t.confidence_score,
      t.ip_address,
      `"${t.location}"`,
      `"${t.device}"`,
      t.timestamp,
      t.court_admissible_hash,
      `"${t.details}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRIMESYNC_IDENTITY_AUDIT_TRAIL_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <UserCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white uppercase">
                IDENTITY SECURITY &amp; AUDIT TRAIL
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-950 text-sky-300 border border-sky-500/40">
                ZERO-TRUST / FIPS-140-3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous multi-factor behavioral biometrics, impossible travel doppelgänger detection, and real-time identity audit telemetry
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Verify Button */}
          <button
            onClick={() => handleStartVerificationScan()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verify Selected Identity</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-emerald-500/60 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Trail CSV</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadIdentityData}
            className="p-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white hover:border-blue-500 transition-all shadow-sm"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Top 4 Metric KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Verified Active Identities */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              ENROLLED IDENTITIES
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {stats?.activeLiveIdentities?.toLocaleString() || '1,842'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              Avg Trust Score: <span className="text-emerald-400 font-bold">{stats?.avgTrustScore || 94.2}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Doppelgängers Flagged */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-red-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              DOPPELGÄNGERS FLAGGED
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">
              {stats?.flaggedDoppelgangers || 2}
            </div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Geo-drift / impossible travel</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Zero-Trust Quarantined */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              QUARANTINED SESSIONS
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {stats?.quarantinedAccounts || 1}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              <span>Tokens Revoked &amp; Locked</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Audit Trail Telemetry Events */}
        <div className="p-3.5 rounded-xl bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-blue-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              IDENTITY TRAIL LOGS
            </div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">
              {stats?.totalTrailEventsCount?.toLocaleString() || '8,426'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              MFA Adoption: <span className="text-blue-400 font-bold">{stats?.hardwareKeyAdoptionRate || '92.8%'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation Bar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#142342] pb-2">
        <div className="flex items-center gap-1.5 bg-[#081023] p-1 rounded-xl border border-[#142342]">
          <button
            onClick={() => setActiveTab('trail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'trail'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Identity Audit Trail ({filteredTrails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('biometrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'biometrics'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biometric Telemetry &amp; Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('zerotrust')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'zerotrust'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero-Trust Access &amp; Quarantine</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'watchlist'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Doppelgänger &amp; Geo-Drift Watchlist</span>
          </button>
        </div>

        {/* Profile Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Active Officer / Suspect:</span>
          <div className="relative">
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] hover:border-blue-500 text-xs font-semibold text-sky-300 font-mono focus:outline-none appearance-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#091122] text-slate-200">
                  {p.name} ({p.badgeNumber}) — {p.status.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── TAB 1: IDENTITY AUDIT TRAIL ─── */}
      {activeTab === 'trail' && (
        <div className="space-y-3">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3 shadow-md">
            <div className="flex flex-1 items-center gap-2 bg-[#0c162b] border border-[#1e335a] rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by name, badge, event type, IP, location, or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL_ANOMALY">Critical Anomalies</option>
                <option value="WARNING">Warnings</option>
                <option value="INFO">Info / Normal</option>
              </select>

              {/* Event Type Filter */}
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Event Types</option>
                <option value="BIOMETRIC_VERIFY">Biometric Verification</option>
                <option value="IMPOSSIBLE_TRAVEL">Impossible Travel</option>
                <option value="PRIVILEGE_ELEVATION">Privilege Elevation</option>
                <option value="QUARANTINE_LOCK">Quarantine Lock</option>
                <option value="DEVICE_TPM_CHECK">Device TPM Check</option>
                <option value="EVIDENCE_VAULT_ACCESS">Evidence Vault Access</option>
              </select>
            </div>
          </div>

          {/* Audit Trail Event Cards */}
          <div className="space-y-2.5">
            {filteredTrails.length === 0 ? (
              <div className="p-8 text-center bg-[#081023] border border-[#142342] rounded-xl text-slate-400 text-xs">
                No identity audit events match your active filters.
              </div>
            ) : (
              filteredTrails.map((event) => {
                const isCritical = event.severity === 'CRITICAL_ANOMALY';
                const isWarning = event.severity === 'WARNING';

                return (
                  <div
                    key={event.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                        : 'bg-[#081023] border-[#142342] hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-[#142342]/60 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCritical
                              ? 'bg-red-950 border border-red-500/60 text-red-400'
                              : isWarning
                              ? 'bg-amber-950 border border-amber-500/60 text-amber-400'
                              : 'bg-blue-950 border border-blue-500/60 text-blue-400'
                          }`}
                        >
                          {isCritical ? (
                            <AlertOctagon className="w-4 h-4 animate-bounce" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{event.identity_name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#0c162b] text-slate-300 border border-slate-700">
                              {event.badge_or_alias}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded text-[9.5px] font-extrabold ${
                                event.status === 'SUCCESS'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : event.status === 'FLAGGED' || event.status === 'BLOCKED'
                                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-blue-400 font-semibold">{event.event_type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {event.location}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{event.ip_address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-200">
                            Confidence: <span className={event.confidence_score > 75 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{event.confidence_score}%</span>
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-400 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>

                        {isCritical && (
                          <button
                            onClick={() => {
                              const prof = profiles.find((p) => p.id === event.profile_id);
                              if (prof) {
                                setTargetQuarantineProfile(prof);
                                setIsQuarantineModalOpen(true);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Quarantine</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{event.details}</p>

                    {/* Forensic Court Hash Seal */}
                    <div className="mt-2.5 pt-2 border-t border-[#142342]/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 uppercase font-bold">Sec 65B Hash:</span>
                        <span className="text-slate-300 bg-[#060b17] px-2 py-0.5 rounded border border-[#142342] truncate max-w-[280px] sm:max-w-[400px]">
                          {event.court_admissible_hash}
                        </span>
                        <button
                          onClick={() => handleCopy(event.court_admissible_hash)}
                          className="text-slate-400 hover:text-white p-0.5 rounded"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedHash === event.court_admissible_hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Device:</span>
                        <span className="text-slate-300">{event.device}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: BIOMETRIC TELEMETRY & VERIFICATION ─── */}
      {activeTab === 'biometrics' && currentProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Biometric Radar & Match Breakdown (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#081023] border border-[#142342] rounded-xl p-4 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#142342] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 font-bold text-lg">
                    {currentProfile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{currentProfile.name}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-500/40">
                        {currentProfile.badgeNumber}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">{currentProfile.rank} • {currentProfile.department}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {currentProfile.matchConfidence}%
                  </div>
                  <div className="text-[10.5px] font-semibold text-slate-400 uppercase">
                    BIOMETRIC CONFIDENCE
                  </div>
                </div>
              </div>

              {/* 5 Biometric Vectors Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Facial Landmark Mesh */}
                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Facial 68-Point Mesh</span>
                    </div>
                    {currentProfile.faceGeometryMatch ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        MATCH ({currentProfile.faceConfidence}%)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                        MISMATCH ({currentProfile.faceConfidence}%)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${currentProfile.faceGeometryMatch ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${currentProfile.faceConfidence}%` }}
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Continuous facial contour tracking via camera iris &amp; jawline telemetry.
                  </p>
                </div>

                {/* 2. Voiceprint Spectral Waveform */}
                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Radio className="w-4 h-4 text-sky-400" />
                      <span>Voice Acoustic Formant</span>
                    </div>
                    {currentProfile.voiceprintMatch ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        CONFIRMED (96.4%)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                        DIVERGENT (34.0%)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${currentProfile.voiceprintMatch ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: currentProfile.voiceprintMatch ? '96%' : '34%' }}
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Fundamental pitch frequency &amp; vocal tract acoustic spectrogram match.
                  </p>
                </div>

                {/* 3. Typing Cadence Dynamics */}
                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Laptop className="w-4 h-4 text-purple-400" />
                      <span>Keystroke Flight Dynamics</span>
                    </div>
                    {currentProfile.typingCadenceMatch ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        BASELINE MATCH
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                        ANOMALOUS RHYTHM
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${currentProfile.typingCadenceMatch ? 'bg-purple-500' : 'bg-red-500'}`}
                      style={{ width: currentProfile.typingCadenceMatch ? '92%' : '28%' }}
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Inter-key latency and dwell-time entropy matching enrolled officer baseline.
                  </p>
                </div>

                {/* 4. Hardware TPM & Device Endorsement */}
                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span>Hardware TPM 2.0 Cert</span>
                    </div>
                    {currentProfile.deviceFingerprintMatch ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        FIPS VERIFIED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                        UNAUTHORIZED DEVICE
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${currentProfile.deviceFingerprintMatch ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: currentProfile.deviceFingerprintMatch ? '99%' : '12%' }}
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Hardware PKI root endorsement signature verification.
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#142342]">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentProfile.locationInfo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartVerificationScan(currentProfile.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Verification Scan</span>
                  </button>

                  <button
                    onClick={() => handleDispatchMfa(currentProfile)}
                    className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] hover:border-purple-500 text-xs font-semibold text-purple-300 flex items-center gap-1.5 shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>Push Hardware MFA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Identity Metadata & Active Sessions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#081023] border border-[#142342] rounded-xl p-4 shadow-lg space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Zero-Trust Credential Seal</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#060b17] border border-[#142342] flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-bold font-mono uppercase ${
                      currentProfile.status === 'live'
                        ? 'text-emerald-400'
                        : currentProfile.status === 'flagged'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentProfile.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#060b17] border border-[#142342] flex items-center justify-between">
                  <span className="text-slate-400">Enrolled On:</span>
                  <span className="font-mono text-slate-200">{currentProfile.enrolledDate}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#060b17] border border-[#142342] flex items-center justify-between">
                  <span className="text-slate-400">Active Sessions:</span>
                  <span className="font-mono text-blue-400 font-bold">{currentProfile.activeSessionsCount}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#060b17] border border-[#142342]">
                  <div className="text-slate-400 mb-1">Registered Device:</div>
                  <div className="font-mono text-slate-200 text-[11px] truncate">{currentProfile.deviceInfo}</div>
                </div>
              </div>

              {/* Zero-Trust Quarantine Button */}
              <button
                onClick={() => {
                  setTargetQuarantineProfile(currentProfile);
                  setIsQuarantineModalOpen(true);
                }}
                className="w-full py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enforce Zero-Trust Quarantine</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ZERO-TRUST ACCESS & QUARANTINE CONTROLS ─── */}
      {activeTab === 'zerotrust' && (
        <div className="space-y-4">
          <div className="bg-[#081023] border border-[#142342] rounded-xl p-4 shadow-lg space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Active Account Privilege Governance &amp; Session Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Revoke compromised session tokens, enforce air-gap evidence locks, and force hardware biometric attestation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#060b17] border border-[#142342] hover:border-slate-600 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{p.name}</div>
                      <div className="text-[10.5px] font-mono text-slate-400">{p.badgeNumber}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        p.status === 'live'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : p.status === 'quarantined'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trust Score:</span>
                      <span className="font-bold text-emerald-400">{p.matchConfidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Sessions:</span>
                      <span className="font-mono text-blue-400 font-bold">{p.activeSessionsCount}</span>
                    </div>
                    <div className="truncate text-slate-400 text-[10.5px]">{p.deviceInfo}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#142342]">
                    <button
                      onClick={() => handleRevokeSession(p)}
                      className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>Revoke Token</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetQuarantineProfile(p);
                        setIsQuarantineModalOpen(true);
                      }}
                      className="px-2 py-1.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Quarantine</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: DOPPELGÄNGER & GEO-DRIFT WATCHLIST ─── */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="bg-[#081023] border border-[#142342] rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#142342] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>High-Priority Doppelgänger &amp; Anomaly Watchlist</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time detection of concurrent logins, stolen credentials, and impossible travel physics violations
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {profiles
                .filter((p) => p.status === 'flagged' || p.status === 'quarantined')
                .map((flaggedProfile) => (
                  <div
                    key={flaggedProfile.id}
                    className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 hover:border-red-500 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 font-bold">
                          !
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{flaggedProfile.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/40">
                              {flaggedProfile.badgeNumber}
                            </span>
                          </div>
                          <div className="text-xs text-red-300 font-medium">{flaggedProfile.locationInfo}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartVerificationScan(flaggedProfile.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Probe Biometrics</span>
                        </button>
                        <button
                          onClick={() => {
                            setTargetQuarantineProfile(flaggedProfile);
                            setIsQuarantineModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Enforce Quarantine</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#060b17] border border-[#142342] text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        Device Drift: <span className="font-mono text-amber-300">{flaggedProfile.deviceInfo}</span>
                      </div>
                      <div>
                        Biometric Confidence: <span className="font-mono font-bold text-red-400">{flaggedProfile.matchConfidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: LIVE BIOMETRIC VERIFICATION SCANNER ─── */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#081023] border border-[#1e335a] rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#142342] pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-sky-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Live Multi-Factor Biometric Verification Probe
                </h3>
              </div>
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {scanStep < 4 ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-950/80 border border-blue-500/60 mx-auto flex items-center justify-center text-blue-400 animate-spin">
                  <Activity className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">
                    {scanStep === 1 && 'Phase 1: Analyzing 68-Point Facial Landmark Mesh...'}
                    {scanStep === 2 && 'Phase 2: Acoustic Voiceprint Waveform Spectral Match...'}
                    {scanStep === 3 && 'Phase 3: Keystroke Rhythm & Hardware TPM Handshake...'}
                  </div>
                  <p className="text-xs text-slate-400">
                    Acquiring live sensor telemetry and comparing against enrolled forensic baseline...
                  </p>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${(scanStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div
                  className={`p-4 rounded-xl border text-center space-y-2 ${
                    scanResult?.verified
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/50 text-red-300'
                  }`}
                >
                  <div className="text-xl font-extrabold uppercase tracking-wider">
                    {scanResult?.verified ? 'Identity Authenticated & Verified' : 'Biometric Mismatch Flagged!'}
                  </div>
                  <div className="text-3xl font-black">{scanResult?.confidence}% Match</div>
                  <p className="text-xs text-slate-300">{scanResult?.officerName} • {scanResult?.badgeNumber}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] text-xs space-y-1.5 text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Audit Ref:</span>
                    <span className="text-blue-400">{scanResult?.trailEventId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span>{new Date(scanResult?.verifiedAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FIPS-140-3 Hardware Cert:</span>
                    <span className="text-emerald-400">PASSED</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsVerifyingModalOpen(false)}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Close &amp; Return to Audit Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ZERO-TRUST QUARANTINE MODAL ─── */}
      {isQuarantineModalOpen && targetQuarantineProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-red-500/50 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#142342] pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Enforce Zero-Trust Quarantine
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsQuarantineModalOpen(false);
                  setQuarantineSuccess(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!quarantineSuccess ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  You are enforcing an emergency Zero-Trust Quarantine order on{' '}
                  <span className="font-bold text-white">{targetQuarantineProfile.name}</span> (
                  {targetQuarantineProfile.badgeNumber}).
                </p>

                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-xs text-red-200 space-y-1">
                  <div className="font-bold">Automated Enforcement Actions:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-300">
                    <li>Immediate purge of all active Kerberos &amp; OAuth sessions.</li>
                    <li>Air-gap lockout from Section 106 BNSS evidence vault.</li>
                    <li>Dispatches high-priority CSOC alert to Cyber Operations Center.</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Statutory Grounds / Notes:</label>
                  <textarea
                    value={quarantineReason}
                    onChange={(e) => setQuarantineReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-[#060b17] border border-[#1e335a] p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsQuarantineModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteQuarantine}
                    disabled={isExecutingQuarantine}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                  >
                    {isExecutingQuarantine ? 'Enforcing...' : 'Enforce Order Now'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white uppercase">Quarantine Executed</div>
                <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] text-xs font-mono text-slate-300 text-left space-y-1">
                  <div>Ticket: <span className="text-red-400 font-bold">{quarantineSuccess.ticketId}</span></div>
                  <div>Target: <span className="text-white">{quarantineSuccess.targetOfficer}</span></div>
                  <div>Dispatched: <span className="text-slate-400 text-[10px]">{quarantineSuccess.alertDispatchedTo}</span></div>
                </div>
                <button
                  onClick={() => {
                    setIsQuarantineModalOpen(false);
                    setQuarantineSuccess(null);
                  }}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 3: STEP-UP MFA DISPATCH CONFIRMATION ─── */}
      {isMfaModalOpen && mfaSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-purple-500/50 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#142342] pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Hardware MFA Step-Up Challenge Dispatched
                </h3>
              </div>
              <button
                onClick={() => setIsMfaModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-purple-950 border border-purple-500/60 mx-auto flex items-center justify-center text-purple-400 animate-pulse">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">{mfaSuccess.prompt}</div>
              <div className="p-3 rounded-lg bg-[#060b17] border border-[#142342] text-xs font-mono text-slate-300 text-left space-y-1">
                <div>Challenge Ref: <span className="text-purple-400 font-bold">{mfaSuccess.challengeId}</span></div>
                <div>Status: <span className="text-amber-400">WAITING_FOR_FIDO2_TAP</span></div>
              </div>
              <button
                onClick={() => setIsMfaModalOpen(false)}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentitySecurityPage;
