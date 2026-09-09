// Identity Security, Biometrics, Doppelganger Detection & Identity Trail Module
import { Router, Request, Response } from "express";
import { formatResponse } from "../../utils/api-response";

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
}

export interface IdentityTrailEventDTO {
  id: string;
  timestamp: string;
  timeAgo: string;
  officerName: string;
  badgeNumber: string;
  action: string;
  category: "BIOMETRIC_PASS" | "IMPOSSIBLE_TRAVEL" | "FAILED_CHALLENGE" | "SESSION_HIJACK" | "QUARANTINE_ENFORCED" | "CREDENTIAL_REFRESH";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  status: "VERIFIED" | "FLAGGED" | "BLOCKED" | "QUARANTINED";
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

export interface DoppelgangerWatchlistItemDTO {
  id: string;
  profileId: string;
  officerName: string;
  badgeNumber: string;
  flagReason: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  flaggedAt: string;
  timeAgo: string;
  anomalyType: "VOICE_DRIFT" | "IMPOSSIBLE_TRAVEL" | "KEYBOARD_CADENCE" | "UNAUTHORIZED_DEVICE" | "CLONED_SESSION";
  deviceInfo: string;
  location: string;
  status: "ACTIVE_ALERT" | "QUARANTINED" | "INVESTIGATING";
  confidenceMatch: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory Realistic Datasets for Identity Security
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
    assignedCaseId: "CASE-2026-001"
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
    assignedCaseId: "CASE-2026-004"
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
    assignedCaseId: "CASE-2026-008"
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
    assignedCaseId: "CASE-2026-004"
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
    assignedCaseId: "CASE-2026-005"
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
    assignedCaseId: "CASE-2026-006"
  }
};

