// Team Member 5: Blast Radius & Network Propagation Simulation Module
import { Router, Request, Response } from "express";
import { neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface BlastRadiusResult {
  origin_entity: string;
  origin_name: string;
  max_hops: number;
  total_impacted_nodes: number;
  risk_severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  impact_radius_percentage: number;
  impacted_nodes: Array<{
    id: string;
    label: string;
    category: string;
    distance_hops: number;
    properties?: Record<string, any>;
  }>;
  containment_actions: string[];
}

export class BlastRadiusService {
  // Get all suspects from Neo4j for the frontend dropdown
  async getSuspects() {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (s:Suspect) 
         RETURN s.id as id, s.name as name, s.role as role, s.city as city, s.risk_score as risk_score
         ORDER BY s.risk_score DESC`
      );
      return result.records.map((r) => ({
        id: r.get("id"),
        name: r.get("name"),
        role: r.get("role"),
        city: r.get("city"),
        risk_score: r.get("risk_score"),
      }));
    } finally {
      await session.close();
    }
  }

  async runSimulation(originName: string, maxHops = 3): Promise<BlastRadiusResult> {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");

    const session = neo4jDriver.session();
    try {
      // Match by name OR id OR account_number OR ip - covering all node types
      const cypher = `
        MATCH (origin)
        WHERE origin.name = $originName 
           OR origin.id = $originName 
           OR origin.account_number = $originName
           OR origin.ip = $originName
           OR origin.phone_number = $originName
        WITH origin LIMIT 1
        OPTIONAL MATCH path = (origin)-[*1..${Math.min(maxHops, 5)}]-(target)
        WHERE target <> origin
        RETURN origin, target, length(path) as distance,
               coalesce(target.name, target.account_number, target.phone_number, target.ip, target.id) as target_id,
               labels(target) as target_labels,
               properties(target) as target_props
        ORDER BY distance ASC
      `;

      const result = await session.run(cypher, { originName });

      const impactedMap = new Map<string, { id: string; label: string; category: string; distance_hops: number; properties: Record<string, any> }>();
      let originNode: any = null;

      for (const rec of result.records) {
        if (!originNode) originNode = rec.get("origin");

        const target = rec.get("target");
        if (target) {
          const key: string = rec.get("target_id") || target.identity?.toString();
          const dist: number = rec.get("distance").toNumber();
          const labels: string[] = rec.get("target_labels") || [];
          const props: Record<string, any> = rec.get("target_props") || {};

          if (key && !impactedMap.has(key)) {
            impactedMap.set(key, {
              id: key,
              label: props.name || props.title || props.account_number || props.phone_number || key,
              category: labels[0] || "Entity",
              distance_hops: dist,
              properties: props,
            });
          }
        }
      }

      const impactedNodes = Array.from(impactedMap.values());
      const total = impactedNodes.length;
      const riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" =
        total >= 6 ? "CRITICAL" : total >= 4 ? "HIGH" : total >= 2 ? "MEDIUM" : "LOW";
      const riskPercentage = Math.min(100, Math.round((total / 10) * 100));

      const accountCount = impactedNodes.filter((n) => n.category === "Account").length;
      const phoneCount = impactedNodes.filter((n) => n.category === "Phone").length;
      const suspectCount = impactedNodes.filter((n) => n.category === "Suspect").length;

      const actions = [
        accountCount > 0
          ? `Immediately freeze ${accountCount} linked mule bank account(s) via SFMS/NEFT suspension notice.`
          : "No linked accounts found — verify origin node ID.",
        phoneCount > 0
          ? `Issue Section 91 CrPC notice for CDR records on ${phoneCount} mobile number(s) from respective telcos.`
          : "No linked phone numbers in blast radius.",
        suspectCount > 0
          ? `Issue LOC (Lookout Circular) for ${suspectCount} associated suspect(s) via Immigration/Passport database.`
          : "Initiate further graph traversal to identify suspect associates.",
        "Block C2 proxy IPs via CERT-In & NCIIPC coordination.",
        "Escalate to CBIC/ED if financial flows cross ₹10 Lakh threshold.",
      ];

      return {
        origin_entity: originName,
        origin_name: originNode?.properties?.name || originName,
        max_hops: maxHops,
        total_impacted_nodes: total,
        risk_severity: riskSeverity,
        impact_radius_percentage: riskPercentage,
        impacted_nodes: impactedNodes,
        containment_actions: actions,
      };
    } finally {
      await session.close();
    }
  }
}

export const blastRadiusService = new BlastRadiusService();

export class BlastRadiusController {
  async handleGetSuspects(_req: Request, res: Response) {
    try {
      const suspects = await blastRadiusService.getSuspects();
      res.json(formatResponse(true, suspects, "Neo4j suspects retrieved for simulation"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleRunSimulation(req: Request, res: Response) {
    try {
      const { originId, originName, maxHops } = req.body;
      const origin = originName || originId;
      if (!origin) {
        return res.status(400).json(
          formatResponse(false, null, undefined, "originName or originId is required (e.g. 'Vikramaditya Shinde')")
        );
      }

      const result = await blastRadiusService.runSimulation(origin, maxHops ? parseInt(maxHops, 10) : 3);
      res.json(formatResponse(true, result, "Blast radius simulation completed"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const blastRadiusController = new BlastRadiusController();

export function blastRadiusRoutes(): Router {
  const router = Router();
  router.get("/suspects", (req, res) => blastRadiusController.handleGetSuspects(req, res));
  router.post("/simulate", (req, res) => blastRadiusController.handleRunSimulation(req, res));
  return router;
}
