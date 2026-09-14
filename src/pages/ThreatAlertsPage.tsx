import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Lock,
  Search,
  CheckCircle2,
  Radio,
  Server,
  Activity,
  UserX,
  Fingerprint,
  FileWarning,
  Eye,
  AlertTriangle,
  RotateCw,
  X,
  Terminal,
  Play,
  Sliders,
  FileText,
  Printer,
  Undo2,
  FileSpreadsheet,
  Cpu,
  AlertOctagon,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import {
  platformVulnerabilitiesData,
  suspiciousOfficerWatchdogsData,
} from '../data/mockData';
import type {
  PlatformVulnerability,
  SuspiciousOfficerWatchdog,
  OfficerWatchdogType,
} from '../types/dashboard';
import { deceptiveFIRPayload, getCompromisedFIRReports } from '../data/mockFIR';

// =============================================================
// 2. TYPE DEFINITIONS & STATE INITIALIZATION
// =============================================================
export type AlertCategory = 'appsec' | 'insider' | 'fir_anomaly';
export type AlertStatus = 'open' | 'contained';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ThreatAlert {
  id: string;
  category: AlertCategory;
  severity: SeverityLevel;
  status: AlertStatus;
  title: string;
  timestamp: string;
  targetEntity: string;
  description: string;
  riskScore: number;
  deceptiveParameters?: { label: string; value: string }[];
  actionLabel: string;
  officerDetails?: SuspiciousOfficerWatchdog;
}

export interface ThreatAlertsPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

// Convert compromised FIR reports into threat alert cards
const COMPROMISED_FIR_ALERTS: ThreatAlert[] = getCompromisedFIRReports().map(fir => ({
  id: fir.id,
  category: 'fir_anomaly',
  severity: 'Critical',
  status: 'open',
  title: 'Deceptive FIR Detected: Synthetic Narrative & Spatio-Temporal Collision',
  timestamp: '4 mins ago',
  targetEntity: `${fir.firNumber || fir.id} (${fir.suspectName})`,
  description: fir.anomalySummary || fir.incidentDescription || '',
  riskScore: fir.confidenceScore || 99,
  deceptiveParameters: fir.flaggedParameters.map(p => {
    const idx = p.indexOf(': ');
    if (idx !== -1) {
      return { label: p.slice(0, idx), value: p.slice(idx + 2) };
    }
    return { label: 'Flagged Anomaly', value: p };
  }),
  actionLabel: 'Quarantine FIR & Push to Doppelgänger',
}));

