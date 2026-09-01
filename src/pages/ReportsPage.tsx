import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FolderLock,
  ChevronDown,
  X,
  ExternalLink,
  Share2,
  Check,
  Printer,
  FileCheck,
  TrendingUp,
  Sliders,
  Calendar,
  Building2,
  Lock
} from 'lucide-react';

interface ReportsPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface ReportItem {
  id: string;
  reportName: string;
  type: 'Investigation' | 'Financial' | 'Network' | 'Communication' | 'Geospatial' | 'Suspect Dossier';
  typeColor: string;
  caseId: string;
  generatedOn: string;
  status: 'Completed' | 'Processing' | 'Archived';
  fileSize: string;
  author: string;
  pages: number;
  summary: string;
}

const SAMPLE_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reportName: 'Cyber Theft Investigation Report',
    type: 'Investigation',
    typeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    caseId: 'FIR-1246/25',
    generatedOn: '27 Aug 2026',
    status: 'Completed',
    fileSize: '4.8 MB',
    author: 'ACP Raj Verma',
    pages: 18,
    summary: 'Comprehensive forensic summary of unauthorized root egress and Hawala bank route analysis for primary suspect Aman Khan.'
  },
  {
    id: 'rep-2',
    reportName: 'Money Laundering Analysis',
    type: 'Financial',
    typeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    caseId: 'FIR-1243/25',
    generatedOn: '26 Aug 2026',
    status: 'Completed',
    fileSize: '12.2 MB',
    author: 'ED Officer M. Iyer',
    pages: 34,
    summary: 'Layering detection and shell company transaction trail tracing ₹12.4 Cr across 14 dummy entities in Dubai and Delhi.'
  },
  {
    id: 'rep-3',
    reportName: 'Network Analysis Report',
    type: 'Network',
    typeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    caseId: 'INV-2026-089',
    generatedOn: '26 Aug 2026',
    status: 'Completed',
    fileSize: '8.5 MB',
    author: 'Forensic Analyst P. Singh',
    pages: 22,
    summary: 'Eigenvector centrality topological graph linking 42 burner phones, 8 shell vehicles, and encrypted VoIP communication nodes.'
  },
  {
    id: 'rep-4',
    reportName: 'Communication Intelligence Report',
    type: 'Communication',
    typeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    caseId: 'FIR-1241/25',
    generatedOn: '25 Aug 2026',
    status: 'Completed',
    fileSize: '6.1 MB',
    author: 'Special Cell Intercept Unit',
    pages: 16,
    summary: 'Voiceprint frequency spectrum and decrypted Telegram chat payloads linking Farooq "The Shadow" to Karachi coordinators.'
  },
  {
    id: 'rep-5',
    reportName: 'Geospatial Analysis Report',
    type: 'Geospatial',
    typeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    caseId: 'INV-2026-087',
    generatedOn: '23 Aug 2026',
    status: 'Completed',
    fileSize: '15.7 MB',
    author: 'GIS Intelligence Officer',
    pages: 28,
    summary: 'Cell tower triangulation heatmaps and synchronized CCTV surveillance timestamps reconstructing suspect movement on NH-48.'
  }
];

