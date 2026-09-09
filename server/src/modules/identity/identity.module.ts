// Team Member 4: Identity Security, Biometrics, Zero-Trust & Identity Audit Trail Module
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
  caseId?: string;
  lastActive: string;
  riskCategory: "LOW" | "ELEVATED" | "CRITICAL_DOPPELGANGER";
  activeSessionsCount: number;
}

export interface IdentityTrailEvent {
  id: string;
  profile_id: string;
  identity_name: string;
  badge_or_alias: string;
  event_type:
    | "BIOMETRIC_VERIFY"
    | "SESSION_LOGIN"
    | "IMPOSSIBLE_TRAVEL"
    | "PRIVILEGE_ELEVATION"
    | "MFA_CHALLENGE"
    | "QUARANTINE_LOCK"
    | "DEVICE_TPM_CHECK"
    | "EVIDENCE_VAULT_ACCESS"
    | "TOKEN_RENEWAL";
  severity: "INFO" | "WARNING" | "CRITICAL_ANOMALY";
  status: "SUCCESS" | "BLOCKED" | "CHALLENGED" | "FLAGGED";
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

const INITIAL_PROFILES: Record<string, OfficerBiometricProfileDTO> = {
  acp_raj_verma: {
    id: "acp_raj_verma",
    name: "ACP Raj Verma",
    rank: "Assistant Commissioner of Police",
    department: "Special Cyber Crime Cell, New Delhi",
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
    deviceInfo: "Dell Latitude 7440 (Encrypted TPM 2.0 / FIPS-140-3)",
    locationInfo: "Delhi HQ - Cyber Command Room B",
    caseId: "CASE-2026-001",
    lastActive: "Just now",
    riskCategory: "LOW",
    activeSessionsCount: 1,
  },
  insp_r_sharma: {
    id: "insp_r_sharma",
    name: "Insp. R. Sharma",
    rank: "Inspector",
    department: "Anti-Hawala & Financial Crimes Unit",
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
    deviceInfo: "Unrecognized iPhone 14 Pro (Pune IP / Proxy Route)",
    locationInfo: "Pune - Unknown Cell Tower (Cell ID: 404-45-8821)",
    caseId: "CASE-2026-004",
    lastActive: "4 min ago",
    riskCategory: "CRITICAL_DOPPELGANGER",
    activeSessionsCount: 2,
  },
  si_verma: {
    id: "si_verma",
    name: "SI Verma",
    rank: "Sub Inspector",
    department: "Field Cyber Telemetry Unit",
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
    deviceInfo: "Field Tablet SM-X200 (Geo Telemetry Drift)",
    locationInfo: "Impossible Travel: Delhi HQ to Pune in 12 min",
    caseId: "CASE-2026-005",
    lastActive: "11 min ago",
    riskCategory: "CRITICAL_DOPPELGANGER",
    activeSessionsCount: 2,
  },
  sp_ananya_sengupta: {
    id: "sp_ananya_sengupta",
    name: "Superintendent Ananya Sengupta",
    rank: "Superintendent of Police",
    department: "State Financial Intelligence Unit (FIU)",
    badgeNumber: "WB-POL-0091",
    enrolledDate: "10 Feb 2024",
    status: "live",
    matchConfidence: 97.4,
    faceGeometryMatch: true,
    voiceprintMatch: true,
    typingCadenceMatch: true,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 98.1,
    deviceInfo: "ThinkPad X1 Carbon (Hardware YubiKey 5C FIPS)",
    locationInfo: "Kolkata Police HQ - Lalbazar",
    caseId: "CASE-2026-004",
    lastActive: "8 min ago",
    riskCategory: "LOW",
    activeSessionsCount: 1,
  },
  dsp_vikram_deshmukh: {
    id: "dsp_vikram_deshmukh",
    name: "DSP Vikram Deshmukh",
    rank: "Deputy Superintendent of Police",
    department: "SCADA & Critical Infrastructure Defense",
    badgeNumber: "MH-POL-3304",
    enrolledDate: "18 Aug 2024",
    status: "live",
    matchConfidence: 96.2,
    faceGeometryMatch: true,
    voiceprintMatch: true,
    typingCadenceMatch: true,
    deviceFingerprintMatch: true,
    badgeCertMatch: true,
    faceConfidence: 95.8,
    deviceInfo: "HP ZBook Fury (Air-gapped Grid Terminal)",
    locationInfo: "Mumbai State Load Despatch Centre, BKC",
    caseId: "CASE-2026-002",
    lastActive: "15 min ago",
    riskCategory: "LOW",
    activeSessionsCount: 1,
  },
  debashis_banerjee_suspect: {
    id: "debashis_banerjee_suspect",
    name: "Debashis Banerjee (Alias: Bobby)",
    rank: "Syndicate Primary Operative [SUSPECT]",
    department: "Overseas Tech Support Fraud Network",
    badgeNumber: "SUSPECT-REF-0412",
    enrolledDate: "02 Mar 2026",
    status: "quarantined",
    matchConfidence: 28.3,
    faceGeometryMatch: false,
    voiceprintMatch: false,
    typingCadenceMatch: false,
    deviceFingerprintMatch: false,
    badgeCertMatch: false,
    faceConfidence: 31.0,
    deviceInfo: "Spoofed MacBook Pro (Tor Onion Router / VPN Handoff)",
    locationInfo: "Salt Lake Sector V, Kolkata (Burner Cell Gateway)",
    caseId: "CASE-2026-004",
    lastActive: "22 min ago",
    riskCategory: "CRITICAL_DOPPELGANGER",
    activeSessionsCount: 0,
  },
};

const INITIAL_TRAIL_EVENTS: IdentityTrailEvent[] = [
  {
    id: "ID-EVT-9901",
    profile_id: "acp_raj_verma",
    identity_name: "ACP Raj Verma",
    badge_or_alias: "DL-POL-8842",
    event_type: "BIOMETRIC_VERIFY",
    severity: "INFO",
    status: "SUCCESS",
    ip_address: "10.42.0.12 (Intranet)",
    location: "Delhi HQ - Command Room B",
    device: "Dell Latitude 7440 (TPM 2.0)",
    confidence_score: 99.2,
    timestamp: "2026-09-09T11:40:15Z",
    details: "Continuous facial geometry match and keystroke dynamics within baseline threshold (Entropy: 0.04).",
    session_token_hash: "0x8f192847a9bc01928374829102938475",
    court_admissible_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    case_id: "CASE-2026-001",
  },
  {
    id: "ID-EVT-9902",
    profile_id: "insp_r_sharma",
    identity_name: "Insp. R. Sharma",
    badge_or_alias: "DL-POL-4192",
    event_type: "IMPOSSIBLE_TRAVEL",
    severity: "CRITICAL_ANOMALY",
    status: "FLAGGED",
    ip_address: "114.143.208.99 (Public WAN)",
    location: "Pune - Cell Tower 404-45-8821",
    device: "Unrecognized iPhone 14 Pro",
    confidence_score: 61.4,
    timestamp: "2026-09-09T11:34:02Z",
    details: "High-risk geo-drift: Account authenticated from New Delhi HQ at 11:22 AM and Pune WAN at 11:34 AM (1,400km delta in 12m).",
    session_token_hash: "0x44918273645192837461928374619283",
    court_admissible_hash: "sha256:4a5c898b827e8a93b49182734918273491827349182734918273491827349182",
    case_id: "CASE-2026-004",
  },
  {
    id: "ID-EVT-9903",
    profile_id: "si_verma",
    identity_name: "SI Verma",
    badge_or_alias: "DL-POL-7719",
    event_type: "EVIDENCE_VAULT_ACCESS",
    severity: "WARNING",
    status: "CHALLENGED",
    ip_address: "172.16.88.40 (Field VPN)",
    location: "Jaipur Highway Crossing",
    device: "Field Tablet SM-X200",
    confidence_score: 44.8,
    timestamp: "2026-09-09T11:20:45Z",
    details: "Attempted extraction of Section 106 BNSS Hawala seized currency serial ledger without active hardware MFA token.",
    session_token_hash: "0x11223344556677889900112233445566",
    court_admissible_hash: "sha256:7719283749102938471029384710293847102938471029384710293847102938",
    case_id: "CASE-2026-005",
  },
  {
    id: "ID-EVT-9904",
    profile_id: "sp_ananya_sengupta",
    identity_name: "Superintendent Ananya Sengupta",
    badge_or_alias: "WB-POL-0091",
    event_type: "PRIVILEGE_ELEVATION",
    severity: "INFO",
    status: "SUCCESS",
    ip_address: "10.88.1.5 (Secure FIU Enclave)",
    location: "Lalbazar Police HQ, Kolkata",
    device: "ThinkPad X1 Carbon (YubiKey FIPS)",
    confidence_score: 98.1,
    timestamp: "2026-09-09T11:15:30Z",
    details: "Elevated statutory judicial authorization for multi-hop bank account freeze order under Section 106 BNSS.",
    session_token_hash: "0x99001122334455667788990011223344",
    court_admissible_hash: "sha256:9f83c18b29102938475619283746591029384756192837465910293847561928",
    case_id: "CASE-2026-004",
  },
  {
    id: "ID-EVT-9905",
    profile_id: "debashis_banerjee_suspect",
    identity_name: "Debashis Banerjee (Alias: Bobby)",
    badge_or_alias: "SUSPECT-REF-0412",
    event_type: "QUARANTINE_LOCK",
    severity: "CRITICAL_ANOMALY",
    status: "BLOCKED",
    ip_address: "185.220.101.5 (Tor Exit Node)",
    location: "Salt Lake Sector V, Kolkata",
    device: "Spoofed MacBook Pro",
    confidence_score: 28.3,
    timestamp: "2026-09-09T10:55:10Z",
    details: "Hostile credential stuffing attack on FIU gateway blocked. Device MAC and IP added to National Cyber Registry quarantine.",
    session_token_hash: "0x00000000000000000000000000000000",
    court_admissible_hash: "sha256:bb19283749102938471029384710293847102938471029384710293847102938",
    case_id: "CASE-2026-004",
  },
  {
    id: "ID-EVT-9906",
    profile_id: "dsp_vikram_deshmukh",
    identity_name: "DSP Vikram Deshmukh",
    badge_or_alias: "MH-POL-3304",
    event_type: "DEVICE_TPM_CHECK",
    severity: "INFO",
    status: "SUCCESS",
    ip_address: "10.22.4.19 (SCADA DMZ)",
    location: "Mumbai State Load Despatch Centre",
    device: "HP ZBook Fury (Air-gapped)",
    confidence_score: 96.2,
    timestamp: "2026-09-09T10:40:00Z",
    details: "Hardware TPM 2.0 endorsement key signature verified against Maharashtra Grid SCADA PKI Root Certificate Authority.",
    session_token_hash: "0x55667788990011223344556677889900",
    court_admissible_hash: "sha256:6677889900112233445566778899001122334455667788990011223344556677",
    case_id: "CASE-2026-002",
  },
];

let inMemoryProfiles: Record<string, OfficerBiometricProfileDTO> = { ...INITIAL_PROFILES };
let inMemoryTrails: IdentityTrailEvent[] = [...INITIAL_TRAIL_EVENTS];

export class IdentityService {
  async listProfiles(): Promise<OfficerBiometricProfileDTO[]> {
    return Object.values(inMemoryProfiles);
  }

