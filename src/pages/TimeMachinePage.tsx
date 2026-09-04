import React, { useState, useEffect, useCallback } from 'react';
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
  Car,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowDown,
  Briefcase,
  Layers,
  Search,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

interface TimeMachinePageProps {
  onSelectAction?: (action: string) => void;
}

interface TimelineEvent {
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
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-004');
  const [casesList, setCasesList] = useState<any[]>([]);
  const [selectedRangePreset, setSelectedRangePreset] = useState<'7D' | '15D' | '30D' | 'Custom'>('15D');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load cases list
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await api.cases.getAll();
        if (res) setCasesList(res);
      } catch (err) {
        console.warn('Failed to load cases:', err);
      }
    }
    loadCases();
  }, []);

  const loadTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.timeline.getEvents({
        caseId: selectedCaseId === 'ALL' ? undefined : selectedCaseId,
        range: selectedRangePreset,
      });
      if (res && res.events) {
        setEvents(res.events as TimelineEvent[]);
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

  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'ALL' || ev.type === selectedCategory || ev.category === selectedCategory;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.entities.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const renderIcon = (type: string) => {
    if (type === 'Communication') {
      return {
        icon: <Phone className="w-4 h-4 text-purple-300" />,
        bg: 'bg-purple-950/80 border-purple-500/50',
        badge: 'bg-purple-950 text-purple-400 border-purple-600/40',
        label: 'Phone Contact',
      };
    }
    if (type === 'Financial Transaction') {
      return {
        icon: <Landmark className="w-4 h-4 text-emerald-300" />,
        bg: 'bg-emerald-950/80 border-emerald-500/50',
        badge: 'bg-emerald-950 text-emerald-400 border-emerald-600/40',
        label: 'Bank Transfer',
      };
    }
    if (type === 'Location') {
      return {
        icon: <MapPin className="w-4 h-4 text-cyan-300" />,
        bg: 'bg-cyan-950/80 border-cyan-500/50',
        badge: 'bg-cyan-950 text-cyan-400 border-cyan-600/40',
        label: 'Location Sighting',
      };
    }
    return {
      icon: <Hash className="w-4 h-4 text-blue-300" />,
      bg: 'bg-blue-950/80 border-blue-500/50',
      badge: 'bg-blue-950 text-blue-400 border-blue-600/40',
      label: 'Evidence Seizure',
    };
  };

  const activeCase = casesList.find((c) => c.id === selectedCaseId) || casesList[0];

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Header & Case Switcher ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Crime Time Machine & Chronological Reconstruction
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                Multi-Modal Evidence Feed
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Correlate bank transfers, phone intercepts, cell tower pings, and evidence seizures in exact chronological sequence
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Case Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
            <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Cases (Chronological Stream)</option>
              {casesList.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.fir_number} — {c.title}
                </option>
              ))}
            </select>
          </div>

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

      {/* ─── Explanatory Guide Banner ─────────────────────────────────── */}
      {showHelpBanner && (
        <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">How the Crime Time Machine Works: </span>
              This view pulls time-stamped events across bank ledgers, phone calls, GPS pings, and physical evidence logs. Replay the sequence of criminal actions to prove conspiracy and timeline in court.
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

      {/* ─── Filter & Search Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Timeline Events', val: 'ALL' },
            { label: 'Bank Transfers', val: 'Financial Transaction' },
            { label: 'Phone Intercepts', val: 'Communication' },
            { label: 'GPS Sightings', val: 'Location' },
            { label: 'Evidence Seizures', val: 'Forensic Evidence' },
          ].map((cat) => (
            <button
              key={cat.val}
              onClick={() => setSelectedCategory(cat.val)}
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

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timeline events, suspects, or amounts..."
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
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Showing <strong className="text-white">{filteredEvents.length}</strong> reconstructed events</span>
          </div>
          <span className="text-[11px] text-slate-500">Case: {activeCase?.title || 'Selected Case'}</span>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-xs">Reconstructing chronological crime timeline...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
              {filteredEvents.map((ev) => {
                const iconInfo = renderIcon(ev.type);
                return (
                  <div key={ev.id} className="relative group">
                    {/* Circle Bullet on Timeline Line */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-500 group-hover:scale-125 transition-transform" />

                    {/* Timeline Event Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${iconInfo.badge}`}>
                            {iconInfo.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {ev.dateFormatted} • {ev.timeFormatted}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ev.riskSeverity === 'CRITICAL'
                              ? 'bg-red-950 text-red-400 border border-red-700/40'
                              : 'bg-amber-950 text-amber-400 border border-amber-700/40'
                          }`}
                        >
                          {ev.riskSeverity} RISK
                        </span>
                      </div>

                      {/* Main Title & Sub */}
                      <h4 className="text-sm font-bold text-white mb-0.5">{ev.title}</h4>
                      <p className="text-xs text-slate-400 mb-2">{ev.sub}</p>

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
              <p className="text-xs">No timeline events matched your current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
