// Identity Security, Biometrics, Doppelganger Detection & Identity Trail Module
import { Router, Request, Response } from "express";
import { formatResponse } from "../../utils/api-response";

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
  threatVerdict: "NORMAL" | "SUSPICIOUS_DRIFT" | "HACK_DETECTED_UNAUTHORIZED_ACTOR";
  overallDissimilarityScore: number; // 0 - 100%
  timeAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  deviceAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  geoAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  cadenceAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  actionAnomaly: { baseline: string; observed: string; isAbnormal: boolean; score: number };
  intruderIndicators: string[];
  recommendedAction: string;
}

export interface OfficerBiometricProfileDTO {
  id: string;
  name: string;
  rank: string;
  department: string;
  badgeNumber: string;
  enrolledDate: string;
  status: "live" | "flagged" | "quarantined";
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
  baselinePattern: OfficerBaselinePattern;
  currentDissimilarity: PatternDissimilarityAnalysis;
}

export interface IdentityTrailEventDTO {
  id: string;
  timestamp: string;
  timeAgo: string;
  officerName: string;
  badgeNumber: string;
  action: string;
  category: "BIOMETRIC_PASS" | "IMPOSSIBLE_TRAVEL" | "FAILED_CHALLENGE" | "SESSION_HIJACK" | "QUARANTINE_ENFORCED" | "CREDENTIAL_REFRESH" | "HACK_PATTERN_ALERT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  status: "VERIFIED" | "FLAGGED" | "BLOCKED" | "QUARANTINED" | "HACKED_ALERT";
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

export interface DoppelgangerWatchlistItemDTO {
  id: string;
  profileId: string;
  officerName: string;
  badgeNumber: string;
  flagReason: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  flaggedAt: string;
  timeAgo: string;
  anomalyType: "VOICE_DRIFT" | "IMPOSSIBLE_TRAVEL" | "KEYBOARD_CADENCE" | "UNAUTHORIZED_DEVICE" | "CLONED_SESSION" | "PATTERN_DISSIMILARITY_HACK";
  deviceInfo: string;
  location: string;
  status: "ACTIVE_ALERT" | "QUARANTINED" | "INVESTIGATING";
  confidenceMatch: number;
  dissimilarityScore: number;
  isAccountHijacked: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Realistic Baselines and Profiles
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROFILES: Record<string, OfficerBiometricProfileDTO> = {
  acp_raj_verma: {
    id: "acp_raj_verma",
    name: "ACP Raj Verma",
    rank: "Assistant Commissioner of Police",
    department: "Special Cyber Crime Cell",
    badgeNumber: "DL-POL-8842",
    enrolledDate: "14 Mar 2024",
    status: "live",
    matchConfidence: 98.6,
    faceGeometryMatch: true,
    voiceprintMatch: true,
    typingCadenceMatch: true,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 99.2,
    deviceInfo: "Dell Latitude 7440 (Encrypted TPM 2.0)",
    locationInfo: "Delhi HQ - Command Room B",
    lastActive: "Just now",
    ipAddress: "10.14.22.84",
    assignedCaseId: "CASE-2026-001",
    baselinePattern: {
      typicalWorkingHours: "08:30 - 20:00 IST",
      typicalWorkDays: "Monday - Saturday",
      authorizedSubnets: ["10.14.22.0/24", "10.14.23.0/24"],
      registeredDevices: ["Dell Latitude 7440 (TPM #DL-POL-8842-TPM)"],
      primaryGeofence: "Delhi NCR Command Center (Radius 30km)",
      averageTypingWpm: 68,
      averageFlightTimeMs: 112,
      averageDwellTimeMs: 84,
      usualCaseCategories: ["PHISHING", "HAWALA", "RANSOMWARE"],
      dailyAvgQueryCount: 46,
      baselineTrustRating: 98
    },
    currentDissimilarity: {
      isCompromised: false,
      threatVerdict: "NORMAL",
      overallDissimilarityScore: 2.4,
      timeAnomaly: { baseline: "08:30 - 20:00", observed: "11:45 AM (Within Hours)", isAbnormal: false, score: 0 },
      deviceAnomaly: { baseline: "Dell Latitude 7440", observed: "Dell Latitude 7440 (TPM Valid)", isAbnormal: false, score: 0 },
      geoAnomaly: { baseline: "Delhi HQ", observed: "Delhi HQ Command Room B", isAbnormal: false, score: 0 },
      cadenceAnomaly: { baseline: "68 WPM / 112ms flight", observed: "69 WPM / 110ms flight", isAbnormal: false, score: 3 },
      actionAnomaly: { baseline: "Standard investigation triage", observed: "Case review & evidence verification", isAbnormal: false, score: 2 },
      intruderIndicators: [],
      recommendedAction: "Session authenticated with continuous Zero-Trust biometric compliance."
    }
  },
  insp_r_sharma: {
    id: "insp_r_sharma",
    name: "Insp. R. Sharma",
    rank: "Inspector",
    department: "Anti-Hawala Unit",
    badgeNumber: "DL-POL-4192",
    enrolledDate: "22 Nov 2023",
    status: "flagged",
    matchConfidence: 61.4,
    faceGeometryMatch: false,
    voiceprintMatch: false,
    typingCadenceMatch: true,
    deviceFingerprintMatch: false,
    badgeCertMatch: true,
    faceConfidence: 61.0,
    deviceInfo: "Unrecognized iPhone 14 Pro (Pune IP)",
    locationInfo: "Pune - Unknown Cell Tower",
    lastActive: "4m ago",
    ipAddress: "152.57.19.202",
    assignedCaseId: "CASE-2026-004",
    baselinePattern: {
      typicalWorkingHours: "09:00 - 18:30 IST",
      typicalWorkDays: "Monday - Friday",
      authorizedSubnets: ["10.14.22.0/24"],
      registeredDevices: ["Lenovo ThinkPad P14s (Gov PKI)"],
      primaryGeofence: "Delhi Police HQ / North Block",
      averageTypingWpm: 55,
      averageFlightTimeMs: 130,
      averageDwellTimeMs: 95,
      usualCaseCategories: ["HAWALA", "MONEY_LAUNDERING"],
      dailyAvgQueryCount: 28,
      baselineTrustRating: 92
    },
    currentDissimilarity: {
      isCompromised: true,
      threatVerdict: "HACK_DETECTED_UNAUTHORIZED_ACTOR",
      overallDissimilarityScore: 88.6,
      timeAnomaly: { baseline: "09:00 - 18:30 IST", observed: "03:14 AM (Off-hours burst)", isAbnormal: true, score: 85 },
      deviceAnomaly: { baseline: "Lenovo ThinkPad P14s", observed: "Unregistered iPhone 14 Pro (Non-Gov UDID)", isAbnormal: true, score: 95 },
      geoAnomaly: { baseline: "Delhi HQ", observed: "Pune Cell Tower Sector 12 (1,180km drift)", isAbnormal: true, score: 99 },
      cadenceAnomaly: { baseline: "55 WPM / 130ms flight", observed: "135 WPM (Automated script/burst)", isAbnormal: true, score: 90 },
      actionAnomaly: { baseline: "Hawala ledger reads", observed: "Bulk encrypted DB dump & credential export", isAbnormal: true, score: 96 },
      intruderIndicators: [
        "Concurrent login session while primary terminal active in Delhi",
        "Off-hours database dump query initiated at 03:14 AM",
        "Facial geometry match dropped to 61.0% (Synthetic deepfake mask artifact)",
        "Voice harmonics failed FFT acoustic resonance anti-spoofing check"
      ],
      recommendedAction: "🚨 IMMEDIATE SESSION KILL SWITCH & ACCOUNT LOCKDOWN. Dispatch CSOC alert."
    }
  },
  si_verma: {
    id: "si_verma",
    name: "SI Verma",
    rank: "Sub Inspector",
    department: "Field Intelligence",
    badgeNumber: "DL-POL-7719",
    enrolledDate: "05 Jan 2024",
    status: "flagged",
    matchConfidence: 44.8,
    faceGeometryMatch: true,
    voiceprintMatch: false,
    typingCadenceMatch: false,
    deviceFingerprintMatch: false,
    badgeCertMatch: true,
    faceConfidence: 88.4,
    deviceInfo: "Field Tablet SM-X200 (Geo Drift)",
    locationInfo: "Impossible Travel: Delhi to Pune in 12m",
    lastActive: "12m ago",
    ipAddress: "49.204.112.5",
    assignedCaseId: "CASE-2026-008",
    baselinePattern: {
      typicalWorkingHours: "08:00 - 21:00 IST",
      typicalWorkDays: "Monday - Sunday",
      authorizedSubnets: ["10.14.22.0/24", "100.64.0.0/16"],
      registeredDevices: ["Samsung Galaxy Tab Active4 Pro"],
      primaryGeofence: "Delhi NCR Field Zone",
      averageTypingWpm: 48,
      averageFlightTimeMs: 145,
      averageDwellTimeMs: 102,
      usualCaseCategories: ["FIELD_INTEL", "SIM_CLONING"],
      dailyAvgQueryCount: 35,
      baselineTrustRating: 90
    },
    currentDissimilarity: {
      isCompromised: true,
      threatVerdict: "HACK_DETECTED_UNAUTHORIZED_ACTOR",
      overallDissimilarityScore: 92.4,
      timeAnomaly: { baseline: "08:00 - 21:00 IST", observed: "11:32 AM", isAbnormal: false, score: 10 },
      deviceAnomaly: { baseline: "Galaxy Tab Active4 Pro", observed: "Consumer Tab SM-X200 (Spoofed IMEI)", isAbnormal: true, score: 90 },
      geoAnomaly: { baseline: "Delhi NCR", observed: "Pune Cyber Cell Base (1,180 km in 12m - 5,900 km/h)", isAbnormal: true, score: 100 },
      cadenceAnomaly: { baseline: "48 WPM", observed: "22 WPM (Clumsy imposter cadence)", isAbnormal: true, score: 82 },
      actionAnomaly: { baseline: "Field CDR lookup", observed: "Mass FIR query enumeration", isAbnormal: true, score: 88 },
      intruderIndicators: [
        "Impossible physical flight travel velocity (5,900 km/h)",
        "Spoofed IMEI header detected on non-tactical Android build",
        "Voiceprint acoustic resonance drift 44.8%"
      ],
      recommendedAction: "Enforce emergency token quarantine and trigger physical biometric re-enrollment."
    }
  },
  sp_ananya_sengupta: {
    id: "sp_ananya_sengupta",
    name: "Superintendent Ananya Sengupta",
    rank: "Superintendent of Police",
    department: "Kolkata Cyber Forensics & Anti-Scam Unit",
    badgeNumber: "WB-POL-1002",
    enrolledDate: "10 Feb 2024",
    status: "live",
    matchConfidence: 99.4,
    faceGeometryMatch: true,
    voiceprintMatch: true,
    typingCadenceMatch: true,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 99.6,
    deviceInfo: "HP Elite Dragonfly G4 (Gov PKI HSM)",
    locationInfo: "Lalbazar Cyber HQ, Kolkata",
    lastActive: "1m ago",
    ipAddress: "10.22.4.15",
    assignedCaseId: "CASE-2026-004",
    baselinePattern: {
      typicalWorkingHours: "08:00 - 22:00 IST",
      typicalWorkDays: "Monday - Saturday",
      authorizedSubnets: ["10.22.4.0/24"],
      registeredDevices: ["HP Elite Dragonfly G4 (HSM #WB-1002-PKI)"],
      primaryGeofence: "Lalbazar Police HQ, Kolkata (Radius 20km)",
      averageTypingWpm: 74,
      averageFlightTimeMs: 104,
      averageDwellTimeMs: 78,
      usualCaseCategories: ["FINANCIAL_FRAUD", "CRYPTO_OTC", "TECH_SUPPORT"],
      dailyAvgQueryCount: 65,
      baselineTrustRating: 99
    },
    currentDissimilarity: {
      isCompromised: false,
      threatVerdict: "NORMAL",
      overallDissimilarityScore: 1.1,
      timeAnomaly: { baseline: "08:00 - 22:00", observed: "10:15 AM", isAbnormal: false, score: 0 },
      deviceAnomaly: { baseline: "HP Elite Dragonfly", observed: "HP Elite Dragonfly (HSM Valid)", isAbnormal: false, score: 0 },
      geoAnomaly: { baseline: "Kolkata Lalbazar HQ", observed: "Lalbazar Cyber HQ, Kolkata", isAbnormal: false, score: 0 },
      cadenceAnomaly: { baseline: "74 WPM", observed: "75 WPM", isAbnormal: false, score: 1 },
      actionAnomaly: { baseline: "Case approvals & bank freeze", observed: "Section 106 BNSS Freeze Order Requisition", isAbnormal: false, score: 1 },
      intruderIndicators: [],
      recommendedAction: "Session fully authorized with highest zero-trust confidence."
    }
  },
  ct_meena: {
    id: "ct_meena",
    name: "Ct. Meena",
    rank: "Constable",
    department: "Interception & Surveillance Desk",
    badgeNumber: "DL-POL-9910",
    enrolledDate: "18 Aug 2024",
    status: "flagged",
    matchConfidence: 68.2,
    faceGeometryMatch: true,
    voiceprintMatch: false,
    typingCadenceMatch: true,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 94.0,
    deviceInfo: "Surveillance Console #4 (Audio Filter Drift)",
    locationInfo: "Delhi HQ - Cyber Cell",
    lastActive: "18m ago",
    ipAddress: "10.14.22.99",
    assignedCaseId: "CASE-2026-005",
    baselinePattern: {
      typicalWorkingHours: "07:00 - 15:00 / 15:00 - 23:00 (Rotational)",
      typicalWorkDays: "Rotational Shifts",
      authorizedSubnets: ["10.14.22.0/24"],
      registeredDevices: ["Surveillance Console #4"],
      primaryGeofence: "Delhi Police HQ",
      averageTypingWpm: 52,
      averageFlightTimeMs: 138,
      averageDwellTimeMs: 98,
      usualCaseCategories: ["AUDIO_SURVEILLANCE", "DIGITAL_ARREST"],
      dailyAvgQueryCount: 22,
      baselineTrustRating: 88
    },
    currentDissimilarity: {
      isCompromised: false,
      threatVerdict: "SUSPICIOUS_DRIFT",
      overallDissimilarityScore: 42.5,
      timeAnomaly: { baseline: "Rotational shift", observed: "09:15 PM (Shift B)", isAbnormal: false, score: 5 },
      deviceAnomaly: { baseline: "Console #4", observed: "Console #4 (Microphone filter driver update)", isAbnormal: false, score: 10 },
      geoAnomaly: { baseline: "Delhi HQ", observed: "Delhi HQ - Cyber Cell", isAbnormal: false, score: 0 },
      cadenceAnomaly: { baseline: "52 WPM", observed: "50 WPM", isAbnormal: false, score: 4 },
      actionAnomaly: { baseline: "Audio stream monitoring", observed: "Voice dispatch validation", isAbnormal: true, score: 45 },
      intruderIndicators: [
        "Voiceprint acoustic resonance drift of 22.4% detected by DSP harmonics analyzer",
        "Possible microphone hardware filter anomaly or synthetic pitch transformation"
      ],
      recommendedAction: "Force secondary physical biometric challenge; keep session monitored."
    }
  },
  hc_yadav: {
    id: "hc_yadav",
    name: "HC Yadav",
    rank: "Head Constable",
    department: "Evidence Digitization & Locker Desk",
    badgeNumber: "DL-POL-3312",
    enrolledDate: "03 May 2024",
    status: "live",
    matchConfidence: 89.0,
    faceGeometryMatch: true,
    voiceprintMatch: true,
    typingCadenceMatch: false,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 92.5,
    deviceInfo: "Evidence Terminal T-09",
    locationInfo: "Delhi HQ - Evidence Vault",
    lastActive: "25m ago",
    ipAddress: "10.14.22.104",
    assignedCaseId: "CASE-2026-006",
    baselinePattern: {
      typicalWorkingHours: "09:30 - 18:00 IST",
      typicalWorkDays: "Monday - Friday",
      authorizedSubnets: ["10.14.22.0/24"],
      registeredDevices: ["Evidence Terminal T-09"],
      primaryGeofence: "Delhi HQ Evidence Vault",
      averageTypingWpm: 42,
      averageFlightTimeMs: 160,
      averageDwellTimeMs: 110,
      usualCaseCategories: ["AEPS_EVIDENCE", "BIOMETRIC_VAULT"],
      dailyAvgQueryCount: 18,
      baselineTrustRating: 91
    },
    currentDissimilarity: {
      isCompromised: false,
      threatVerdict: "NORMAL",
      overallDissimilarityScore: 18.0,
      timeAnomaly: { baseline: "09:30 - 18:00", observed: "11:10 AM", isAbnormal: false, score: 0 },
      deviceAnomaly: { baseline: "Terminal T-09", observed: "Terminal T-09", isAbnormal: false, score: 0 },
      geoAnomaly: { baseline: "Evidence Vault", observed: "Evidence Vault", isAbnormal: false, score: 0 },
      cadenceAnomaly: { baseline: "42 WPM / 160ms", observed: "32 WPM / 210ms (Bandaged finger / mechanical keyboard)", isAbnormal: true, score: 28 },
      actionAnomaly: { baseline: "Evidence logging", observed: "Evidence seal hash verification", isAbnormal: false, score: 5 },
      intruderIndicators: [
        "Typing cadence variance of 28% outside nominal baseline (finger injury declared)"
      ],
      recommendedAction: "Fingerprint re-verification passed successfully; trust score maintained."
    }
  }
};

const DEFAULT_TRAIL: IdentityTrailEventDTO[] = [
  {
    id: "ID-EVT-HACK-01",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    timeAgo: "4m ago",
    officerName: "Insp. R. Sharma",
    badgeNumber: "DL-POL-4192",
    action: "🚨 ACCOUNT HACKED / HIJACKED: Pattern Dissimilarity 88.6% — Unauthorized Actor Detected!",
    category: "HACK_PATTERN_ALERT",
    severity: "CRITICAL",
    status: "HACKED_ALERT",
    caseId: "CASE-2026-004",
    deviceInfo: "Apple iPhone 14 Pro (Unenrolled Non-Gov UDID)",
    ipAddress: "152.57.19.202",
    location: "Pune Cell Tower Sector 12 (1,180 km from Base)",
    confidenceScore: 61.4,
    patternDissimilarityScore: 88.6,
    isHackedAnomaly: true,
    hashSha256: "11a098bc44910293847102938471029384710293847102938471029384710293",
    details: "High-confidence unauthorized intrusion detected! Officer baseline pattern severely breached: Off-hours access at 03:14 AM from Pune, 135 WPM automated cadence burst, and bulk encrypted database dump query. Account is suspected compromised and operated by an imposter.",
    dissimilarityBreakdown: {
      timeShift: "Observed 03:14 AM vs Baseline 09:00 - 18:30 IST (+85% Off-Hours Anomaly)",
      deviceDiscrepancy: "Unenrolled iPhone 14 Pro vs Baseline Lenovo ThinkPad Gov PKI (+95% Anomaly)",
      geoDrift: "Pune Cell Tower Sector 12 vs Baseline Delhi Police HQ (+99% Anomaly)",
      keystrokeDeviation: "135 WPM Automated Script vs Baseline 55 WPM (+90% Anomaly)",
      unauthorizedActions: "Bulk Encrypted DB Dump & Credential Scraping (+96% Anomaly)"
    },
    rawTelemetry: {
      faceScore: 61.0,
      voiceDriftPercent: 44.5,
      geoDriftKm: 1180.0
    }
  },
  {
    id: "ID-EVT-HACK-02",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timeAgo: "12m ago",
    officerName: "SI Verma",
    badgeNumber: "DL-POL-7719",
    action: "🚨 IMPOSSIBLE TRAVEL HACK ALERT: Pattern Dissimilarity 92.4% — Delhi to Pune in 12m",
    category: "IMPOSSIBLE_TRAVEL",
    severity: "CRITICAL",
    status: "HACKED_ALERT",
    caseId: "CASE-2026-008",
    deviceInfo: "Samsung Galaxy Tab SM-X200 (Spoofed IMEI)",
    ipAddress: "49.204.112.5",
    location: "Pune Cyber Cell Base vs Delhi HQ",
    confidenceScore: 44.8,
    patternDissimilarityScore: 92.4,
    isHackedAnomaly: true,
    hashSha256: "33fe441029384710293847102938471029384710293847102938471029384710",
    details: "Physical impossibility alert: Account logged in at Delhi HQ (11:20 AM) and authenticated 12 minutes later from Pune (11:32 AM), requiring 5,900 km/h flight velocity. Cloned credential used by remote unauthorized operative.",
    dissimilarityBreakdown: {
      timeShift: "Authentication during normal hours but concurrent with active Delhi session",
      deviceDiscrepancy: "Consumer Tab SM-X200 with spoofed IMEI header vs Tactical Active4 Pro",
      geoDrift: "1,180 km physical separation in 12 minutes",
      keystrokeDeviation: "Clumsy imposter cadence: 22 WPM vs Baseline 48 WPM",
      unauthorizedActions: "Mass FIR database enumeration & suspect phone number harvest"
    },
    rawTelemetry: {
      geoDriftKm: 1180.0,
      speedKmph: 5900.0,
      faceScore: 88.4
    }
  },
  {
    id: "ID-EVT-901",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: "2m ago",
    officerName: "ACP Raj Verma",
    badgeNumber: "DL-POL-8842",
    action: "Continuous Zero-Trust Biometric Challenge Passed — Pattern Matched (98.6%)",
    category: "BIOMETRIC_PASS",
    severity: "INFO",
    status: "VERIFIED",
    caseId: "CASE-2026-001",
    deviceInfo: "Dell Latitude 7440 (TPM 2.0)",
    ipAddress: "10.14.22.84",
    location: "Delhi HQ - Command Room B",
    confidenceScore: 98.6,
    patternDissimilarityScore: 2.4,
    isHackedAnomaly: false,
    hashSha256: "8e9f214c7719a8bc441029384710293847102938471029384710293847102938",
    details: "All 5 zero-knowledge biometrics (Face 3D topology, voice harmonics, typing cadence, device cert, geo-BSSID) validated seamlessly against enrolled baseline pattern.",
    dissimilarityBreakdown: {
      timeShift: "11:45 AM (Nominal working window)",
      deviceDiscrepancy: "0% (Dell Latitude TPM 2.0 Verified)",
      geoDrift: "0.05 km (Inside Command Room B)",
      keystrokeDeviation: "69 WPM vs 68 WPM Baseline (1.2% Drift)",
      unauthorizedActions: "Standard Case Investigation Workflow"
    },
    rawTelemetry: {
      faceScore: 99.2,
      typingCadenceDeviation: 1.2,
      geoDriftKm: 0.05
    }
  },
  {
    id: "ID-EVT-905",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timeAgo: "35m ago",
    officerName: "Superintendent Ananya Sengupta",
    badgeNumber: "WB-POL-1002",
    action: "Hardware FIDO2 X.509 Cryptographic Certificate Re-validation — Pattern Nominal",
    category: "CREDENTIAL_REFRESH",
    severity: "LOW",
    status: "VERIFIED",
    caseId: "CASE-2026-004",
    deviceInfo: "HP Elite Dragonfly G4 (Gov PKI HSM)",
    ipAddress: "10.22.4.15",
    location: "Lalbazar Cyber HQ, Kolkata",
    confidenceScore: 99.4,
    patternDissimilarityScore: 1.1,
    isHackedAnomaly: false,
    hashSha256: "99bb881029384710293847102938471029384710293847102938471029384710",
    details: "Government Hardware Security Module (HSM) key pair validated with National Police PKI Root CA. Zero pattern anomalies detected.",
    dissimilarityBreakdown: {
      timeShift: "10:15 AM (Nominal)",
      deviceDiscrepancy: "0% (HP Elite Dragonfly HSM Valid)",
      geoDrift: "0 km (Lalbazar HQ Kolkata)",
      keystrokeDeviation: "75 WPM vs 74 WPM Baseline",
      unauthorizedActions: "Section 106 BNSS Bank Freeze Execution"
    },
    rawTelemetry: {
      faceScore: 99.6,
      typingCadenceDeviation: 0.8
    }
  },
  {
    id: "ID-EVT-904",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    timeAgo: "22m ago",
    officerName: "Ct. Meena",
    badgeNumber: "DL-POL-9910",
    action: "Voiceprint Acoustic Drift: 22% Variation in Spectral Harmonics",
    category: "FAILED_CHALLENGE",
    severity: "MEDIUM",
    status: "FLAGGED",
    caseId: "CASE-2026-005",
    deviceInfo: "Surveillance Desk Console #4",
    ipAddress: "10.14.22.99",
    location: "Delhi HQ - Cyber Cell",
    confidenceScore: 68.2,
    patternDissimilarityScore: 42.5,
    isHackedAnomaly: false,
    hashSha256: "77aa119283746192837461928374619283746192837461928374619283746192",
    details: "Audio challenge response displayed unnatural pitch quantization consistent with AI voice cloning software. Forced fallback to hardware token.",
    dissimilarityBreakdown: {
      timeShift: "09:15 PM (Shift B Nominal)",
      deviceDiscrepancy: "Console #4",
      geoDrift: "0 km (Cyber Cell)",
      keystrokeDeviation: "50 WPM vs 52 WPM",
      unauthorizedActions: "Voice Dispatch Check"
    },
    rawTelemetry: {
      voiceDriftPercent: 22.4,
      faceScore: 94.0
    }
  }
];

const DEFAULT_WATCHLIST: DoppelgangerWatchlistItemDTO[] = [
  {
    id: "WL-001",
    profileId: "insp_r_sharma",
    officerName: "Insp. R. Sharma",
    badgeNumber: "DL-POL-4192",
    flagReason: "Account Hacked Alert: Pattern Dissimilarity 88.6%. Unenrolled iPhone 14 Pro active from Pune during off-hours dumping database.",
    severity: "CRITICAL",
    flaggedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    timeAgo: "4m ago",
    anomalyType: "PATTERN_DISSIMILARITY_HACK",
    deviceInfo: "iPhone 14 Pro (Pune IP)",
    location: "Pune - Cell Tower Sector 12",
    status: "ACTIVE_ALERT",
    confidenceMatch: 61.4,
    dissimilarityScore: 88.6,
    isAccountHijacked: true
  },
  {
    id: "WL-002",
    profileId: "si_verma",
    officerName: "SI Verma",
    badgeNumber: "DL-POL-7719",
    flagReason: "Impossible travel hack alert: Pattern Dissimilarity 92.4%. Delhi to Pune in 12m harvesting FIR logs.",
    severity: "CRITICAL",
    flaggedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timeAgo: "12m ago",
    anomalyType: "IMPOSSIBLE_TRAVEL",
    deviceInfo: "Samsung Tab SM-X200",
    location: "Pune vs Delhi",
    status: "ACTIVE_ALERT",
    confidenceMatch: 44.8,
    dissimilarityScore: 92.4,
    isAccountHijacked: true
  },
  {
    id: "WL-003",
    profileId: "ct_meena",
    officerName: "Ct. Meena",
    badgeNumber: "DL-POL-9910",
    flagReason: "Voiceprint drift 22.4% with synthetic AI harmonics detected.",
    severity: "MEDIUM",
    flaggedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    timeAgo: "22m ago",
    anomalyType: "VOICE_DRIFT",
    deviceInfo: "Surveillance Desk Console #4",
    location: "Delhi HQ - Cyber Cell",
    status: "INVESTIGATING",
    confidenceMatch: 68.2,
    dissimilarityScore: 42.5,
    isAccountHijacked: false
  }
];

let inMemoryProfiles = { ...DEFAULT_PROFILES };
let inMemoryTrail = [...DEFAULT_TRAIL];
let inMemoryWatchlist = [...DEFAULT_WATCHLIST];

// ─────────────────────────────────────────────────────────────────────────────
// Service Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class IdentityService {
  async listProfiles(caseId?: string): Promise<OfficerBiometricProfileDTO[]> {
    const list = Object.values(inMemoryProfiles);
    if (caseId && caseId !== "ALL") {
      const caseFiltered = list.filter((p) => p.assignedCaseId === caseId);
      if (caseFiltered.length > 0) return caseFiltered;
    }
    return list;
  }