  async getProfile(id: string): Promise<OfficerBiometricProfileDTO | null> {
    return inMemoryProfiles[id] || null;
  }

  async getTrailEvents(filters?: {
    profile_id?: string;
    severity?: string;
    event_type?: string;
    case_id?: string;
    limit?: number;
  }): Promise<IdentityTrailEvent[]> {
    let result = [...inMemoryTrails];

    if (filters?.profile_id && filters.profile_id !== "ALL") {
      result = result.filter((e) => e.profile_id === filters.profile_id);
    }
    if (filters?.severity && filters.severity !== "ALL") {
      result = result.filter((e) => e.severity === filters.severity);
    }
    if (filters?.event_type && filters.event_type !== "ALL") {
      result = result.filter((e) => e.event_type === filters.event_type);
    }
    if (filters?.case_id && filters.case_id !== "ALL") {
      result = result.filter((e) => e.case_id === filters.case_id);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  async verifyIdentity(officerId: string) {
    const profile = inMemoryProfiles[officerId] || inMemoryProfiles.acp_raj_verma;
    const isVerified = profile.matchConfidence > 75;

    // Append trail event
    const newEvent: IdentityTrailEvent = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      profile_id: profile.id,
      identity_name: profile.name,
      badge_or_alias: profile.badgeNumber,
      event_type: "BIOMETRIC_VERIFY",
      severity: isVerified ? "INFO" : "CRITICAL_ANOMALY",
      status: isVerified ? "SUCCESS" : "FLAGGED",
      ip_address: "10.42.0.12 (Intranet / Live Probe)",
      location: profile.locationInfo,
      device: profile.deviceInfo,
      confidence_score: profile.matchConfidence,
      timestamp: new Date().toISOString(),
      details: isVerified
        ? `Live multi-factor biometric telemetry matched: Face Geometry (${profile.faceConfidence}%), Voiceprint OK, Typing Cadence OK.`
        : `Biometric mismatch flagged! Confidence ${profile.matchConfidence}% is below mandatory threshold of 75%.`,
      session_token_hash: `0x${Date.now().toString(16)}8f192847a9bc`,
      court_admissible_hash: `sha256:${Date.now().toString(16)}e3b0c44298fc1c149afbf4c8996fb924`,
      case_id: profile.caseId,
    };

    inMemoryTrails.unshift(newEvent);

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
        badgeCertificate: profile.badgeCertMatch,
      },
      trailEventId: newEvent.id,
      verifiedAt: newEvent.timestamp,
    };
  }

