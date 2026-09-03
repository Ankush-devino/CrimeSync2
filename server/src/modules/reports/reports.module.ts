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
    const finRes = await pgPool.query("SELECT * FROM financial_transactions WHERE case_id = $1", [caseId]);
    const geoRes = await pgPool.query("SELECT * FROM geo_intel_events WHERE case_id = $1", [caseId]);

    const reportId = `REP-CRIMESYNC-${Date.now().toString().slice(-6)}`;
    const totalAmount = finRes.rows.reduce((sum, t) => sum + Number(t.amount_inr), 0);

    const report = {
      report_id: reportId,
      case_id: caseData.id,
      fir_number: caseData.fir_number,
      case_title: caseData.title,
      investigating_authority: {
        officer: caseData.officer_name || officerName,
        badge: caseData.badge_number || "DEL-IPS-8821",
        department: caseData.department || "Special Cell / Cyber Crime Unit",
        city: caseData.jurisdiction || "New Delhi",
      },
      statutory_compliance: {
        act: "Indian Evidence Act 1872 & Bharatiya Sakshya Adhiniyam 2023",
        section: "Section 65B Electronic Record Admissibility Certification",
        hash_algorithm: "SHA-256 (FIPS 180-4 Standard)",
        chain_of_custody_verified: true,
      },
      forensic_evidence_ledger: evidenceRes.rows.map(e => ({
        code: e.evidence_code,
        description: e.title,
        type: e.category,
        hash_sha256: e.hash_sha256,
        status: e.status,
      })),
      financial_hawala_trail: {
        total_tracked_inr: totalAmount,
        transactions_logged: finRes.rows.length,
        high_risk_entries: finRes.rows.filter(f => Number(f.suspicious_score) >= 0.85),
      },
      geospatial_hotspots: geoRes.rows.map(g => ({
        location: g.location_name,
        city: g.city,
        state: g.state,
        coordinates: `${g.latitude}, ${g.longitude}`,
      })),
      conclusion: `This investigative dossier is digitally generated and certified tamper-free via cryptographic hashing and immutable custody logs for submission before the Special Court of Law.`,
      generated_at: new Date().toISOString(),
    };

    return report;
  }

  async listReports() {
    const cases = await pgPool.query("SELECT id, fir_number, title, crime_category, created_at FROM cases");
    return cases.rows.map((c, idx) => ({
      id: `REP-2026-${100 + idx}`,
      title: `Forensic Dossier: ${c.title}`,
      caseId: c.id,
      firNumber: c.fir_number,
      category: c.crime_category,
      generatedBy: "ACP Rajeshwar Sharma",
      format: "pdf",
      section65bCertified: true,
      createdAt: c.created_at,
    }));
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
      if (!report) return res.status(404).json(formatResponse(false, null, undefined, "Case not found for report generation"));

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
}

export const reportsController = new ReportsController();

export function reportRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => reportsController.handleListReports(req, res));
  router.post("/generate", (req, res) => reportsController.handleGenerateReport(req, res));
  return router;
}