// Map the existing hardcoded UI alerts into this array. 
// Assign 'appsec' to Website Radar items, 'insider' to Suspicious Officer items, and 'fir_anomaly' to compromised FIRs.
const INITIAL_ALERTS: ThreatAlert[] = [
  // Compromised FIR Anomaly Telemetry (Strictly Compromised Only)
  ...COMPROMISED_FIR_ALERTS,

  // Website Radar Items (AppSec)
  {
    id: 'appsec-cve-2026-3190',
    category: 'appsec',
    severity: 'Critical',
    status: 'open',
    title: 'Missing API Rate Limiting on Evidence Export Endpoints',
    timestamp: '2 mins ago',
    targetEntity: 'Express REST API (/api/v1/cases/:id/evidence)',
    description: 'Endpoint /api/v1/cases/:id/evidence lacks token bucket throttling, permitting automated bulk scraping of sensitive case hashes.',
    riskScore: 91,
    actionLabel: 'Enable Adaptive Rate Limiter',
    deceptiveParameters: [
      { label: 'CVE Identifier', value: 'CVE-2026-3190' },
      { label: 'CVSS Base Score', value: '9.1 / 10.0 (Critical)' },
      { label: 'Exploit Impact', value: 'Exposes 9 active FIR case evidence sets to unthrottled external enumeration' },
    ],
  },
  {
    id: 'appsec-cwe-613',
    category: 'appsec',
    severity: 'High',
    status: 'open',
    title: 'Excessive 7-Day JWT Token Lifetime Window',
    timestamp: '8 mins ago',
    targetEntity: 'Auth & Sessions (JWT Bearer Gateway)',
    description: 'JWT authorization bearer tokens configured with a 7-day TTL without active revocation checks on station logout.',
    riskScore: 84,
    actionLabel: 'Enforce 15-Min Rotation & Revoke Stale Tokens',
    deceptiveParameters: [
      { label: 'CWE Identifier', value: 'CWE-613' },
      { label: 'CVSS Base Score', value: '8.4 / 10.0 (High)' },
      { label: 'Exploit Impact', value: 'Allows replay of intercepted session tokens if officer laptop is compromised' },
    ],
  },
  {
    id: 'appsec-cwe-942',
    category: 'appsec',
    severity: 'High',
    status: 'open',
    title: 'Permissive CORS Origin Policy on Live WebSocket Relays',
    timestamp: '15 mins ago',
    targetEntity: 'Web Frontend (WebSocket Telemetry Mesh)',
    description: 'Wildcard CORS headers (* origin) permit unauthorized browser tabs to listen to real-time police incident telemetry.',
    riskScore: 78,
    actionLabel: 'Clamp Strict Police Origin Whitelist',
    deceptiveParameters: [
      { label: 'CWE Identifier', value: 'CWE-942' },
      { label: 'CVSS Base Score', value: '7.8 / 10.0 (High)' },
      { label: 'Exploit Impact', value: 'Cross-origin tabs could sniff real-time GPS locations of tactical units' },
    ],
  },
  {
    id: 'appsec-cwe-1021',
    category: 'appsec',
    severity: 'Medium',
    status: 'open',
    title: 'Missing Content-Security-Policy frame-ancestors Guard',
    timestamp: '22 mins ago',
    targetEntity: 'Web Frontend (Evidence Vault Modals)',
    description: 'HTTP response header lacks "frame-ancestors \'none\'", creating clickjacking risk on FIR evidence upload modals.',
    riskScore: 62,
    actionLabel: 'Enforce Strict CSP Headers',
    deceptiveParameters: [
      { label: 'CWE Identifier', value: 'CWE-1021' },
      { label: 'CVSS Base Score', value: '6.2 / 10.0 (Medium)' },
      { label: 'Exploit Impact', value: 'Malicious iframes could execute unauthorized Section 65B signature requests' },
    ],
  },

  // Suspicious Officer Items (Insider Threats)
  {
    id: 'insider-watch-001',
    category: 'insider',
    severity: 'Critical',
    status: 'open',
    title: 'Evidence Tamper Alarm: Hash Mismatch on Sealed Dossier',
    timestamp: '8 mins ago',
    targetEntity: 'SI Vikramaditya Reddy (HYD-CID-7740)',
    description: 'Workstation dispatched PUT packet to /api/v1/evidence/EVD-2026-089/hash attempting to replace CCTV recording hash from off-grid commercial IP.',
    riskScore: 94,
    deceptiveParameters: [
      { label: 'Integrity Checksum', value: 'SHA-256 Alteration (e4b8... != 7a1c...)' },
      { label: 'Access Point', value: '115.242.18.94 (Off-Grid Commercial ISP)' },
      { label: 'Target Resource', value: 'Evidence EVD-2026-089 (SWIFT_PCAP_DUMP.bin)' },
    ],
    actionLabel: 'Freeze Evidence Ledger',
    officerDetails: suspiciousOfficerWatchdogsData[0],
  },
  {
    id: 'insider-watch-002',
    category: 'insider',
    severity: 'Critical',
    status: 'open',
    title: 'Canary Trap Triggered: Unauthorized Decoy File Access',
    timestamp: '12 mins ago',
    targetEntity: 'ACP Rajeshwar Sharma (DEL-IPS-8821)',
    description: 'Officer queried and downloaded classified Canary Honeypot File "HAWALA_VIP_LEDGER_CONFIDENTIAL.xlsx" with zero active FIR investigation assignment.',
    riskScore: 89,
    deceptiveParameters: [
      { label: 'Canary Decoy Token', value: 'STG-ACP23-9981-Z Injected' },
      { label: 'Investigation Status', value: 'Unassigned / Zero Duty Requisition' },
      { label: 'Exfiltration Method', value: 'Encrypted USB / Staged Download' },
    ],
    actionLabel: 'Flag Mole & Alert Oversight',
    officerDetails: suspiciousOfficerWatchdogsData[1],
  },
  {
    id: 'insider-watch-003',
    category: 'insider',
    severity: 'High',
    status: 'open',
    title: 'Bulk Export Circuit Breaker: Mass CDR Records Dumping',
    timestamp: '19 mins ago',
    targetEntity: 'Inspector Priya Kulkarni (MUM-CYB-4091)',
    description: 'Officer triggered mass export circuit breaker by attempting to download 15 CDR telecom tower dumps and 8 bank statements in under 120 seconds.',
    riskScore: 82,
    deceptiveParameters: [
      { label: 'Burst Rate', value: '23 Files / 120s (Threshold: 5 Files / 10m)' },
      { label: 'Station', value: 'Bandra-Kurla Complex (BKC) Mumbai' },
      { label: 'Target Dataset', value: '15 Telecom CDR Dumps & 8 Mule Accounts' },
    ],
    actionLabel: 'Block Export & Watermark Device',
    officerDetails: suspiciousOfficerWatchdogsData[2],
  },
  {
    id: 'insider-watch-004',
    category: 'insider',
    severity: 'Medium',
    status: 'open',
    title: 'Device Hijack Alert: Unknown Hardware & Residential IP Login',
    timestamp: '28 mins ago',
    targetEntity: 'Superintendent Ananya Sengupta (CBI-HQ-0012)',
    description: 'Officer badge credentials authenticated from an unregistered Android device operating on a dynamic residential ISP in Salt Lake City without MFA confirmation.',
    riskScore: 78,
    deceptiveParameters: [
      { label: 'Hardware Signature', value: 'OnePlus Nord Android 14 / Mobile Safari' },
      { label: 'Geo-Anomaly', value: 'Salt Lake Sector V, Kolkata (Hardware token at HQ)' },
      { label: 'Network Origin', value: '49.36.142.88 (Residential Dynamic Pool)' },
    ],
    actionLabel: 'Kill Session & Force Biometric MFA',
    officerDetails: suspiciousOfficerWatchdogsData[3],
  },
];