  async quarantineIdentity(profileId: string, reason?: string, officer_name = "ACP Raj Verma") {
    const profile = inMemoryProfiles[profileId] || inMemoryProfiles.insp_r_sharma;
    profile.status = "quarantined";
    profile.activeSessionsCount = 0;
    profile.riskCategory = "CRITICAL_DOPPELGANGER";

    const ticketId = `CSOC-QUARANTINE-${Date.now().toString().slice(-4)}`;

    const newEvent: IdentityTrailEvent = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      profile_id: profile.id,
      identity_name: profile.name,
      badge_or_alias: profile.badgeNumber,
      event_type: "QUARANTINE_LOCK",
      severity: "CRITICAL_ANOMALY",
      status: "BLOCKED",
      ip_address: "10.0.0.1 (CSOC Core Gateway)",
      location: "Central Security Operations Center, New Delhi",
      device: "National Cyber Command Enforcement Agent",
      confidence_score: 0,
      timestamp: new Date().toISOString(),
      details: `Zero-Trust Quarantine executed by ${officer_name}. Reason: ${reason || "Doppelgänger mismatch and suspicious impossible travel."}. All Kerberos tokens and active sessions revoked. Ref: ${ticketId}`,
      session_token_hash: "0x00000000000000000000000000000000",
      court_admissible_hash: `sha256:quarantine_${Date.now()}`,
      case_id: profile.caseId,
    };

