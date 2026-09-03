import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  X,
  Share2,
  Check,
  Printer,
  FileCheck,
  Lock,
  Loader2,
  AlertTriangle,
  Database,
  MapPin,
  Landmark,
} from 'lucide-react';
import { api } from '../services/api';

interface ReportsPageProps {
  onSelectAction?: (action: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface ReportItem {
  id: string;
  reportName: string;
  type: string;
  typeColor: string;
  caseId: string;
  firNumber: string;
  generatedOn: string;
  status: 'Completed' | 'Processing' | 'Archived';
  fileSize: string;
  author: string;
  pages: number | string;
  summary: string;
  priority?: string;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onSelectAction, onNavigateTab: _onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Generate Report modal state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-2026-001');
  const [officerName, setOfficerName] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);

  // Available cases for the dropdown
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
    loadCases();
  }, []);

  async function loadReports() {
    try {
      setLoadingReports(true);
      const data = await api.reports.list();
      setReports(data);
    } catch (err) {
      console.warn('Reports load error:', err);
    } finally {
      setLoadingReports(false);
    }
  }

  async function loadCases() {
    try {
      const data = await api.cases.getAll();
      setCases(data);
      if (data.length > 0) setSelectedCaseId(data[0].id);
    } catch (err) {
      console.warn('Cases load error:', err);
    }
  }

  async function handleGenerateReport() {
    try {
      setIsGenerating(true);
      const selectedCase = cases.find((c) => c.id === selectedCaseId);
      const report = await api.reports.generateCourtReport(
        selectedCaseId,
        officerName || selectedCase?.officer || 'ACP Rajeshwar Sharma'
      );
      setGeneratedReport(report);
      setGenerateModalOpen(false);
      setReportPreviewOpen(true);
      // Refresh reports list
      await loadReports();
    } catch (err: any) {
      console.error('Report generation error:', err);
      alert(`Error generating report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.reportName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.firNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeFilters = ['All', 'Investigation', 'Financial', 'Network', 'Geospatial', 'Suspect Dossier'];

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: <FileText className="w-4 h-4 text-blue-400" />, color: 'text-blue-400' },
    { label: 'Section 65B Certified', value: reports.filter((r) => r.status === 'Completed').length, icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, color: 'text-emerald-400' },
    { label: 'Processing', value: reports.filter((r) => r.status === 'Processing').length, icon: <Clock className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
    { label: 'Linked Cases', value: cases.length, icon: <Layers className="w-4 h-4 text-purple-400" />, color: 'text-purple-400' },
  ];

  return (
    <div className="flex-1 p-3.5 overflow-hidden flex flex-col h-full bg-[#030712] text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111e33]">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">FORENSIC REPORTS</h1>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[9px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Section 65B Bharatiya Sakshya Adhiniyam 2023 Certified · Court-Ready Dossiers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            className="p-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-white transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 py-3">
        {stats.map((stat) => (
          <div key={stat.label} className="p-3 rounded-xl bg-[#050b18] border border-[#111e33] flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-[#081224] border border-[#162744]">{stat.icon}</div>
            <div>
              <span className={`text-xl font-black block ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-slate-400 block">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 pb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports, FIR, officer..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#081224] border border-[#162744] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all border ${
                typeFilter === f
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                  : 'bg-[#081224] border-[#162744] text-slate-300 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
        {loadingReports ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading reports from database...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText className="w-10 h-10 text-slate-600" />
            <p className="text-sm text-slate-400">No reports found</p>
            <button onClick={() => setGenerateModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300">
              Generate your first report →
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-[#1e3a5f] transition-all shadow-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* File icon */}
                  <div className="w-9 h-9 rounded-lg bg-[#081224] border border-[#162744] flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                    <FileText className="w-4.5 h-4.5 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{report.reportName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${report.typeColor || 'text-slate-400 bg-slate-900/60 border-slate-700'}`}>
                        {report.type}
                      </span>
                      {report.status === 'Completed' && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-[9px] font-bold text-emerald-400">
                          <Check className="w-2.5 h-2.5" /> Certified
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{report.summary}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-[9.5px] text-slate-500">
                      <span className="font-mono">{report.firNumber}</span>
                      <span>·</span>
                      <span>{report.generatedOn}</span>
                      <span>·</span>
                      <span>{report.author}</span>
                      <span>·</span>
                      <span>{typeof report.pages === 'number' ? `${report.pages} pages` : report.pages}</span>
                      <span>·</span>
                      <span>{report.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCaseId(report.caseId);
                      setGenerateModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-[#081224] hover:bg-blue-950/60 border border-[#162744] hover:border-blue-500/40 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectAction && onSelectAction(`Preview Report: ${report.id}`)}
                    className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectAction && onSelectAction(`Download Report: ${report.id}`)}
                    className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectAction && onSelectAction(`Share Report: ${report.id}`)}
                    className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== GENERATE REPORT MODAL ===== */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#050b18] border border-[#1e3a5f] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Generate Court-Ready Report</h3>
                  <p className="text-[10px] text-slate-400">Section 65B BSA 2023 Certified · SHA-256 Hash Verified</p>
                </div>
              </div>
              <button onClick={() => setGenerateModalOpen(false)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Case</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-[#081224] border border-[#162744] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/50"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fir_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Certifying Officer (optional)</label>
                <input
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g., ACP Rajeshwar Sharma"
                  className="w-full bg-[#081224] border border-[#162744] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#071329]/80 border border-blue-500/20 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-300">Report will include:</p>
                {[
                  { icon: <Database className="w-3 h-3 text-blue-400" />, text: 'Evidence registry with SHA-256 hashes (live PostgreSQL)' },
                  { icon: <Landmark className="w-3 h-3 text-emerald-400" />, text: 'Financial hawala trail with risk scores' },
                  { icon: <MapPin className="w-3 h-3 text-cyan-400" />, text: 'Geospatial crime hotspot coordinates' },
                  { icon: <Sparkles className="w-3 h-3 text-purple-400" />, text: 'AI prosecution summary & legal recommendations' },
                  { icon: <Lock className="w-3 h-3 text-amber-400" />, text: 'Section 65B BSA 2023 certificate ID' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#081224] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REPORT PREVIEW MODAL ===== */}
      {reportPreviewOpen && generatedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#050b18] border border-[#1e3a5f] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#111e33] flex items-center justify-between bg-[#040813]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Court-Ready Forensic Report</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">{generatedReport.report_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectAction && onSelectAction(`Print Report: ${generatedReport.report_id}`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#081224] border border-[#162744] text-[10.5px] text-slate-300 hover:text-white transition-colors"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={() => onSelectAction && onSelectAction(`Download Report: ${generatedReport.report_id}`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10.5px] transition-colors"
                >
                  <Download className="w-3 h-3" /> Download PDF
                </button>
                <button onClick={() => setReportPreviewOpen(false)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Report Header */}
              <div className="p-4 rounded-xl bg-[#071329]/80 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FORENSIC INVESTIGATION DOSSIER</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[9px] font-bold text-emerald-400">
                    <ShieldCheck className="w-2.5 h-2.5" /> Section 65B Certified
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white">{generatedReport.case_title}</h2>
                <div className="grid grid-cols-3 gap-3 text-[10px]">
                  <div><span className="text-slate-400 block">FIR Number</span><span className="font-mono text-slate-200">{generatedReport.fir_number}</span></div>
                  <div><span className="text-slate-400 block">Officer</span><span className="text-slate-200">{generatedReport.investigating_authority?.officer}</span></div>
                  <div><span className="text-slate-400 block">Department</span><span className="text-slate-200">{generatedReport.investigating_authority?.department}</span></div>
                  <div><span className="text-slate-400 block">Crime Category</span><span className="text-slate-200">{generatedReport.crime_category}</span></div>
                  <div><span className="text-slate-400 block">Priority</span><span className={`font-bold ${generatedReport.priority === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{generatedReport.priority}</span></div>
                  <div><span className="text-slate-400 block">Generated At</span><span className="font-mono text-slate-200 text-[9px]">{new Date(generatedReport.generated_at).toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* AI Prosecution Summary */}
              <div className="p-4 rounded-xl bg-[#071329]/60 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">AI Prosecution Summary</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">{generatedReport.ai_prosecution_summary}</p>
              </div>

              {/* Evidence Ledger */}
              {generatedReport.forensic_evidence_ledger?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Forensic Evidence Ledger ({generatedReport.forensic_evidence_ledger.length} Exhibits)
                  </h4>
                  <div className="space-y-1.5">
                    {generatedReport.forensic_evidence_ledger.map((e: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#081224] border border-[#142646] grid grid-cols-12 gap-2 text-[10px]">
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[9px]">Code</span>
                          <span className="font-mono text-slate-200">{e.code}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="text-slate-400 block text-[9px]">Description</span>
                          <span className="text-slate-200 truncate block">{e.description}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[9px]">Type</span>
                          <span className="text-slate-200">{e.type}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-slate-400 block text-[9px]">SHA-256 Hash</span>
                          <span className="font-mono text-emerald-400 text-[8px]">{e.hash_sha256?.slice(0, 18)}...</span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-slate-400 block text-[9px]">Status</span>
                          <span className={`font-semibold text-[9px] ${e.status === 'SECURED' ? 'text-emerald-400' : 'text-amber-400'}`}>{e.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Trail */}
              {generatedReport.financial_hawala_trail?.high_risk_entries?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Financial Hawala Trail — Total: ₹{Number(generatedReport.financial_hawala_trail.total_tracked_inr).toLocaleString('en-IN')}
                  </h4>
                  <div className="space-y-1.5">
                    {generatedReport.financial_hawala_trail.high_risk_entries.map((t: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#081224] border border-red-500/20 flex items-center gap-3 text-[10px]">
                        <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-slate-300">{t.from} → {t.to}</span>
                          <span className="text-slate-500 ml-2 font-mono">{t.ref}</span>
                        </div>
                        <span className="font-bold text-red-400">₹{Number(t.amount_inr).toLocaleString('en-IN')}</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-400 text-[9px] font-mono">{t.channel}</span>
                        <span className="text-slate-400 text-[9px]">Risk: {(t.risk_score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geospatial */}
              {generatedReport.geospatial_hotspots?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Geospatial Crime Hotspots</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedReport.geospatial_hotspots.map((g: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#081224] border border-cyan-500/20 text-[10px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span className="font-semibold text-slate-200">{g.location}</span>
                        </div>
                        <span className="text-slate-400">{g.city}, {g.state}</span>
                        <span className="text-slate-500 font-mono block text-[9px]">{g.coordinates?.lat?.toFixed(4)}, {g.coordinates?.lng?.toFixed(4)}</span>
                        <span className="text-amber-400 text-[9px]">{g.event_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Compliance */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-[10px]">
                  <p className="font-bold text-emerald-400">{generatedReport.statutory_compliance?.section}</p>
                  <p className="text-slate-400">{generatedReport.statutory_compliance?.act} · Hash: {generatedReport.statutory_compliance?.hash_algorithm}</p>
                  <p className="font-mono text-slate-400 text-[9px]">Certificate ID: {generatedReport.statutory_compliance?.section_65b_certificate_id}</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center italic">{generatedReport.conclusion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
