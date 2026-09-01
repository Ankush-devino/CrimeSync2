import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Zap,
  Activity,
  Lock,
  Search,
  Plus,
  Download,
  Terminal,
  ChevronRight,
  Flame,
  X,
  Network,
  CheckCircle2,
  Radio,
  Sliders,
  Server,
  Layers,
  Clock
} from 'lucide-react';
import {
  threatAlertsMetricsData,
  siemAlertsData,
  threatCampaignsData,
  threatActorsData,
  soarPlaybooksData,
  siemConnectorsData,
} from '../data/mockData';
import type {
  SiemAlert,
  SoarPlaybook,
  AlertCategory,
  AlertStatus,
  Severity,
} from '../types/dashboard';

interface ThreatAlertsPageProps {
  onSelectAction?: (action: string) => void;
}

type TabType = 'live-stream' | 'correlation-matrix' | 'threat-actors' | 'soar-playbooks' | 'siem-health';

export const ThreatAlertsPage: React.FC<ThreatAlertsPageProps> = ({ onSelectAction }) => {
  // Page State
  const [activeTab, setActiveTab] = useState<TabType>('live-stream');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Data State (supports live alert simulation, status updates, and containment actions)
  const [alerts, setAlerts] = useState<SiemAlert[]>(siemAlertsData);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(siemAlertsData[0]?.id || '');
  const [selectedAlertModal, setSelectedAlertModal] = useState<SiemAlert | null>(null);
  const [playbooks, setPlaybooks] = useState<SoarPlaybook[]>(soarPlaybooksData);
  const [simulationBanner, setSimulationBanner] = useState<{ active: boolean; message: string; alertId: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);

  // New Playbook Form State
  const [newPlaybookName, setNewPlaybookName] = useState('');
  const [newPlaybookCondition, setNewPlaybookCondition] = useState('');
  const [newPlaybookAction, setNewPlaybookAction] = useState('');

  // Active Selected Alert
  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === selectedAlertId) || alerts[0];
  }, [alerts, selectedAlertId]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sourceIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destinationTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.correlatedCaseRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.mitreTechnique.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
      const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;

      return matchSearch && matchSeverity && matchCategory;
    });
  }, [alerts, searchQuery, severityFilter, categoryFilter]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Trigger Simulated Inbound Threat Alert
  const handleSimulateAlert = () => {
    const alertId = `ALR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert: SiemAlert = {
      id: alertId,
      title: 'CRITICAL INTRUSION: Remote Privilege Escalation via Decoy API Key',
      severity: 'CRITICAL',
      category: 'HONEYPOT',
      status: 'NEW',
      timestamp: new Date().toLocaleTimeString() + ' IST',
      sourceIp: '185.191.171.42',
      destinationTarget: 'CrimeSync Staging Evidence Vault (/api/v2/vault/keys)',
      geoLocation: 'External Tor Relayed (Frankfurt, DE)',
      mitreAttackId: 'T1078.004',
      mitreTechnique: 'Cloud Accounts / STS Token Compromise',
      attackVector: 'Stolen AWS Canary IAM Token Replay from foreign IP',
      payloadHash: 'b4920b120c91823abce809182470129a01f981093409824810237728192a4891',
      correlatedCaseRef: 'RC-2026-0417 (Aman Khan Syndicate)',
      assignedInvestigator: 'Cyber Defense Directorate NOC',
      rawPcapSummary: 'HTTP POST /api/v2/vault/keys with Authorization: Bearer AWS_CANARY_IAM_KEY',
      automatedContainmentAvailable: true,
      threatScore: 99,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setSelectedAlertId(newAlert.id);

    setSimulationBanner({
      active: true,
      message: `SIEM HIGH-PRIORITY INTRUSION DETECTED: ${newAlert.title}`,
      alertId: newAlert.id,
    });

    if (onSelectAction) {
      onSelectAction(`Inbound Critical Threat Alert Ingested: ${newAlert.id}`);
    }

    setTimeout(() => {
      setSimulationBanner(null);
    }, 7000);
  };

  // Update Status of an Alert
  const handleUpdateStatus = (alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
    if (onSelectAction) {
      onSelectAction(`Alert ${alertId} status changed to ${newStatus}`);
    }
  };

  // Acknowledge All Alerts
  const handleAcknowledgeAll = () => {
    setAlerts((prev) =>
      prev.map((a) => (a.status === 'NEW' ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (onSelectAction) {
      onSelectAction('All NEW Threat Alerts Acknowledged by SOC Operator');
    }
  };

  // Toggle SOAR Playbook State
  const handleTogglePlaybook = (playbookId: string) => {
    setPlaybooks((prev) =>
      prev.map((p) =>
        p.id === playbookId ? { ...p, status: p.status === 'ENABLED' ? 'PAUSED' : 'ENABLED' } : p
      )
    );
  };

  // Add New Custom Playbook
  const handleCreatePlaybook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaybookName.trim()) return;

    const newPlaybook: SoarPlaybook = {
      id: `soar-${Date.now()}`,
      name: newPlaybookName.trim(),
      triggerCondition: newPlaybookCondition.trim() || 'Severity == CRITICAL',
      actionPipeline: newPlaybookAction.split('\n').filter((l) => l.trim().length > 0),
      automatedExecution: true,
      status: 'ENABLED',
      executionsCount: 0,
      lastTriggered: 'Never',
    };

    setPlaybooks((prev) => [newPlaybook, ...prev]);
    setIsPlaybookModalOpen(false);
    setNewPlaybookName('');
    setNewPlaybookCondition('');
    setNewPlaybookAction('');

    if (onSelectAction) {
      onSelectAction(`SOAR Playbook Created: ${newPlaybook.name}`);
    }
  };

  // Helper for Severity Badges
  const renderSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-950/90 border border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-950/90 border border-orange-500/60 text-orange-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-950/80 border border-blue-500/50 text-blue-300">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-900 border border-slate-700 text-slate-400">
            LOW
          </span>
        );
    }
  };

  // Helper for Category Badges
  const renderCategoryBadge = (cat: AlertCategory) => {
    switch (cat) {
      case 'HONEYPOT':
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-purple-950 border border-purple-500 text-purple-300">HONEYPOT</span>;
      case 'INTRUSION':
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-red-950 border border-red-500 text-red-300">INTRUSION</span>;
      case 'DATA_LEAK':
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-amber-950 border border-amber-500 text-amber-300">DATA LEAK</span>;
      case 'INSIDER':
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-orange-950 border border-orange-500 text-orange-300">INSIDER</span>;
      case 'IDENTITY':
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-cyan-950 border border-cyan-500 text-cyan-300">IDENTITY</span>;
      case 'MALWARE':
      default:
        return <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-slate-900 border border-slate-700 text-slate-400">MALWARE</span>;
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950/90 border border-red-500 text-red-300 animate-pulse">
            NEW UNRESOLVED
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/90 border border-amber-500/60 text-amber-300">
            UNDER INVESTIGATION
          </span>
        );
      case 'CONTAINED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 border border-emerald-500/60 text-emerald-300">
            CONTAINED / AIRGAPPED
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-950 border border-blue-500/50 text-blue-300">
            ACKNOWLEDGED
          </span>
        );
      case 'DISMISSED':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-900 border border-slate-700 text-slate-500">
            DISMISSED
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-3.5 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Simulation Alert Toast ──────────────────────────────────────────────── */}
      {simulationBanner && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-950/95 via-[#230909] to-orange-950/95 border border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  SIEM REAL-TIME CRITICAL INTRUSION TRIGGERED
                </span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded">
                  DEFCON 1 ALARM
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{simulationBanner.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAlertId(simulationBanner.alertId)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Inspect Inbound Alert
            </button>
            <button
              onClick={() => setSimulationBanner(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Top Control & Status Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#111e33] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              THREAT ALERTS & SIEM INTELLIGENCE OPERATIONS
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold">
                {threatAlertsMetricsData.socDefconLevel}
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Centralized Security Information & Event Management (SIEM) aggregating police networks, deception traps & blockchain evidence logs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
            <span className="text-red-400 font-mono text-[10.5px]">{threatAlertsMetricsData.eventsPerSecond}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulate Inbound Alert */}
          <button
            onClick={handleSimulateAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Inbound Alert</span>
          </button>

          {/* Acknowledge All Alarms */}
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Acknowledge All</span>
          </button>

          {/* SOAR Automation Setup */}
          <button
            onClick={() => setIsPlaybookModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-cyan-500/40 text-xs text-cyan-300 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>SOAR Playbooks</span>
          </button>

          {/* Export SIEM Report */}
          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Certified SIEM Threat Intelligence Log')}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Export SIEM Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Top Telemetry KPI Row (6 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Card 1: Total Alerts */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-red-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">Active Alarms</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white font-mono">{alerts.length}</span>
            <span className="text-[9px] font-bold text-red-400">{alerts.filter((a) => a.severity === 'CRITICAL').length} Critical</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Real-time triage stream</span>
        </div>

        {/* Card 2: Tier-1 Alarms */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-orange-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-orange-400 uppercase tracking-wider">Unresolved Tier-1</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-orange-400 font-mono">
              {alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'NEW').length}
            </span>
            <span className="text-[9px] font-medium text-slate-400">Action Req</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Requires Special Cell review</span>
        </div>

        {/* Card 3: MTTA */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-emerald-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">Mean Time to Ack</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{threatAlertsMetricsData.meanTimeToAcknowledge}</span>
            <span className="text-[9px] font-medium text-emerald-300">Fast SOC</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">98% Auto-Assigned</span>
        </div>

        {/* Card 4: MTTR */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-cyan-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider">Mean Time to Remediate</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-300 font-mono">{threatAlertsMetricsData.meanTimeToRemediate}</span>
            <span className="text-[9px] font-medium text-cyan-400">Auto-SOAR</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Containment Isolation</span>
        </div>

        {/* Card 5: Correlated Actors */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-purple-900/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Threat Actors</span>
            <Network className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-purple-300 font-mono">{threatActorsData.length}</span>
            <span className="text-[9px] font-bold text-purple-400">Syndicates</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Aman Khan / Shadow / Insiders</span>
        </div>

        {/* Card 6: Ingestion EPS */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">SIEM Ingestion</span>
            <Radio className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-orange-400 font-mono">{threatAlertsMetricsData.eventsPerSecond}</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Suricata, Wazuh, CloudTrail</span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#111e33] pb-2 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('live-stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'live-stream'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Live Threat Alert Stream</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 font-mono text-[9px] font-bold border border-red-500/40">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('correlation-matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'correlation-matrix'
                ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campaign Correlation Clusters</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-950 text-orange-300 font-mono text-[9px] font-bold border border-orange-500/40">
              {threatCampaignsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('threat-actors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'threat-actors'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Threat Actor Attribution</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/40">
              {threatActorsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('soar-playbooks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'soar-playbooks'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Automated SOAR Playbooks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/40">
              {playbooks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('siem-health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'siem-health'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SIEM Connectors & Health</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
              {siemConnectorsData.length}
            </span>
          </button>
        </div>

        {/* Global Filter / Search Bar */}
        <div className="relative min-w-[200px] ml-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts, IPs, cases, TTPs..."
            className="w-full bg-[#081224] border border-[#162744] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* ─── Main Tabbed Content ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: LIVE THREAT ALERT STREAM                                           */}
        {/* ========================================================================= */}
        {activeTab === 'live-stream' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 8 cols: Filterable Alert Feed */}
            <div className="lg:col-span-8 flex flex-col gap-2.5 h-full overflow-hidden">
              {/* Filter Controls Toolbar */}
              <div className="px-3 py-2 rounded-xl bg-[#050b18] border border-[#111e33] flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                        severityFilter === sev
                          ? 'bg-red-600 text-white'
                          : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#081224] border border-[#162744] rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="HONEYPOT">HONEYPOT</option>
                    <option value="INTRUSION">INTRUSION</option>
                    <option value="DATA_LEAK">DATA LEAK</option>
                    <option value="INSIDER">INSIDER</option>
                    <option value="IDENTITY">IDENTITY</option>
                    <option value="MALWARE">MALWARE</option>
                  </select>
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
                {filteredAlerts.map((alert) => {
                  const isSelected = alert.id === selectedAlertId;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlertId(alert.id)}
                      className={`p-3 rounded-xl bg-[#050b18] border transition-all cursor-pointer shadow-lg flex flex-col justify-between group ${
                        isSelected
                          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-500'
                          : 'border-[#111e33] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{renderSeverityBadge(alert.severity)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100 font-mono group-hover:text-red-400 transition-colors">
                                {alert.title}
                              </h4>
                              {renderCategoryBadge(alert.category)}
                            </div>

                            <p className="text-[10.5px] text-slate-300 mt-1 font-sans">{alert.attackVector}</p>

                            <div className="mt-1.5 flex items-center gap-3 text-[10px] font-mono text-slate-400">
                              <span>Src: <span className="text-slate-200">{alert.sourceIp}</span></span>
                              <span>Target: <span className="text-slate-200">{alert.destinationTarget}</span></span>
                              <span className="text-cyan-400">{alert.mitreAttackId}</span>
                              <span className="text-slate-500">{alert.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          {renderStatusBadge(alert.status)}
                          <span className="text-[9.5px] font-mono text-red-400 font-bold block mt-1">
                            Score: {alert.threatScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 cols: Alert Forensic Detail Inspector */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-red-400" />
                    ALERT FORENSIC INSPECTOR
                  </span>
                  {renderSeverityBadge(selectedAlert.severity)}
                </div>

                <div className="mt-2.5">
                  <h3 className="text-xs font-bold text-slate-100 font-mono break-all">{selectedAlert.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedAlert.id}</span>
                </div>

                {/* Threat Score Bar */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">SIEM THREAT SCORE</span>
                    <span className="font-mono font-bold text-red-400">{selectedAlert.threatScore} / 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0a1220] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full"
                      style={{ width: `${selectedAlert.threatScore}%` }}
                    />
                  </div>
                </div>

                {/* Metadata list */}
                <div className="mt-3 space-y-2 text-xs border-t border-[#111e33]/80 pt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source Host / IP:</span>
                    <span className="font-mono text-slate-200">{selectedAlert.sourceIp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Asset:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[160px]" title={selectedAlert.destinationTarget}>
                      {selectedAlert.destinationTarget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Geo Location:</span>
                    <span className="text-slate-200">{selectedAlert.geoLocation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Correlated Case:</span>
                    <span className="font-mono text-cyan-300 truncate max-w-[160px]">{selectedAlert.correlatedCaseRef}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Unit:</span>
                    <span className="text-slate-300">{selectedAlert.assignedInvestigator}</span>
                  </div>
                </div>

                {/* MITRE ATT&CK Mapping */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    MITRE ATT&CK TTP:
                  </span>
                  <p className="text-[10.5px] font-mono text-cyan-300">
                    {selectedAlert.mitreAttackId}: {selectedAlert.mitreTechnique}
                  </p>
                </div>

                {/* Raw PCAP Summary */}
                {selectedAlert.rawPcapSummary && (
                  <div className="mt-2.5">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Raw Network Packet / Event Log:
                    </span>
                    <p className="p-2 rounded bg-[#02050e] border border-[#14233c] text-[10px] text-slate-300 font-mono leading-relaxed">
                      {selectedAlert.rawPcapSummary}
                    </p>
                  </div>
                )}

                {/* Fast SOC Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#111e33] space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(selectedAlert.id, 'ACKNOWLEDGED')}
                      className="py-1.5 px-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-bold text-slate-200 transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAlert.id, 'CONTAINED')}
                      className="py-1.5 px-2 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-500/50 text-[10.5px] font-bold text-red-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-red-400" />
                      <span>Airgap Host</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedAlertModal(selectedAlert)}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10.5px] transition-all flex items-center justify-center gap-1"
                  >
                    <span>Full Forensic Packet Inspection</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CAMPAIGN CORRELATION CLUSTERS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'correlation-matrix' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-950/40 via-[#070c18] to-red-950/40 border border-orange-500/30 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  THREAT CAMPAIGN CORRELATION & ATTACK CLUSTER MATRIX
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Automated multi-event correlation grouping disparate alerts across network endpoints, honeypots, and cloud vaults into unified adversary campaigns.
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
              {threatCampaignsData.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-orange-500/40 transition-all shadow-xl flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-orange-400 font-bold">{camp.id}</span>
                        <h4 className="text-xs font-bold text-white">{camp.name}</h4>
                        {renderSeverityBadge(camp.severity)}
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1 font-mono">
                        Attributed Actor: <span className="text-purple-300 font-bold">{camp.threatActor}</span>
                      </p>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                          <span className="text-slate-500 block">Attack Vector:</span>
                          <span className="text-slate-300">{camp.primaryVector}</span>
                        </div>
                        <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                          <span className="text-slate-500 block">Target Assets:</span>
                          <span className="text-slate-300">{camp.targetAssetSummary}</span>
                        </div>
                      </div>

                      {/* Correlated IOCs */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[9.5px] font-mono">
                        <span className="text-slate-400 font-bold">Correlated IOCs:</span>
                        {camp.correlatedIocs.map((ioc, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded bg-[#091325] border border-[#162744] text-cyan-300">
                            {ioc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-500/40">
                        {camp.status}
                      </span>
                      <span className="text-sm font-black font-mono text-red-400 block mt-1.5">
                        Risk Score: {camp.overallThreatScore}/100
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5">
                        {camp.activeAlertsCount} Linked Alerts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: THREAT ACTOR ATTRIBUTION MATRIX                                    */}
        {/* ========================================================================= */}
        {activeTab === 'threat-actors' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                THREAT SYNDICATES & ATTRIBUTION PROFILES ({threatActorsData.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Confidence Level ≥ 90%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {threatActorsData.map((actor) => (
                <div
                  key={actor.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                        {actor.threatTier.replace('_', ' ')}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[9px] font-bold">
                        {actor.attributionConfidence}% CONFIDENCE
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white font-mono mt-2.5">{actor.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Alias: {actor.alias}</p>

                    <p className="text-[10.5px] text-slate-300 mt-2 leading-relaxed">{actor.description}</p>

                    <div className="mt-2.5 p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10px] font-mono">
                      <div className="text-slate-400">
                        Origin Hub: <span className="text-slate-200">{actor.origin}</span>
                      </div>
                      <div className="text-slate-400">
                        Active Campaigns: <span className="text-orange-400 font-bold">{actor.activeCampaignsCount}</span>
                      </div>
                    </div>

                    {/* Known TTPs */}
                    <div className="mt-2.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Known TTP Vectors:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {actor.knownTtps.map((ttp, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded bg-[#091325] border border-[#162744] text-[8.5px] font-mono text-purple-300">
                            {ttp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => onSelectAction && onSelectAction(`Opening Intelligence Dossier: ${actor.name}`)}
                      className="text-[10.5px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                    >
                      <span>View Syndicate Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUTOMATED SOAR PLAYBOOKS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'soar-playbooks' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 7 cols: Playbooks List */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#070c18] to-blue-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    SECURITY ORCHESTRATION & AUTOMATED RESPONSE (SOAR)
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Automated incident response playbooks for zero-touch containment, honeypot sinkholing, and evidence preservation.
                </p>
              </div>

              {playbooks.map((pb) => (
                <div
                  key={pb.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl hover:border-cyan-500/40 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{pb.name}</h4>
                        <span
                          className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold ${
                            pb.status === 'ENABLED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : 'bg-slate-900 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {pb.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Trigger Rule: <span className="text-amber-300">{pb.triggerCondition}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleTogglePlaybook(pb.id)}
                      className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                        pb.status === 'ENABLED'
                          ? 'bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {pb.status === 'ENABLED' ? 'Pause Automation' : 'Enable Playbook'}
                    </button>
                  </div>

                  {/* Action Pipeline Steps */}
                  <div className="p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10.5px] font-mono">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">Execution Flow:</span>
                    {pb.actionPipeline.map((act, i) => (
                      <div key={i} className="text-slate-300 leading-relaxed">
                        {act}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Executions: <span className="text-white font-bold">{pb.executionsCount} times</span></span>
                    <span>Last Run: {pb.lastTriggered}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 cols: Fast Playbook Creation */}
            <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-cyan-400" />
                    CREATE AUTOMATION PLAYBOOK
                  </span>
                </div>

                <form onSubmit={handleCreatePlaybook} className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Playbook Name:
                    </label>
                    <input
                      type="text"
                      value={newPlaybookName}
                      onChange={(e) => setNewPlaybookName(e.target.value)}
                      placeholder="e.g. AWS Token Leak Instant Quarantine"
                      className="w-full bg-[#030610] border border-[#162744] rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Trigger Condition Expression:
                    </label>
                    <input
                      type="text"
                      value={newPlaybookCondition}
                      onChange={(e) => setNewPlaybookCondition(e.target.value)}
                      placeholder="e.g. Category == DATA_LEAK AND ThreatScore > 85"
                      className="w-full bg-[#030610] border border-[#162744] rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[10.5px] focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Action Pipeline Directives (one per line):
                    </label>
                    <textarea
                      value={newPlaybookAction}
                      onChange={(e) => setNewPlaybookAction(e.target.value)}
                      rows={4}
                      placeholder="1. Revoke active IAM STS Session&#10;2. Push firewall rule to Cisco Core&#10;3. Alert Special Cell Duty Officer"
                      className="w-full bg-[#030610] border border-[#162744] rounded-lg p-2 text-slate-200 font-mono text-[10.5px] focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Save & Arm Automation
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SIEM CONNECTORS & PIPELINE HEALTH                                  */}
        {/* ========================================================================= */}
        {activeTab === 'siem-health' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SIEM INGESTION PIPELINE & CONNECTOR TELEMETRY ({siemConnectorsData.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">100% Pipeline Uptime</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {siemConnectorsData.map((conn) => (
                <div
                  key={conn.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white font-mono">{conn.connectorName}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono font-bold">
                        {conn.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <span className="text-slate-500 block">Throughput</span>
                        <span className="text-emerald-400 font-bold text-xs">{conn.eventsPerSecond} EPS</span>
                      </div>
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <span className="text-slate-500 block">Ingest Latency</span>
                        <span className="text-cyan-300 font-bold text-xs">{conn.latencyMs} ms</span>
                      </div>
                      <div className="p-2 rounded bg-[#030610] border border-[#111e33]">
                        <span className="text-slate-500 block">Buffer Load</span>
                        <span className="text-slate-200 font-bold text-xs">{conn.bufferUtilization}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Protocol: syslog / json-stream</span>
                    <span>Sync: {conn.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: FULL FORENSIC PACKET INSPECTOR ──────────────────────────────── */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-xl bg-[#060c18] border border-red-500/50 p-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono">{selectedAlertModal.id}: {selectedAlertModal.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedAlertModal.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 text-xs overflow-y-auto text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-slate-400">Severity:</span>
                {renderSeverityBadge(selectedAlertModal.severity)}
              </div>
              <div className="p-2 rounded bg-[#040813] border border-[#14233c] space-y-1 font-mono">
                <div className="text-slate-300">Source: {selectedAlertModal.sourceIp} ({selectedAlertModal.geoLocation})</div>
                <div className="text-slate-300">Destination: {selectedAlertModal.destinationTarget}</div>
                <div className="text-cyan-400">MITRE: {selectedAlertModal.mitreAttackId} - {selectedAlertModal.mitreTechnique}</div>
              </div>

              <div className="p-2 rounded bg-[#040813] border border-[#14233c]">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  SHA-256 Forensic Evidence Payload Hash:
                </span>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <span className="truncate max-w-[400px]">{selectedAlertModal.payloadHash}</span>
                  <button
                    onClick={() => handleCopy(selectedAlertModal.payloadHash)}
                    className="text-cyan-400 hover:text-cyan-300 ml-2"
                  >
                    {copiedText === selectedAlertModal.payloadHash ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex items-center justify-end">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Close Forensics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SOAR PLAYBOOK MANAGER ───────────────────────────────────────── */}
      {isPlaybookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-xl bg-[#070e1c] border border-cyan-500/40 p-4 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                SOAR AUTOMATION MANAGER
              </h3>
              <button onClick={() => setIsPlaybookModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs space-y-2">
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Active SOAR playbooks are continuously evaluating incoming SIEM alerts. When matching conditions fire, hardware switches and active directory tokens are automatically isolated.
              </p>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex justify-end">
              <button
                onClick={() => setIsPlaybookModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatAlertsPage;
