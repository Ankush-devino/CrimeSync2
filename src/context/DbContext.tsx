import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getOfficerAvatar } from '../utils/avatarUtils';

// ============================================================================
// SIMULATED DATABASE SCHEMAS & TYPES
// ============================================================================

export interface DbUser {
  id: string;
  badgeNumber: string;
  name: string;
  email: string;
  role: 'LEAD_INVESTIGATOR' | 'CYBER_ANALYST' | 'FORENSIC_OFFICER' | 'ADMIN';
  department: string;
  city: string;
  phone: string;
  baselineDevice: string;
  baselineBrowser: string;
  baselineSchedule: string;
  avatar?: string;
}

export interface DbCase {
  id: string;
  firNumber: string;
  title: string;
  category: 'NARCOTICS' | 'CYBER_CRIME' | 'FINANCIAL_FRAUD' | 'EXTORTION' | 'ORGANIZED_CRIME';
  status: 'ACTIVE' | 'UNDER_ANALYSIS' | 'CHARGE_SHEET_FILED' | 'CLOSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedOfficerId: string;
  leadSuspect: string;
  evidenceCount: number;
  tags: string[];
  description: string;
  createdDate: string;
}

export interface DbEvidence {
  id: string;
  caseId: string;
  title: string;
  type: 'MOBILE_FORENSICS' | 'BANK_RECORD' | 'CALL_RECORDS_CDR' | 'CCTV_FOOTAGE' | 'BLOCKCHAIN_HASH' | 'HONEY_DECOY';
  sha256: string;
  classification: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'DECOY_HONEYPOT';
  isHoneyDecoy: boolean;
  collectedDate: string;
  sizeBytes: number;
  description: string;
  chainOfCustodyCount: number;
}

export interface DbAuditLog {
  id: string;
  eventId: string;
  timestamp: string; // ISO string
  displayTime: string; // HH:MM:SS IST
  timeOffset: string; // relative offset
  userId: string;
  userName: string;
  action: 'CASE_OPEN' | 'EVIDENCE_VIEW' | 'FILE_DOWNLOAD' | 'REPORT_EXPORT' | 'BLOCKCHAIN_WRITE' | 'AI_QUERY' | 'TAB_SWITCH' | 'SECURITY_CONTAINMENT' | 'LOGIN';
  module: string;
  category: 'EVIDENCE' | 'CASES' | 'REPORT' | 'SECURITY' | 'BLOCKCHAIN' | 'AI' | 'AUTH' | 'NAVIGATION';
  targetId?: string;
  payload: Record<string, any>;
  ipAddress: string;
  location: string;
  device: string;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL' | 'CONTAINED';
  verdict: string;
  threatPenalty: number;
  sha256: string;
  isSimulatedBot?: boolean;
}

export interface DbAdaptivePermissions {
  canExport: boolean;
  canWriteBlockchain: boolean;
  canDownloadCDR: boolean;
  canGenerateAI: boolean;
  isReadOnly: boolean;
  containmentMode: 'NOMINAL' | 'MONITORED_DRIFT' | 'RESTRICTED_CONTAINMENT' | 'ISOLATED_QUARANTINE';
}

export interface DbSessionState {
  trustScore: number;
  activeUserId: string;
  activeCaseId: string;
  permissions: DbAdaptivePermissions;
  activeAnomalies: Array<{
    id: string;
    type: 'RAPID_EVIDENCE_ACCESS' | 'HONEY_DECOY_SPRUNG' | 'RAPID_CASE_TRAVERSAL' | 'CIRCADIAN_DRIFT' | 'GEO_TOR_EGRESS';
    penalty: number;
    description: string;
    timestamp: string;
  }>;
  simulationActive: boolean;
}

// ============================================================================
// INITIAL SEEDED DATA (SIMULATED POSTGRESQL TABLES)
// ============================================================================