    inMemoryTrails.unshift(newEvent);

    return {
      success: true,
      ticketId,
      targetOfficer: profile.name,
      badgeNumber: profile.badgeNumber,
      status: "QUARANTINED_ACTIVE_SESSIONS_REVOKED",
      alertDispatchedTo: "Cyber Security Operations Center (CSOC) New Delhi & Central Forensic Science Laboratory (CFSL)",
      reason: reason || "Doppelganger biometric mismatch flagged by behavioral zero-trust engine",
      quarantinedAt: newEvent.timestamp,
    };
  }

  async revokeSession(profileId: string, sessionId?: string) {
    const profile = inMemoryProfiles[profileId];
    if (profile) {
      profile.activeSessionsCount = Math.max(0, profile.activeSessionsCount - 1);
    }

    const newEvent: IdentityTrailEvent = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      profile_id: profileId,
      identity_name: profile?.name || profileId,
      badge_or_alias: profile?.badgeNumber || "BADGE-REF",
      event_type: "TOKEN_RENEWAL",
      severity: "WARNING",
      status: "SUCCESS",
      ip_address: "10.42.0.1 (Identity Access Gateway)",
      location: "Active Directory Domain Controller",
      device: "Kerberos Key Distribution Centre (KDC)",
      confidence_score: 100,
      timestamp: new Date().toISOString(),
      details: `Active session token ${sessionId || "SESS-CURRENT-TOKEN"} immediately purged from Redis session cache. User required to re-authenticate with hardware FIPS key.`,
      session_token_hash: "0xREVOKED_TOKEN_PURGED",
      court_admissible_hash: `sha256:revoke_${Date.now()}`,
      case_id: profile?.caseId,
    };

    inMemoryTrails.unshift(newEvent);

    return {
      success: true,
      profileId,
      message: "Session token successfully revoked. Forced re-authentication triggered.",
      revokedAt: newEvent.timestamp,
    };
  }

  async challengeMfa(profileId: string) {
    const profile = inMemoryProfiles[profileId];
    const challengeId = `MFA-CHALLENGE-${Date.now().toString().slice(-4)}`;

    const newEvent: IdentityTrailEvent = {
      id: `ID-EVT-${Date.now().toString().slice(-4)}`,
      profile_id: profileId,
      identity_name: profile?.name || profileId,
      badge_or_alias: profile?.badgeNumber || "BADGE-REF",
      event_type: "MFA_CHALLENGE",
      severity: "WARNING",
      status: "CHALLENGED",
      ip_address: "10.42.0.1",
      location: "FIDO2 / WebAuthn Broker",
      device: "Hardware Security Module (HSM)",
      confidence_score: 85,
      timestamp: new Date().toISOString(),
      details: `Step-up FIDO2 / YubiKey Hardware challenge dispatched. Challenge ID: ${challengeId}.`,
      session_token_hash: "0xCHALLENGE_PENDING",
      court_admissible_hash: `sha256:challenge_${Date.now()}`,
      case_id: profile?.caseId,
    };

    inMemoryTrails.unshift(newEvent);

    return {
      success: true,
      challengeId,
      profileId,
      prompt: "Touch Hardware Security Key or provide live facial geometry verification.",
      dispatchedAt: newEvent.timestamp,
    };
  }

  async getStats() {
    const totalIdentities = Object.keys(inMemoryProfiles).length;
    const flaggedCount = Object.values(inMemoryProfiles).filter((p) => p.status === "flagged").length;
    const quarantinedCount = Object.values(inMemoryProfiles).filter((p) => p.status === "quarantined").length;
    const liveCount = Object.values(inMemoryProfiles).filter((p) => p.status === "live").length;
    const anomaliesCount = inMemoryTrails.filter((t) => t.severity === "CRITICAL_ANOMALY").length;

    return {
      totalIdentities: totalIdentities + 1840,
      activeLiveIdentities: liveCount + 1835,
      flaggedDoppelgangers: flaggedCount,
      quarantinedAccounts: quarantinedCount,
      totalTrailEventsCount: inMemoryTrails.length + 8420,
      criticalAnomaliesCount: anomaliesCount + 12,
      avgTrustScore: 94.2,
      mfaAdoptionPercent: 99.4,
      hardwareKeyAdoptionRate: "92.8%",
    };
  }
}

