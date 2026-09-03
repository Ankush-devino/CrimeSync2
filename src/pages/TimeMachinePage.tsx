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
  ArrowDown
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
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'ALL') return true;
    return ev.type === selectedCategory || ev.category === selectedCategory;
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

  return (
    <div className="flex-1 p-4 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Simple Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Investigation Time Machine
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-semibold text-cyan-300">
                Live Crime Chronology
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Follow how events unfolded step-by-step in chronological order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Range buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {(['7D', '15D', '30D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRangePreset(r)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedRangePreset === r
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Last {r.replace('D', ' Days')}
              </button>
            ))}
          </div>

          <button
            onClick={loadTimeline}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Category Quick Filter Bar ───────────────────────────────── */}
      <div className="flex items-center gap-2 py-2.5 text-xs overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Filter Event Types:</span>
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'Financial Transaction', label: '💸 Money Transfers' },
          { id: 'Communication', label: '📞 Phone Calls' },
          { id: 'Location', label: '📍 Locations & Sighting' },
          { id: 'Forensic Evidence', label: '📦 Seized Evidence' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedCategory(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              selectedCategory === f.id
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                : 'bg-[#070e1c] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left 8 Cols: Simple Vertical Timeline Stream */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#070e1c] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Chronological Sequence of Events ({filteredEvents.length})
            </span>
            <span className="text-slate-400 text-[11px]">Most recent first ↓</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Reconstructing crime event sequence from database...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No events found for this filter.</p>
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const style = renderIcon(ev.type);
                return (
                  <div
                    key={ev.id || idx}
                    className="p-3.5 rounded-xl bg-[#0b162a] border border-slate-700/60 hover:border-cyan-500/40 transition-all shadow-md flex items-start gap-3.5"
                  >
                    {/* Timestamp Box */}
                    <div className="p-2 rounded-lg bg-[#040913] border border-slate-800 text-center min-w-[76px] flex-shrink-0">
                      <span className="text-xs font-bold text-white font-mono block">{ev.timeFormatted}</span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{ev.dateFormatted}</span>
                    </div>

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${style.bg}`}>
                      {style.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${style.badge}`}>
                            {style.label}
                          </span>
                          <h3 className="text-xs font-bold text-white truncate">{ev.title}</h3>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          ev.riskSeverity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/50' :
                          ev.riskSeverity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-500/50' :
                          'bg-blue-950 text-blue-400 border border-blue-500/50'
                        }`}>
                          {ev.riskSeverity} RISK
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-snug">
                        {ev.sub}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                        <span className="truncate font-mono text-slate-300">Entities: {ev.entities}</span>
                        <span className="text-slate-400 flex-shrink-0">Source: {ev.evidence}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 4 Cols: Timeline Insights & Summary */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          
          {/* Card 1: Chronology Takeaway */}
          <div className="p-4 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Key Timeline Insight
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed space-y-2">
              <p className="font-bold text-cyan-300">🚨 Synchronized Pattern:</p>
              <p className="text-[11.5px] leading-relaxed">
                Bank transfers worth <strong>₹28,50,000</strong> were initiated immediately after encrypted telephone conversations between Alok Pandey and Vikramaditya Shinde.
              </p>
            </div>
          </div>

          {/* Card 2: Total Events Breakdown */}
          <div className="p-4 rounded-xl bg-[#070e1c] border border-slate-800 shadow-lg space-y-3 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Event Breakdown
              </span>
              <span className="text-xs font-bold text-cyan-400">{events.length} Total</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Bank Transfers', count: events.filter(e => e.type === 'Financial Transaction').length, icon: '💸', color: 'text-emerald-400' },
                { label: 'Phone Calls Intercepted', count: events.filter(e => e.type === 'Communication').length, icon: '📞', color: 'text-purple-400' },
                { label: 'Location Sightings', count: events.filter(e => e.type === 'Location').length, icon: '📍', color: 'text-cyan-400' },
                { label: 'Evidence Seizures', count: events.filter(e => e.type === 'Forensic Evidence').length, icon: '📦', color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0b162a] border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span>{stat.label}</span>
                  </span>
                  <span className={`font-mono font-bold text-xs ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plain English Guide */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-slate-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              What is Time Machine?
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Time Machine stitches together separate evidence sources into one single timeline, allowing officers and court judges to easily see what happened first, second, and third.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