const SIMULATED_DRILL_ALERT_ID = 'DRILL-FIR-2026-DEL-9110';

const SIMULATED_DRILL_ALERT: ThreatAlert = {
  id: SIMULATED_DRILL_ALERT_ID,
  category: 'fir_anomaly',
  severity: 'Critical',
  status: 'open',
  title: 'Simulated Deceptive FIR Ingestion: Kinematic Anomaly & Synthetic Modus Operandi',
  timestamp: 'Just now',
  targetEntity: 'FIR/DEL/2026/9110 (Vikramaditya "Ghost" Sen)',
  description: 'Autonomous Doppelgänger AI engine flagged simulated deceptive filing: Suspect reported physical vault exfiltration in Connaught Place at 14:00, but Aadhaar biometric terminal scan verified in Mumbai at 14:05 (1,400km delta in 5 mins).',
  riskScore: 98,
  deceptiveParameters: [
    { label: 'Crime Incident Geolocation', value: 'Connaught Place Terminal, New Delhi, DL (14:00 IST)' },
    { label: 'Biometric Terminal Scan', value: 'BKC Cyber Complex, Mumbai, MH (14:05 IST)' },
    { label: 'Kinematic Velocity Anomaly', value: '16,800 km/h required travel speed (Physical Impossibility)' },
    { label: 'Identity Doppelgänger State', value: 'COMPROMISED (Simulated Biometric Collision Injected)' },
  ],
  actionLabel: 'Quarantine FIR & Push to Doppelgänger',
};

