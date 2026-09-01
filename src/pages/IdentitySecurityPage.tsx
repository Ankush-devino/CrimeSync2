import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

interface IdentitySecurityPageProps {
  onSelectAction?: (action: string) => void;
}

interface OfficerBiometricProfile {
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
}

export const IdentitySecurityPage: React.FC<IdentitySecurityPageProps> = ({ onSelectAction }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('acp_raj_verma');
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [watchlistEscalated, setWatchlistEscalated] = useState<boolean>(false);

  // Profiles
  const profiles: Record<string, OfficerBiometricProfile> = {
    acp_raj_verma: {
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
    },
    insp_r_sharma: {
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
    },
    si_verma: {
      id: 'si_verma',
      name: 'SI Verma',
      rank: 'Sub Inspector',
      department: 'Field Intelligence',
      badgeNumber: 'DL-POL-7719',
      enrolledDate: '05 Jan 2024',
      status: 'flagged',
      matchConfidence: 44.8,
      faceGeometryMatch: true,
      voiceprintMatch: false,
      typingCadenceMatch: false,
      deviceFingerprintMatch: false,
      badgeCertMatch: true,
      faceConfidence: 88.4,
      deviceInfo: 'Field Tablet SM-X200 (Geo Drift)',
      locationInfo: 'Impossible Travel: Delhi to Pune in 12m',
    },
  };

  const currentProfile = profiles[selectedProfileId] || profiles.acp_raj_verma;

  const handleStartVerificationScan = () => {
    setIsVerifyingModalOpen(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 900);
    setTimeout(() => setScanStep(3), 1800);
    setTimeout(() => setScanStep(4), 2600);
  };

  const handleEscalateWatchlist = () => {
    setWatchlistEscalated(true);
    onSelectAction?.('Watchlist Escalated: Sent High-Priority Alert to Cyber Security Operations Center');
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Breadcrumb & Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">
            CYBER DEFENSE <span className="text-slate-500">/</span> Identity Security
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Identity Security — Doppelganger Detection
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Behavioral biometrics &amp; credential integrity across every officer session
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartVerificationScan}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            <span>+</span>
            <span>Verify Identity Now</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: VERIFIED IDENTITIES */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              VERIFIED IDENTITIES
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">1,842</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              of 1,847 active accounts
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 2: DOPPELGANGERS FLAGGED */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-red-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              DOPPELGANGERS FLAGGED
            </div>
            <div className="text-2xl font-extrabold text-red-500 mt-1">5</div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1 mt-1">
              <span>↑</span> 2 this week
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 3: BEHAVIOR ANOMALIES */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-amber-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              BEHAVIOR ANOMALIES
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">14</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              typing / gait drift
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Fingerprint className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 4: AVG TRUST SCORE */}
        <div className="p-3.5 rounded-lg bg-[#081023] border border-[#132240] flex items-center justify-between hover:border-blue-500/40 transition-all shadow-sm">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AVG TRUST SCORE
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              91<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑</span> 3 pts this month
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* ─── Middle Section: Identity Match Profile + Doppelganger Watchlist ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Identity Match Profile (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 rounded-lg bg-[#070e1f] border border-[#132342] p-4 flex flex-col justify-between shadow-md min-h-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#12203c]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Identity Match — {currentProfile.name}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-[9.5px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                live session
              </span>
            </div>

            <button
              onClick={() => setActiveModal('biometric_log')}
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <span>Full Biometric Log</span>
              <span className="text-xs">→</span>
            </button>
          </div>

          {/* Biometric Analysis Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4 flex-1">
            {/* Left Biometric Scanner Radar Circle (Spans 5 cols on md) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-pulse"></div>

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
                <div className="absolute -top-1 px-2.5 py-0.5 rounded-full bg-[#070e1f] border border-emerald-400/80 text-emerald-300 text-[8.5px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <span>REGISTERED PROFILE</span>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                {/* Center Officer Avatar Portrait */}
                <div className="w-24 h-24 rounded-full bg-[#050b18] border-2 border-emerald-400 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.4)] relative">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900/60 to-slate-900">
                    <OfficerAvatarIcon className="w-16 h-16 text-slate-100" />
                  </div>
                  {/* Subtle scan line effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent h-4 w-full animate-bounce"></div>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-mono mt-2">
                Enrolled {currentProfile.enrolledDate}
              </span>
            </div>

            {/* Right Confidence & Factor Checklist (Spans 7 cols on md) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  MATCH CONFIDENCE
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">
                  {currentProfile.matchConfidence}%
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-1.5 w-full bg-[#0c1830] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] transition-all duration-700"
                    style={{ width: `${currentProfile.matchConfidence}%` }}
                  ></div>
                </div>
              </div>

              {/* 5 Biometric Factor Rows */}
              <div className="space-y-2 text-xs pt-1">
                {/* Factor 1: Face Geometry */}
                <div className="flex items-center justify-between py-0.5 border-b border-[#101b33]">
                  <span className="text-slate-300 font-medium">Face geometry</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <span>✓</span> Match
                  </span>
                </div>

                {/* Factor 2: Voiceprint */}
                <div className="flex items-center justify-between py-0.5 border-b border-[#101b33]">
                  <span className="text-slate-300 font-medium">Voiceprint</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <span>✓</span> Match
                  </span>
                </div>

                {/* Factor 3: Typing Cadence */}
                <div className="flex items-center justify-between py-0.5 border-b border-[#101b33]">
                  <span className="text-slate-300 font-medium">Typing cadence</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <span>✓</span> Match
                  </span>
                </div>

                {/* Factor 4: Device + Location */}
                <div className="flex items-center justify-between py-0.5 border-b border-[#101b33]">
                  <span className="text-slate-300 font-medium">Device + location fingerprint</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <span>✓</span> Match
                  </span>
                </div>

                {/* Factor 5: Badge Cert */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-300 font-medium">Badge / smart-card cert</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <span>✓</span> Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Doppelganger Watchlist (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
              <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                Doppelganger Watchlist
              </span>
            </div>

            <div className="space-y-2.5 pt-3 text-xs">
              {/* Item 1 */}
              <div
                onClick={() => setSelectedProfileId('insp_r_sharma')}
                className={`p-2 rounded cursor-pointer transition-all border ${
                  selectedProfileId === 'insp_r_sharma'
                    ? 'bg-blue-600/20 border-blue-500/60'
                    : 'bg-[#050b18] border-[#101c34] hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-semibold text-slate-100 text-[11.5px]">
                      &quot;Insp. R. Sharma&quot; (2nd device)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Face 61% match · flagged 10:12 PM
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500 text-purple-300 text-[8.5px] font-extrabold tracking-wider shrink-0">
                    CRITICAL
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setSelectedProfileId('si_verma')}
                className={`p-2 rounded cursor-pointer transition-all border ${
                  selectedProfileId === 'si_verma'
                    ? 'bg-blue-600/20 border-blue-500/60'
                    : 'bg-[#050b18] border-[#101c34] hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-semibold text-slate-100 text-[11.5px]">
                      SI Verma — Pune login
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Impossible travel · 09:48 PM
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 text-[8.5px] font-bold shrink-0">
                    HIGH
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => onSelectAction?.('Inspect Ct. Meena session')}
                className="p-2 rounded bg-[#050b18] border border-[#101c34] hover:bg-slate-800/40 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-semibold text-slate-100 text-[11.5px]">
                      Ct. Meena — voice mismatch
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Voiceprint drift 22% · 09:15 PM
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[8.5px] font-bold shrink-0">
                    MEDIUM
                  </span>
                </div>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => onSelectAction?.('Inspect HC Yadav session')}
                className="p-2 rounded bg-[#050b18] border border-[#101c34] hover:bg-slate-800/40 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-semibold text-slate-100 text-[11.5px]">
                      HC Yadav — new keyboard cadence
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Typing rhythm changed · 08:52 PM
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 text-[8.5px] font-bold shrink-0">
                    MEDIUM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Escalate Watchlist Button */}
          <div className="pt-3 border-t border-[#12203c] mt-3">
            <button
              onClick={handleEscalateWatchlist}
              disabled={watchlistEscalated}
              className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                watchlistEscalated
                  ? 'bg-red-900/40 text-red-300 border border-red-500/60'
                  : 'bg-[#0b162c] hover:bg-red-950/60 border border-[#1d355f] text-slate-200 hover:text-white shadow'
              }`}
            >
              <span>🚨</span>
              <span>{watchlistEscalated ? '✓ Watchlist Escalated to SOC' : 'Escalate Watchlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: 3 Columns (Behavioral Biometrics + Login Geo-Consistency + Credential Health) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Bottom Left: Behavioral Biometrics Waveform (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>💻</span> Behavioral Biometrics
            </span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9.5px] text-slate-400 font-mono">
              last 24h
            </span>
          </div>

          {/* Dynamic Keystroke / Mouse-motion Waveform SVG */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="w-full h-16 flex items-center">
              <svg className="w-full h-full stroke-cyan-400 fill-none" viewBox="0 0 280 50">
                {/* Nominal Band Background Zone */}
                <rect x="0" y="10" width="280" height="30" fill="rgba(6, 182, 212, 0.05)" />
                {/* Waveform Path */}
                <path
                  d="M0 25 L30 25 L45 12 L60 38 L75 25 L90 25 L105 5 L120 45 L135 25 L150 15 L165 35 L180 8 L195 42 L210 25 L230 25 L245 18 L260 32 L280 25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-1">
              Keystroke + mouse-motion signature — nominal band
            </p>
          </div>
        </div>

        {/* Bottom Center: Login Geo-Consistency (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>📍</span> Login Geo-Consistency
            </span>
          </div>

          <div className="space-y-2.5 pt-2 text-xs flex-1 flex flex-col justify-center">
            {/* Geo 1 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Delhi HQ (registered)</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">96%</span>
            </div>

            {/* Geo 2 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Field device — Lajpat Nagar</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">89%</span>
            </div>

            {/* Geo 3 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">VPN exit — Gurugram</span>
              <span className="text-amber-400 font-bold font-mono text-[11px]">61%</span>
            </div>

            {/* Geo 4 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Unrecognized — Pune</span>
              <span className="text-red-400 font-bold font-mono text-[11px]">12%</span>
            </div>
          </div>
        </div>

        {/* Bottom Right: Credential Health (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 rounded-lg bg-[#070e1f] border border-[#132342] p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
            <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>🔑</span> Credential Health
            </span>
          </div>

          <div className="space-y-2.5 pt-2 text-xs flex-1 flex flex-col justify-center">
            {/* Stat 1 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">MFA enrollment</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">1,839 / 1,847</span>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Stale credentials (&gt;90d)</span>
              <span className="text-slate-200 font-bold font-mono text-[11px]">37</span>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Shared-login incidents</span>
              <span className="text-red-400 font-bold font-mono text-[11px]">2</span>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-300 text-[11px]">Hardware key adoption</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Verification Modal (Simulation) ─── */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Live Biometric Session Verification
              </h3>
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center relative overflow-hidden">
                <OfficerAvatarIcon className="w-16 h-16 text-slate-200" />
                <div className="absolute inset-0 bg-cyan-400/20 animate-pulse"></div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">
                  {scanStep === 1 && 'Scanning facial topology & micro-expressions...'}
                  {scanStep === 2 && 'Sampling audio harmonics for voiceprint...'}
                  {scanStep === 3 && 'Analyzing keystroke timing & mouse dynamics...'}
                  {scanStep === 4 && '✓ Biometric Verification Complete: 98.6% Match!'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Officer: ACP Raj Verma (DL-POL-8842)
                </p>
              </div>

              <div className="w-full bg-[#0c1830] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${(scanStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#162747]">
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Biometric Log Modal ─── */}
      {activeModal === 'biometric_log' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#081023] border border-[#1b2f56] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162747] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Comprehensive Biometric Audit Log — ACP Raj Verma
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-[#050b18] rounded border border-[#142340]">
                All biometric samples are hashed using zero-knowledge cryptographic proofs (ZK-SNARKs) and stored in the immutable Blockchain Vault.
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
