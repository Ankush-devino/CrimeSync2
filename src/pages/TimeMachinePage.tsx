import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  Phone, 
  Landmark, 
  MapPin, 
  Car, 
  Users, 
  FileText, 
  Video, 
  ShieldAlert, 
  ArrowRight, 
  Radio, 
  Check, 
  List, 
  Grid,
  RefreshCw,
  Loader2,
  Database,
  Hash,
  Sparkles
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
  const [selectedRangePreset, setSelectedRangePreset] = useState<'7D' | '15D' | '30D' | 'Custom'>('15D');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventFilters, setActiveEventFilters] = useState<Record<string, boolean>>({
    'Communication': true,
    'Financial Transaction': true,
    'Location': true,
    'Surveillance': true,
    'Forensic Evidence': true,
  });

  const loadTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.timeline.getEvents({ range: selectedRangePreset });
      if (res && res.events) {
        setEvents(res.events as TimelineEvent[]);
      }
    } catch (err) {
      console.warn('Timeline live sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRangePreset]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const toggleFilter = (key: string) => {
    setActiveEventFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllFilters = () => {
    setActiveEventFilters({
      'Communication': true,
      'Financial Transaction': true,
      'Location': true,
      'Surveillance': true,
      'Forensic Evidence': true,
    });
  };

  const clearAllFilters = () => {
    setActiveEventFilters({
      'Communication': false,
      'Financial Transaction': false,
      'Location': false,
      'Surveillance': false,
      'Forensic Evidence': false,
    });
  };

  const filteredEvents = events
    .filter((ev) => activeEventFilters[ev.category] ?? true)
    .filter((ev) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.sub.toLowerCase().includes(q) ||
        ev.entities.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });

  const renderEventIcon = (type: string, evidenceType: string) => {
    if (type === 'Communication') {
      return {
        icon: <Phone className="w-3.5 h-3.5 text-purple-300" />,
        bg: 'bg-purple-600/30 border-purple-500/50',
        color: 'text-purple-400',
      };
    }
    if (type === 'Financial Transaction') {
      return {
        icon: <Landmark className="w-3.5 h-3.5 text-emerald-300" />,
        bg: 'bg-emerald-600/30 border-emerald-500/50',
        color: 'text-emerald-400',
      };
    }
    if (type === 'Location') {
      return {
        icon: <MapPin className="w-3.5 h-3.5 text-cyan-300" />,
        bg: 'bg-cyan-600/30 border-cyan-500/50',
        color: 'text-cyan-400',
      };
    }
    if (type === 'Forensic Evidence') {
      return {
        icon: <Hash className="w-3.5 h-3.5 text-blue-300" />,
        bg: 'bg-blue-600/30 border-blue-500/50',
        color: 'text-blue-400',
      };
    }
    return {
      icon: <Car className="w-3.5 h-3.5 text-amber-300" />,
      bg: 'bg-amber-600/30 border-amber-500/50',
      color: 'text-amber-400',
    };
  };

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111e33]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              TIME MACHINE
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Reconstruction
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Chronological forensic reconstruction synthesizing PostgreSQL & Neo4j events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTimeline}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Timeline PDF/CSV')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Timeline (8 cols) + Right Filters & Analytics (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 pt-3 overflow-hidden">
        {/* Left 8 Cols: Case bar + Date selector + Events Feed */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0 overflow-y-auto pr-0.5">
          {/* Top Case Context & Range Header */}
          <div className="p-3 rounded-xl bg-[#050b18] border border-[#111e33] space-y-3 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CASE CHRONOLOGY
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold">
                  Operation Trishul / Cross-Syndicate
                </span>
              </div>

              {/* Range Presets */}
              <div className="flex items-center gap-1 bg-[#030712] p-1 rounded-lg border border-[#111e33] text-xs">
                {(['7D', '15D', '30D', 'Custom'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRangePreset(range)}
                    className={`px-2.5 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                      selectedRangePreset === range
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Filter & Search toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#111e33] text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter events, suspects, accounts..."
                  className="w-full bg-[#081224] border border-[#162947] rounded-md px-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
                  className="px-2 py-1 rounded bg-[#091428] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white"
                >
                  {sortOrder === 'desc' ? 'Newest First ↓' : 'Oldest First ↑'}
                </button>
                <div className="flex items-center bg-[#091428] border border-[#162744] rounded p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    <Grid className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Feed Stream */}
          <div className="space-y-2.5 flex-1">
            {isLoading ? (
              <div className="p-8 rounded-xl bg-[#050b18] border border-[#111e33] text-center space-y-2">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Reconstructing timeline from PostgreSQL & Neo4j...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#050b18] border border-[#111e33] text-center space-y-2">
                <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No events match the selected filters or date range</p>
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const style = renderEventIcon(ev.type, ev.evidenceType);
                return (
                  <div
                    key={ev.id || idx}
                    className="p-3 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-blue-500/40 transition-all shadow-md flex items-start gap-3"
                  >
                    {/* Time pill */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#081224] border border-[#162744] text-center min-w-[70px] flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-white">{ev.timeFormatted}</span>
                      <span className="text-[8px] font-mono text-slate-400">{ev.dateFormatted}</span>
                    </div>

                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${style.bg}`}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] font-bold ${style.color}`}>
                            {ev.type}
                          </span>
                          <span className="text-[10px] text-slate-500">·</span>
                          <span className="text-xs font-semibold text-slate-100 truncate">
                            {ev.title}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                          ev.riskSeverity === 'CRITICAL' ? 'bg-red-950/80 border border-red-500/60 text-red-300' :
                          ev.riskSeverity === 'HIGH' ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300' :
                          'bg-blue-950/80 border border-blue-500/60 text-blue-300'
                        }`}>
                          {ev.riskSeverity}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-300 leading-snug">
                        {ev.sub}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-[#111e33]/50">
                        <span className="font-mono text-slate-300 truncate max-w-xs">{ev.entities}</span>
                        <span className="text-slate-400">{ev.evidence}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 4 Cols: Event Type Filters & Activity Density Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Card 1: EVENT TYPE FILTERS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                EVENT FILTERS
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <button onClick={selectAllFilters} className="text-blue-400 hover:underline">Select All</button>
                <span className="text-slate-600">·</span>
                <button onClick={clearAllFilters} className="text-slate-400 hover:underline">Clear</button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Communication', color: '#a855f7', count: events.filter(e => e.category === 'Communication').length },
                { label: 'Financial Transaction', color: '#10b981', count: events.filter(e => e.category === 'Financial Transaction').length },
                { label: 'Location', color: '#06b6d4', count: events.filter(e => e.category === 'Location').length },
                { label: 'Surveillance', color: '#f59e0b', count: events.filter(e => e.category === 'Surveillance').length },
                { label: 'Forensic Evidence', color: '#3b82f6', count: events.filter(e => e.category === 'Forensic Evidence').length },
              ].map((filterItem) => (
                <div
                  key={filterItem.label}
                  onClick={() => toggleFilter(filterItem.label)}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#081224] hover:bg-[#0c1a36] border border-[#162744] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeEventFilters[filterItem.label] ?? true}
                      onChange={() => {}}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-3 h-3"
                    />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: filterItem.color }} />
                    <span className="text-[11px] text-slate-200">{filterItem.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{filterItem.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: ACTIVITY DENSITY */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ACTIVITY DENSITY
              </span>
              <span className="text-[9.5px] font-mono text-emerald-400 font-bold">{events.length} Live Records</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Temporal correlation shows clustering during late evening hours (8:00 PM – 11:30 PM) across communication and Hawala transfers.
            </p>

            <div className="grid grid-cols-7 gap-1 pt-2">
              {heatmapDays.map((day, dIdx) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[8px] text-slate-400">{day}</span>
                  <div className={`w-full h-8 rounded ${dIdx % 2 === 0 ? 'bg-blue-600/40 border border-blue-500/50' : 'bg-purple-600/30 border border-purple-500/40'} flex items-center justify-center`}>
                    <span className="text-[9px] font-mono font-bold text-white">{dIdx + 2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: AI SEQUENCE CORRELATION */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-2 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AI SEQUENCE CORRELATION
              </span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>

            <div className="p-2.5 rounded-lg bg-[#071329] border border-blue-500/30 text-[10.5px] text-slate-200 leading-relaxed space-y-1.5">
              <p className="font-semibold text-blue-300">Synchronized Pattern Detected:</p>
              <p className="text-[10px] text-slate-300">
                Hawala transfers (₹28.5L) execute within 45 minutes of encrypted cellular contact between suspect Alok Pandey and kingpin Vikramaditya Shinde.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