  async getProfile(id: string): Promise<OfficerBiometricProfileDTO | null> {
    return inMemoryProfiles[id] || null;
  }

  async getIdentityTrail(caseId?: string, category?: string, search?: string): Promise<IdentityTrailEventDTO[]> {
    let result = [...inMemoryTrail];
    if (caseId && caseId !== "ALL") {
      const caseFiltered = result.filter((e) => e.caseId === caseId);
      if (caseFiltered.length > 0) result = caseFiltered;
    }
    if (category && category !== "ALL") {
      result = result.filter((e) => e.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.officerName.toLowerCase().includes(q) ||
          e.badgeNumber.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.deviceInfo.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getWatchlist(caseId?: string): Promise<DoppelgangerWatchlistItemDTO[]> {
    return inMemoryWatchlist;
  }

  async getHackedAlerts(): Promise<{ compromisedCount: number; alerts: DoppelgangerWatchlistItemDTO[] }> {
    const hacked = inMemoryWatchlist.filter((w) => w.isAccountHijacked && w.status === "ACTIVE_ALERT");
    return {
      compromisedCount: hacked.length,
      alerts: hacked
    };
  }

  async verifyIdentity(officerId: string) {
    const profile = inMemoryProfiles[officerId] || inMemoryProfiles.acp_raj_verma;
    const isVerified = profile.matchConfidence > 75;

    const newEvent: IdentityTrailEventDTO = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: isVerified
        ? "Live Zero-Knowledge Biometric Session Challenge Succeeded — Pattern Verified"
        : "Live Biometric Challenge Failed — Pattern Anomaly Detected",
      category: isVerified ? "BIOMETRIC_PASS" : "FAILED_CHALLENGE",
      severity: isVerified ? "INFO" : "HIGH",
      status: isVerified ? "VERIFIED" : "FLAGGED",
      caseId: profile.assignedCaseId || "CASE-2026-001",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: profile.matchConfidence,
      patternDissimilarityScore: profile.currentDissimilarity.overallDissimilarityScore,
      isHackedAnomaly: profile.currentDissimilarity.isCompromised,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: isVerified
        ? `Continuous verification validated face (${profile.faceConfidence}%), voiceprint, typing cadence, and hardware TPM certificates against baseline pattern.`
        : `Biometric matching confidence dropped to ${profile.matchConfidence}%. Pattern dissimilarity score: ${profile.currentDissimilarity.overallDissimilarityScore}%.`,
      dissimilarityBreakdown: {
        timeShift: profile.currentDissimilarity.timeAnomaly.observed,
        deviceDiscrepancy: profile.currentDissimilarity.deviceAnomaly.observed,
        geoDrift: profile.currentDissimilarity.geoAnomaly.observed,
        keystrokeDeviation: profile.currentDissimilarity.cadenceAnomaly.observed,
        unauthorizedActions: profile.currentDissimilarity.actionAnomaly.observed
      },
      rawTelemetry: {
        faceScore: profile.faceConfidence,
        typingCadenceDeviation: 1.4,
        geoDriftKm: 0.02
      }
    };

    inMemoryTrail.unshift(newEvent);

    return {
      verified: isVerified,
      officerId: profile.id,
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      confidence: profile.matchConfidence,
      patternDissimilarityScore: profile.currentDissimilarity.overallDissimilarityScore,
      isCompromised: profile.currentDissimilarity.isCompromised,
      threatVerdict: profile.currentDissimilarity.threatVerdict,
      factors: {
        faceGeometry: profile.faceGeometryMatch,
        voiceprint: profile.voiceprintMatch,
        typingCadence: profile.typingCadenceMatch,
        deviceFingerprint: profile.deviceFingerprintMatch,
        badgeCertificate: profile.badgeCertMatch
      },
      verifiedAt: new Date().toISOString(),
      eventId: newEvent.id
    };
  }

  async quarantineSession(profileId: string, reason?: string) {
    const profile = inMemoryProfiles[profileId] || inMemoryProfiles.insp_r_sharma;
    profile.status = "quarantined";

    const watchItem = inMemoryWatchlist.find((w) => w.profileId === profileId);
    if (watchItem) {
      watchItem.status = "QUARANTINED";
    }

    const newEvent: IdentityTrailEventDTO = {
      id: `ID-EVT-Q-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: "🚨 EMERGENCY KILL-SWITCH: Account Quarantined & Access Tokens Revoked",
      category: "QUARANTINE_ENFORCED",
      severity: "CRITICAL",
      status: "QUARANTINED",
      caseId: profile.assignedCaseId || "CASE-2026-004",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: 0.0,
      patternDissimilarityScore: 100.0,
      isHackedAnomaly: true,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: reason || `Unauthorized actor detected. Officer session ${profile.badgeNumber} forcibly terminated, tokens blacklisted, and suspect IP blocked.`,
      dissimilarityBreakdown: {
        timeShift: "Session Terminated",
        deviceDiscrepancy: "Hardware Token Revoked",
        geoDrift: "IP Blacklisted",
        keystrokeDeviation: "N/A",
        unauthorizedActions: "Emergency Kill Switch Activated"
      }
    };

    inMemoryTrail.unshift(newEvent);

    return {
      success: true,
      quarantineId: `QUARANTINE-REF-${Date.now().toString().slice(-6)}`,
      targetOfficer: profile.name,
      badgeNumber: profile.badgeNumber,
      status: "QUARANTINED",
      revocationTime: new Date().toISOString(),
      reason: reason || "Pattern dissimilarity hack detected"
    };
  }

  async escalateToSoc(profileId: string, notes?: string) {
    const profile = inMemoryProfiles[profileId] || inMemoryProfiles.insp_r_sharma;
    profile.status = "quarantined";

    const ticketId = `CSOC-INC-${Date.now().toString().slice(-6)}`;

    inMemoryTrail.unshift({
      id: `ID-EVT-ESC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: `🚨 CSOC & CERT-In P1 S.O.S. Dispatched: Incident Ticket #${ticketId}`,
      category: "SESSION_HIJACK",
      severity: "CRITICAL",
      status: "FLAGGED",
      caseId: profile.assignedCaseId || "CASE-2026-001",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: profile.matchConfidence,
      patternDissimilarityScore: profile.currentDissimilarity.overallDissimilarityScore,
      isHackedAnomaly: true,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: notes || `Account hack pattern dissimilarity alert escalated to Cyber Security Operations Center for emergency forensic imaging and credential rotation.`
    });

    return {
      success: true,
      escalationTicket: ticketId,
      targetOfficer: profile.name,
      badgeNumber: profile.badgeNumber,
      status: "QUARANTINED_PENDING_FORENSIC_REVIEW",
      alertDispatchedTo: "Cyber Security Operations Center (CSOC) New Delhi & CERT-In",
      notes: notes || "Account compromised by unauthorized actor; severe pattern dissimilarity",
      escalatedAt: new Date().toISOString()
    };
  }

  async getStats(caseId?: string) {
    const caseStatsMap: Record<string, any> = {
      "CASE-2026-004": {
        verifiedIdentities: 12,
        totalActiveAccounts: 14,
        doppelgangersFlagged: 1,
        hackedAccountsDetected: 1,
        behaviorAnomalies: 2,
        avgTrustScore: 88,
        mfaEnrollment: "13 / 14",
        hardwareKeyAdoptionRate: "92%",
        staleCredentials: 1,
        quarantinedSessions: 1
      },
      "CASE-2026-001": {
        verifiedIdentities: 17,
        totalActiveAccounts: 18,
        doppelgangersFlagged: 1,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 1,
        avgTrustScore: 94,
        mfaEnrollment: "18 / 18",
        hardwareKeyAdoptionRate: "94%",
        staleCredentials: 0,
        quarantinedSessions: 0
      },
      "CASE-2026-002": {
        verifiedIdentities: 11,
        totalActiveAccounts: 12,
        doppelgangersFlagged: 0,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 1,
        avgTrustScore: 96,
        mfaEnrollment: "12 / 12",
        hardwareKeyAdoptionRate: "100%",
        staleCredentials: 0,
        quarantinedSessions: 0
      },
      "CASE-2026-003": {
        verifiedIdentities: 9,
        totalActiveAccounts: 10,
        doppelgangersFlagged: 0,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 2,
        avgTrustScore: 92,
        mfaEnrollment: "10 / 10",
        hardwareKeyAdoptionRate: "90%",
        staleCredentials: 0,
        quarantinedSessions: 0
      },
      "CASE-2026-005": {
        verifiedIdentities: 14,
        totalActiveAccounts: 15,
        doppelgangersFlagged: 1,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 1,
        avgTrustScore: 91,
        mfaEnrollment: "14 / 15",
        hardwareKeyAdoptionRate: "87%",
        staleCredentials: 1,
        quarantinedSessions: 0
      },
      "CASE-2026-006": {
        verifiedIdentities: 9,
        totalActiveAccounts: 10,
        doppelgangersFlagged: 0,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 1,
        avgTrustScore: 93,
        mfaEnrollment: "10 / 10",
        hardwareKeyAdoptionRate: "90%",
        staleCredentials: 0,
        quarantinedSessions: 0
      },
      "CASE-2026-007": {
        verifiedIdentities: 15,
        totalActiveAccounts: 16,
        doppelgangersFlagged: 1,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 2,
        avgTrustScore: 90,
        mfaEnrollment: "15 / 16",
        hardwareKeyAdoptionRate: "88%",
        staleCredentials: 1,
        quarantinedSessions: 0
      },
      "CASE-2026-008": {
        verifiedIdentities: 12,
        totalActiveAccounts: 14,
        doppelgangersFlagged: 1,
        hackedAccountsDetected: 1,
        behaviorAnomalies: 2,
        avgTrustScore: 86,
        mfaEnrollment: "13 / 14",
        hardwareKeyAdoptionRate: "85%",
        staleCredentials: 1,
        quarantinedSessions: 1
      },
      "CASE-2026-009": {
        verifiedIdentities: 12,
        totalActiveAccounts: 12,
        doppelgangersFlagged: 0,
        hackedAccountsDetected: 0,
        behaviorAnomalies: 1,
        avgTrustScore: 98,
        mfaEnrollment: "12 / 12",
        hardwareKeyAdoptionRate: "100%",
        staleCredentials: 0,
        quarantinedSessions: 0
      }
    };

    const targetStats = (caseId && caseStatsMap[caseId]) ? caseStatsMap[caseId] : {
      verifiedIdentities: 16,
      totalActiveAccounts: 18,
      doppelgangersFlagged: 1,
      hackedAccountsDetected: 1,
      behaviorAnomalies: 3,
      avgTrustScore: 92,
      mfaEnrollment: "17 / 18",
      hardwareKeyAdoptionRate: "89%",
      staleCredentials: 1,
      quarantinedSessions: 1
    };

    return {
      ...targetStats,
      lastAuditSync: new Date().toISOString()
    };
  }
}

export const identityService = new IdentityService();

// ─────────────────────────────────────────────────────────────────────────────
// Controller & Routes
// ─────────────────────────────────────────────────────────────────────────────

export class IdentityController {
  async handleListProfiles(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const data = await identityService.listProfiles(caseId);
      res.json(formatResponse(true, data, "Identity profiles retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetProfile(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = await identityService.getProfile(id);
      if (!data) {
        return res.status(404).json(formatResponse(false, null, undefined, "Identity profile not found"));
      }
      res.json(formatResponse(true, data, "Identity profile retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetTrail(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const category = req.query.category ? String(req.query.category) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const data = await identityService.getIdentityTrail(caseId, category, search);
      res.json(formatResponse(true, data, "Identity trail logs retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetWatchlist(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const data = await identityService.getWatchlist(caseId);
      res.json(formatResponse(true, data, "Doppelganger watchlist retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetHackedAlerts(_req: Request, res: Response) {
    try {
      const data = await identityService.getHackedAlerts();
      res.json(formatResponse(true, data, "Hacked accounts alert telemetry"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleVerify(req: Request, res: Response) {
    try {
      const officerId = req.body.officerId || "acp_raj_verma";
      const data = await identityService.verifyIdentity(officerId);
      res.json(formatResponse(true, data, "Identity verification completed"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleQuarantine(req: Request, res: Response) {
    try {
      const { profileId, reason } = req.body;
      const data = await identityService.quarantineSession(profileId || "insp_r_sharma", reason);
      res.json(formatResponse(true, data, "Session quarantined successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleEscalate(req: Request, res: Response) {
    try {
      const { profileId, notes } = req.body;
      const data = await identityService.escalateToSoc(profileId || "insp_r_sharma", notes);
      res.json(formatResponse(true, data, "Watchlist escalation sent to CSOC"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetStats(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const data = await identityService.getStats(caseId);
      res.json(formatResponse(true, data, "Identity security stats retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const identityController = new IdentityController();

export function identityRoutes(): Router {
  const router = Router();
  router.get("/profiles", (req, res) => identityController.handleListProfiles(req, res));
  router.get("/profiles/:id", (req, res) => identityController.handleGetProfile(req, res));
  router.get("/trail", (req, res) => identityController.handleGetTrail(req, res));
  router.get("/watchlist", (req, res) => identityController.handleGetWatchlist(req, res));
  router.get("/hacked-alerts", (req, res) => identityController.handleGetHackedAlerts(req, res));
  router.get("/stats", (req, res) => identityController.handleGetStats(req, res));
  router.post("/verify", (req, res) => identityController.handleVerify(req, res));
  router.post("/quarantine", (req, res) => identityController.handleQuarantine(req, res));
  router.post("/escalate", (req, res) => identityController.handleEscalate(req, res));
  return router;
}
