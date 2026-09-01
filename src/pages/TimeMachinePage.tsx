import React, { useState } from 'react';
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
  Grid 
} from 'lucide-react';

interface TimeMachinePageProps {
  onSelectAction?: (action: string) => void;
}

export const TimeMachinePage: React.FC<TimeMachinePageProps> = ({ onSelectAction }) => {
  const [selectedRangePreset, setSelectedRangePreset] = useState<'7D' | '15D' | '30D' | 'Custom'>('15D');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeEventFilters, setActiveEventFilters] = useState<Record<string, boolean>>({
    Communication: true,
    'Financial Transaction': true,
    Location: true,
    Surveillance: true,
    Association: true,
    'Event / Other': true,
  });

  const toggleFilter = (key: string) => {
    setActiveEventFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllFilters = () => {
    setActiveEventFilters({
      Communication: true,
      'Financial Transaction': true,
      Location: true,
      Surveillance: true,
      Association: true,
      'Event / Other': true,
    });
  };

  const clearAllFilters = () => {
    setActiveEventFilters({
      Communication: false,
      'Financial Transaction': false,
      Location: false,
      Surveillance: false,
      Association: false,
      'Event / Other': false,
    });
  };

  // Timeline events for 27 Aug 2026
  const timelineEvents = [
    {
      id: 'e1',
      time: '10:31 PM',
      type: 'Communication',
      category: 'Communication',
      title: 'Call between Aman Khan & Vikram J.',
      sub: 'Duration: 14m 32s',
      entities: 'Aman Khan, Vikram J.',
      entitiesSub: '+91 98765 43210',
      evidence: 'CDR Records',
      evidenceType: 'doc',
      icon: <Phone className="w-3.5 h-3.5 text-purple-300" />,
      iconBg: 'bg-purple-600/30 border-purple-500/50',
      textColor: 'text-purple-400',
    },
    {
      id: 'e2',
      time: '09:58 PM',
      type: 'Financial Transaction',
      category: 'Financial Transaction',
      title: '₹1,50,000 transferred to AC987654',
      sub: 'From AC455566',
      entities: 'Aman Khan → AC987654',
      entitiesSub: '₹1,50,000',
      evidence: 'Bank Records',
      evidenceType: 'doc',
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-300" />,
      iconBg: 'bg-emerald-600/30 border-emerald-500/50',
      textColor: 'text-emerald-400',
    },
    {
      id: 'e3',
      time: '09:21 PM',
      type: 'Location Overlap',
      category: 'Location',
      title: 'Aman Khan & Rahul Sharma',
      sub: 'Karol Bagh',
      entities: 'Aman Khan, Rahul Sharma',
      entitiesSub: 'Karol Bagh, Delhi',
      evidence: 'Location Data',
      evidenceType: 'doc',
      icon: <MapPin className="w-3.5 h-3.5 text-cyan-300" />,
      iconBg: 'bg-cyan-600/30 border-cyan-500/50',
      textColor: 'text-cyan-400',
    },
    {
      id: 'e4',
      time: '08:45 PM',
      type: 'Surveillance',
      category: 'Surveillance',
      title: 'Vehicle DL12AB1234 captured',
      sub: 'Near Crime Scene 1 - Lajpat Nagar',
      entities: 'DL12AB1234',
      entitiesSub: 'Lajpat Nagar, Delhi',
      evidence: 'CCTV Footage',
      evidenceType: 'video',
      icon: <Car className="w-3.5 h-3.5 text-amber-300" />,
      iconBg: 'bg-amber-600/30 border-amber-500/50',
      textColor: 'text-amber-400',
    },
    {
      id: 'e5',
      time: '07:12 PM',
      type: 'Association',
      category: 'Association',
      title: 'Vikram J. met with Riya Singh',
      sub: 'At Shakti Transport Pvt. Ltd.',
      entities: 'Vikram J., Riya Singh',
      entitiesSub: 'Shakti Transport Pvt. Ltd.',
      evidence: 'Intelligence Report',
      evidenceType: 'intel',
      icon: <Users className="w-3.5 h-3.5 text-pink-300" />,
      iconBg: 'bg-pink-600/30 border-pink-500/50',
      textColor: 'text-pink-400',
    },
    {
      id: 'e6',
      time: '05:32 PM',
      type: 'Location',
      category: 'Location',
      title: 'Phone +91 98765 43210',
      sub: 'Tower location: Karol Bagh',
      entities: '+91 98765 43210',
      entitiesSub: 'Karol Bagh, Delhi',
      evidence: 'CDR Location',
      evidenceType: 'doc',
      icon: <MapPin className="w-3.5 h-3.5 text-cyan-300" />,
      iconBg: 'bg-cyan-600/30 border-cyan-500/50',
      textColor: 'text-cyan-400',
    },
    {
      id: 'e7',
      time: '03:25 PM',
      type: 'Financial Transaction',
      category: 'Financial Transaction',
      title: '₹4,20,000 received in AC987654',
      sub: 'From AC112233',
      entities: 'AC987654',
      entitiesSub: '₹4,20,000',
      evidence: 'Bank Records',
      evidenceType: 'doc',
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-300" />,
      iconBg: 'bg-emerald-600/30 border-emerald-500/50',
      textColor: 'text-emerald-400',
    },
    {
      id: 'e8',
      time: '01:40 PM',
      type: 'Communication',
      category: 'Communication',
      title: 'Call between Aman Khan & Rahul Sharma',
      sub: 'Duration: 06m 41s',
      entities: 'Aman Khan, Rahul Sharma',
      entitiesSub: '+91 91234 56789',
      evidence: 'CDR Records',
      evidenceType: 'doc',
      icon: <Phone className="w-3.5 h-3.5 text-purple-300" />,
      iconBg: 'bg-purple-600/30 border-purple-500/50',
      textColor: 'text-purple-400',
    },
  ];

  const filteredEvents = timelineEvents.filter((ev) => activeEventFilters[ev.category]);

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapHours = ['00', '04', '08', '12', '16', '20', '23'];

  // 7 days x 12 hour slots heatmap values (0 to 4 scale)
  const heatmapGrid = [
    [0, 0, 0, 1, 1, 2, 2, 3, 4, 3, 3, 2], // Mon
    [0, 0, 0, 0, 2, 2, 3, 3, 4, 4, 3, 1], // Tue
    [0, 0, 1, 1, 2, 2, 2, 4, 4, 4, 2, 1], // Wed
    [0, 0, 0, 1, 1, 3, 3, 3, 4, 4, 3, 2], // Thu
    [0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 3], // Fri
    [0, 1, 0, 0, 1, 2, 2, 3, 3, 4, 3, 2], // Sat
    [0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 2, 1], // Sun
  ];

  const getHeatmapColor = (lvl: number) => {
    switch (lvl) {
      case 4:
        return 'bg-amber-400 shadow-[0_0_6px_#f59e0b]';
      case 3:
        return 'bg-rose-500';
      case 2:
        return 'bg-purple-600';
      case 1:
        return 'bg-blue-700';
      case 0:
      default:
        return 'bg-[#0a1832]';
    }
  };

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111e33]">
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            TIME MACHINE
          </h1>
          <p className="text-[10px] text-slate-400">
            Visualize how the investigation evolved over time
          </p>
        </div>

        <button
          onClick={() => onSelectAction && onSelectAction('Exporting Timeline PDF/CSV')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Timeline</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Main Grid: Left Timeline (8 cols) + Right Filters & Analytics (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 pt-3 overflow-hidden">
        {/* Left 8 Cols: Case bar + Date selector + Gantt overview + Events Feed */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0 overflow-y-auto pr-0.5">
          {/* Top Case Context & Range Header */}
          <div className="p-3 rounded-xl bg-[#050b18] border border-[#111e33] space-y-3 shadow-xl">
            {/* Case ID Bar */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#111e33]/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Case ID:</span>
                  <span className="font-bold text-slate-100 font-mono">RC-2026-0417</span>
                </div>
                <div className="text-slate-300 font-semibold truncate">
                  Organized Theft & Money Laundering
                </div>
                <span className="px-1.5 py-0.2 rounded bg-red-950/70 border border-red-500/50 text-[9px] font-bold text-red-400">
                  HIGH ⌵
                </span>
              </div>

              <button 
                onClick={() => onSelectAction && onSelectAction('Export Timeline Report')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#091224] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white"
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span>Export Timeline</span>
              </button>
            </div>

            {/* Date Range Selectors */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px] font-medium">Date Range</span>
                <button className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#091224] border border-[#162744] text-slate-200 text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>14 Aug 2026 – 27 Aug 2026</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Range Presets */}
                <div className="flex items-center rounded-md bg-[#091224] border border-[#162744] p-0.5 text-[10.5px]">
                  {(['7D', '15D', '30D', 'Custom'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedRangePreset(preset)}
                      className={`px-2 py-0.5 rounded transition-all font-medium ${
                        selectedRangePreset === preset
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-500/50 text-[10.5px] text-purple-300 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span>Now</span>
              </button>
            </div>

            {/* Gantt / Activity Overview Strip Chart */}
            <div className="pt-2 border-t border-[#111e33]/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Timeline Overview</span>
              </div>

              {/* Multi-lane visual Gantt ticks */}
              <div className="relative h-12 bg-[#030814] rounded-lg border border-[#142646] p-2 flex flex-col justify-between overflow-hidden">
                {/* Lane 1 ticks */}
                <div className="flex items-center justify-between px-2">
                  <span className="w-4 h-1.5 rounded-sm bg-purple-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-blue-500"></span>
                  <span className="w-5 h-1.5 rounded-sm bg-emerald-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-amber-500"></span>
                  <span className="w-4 h-1.5 rounded-sm bg-pink-500"></span>
                  <span className="w-6 h-1.5 rounded-sm bg-cyan-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-purple-500"></span>
                  <span className="w-4 h-1.5 rounded-sm bg-emerald-500"></span>
                </div>
                {/* Lane 2 ticks */}
                <div className="flex items-center justify-between px-6">
                  <span className="w-3 h-1.5 rounded-sm bg-cyan-500"></span>
                  <span className="w-6 h-1.5 rounded-sm bg-amber-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-purple-500"></span>
                  <span className="w-5 h-1.5 rounded-sm bg-emerald-500"></span>
                  <span className="w-4 h-1.5 rounded-sm bg-cyan-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-pink-500"></span>
                  <span className="w-5 h-1.5 rounded-sm bg-amber-500"></span>
                </div>
                {/* Lane 3 ticks */}
                <div className="flex items-center justify-between px-1">
                  <span className="w-5 h-1.5 rounded-sm bg-pink-500"></span>
                  <span className="w-4 h-1.5 rounded-sm bg-emerald-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-cyan-500"></span>
                  <span className="w-6 h-1.5 rounded-sm bg-purple-500"></span>
                  <span className="w-3 h-1.5 rounded-sm bg-amber-500"></span>
                  <span className="w-5 h-1.5 rounded-sm bg-pink-500"></span>
                  <span className="w-4 h-1.5 rounded-sm bg-emerald-500"></span>
                  <span className="w-6 h-1.5 rounded-sm bg-purple-500"></span>
                </div>
              </div>

              {/* Dates labels below chart */}
              <div className="flex justify-between text-[9.5px] font-mono text-slate-500 px-1">
                <span>14 Aug</span>
                <span>16 Aug</span>
                <span>18 Aug</span>
                <span>20 Aug</span>
                <span>22 Aug</span>
                <span>24 Aug</span>
                <span>26 Aug</span>
                <span>27 Aug</span>
              </div>

              {/* Legend category count pills */}
              <div className="flex items-center gap-3 overflow-x-auto text-[10px] text-slate-400 pt-1 scrollbar-none">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-purple-500"></span>
                  <span>Communication <strong className="text-slate-200">28</strong></span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500"></span>
                  <span>Financial <strong className="text-slate-200">22</strong></span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-cyan-500"></span>
                  <span>Location <strong className="text-slate-200">16</strong></span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-amber-500"></span>
                  <span>Surveillance <strong className="text-slate-200">12</strong></span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-pink-500"></span>
                  <span>Association <strong className="text-slate-200">18</strong></span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-sm bg-violet-500"></span>
                  <span>Event <strong className="text-slate-200">8</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Event Stream */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-3">
            {/* Stream Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                27 AUG 2026
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10.5px] text-slate-400">
                  <span>Sort by:</span>
                  <button className="text-slate-200 font-semibold hover:text-white flex items-center gap-0.5">
                    <span>Time (Asc)</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center rounded bg-[#091224] border border-[#162744] p-0.5 text-slate-400">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'}`}
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'}`}
                  >
                    <Grid className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical Timeline Feed */}
            <div className="relative space-y-2.5">
              {/* Vertical line connecting events */}
              <div className="absolute left-[3.25rem] top-3 bottom-3 w-px bg-[#142646]" />

              {filteredEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 relative z-10">
                  {/* Time label */}
                  <div className="w-12 text-right flex-shrink-0 text-[10px] font-mono text-slate-300 font-medium">
                    {ev.time}
                  </div>

                  {/* Icon Node */}
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 shadow-sm ${ev.iconBg}`}>
                    {ev.icon}
                  </div>

                  {/* Event Card Row */}
                  <div 
                    onClick={() => onSelectAction && onSelectAction(`Inspect Timeline Event: ${ev.title}`)}
                    className="flex-1 p-2 rounded-lg bg-[#081224]/90 hover:bg-[#0c1830] border border-[#142644] hover:border-blue-500/40 transition-all cursor-pointer grid grid-cols-12 items-center gap-2"
                  >
                    {/* Category Label & Event Title (cols 5) */}
                    <div className="col-span-5 min-w-0">
                      <span className={`text-[10px] font-bold block leading-tight ${ev.textColor}`}>
                        {ev.type}
                      </span>
                      <p className="text-[11px] font-semibold text-slate-100 truncate leading-tight mt-0.5">
                        {ev.title}
                      </p>
                      <span className="text-[9.5px] text-slate-400 block truncate leading-tight mt-0.5">
                        {ev.sub}
                      </span>
                    </div>

                    {/* Entities involved (cols 4) */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-[10.5px] font-medium text-slate-200 truncate leading-tight">
                        {ev.entities}
                      </p>
                      <span className="text-[9.5px] text-slate-400 font-mono truncate block leading-tight mt-0.5">
                        {ev.entitiesSub}
                      </span>
                    </div>

                    {/* Supporting Evidence Link (cols 3) */}
                    <div className="col-span-3 flex items-center justify-end gap-1 text-[10.5px] text-slate-400 hover:text-blue-300">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{ev.evidence}</span>
                      <span className="text-[10px]">›</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="pt-2 text-center border-t border-[#111e33]/80">
              <button 
                onClick={() => onSelectAction && onSelectAction('Load Older Temporal Events')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                <span>Load More Events</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Timeline Filters + Statistics + Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
          {/* Card 1: TIMELINE FILTERS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                TIMELINE FILTERS
              </span>
              <button 
                onClick={clearAllFilters}
                className="text-[10.5px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="mt-2.5 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
                  <span className="font-semibold text-slate-200">Event Types</span>
                  <button 
                    onClick={selectAllFilters}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Select All
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {Object.entries(activeEventFilters).map(([category, isChecked]) => (
                    <label
                      key={category}
                      onClick={() => toggleFilter(category)}
                      className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                          isChecked ? 'bg-blue-600 text-white' : 'bg-[#091224] border border-[#162744]'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Entities Filter dropdown */}
              <div>
                <span className="text-[10.5px] font-semibold text-slate-300 block mb-1">Entities</span>
                <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#091224] border border-[#162744] text-[11px] text-slate-400">
                  <span>Select entities...</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Data Sources Filter dropdown */}
              <div>
                <span className="text-[10.5px] font-semibold text-slate-300 block mb-1">Data Sources</span>
                <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#091224] border border-[#162744] text-[11px] text-slate-400">
                  <span>Select sources...</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: TIMELINE STATISTICS */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
            <span className="text-xs font-bold text-white uppercase tracking-wider block pb-2 border-b border-[#111e33]">
              TIMELINE STATISTICS
            </span>

            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              {/* Stat 1 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[9px] text-slate-400 block leading-tight">Total Events</span>
                <span className="text-lg font-black text-blue-400 block mt-0.5">104</span>
              </div>

              {/* Stat 2 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[9px] text-slate-400 block leading-tight">Active Entities</span>
                <span className="text-lg font-black text-white block mt-0.5">27</span>
              </div>

              {/* Stat 3 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[8.5px] text-slate-400 block leading-tight">Date Range</span>
                <span className="text-[10px] font-bold text-slate-200 font-mono block mt-1">14 Aug – 27 Aug 2026</span>
              </div>

              {/* Stat 4 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[8.5px] text-slate-400 block leading-tight">Most Active Day</span>
                <span className="text-[10.5px] font-bold text-slate-200 font-mono block mt-1">21 Aug 2026</span>
              </div>

              {/* Stat 5 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[8.5px] text-slate-400 block leading-tight">Peak Activity</span>
                <span className="text-[10px] font-bold text-slate-200 font-mono block mt-1">09:00 PM – 11:00 PM</span>
              </div>

              {/* Stat 6 */}
              <div className="p-2 rounded-lg bg-[#081224] border border-[#142646] text-center">
                <span className="text-[8.5px] text-slate-400 block leading-tight">Average Events/Day</span>
                <span className="text-[11px] font-bold text-slate-200 font-mono block mt-1">6.9</span>
              </div>
            </div>
          </div>

          {/* Card 3: TIME RANGE HEATMAP */}
          <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                TIME RANGE HEATMAP
              </span>
              <button 
                onClick={() => onSelectAction && onSelectAction('Open Full Heatmap Calendar')}
                className="text-[10.5px] text-blue-400 hover:text-blue-300 font-medium"
              >
                View Calendar
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="space-y-1">
              {heatmapDays.map((day, dIdx) => (
                <div key={day} className="flex items-center gap-1.5 text-[9px]">
                  <span className="w-6 text-slate-400 font-mono">{day}</span>
                  <div className="flex-1 grid grid-cols-12 gap-1">
                    {heatmapGrid[dIdx].map((val, hIdx) => (
                      <div
                        key={hIdx}
                        className={`h-3 rounded-xs transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(val)}`}
                        title={`${day} slot ${hIdx}: Activity Level ${val}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Hour Labels */}
            <div className="flex justify-between text-[8px] text-slate-500 font-mono pl-8 pr-1">
              {heatmapHours.map((hr) => (
                <span key={hr}>{hr}</span>
              ))}
            </div>

            {/* Legend Scale */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-[#111e33]/80">
              <span>Low Activity</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2 rounded-xs bg-[#0a1832]"></span>
                <span className="w-2.5 h-2 rounded-xs bg-blue-700"></span>
                <span className="w-2.5 h-2 rounded-xs bg-purple-600"></span>
                <span className="w-2.5 h-2 rounded-xs bg-rose-500"></span>
                <span className="w-2.5 h-2 rounded-xs bg-amber-400"></span>
              </div>
              <span>High Activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