export const SEEDED_USERS: DbUser[] = [
  {
    id: 'USR-101',
    badgeNumber: 'DEL-IPS-8821',
    name: 'ACP Rajeshwar Sharma',
    email: 'rajesh.sharma@delhipolice.gov.in',
    role: 'LEAD_INVESTIGATOR',
    department: 'Special Cell / Cyber Crime Unit',
    city: 'New Delhi',
    phone: '+91-9810112233',
    baselineDevice: 'Dell Latitude 7440 (Asset #NCRB-DL-9821)',
    baselineBrowser: 'Chrome Enterprise v128',
    baselineSchedule: '09:00 AM - 06:30 PM IST (Mon-Fri)',
    avatar: getOfficerAvatar('DEL-IPS-8821', 'ACP Rajeshwar Sharma'),
  },
  {
    id: 'USR-102',
    badgeNumber: 'DEL-INSP-4491',
    name: 'Inspector Priya Singh',
    email: 'priya.singh@delhipolice.gov.in',
    role: 'CYBER_ANALYST',
    department: 'Digital Forensics Division',
    city: 'New Delhi',
    phone: '+91-9822334455',
    baselineDevice: 'Lenovo ThinkPad P16',
    baselineBrowser: 'Firefox Enterprise 129',
    baselineSchedule: '10:00 AM - 07:00 PM IST',
    avatar: getOfficerAvatar('DEL-INSP-4491', 'Inspector Priya Singh'),
  }
];

export const SEEDED_CASES: DbCase[] = [
  {
    id: 'CR-2026-0417',
    firNumber: 'FIR-2026-0881',
    title: 'South Delhi Hawala & Cross-Border Money Laundering Syndicate',
    category: 'FINANCIAL_FRAUD',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    assignedOfficerId: 'USR-101',
    leadSuspect: 'Vikram Malhotra & Hawala Hubs',
    evidenceCount: 14,
    tags: ['Hawala', 'Shell Corp', 'Swiss Wiretap', 'Crypto Mixer'],
    description: 'Investigation into unauthorized international banking wire transfers routed via UAE shell entities into Indian real estate investments.',
    createdDate: '2026-08-14',
  },
  {
    id: 'CR-2026-0152',
    firNumber: 'FIR-2026-0152',
    title: 'NCR Narcotics Distribution Network & Darknet Logistics',
    category: 'NARCOTICS',
    status: 'UNDER_ANALYSIS',
    priority: 'HIGH',
    assignedOfficerId: 'USR-101',
    leadSuspect: 'Tariq "Guns" Merchant',
    evidenceCount: 9,
    tags: ['Darknet', 'Courier Intercept', 'Cryptocurrency'],
    description: 'Multi-state synthetic opioid courier network utilizing encrypted messaging and burner mobile numbers.',
    createdDate: '2026-08-19',
  },
  {
    id: 'CR-2026-0881',
    firNumber: 'FIR-2026-0881',
    title: 'Critical Cyber Extortion & Ransomware Breach on Municipal Infrastructure',
    category: 'CYBER_CRIME',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    assignedOfficerId: 'USR-101',
    leadSuspect: 'ShadowHydra Threat Group',
    evidenceCount: 22,
    tags: ['Ransomware', 'SCADA Pivot', 'IP Telemetry'],
    description: 'Targeted malware intrusion attempting command injection into municipal power distribution SCADA relay units.',
    createdDate: '2026-08-25',
  },
  {
    id: 'CR-2026-0922',
    firNumber: 'FIR-2026-0922',
    title: 'Simulated Threat Probe (General Intelligence Repository)',
    category: 'ORGANIZED_CRIME',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    assignedOfficerId: 'USR-101',
    leadSuspect: 'Unknown Threat Actor',
    evidenceCount: 11,
    tags: ['Telecommunication', 'CDR Dump', 'Tower Triangulation'],
    description: 'Central intelligence repository cross-referencing cell tower handoff triangulation data.',
    createdDate: '2026-09-01',
  }
];

