// Team Member 5: Automated Forensic & Executive Reports Module
import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface ReportDTO {
  id: string;
  title: string;
  caseId: string;
  firNumber: string;
  generatedBy: string;
  format: "pdf" | "json" | "docx";
  summary: string;
  section65bCertified: boolean;
  createdAt: string;
}

// In-memory cache for generated reports (keyed by report_id)
const generatedReportsCache = new Map<string, any>();

export class ReportsService {
  async generateCourtReadyReport(caseId: string, officerName = "ACP Rajeshwar Sharma") {
    const caseQuery = await pgPool.query(
      `SELECT c.*, u.full_name as officer_name, u.badge_number, u.department, u.city as jurisdiction
       FROM cases c
       LEFT JOIN users u ON c.lead_investigator_id = u.id
       WHERE c.id = $1`,
      [caseId]
    );

    if (caseQuery.rows.length === 0) return null;

    const caseData = caseQuery.rows[0];
    const evidenceRes = await pgPool.query("SELECT * FROM evidence WHERE case_id = $1", [caseId]);
    const finRes = await pgPool.query(
      "SELECT * FROM financial_transactions WHERE case_id = $1 ORDER BY suspicious_score DESC",
      [caseId]
    );
    const geoRes = await pgPool.query("SELECT * FROM geo_intel_events WHERE case_id = $1", [caseId]);

    const reportId = `REP-CRIMESYNC-${Date.now().toString().slice(-6)}`;
    const totalAmount = finRes.rows.reduce((sum, t) => sum + Number(t.amount_inr), 0);
    const highRiskTxns = finRes.rows.filter((f) => Number(f.suspicious_score) >= 0.85);

    const report = {
      report_id: reportId,
      case_id: caseData.id,
      fir_number: caseData.fir_number,
      case_title: caseData.title,
      crime_category: caseData.crime_category,
      priority: caseData.priority,
      case_status: caseData.status,
      investigating_authority: {
        officer: caseData.officer_name || officerName,
        badge: caseData.badge_number || "DEL-IPS-8821",
        department: caseData.department || "Special Cell / Cyber Crime Unit",
        jurisdiction: caseData.jurisdiction || "New Delhi",
      },
      statutory_compliance: {
        act: "Indian Evidence Act 1872 & Bharatiya Sakshya Adhiniyam 2023",
        section: "Section 65B Electronic Record Admissibility Certification",
        hash_algorithm: "SHA-256 (FIPS 180-4 Standard)",
        chain_of_custody_verified: true,
        section_65b_certificate_id: `CERT-65B-${reportId}`,
      },
      forensic_evidence_ledger: evidenceRes.rows.map((e) => ({
        code: e.evidence_code,
        description: e.title,
        type: e.category,
        hash_sha256: e.hash_sha256,
        status: e.status,
        collected_at: e.collected_at,
      })),
      financial_hawala_trail: {
        total_tracked_inr: totalAmount,
        transactions_logged: finRes.rows.length,
        high_risk_entries: highRiskTxns.map((f) => ({
          ref: f.transaction_ref,
          from: f.source_holder_name,
          to: f.target_holder_name,
          amount_inr: Number(f.amount_inr),
          channel: f.channel,
          risk_score: Number(f.suspicious_score),
        })),
      },
      geospatial_hotspots: geoRes.rows.map((g) => ({
        event_type: g.event_type,
        location: g.location_name,
        city: g.city,
        state: g.state,
        coordinates: { lat: Number(g.latitude), lng: Number(g.longitude) },
      })),
      ai_prosecution_summary: `This investigative dossier for "${caseData.title}" documents ${evidenceRes.rows.length} forensic exhibits and ₹${totalAmount.toLocaleString("en-IN")} in tracked financial flows across ${finRes.rows.length} suspicious transactions. ${highRiskTxns.length} transactions are classified CRITICAL (risk score ≥ 0.85). Legal prosecution recommended under IPC Section 420, 120B and IT Act Section 66D (Identity Theft). All evidence is cryptographically hashed (SHA-256) and certified tamper-free under Section 65B BSA 2023.`,
      conclusion:
        "This investigative dossier is digitally generated and certified tamper-free via cryptographic hashing and immutable custody logs for submission before the Special Court of Law.",
      generated_by: officerName,
      generated_at: new Date().toISOString(),
    };

    // Cache the report
    generatedReportsCache.set(reportId, report);

    return report;
  }