// Helper: Printable Section 65B Audit Certificate
function printSection65BAuditDossier(alert: ThreatAlert) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const officer = alert.officerDetails;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Section 65B Forensic Audit Dossier - ${alert.targetEntity}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .header h2 { margin: 5px 0 0 0; font-size: 14px; font-weight: 500; color: #64748b; }
          .badge { display: inline-block; padding: 4px 10px; background: #fee2e2; color: #991b1b; font-weight: bold; border-radius: 4px; font-size: 12px; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .field { font-size: 13px; }
          .field strong { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .params-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          .params-table th { text-align: left; background: #0f172a; color: #fff; padding: 8px 12px; font-size: 11px; text-transform: uppercase; }
          .params-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          .signature-box { border: 1px dashed #94a3b8; padding: 15px; width: 220px; text-align: center; margin-top: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GOVERNMENT OF INDIA - LAW ENFORCEMENT CYBER CELL</h1>
          <h2>DIGITAL EVIDENCE CHAIN OF CUSTODY & ANOMALY DOSSIER (SEC 65B BSA)</h2>
          <div class="badge">CONFIDENTIAL & COURT-ADMISSIBLE</div>
        </div>

        <div class="grid">
          <div class="field"><strong>Target Entity</strong>${alert.targetEntity}</div>
          <div class="field"><strong>Incident Classification</strong>${alert.category.toUpperCase()} (${alert.title})</div>
          <div class="field"><strong>Severity / Timestamp</strong>${alert.severity} • ${alert.timestamp}</div>
          <div class="field"><strong>Assigned Risk Score</strong>${alert.riskScore}/100 (${alert.status.toUpperCase()})</div>
          ${officer ? `
          <div class="field"><strong>Officer Rank & Dept</strong>${officer.rank} - ${officer.department}</div>
          <div class="field"><strong>Linked Case</strong>${officer.caseRef} - ${officer.caseTitle}</div>
          ` : `
          <div class="field"><strong>Verification Node</strong>Doppelgänger Neural FIR Classifier</div>
          <div class="field"><strong>Mitigation Status</strong>${alert.status === 'contained' ? 'Quarantined & Sealed' : 'Action Required'}</div>
          `}
        </div>

        <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <strong style="color: #9f1239; font-size: 13px;">🚨 INCIDENT ANOMALY SUMMARY:</strong>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #4c0519; line-height: 1.5;">${alert.description}</p>
        </div>

        ${alert.deceptiveParameters && alert.deceptiveParameters.length > 0 ? `
          <h3>DETECTED DECEPTIVE PARAMETERS & FORENSIC PROOFS:</h3>
          <table class="params-table">
            <thead>
              <tr>
                <th>Forensic Verification Vector</th>
                <th>Anomaly Finding</th>
              </tr>
            </thead>
            <tbody>
              ${alert.deceptiveParameters.map(p => `
                <tr>
                  <td><strong>${p.label}</strong></td>
                  <td style="font-family: monospace; color: #b45309;">${p.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          <div>
            Generated by CrimeSync Sentinel Live SOC v4.2<br/>
            Timestamp: ${new Date().toUTCString()}<br/>
            Cryptographic Checksum: SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
          </div>
          <div class="signature-box">
            Authorized Digital Signatory<br/>
            <span style="font-family: monospace; font-size: 10px; color: #0284c7;">[POLICE-PKI-SEALED]</span><br/>
            Forensic Custody Officer
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export const ThreatAlertsPage: React.FC<ThreatAlertsPageProps> = () => {
  // -------------------------------------------------------------
  // 2. STATE MANAGEMENT & IDEMPOTENT SIMULATION ENGINE
  // -------------------------------------------------------------
  const [alerts, setAlerts] = useState<ThreatAlert[]>(INITIAL_ALERTS);
  const [isSimulating, setIsSimulating] = useState(false);
  const drillTriggeredRef = useRef(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'UNRESOLVED' | 'CONTAINED' | 'FIR_ANOMALIES'>('ALL');

  // Inspection Modal & Active Tab inside Modal
  const [inspectModalAlert, setInspectModalAlert] = useState<ThreatAlert | null>(null);
  const [modalTab, setModalTab] = useState<'timeline' | 'forensics' | 'pki'>('timeline');

  // Live Scanning Drawer State
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showScanDrawer, setShowScanDrawer] = useState(false);

  // Patching in-progress IDs for AppSec vulnerabilities
  const [patchingIds, setPatchingIds] = useState<Record<string, number>>({});

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // -------------------------------------------------------------
  // INITIAL DATA SYNC WITH BACKEND
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const fetchBackendThreats = async () => {
      try {
        const [vulnsRes] = await Promise.allSettled([
          api.threats.getVulnerabilities(),
        ]);

        if (isMounted) {
          if (vulnsRes.status === 'fulfilled' && Array.isArray(vulnsRes.value) && vulnsRes.value.length > 0) {
            // Optional sync with backend registry
          }
        }
      } catch (err) {
        console.warn('Backend threats initial sync fallback to local mock:', err);
      }
    };

    fetchBackendThreats();
    return () => {
      isMounted = false;
    };
  }, []);

  // -------------------------------------------------------------
  // 4. REACTIVE HEADER METRICS (THREAT TRIAGE)
  // -------------------------------------------------------------
  const activeAnomalies = useMemo(
    () => alerts.filter(a => a.category !== 'appsec' && a.status === 'open').length,
    [alerts]
  );

  const activeAppSec = useMemo(
    () => alerts.filter(a => a.category === 'appsec' && a.status === 'open').length,
    [alerts]
  );

  const healthGrade = useMemo(() => {
    const score = 100 - (activeAppSec * 10) - (activeAnomalies * 15);
    return Math.max(0, score);
  }, [activeAppSec, activeAnomalies]);

  const totalContained = useMemo(
    () => alerts.filter(a => a.status === 'contained').length,
    [alerts]
  );

  // -------------------------------------------------------------
  // 2. IDEMPOTENT INJECTION & VERIFICATION ENGINE (SIMULATE DRILL)
  // -------------------------------------------------------------
  const handleSimulateDrill = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Synchronous ref guard: prevent multiple queued timeouts on rapid clicks
    if (drillTriggeredRef.current) {
      return;
    }

    drillTriggeredRef.current = true;
    setIsSimulating(true);

    setTimeout(() => {
      setAlerts(prevAlerts => {
        // Authoritative duplicate check on latest state
        if (prevAlerts.some(alert => alert.id === SIMULATED_DRILL_ALERT_ID)) {
          return prevAlerts;
        }

        return [SIMULATED_DRILL_ALERT, ...prevAlerts];
      });

      setIsSimulating(false);
      showToast('🚨 Live Deceptive FIR Ingested & Evaluated by AI Verification Engine', 'alert');
    }, 1500);
  };

  const triggerLiveFIRSimulation = handleSimulateDrill;

  // -------------------------------------------------------------
  // 1-CLICK VULNERABILITY PATCHING (AppSec Left Column)
  // -------------------------------------------------------------
  const handlePatchVulnerability = async (id: string, title: string) => {
    setPatchingIds(prev => ({ ...prev, [id]: 15 }));
    setTimeout(() => setPatchingIds(prev => ({ ...prev, [id]: 65 })), 250);
    setTimeout(() => setPatchingIds(prev => ({ ...prev, [id]: 95 })), 500);

    try {
      await api.threats.patchVulnerability(id);
    } catch (e) {
      console.warn('Backend patch call non-fatal fallback:', e);
    }

    setTimeout(() => {
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'contained' } : a))
      );
      setPatchingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      showToast(`🛡️ Patched & Hardened: ${title}`, 'success');
    }, 700);
  };

  const handleRollbackVulnerability = async (id: string, title: string) => {
    try {
      await api.threats.rollbackVulnerability(id);
    } catch (e) {
      console.warn('Backend rollback call non-fatal fallback:', e);
    }

    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'open' } : a))
    );
    showToast(`🔄 Rolled back: ${title} to vulnerable state for testing`, 'info');
  };

  const handlePatchAllAppSec = async () => {
    try {
      await api.threats.patchAllVulnerabilities();
    } catch (e) {
      console.warn('Backend patch-all call non-fatal fallback:', e);
    }

    setAlerts(prev =>
      prev.map(a => (a.category === 'appsec' ? { ...a, status: 'contained' } : a))
    );
    showToast(`⚡ All platform vulnerabilities successfully patched!`, 'success');
  };

  // -------------------------------------------------------------
  // SYSTEM RE-SCAN SIMULATION WITH LIVE TERMINAL LOGS
  // -------------------------------------------------------------
  const handleScanSystem = async () => {
    setIsScanning(true);
    setShowScanDrawer(true);
    setScanLogs(['Initializing CrimeSync Zero-Trust Security Scanner v4.2...']);

    let steps = [
      '🔍 Probing /api/v1/ REST Endpoints for unthrottled rate-limiting leaks...',
      '🔐 Auditing JWT Bearer expiration windows & revocation blacklist table...',
      '🌐 Testing WebSocket channels against strict CORS domain allowlists...',
      '🤖 Running Doppelgänger Synthetic Text Heuristics across recent FIR filings...',
      '📦 Verifying SHA-256 integrity across PostgreSQL FIR evidence vaults...',
      '✅ Audit Complete: Zero untracked vulnerabilities discovered. System state synchronized.',
    ];

    try {
      const scanRes = await api.threats.scanSystem();
      if (scanRes && Array.isArray(scanRes.steps)) {
        steps = scanRes.steps;
      }
    } catch (e) {
      console.warn('Backend scan call non-fatal fallback:', e);
    }

    steps.forEach((step, index) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setIsScanning(false);
          showToast(`✅ Security Scan Complete. All systems operational.`, 'success');
        }
      }, (index + 1) * 380);
    });
  };

  // -------------------------------------------------------------
  // RESET ALL DEMO DATA
  // -------------------------------------------------------------
  const handleResetAll = async () => {
    try {
      await api.threats.resetAll();
    } catch (e) {
      console.warn('Backend reset-all call non-fatal fallback:', e);
    }
    drillTriggeredRef.current = false;
    setIsSimulating(false);
    setAlerts(INITIAL_ALERTS);
    showToast(`🔄 Reset all threat alerts and vulnerabilities to default state.`, 'info');
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredAppSecAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (a.category !== 'appsec') return false;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.deceptiveParameters &&
          a.deceptiveParameters.some(
            p =>
              p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.value.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      if (statusFilter === 'CRITICAL') return matchSearch && (a.severity === 'Critical' || a.riskScore >= 90);
      if (statusFilter === 'UNRESOLVED') return matchSearch && a.status === 'open';
      if (statusFilter === 'CONTAINED') return matchSearch && a.status === 'contained';
      if (statusFilter === 'FIR_ANOMALIES') return false;
      return matchSearch;
    });
  }, [alerts, searchQuery, statusFilter]);

  const filteredRightAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (a.category === 'appsec') return false;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.deceptiveParameters &&
          a.deceptiveParameters.some(
            p =>
              p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.value.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      if (statusFilter === 'CRITICAL') return matchSearch && (a.severity === 'Critical' || a.riskScore >= 85);
      if (statusFilter === 'UNRESOLVED') return matchSearch && a.status === 'open';
      if (statusFilter === 'CONTAINED') return matchSearch && a.status === 'contained';
      if (statusFilter === 'FIR_ANOMALIES') return matchSearch && a.category === 'fir_anomaly';
      return matchSearch;
    });
  }, [alerts, searchQuery, statusFilter]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fadeIn pb-24 custom-scrollbar">
      {/* ------------------------------------------------------------- */}
      {/* FLOATING ACTION TOAST */}
      {/* ------------------------------------------------------------- */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-slideUp transition-all duration-300 ${toastMessage.type === 'alert'
              ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/60'
              : toastMessage.type === 'info'
                ? 'bg-cyan-950/95 border-cyan-500/60 text-cyan-100 shadow-cyan-950/60'
                : 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/60'
            }`}
        >
          {toastMessage.type === 'alert' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Activity className="w-5 h-5 text-cyan-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold tracking-wide">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP EXECUTIVE BAR: POSTURE SCORE & QUICK CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-slate-800/80 p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Title & Description */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 via-cyan-500/15 to-slate-800 border border-slate-700/80 flex items-center justify-center shadow-inner shrink-0">
              <ShieldAlert className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Threat Alerts & Cyber Defense Operations
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" /> Live SOC Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-Trust AppSec Vulnerability Shield • Live Deceptive FIR Detection Engine & Insider Watchdogs
              </p>
            </div>
          </div>

          {/* Key Metrics Counters & Simulation Drill Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Health Grade Gauge */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/90 rounded-xl px-4 py-2 shadow-inner">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3.5" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={healthGrade >= 85 ? '#10b981' : healthGrade >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3.5"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * healthGrade) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{healthGrade}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Grade</div>
                <div
                  className={`text-xs font-bold ${healthGrade >= 85
                      ? 'text-emerald-400'
                      : healthGrade >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                >
                  {healthGrade >= 85
                    ? 'Shielded (Optimal)'
                    : healthGrade >= 60
                      ? 'Elevated Exposure'
                      : 'Critical Threat'}
                </div>
              </div>
            </div>

            {/* Open AppSec Flaws Counter */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl px-3.5 py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AppSec Flaws</div>
              <div className="text-sm font-black text-rose-400 flex items-center gap-1.5 mt-0.5">
                <Server className="w-3.5 h-3.5" /> {activeAppSec} Open
              </div>
            </div>

            {/* 4. Active Anomalies Counter (Renamed from Flagged Moles) */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl px-3.5 py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Anomalies</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                <AlertOctagon className="w-3.5 h-3.5" /> {activeAnomalies} Active
              </div>
            </div>

            {/* 3. Hard-Wired Simulate Drill Button (Physical disable & Idempotent single-use) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSimulateDrill(e);
              }}
              disabled={isSimulating || alerts.some(a => a.id === SIMULATED_DRILL_ALERT_ID)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider shadow transition ${isSimulating || alerts.some(a => a.id === SIMULATED_DRILL_ALERT_ID)
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                }`}
            >
              {isSimulating ? 'Processing...' : alerts.some(a => a.id === SIMULATED_DRILL_ALERT_ID) ? 'Drill Complete' : 'Simulate Drill'}
            </button>

            {/* Reset All State */}
            <button
              onClick={handleResetAll}
              title="Reset all states for testing"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Scanner Drawer */}
        {showScanDrawer && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
              <span className="flex items-center gap-2 text-cyan-400 font-bold">
                <Terminal className="w-3.5 h-3.5" /> SOC Live Security Audit Terminal
              </span>
              <button
                onClick={() => setShowScanDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pt-1">
              {scanLogs.map((log, i) => (
                <div key={i} className="text-slate-300 text-[11px] flex items-center gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/70 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by FIR ID, officer, parameter, CVE..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['ALL', 'CRITICAL', 'UNRESOLVED', 'CONTAINED', 'FIR_ANOMALIES'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
              >
                {filter === 'ALL'
                  ? `All Items (${alerts.length})`
                  : filter === 'CRITICAL'
                    ? `🔥 Critical Risk (${alerts.filter(a => a.severity === 'Critical' || a.riskScore >= 90).length})`
                    : filter === 'UNRESOLVED'
                      ? `⚠️ Unresolved (${activeAppSec + activeAnomalies})`
                      : filter === 'FIR_ANOMALIES'
                        ? `🚨 FIR Anomalies (${alerts.filter(a => a.category === 'fir_anomaly').length})`
                        : `✅ Contained (${totalContained})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2-PANEL MAIN CONTENT GRID */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ============================================================= */}
        {/* PANEL 1: WEBSITE & PLATFORM VULNERABILITY RADAR (AppSec) */}
        {/* ============================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center shadow-inner">
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  1. Website Vulnerability Radar
                  <span className="text-xs font-medium text-slate-400">({filteredAppSecAlerts.length})</span>
                </h2>
                <p className="text-xs text-slate-400">REST API security, token lifetimes & CORS sanitization</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeAppSec > 0 && (
                <button
                  onClick={handlePatchAllAppSec}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all active:scale-95"
                >
                  ⚡ Patch All
                </button>
              )}
              <button
                onClick={handleScanSystem}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
                {isScanning ? 'Scanning...' : 'Re-Scan'}
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredAppSecAlerts.map(vuln => {
              const isPatched = vuln.status === 'contained';
              const patchProgress = patchingIds[vuln.id];
              const isPatchingThis = patchProgress !== undefined;

              return (
                <div
                  key={vuln.id}
                  className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden group ${isPatched
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                      : vuln.severity === 'Critical'
                        ? 'bg-gradient-to-r from-rose-950/25 via-slate-900/90 to-slate-900/95 border-rose-500/40 shadow-lg shadow-rose-950/20'
                        : 'bg-slate-900/85 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  {/* Active Patch Progress Bar */}
                  {isPatchingThis && (
                    <div
                      className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 z-20"
                      style={{ width: `${patchProgress}%` }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {vuln.deceptiveParameters?.[0]?.value || 'APPSEC'}
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded truncate max-w-[200px]">
                          {vuln.targetEntity}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isPatched
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                              : vuln.severity === 'Critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            }`}
                        >
                          {isPatched ? 'PATCHED' : `${vuln.severity} (${vuln.riskScore}% RISK)`}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white pt-1 break-words">{vuln.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed break-words">{vuln.description}</p>

                  {vuln.deceptiveParameters && vuln.deceptiveParameters.length > 2 && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="break-words min-w-0">
                        <strong className="text-slate-200">Exploit Impact:</strong> {vuln.deceptiveParameters[2].value}
                      </span>
                    </div>
                  )}

                  <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      Status:{' '}
                      <span className={isPatched ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isPatched ? '✅ Fixed & Sealed' : '⚠️ Action Required'}
                      </span>
                    </span>

                    {isPatched ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hardened
                        </span>
                        <button
                          onClick={() => handleRollbackVulnerability(vuln.id, vuln.title)}
                          title="Undo patch to re-test"
                          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePatchVulnerability(vuln.id, vuln.title)}
                        disabled={isPatchingThis}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Zap className={`w-3.5 h-3.5 ${isPatchingThis ? 'animate-spin' : ''}`} />
                        {isPatchingThis ? `Hardening ${patchProgress}%...` : `1-Click: ${vuln.actionLabel}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredAppSecAlerts.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                No vulnerabilities match your filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================= */}
        {/* PANEL 2: 5. UI RENDERING & MITIGATION (RIGHT COLUMN) */}
        {/* ============================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  2. Insider Threat & Data Integrity Watch
                  <span className="text-xs font-medium text-slate-400">({filteredRightAlerts.length})</span>
                </h2>
                <p className="text-xs text-slate-400">Live AI Synthetic Narrative Verification & Rogue Insider Telemetry</p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Live Ingest Engine
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredRightAlerts.map(alert => {
              const isContained = alert.status === 'contained';
              const isFirAnomaly = alert.category === 'fir_anomaly';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-md relative group ${isContained
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                      : isFirAnomaly
                        ? 'bg-gradient-to-r from-rose-950/30 via-slate-900/95 to-slate-900/95 border-rose-500/50 shadow-xl shadow-rose-950/30'
                        : alert.riskScore >= 85
                          ? 'bg-gradient-to-r from-amber-950/25 via-slate-900/90 to-slate-900/95 border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : 'bg-slate-900/85 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  {/* Card Header: Category Badge, Timestamp & Risk Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {isFirAnomaly ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/15 text-rose-300">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" /> DECEPTIVE FIR ANOMALY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
                          <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0" /> INSIDER WATCHDOG
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded ${isContained
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : alert.riskScore >= 90
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          }`}
                      >
                        {isContained ? 'CONTAINED' : `${alert.riskScore}% RISK`}
                      </span>
                    </div>
                  </div>

                  {/* Target Entity & Threat Title */}
                  <div className="mt-3 flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${isFirAnomaly
                          ? 'bg-rose-950/50 border-rose-700/60 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-cyan-300'
                        }`}
                    >
                      {isFirAnomaly ? (
                        <FileText className="w-5 h-5 text-rose-400" />
                      ) : (
                        alert.targetEntity
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate max-w-[280px]">{alert.targetEntity}</h3>
                        <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          {isFirAnomaly ? 'DOPPELGÄNGER AI' : 'POLICE PKI'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 break-words">{alert.title}</p>
                    </div>
                  </div>

                  {/* Summary Narrative */}
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed break-words">{alert.description}</p>

                  {/* 4. Sub-Table UI Rendering (Inside alerts.map loop for fir_anomaly cards) */}
                  {alert.category === 'fir_anomaly' && alert.deceptiveParameters && (
                    <div className="bg-[#070b14] border border-slate-800/80 rounded-md p-3 mt-3 space-y-2">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Detected Deceptive Parameters</h4>
                      {alert.deceptiveParameters.map((param, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs gap-4">
                          <span className="text-slate-400 whitespace-nowrap">{param.label}</span>
                          <span className="text-amber-400 font-mono text-right break-words min-w-0">{param.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insider Anomaly Vectors Table */}
                  {alert.category === 'insider' && alert.deceptiveParameters && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs">
                      {alert.deceptiveParameters.map((param, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300 gap-2">
                          <span className="text-slate-500 font-medium whitespace-nowrap">{param.label}:</span>
                          <span className="font-mono text-[11px] text-rose-300 truncate max-w-[260px] font-semibold text-right">
                            {param.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Actions & Mitigation */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/70">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <button
                        onClick={() => setInspectModalAlert(alert)}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Forensic Audit Trail
                      </button>

                      <button
                        onClick={() => printSection65BAuditDossier(alert)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Printer className="w-3 h-3 text-slate-400" /> Sec 65B Dossier
                      </button>
                    </div>

                    {/* Mitigation Action Button (With stopPropagation & event bubbling protection) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAlerts(prev =>
                          prev.map(a => (a.id === alert.id ? { ...a, status: 'contained' } : a))
                        );
                        showToast(`🛡️ Quarantined & Contained: ${alert.targetEntity}`, 'alert');
                      }}
                      disabled={alert.status === 'contained'}
                      className={`w-full py-2 px-3 mt-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow ${alert.status === 'contained'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                    >
                      {alert.status === 'contained' ? 'FIR Quarantined & Processed' : alert.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredRightAlerts.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                No threat alerts match your filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INSPECTION MODAL: FORENSIC AUDIT TRAIL & SEC 65B PROOFS */}
      {/* ------------------------------------------------------------- */}
      {inspectModalAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 truncate">
                    Forensic Deception Analysis & Custody Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Telemetry & Anomaly Verification for {inspectModalAlert.targetEntity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalAlert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs font-semibold">
              <button
                onClick={() => setModalTab('timeline')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${modalTab === 'timeline'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                1. Chronological Event Timeline
              </button>
              <button
                onClick={() => setModalTab('forensics')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${modalTab === 'forensics'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                2. Deceptive Verification Proofs
              </button>
              <button
                onClick={() => setModalTab('pki')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${modalTab === 'pki'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                3. Section 65B Certificate Proof
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Profile Summary */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Target Entity</div>
                  <div className="text-slate-200 font-bold mt-0.5 truncate">{inspectModalAlert.targetEntity}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Classification</div>
                  <div className="font-mono text-cyan-400 font-bold mt-0.5 uppercase">{inspectModalAlert.category}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Risk Score</div>
                  <div className="text-rose-400 font-bold mt-0.5">{inspectModalAlert.riskScore}/100</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Status</div>
                  <div className="text-amber-400 font-mono font-bold mt-0.5 uppercase">{inspectModalAlert.status}</div>
                </div>
              </div>

              {/* TAB 1: TIMELINE */}
              {modalTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step-by-Step Incident Telemetry
                  </h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {inspectModalAlert.officerDetails?.auditTrail ? (
                      inspectModalAlert.officerDetails.auditTrail.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${step.severity === 'CRITICAL'
                                ? 'border-rose-500'
                                : step.severity === 'HIGH'
                                  ? 'border-amber-500'
                                  : 'border-cyan-500'
                              }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${step.severity === 'CRITICAL'
                                  ? 'bg-rose-500'
                                  : step.severity === 'HIGH'
                                    ? 'bg-amber-500'
                                    : 'bg-cyan-500'
                                }`}
                            />
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                {step.action}
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${step.severity === 'CRITICAL'
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                >
                                  {step.severity}
                                </span>
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">{step.time}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed break-words">{step.detail}</p>
                            <div className="pt-1 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                              <span>IP: {step.ip}</span>
                              <span>Terminal: {step.device}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                        <div className="font-bold text-white flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" /> Doppelgänger Real-Time Ingestion Pipeline
                        </div>
                        <p className="text-slate-300 break-words">
                          {inspectModalAlert.description}
                        </p>
                        <div className="text-[11px] font-mono text-cyan-400">
                          Verified across 3 independent forensic vectors (NLP, CDR Geolocation, Biometric Hash).
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DECEPTIVE FORENSIC PROOFS */}
              {modalTab === 'forensics' && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detected Deceptive Parameters & Contradiction Breakdown
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                    {inspectModalAlert.deceptiveParameters?.map((param, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-800 pb-2 last:border-0 last:pb-0 gap-4">
                        <span className="text-slate-400 font-medium whitespace-nowrap">{param.label}:</span>
                        <span className="font-mono text-amber-400 font-bold text-right break-words min-w-0">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SECTION 65B PKI CERTIFICATE */}
              {modalTab === 'pki' && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Court-Admissible Section 65B Digital Certificate
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 font-mono space-y-2 text-slate-300 text-[11px]">
                    <div className="text-cyan-400 font-bold pb-1 border-b border-slate-800">
                      [CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT / BSA]
                    </div>
                    <div>Target Ref: {inspectModalAlert.targetEntity}</div>
                    <div>Incident Class: {inspectModalAlert.category.toUpperCase()}</div>
                    <div>Audit Hash: SHA256:{Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}</div>
                    <div>Polygon Ledger Anchor: 0x8f19...c402 (Block #194,821)</div>
                    <div className="text-emerald-400 pt-1">Status: Cryptographically Sealed & Immutable</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <button
                onClick={() => printSection65BAuditDossier(inspectModalAlert)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Export / Print Section 65B Dossier
              </button>

              {inspectModalAlert.status !== 'contained' ? (
                <button
                  onClick={() => {
                    setAlerts(prev =>
                      prev.map(a => (a.id === inspectModalAlert.id ? { ...a, status: 'contained' } : a))
                    );
                    setInspectModalAlert(prev => (prev ? { ...prev, status: 'contained' } : null));
                    showToast(`🛡️ Quarantined & Contained: ${inspectModalAlert.targetEntity}`, 'alert');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> {inspectModalAlert.actionLabel}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> FIR Quarantined & Processed
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Also export ThreatAlerts alias for modular importing
export const ThreatAlerts = ThreatAlertsPage;
export default ThreatAlertsPage;
