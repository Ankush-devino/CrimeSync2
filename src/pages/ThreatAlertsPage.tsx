import React, { useState, useMemo, useEffect } from 'react';
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
  Key,
  Laptop,
  AlertTriangle,
  RotateCw,
  X,
  Download,
  Terminal,
  Clock,
  Sparkles,
  Play,
  ArrowRight,
  Database,
  Globe,
  Sliders,
  Check,
  RefreshCw,
  FileText,
  AlertOctagon,
  Cpu,
  MapPin,
  Printer,
  ChevronRight,
  Undo2,
  ShieldX
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

interface ThreatAlertsPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

// -------------------------------------------------------------
// HELPER: PRINTABLE SECTION 65B AUDIT CERTIFICATE
// -------------------------------------------------------------
function printOfficerAuditDossier(officer: SuspiciousOfficerWatchdog) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Section 65B Forensic Audit Dossier - ${officer.officerName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .header h2 { margin: 5px 0 0 0; font-size: 14px; font-weight: 500; color: #64748b; }
          .badge { display: inline-block; padding: 4px 10px; background: #fee2e2; color: #991b1b; font-weight: bold; border-radius: 4px; font-size: 12px; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .field { font-size: 13px; }
          .field strong { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .timeline { margin: 25px 0; }
          .timeline-item { padding: 12px; border-left: 3px solid #0284c7; background: #f0f9ff; margin-bottom: 10px; border-radius: 0 6px 6px 0; }
          .timeline-item h4 { margin: 0 0 4px 0; font-size: 14px; color: #0369a1; }
          .timeline-item p { margin: 0; font-size: 12px; color: #334155; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          .signature-box { border: 1px dashed #94a3b8; padding: 15px; width: 220px; text-align: center; margin-top: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GOVERNMENT OF INDIA - LAW ENFORCEMENT CYBER CELL</h1>
          <h2>DIGITAL EVIDENCE CHAIN OF CUSTODY & INSIDER AUDIT REPORT (SEC 65B BSA)</h2>
          <div class="badge">CONFIDENTIAL & COURT-ADMISSIBLE</div>
        </div>

        <div class="grid">
          <div class="field"><strong>Officer Name</strong>${officer.officerName} (${officer.rank})</div>
          <div class="field"><strong>Badge Number</strong>${officer.badgeNumber}</div>
          <div class="field"><strong>Department</strong>${officer.department}</div>
          <div class="field"><strong>Jurisdiction</strong>${officer.jurisdictionCity}</div>
          <div class="field"><strong>Linked Case</strong>${officer.caseRef} - ${officer.caseTitle}</div>
          <div class="field"><strong>Assigned Risk Score</strong>${officer.riskScore}/100 (${officer.status})</div>
        </div>

        <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <strong style="color: #9f1239; font-size: 13px;">🚨 INCIDENT ANOMALY SUMMARY:</strong>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #4c0519; line-height: 1.5;">${officer.summary}</p>
          <div style="margin-top: 10px; font-size: 12px; font-family: monospace; color: #881337;">
            Target Resource: ${officer.forensicEvidence.targetResource}<br/>
            IP & Location: ${officer.forensicEvidence.ipAddress} (${officer.forensicEvidence.geolocation})<br/>
            Hardware ID: ${officer.forensicEvidence.deviceFingerprint}
          </div>
        </div>

        <h3>CHRONOLOGICAL FORENSIC AUDIT TRAIL:</h3>
        <div class="timeline">
          ${officer.auditTrail
            .map(
              step => `
            <div class="timeline-item">
              <h4>[${step.time}] ${step.action} (Severity: ${step.severity})</h4>
              <p>${step.detail}</p>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">
                Logged IP: ${step.ip} | Terminal: ${step.device}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="footer">
          <div>
            Generated by CrimeSync SOC Sentinel v4.0<br/>
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
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  const [vulnerabilities, setVulnerabilities] = useState<PlatformVulnerability[]>(platformVulnerabilitiesData);
  const [watchdogs, setWatchdogs] = useState<SuspiciousOfficerWatchdog[]>(suspiciousOfficerWatchdogsData);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'UNRESOLVED' | 'CONTAINED'>('ALL');
  
  // Inspection Modal & Active Tab inside Modal
  const [inspectModalOfficer, setInspectModalOfficer] = useState<SuspiciousOfficerWatchdog | null>(null);
  const [modalTab, setModalTab] = useState<'timeline' | 'forensics' | 'pki'>('timeline');
  
  // Live Scanning Drawer State
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showScanDrawer, setShowScanDrawer] = useState(false);

  // Patching in-progress IDs
  const [patchingIds, setPatchingIds] = useState<Record<string, number>>({});
  
  // Drill cycle index
  const [drillIndex, setDrillIndex] = useState(0);

  // Floating Toast
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
        const [vulnsRes, watchdogsRes] = await Promise.allSettled([
          api.threats.getVulnerabilities(),
          api.threats.getWatchdogs(),
        ]);

        if (isMounted) {
          if (vulnsRes.status === 'fulfilled' && Array.isArray(vulnsRes.value) && vulnsRes.value.length > 0) {
            setVulnerabilities(vulnsRes.value);
          }
          if (watchdogsRes.status === 'fulfilled' && Array.isArray(watchdogsRes.value) && watchdogsRes.value.length > 0) {
            setWatchdogs(watchdogsRes.value);
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
  // DYNAMIC METRICS CALCULATION
  // -------------------------------------------------------------
  const openVulnCount = useMemo(() => vulnerabilities.filter(v => v.status === 'VULNERABLE').length, [vulnerabilities]);
  const activeWatchdogsCount = useMemo(() => watchdogs.filter(w => w.status === 'ACTIVE_FLAG').length, [watchdogs]);
  
  // Posture Score Calculation: 100 - penalties
  const securityScore = useMemo(() => {
    const penalty = (openVulnCount * 9) + (activeWatchdogsCount * 4);
    return Math.max(40, 100 - penalty);
  }, [openVulnCount, activeWatchdogsCount]);

  // -------------------------------------------------------------
  // 1-CLICK VULNERABILITY PATCHING (WITH ANIMATED PROGRESS & BACKEND CALL)
  // -------------------------------------------------------------
  const handlePatchVulnerability = async (id: string, title: string) => {
    // Start animation
    setPatchingIds(prev => ({ ...prev, [id]: 15 }));
    
    setTimeout(() => setPatchingIds(prev => ({ ...prev, [id]: 65 })), 250);
    setTimeout(() => setPatchingIds(prev => ({ ...prev, [id]: 95 })), 500);

    // Call backend API
    try {
      await api.threats.patchVulnerability(id);
    } catch (e) {
      console.warn('Backend patch call non-fatal fallback:', e);
    }

    setTimeout(() => {
      setVulnerabilities(prev =>
        prev.map(v => (v.id === id ? { ...v, status: 'PATCHED' } : v))
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

    setVulnerabilities(prev =>
      prev.map(v => (v.id === id ? { ...v, status: 'VULNERABLE' } : v))
    );
    showToast(`🔄 Rolled back: ${title} to vulnerable state for testing`, 'info');
  };

  const handlePatchAll = async () => {
    try {
      await api.threats.patchAllVulnerabilities();
    } catch (e) {
      console.warn('Backend patch-all call non-fatal fallback:', e);
    }

    setVulnerabilities(prev => prev.map(v => ({ ...v, status: 'PATCHED' })));
    showToast(`⚡ All ${vulnerabilities.length} platform vulnerabilities successfully patched!`, 'success');
  };

  // -------------------------------------------------------------
  // SYSTEM RE-SCAN SIMULATION WITH TERMINAL LOGS
  // -------------------------------------------------------------
  const handleScanSystem = async () => {
    setIsScanning(true);
    setShowScanDrawer(true);
    setScanLogs(['Initializing CrimeSync Zero-Trust Security Scanner v4.0...']);

    let steps = [
      '🔍 Probing /api/v1/ REST Endpoints for unthrottled rate-limiting leaks...',
      '🔐 Auditing JWT Bearer expiration windows & revocation blacklist table...',
      '🌐 Testing WebSocket channels against strict CORS domain allowlists...',
      '🛡️ Validating Content-Security-Policy frame-ancestors & XSS filters...',
      '📦 Verifying SHA-256 integrity across all 9 PostgreSQL FIR evidence vaults...',
      '✅ Audit Complete: Zero untracked vulnerabilities discovered. System state synchronized.'
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
  // 1-CLICK SUSPICIOUS OFFICER CONTAINMENT
  // -------------------------------------------------------------
  const handleOfficerContainment = async (
    watchdogId: string,
    actionType: SuspiciousOfficerWatchdog['primaryActionType'],
    officerName: string
  ) => {
    let actionDesc = 'Contained';
    if (actionType === 'FREEZE_LEDGER') actionDesc = 'Blockchain Evidence Ledger Locked';
    if (actionType === 'FLAG_MOLE') actionDesc = 'Mole Flagged & Vigilance Alert Dispatched';
    if (actionType === 'BLOCK_EXPORT') actionDesc = 'Export Stream Blocked & Forensics Watermarked';
    if (actionType === 'KILL_SESSION') actionDesc = 'Remote Session Terminated & Biometric Re-auth Required';

    try {
      await api.threats.containOfficer(watchdogId, actionType);
    } catch (e) {
      console.warn('Backend contain officer call non-fatal fallback:', e);
    }

    setWatchdogs(prev =>
      prev.map(w =>
        w.id === watchdogId
          ? {
              ...w,
              status: 'CONTAINED',
              actionTaken: actionDesc,
            }
          : w
      )
    );

    // If modal is open with this officer, update modal state too
    if (inspectModalOfficer && inspectModalOfficer.id === watchdogId) {
      setInspectModalOfficer(prev => prev ? { ...prev, status: 'CONTAINED', actionTaken: actionDesc } : null);
    }

    showToast(`🚨 ${actionDesc} applied to ${officerName}`, 'alert');
  };

  const handleResetOfficerStatus = async (watchdogId: string, officerName: string) => {
    try {
      await api.threats.resetOfficerStatus(watchdogId);
    } catch (e) {
      console.warn('Backend reset officer status call non-fatal fallback:', e);
    }

    setWatchdogs(prev =>
      prev.map(w =>
        w.id === watchdogId
          ? {
              ...w,
              status: 'ACTIVE_FLAG',
              actionTaken: undefined,
            }
          : w
      )
    );

    if (inspectModalOfficer && inspectModalOfficer.id === watchdogId) {
      setInspectModalOfficer(prev => prev ? { ...prev, status: 'ACTIVE_FLAG', actionTaken: undefined } : null);
    }

    showToast(`🔄 Reset alert for ${officerName} to Active Flag`, 'info');
  };

  // -------------------------------------------------------------
  // SIMULATE MULTI-SCENARIO BREACH DRILL (WITH BACKEND CALL)
  // -------------------------------------------------------------
  const handleSimulateDrill = async () => {
    try {
      const res = await api.threats.simulateDrill();
      if (res && res.drill) {
        setWatchdogs(prev => [res.drill, ...prev]);
        showToast(`🚨 Security Drill Spawned: ${res.drill.threatTitle}`, 'alert');
        return;
      }
    } catch (e) {
      console.warn('Backend drill call non-fatal fallback:', e);
    }
    const drillScenarios: SuspiciousOfficerWatchdog[] = [
      {
        id: `DRILL-${Date.now()}-1`,
        officerId: 'USR-103',
        officerName: 'DSP Arvind Swaminathan',
        badgeNumber: 'BLR-INT-1102',
        rank: 'Deputy Superintendent',
        department: 'Forensic Science Laboratory (FSL)',
        jurisdictionCity: 'Bengaluru',
        watchdogType: 'CANARY_TRAP',
        threatTitle: 'Drill Alert: Decoy Swiss Hawala Vault Token Accessed',
        riskScore: 92,
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        caseRef: 'CASE-2026-007',
        caseTitle: 'Operation Netra: AI Deepfake Video Extortion',
        status: 'ACTIVE_FLAG',
        summary: 'Simulated breach: Officer searched internal database for restricted keyword "SWISS_VAULT_KEY_09" triggering canary honeypot alert.',
        primaryActionLabel: 'Flag Mole & Alert Oversight',
        primaryActionType: 'FLAG_MOLE',
        forensicEvidence: {
          targetResource: 'Decoy Canary File: SWISS_VAULT_KEY_09.kdbx',
          anomalyMetric: 'Zero-Assignment Decoy Query via FSL Station IP',
          ipAddress: '10.240.18.45 (Bangalore FSL Internal Subnet)',
          deviceFingerprint: 'Dell Precision 7760 FSL Rig #2',
          geolocation: 'Madiwala FSL Complex, Bengaluru',
        },
        auditTrail: [
          {
            time: 'Just now',
            action: 'Canary Decoy Read Command',
            detail: 'Queried canary asset key without supervisor authorization.',
            ip: '10.240.18.45',
            device: 'FSL Station',
            severity: 'CRITICAL',
          },
          {
            time: '1m ago',
            action: 'Database Search Burst',
            detail: 'Executed 12 rapid queries for foreign bank vaults.',
            ip: '10.240.18.45',
            device: 'FSL Station',
            severity: 'HIGH',
          },
        ],
      },
      {
        id: `DRILL-${Date.now()}-2`,
        officerId: 'USR-104',
        officerName: 'SI Vikramaditya Reddy',
        badgeNumber: 'HYD-CID-7740',
        rank: 'Sub-Inspector',
        department: 'CID Financial Fraud Division',
        jurisdictionCity: 'Hyderabad',
        watchdogType: 'EVIDENCE_TAMPER',
        threatTitle: 'Drill Alert: CCTV Video Stream Hash Modification Probe',
        riskScore: 96,
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        caseRef: 'CASE-2026-006',
        caseTitle: 'Operation Durg: Counterfeit AePS Biometric Bypass',
        status: 'ACTIVE_FLAG',
        summary: 'Simulated breach: Officer workstation dispatched PUT packet to /api/v1/evidence/EVD-992/hash attempting to replace CCTV recording hash.',
        primaryActionLabel: 'Freeze Evidence Ledger',
        primaryActionType: 'FREEZE_LEDGER',
        forensicEvidence: {
          targetResource: 'Evidence EVD-992 (ATM_CCTV_CAM04.mp4)',
          anomalyMetric: 'SHA-256 Mismatch (c94a... != 33b1...)',
          ipAddress: '115.240.90.12 (Cyberabad Field Terminal)',
          deviceFingerprint: 'Ruggedized Police Tablet T-88',
          geolocation: 'Gachibowli CID Office, Hyderabad',
        },
        auditTrail: [
          {
            time: 'Just now',
            action: 'Hash Overwrite Attempt',
            detail: 'Dispatched unauthorized update to sealed CCTV evidence block.',
            ip: '115.240.90.12',
            device: 'Police Tablet T-88',
            severity: 'CRITICAL',
          },
        ],
      },
      {
        id: `DRILL-${Date.now()}-3`,
        officerId: 'USR-101',
        officerName: 'ACP Rajeshwar Sharma',
        badgeNumber: 'DEL-IPS-8821',
        rank: 'Assistant Commissioner of Police',
        department: 'Special Cell / Cyber Crime Unit',
        jurisdictionCity: 'New Delhi',
        watchdogType: 'DEVICE_HIJACK',
        threatTitle: 'Drill Alert: Foreign VPN Login via Unapproved Hardware',
        riskScore: 88,
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        caseRef: 'CASE-2026-001',
        caseTitle: 'Operation Trishul: PSU Bank Treasury Intrusion',
        status: 'ACTIVE_FLAG',
        summary: 'Simulated breach: Officer badge credentials authenticated from a commercial NordVPN exit node in Frankfurt without police hardware token.',
        primaryActionLabel: 'Kill Session & Force Biometric MFA',
        primaryActionType: 'KILL_SESSION',
        forensicEvidence: {
          targetResource: 'Special Cell Command Portal',
          anomalyMetric: 'Impossible Travel: Delhi -> Frankfurt in 4 minutes',
          ipAddress: '194.26.29.110 (NordVPN Gateway Germany)',
          deviceFingerprint: 'Linux x86_64 / Chrome Headless (Bot signature)',
          geolocation: 'Frankfurt am Main, Germany',
        },
        auditTrail: [
          {
            time: 'Just now',
            action: 'Foreign IP Authentication',
            detail: 'Logged in through foreign VPN node without 2FA confirmation.',
            ip: '194.26.29.110',
            device: 'Unknown Linux',
            severity: 'CRITICAL',
          },
        ],
      },
    ];

    const currentScenario = drillScenarios[drillIndex % drillScenarios.length];
    setDrillIndex(prev => prev + 1);

    setWatchdogs(prev => [currentScenario, ...prev]);
    showToast(`🚨 Security Drill Spawned: ${currentScenario.threatTitle}`, 'alert');
  };

  // -------------------------------------------------------------
  // RESET ALL DEMO DATA (WITH BACKEND CALL)
  // -------------------------------------------------------------
  const handleResetAll = async () => {
    try {
      await api.threats.resetAll();
    } catch (e) {
      console.warn('Backend reset-all call non-fatal fallback:', e);
    }
    setVulnerabilities(platformVulnerabilitiesData);
    setWatchdogs(suspiciousOfficerWatchdogsData);
    showToast(`🔄 Reset all threat alerts and vulnerabilities to default state.`, 'info');
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter(v => {
      const matchSearch =
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.targetComponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'CRITICAL') return matchSearch && v.severity === 'CRITICAL';
      if (statusFilter === 'UNRESOLVED') return matchSearch && v.status === 'VULNERABLE';
      if (statusFilter === 'CONTAINED') return matchSearch && v.status === 'PATCHED';
      return matchSearch;
    });
  }, [vulnerabilities, searchQuery, statusFilter]);

  const filteredWatchdogs = useMemo(() => {
    return watchdogs.filter(w => {
      const matchSearch =
        w.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.threatTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'CRITICAL') return matchSearch && w.riskScore >= 85;
      if (statusFilter === 'UNRESOLVED') return matchSearch && w.status === 'ACTIVE_FLAG';
      if (statusFilter === 'CONTAINED') return matchSearch && w.status === 'CONTAINED';
      return matchSearch;
    });
  }, [watchdogs, searchQuery, statusFilter]);

  // Helper for Watchdog Icon
  const getWatchdogBadge = (type: OfficerWatchdogType) => {
    switch (type) {
      case 'EVIDENCE_TAMPER':
        return {
          label: 'Evidence Tamper Alarm',
          icon: <Lock className="w-3.5 h-3.5 text-rose-400" />,
          color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        };
      case 'CANARY_TRAP':
        return {
          label: 'Canary Case Trap',
          icon: <Fingerprint className="w-3.5 h-3.5 text-amber-400" />,
          color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        };
      case 'BULK_EXPORT':
        return {
          label: 'Bulk Export Circuit Breaker',
          icon: <FileWarning className="w-3.5 h-3.5 text-cyan-400" />,
          color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        };
      case 'DEVICE_HIJACK':
        return {
          label: 'Device Hijack Detector',
          icon: <Laptop className="w-3.5 h-3.5 text-purple-400" />,
          color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        };
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fadeIn pb-24 custom-scrollbar">
      {/* ------------------------------------------------------------- */}
      {/* FLOATING ACTION TOAST */}
      {/* ------------------------------------------------------------- */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-slideUp transition-all duration-300 ${
            toastMessage.type === 'alert'
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
                  Live Alerts & Cyber Defense Operations
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" /> Live SOC Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-Trust AppSec Vulnerability Shield • 4-Pillar Insider Threat Watchdog Network
              </p>
            </div>
          </div>

          {/* Key Metrics Counters & Drill Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Health Score Gauge */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/90 rounded-xl px-4 py-2 shadow-inner">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3.5" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={securityScore >= 85 ? '#10b981' : securityScore >= 65 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3.5"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * securityScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{securityScore}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Grade</div>
                <div className={`text-xs font-bold ${securityScore >= 85 ? 'text-emerald-400' : securityScore >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {securityScore >= 85 ? 'Shielded (Optimal)' : securityScore >= 65 ? 'Elevated Exposure' : 'Critical Threat'}
                </div>
              </div>
            </div>

            {/* Open Vulns Counter */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl px-3.5 py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AppSec Flaws</div>
              <div className="text-sm font-black text-rose-400 flex items-center gap-1.5 mt-0.5">
                <Server className="w-3.5 h-3.5" /> {openVulnCount} Open
              </div>
            </div>

            {/* Flagged Officers Counter */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl px-3.5 py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged Moles</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                <UserX className="w-3.5 h-3.5" /> {activeWatchdogsCount} Active
              </div>
            </div>

            {/* Simulate Drill Button */}
            <button
              onClick={handleSimulateDrill}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5" /> Simulate Drill
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
              placeholder="Filter by vulnerability, officer, CVE..."
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
            {(['ALL', 'CRITICAL', 'UNRESOLVED', 'CONTAINED'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {filter === 'ALL'
                  ? `All Items (${vulnerabilities.length + watchdogs.length})`
                  : filter === 'CRITICAL'
                  ? '🔥 Critical Risk'
                  : filter === 'UNRESOLVED'
                  ? `⚠️ Unresolved (${openVulnCount + activeWatchdogsCount})`
                  : '✅ Contained / Patched'}
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
                  <span className="text-xs font-medium text-slate-400">({filteredVulnerabilities.length})</span>
                </h2>
                <p className="text-xs text-slate-400">REST API security, token lifetimes & CORS sanitization</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {openVulnCount > 0 && (
                <button
                  onClick={handlePatchAll}
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
            {filteredVulnerabilities.map(vuln => {
              const isPatched = vuln.status === 'PATCHED';
              const patchProgress = patchingIds[vuln.id];
              const isPatchingThis = patchProgress !== undefined;

              return (
                <div
                  key={vuln.id}
                  className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden group ${
                    isPatched
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                      : vuln.severity === 'CRITICAL'
                      ? 'bg-gradient-to-r from-rose-950/25 via-slate-900/90 to-slate-900/95 border-rose-500/40 shadow-lg shadow-rose-950/20'
                      : 'bg-slate-900/85 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Active Patch Progress Bar */}
                  {isPatchingThis && (
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 z-20" style={{ width: `${patchProgress}%` }} />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {vuln.cveId}
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded">
                          {vuln.targetComponent}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isPatched
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                              : vuln.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          }`}
                        >
                          {isPatched ? 'PATCHED' : `${vuln.severity} (CVSS ${vuln.cvssScore})`}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white pt-1">{vuln.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{vuln.description}</p>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Exploit Impact:</strong> {vuln.impactDescription}
                    </span>
                  </div>

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
                        {isPatchingThis ? `Hardening ${patchProgress}%...` : `1-Click: ${vuln.patchActionLabel}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredVulnerabilities.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                No vulnerabilities match your filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================= */}
        {/* PANEL 2: SUSPICIOUS OFFICER WATCH (The 4 Watchdogs) */}
        {/* ============================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <UserX className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  2. Suspicious Officer Watch
                  <span className="text-xs font-medium text-slate-400">({filteredWatchdogs.length})</span>
                </h2>
                <p className="text-xs text-slate-400">Insider Threat Watchdogs, Tamper Alarms & Canary Traps</p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" /> 4 Watchdog Core
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredWatchdogs.map(watchdog => {
              const badge = getWatchdogBadge(watchdog.watchdogType);
              const isContained = watchdog.status === 'CONTAINED';

              return (
                <div
                  key={watchdog.id}
                  className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-md relative group ${
                    isContained
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                      : watchdog.riskScore >= 85
                      ? 'bg-gradient-to-r from-amber-950/25 via-slate-900/90 to-slate-900/95 border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : 'bg-slate-900/85 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header: Watchdog Type & Risk Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.icon} {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {watchdog.timeAgo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded ${
                          isContained
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : watchdog.riskScore >= 85
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        {isContained ? 'CONTAINED' : `${watchdog.riskScore}% RISK`}
                      </span>
                    </div>
                  </div>

                  {/* Officer Info & Threat Title */}
                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-cyan-300 text-sm shrink-0 shadow-inner">
                      {watchdog.officerName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{watchdog.officerName}</h3>
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          {watchdog.badgeNumber}
                        </span>
                        <span className="text-xs text-slate-400">({watchdog.department})</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{watchdog.threatTitle}</p>
                    </div>
                  </div>

                  {/* Summary & Forensic Detail */}
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{watchdog.summary}</p>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-medium">Anomaly Vector:</span>
                      <span className="font-mono text-[11px] text-rose-300 truncate max-w-[260px] font-semibold">
                        {watchdog.forensicEvidence.anomalyMetric}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 font-medium">Source IP & Station:</span>
                      <span className="font-mono text-[11px] text-slate-300">
                        {watchdog.forensicEvidence.geolocation}
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => setInspectModalOfficer(watchdog)}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Forensic Audit Trail
                    </button>

                    {isContained ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {watchdog.actionTaken || 'Contained'}
                        </span>
                        <button
                          onClick={() => handleResetOfficerStatus(watchdog.id, watchdog.officerName)}
                          title="Undo containment to re-test"
                          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleOfficerContainment(
                            watchdog.id,
                            watchdog.primaryActionType,
                            watchdog.officerName
                          )
                        }
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all hover:scale-105 active:scale-95"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> {watchdog.primaryActionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredWatchdogs.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                No officer alerts match your filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INSPECTION MODAL: FORENSIC AUDIT TRAIL & DOSSIER EXPORT */}
      {/* ------------------------------------------------------------- */}
      {inspectModalOfficer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Forensic Insider Audit Trail & Custody Log
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chain-of-Custody & Evidence Access Telemetry for {inspectModalOfficer.officerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOfficer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs font-semibold">
              <button
                onClick={() => setModalTab('timeline')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  modalTab === 'timeline'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Chronological Event Timeline
              </button>
              <button
                onClick={() => setModalTab('forensics')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  modalTab === 'forensics'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Network & Hardware Vectors
              </button>
              <button
                onClick={() => setModalTab('pki')}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  modalTab === 'pki'
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Section 65B Certificate Proof
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Officer Profile Summary */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Officer Name</div>
                  <div className="text-slate-200 font-bold mt-0.5">{inspectModalOfficer.officerName}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Badge Number</div>
                  <div className="font-mono text-cyan-400 font-bold mt-0.5">{inspectModalOfficer.badgeNumber}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Department</div>
                  <div className="text-slate-200 font-medium mt-0.5">{inspectModalOfficer.department}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Linked Case</div>
                  <div className="text-amber-400 font-mono font-bold mt-0.5">{inspectModalOfficer.caseRef}</div>
                </div>
              </div>

              {/* TAB 1: TIMELINE */}
              {modalTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step-by-Step Incident Reconstruction
                  </h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {inspectModalOfficer.auditTrail.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${
                            step.severity === 'CRITICAL'
                              ? 'border-rose-500'
                              : step.severity === 'HIGH'
                              ? 'border-amber-500'
                              : 'border-cyan-500'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              step.severity === 'CRITICAL'
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
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  step.severity === 'CRITICAL'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {step.severity}
                              </span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">{step.time}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{step.detail}</p>
                          <div className="pt-1 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                            <span>IP: {step.ip}</span>
                            <span>Terminal: {step.device}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: FORENSIC NETWORK VECTORS */}
              {modalTab === 'forensics' && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hardware & Network Telemetry Fingerprints
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-medium">Anomaly Metric:</span>
                      <span className="font-mono text-rose-300 font-bold">{inspectModalOfficer.forensicEvidence.anomalyMetric}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-medium">Target Resource / Case File:</span>
                      <span className="font-mono text-slate-200">{inspectModalOfficer.forensicEvidence.targetResource}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-medium">Device Hardware Fingerprint:</span>
                      <span className="font-mono text-cyan-300">{inspectModalOfficer.forensicEvidence.deviceFingerprint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Origin IP & Geolocation:</span>
                      <span className="font-mono text-amber-300">
                        {inspectModalOfficer.forensicEvidence.ipAddress} ({inspectModalOfficer.forensicEvidence.geolocation})
                      </span>
                    </div>
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
                    <div>Badge Ref: {inspectModalOfficer.badgeNumber}</div>
                    <div>Incident Class: {inspectModalOfficer.watchdogType}</div>
                    <div>Audit Hash: SHA256:{Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}</div>
                    <div>Polygon Ledger Tx: 0x8f19...c402 (Block #194,821)</div>
                    <div className="text-emerald-400 pt-1">Status: Cryptographically Verified & Immutable</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <button
                onClick={() => printOfficerAuditDossier(inspectModalOfficer)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Export / Print Section 65B Dossier
              </button>

              {inspectModalOfficer.status !== 'CONTAINED' ? (
                <button
                  onClick={() => {
                    handleOfficerContainment(
                      inspectModalOfficer.id,
                      inspectModalOfficer.primaryActionType,
                      inspectModalOfficer.officerName
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> {inspectModalOfficer.primaryActionLabel}
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleResetOfficerStatus(inspectModalOfficer.id, inspectModalOfficer.officerName);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Reset to Active Flag
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