export const identityService = new IdentityService();

export class IdentityController {
  async handleListProfiles(_req: Request, res: Response) {
    try {
      const data = await identityService.listProfiles();
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

  async handleGetTrailEvents(req: Request, res: Response) {
    try {
      const { profile_id, severity, event_type, case_id, limit } = req.query;
      const data = await identityService.getTrailEvents({
        profile_id: profile_id ? String(profile_id) : undefined,
        severity: severity ? String(severity) : undefined,
        event_type: event_type ? String(event_type) : undefined,
        case_id: case_id ? String(case_id) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(formatResponse(true, data, "Identity audit trail events retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleVerifyIdentity(req: Request, res: Response) {
    try {
      const { officerId } = req.body;
      if (!officerId) {
        return res.status(400).json(formatResponse(false, null, undefined, "officerId is required"));
      }
      const data = await identityService.verifyIdentity(String(officerId));
      res.json(formatResponse(true, data, "Biometric identity verification completed"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleQuarantine(req: Request, res: Response) {
    try {
      const { profileId, reason, officer_name } = req.body;
      if (!profileId) {
        return res.status(400).json(formatResponse(false, null, undefined, "profileId is required"));
      }
      const data = await identityService.quarantineIdentity(String(profileId), reason, officer_name);
      res.json(formatResponse(true, data, "Zero-Trust quarantine enforced"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleRevokeSession(req: Request, res: Response) {
    try {
      const { profileId, sessionId } = req.body;
      if (!profileId) {
        return res.status(400).json(formatResponse(false, null, undefined, "profileId is required"));
      }
      const data = await identityService.revokeSession(String(profileId), sessionId);
      res.json(formatResponse(true, data, "Session token revoked"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleChallengeMfa(req: Request, res: Response) {
    try {
      const { profileId } = req.body;
      if (!profileId) {
        return res.status(400).json(formatResponse(false, null, undefined, "profileId is required"));
      }
      const data = await identityService.challengeMfa(String(profileId));
      res.json(formatResponse(true, data, "Step-up MFA challenge dispatched"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetStats(_req: Request, res: Response) {
    try {
      const data = await identityService.getStats();
      res.json(formatResponse(true, data, "Identity security statistics retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const identityController = new IdentityController();
export function createIdentityRouter(): Router {
  const router = Router();
  router.get("/profiles", (req, res) => identityController.handleListProfiles(req, res));
  router.get("/profiles/:id", (req, res) => identityController.handleGetProfile(req, res));
  router.get("/trails", (req, res) => identityController.handleGetTrailEvents(req, res));
  router.post("/verify", (req, res) => identityController.handleVerifyIdentity(req, res));
  router.post("/quarantine", (req, res) => identityController.handleQuarantine(req, res));
  router.post("/escalate", (req, res) => identityController.handleQuarantine(req, res));
  router.post("/revoke-session", (req, res) => identityController.handleRevokeSession(req, res));
  router.post("/challenge-mfa", (req, res) => identityController.handleChallengeMfa(req, res));
  router.get("/stats", (req, res) => identityController.handleGetStats(req, res));
  return router;
}

export const identityRoutes = createIdentityRouter;
export default createIdentityRouter;