export const SEEDED_EVIDENCE: DbEvidence[] = [
  {
    id: 'EV-1246',
    caseId: 'CR-2026-0417',
    title: 'Encrypted WhatsApp & Telegram Chat Export (OnePlus 12)',
    type: 'MOBILE_FORENSICS',
    sha256: '9f83c18b29f04128a1768c8192a0149bb892c340192841029384810293847102',
    classification: 'CONFIDENTIAL',
    isHoneyDecoy: false,
    collectedDate: '2026-08-27',
    sizeBytes: 48920112,
    description: 'Recovered SQLite database containing encrypted conversations detailing transaction delivery points.',
    chainOfCustodyCount: 6,
  },
  {
    id: 'EV-501',
    caseId: 'CR-2026-0417',
    title: 'Offshore Shell Company Corporate Registry & Bank Ledger',
    type: 'BANK_RECORD',
    sha256: 'a4b8210c92109848102938481029384710293848102938481029384810293848',
    classification: 'SECRET',
    isHoneyDecoy: false,
    collectedDate: '2026-08-28',
    sizeBytes: 1249012,
    description: 'Financial forensic audit sheets linking shell entity Apex Global Holdings to Zurich escrow bank accounts.',
    chainOfCustodyCount: 4,
  },
  {
    id: 'EV-882',
    caseId: 'CR-2026-0417',
    title: 'Triangulated Satellite Cell Tower CDR Log (Nehru Place)',
    type: 'CALL_RECORDS_CDR',
    sha256: 'bc71902410293848102938481029384710293848102938481029384810293848',
    classification: 'CONFIDENTIAL',
    isHoneyDecoy: false,
    collectedDate: '2026-08-29',
    sizeBytes: 8129031,
    description: '45,000 tower handoff telemetric rows pinpointing burner phone interactions.',
    chainOfCustodyCount: 3,
  },
  {
    id: 'EV-9999',
    caseId: 'CR-2026-0417',
    title: '🚨 HONEY DECOY: Swiss Secret Banking Hawala Ledger & Wiretap Dump',
    type: 'HONEY_DECOY',
    sha256: 'e108cb9277665544332211ff9988776655443322110099887766554433221100',
    classification: 'DECOY_HONEYPOT',
    isHoneyDecoy: true,
    collectedDate: '2026-09-02',
    sizeBytes: 1048576,
    description: 'Planted canary honeypot artifact to catch unauthorized rogue account takeover scraping.',
    chainOfCustodyCount: 1,
  },
  {
    id: 'EV-308',
    caseId: 'CR-2026-0152',
    title: 'CCTV Ingress Camera Stream Extract (Terminal 3 Cargo)',
    type: 'CCTV_FOOTAGE',
    sha256: '44d82b01cc899211aa77889b1029384810293847102938481029384810293848',
    classification: 'CONFIDENTIAL',
    isHoneyDecoy: false,
    collectedDate: '2026-08-29',
    sizeBytes: 420918230,
    description: 'High-definition video surveillance recording courier vehicle arrival at cargo bay.',
    chainOfCustodyCount: 5,
  }
];

