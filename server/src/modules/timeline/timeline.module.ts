// Team Member 5: Time Machine & Chronological Crime Reconstruction Module
import { Router, Request, Response } from "express";
import { pgPool, neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface TimelineEventDTO {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  type: "Communication" | "Financial Transaction" | "Location" | "Surveillance" | "Forensic Evidence" | "Case Event";
  category: string;
  title: string;
  sub: string;
  entities: string;
  entitiesSub: string;
  evidence: string;
  evidenceType: "doc" | "audio" | "video" | "geo" | "hash";
  riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  properties?: Record<string, any>;
}

export class TimelineService {
  async getChronologicalReconstruction(caseId?: string, range = "15D") {
    const events: TimelineEventDTO[] = [];
    const isFiltered = caseId && caseId !== "ALL";

    // 0. Fetch Case info if specific case selected
    let caseInfo: any = null;
    if (isFiltered) {
      const caseRes = await pgPool.query("SELECT * FROM cases WHERE id = $1", [caseId]);
      if (caseRes.rows.length > 0) caseInfo = caseRes.rows[0];
    }

    // 1. Fetch Financial Transactions from PostgreSQL
    const finQuery = isFiltered
      ? await pgPool.query("SELECT * FROM financial_transactions WHERE case_id = $1 ORDER BY timestamp DESC", [caseId])
      : await pgPool.query("SELECT * FROM financial_transactions ORDER BY timestamp DESC LIMIT 50");

    finQuery.rows.forEach((row, i) => {
      const dt = new Date(row.timestamp || Date.now() - i * 3600000 * 4);
      events.push({
        id: `fin-${row.id || i}`,
        timestamp: dt.toISOString(),
        timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: "Financial Transaction",
        category: "Financial Transaction",
        title: `₹${Number(row.amount_inr).toLocaleString("en-IN")} via ${row.channel} Transfer`,
        sub: `From: ${row.source_holder_name} → To: ${row.target_holder_name}`,
        entities: `${row.source_holder_name} → ${row.target_holder_name}`,
        entitiesSub: `Ref: ${row.transaction_ref} (${row.bank_name || "Bank"})`,
        evidence: "Bank Core Banking Ledger",
        evidenceType: "doc",
        riskSeverity: Number(row.suspicious_score) >= 0.9 ? "CRITICAL" : Number(row.suspicious_score) >= 0.8 ? "HIGH" : "MEDIUM",
        properties: row,
      });
    });

    // 2. Fetch Geo-Intel events from PostgreSQL
    const geoQuery = isFiltered
      ? await pgPool.query("SELECT * FROM geo_intel_events WHERE case_id = $1 ORDER BY timestamp DESC", [caseId])
      : await pgPool.query("SELECT * FROM geo_intel_events ORDER BY timestamp DESC LIMIT 30");

    geoQuery.rows.forEach((row, i) => {
      const dt = new Date(row.timestamp || Date.now() - (i + 1) * 3600000 * 6);
      events.push({
        id: `geo-${row.id || i}`,
        timestamp: dt.toISOString(),
        timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: "Location",
        category: "Location",
        title: `Geospatial Sighting: ${row.location_name}`,
        sub: `${row.city}, ${row.state} (${row.event_type})`,
        entities: `${row.location_name}, ${row.city}`,
        entitiesSub: `GPS: ${row.latitude}, ${row.longitude}`,
        evidence: "Cell Tower CDR & CCTV Feed",
        evidenceType: "geo",
        riskSeverity: row.event_type.includes("FRAUD") || row.event_type.includes("HAWALA") || row.event_type.includes("RAID") ? "CRITICAL" : "HIGH",
        properties: row,
      });
    });

    // 3. Fetch Evidence Logged
    const evdQuery = isFiltered
      ? await pgPool.query("SELECT * FROM evidence WHERE case_id = $1 ORDER BY collected_at DESC", [caseId])
      : await pgPool.query("SELECT * FROM evidence ORDER BY collected_at DESC LIMIT 30");

    evdQuery.rows.forEach((row, i) => {
      const dt = new Date(row.collected_at || Date.now() - (i + 2) * 3600000 * 8);
      events.push({
        id: `evd-${row.id || i}`,
        timestamp: dt.toISOString(),
        timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        type: "Forensic Evidence",
        category: "Surveillance",
        title: `Forensic Seizure: ${row.title}`,
        sub: `Category: ${row.category} (Status: ${row.status})`,
        entities: row.evidence_code,
        entitiesSub: `SHA-256: ${row.hash_sha256?.slice(0, 16)}...`,
        evidence: "Evidence Vault SHA-256 Record",
        evidenceType: "hash",
        riskSeverity: "HIGH",
        properties: row,
      });
    });

    // 4. Fetch Phone & Network Comm Intercepts from Neo4j
    if (neo4jDriver) {
      const session = neo4jDriver.session();
      try {
        const commCypher = isFiltered
          ? `MATCH (s:Suspect)-[:IMPLICATED_IN]->(c:Case {id: $caseId})
             OPTIONAL MATCH (s)-[:OWNS_DEVICE]->(p1:Phone)-[r:COMMUNICATES_WITH]->(p2:Phone)
             WHERE p1 IS NOT NULL AND p2 IS NOT NULL
             RETURN p1.phone_number as src, p2.phone_number as tgt, r.calls as calls, r.sms as sms, r.last_contact as date`
          : `MATCH (p1:Phone)-[r:COMMUNICATES_WITH]->(p2:Phone)
             RETURN p1.phone_number as src, p2.phone_number as tgt, r.calls as calls, r.sms as sms, r.last_contact as date`;

        const commRes = await session.run(commCypher, { caseId });
        commRes.records.forEach((rec, i) => {
          const src = rec.get("src");
          const tgt = rec.get("tgt");
          if (!src || !tgt) return;

          const dt = new Date(Date.now() - (i + 1) * 3600000 * 3);
          events.push({
            id: `comm-${i}`,
            timestamp: dt.toISOString(),
            timeFormatted: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            dateFormatted: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            type: "Communication",
            category: "Communication",
            title: `Intercepted Contact: ${src} ↔ ${tgt}`,
            sub: `${rec.get("calls")?.toNumber ? rec.get("calls").toNumber() : rec.get("calls") || 1} Calls, ${rec.get("sms")?.toNumber ? rec.get("sms").toNumber() : rec.get("sms") || 0} SMS logged`,
            entities: `${src} ↔ ${tgt}`,
            entitiesSub: `Last Contact: ${rec.get("date") || "Recent"}`,
            evidence: "Section 91 CrPC Telecom Intercept",
            evidenceType: "audio",
            riskSeverity: "CRITICAL",
            properties: { calls: rec.get("calls"), sms: rec.get("sms") },
          });
        });
      } catch (err) {
        console.warn("Neo4j timeline warning:", err);
      } finally {
        await session.close();
      }
    }

    // Sort chronologically (latest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      total_events: events.length,
      time_range: range,
      case_id: caseId || "ALL",
      case_info: caseInfo,
      events,
    };
  }
}

export const timelineService = new TimelineService();

export class TimelineController {
  async handleGetTimeline(req: Request, res: Response) {
    try {
      const caseId = req.query.caseId as string;
      const range = (req.query.range as string) || "15D";
      const result = await timelineService.getChronologicalReconstruction(caseId, range);
      res.json(formatResponse(true, result, "Chronological timeline reconstructed successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const timelineController = new TimelineController();

export function timelineRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => timelineController.handleGetTimeline(req, res));
  return router;
}