export const ReportsPage: React.FC<ReportsPageProps> = ({ onSelectAction, onNavigateTab }) => {
  const [selectedEpoch, setSelectedEpoch] = useState<number>(1);
  const [reportsList, setReportsList] = useState<ReportItem[]>(SAMPLE_REPORTS);
  
  // Create Report Form State
  const [reportType, setReportType] = useState<string>('Investigation Report');
  const [selectedCase, setSelectedCase] = useState<string>('FIR-1246/25 - Cyber Theft Investigation');
  const [modules, setModules] = useState<{ [key: string]: boolean }>({
    evidenceSummary: true,
    networkAnalysis: true,
    financialAnalysis: true,
    communicationAnalysis: true,
    timelineAnalysis: true,
    geospatialAnalysis: true
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Modals state
  const [selectedReportForView, setSelectedReportForView] = useState<ReportItem | null>(null);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);
  const [filterSearch, setFilterSearch] = useState<string>('');

  const toggleModule = (key: string) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationStage('Querying case relational graph & evidence hashes...');

    setTimeout(() => {
      setGenerationProgress(45);
      setGenerationStage('Synthesizing selected analysis modules with Neural Engine...');
    }, 700);

    setTimeout(() => {
      setGenerationProgress(75);
      setGenerationStage('Embedding Section 65B cryptographic seals & Merkle proofs...');
    }, 1400);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage('Report Generated Successfully!');

      setTimeout(() => {
        setIsGenerating(false);
        const newReport: ReportItem = {
          id: `rep-${Date.now()}`,
          reportName: `${reportType.replace('Report', '').trim()} Dossier - ${selectedCase.split(' - ')[0]}`,
          type: reportType.includes('Financial') ? 'Financial' : reportType.includes('Network') ? 'Network' : 'Investigation',
          typeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
          caseId: selectedCase.split(' - ')[0],
          generatedOn: 'Today, Just Now',
          status: 'Completed',
          fileSize: '5.4 MB',
          author: 'ACP Raj Verma',
          pages: 24,
          summary: `Automated comprehensive dossier compilation for ${selectedCase} including all selected forensic intelligence modules.`
        };

        setReportsList([newReport, ...reportsList]);
        setSelectedReportForView(newReport);

        if (onSelectAction) {
          onSelectAction(`Generated Dossier: ${newReport.reportName}`);
        }
      }, 500);
    }, 2100);
  };

  const handleDeleteReport = (id: string, name: string) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
    if (onSelectAction) onSelectAction(`Archived Report: ${name}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040813] text-slate-100 p-4 md:p-6 space-y-5 selection:bg-purple-600/30 selection:text-purple-200">
      
      {/* ── Top Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#111e33]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
              REPORTS & DOSSIERS
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Generate comprehensive investigation reports and dossiers
          </p>
        </div>

        {/* Filter Pagination Pills (1 2 3 4 5) */}
        <div className="flex items-center gap-2 bg-[#081022] p-1.5 rounded-xl border border-[#14233c] shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
            Quarter:
          </span>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedEpoch(num)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                selectedEpoch === num
                  ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] scale-110'
                  : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top 5 Stat Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: TOTAL REPORTS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL REPORTS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              156
            </div>
            <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
              ↑ 12 this week
            </div>
          </div>
        </div>

        {/* Metric 2: DOSSIERS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              DOSSIERS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              28
            </div>
            <div className="text-[10px] font-semibold text-purple-300">
              Active Cases
            </div>
          </div>
        </div>

        {/* Metric 3: GENERATED THIS WEEK */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-fuchsia-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(217,70,239,0.2)]">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-fuchsia-400/90 uppercase tracking-wider">
              GENERATED THIS WEEK
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              12
            </div>
            <div className="text-[10px] font-semibold text-fuchsia-400">
              ↑ 20%
            </div>
          </div>
        </div>

        {/* Metric 4: PENDING REPORTS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-red-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-red-400/90 uppercase tracking-wider">
              PENDING REPORTS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              3
            </div>
            <div className="text-[10px] font-semibold text-red-400">
              Requires Action
            </div>
          </div>
        </div>

        {/* Metric 5: COMPLETION RATE */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              COMPLETION RATE
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight font-mono">
              98.2%
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              Excellent
            </div>
          </div>
        </div>

      </div>

      {/* ── Main Two-Column Core Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ── 1. CREATE NEW REPORT (Left Column - 4 cols) ────────────────────── */}
        <div className="lg:col-span-4 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                CREATE NEW REPORT
              </h2>
              <span className="text-[9.5px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                AI Auto-Compile
              </span>
            </div>

            {/* Select Report Type */}
            <div className="space-y-1.5 mb-3.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Select Report Type
              </label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
                >
                  <option value="Investigation Report">Investigation Report</option>
                  <option value="Suspect Dossier">Suspect Dossier</option>
                  <option value="Financial Hawala Audit">Financial Hawala Audit</option>
                  <option value="Network Topology Intelligence">Network Topology Intelligence</option>
                  <option value="Court-Submission Section 65B Package">Court-Submission Section 65B Package</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Select Case / Investigation */}
            <div className="space-y-1.5 mb-3.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Select Case / Investigation
              </label>
              <div className="relative">
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full bg-[#091224] border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 cursor-pointer focus:outline-none"
                >
                  <option value="FIR-1246/25 - Cyber Theft Investigation">FIR-1246/25 - Cyber Theft Investigation</option>
                  <option value="CASE-2026-981 - Aman Khan Hawala Syndicate">CASE-2026-981 - Aman Khan Hawala Syndicate</option>
                  <option value="CASE-2026-772 - Farooq Shadow Network">CASE-2026-772 - Farooq Shadow Network</option>
                  <option value="CASE-2026-512 - Highway CCTV Breach">CASE-2026-512 - Highway CCTV Breach</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Include Modules Checkboxes */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold text-slate-300 block">
                Include Modules
              </label>
              <div className="space-y-1.5 bg-[#091224]/80 p-3 rounded-xl border border-slate-800">
                {[
                  { key: 'evidenceSummary', label: 'Evidence Summary' },
                  { key: 'networkAnalysis', label: 'Network Analysis' },
                  { key: 'financialAnalysis', label: 'Financial Analysis' },
                  { key: 'communicationAnalysis', label: 'Communication Analysis' },
                  { key: 'timelineAnalysis', label: 'Timeline Analysis' },
                  { key: 'geospatialAnalysis', label: 'Geospatial Analysis' }
                ].map((mod) => (
                  <label
                    key={mod.key}
                    onClick={() => toggleModule(mod.key)}
                    className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        modules[mod.key]
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                          : 'bg-[#070e1c] border border-slate-700'
                      }`}
                    >
                      {modules[mod.key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-medium">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button & Progress State */}
          <div className="space-y-2 pt-2">
            {isGenerating && (
              <div className="space-y-1.5 bg-[#091224] p-2.5 rounded-xl border border-purple-800/50 animate-pulse">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono">
                  <span className="truncate pr-2">{generationStage}</span>
                  <span className="font-bold">{generationProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                isGenerating
                  ? 'bg-purple-900/60 text-purple-300 cursor-not-allowed border border-purple-700/50'
                  : 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>COMPILING DOSSIER...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-purple-200" />
                  <span>GENERATE REPORT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 2. RECENT REPORTS TABLE (Right Column - 8 cols) ────────────────── */}
        <div className="lg:col-span-8 bg-[#070e1c] border border-[#14233c] rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Ambient Cyan Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]/80 mb-4">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                RECENT REPORTS
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Showing {reportsList.length} Latest Manifests
              </span>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-[#091224]/50">
                    <th className="py-2.5 px-3">REPORT NAME</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3">CASE ID</th>
                    <th className="py-2.5 px-3">GENERATED ON</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {reportsList.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-[#091428] transition-colors group cursor-pointer"
                    >
                      <td
                        onClick={() => setSelectedReportForView(report)}
                        className="py-3 px-3 font-semibold text-white group-hover:text-cyan-300 transition-colors"
                      >
                        {report.reportName}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${report.typeColor}`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                        {report.caseId}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {report.generatedOn}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          {/* Download */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectAction) onSelectAction(`Downloading ${report.reportName}`);
                              setSelectedReportForView(report);
                            }}
                            className="p-1 rounded hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {/* View */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReportForView(report);
                            }}
                            className="p-1 rounded hover:bg-slate-800 hover:text-purple-400 transition-colors"
                            title="View Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(report.id, report.reportName);
                            }}
                            className="p-1 rounded hover:bg-slate-800 hover:text-red-400 transition-colors"
                            title="Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Centered Button: VIEW ALL REPORTS */}
          <div className="pt-4 mt-4 border-t border-[#14233c] flex items-center justify-center">
            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="py-2.5 px-8 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all flex items-center gap-2 active:scale-[0.99]"
            >
              <FolderLock className="w-4 h-4" />
              <span>VIEW ALL REPORTS</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: REPORT DOSSIER VIEWER & PDF PREVIEW ───────────────────────── */}
      {selectedReportForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {selectedReportForView.reportName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Case: {selectedReportForView.caseId} • {selectedReportForView.pages} Pages • Author: {selectedReportForView.author}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportForView(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs bg-[#050b16]">
              {/* Official Seal Banner */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#071322] space-y-3">
                <div className="text-center pb-2 border-b border-cyan-900/50">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-cyan-400">
                    CENTRAL CYBER DEFENSE & CRIME INTELLIGENCE COMMAND
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    CONFIDENTIAL FORENSIC INVESTIGATION DOSSIER
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Classification: LAW ENFORCEMENT SENSITIVE // SECTION 65B IEA CERTIFIED
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div><strong className="text-slate-400">Case Reference:</strong> <span className="text-white font-mono">{selectedReportForView.caseId}</span></div>
                  <div><strong className="text-slate-400">Report Type:</strong> <span className="text-cyan-300 font-semibold">{selectedReportForView.type}</span></div>
                  <div><strong className="text-slate-400">Date Generated:</strong> <span className="text-white">{selectedReportForView.generatedOn}</span></div>
                  <div><strong className="text-slate-400">Security Seal:</strong> <span className="text-emerald-400 font-bold">SHA-256 Ledger Verified</span></div>
                </div>

                <div className="pt-2 border-t border-cyan-900/50 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-200">Executive Intelligence Summary:</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed bg-[#040812] p-2.5 rounded border border-slate-800">
                    {selectedReportForView.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-cyan-900/50 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                  <div>Digital Signatures: <strong>ACP Raj Verma (0x81fa...)</strong></div>
                  <div>Anchor Block: <strong>#15842 (Polygon PoS)</strong></div>
                  <div>Verification Hash: <strong>0x7f1ac09d...</strong></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Court-admissible digital artifact package</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Downloading Master PDF for ${selectedReportForView.reportName}`);
                    setSelectedReportForView(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReportForView(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: VIEW ALL REPORTS REPOSITORY ───────────────────────────────── */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e1c] border border-purple-500/40 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#081222]">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  NATIONAL CRIMINAL INTELLIGENCE DOSSIER REPOSITORY (156 REPORTS)
                </h3>
              </div>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#091224] border border-slate-700 hover:border-purple-500/60 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.typeColor}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{item.fileSize}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {item.reportName}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div><strong className="text-slate-300">Case ID:</strong> {item.caseId}</div>
                      <div><strong className="text-slate-300">Generated:</strong> {item.generatedOn}</div>
                      <div><strong className="text-slate-300">Author:</strong> {item.author}</div>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                      <button
                        onClick={() => {
                          setSelectedReportForView(item);
                          setIsViewAllModalOpen(false);
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Inspect Dossier →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-xs text-slate-400">Complete Master Archive of Seizure & Forensic Briefings</span>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
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

export default ReportsPage;
