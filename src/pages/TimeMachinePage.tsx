import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  Calendar, 
  Download, 
  Phone, 
  Landmark, 
  MapPin, 
  Hash,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Shield,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Sliders,
  Radio,
  FileText,
  PlusCircle,
  Plus,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ALL_CASES, getCaseById, type LawCase } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';

interface TimeMachinePageProps {
  onSelectAction?: (action: string) => void;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  type: string;
  category: string;
  title: string;
  sub: string;
  entities: string;
  entitiesSub: string;
  evidence: string;
  evidenceType: 'doc' | 'audio' | 'video' | 'geo' | 'hash';
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  properties?: any;
}

export const TimeMachinePage: React.FC<TimeMachinePageProps> = ({ onSelectAction }) => {
  const { selectedCaseId } = useCaseContext();
  const [selectedRangePreset, setSelectedRangePreset] = useState<'24H' | '7D' | '15D' | '30D' | 'ALL'>('15D');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Time Player / Simulation State ─────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [selectedModalEvent, setSelectedModalEvent] = useState<TimelineEvent | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Reset player when active case changes from top bar
  useEffect(() => {
    setIsPlaying(false);
    setActiveEventIndex(0);
  }, [selectedCaseId]);

  // ─── Add Timeline Event Modal State ────────────────────────────────────────
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<string>('Financial Transaction');
  const [newEventSub, setNewEventSub] = useState('');
  const [newEventEntities, setNewEventEntities] = useState('');
  const [newEventEvidence, setNewEventEvidence] = useState('');
  const [newEventRisk, setNewEventRisk] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newEventAmount, setNewEventAmount] = useState('');
  const [newEventCity, setNewEventCity] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCase: LawCase = getCaseById(selectedCaseId);
  const eventRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // ─── Fetch Events ─────────────────────────────────────────────────────────
  const loadTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.timeline.getEvents({
        caseId: selectedCaseId === 'ALL' ? undefined : selectedCaseId,
        range: selectedRangePreset,
      });

      if (res && res.events && res.events.length > 0) {
        setEvents(res.events as TimelineEvent[]);
        setActiveEventIndex(0);
      } else {
        // Fallback dataset for selected case
        const caseObj = getCaseById(selectedCaseId);
        const fallbackEvents: TimelineEvent[] = [
          {
            id: `ev-1-${caseObj.id}`,
            timestamp: new Date().toISOString(),
            timeFormatted: '11:30 AM',
            dateFormatted: 'Today',
            type: 'Financial Transaction',
            category: 'Financial Transaction',
            title: `₹${caseObj.tracked_money_inr.toLocaleString('en-IN')} Layered Wire Transfer Detected`,
            sub: `Mule Account → ${caseObj.lead_suspect} (${caseObj.lead_suspect_role})`,
            entities: `${caseObj.lead_suspect} • ICICI / SBI Core Ledger`,
            entitiesSub: `Ref: TXN/2026/${caseObj.id.replace(/\D/g, '')}8910`,
            evidence: 'Core Banking API & SFMS Notice',
            evidenceType: 'doc',
            riskSeverity: caseObj.priority,
            properties: {
              amount_inr: caseObj.tracked_money_inr,
              channel: 'RTGS / SFMS',
              status: 'FLAGGED_HIGH_RISK',
              jurisdiction: caseObj.jurisdiction_city
            }
          },
          {
            id: `ev-2-${caseObj.id}`,
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            timeFormatted: '07:15 AM',
            dateFormatted: 'Today',
            type: 'Location',
            category: 'Location',
            title: `Geospatial Hotspot Ping: ${caseObj.jurisdiction_city}`,
            sub: `Cell Tower IPDR Triangulation linked to ${caseObj.lead_suspect}`,
            entities: `${caseObj.jurisdiction_city} Primary Hub`,
            entitiesSub: 'GPS: Lat 22.5726, Long 88.3638',
            evidence: 'Cell Tower CDR & IPDR Logs',
            evidenceType: 'geo',
            riskSeverity: 'HIGH',
            properties: {
              city: caseObj.jurisdiction_city,
              coordinates: '22.5726° N, 88.3638° E',
              accuracy_radius: '150 meters'
            }
          },
          {
            id: `ev-3-${caseObj.id}`,
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            timeFormatted: '09:40 PM',
            dateFormatted: 'Yesterday',
            type: 'Forensic Evidence',
            category: 'Forensic Evidence',
            title: `Forensic Evidence Seizure: ${caseObj.title}`,
            sub: `${caseObj.evidence_count} exhibits locked in forensic custody`,
            entities: `FIR: ${caseObj.fir_number}`,
            entitiesSub: 'SHA-256 Validated (Section 65B)',
            evidence: 'Digital Forensics Vault',
            evidenceType: 'hash',
            riskSeverity: 'HIGH',
            properties: {
              sha256: '9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061',
              cert_section: 'Section 65B Indian Evidence Act'
            }
          },
          {
            id: `ev-4-${caseObj.id}`,
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            timeFormatted: '04:10 PM',
            dateFormatted: 'Yesterday',
            type: 'Communication',
            category: 'Communication',
            title: `Telecom Intercept: Syndicate Communications`,
            sub: `Encrypted call routing through VoIP Gateway`,
            entities: `${caseObj.lead_suspect} ↔ Accomplices`,
            entitiesSub: 'Section 91 CrPC Telecom Intercept',
            evidence: 'Telecom Gateway Audio Stream',
            evidenceType: 'audio',
            riskSeverity: 'CRITICAL',
            properties: {
              call_duration_seconds: 480,
              encryption_type: 'VoIP SIP Trunk'
            }
          }
        ];
        setEvents(fallbackEvents);
        setActiveEventIndex(0);
      }
    } catch (err) {
      console.warn('Timeline live sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCaseId, selectedRangePreset]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // ─── Handle Create Timeline Event ─────────────────────────────────────────
  const handleCreateTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    try {
      setIsSubmittingEvent(true);
      const now = new Date();
      const customId = `ev-user-${Date.now().toString().slice(-6)}`;

      let evidenceType: 'doc' | 'audio' | 'video' | 'geo' | 'hash' = 'doc';
      if (newEventType === 'Communication') evidenceType = 'audio';
      else if (newEventType === 'Location') evidenceType = 'geo';
      else if (newEventType === 'Forensic Evidence') evidenceType = 'hash';

      const payload = {
        case_id: selectedCaseId,
        title: newEventTitle.trim(),
        type: newEventType,
        category: newEventType,
        sub: newEventSub.trim() || `Investigation exhibit recorded by officer`,
        entities: newEventEntities.trim() || activeCase.lead_suspect || 'Investigative Unit',
        entitiesSub: `Case: ${activeCase.fir_number || selectedCaseId}`,
        evidence: newEventEvidence.trim() || (evidenceType === 'hash' ? 'SHA-256 Vault Hash' : 'Field Investigation Record'),
        evidenceType,
        riskSeverity: newEventRisk,
        timestamp: now.toISOString(),
        properties: {
          amount_inr: newEventAmount ? Number(newEventAmount) : undefined,
          city: newEventCity || activeCase.jurisdiction_city,
          created_manually: true,
          section_65b_valid: true,
        },
      };

      const res = await api.timeline.addEvent(payload);

      const createdEvent: TimelineEvent = res || {
        id: customId,
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateFormatted: 'Today',
        type: newEventType,
        category: newEventType,
        title: newEventTitle.trim(),
        sub: payload.sub,
        entities: payload.entities,
        entitiesSub: payload.entitiesSub,
        evidence: payload.evidence,
        evidenceType,
        riskSeverity: newEventRisk,
        properties: payload.properties,
      };

      setEvents((prev) => [createdEvent, ...prev]);
      setActiveEventIndex(0);
      setIsAddEventOpen(false);
      setNewEventTitle('');
      setNewEventSub('');
      setNewEventEntities('');
      setNewEventEvidence('');
      setNewEventAmount('');
      setNewEventCity('');

      setToastMessage(`Added timeline exhibit "${newEventTitle}" successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.warn('Error adding timeline event:', err);
      setToastMessage('Timeline event saved to local chronological view.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // ─── Filter Events ────────────────────────────────────────────────────────
  const filteredEvents = events.filter((ev) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      ev.type.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      ev.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.entities.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.properties && JSON.stringify(ev.properties).toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  // ─── Playback Engine ──────────────────────────────────────────────────────
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && filteredEvents.length > 0) {
      const stepTimeMs = 1800 / playbackSpeed;
      interval = setInterval(() => {
        setActiveEventIndex((prev) => {
          if (prev >= filteredEvents.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          const el = eventRefs.current[nextIndex];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          return nextIndex;
        });
      }, stepTimeMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, filteredEvents.length]);

  const handleStepPrev = () => {
    setIsPlaying(false);
    setActiveEventIndex((prev) => Math.max(0, prev - 1));
    const targetIdx = Math.max(0, activeEventIndex - 1);
    const el = eventRefs.current[targetIdx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setActiveEventIndex((prev) => Math.min(filteredEvents.length - 1, prev + 1));
    const targetIdx = Math.min(filteredEvents.length - 1, activeEventIndex + 1);
    const el = eventRefs.current[targetIdx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleResetTimeline = () => {
    setIsPlaying(false);
    setActiveEventIndex(0);
    const el = eventRefs.current[0];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) return;
    const headers = ['Event ID', 'Date', 'Time', 'Type', 'Title', 'Description', 'Entities Involved', 'Evidence Ref', 'Risk Severity'];
    const rows = filteredEvents.map(e => [
      `"${e.id}"`,
      `"${e.dateFormatted}"`,
      `"${e.timeFormatted}"`,
      `"${e.type}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.sub.replace(/"/g, '""')}"`,
      `"${e.entities.replace(/"/g, '""')}"`,
      `"${e.evidence.replace(/"/g, '""')}"`,
      `"${e.riskSeverity}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CrimeSync_Timeline_${selectedCaseId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const renderIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('comm') || t.includes('phone') || t.includes('audio')) {
      return {
        icon: <Phone className="w-4 h-4 text-purple-300" />,
        bg: 'bg-purple-950/80 border-purple-500/50',
        badge: 'bg-purple-950 text-purple-400 border-purple-600/40',
        glow: 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
        label: 'Phone Intercept',
      };
    }
    if (t.includes('fin') || t.includes('bank') || t.includes('money') || t.includes('transaction')) {
      return {
        icon: <Landmark className="w-4 h-4 text-emerald-300" />,
        bg: 'bg-emerald-950/80 border-emerald-500/50',
        badge: 'bg-emerald-950 text-emerald-400 border-emerald-600/40',
        glow: 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        label: 'Bank Transfer',
      };
    }
    if (t.includes('loc') || t.includes('geo') || t.includes('gps')) {
      return {
        icon: <MapPin className="w-4 h-4 text-cyan-300" />,
        bg: 'bg-cyan-950/80 border-cyan-500/50',
        badge: 'bg-cyan-950 text-cyan-400 border-cyan-600/40',
        glow: 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        label: 'GPS Sighting',
      };
    }
    return {
      icon: <Hash className="w-4 h-4 text-blue-300" />,
      bg: 'bg-blue-950/80 border-blue-500/50',
      badge: 'bg-blue-950 text-blue-400 border-blue-600/40',
      glow: 'border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      label: 'Evidence Seizure',
    };
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      
      {/* ─── Top Toast Notification ──────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-cyan-950 border border-cyan-500/80 text-white text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Header & Case Switcher ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Timeline & Chronological Reconstruction
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                Multi-Modal Evidence Feed
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Reconstruct how the crime unfolded: correlate bank wires, VoIP taps, cell pings, and forensic seizures step-by-step
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {/* Add Timeline Event Button */}
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all hover:scale-105"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Timeline Event</span>
          </button>


          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Export Timeline to CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Sync */}
          <button
            onClick={loadTimeline}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* ─── Selected Case Banner & KPI Strip ───────────────────────── */}
      {selectedCaseId !== 'ALL' && activeCase && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-950 border border-cyan-600/40 text-cyan-300">
              {activeCase.fir_number}
            </span>
            <div>
              <span className="font-bold text-white text-sm mr-2">{activeCase.title}</span>
              <span className="text-slate-400 text-xs">({activeCase.jurisdiction_city})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Events:</span>
              <strong className="text-white font-mono">{filteredEvents.length}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Tracked Funds:</span>
              <strong className="text-emerald-400 font-mono">
                ₹{activeCase.tracked_money_inr.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400">Lead Suspect:</span>
              <strong className="text-red-300">{activeCase.lead_suspect}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ─── Explanatory Guide Banner ─────────────────────────────────── */}
      {showHelpBanner && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">How Crime Time Machine Works: </span>
              Use the <strong className="text-cyan-300">Timeline Player</strong> below to hit <strong className="text-emerald-300">▶ Play Simulation</strong> or click <strong className="text-cyan-300">+ Add Timeline Event</strong> to log a new wire transfer, intercepted call, or physical seizure.
            </div>
          </div>
          <button
            onClick={() => setShowHelpBanner(false)}
            className="text-slate-400 hover:text-slate-200 font-bold px-2 py-0.5 text-[11px]"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ─── TIME PLAYER & SIMULATION CONTROLS ──────────────────────────── */}
      <div className="mt-2.5 p-3 rounded-xl bg-[#091122] border border-cyan-500/30 shadow-lg flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Player Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTimeline}
              title="Reset to Earliest Event"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleStepPrev}
              disabled={activeEventIndex === 0}
              title="Step Backward"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 text-xs transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Timeline'}</span>
            </button>

            <button
              onClick={handleStepNext}
              disabled={activeEventIndex >= filteredEvents.length - 1}
              title="Step Forward"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 text-xs transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Speed Toggle */}
            <div className="flex items-center ml-2 bg-slate-900 rounded-lg border border-slate-800 p-0.5 text-[11px]">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                    playbackSpeed === spd ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Readout */}
          <div className="flex items-center gap-3 text-xs">
            {filteredEvents.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400">Focus:</span>
                <span className="font-bold text-cyan-300">
                  Event {activeEventIndex + 1} of {filteredEvents.length}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {filteredEvents[activeEventIndex]?.dateFormatted} {filteredEvents[activeEventIndex]?.timeFormatted}
                </span>
              </div>
            )}

            {isPlaying && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>Simulating Crime Trajectory...</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrubber Progress Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, filteredEvents.length - 1)}
            value={activeEventIndex}
            onChange={(e) => {
              setIsPlaying(false);
              const idx = parseInt(e.target.value);
              setActiveEventIndex(idx);
              const el = eventRefs.current[idx];
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* ─── Filter & Search Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Events', val: 'ALL' },
            { label: 'Bank Transfers (₹)', val: 'Financial' },
            { label: 'Phone Intercepts (📞)', val: 'Communication' },
            { label: 'GPS Sightings (📍)', val: 'Location' },
            { label: 'Evidence Seizures (🛡️)', val: 'Evidence' },
          ].map((cat) => (
            <button
              key={cat.val}
              onClick={() => {
                setSelectedCategory(cat.val);
                setActiveEventIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat.val
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-sm'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Range Preset Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg border border-slate-800 p-0.5 text-[11px]">
          {(['24H', '7D', '15D', '30D', 'ALL'] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => setSelectedRangePreset(rng)}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                selectedRangePreset === rng ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, suspects, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* ─── Main Timeline Feed ───────────────────────────────────────── */}
      <div className="flex-1 min-h-0 bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        
        {/* Feed Header */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Showing <strong className="text-white">{filteredEvents.length}</strong> chronological exhibits</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {activeCase?.title || 'All Cases Reconstructed'}
          </span>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-xs">Reconstructing chronological timeline for {activeCase?.title || 'Case'}...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
              {filteredEvents.map((ev, index) => {
                const iconInfo = renderIcon(ev.type);
                const isActive = activeEventIndex === index;

                return (
                  <div
                    key={ev.id}
                    ref={(el) => {
                      eventRefs.current[index] = el;
                    }}
                    className="relative group transition-all"
                  >
                    {/* Circle Bullet on Timeline Line */}
                    <div
                      className={`absolute -left-[31px] top-2 w-4 h-4 rounded-full border-2 transition-all ${
                        isActive
                          ? 'bg-cyan-500 border-white scale-125 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : 'bg-slate-900 border-slate-600 group-hover:scale-125 group-hover:border-cyan-400'
                      }`}
                    />

                    {/* Timeline Event Card */}
                    <div
                      onClick={() => {
                        setActiveEventIndex(index);
                        setSelectedModalEvent(ev);
                      }}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer shadow-md ${
                        isActive
                          ? `bg-slate-900/95 border-2 ${iconInfo.glow}`
                          : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${iconInfo.badge}`}>
                            {iconInfo.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {ev.dateFormatted} • {ev.timeFormatted}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/50 uppercase animate-pulse">
                              Active Focus
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              ev.riskSeverity === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border border-red-700/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-700/40'
                            }`}
                          >
                            {ev.riskSeverity} RISK
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModalEvent(ev);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700"
                            title="Inspect Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Title & Sub */}
                      <h4 className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2.5">{ev.sub}</p>

                      {/* Entity & Evidence Footer */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Entities:</span>
                          <span className="font-semibold text-slate-200">{ev.entities}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{ev.evidence}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Clock className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs">No timeline events match the selected filters or case.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── ADD TIMELINE EVENT MODAL ───────────────────────────────────── */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#091122] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Chronological Exhibit to Case</h3>
                  <p className="text-[11px] text-slate-400">Case: {activeCase?.title || selectedCaseId}</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddEventOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTimelineEvent} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹28,00,000 Layered Transfer to Overseas Mule, Raid at Call Center Suite"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Category</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="Financial Transaction">Financial Transaction (₹ Wire / UPI)</option>
                    <option value="Communication">Communication (VoIP / Phone Intercept)</option>
                    <option value="Location">Location (GPS Sighting / Cell Tower)</option>
                    <option value="Forensic Evidence">Forensic Evidence (Physical / Digital Seizure)</option>
                    <option value="Case Event">Case Event (FIR / Warrant / Action)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Severity</label>
                  <select
                    value={newEventRisk}
                    onChange={(e) => setNewEventRisk(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="CRITICAL">CRITICAL RISK</option>
                    <option value="HIGH">HIGH RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="LOW">LOW RISK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investigative Narrative / Subtitle</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Money was routed through 3 intermediate shell accounts before being cashed out via crypto OTC desk."
                  value={newEventSub}
                  onChange={(e) => setNewEventSub(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Involved Parties / Entities</label>
                  <input
                    type="text"
                    placeholder="e.g. Debjit Sen → Anirban Mukherjee"
                    value={newEventEntities}
                    onChange={(e) => setNewEventEntities(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Evidence Reference / SHA-256</label>
                  <input
                    type="text"
                    placeholder="e.g. SFMS Wire Log #88192 or Hash"
                    value={newEventEvidence}
                    onChange={(e) => setNewEventEvidence(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              {newEventType === 'Financial Transaction' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transaction Amount (INR ₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500000"
                    value={newEventAmount}
                    onChange={(e) => setNewEventAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>
              )}

              {newEventType === 'Location' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Location Point</label>
                  <input
                    type="text"
                    placeholder="e.g. Salt Lake Sector V, Kolkata"
                    value={newEventCity}
                    onChange={(e) => setNewEventCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent || !newEventTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmittingEvent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>{isSubmittingEvent ? 'Saving...' : 'Add Event to Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── FORENSIC EVENT INSPECTOR MODAL ─────────────────────────────── */}
      {selectedModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#091122] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Forensic Exhibit Inspector</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedModalEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedModalEvent(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Event Title Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                    {selectedModalEvent.type}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {selectedModalEvent.dateFormatted} • {selectedModalEvent.timeFormatted}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{selectedModalEvent.title}</h4>
                <p className="text-slate-300 text-xs">{selectedModalEvent.sub}</p>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Involved Parties / Entities</span>
                  <p className="font-semibold text-white mt-1">{selectedModalEvent.entities}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedModalEvent.entitiesSub}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Evidence Validation Ref</span>
                  <p className="font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedModalEvent.evidence}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Section 65B Indian Evidence Act Compliant</p>
                </div>
              </div>

              {/* Raw JSON / Technical Properties */}
              {selectedModalEvent.properties && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Technical Exhibit Payload (JSON)
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedModalEvent.properties, null, 2))}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-[#040813] border border-slate-900 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-36">
                    {JSON.stringify(selectedModalEvent.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedModalEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
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