// Helper to generate quick SHA-256 style hash
function generatePseudoHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex.split('').reverse().join('')}9f83c18b`.substring(0, 32);
}

// Storage Keys
const DB_AUDIT_LOGS_KEY = 'crimesync_db_audit_logs_v4';
const DB_SESSION_STATE_KEY = 'crimesync_db_session_state_v4';

// ============================================================================
// CONTEXT TYPE DEFINITIONS
// ============================================================================

export interface DbContextType {
  users: DbUser[];
  cases: DbCase[];
  evidence: DbEvidence[];
  auditLogs: DbAuditLog[];
  sessionState: DbSessionState;
  trustScore: number;
  permissions: DbAdaptivePermissions;
  activeCase: DbCase | undefined;
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  getCaseById: (id: string) => DbCase | undefined;
  getEvidenceByCase: (caseId: string) => DbEvidence[];
  logEvent: (
    action: DbAuditLog['action'],
    payload?: Record<string, any>,
    metadata?: {
      module?: string;
      category?: DbAuditLog['category'];
      severity?: DbAuditLog['severity'];
      targetId?: string;
      details?: string;
    }
  ) => DbAuditLog;
  simulateCyberAttack: () => Promise<void>;
  resetSessionState: () => void;
  isSimulatingAttack: boolean;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

// ============================================================================
// DB PROVIDER COMPONENT
// ============================================================================

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = SEEDED_USERS;
  const cases = SEEDED_CASES;
  const evidence = SEEDED_EVIDENCE;

  const [activeCaseId, setActiveCaseIdState] = useState<string>('CR-2026-0417');
  const [isSimulatingAttack, setIsSimulatingAttack] = useState<boolean>(false);

  // Initialize Audit Logs from localStorage or nominal seed
  const [auditLogs, setAuditLogs] = useState<DbAuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(DB_AUDIT_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    const now = new Date();
    return [
      {
        id: 'LOG-INIT-1',
        eventId: 'EVT-LOG-9801',
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeOffset: '00:00',
        userId: 'USR-101',
        userName: 'ACP Rajeshwar Sharma',
        action: 'LOGIN',
        module: 'Auth Gateway',
        category: 'AUTH',
        targetId: 'KDC-GATEWAY',
        payload: { device: 'Dell Latitude 7440', authType: 'Kerberos KDC TGT' },
        ipAddress: '10.240.8.21',
        location: 'Delhi Police HQ',
        device: 'Dell Latitude 7440 (Asset #NCRB-DL-9821)',
        severity: 'NORMAL',
        verdict: 'Authenticated',
        threatPenalty: 0,
        sha256: generatePseudoHash('LOGIN-USR-101-INIT'),
      }
    ];
  });

  // Calculate Real-Time Session State & Trust Score from Audit Logs
  const sessionState: DbSessionState = useMemo(() => {
    let baseScore = 100;
    const anomalies: DbSessionState['activeAnomalies'] = [];

    // 1. Evaluate Recent Evidence Access Cadence (Scraping Detection)
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    const recentEvidenceLogs = auditLogs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return log.action === 'EVIDENCE_VIEW' && logTime >= tenSecondsAgo;
    });

    if (recentEvidenceLogs.length >= 5) {
      baseScore -= 30;
      anomalies.push({
        id: 'ANO-RAPID-ACCESS',
        type: 'RAPID_EVIDENCE_ACCESS',
        penalty: 30,
        description: `Rapid evidence access anomaly: ${recentEvidenceLogs.length} exhibits queried in < 10 seconds.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 2. Evaluate Honeypot Tripwire Access
    const honeyAccess = auditLogs.find(
      (log) =>
        (log.action === 'EVIDENCE_VIEW' || log.action === 'FILE_DOWNLOAD') &&
        (log.targetId === 'EV-9999' || log.payload?.id === 'EV-9999' || log.payload?.isHoneyDecoy)
    );

    if (honeyAccess) {
      baseScore -= 50;
      anomalies.push({
        id: 'ANO-HONEY-TRIPWIRE',
        type: 'HONEY_DECOY_SPRUNG',
        penalty: 50,
        description: '🚨 Zero-Tolerance Honeypot Tripwire Sprung: Unauthorized access to fake exhibit EV-9999.',
        timestamp: new Date(honeyAccess.timestamp).toLocaleTimeString(),
      });
    }

    // 3. Evaluate Rapid Case Traversal
    const fifteenSecondsAgo = now - 15000;
    const recentCaseOpens = auditLogs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return log.action === 'CASE_OPEN' && logTime >= fifteenSecondsAgo;
    });

    const uniqueCases = new Set(recentCaseOpens.map((l) => l.targetId || l.payload?.caseId));
    if (uniqueCases.size >= 4) {
      baseScore -= 15;
      anomalies.push({
        id: 'ANO-CASE-TRAVERSAL',
        type: 'RAPID_CASE_TRAVERSAL',
        penalty: 15,
        description: `High-velocity case hopping: ${uniqueCases.size} distinct cases traversed in < 15 seconds.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    const calculatedTrustScore = Math.max(0, Math.min(100, baseScore));
    const isRestricted = calculatedTrustScore < 50;

    const permissions: DbAdaptivePermissions = {
      canExport: !isRestricted,
      canWriteBlockchain: !isRestricted,
      canDownloadCDR: !isRestricted,
      canGenerateAI: true,
      isReadOnly: isRestricted,
      containmentMode:
        calculatedTrustScore >= 80
          ? 'NOMINAL'
          : calculatedTrustScore >= 50
          ? 'MONITORED_DRIFT'
          : calculatedTrustScore > 10
          ? 'RESTRICTED_CONTAINMENT'
          : 'ISOLATED_QUARANTINE',
    };

    return {
      trustScore: calculatedTrustScore,
      activeUserId: 'USR-101',
      activeCaseId,
      permissions,
      activeAnomalies: anomalies,
      simulationActive: isRestricted,
    };
  }, [auditLogs, activeCaseId]);

  // Persist audit logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DB_AUDIT_LOGS_KEY, JSON.stringify(auditLogs.slice(0, 100)));
      localStorage.setItem(DB_SESSION_STATE_KEY, JSON.stringify(sessionState));
    } catch {
      // Ignore
    }
  }, [auditLogs, sessionState]);

  // Active Case getter
  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || cases[0];
  }, [cases, activeCaseId]);

  // Helper getters
  const getCaseById = useCallback(
    (id: string) => cases.find((c) => c.id === id),
    [cases]
  );

  const getEvidenceByCase = useCallback(
    (caseId: string) => evidence.filter((e) => e.caseId === caseId),
    [evidence]
  );

  // Set active case with auto-logging
  const setActiveCaseId = useCallback(
    (id: string) => {
      setActiveCaseIdState(id);
      const targetCase = cases.find((c) => c.id === id);
      if (targetCase) {
        // Direct event logging
        const now = new Date();
        const newLog: DbAuditLog = {
          id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          eventId: `EVT-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: now.toISOString(),
          displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timeOffset: '+00s',
          userId: 'USR-101',
          userName: 'ACP Rajeshwar Sharma',
          action: 'CASE_OPEN',
          module: 'Case Management',
          category: 'CASES',
          targetId: id,
          payload: { caseId: id, firNumber: targetCase.firNumber, title: targetCase.title },
          ipAddress: '10.240.8.21',
          location: 'Delhi Police HQ',
          device: 'Dell Latitude 7440',
          severity: 'NORMAL',
          verdict: 'Authorized',
          threatPenalty: 0,
          sha256: generatePseudoHash(`CASE_OPEN-${id}-${now.getTime()}`),
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    },
    [cases]
  );

  // Universal Log Event function
  const logEvent = useCallback(
    (
      action: DbAuditLog['action'],
      payload: Record<string, any> = {},
      metadata: {
        module?: string;
        category?: DbAuditLog['category'];
        severity?: DbAuditLog['severity'];
        targetId?: string;
        details?: string;
      } = {}
    ): DbAuditLog => {
      const now = new Date();
      let calculatedSeverity = metadata.severity || 'NORMAL';
      let verdict = 'Recorded';
      let penalty = 0;

      if (action === 'EVIDENCE_VIEW' && (metadata.targetId === 'EV-9999' || payload.id === 'EV-9999' || payload.isHoneyDecoy)) {
        calculatedSeverity = 'CRITICAL';
        verdict = '🚨 HONEY TRIPWIRE SPRUNG (-50 pts)';
        penalty = 50;
      } else if (action === 'REPORT_EXPORT' && sessionState.trustScore < 50) {
        calculatedSeverity = 'CONTAINED';
        verdict = 'HTTP 403 INTERCEPTED (BLOCKED)';
        penalty = 0;
      } else if (action === 'BLOCKCHAIN_WRITE' && sessionState.trustScore < 50) {
        calculatedSeverity = 'CONTAINED';
        verdict = 'WRITE LOCK ENFORCED';
        penalty = 0;
      }

      const newLog: DbAuditLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: `EVT-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeOffset: '+00s',
        userId: 'USR-101',
        userName: 'ACP Rajeshwar Sharma',
        action,
        module: metadata.module || 'System Workspace',
        category: metadata.category || 'EVIDENCE',
        targetId: metadata.targetId || payload.id || payload.caseId,
        payload,
        ipAddress: payload.ipAddress || (sessionState.trustScore < 50 ? '185.220.101.44 (Tor)' : '10.240.8.21'),
        location: payload.location || (sessionState.trustScore < 50 ? 'Mumbai, MH' : 'Delhi Police HQ'),
        device: payload.device || 'Dell Latitude 7440',
        severity: calculatedSeverity,
        verdict,
        threatPenalty: penalty,
        sha256: generatePseudoHash(`${action}-${JSON.stringify(payload)}-${now.getTime()}`),
        isSimulatedBot: payload.isSimulatedBot || false,
      };

      setAuditLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    [sessionState.trustScore]
  );

  // The Macro Cyber Attack Simulator
  const simulateCyberAttack = useCallback(async () => {
    setIsSimulatingAttack(true);

    try {
      const now = new Date();

      // Step 1: Rapid Ingress & Case Hopping
      const log1: DbAuditLog = {
        id: `LOG-${Date.now()}-1`,
        eventId: 'EVT-LOG-9901',
        timestamp: new Date(now.getTime() - 4000).toISOString(),
        displayTime: new Date(now.getTime() - 4000).toLocaleTimeString(),
        timeOffset: '00:00',
        userId: 'USR-101 (Compromised)',
        userName: 'ACP Rajeshwar Sharma',
        action: 'LOGIN',
        module: 'Auth Gateway',
        category: 'AUTH',
        targetId: 'KDC-GATEWAY',
        payload: { device: 'MacBook Pro M3 (Unregistered)', egress: 'Tor Exit Node' },
        ipAddress: '185.220.101.44',
        location: 'Mumbai, Maharashtra',
        device: 'Apple MacBook Pro M3 (Unregistered)',
        severity: 'SUSPICIOUS',
        verdict: 'Circadian & Geo Drift (-20 pts)',
        threatPenalty: 20,
        sha256: generatePseudoHash('BOT-LOGIN'),
        isSimulatedBot: true,
      };

      // Step 2: Rapid Evidence Access Burst (8 rapid files in 500ms)
      const burstExhibits = [
        { id: 'EV-1246', title: 'WhatsApp Database' },
        { id: 'EV-501', title: 'Swiss Bank Ledgers' },
        { id: 'EV-882', title: 'Nehru Place Tower CDR' },
        { id: 'EV-308', title: 'CCTV Footage Terminal 3' },
        { id: 'EV-412', title: 'Encrypted Cryptowallet Seed' },
        { id: 'EV-619', title: 'Hawala Ledger Sheet' },
        { id: 'EV-704', title: 'Intercepted Audio Transcript' },
      ];

      const burstLogs: DbAuditLog[] = burstExhibits.map((item, idx) => ({
        id: `LOG-${Date.now()}-burst-${idx}`,
        eventId: `EVT-LOG-${9910 + idx}`,
        timestamp: new Date(now.getTime() - 3000 + idx * 200).toISOString(),
        displayTime: new Date(now.getTime() - 3000 + idx * 200).toLocaleTimeString(),
        timeOffset: `+0${idx + 1}s`,
        userId: 'USR-101 (Compromised)',
        userName: 'ACP Rajeshwar Sharma',
        action: 'EVIDENCE_VIEW',
        module: 'Evidence DNA',
        category: 'EVIDENCE',
        targetId: item.id,
        payload: { id: item.id, title: item.title, automated: true },
        ipAddress: '185.220.101.44',
        location: 'Mumbai, Maharashtra',
        device: 'Apple MacBook Pro M3 (Unregistered)',
        severity: idx >= 4 ? 'CRITICAL' : 'SUSPICIOUS',
        verdict: idx >= 4 ? 'RAPID SCRAPING ANOMALY (-30 pts)' : 'High Velocity Query',
        threatPenalty: idx === 4 ? 30 : 0,
        sha256: generatePseudoHash(`BURST-${item.id}`),
        isSimulatedBot: true,
      }));

      // Step 3: Access Honey Decoy EV-9999
      const honeyLog: DbAuditLog = {
        id: `LOG-${Date.now()}-honey`,
        eventId: 'EVT-LOG-9919',
        timestamp: new Date(now.getTime() - 1200).toISOString(),
        displayTime: new Date(now.getTime() - 1200).toLocaleTimeString(),
        timeOffset: '+03s',
        userId: 'USR-101 (Compromised)',
        userName: 'ACP Rajeshwar Sharma',
        action: 'EVIDENCE_VIEW',
        module: 'Deception Sensor',
        category: 'EVIDENCE',
        targetId: 'EV-9999',
        payload: { id: 'EV-9999', title: 'Swiss Secret Banking Hawala Ledger & Wiretap Dump', isHoneyDecoy: true },
        ipAddress: '185.220.101.44',
        location: 'Mumbai, Maharashtra',
        device: 'Apple MacBook Pro M3 (Unregistered)',
        severity: 'CRITICAL',
        verdict: '🚨 HONEY TRIPWIRE SPRUNG (-50 pts)',
        threatPenalty: 50,
        sha256: generatePseudoHash('HONEY-TRIPWIRE-ACCESS'),
        isSimulatedBot: true,
      };

      // Step 4: Intercepted PDF Export
      const blockedExportLog: DbAuditLog = {
        id: `LOG-${Date.now()}-block`,
        eventId: 'EVT-LOG-9925',
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString(),
        timeOffset: '+04s',
        userId: 'USR-101 (Compromised)',
        userName: 'ACP Rajeshwar Sharma',
        action: 'REPORT_EXPORT',
        module: 'Dossier Engine',
        category: 'REPORT',
        targetId: 'DOSSIER-SEC-65B',
        payload: { target: 'ChargeSheet_Section65B.pdf', status: 'Blocked' },
        ipAddress: '185.220.101.44',
        location: 'Mumbai, Maharashtra',
        device: 'Apple MacBook Pro M3 (Unregistered)',
        severity: 'CONTAINED',
        verdict: '🛡️ HTTP 403 ADAPTIVE LOCK (BLOCKED)',
        threatPenalty: 0,
        sha256: generatePseudoHash('INTERCEPTED-EXPORT'),
        isSimulatedBot: true,
      };

      // Append all simulated attack logs in real time
      setAuditLogs((prev) => [blockedExportLog, honeyLog, ...burstLogs, log1, ...prev]);
    } finally {
      setIsSimulatingAttack(false);
    }
  }, []);

  // Reset session back to 100/100 nominal baseline
  const resetSessionState = useCallback(() => {
    const now = new Date();
    const freshLog: DbAuditLog = {
      id: `LOG-${Date.now()}-reset`,
      eventId: `EVT-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeOffset: '00:00',
      userId: 'USR-101',
      userName: 'ACP Rajeshwar Sharma',
      action: 'LOGIN',
      module: 'Security Administration',
      category: 'SECURITY',
      targetId: 'SESSION-RESET',
      payload: { reason: 'Security officer cleared simulation telemetry' },
      ipAddress: '10.240.8.21',
      location: 'Delhi Police HQ',
      device: 'Dell Latitude 7440 (Asset #NCRB-DL-9821)',
      severity: 'NORMAL',
      verdict: 'Trust Restored (100/100)',
      threatPenalty: 0,
      sha256: generatePseudoHash(`RESET-${now.getTime()}`),
    };

    setAuditLogs([freshLog]);
    localStorage.removeItem(DB_AUDIT_LOGS_KEY);
    localStorage.removeItem(DB_SESSION_STATE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      users,
      cases,
      evidence,
      auditLogs,
      sessionState,
      trustScore: sessionState.trustScore,
      permissions: sessionState.permissions,
      activeCase,
      activeCaseId,
      setActiveCaseId,
      getCaseById,
      getEvidenceByCase,
      logEvent,
      simulateCyberAttack,
      resetSessionState,
      isSimulatingAttack,
    }),
    [
      users,
      cases,
      evidence,
      auditLogs,
      sessionState,
      activeCase,
      activeCaseId,
      setActiveCaseId,
      getCaseById,
      getEvidenceByCase,
      logEvent,
      simulateCyberAttack,
      resetSessionState,
      isSimulatingAttack,
    ]
  );

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};

// Hook to access DbContext directly
export const useDbContext = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDbContext must be used within a DbProvider');
  }
  return context;
};
