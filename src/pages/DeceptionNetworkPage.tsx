import React, { useState, useMemo } from 'react';
import {
  Target,
  Shield,
  ShieldAlert,
  Radio,
  FileText,
  Database,
  Key,
  Globe,
  Video,
  Search,
  Plus,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Fingerprint,
  UserCheck,
  UserX,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Maximize2,
  Flame,
  Check,
  X,
  Copy
} from 'lucide-react';
import {
  deceptionMetricsData,
  deceptionAssetsData,
  tripwireIncidentsData,
  insiderThreatsData,
  stegoWatermarkSamples,
} from '../data/mockData';
import type {
  DeceptionAsset,
  TripwireIncident,
  DecoyType,
  DecoyStatus,
  Severity,
} from '../types/dashboard';

interface DeceptionNetworkPageProps {
  onSelectAction?: (action: string) => void;
}

type TabType = 'sensor-grid' | 'breach-stream' | 'asset-inventory' | 'insider-matrix' | 'watermark-lab';

export const DeceptionNetworkPage: React.FC<DeceptionNetworkPageProps> = ({ onSelectAction }) => {
  // Page State
  const [activeTab, setActiveTab] = useState<TabType>('sensor-grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Data State (supports live additions & simulations)
  const [assets, setAssets] = useState<DeceptionAsset[]>(deceptionAssetsData);
  const [incidents, setIncidents] = useState<TripwireIncident[]>(tripwireIncidentsData);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(deceptionAssetsData[0]?.id || '');
  const [selectedIncident, setSelectedIncident] = useState<TripwireIncident | null>(null);
  const [radarZoom, setRadarZoom] = useState<number>(1);
  const [radarFilter, setRadarFilter] = useState<'ALL' | 'TRIPPED' | 'ARMED'>('ALL');

  // Modals & Banners
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [simulationAlert, setSimulationAlert] = useState<{ active: boolean; message: string; incidentRef?: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Stego Lab State
  const [selectedStegoSample, setSelectedStegoSample] = useState<number>(0);
  const [decodedWatermark, setDecodedWatermark] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // New Decoy Form State
  const [newDecoyName, setNewDecoyName] = useState('');
  const [newDecoyType, setNewDecoyType] = useState<DecoyType>('honey_document');
  const [newDecoyCase, setNewDecoyCase] = useState('RC-2026-0417');
  const [newDecoyFolder, setNewDecoyFolder] = useState('/vault/evidence/confidential/');
  const [newDecoyPayload, setNewDecoyPayload] = useState('');
  const [newDecoySensitivity, setNewDecoySensitivity] = useState<'Low' | 'Standard' | 'Ultra-High'>('Ultra-High');
  const [newDecoyPolicy, setNewDecoyPolicy] = useState('Auto-silent memory dump + IP trace');

  // Active Selected Asset
  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        inc.decoyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.accessorBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.accessorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.incidentRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.sourceIp.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchType = typeFilter === 'ALL' || inc.decoyType === typeFilter;

      return matchSearch && matchSeverity && matchType;
    });
  }, [incidents, searchQuery, severityFilter, typeFilter]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((ast) => {
      const matchSearch =
        ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.targetFolder.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'ALL' || ast.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [assets, searchQuery, typeFilter]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Trigger Breach Simulation
  const handleSimulateBreach = () => {
    const randomBadge = ['ACP-23 (Raj Verma)', 'INS-17 (Vikram Rathore)', 'EXT-ADVERSARY-99', 'U-48 (Contractor)'][
      Math.floor(Math.random() * 4)
    ];
    const targetAsset = assets[Math.floor(Math.random() * assets.length)];
    const incidentRef = `TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: TripwireIncident = {
      id: `inc-${Date.now()}`,
      incidentRef,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Just Now)',
      decoyId: targetAsset.id,
      decoyName: targetAsset.name,
      decoyType: targetAsset.type,
      severity: 'CRITICAL',
      accessorBadge: randomBadge.split(' ')[0],
      accessorName: randomBadge.split('(')[1]?.replace(')', '') || 'Unknown Entity',
      accessorRole: 'Investigative Personnel',
      accessorUnit: 'Special Crime Cell',
      sourceIp: '10.240.8.214 (HQ Workstation)',
      deviceUuid: 'MAC: E4:5F:01:8A:22:9C',
      geoLocation: 'Delhi Police HQ Cyber Ops, Floor 3',
      attackVector: `Simulated tripwire breach on ${targetAsset.name}`,
      exfiltrationMethod: 'Direct Unauthorized Read & Memory Hook',
      sha256Proof: '7c91e0a819b18204918204918204918204918204918204918204918204918204',
      watermarkMatched: true,
      watermarkRecipient: `${randomBadge} - Instant Canary Alert`,
      containmentStatus: 'ACTION_REQUIRED',
      containmentNotes: 'Simulated breach tripwire successfully registered across sensor nodes.',
    };

    // Update asset status to TRIPPED
    setAssets((prev) =>
      prev.map((a) => (a.id === targetAsset.id ? { ...a, status: 'TRIPPED', accessCount: a.accessCount + 1 } : a))
    );

    // Insert incident at top
    setIncidents((prev) => [newIncident, ...prev]);

    // Show simulation banner
    setSimulationAlert({
      active: true,
      message: `TRIPWIRE ALARM TRIPPED: ${targetAsset.name} accessed by ${randomBadge}!`,
      incidentRef,
    });

    if (onSelectAction) {
      onSelectAction(`Canary Tripwire Triggered on ${targetAsset.name}`);
    }

    setTimeout(() => {
      setSimulationAlert(null);
    }, 6000);
  };

  // Deploy New Decoy Handler
  const handleDeployDecoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecoyName.trim()) return;

    const newAsset: DeceptionAsset = {
      id: `decoy-${Date.now()}`,
      name: newDecoyName.trim(),
      type: newDecoyType,
      categoryLabel:
        newDecoyType === 'honey_document'
          ? 'Decoy Document'
          : newDecoyType === 'ghost_database'
          ? 'Ghost Database Table'
          : newDecoyType === 'iam_credential'
          ? 'Canary Cloud Token'
          : newDecoyType === 'fake_endpoint'
          ? 'Ghost REST Endpoint'
          : newDecoyType === 'stego_media'
          ? 'Steganographic Video Trap'
          : 'Canary Token',
      caseId: newDecoyCase.trim() || 'RC-2026-0417',
      status: 'ARMED',
      deploymentDate: 'Just Now',
      targetFolder: newDecoyFolder.trim() || '/vault/evidence/confidential/',
      accessCount: 0,
      fingerprintHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      fakePayloadPreview: newDecoyPayload.trim() || 'SYNTHETIC PAYLOAD: Auto-generated decoy telemetry payload.',
      radarX: Math.floor(20 + Math.random() * 60),
      radarY: Math.floor(20 + Math.random() * 60),
      sensitivity: newDecoySensitivity,
      containmentPolicy: newDecoyPolicy.trim() || 'Auto-silent memory dump + IP trace',
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);
    setIsDeployModalOpen(false);
    setNewDecoyName('');
    setNewDecoyPayload('');

    if (onSelectAction) {
      onSelectAction(`Canary Decoy Deployed: ${newAsset.name}`);
    }
  };

  // Decode Steganographic Watermark
  const handleDecodeSample = (idx: number) => {
    setSelectedStegoSample(idx);
    setIsDecoding(true);
    setDecodedWatermark(null);

    setTimeout(() => {
      setIsDecoding(false);
      const sample = stegoWatermarkSamples[idx];
      if (sample) {
        setDecodedWatermark(
          `[STEGO FORENSIC REPORT]\nOFFICER BADGE: ${sample.officerBadge}\nNAME: ${sample.officerName}\nCASE REF: ${sample.caseRef}\nTIMESTAMP: ${sample.timestamp}\nZERO-WIDTH HEX PAYLOAD: ${sample.invisibleZeroWidthSequence}\nSHA-256 SIGNATURE: ${sample.sha256Signature}\nINTEGRITY PROOF: 100% MATCH (CRYPTOGRAPHICALLY VERIFIED)`
        );
      }
    }, 600);
  };

  // Helper for Type Icons
  const renderTypeIcon = (type: DecoyType, className = 'w-4 h-4') => {
    switch (type) {
      case 'honey_document':
        return <FileText className={`${className} text-amber-400`} />;
      case 'ghost_database':
        return <Database className={`${className} text-cyan-400`} />;
      case 'iam_credential':
        return <Key className={`${className} text-purple-400`} />;
      case 'fake_endpoint':
        return <Globe className={`${className} text-blue-400`} />;
      case 'stego_media':
        return <Video className={`${className} text-pink-400`} />;
      case 'canary_token':
      default:
        return <Target className={`${className} text-emerald-400`} />;
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: DecoyStatus) => {
    switch (status) {
      case 'TRIPPED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-red-950/80 border border-red-500/50 text-red-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            TRIPPED ALARM
          </span>
        );
      case 'ENGAGED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ENGAGED BAIT
          </span>
        );
      case 'ARMED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ARMED & ACTIVE
          </span>
        );
      case 'ISOLATED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-purple-950/80 border border-purple-500/50 text-purple-400">
            ISOLATED
          </span>
        );
      case 'MAINTENANCE':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-900 border border-slate-700 text-slate-400">
            MAINTENANCE
          </span>
        );
    }
  };

  // Helper for Severity Badges
  const renderSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-950/90 border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-400">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-950/80 border border-blue-500/50 text-blue-400">
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

  return (
    <div className="flex-1 p-3.5 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Simulation Alert Toast ──────────────────────────────────────────────── */}
      {simulationAlert && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-950/90 via-[#1f0a0a] to-amber-950/90 border border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  DECEPTION SENSOR TRIPWIRE BREACH DETECTED
                </span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded">
                  {simulationAlert.incidentRef}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{simulationAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('breach-stream')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Inspect Tripwire
            </button>
            <button
              onClick={() => setSimulationAlert(null)}
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
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Target className="w-4 h-4" />
            </div>
            <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              DECEPTION NETWORK
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold">
                GRID STATUS: ARMED & ACTIVE
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Proactive counter-intelligence, honeypot traps, canary files & insider threat attribution</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span className="text-amber-400 font-mono text-[10.5px]">24 Sensors Deployed</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulate Tripwire Breach Button */}
          <button
            onClick={handleSimulateBreach}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1107] hover:bg-[#2e1d09] border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all"
            title="Simulate a breach on a random honeypot to verify tripwire sensors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Breach</span>
          </button>

          {/* Stego Lab Quick Trigger */}
          <button
            onClick={() => setActiveTab('watermark-lab')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stego Scanner</span>
          </button>

          {/* Deploy New Canary Decoy Button */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Canary Decoy</span>
          </button>

          {/* Export Dossier */}
          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Certified Deception Forensics Dossier')}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Export Forensics Dossier"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Top Telemetry KPI Row (6 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Card 1 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Active Decoys</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white font-mono">{assets.length}</span>
            <span className="text-[9px] font-medium text-emerald-400">8 Vault Folders</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.trapsChange}</span>
        </div>

        {/* Card 2 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-red-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">Tripwire Alerts (24h)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-red-400 font-mono">{incidents.length}</span>
            <span className="text-[9px] font-bold text-red-400">3 Critical</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Unauthorized access attempts</span>
        </div>

        {/* Card 3 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Mean Time To Alert</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{deceptionMetricsData.meanTimeToAlert}</span>
            <span className="text-[9px] font-medium text-emerald-400">Instant</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.mttaStatus}</span>
        </div>

        {/* Card 4 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-purple-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Flagged Insiders</span>
            <UserX className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-purple-300 font-mono">{insiderThreatsData.length}</span>
            <span className="text-[9px] font-bold text-purple-400">Restricted</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.insiderRiskLevel}</span>
        </div>

        {/* Card 5 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Deception Coverage</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{deceptionMetricsData.deceptionCoverage}</span>
            <span className="text-[9px] font-medium text-cyan-300">High</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.coverageTarget}</span>
        </div>

        {/* Card 6 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Stego Watermarks</span>
            <Fingerprint className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-pink-400 font-mono">{deceptionMetricsData.watermarkedDocs}</span>
            <span className="text-[9px] font-medium text-slate-400">Sealed</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Zero-width leak tracking</span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#111e33] pb-2 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sensor-grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'sensor-grid'
                ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar & Sensor Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('breach-stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'breach-stream'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tripwire Incident Stream</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 font-mono text-[9px] font-bold border border-red-500/40">
              {incidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('asset-inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'asset-inventory'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Canary Asset Inventory</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/40">
              {assets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('insider-matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'insider-matrix'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Insider Threat Attribution</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/40">
              {insiderThreatsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('watermark-lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'watermark-lab'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Steganographic Lab</span>
          </button>
        </div>

        {/* Global Search Bar in tab line */}
        <div className="relative min-w-[200px] ml-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter decoys, badges, IPs..."
            className="w-full bg-[#081224] border border-[#162744] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* ─── Main Content Views ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: RADAR & SENSOR GRID                                                */}
        {/* ========================================================================= */}
        {activeTab === 'sensor-grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 8 cols: Interactive Radar Scanner + Live Traps */}
            <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
              <div className="rounded-xl bg-[#050b18] border border-[#111e33] flex flex-col relative overflow-hidden shadow-xl flex-1 min-h-[380px]">
                {/* Radar Toolbar */}
                <div className="px-3 py-2 border-b border-[#111e33] flex items-center justify-between bg-[#040813] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Honeypot Topography:
                    </span>
                    <button
                      onClick={() => setRadarFilter('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'ALL' ? 'bg-amber-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      All ({assets.length})
                    </button>
                    <button
                      onClick={() => setRadarFilter('TRIPPED')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'TRIPPED' ? 'bg-red-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      Tripped ({assets.filter((a) => a.status === 'TRIPPED').length})
                    </button>
                    <button
                      onClick={() => setRadarFilter('ARMED')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'ARMED' ? 'bg-emerald-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      Armed ({assets.filter((a) => a.status === 'ARMED').length})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">Sensors: 24/24 Online</span>
                    <button
                      onClick={() => setRadarZoom((z) => (z === 1 ? 1.15 : 1))}
                      className={`p-1 rounded transition-colors ${
                        radarZoom > 1 ? 'bg-amber-600 text-white' : 'bg-[#081224] text-slate-400 hover:text-white'
                      }`}
                      title="Toggle Radar Zoom"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Radar Visualizer Canvas */}
                <div className="relative flex-1 bg-[#020612] flex items-center justify-center overflow-hidden">
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-30 pointer-events-none" />

                  {/* Concentric Radar Rings Container with Scale */}
                  <div
                    className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center pointer-events-none transition-transform duration-300"
                    style={{ transform: `scale(${radarZoom})` }}
                  >
                    {/* Ring 1 - Outer */}
                    <div className="absolute inset-0 rounded-full border border-amber-500/20" />
                    <span className="absolute top-2 text-[8px] font-mono text-amber-500/50">PERIMETER: 1.5 KM</span>

                    {/* Ring 2 - Mid */}
                    <div className="absolute inset-10 rounded-full border border-amber-500/30" />
                    <span className="absolute top-12 text-[8px] font-mono text-amber-500/60">HQ VAULT: 1.0 KM</span>

                    {/* Ring 3 - Inner */}
                    <div className="absolute inset-20 rounded-full border border-amber-500/40" />
                    <span className="absolute top-22 text-[8px] font-mono text-amber-500/70">CORE DB: 0.5 KM</span>

                    {/* Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-amber-500/15" />
                    <div className="absolute h-full w-[1px] bg-amber-500/15" />

                    {/* Rotating Radar Sweep Cone */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="w-full h-full radar-sweep bg-gradient-to-tr from-amber-500/30 via-transparent to-transparent" />
                    </div>

                    {/* Center Command Core */}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/40 border border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                      <Target className="w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                  </div>

                  {/* Plotted Decoy Nodes on Radar */}
                  <div
                    className="absolute inset-0 pointer-events-auto transition-transform duration-300"
                    style={{ transform: `scale(${radarZoom})`, transformOrigin: 'center center' }}
                  >
                    {assets.map((asset) => {
                      const isSelected = asset.id === selectedAssetId;
                      const isTripped = asset.status === 'TRIPPED';
                      const isEngaged = asset.status === 'ENGAGED';

                      if (radarFilter === 'TRIPPED' && !isTripped) return null;
                      if (radarFilter === 'ARMED' && isTripped) return null;

                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedAssetId(asset.id)}
                          style={{
                            left: `${asset.radarX}%`,
                            top: `${asset.radarY}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          className={`absolute cursor-pointer flex flex-col items-center group z-20 transition-all ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                          }`}
                        >
                          {/* Animated Ping Ring for Tripped Nodes */}
                          {isTripped && (
                            <span className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping pointer-events-none" />
                          )}

                          {/* Node Icon Box */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-lg transition-all ${
                              isTripped
                                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_12px_#ef4444]'
                                : isEngaged
                                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_#f59e0b]'
                                : 'bg-[#081224] border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                            } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                          >
                            {renderTypeIcon(asset.type, 'w-3.5 h-3.5')}
                          </div>

                          {/* Label Pill */}
                          <div className="mt-1 px-1.5 py-0.5 rounded bg-[#050b18]/95 border border-[#162744] text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-md pointer-events-none group-hover:border-amber-400">
                            {asset.name}
                            {isTripped && <span className="ml-1 text-red-400 font-mono">(HIT: {asset.accessCount})</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Radar Legend */}
                <div className="px-3 py-2 border-t border-[#111e33] bg-[#040813] flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping" />
                      <span>Tripped Alarm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      <span>Engaged Bait</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                      <span>Armed & Silent</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-500">Scan Frequency: 2.4 GHz Pulse</span>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Selected Decoy Telemetry & Fast Actions */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              {/* Card 1: Selected Asset Telemetry */}
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    {renderTypeIcon(selectedAsset.type, 'w-4 h-4')}
                    DECOY SENSOR TELEMETRY
                  </span>
                  {renderStatusBadge(selectedAsset.status)}
                </div>

                <div className="mt-2.5">
                  <h3 className="text-sm font-bold text-slate-100 font-mono break-all">{selectedAsset.name}</h3>
                  <span className="text-[10px] text-amber-400 font-medium">{selectedAsset.categoryLabel}</span>
                </div>

                {/* Metadata list */}
                <div className="mt-3 space-y-2 text-xs border-t border-[#111e33]/80 pt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Folder / URI</span>
                    <span className="font-mono text-slate-200 truncate max-w-[170px]" title={selectedAsset.targetFolder}>
                      {selectedAsset.targetFolder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Linked Case</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedAsset.caseId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Unauthorized Hits</span>
                    <span className="font-mono font-bold text-red-400">{selectedAsset.accessCount} accesses</span>
                  </div>
                  {selectedAsset.lastTriggered && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Last Triggered</span>
                      <span className="font-mono text-amber-300">{selectedAsset.lastTriggered}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sensitivity Level</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                      {selectedAsset.sensitivity}
                    </span>
                  </div>
                  {selectedAsset.stegoWatermarkId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Stego Seal ID</span>
                      <span className="font-mono text-[10px] text-pink-400">{selectedAsset.stegoWatermarkId}</span>
                    </div>
                  )}
                </div>

                {/* Fake Payload Content Preview */}
                <div className="mt-3 p-2 rounded-lg bg-[#030610] border border-[#111e33]">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bait Payload Specification:
                  </span>
                  <p className="text-[10px] font-mono text-slate-300 leading-relaxed bg-[#02040a] p-1.5 rounded border border-slate-900">
                    {selectedAsset.fakePayloadPreview}
                  </p>
                </div>

                {/* SHA-256 Seal */}
                <div className="mt-2.5 flex items-center justify-between p-1.5 rounded bg-[#030610] border border-[#111e33] text-[9px]">
                  <span className="text-slate-400 font-mono">SHA-256:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[180px]">{selectedAsset.fingerprintHash}</span>
                  <button
                    onClick={() => handleCopy(selectedAsset.fingerprintHash)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy Fingerprint Hash"
                  >
                    {copiedHash === selectedAsset.fingerprintHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Quick Actions on Selected Decoy */}
                <div className="mt-3 pt-2.5 border-t border-[#111e33] flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssets((prev) =>
                        prev.map((a) =>
                          a.id === selectedAsset.id
                            ? { ...a, status: a.status === 'ARMED' ? 'ISOLATED' : 'ARMED' }
                            : a
                        )
                      );
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {selectedAsset.status === 'ARMED' ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                    <span>{selectedAsset.status === 'ARMED' ? 'Quarantine Decoy' : 'Re-Arm Decoy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectAction) onSelectAction(`Regenerating Watermarks on ${selectedAsset.name}`);
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    title="Regenerate Zero-Width Watermark"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>Reseal</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Deception Containment Policy Rule */}
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    AUTOMATED ENTRAPMENT POLICY
                  </span>
                </div>
                <div className="mt-2 space-y-2 text-[10.5px]">
                  <div className="p-2 rounded bg-[#030610] border border-[#14233c] text-slate-300">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">Active Rule:</span>
                    {selectedAsset.containmentPolicy}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>DLP Interception:</span>
                    <span className="text-emerald-400 font-semibold font-mono">ENABLED (Strict)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Court Chain-of-Custody:</span>
                    <span className="text-emerald-400 font-semibold font-mono">SIGNED ON-CHAIN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRIPWIRE INCIDENT STREAM                                           */}
        {/* ========================================================================= */}
        {activeTab === 'breach-stream' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Filter Pills */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all ${
                      severityFilter === sev
                        ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Decoy Type:</span>
                {['ALL', 'honey_document', 'ghost_database', 'iam_credential'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      typeFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
                    }`}
                  >
                    {t === 'ALL'
                      ? 'All Types'
                      : t === 'honey_document'
                      ? 'Documents'
                      : t === 'ghost_database'
                      ? 'Databases'
                      : 'Tokens'}
                  </button>
                ))}
              </div>
            </div>

            {/* Incidents Table */}
            <div className="flex-1 min-h-0 overflow-y-auto mt-2 rounded-xl border border-[#111e33] bg-[#050b18]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111e33] bg-[#040813] text-[9.5px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-2 px-3">INCIDENT REF</th>
                    <th className="py-2 px-3">TIMESTAMP</th>
                    <th className="py-2 px-3">TARGET HONEYPOT</th>
                    <th className="py-2 px-3">ACCESSOR / BADGE</th>
                    <th className="py-2 px-3">VECTOR / ATTACK METHOD</th>
                    <th className="py-2 px-3">SOURCE TERMINAL / IP</th>
                    <th className="py-2 px-3">CONTAINMENT</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111e33]/70">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="hover:bg-[#091428] cursor-pointer transition-colors group"
                    >
                      {/* Ref & Severity */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {renderSeverityBadge(inc.severity)}
                          <span className="font-mono text-slate-300 font-bold text-[10.5px]">
                            {inc.incidentRef}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                        {inc.timestamp}
                      </td>

                      {/* Target Honeypot */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {renderTypeIcon(inc.decoyType, 'w-3.5 h-3.5')}
                          <span className="font-bold text-slate-200 font-mono truncate max-w-[180px]">
                            {inc.decoyName}
                          </span>
                        </div>
                      </td>

                      {/* Accessor Badge */}
                      <td className="py-2.5 px-3">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-amber-300 font-mono text-[11px]">{inc.accessorBadge}</span>
                            <span className="text-slate-300 text-[10.5px]">({inc.accessorName})</span>
                          </div>
                          <span className="text-[9px] text-slate-500 block">{inc.accessorUnit}</span>
                        </div>
                      </td>

                      {/* Vector */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-300 truncate max-w-[200px] block text-[10.5px]">
                          {inc.attackVector}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate block font-mono">
                          {inc.exfiltrationMethod}
                        </span>
                      </td>

                      {/* Source IP */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-300 text-[10.5px] block">{inc.sourceIp}</span>
                        <span className="text-[9px] text-slate-500 truncate block">{inc.geoLocation}</span>
                      </td>

                      {/* Containment Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            inc.containmentStatus === 'ACTION_REQUIRED'
                              ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                              : inc.containmentStatus === 'UNDER_SURVEILLANCE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              : inc.containmentStatus === 'ISOLATED'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {inc.containmentStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(inc);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0e1f3b] hover:bg-blue-600 text-slate-300 hover:text-white font-medium text-[10.5px] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Forensics</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CANARY ASSET INVENTORY                                             */}
        {/* ========================================================================= */}
        {activeTab === 'asset-inventory' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CANARY ASSET REPOSITORY ({filteredAssets.length})
                </span>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Canary Decoy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <div className="flex items-center gap-2">
                        {renderTypeIcon(asset.type, 'w-4 h-4')}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {asset.categoryLabel}
                        </span>
                      </div>
                      {renderStatusBadge(asset.status)}
                    </div>

                    {/* Asset Name */}
                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-slate-100 font-mono break-all group-hover:text-amber-400 transition-colors">
                        {asset.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{asset.targetFolder}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-2.5 p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10.5px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Case Linkage:</span>
                        <span className="font-bold text-cyan-400 font-mono">{asset.caseId}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Sensitivity:</span>
                        <span className="text-amber-300 font-semibold">{asset.sensitivity}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Access Hits:</span>
                        <span className="font-mono font-bold text-red-400">{asset.accessCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Deployed:</span>
                        <span className="font-mono text-slate-300">{asset.deploymentDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(asset.fingerprintHash)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedHash === asset.fingerprintHash ? 'Copied Hash' : 'SHA-256 Hash'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setActiveTab('sensor-grid');
                      }}
                      className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <span>Radar Locate</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INSIDER THREAT ATTRIBUTION MATRIX                                  */}
        {/* ========================================================================= */}
        {activeTab === 'insider-matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 7 cols: Profiles of Flagged Badges */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#070c18] to-red-950/40 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    INTERNAL PERSONNEL EXFILTRATION CORRELATION MATRIX
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Automatic attribution correlating honeypot query logs, zero-width steganographic document seals, and
                  DLP web-egress tripwires.
                </p>
              </div>

              {insiderThreatsData.map((insider) => (
                <div
                  key={insider.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-purple-500/50 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={insider.avatar}
                        alt={insider.officerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/60 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{insider.officerName}</h4>
                          <span className="px-2 py-0.2 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 font-mono font-bold text-[10px]">
                            {insider.badgeNumber}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 block">{insider.rank} • {insider.department}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">THREAT RISK SCORE</span>
                      <span className="text-base font-black text-red-400 font-mono">{insider.threatScore} / 100</span>
                    </div>
                  </div>

                  {/* Exfiltrated Assets Pill List */}
                  <div className="mt-3 pt-2 border-t border-[#111e33]">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tripped Honeypot Assets ({insider.exfiltratedAssets.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {insider.exfiltratedAssets.map((ast, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#091325] border border-[#162744] text-[10px] font-mono text-red-300 font-medium"
                        >
                          {ast}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stealth Notes */}
                  <div className="mt-2.5 p-2 rounded bg-[#030610] border border-slate-900 text-[10.5px] text-slate-300 leading-relaxed">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                      Intelligence Assessment:
                    </span>
                    {insider.stealthNotes}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Last active: {insider.lastActive}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectAction && onSelectAction(`Locking Credentials for ${insider.officerName}`)}
                        className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-600 border border-red-500/50 text-red-300 hover:text-white text-[10.5px] font-bold transition-all"
                      >
                        Lockdown Badge Token
                      </button>
                      <button
                        onClick={() => onSelectAction && onSelectAction(`Generating Court Dossier on ${insider.officerName}`)}
                        className="px-2.5 py-1 rounded bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 text-[10.5px] font-medium transition-colors"
                      >
                        Export IA Dossier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 cols: Forensic Watermark Chain & Rules */}
            <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#111e33]">
                  <Fingerprint className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    CRYPTOGRAPHIC WATERMARK PROOF CHAIN
                  </span>
                </div>

                <div className="mt-2.5 space-y-2.5 text-xs text-[11px]">
                  {stegoWatermarkSamples.map((sample, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#030610] border border-[#14233c] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 font-mono">{sample.token}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold rounded">
                          SEAL VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Assigned Officer:</span>
                        <span className="text-amber-300 font-bold">{sample.officerName} ({sample.officerBadge})</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Timestamp:</span>
                        <span className="font-mono text-slate-300">{sample.timestamp}</span>
                      </div>
                      <div className="pt-1 text-[9px] font-mono text-slate-500 truncate" title={sample.sha256Signature}>
                        SIG: {sample.sha256Signature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Canary Tripwire Policies */}
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    DECEPTION TRIPWIRE DAEMON
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-[10.5px]">
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Auto-Revoke Session on Canary Trip</span>
                    <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Steganographic Zero-Width Watermarking</span>
                    <span className="text-emerald-400 font-mono font-bold">ON-THE-FLY</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Live Tor / VPN Node Blacklisting</span>
                    <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STEGANOGRAPHIC WATERMARK LAB                                       */}
        {/* ========================================================================= */}
        {activeTab === 'watermark-lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 6 cols: Stego Payload Decoder Sandbox */}
            <div className="lg:col-span-6 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-pink-400" />
                    ZERO-WIDTH STEGANOGRAPHIC FILE DECODER
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  CrimeSync embeds invisible zero-width Unicode sequences (`\u200B`, `\u200C`, `\uFEFF`) into all
                  downloaded FIR and evidence documents. If a leaked file is found on Telegram, WhatsApp, or darknet forums,
                  inspect it here to reveal the exact leaker officer badge ID.
                </p>

                {/* Preset sample buttons */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Select Test Leaked Evidence Sample:
                  </span>
                  <div className="space-y-1.5">
                    {stegoWatermarkSamples.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDecodeSample(idx)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                          selectedStegoSample === idx
                            ? 'bg-pink-950/60 border-pink-500/80 text-pink-200'
                            : 'bg-[#081224] border-[#162744] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-pink-400" />
                          <span className="font-mono font-bold">{s.token}</span>
                          <span className="text-[10px] text-slate-400">({s.officerBadge})</span>
                        </div>
                        <span className="text-[10px] font-mono text-pink-400">Click to Inspect</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decode Trigger Button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleDecodeSample(selectedStegoSample)}
                    disabled={isDecoding}
                    className="w-full py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isDecoding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Extracting Zero-Width Steganographic Tokens...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Decode Zero-Width Watermark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Decoded Result Manifest */}
            <div className="lg:col-span-6 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    DECODED FORENSIC MANIFEST
                  </span>
                  {decodedWatermark && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold">
                      VERIFIED MATCH
                    </span>
                  )}
                </div>

                <div className="mt-3 flex-1 bg-[#02050e] rounded-lg border border-[#14233c] p-3 font-mono text-xs overflow-y-auto">
                  {decodedWatermark ? (
                    <pre className="text-emerald-400 leading-relaxed whitespace-pre-wrap">{decodedWatermark}</pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                      <Fingerprint className="w-10 h-10 text-slate-600 mb-2" />
                      <p>No document scanned yet. Select a sample on the left and click "Decode Zero-Width Watermark".</p>
                    </div>
                  )}
                </div>

                {decodedWatermark && (
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(decodedWatermark)}
                      className="px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Forensic Proof</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction('Exporting Steganographic Court Affidavit')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                    >
                      Export Court Affidavit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: DEPLOY NEW CANARY DECOY ───────────────────────────────────── */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-xl bg-[#070e1c] border border-amber-500/40 p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    DEPLOY NEW CANARY HONEYPOT DECOY
                  </h3>
                  <span className="text-[10px] text-slate-400">Configure synthetic lure and tripwire alarm policy</span>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleDeployDecoy} className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {/* Decoy Type */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Decoy Asset Category:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'honey_document', label: 'Honey Document (PDF/DOCX)' },
                    { type: 'ghost_database', label: 'Ghost SQL Table' },
                    { type: 'iam_credential', label: 'Canary Cloud Key' },
                    { type: 'fake_endpoint', label: 'Ghost REST API' },
                    { type: 'stego_media', label: 'Stego Video/CCTV' },
                    { type: 'canary_token', label: 'Physical Vault QR' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setNewDecoyType(item.type as DecoyType)}
                      className={`p-2 rounded-lg border text-left text-[10.5px] font-medium transition-all ${
                        newDecoyType === item.type
                          ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-[#040813] border-[#162744] text-slate-400 hover:text-white'
                      }`}
                    >
                      {renderTypeIcon(item.type as DecoyType, 'w-3.5 h-3.5 mb-1')}
                      <span className="block leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decoy Name */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Decoy File / Resource Name:
                </label>
                <input
                  type="text"
                  required
                  value={newDecoyName}
                  onChange={(e) => setNewDecoyName(e.target.value)}
                  placeholder="e.g., FIR_SECRET_TRANSCRIPTS_HONEY.pdf or pg_decoy://mule_table"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Case Link & Folder Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Target Case ID:
                  </label>
                  <input
                    type="text"
                    value={newDecoyCase}
                    onChange={(e) => setNewDecoyCase(e.target.value)}
                    placeholder="RC-2026-0417"
                    className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Sensitivity Level:
                  </label>
                  <select
                    value={newDecoySensitivity}
                    onChange={(e) => setNewDecoySensitivity(e.target.value as any)}
                    className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Ultra-High">Ultra-High (Instant Lockdown)</option>
                    <option value="Low">Low (Silent Telemetry)</option>
                  </select>
                </div>
              </div>

              {/* Target Folder */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Deployment Directory / Endpoint Path:
                </label>
                <input
                  type="text"
                  value={newDecoyFolder}
                  onChange={(e) => setNewDecoyFolder(e.target.value)}
                  placeholder="/vault/evidence/confidential/"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Fake Bait Payload */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Synthetic Lure Payload Content:
                </label>
                <textarea
                  rows={2}
                  value={newDecoyPayload}
                  onChange={(e) => setNewDecoyPayload(e.target.value)}
                  placeholder="Fabricated banking coordinates, dummy call logs, synthetic CDR records..."
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Auto Containment Policy */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Auto-Containment Tripwire Trigger:
                </label>
                <input
                  type="text"
                  value={newDecoyPolicy}
                  onChange={(e) => setNewDecoyPolicy(e.target.value)}
                  placeholder="Auto-silent memory dump + IP trace + Lock officer token"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#14233c] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Arm & Deploy Decoy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: INCIDENT FORENSIC INSPECTOR ───────────────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-xl bg-[#060c18] border border-red-500/50 p-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      CANARY TRIPWIRE FORENSIC DOSSIER
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 font-bold">
                      {selectedIncident.incidentRef}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Timestamp: {selectedIncident.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {/* Accessor Attribution Card */}
              <div className="p-3 rounded-lg bg-[#040813] border border-[#14233c] flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">ATTRIBUTED ACCESSOR</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-white">{selectedIncident.accessorName}</span>
                    <span className="px-2 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-mono font-bold text-[10px]">
                      {selectedIncident.accessorBadge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{selectedIncident.accessorRole} • {selectedIncident.accessorUnit}</span>
                </div>
                {renderSeverityBadge(selectedIncident.severity)}
              </div>

              {/* Vector & Device Fingerprint */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">ATTACK VECTOR</span>
                  <p className="text-[10.5px] font-medium text-slate-200">{selectedIncident.attackVector}</p>
                  <p className="text-[9.5px] font-mono text-slate-400">{selectedIncident.exfiltrationMethod}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">DEVICE & GEOLOCATION</span>
                  <p className="text-[10px] font-mono text-slate-200">{selectedIncident.sourceIp}</p>
                  <p className="text-[9.5px] text-slate-400">{selectedIncident.geoLocation}</p>
                  <p className="text-[8.5px] font-mono text-slate-500">{selectedIncident.deviceUuid}</p>
                </div>
              </div>

              {/* Watermark Match Proof */}
              <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider block">STEGO WATERMARK MATCH</span>
                  <span className="text-[10.5px] font-mono text-slate-200">{selectedIncident.watermarkRecipient || 'No watermark embedded'}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold text-[9px]">
                  MATCH CONFIRMED
                </span>
              </div>

              {/* SHA-256 Tamper Seal */}
              <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EVIDENCE SHA-256 SEAL</span>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <span className="truncate max-w-[450px]">{selectedIncident.sha256Proof}</span>
                  <button
                    onClick={() => handleCopy(selectedIncident.sha256Proof)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Containment Notes */}
              {selectedIncident.containmentNotes && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-[10.5px] text-slate-300">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">CONTAINMENT DIRECTIVE</span>
                  {selectedIncident.containmentNotes}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Chain of Custody: Sealed to Ledger</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Revoking Badge ${selectedIncident.accessorBadge}`);
                    setSelectedIncident(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                >
                  Revoke Badge Credentials
                </button>
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Exporting Court-Ready PDF on ${selectedIncident.incidentRef}`);
                    setSelectedIncident(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Export Court Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeceptionNetworkPage;