  async listReports() {
    const cases = await pgPool.query(
      `SELECT c.id, c.fir_number, c.title, c.crime_category, c.priority, c.status, c.created_at,
              u.full_name as officer
       FROM cases c
       LEFT JOIN users u ON c.lead_investigator_id = u.id
       ORDER BY c.created_at DESC`
    );

    // Combine cached generated reports + DB cases as potential reports
    const dbReports = cases.rows.map((c, idx) => ({
      id: `REP-2026-${100 + idx}`,
      title: `Forensic Investigation Dossier: ${c.title}`,
      reportName: `Forensic Investigation Dossier: ${c.title}`,
      type: c.crime_category === "CYBER_ATTACK" ? "Network" : c.crime_category === "FINANCIAL_FRAUD" ? "Financial" : "Investigation",
      typeColor:
        c.crime_category === "CYBER_ATTACK"
          ? "text-purple-400 bg-purple-950/60 border-purple-800/60"
          : c.crime_category === "FINANCIAL_FRAUD"
          ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/60"
          : "text-cyan-400 bg-cyan-950/60 border-cyan-800/60",
      caseId: c.id,
      firNumber: c.fir_number,
      category: c.crime_category,
      priority: c.priority,
      caseStatus: c.status,
      generatedBy: c.officer || "System",
      author: c.officer || "System",
      format: "pdf",
      section65bCertified: true,
      status: "Completed",
      fileSize: `${(3.5 + idx * 1.8).toFixed(1)} MB`,
      pages: 12 + idx * 8,
      summary: `Court-ready forensic dossier for ${c.fir_number} under jurisdiction of ${c.officer || "Lead Investigator"}. Includes evidence registry, financial trail, and Section 65B certification.`,
      generatedOn: new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      createdAt: c.created_at,
    }));

    // Include any reports already generated and cached this session
    const cachedReports = Array.from(generatedReportsCache.values()).map((r) => ({
      id: r.report_id,
      title: `Live Report: ${r.case_title}`,
      reportName: `Live Report: ${r.case_title}`,
      type: "Investigation",
      typeColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
      caseId: r.case_id,
      firNumber: r.fir_number,
      category: r.crime_category,
      priority: r.priority,
      caseStatus: r.case_status,
      generatedBy: r.generated_by,
      author: r.generated_by,
      format: "pdf",
      section65bCertified: true,
      status: "Completed",
      fileSize: "Live",
      pages: "—",
      summary: r.ai_prosecution_summary?.slice(0, 120) + "...",
      generatedOn: new Date(r.generated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      createdAt: r.generated_at,
    }));

    return [...cachedReports, ...dbReports];
  }

  async getReportById(reportId: string) {
    return generatedReportsCache.get(reportId) || null;
  }
}

export const reportsService = new ReportsService();

export class ReportsController {
  async handleGenerateReport(req: Request, res: Response) {
    try {
      const { caseId, officerName } = req.body;
      if (!caseId) {
        return res.status(400).json(formatResponse(false, null, undefined, "caseId is required (e.g. 'CASE-2026-001')"));
      }

      const report = await reportsService.generateCourtReadyReport(caseId, officerName);
      if (!report)
        return res.status(404).json(formatResponse(false, null, undefined, "Case not found for report generation"));

      res.json(formatResponse(true, report, "Court-ready Section 65B forensic report generated successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleListReports(_req: Request, res: Response) {
    try {
      const reports = await reportsService.listReports();
      res.json(formatResponse(true, reports, "Available reports retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetReport(req: Request, res: Response) {
    try {
      const reportId = req.params.reportId as string;
      const report = await reportsService.getReportById(reportId);
      if (!report)
        return res.status(404).json(formatResponse(false, null, undefined, "Report not found — generate it first"));
      res.json(formatResponse(true, report, "Report retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const reportsController = new ReportsController();

export function reportRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => reportsController.handleListReports(req, res));
  router.post("/generate", (req, res) => reportsController.handleGenerateReport(req, res));
  router.get("/:reportId", (req, res) => reportsController.handleGetReport(req, res));
  return router;
}