const DEFAULT_TRAIL: IdentityTrailEventDTO[] = [
  {
    id: "ID-EVT-901",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: "2m ago",
    officerName: "ACP Raj Verma",
    badgeNumber: "DL-POL-8842",
    action: "Continuous Zero-Trust Biometric Challenge Passed",
    category: "BIOMETRIC_PASS",
    severity: "INFO",
    status: "VERIFIED",
    caseId: "CASE-2026-001",
    deviceInfo: "Dell Latitude 7440 (TPM 2.0)",
    ipAddress: "10.14.22.84",
    location: "Delhi HQ - Command Room B",
    confidenceScore: 98.6,
    hashSha256: "8e9f214c7719a8bc441029384710293847102938471029384710293847102938",
    details: "All 5 zero-knowledge biometrics (Face 3D topology, voice harmonics, typing cadence, device cert, geo-BSSID) validated seamlessly.",
    rawTelemetry: {
      faceScore: 99.2,
      typingCadenceDeviation: 1.2,
      geoDriftKm: 0.05
    }
  },
  {
    id: "ID-EVT-902",
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    timeAgo: "6m ago",
    officerName: "Insp. R. Sharma",
    badgeNumber: "DL-POL-4192",
    action: "Doppelganger Alert: Face Geometry & Voiceprint Mismatch on Unrecognized Device",
    category: "SESSION_HIJACK",
    severity: "CRITICAL",
    status: "FLAGGED",
    caseId: "CASE-2026-004",
    deviceInfo: "Apple iPhone 14 Pro (Unenrolled UDID)",
    ipAddress: "152.57.19.202",
    location: "Pune - Cell Tower Sector 12",
    confidenceScore: 61.4,
    hashSha256: "11a098bc44910293847102938471029384710293847102938471029384710293",
    details: "Session opened with legitimate smart-card token but facial recognition scored only 61.0%. Voice harmonics failed anti-spoofing synthesis check.",
    rawTelemetry: {
      faceScore: 61.0,
      voiceDriftPercent: 44.5,
      geoDriftKm: 1180.0
    }
  },
  {
    id: "ID-EVT-903",
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timeAgo: "14m ago",
    officerName: "SI Verma",
    badgeNumber: "DL-POL-7719",
    action: "Impossible Travel Telemetry Detected: 1,180 km in 12 minutes",
    category: "IMPOSSIBLE_TRAVEL",
    severity: "CRITICAL",
    status: "FLAGGED",
    caseId: "CASE-2026-008",
    deviceInfo: "Samsung Galaxy Tab SM-X200",
    ipAddress: "49.204.112.5",
    location: "Pune Cyber Cell Base vs Delhi HQ",
    confidenceScore: 44.8,
    hashSha256: "33fe441029384710293847102938471029384710293847102938471029384710",
    details: "Previous authentication at 11:20 AM from Delhi HQ (IP: 10.14.22.10). Next session attempt at 11:32 AM from Pune IP requiring 5,900 km/h flight velocity.",
    rawTelemetry: {
      geoDriftKm: 1180.0,
      speedKmph: 5900.0,
      faceScore: 88.4
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
    hashSha256: "77aa119283746192837461928374619283746192837461928374619283746192",
    details: "Audio challenge response displayed unnatural pitch quantization consistent with AI voice cloning software. Forced fallback to hardware token.",
    rawTelemetry: {
      voiceDriftPercent: 22.4,
      faceScore: 94.0
    }
  },
  {
    id: "ID-EVT-905",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timeAgo: "35m ago",
    officerName: "Superintendent Ananya Sengupta",
    badgeNumber: "WB-POL-1002",
    action: "Hardware FIDO2 X.509 Cryptographic Certificate Re-validation",
    category: "CREDENTIAL_REFRESH",
    severity: "LOW",
    status: "VERIFIED",
    caseId: "CASE-2026-004",
    deviceInfo: "HP Elite Dragonfly G4 (Gov PKI HSM)",
    ipAddress: "10.22.4.15",
    location: "Lalbazar Cyber HQ, Kolkata",
    confidenceScore: 99.4,
    hashSha256: "99bb881029384710293847102938471029384710293847102938471029384710",
    details: "Government Hardware Security Module (HSM) key pair validated with National Police PKI Root CA. Zero anomalies detected.",
    rawTelemetry: {
      faceScore: 99.6,
      typingCadenceDeviation: 0.8
    }
  },
  {
    id: "ID-EVT-906",
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timeAgo: "50m ago",
    officerName: "HC Yadav",
    badgeNumber: "DL-POL-3312",
    action: "Typing Cadence Deviation: Flight Time & Dwell Time Anomaly",
    category: "FAILED_CHALLENGE",
    severity: "MEDIUM",
    status: "VERIFIED",
    caseId: "CASE-2026-006",
    deviceInfo: "Evidence Terminal T-09",
    ipAddress: "10.14.22.104",
    location: "Delhi HQ - Evidence Vault",
    confidenceScore: 89.0,
    hashSha256: "44cc551029384710293847102938471029384710293847102938471029384710",
    details: "Typing rhythm variance of 28% from enrolled baseline. Re-authenticated with biometric fingerprint scanner.",
    rawTelemetry: {
      typingCadenceDeviation: 28.0,
      faceScore: 92.5
    }
  }
];

const DEFAULT_WATCHLIST: DoppelgangerWatchlistItemDTO[] = [
  {
    id: "WL-001",
    profileId: "insp_r_sharma",
    officerName: "Insp. R. Sharma",
    badgeNumber: "DL-POL-4192",
    flagReason: "Unenrolled iPhone 14 Pro logged in from Pune while primary terminal active in Delhi HQ.",
    severity: "CRITICAL",
    flaggedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    timeAgo: "6m ago",
    anomalyType: "CLONED_SESSION",
    deviceInfo: "iPhone 14 Pro (Pune IP)",
    location: "Pune - Cell Tower Sector 12",
    status: "ACTIVE_ALERT",
    confidenceMatch: 61.4
  },
  {
    id: "WL-002",
    profileId: "si_verma",
    officerName: "SI Verma",
    badgeNumber: "DL-POL-7719",
    flagReason: "Impossible travel alert: Delhi HQ to Pune (1,180 km) in 12 minutes.",
    severity: "CRITICAL",
    flaggedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timeAgo: "14m ago",
    anomalyType: "IMPOSSIBLE_TRAVEL",
    deviceInfo: "Samsung Tab SM-X200",
    location: "Pune vs Delhi",
    status: "ACTIVE_ALERT",
    confidenceMatch: 44.8
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
    confidenceMatch: 68.2
  },
  {
    id: "WL-004",
    profileId: "hc_yadav",
    officerName: "HC Yadav",
    badgeNumber: "DL-POL-3312",
    flagReason: "Keyboard cadence variance of 28% outside nominal typing envelope.",
    severity: "MEDIUM",
    flaggedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timeAgo: "50m ago",
    anomalyType: "KEYBOARD_CADENCE",
    deviceInfo: "Evidence Terminal T-09",
    location: "Delhi HQ - Evidence Vault",
    status: "INVESTIGATING",
    confidenceMatch: 89.0
  }
];

let inMemoryProfiles = { ...DEFAULT_PROFILES };
let inMemoryTrail = [...DEFAULT_TRAIL];
let inMemoryWatchlist = [...DEFAULT_WATCHLIST];

// ─────────────────────────────────────────────────────────────────────────────
// Service Class
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

  async verifyIdentity(officerId: string) {
    const profile = inMemoryProfiles[officerId] || inMemoryProfiles.acp_raj_verma;
    const isVerified = profile.matchConfidence > 75;

    // Log this verification into the identity trail
    const newEvent: IdentityTrailEventDTO = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: isVerified
        ? "Live Zero-Knowledge Biometric Session Challenge Succeeded"
        : "Live Biometric Challenge Failed: Biometric Drift Detected",
      category: isVerified ? "BIOMETRIC_PASS" : "FAILED_CHALLENGE",
      severity: isVerified ? "INFO" : "HIGH",
      status: isVerified ? "VERIFIED" : "FLAGGED",
      caseId: profile.assignedCaseId || "CASE-2026-001",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: profile.matchConfidence,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: isVerified
        ? `Continuous verification validated face (${profile.faceConfidence}%), voiceprint, typing cadence, and hardware TPM certificates.`
        : `Biometric matching confidence dropped to ${profile.matchConfidence}%. Session placed under heightened scrutiny.`,
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

    // Update watchlist item if exists
    const watchItem = inMemoryWatchlist.find((w) => w.profileId === profileId);
    if (watchItem) {
      watchItem.status = "QUARANTINED";
    }

    // Log quarantine event
    const newEvent: IdentityTrailEventDTO = {
      id: `ID-EVT-Q-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: "Emergency Officer Session Quarantine & Token Invalidation Enforced",
      category: "QUARANTINE_ENFORCED",
      severity: "CRITICAL",
      status: "QUARANTINED",
      caseId: profile.assignedCaseId || "CASE-2026-004",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: 0.0,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: reason || `Officer session ${profile.badgeNumber} forcibly terminated and revoked by Security Operations Desk.`
    };

    inMemoryTrail.unshift(newEvent);

    return {
      success: true,
      quarantineId: `QUARANTINE-REF-${Date.now().toString().slice(-6)}`,
      targetOfficer: profile.name,
      badgeNumber: profile.badgeNumber,
      status: "QUARANTINED",
      revocationTime: new Date().toISOString(),
      reason: reason || "Doppelganger biometric mismatch"
    };
  }

  async escalateToSoc(profileId: string, notes?: string) {
    const profile = inMemoryProfiles[profileId] || inMemoryProfiles.insp_r_sharma;
    profile.status = "quarantined";

    const ticketId = `CSOC-INC-${Date.now().toString().slice(-6)}`;

    // Add high severity trail event
    inMemoryTrail.unshift({
      id: `ID-EVT-ESC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      officerName: profile.name,
      badgeNumber: profile.badgeNumber,
      action: `Escalated to CSOC & CERT-In: Incident Ticket #${ticketId}`,
      category: "SESSION_HIJACK",
      severity: "CRITICAL",
      status: "FLAGGED",
      caseId: profile.assignedCaseId || "CASE-2026-001",
      deviceInfo: profile.deviceInfo,
      ipAddress: profile.ipAddress,
      location: profile.locationInfo,
      confidenceScore: profile.matchConfidence,
      hashSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      details: notes || `Doppelganger alert escalated to Cyber Security Operations Center for emergency hardware revocation and forensic imaging.`
    });

    return {
      success: true,
      escalationTicket: ticketId,
      targetOfficer: profile.name,
      badgeNumber: profile.badgeNumber,
      status: "QUARANTINED_PENDING_FORENSIC_REVIEW",
      alertDispatchedTo: "Cyber Security Operations Center (CSOC) New Delhi & CERT-In",
      notes: notes || "Doppelganger biometric mismatch flagged by behavioral zero-trust engine",
      escalatedAt: new Date().toISOString()
    };
  }

  async getStats(caseId?: string) {
    return {
      verifiedIdentities: 1842,
      totalActiveAccounts: 1847,
      doppelgangersFlagged: inMemoryWatchlist.filter((w) => w.status === "ACTIVE_ALERT").length || 5,
      behaviorAnomalies: 14,
      avgTrustScore: 91,
      mfaEnrollment: "1,839 / 1,847",
      hardwareKeyAdoptionRate: "78%",
      quarantinedSessions: Object.values(inMemoryProfiles).filter((p) => p.status === "quarantined").length,
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
  router.get("/stats", (req, res) => identityController.handleGetStats(req, res));
  router.post("/verify", (req, res) => identityController.handleVerify(req, res));
  router.post("/quarantine", (req, res) => identityController.handleQuarantine(req, res));
  router.post("/escalate", (req, res) => identityController.handleEscalate(req, res));
  return router;
}
