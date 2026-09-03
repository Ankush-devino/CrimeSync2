import { Router, Request, Response } from "express";
import { neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface BlastRadiusResult {
  origin_entity: string;
  max_hops: number;
  total_impacted_nodes: number;
  risk_severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  impact_radius_percentage: number;
  impacted_nodes: Array<{
    id: string;
    label: string;
    category: string;
    distance_hops: number;
  }>;
  containment_actions: string[];
}

export class BlastRadiusService {
  async runSimulation(originId: string, maxHops = 3): Promise<BlastRadiusResult> {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");

    const session = neo4jDriver.session();
    try {
      const cypher = `
        MATCH (origin {id: $originId})
        OPTIONAL MATCH path = (origin)-[*1..${Math.min(maxHops, 5)}]-(target)
        RETURN origin, target, length(path) as distance
        ORDER BY distance ASC
      `;

      const result = await session.run(cypher, { originId });

      const impactedMap = new Map<string, { id: string; label: string; category: string; distance_hops: number }>();

      for (const rec of result.records) {
        const target = rec.get("target");
        if (target) {
          const key = target.properties.id || target.properties.account_number || target.properties.phone_number || target.properties.ip;
          const dist = rec.get("distance").toNumber();

          if (!impactedMap.has(key)) {
            impactedMap.set(key, {
              id: key,
              label: target.properties.name || target.properties.title || key,
              category: target.labels[0] || "Entity",
              distance_hops: dist,
            });
          }
        }
      }

      const impactedNodes = Array.from(impactedMap.values());
      const total = impactedNodes.length;
      const riskSeverity = total >= 4 ? "CRITICAL" : total >= 2 ? "HIGH" : "MEDIUM";
      const riskPercentage = Math.min(100, Math.round((total / 8) * 100));

      const actions = [
        `Freeze ${impactedNodes.filter(n => n.category === "Account").length} linked bank accounts immediately across PSU/Private banks.`,
        `Issue Section 91 CrPC notice for CDR records on ${impactedNodes.filter(n => n.category === "Phone").length} mobile numbers.`,
        `Block C2 proxy traffic for IP infrastructure via CERT-In & NCIIPC coordinate.`
      ];

      return {
        origin_entity: originId,
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
  async handleRunSimulation(req: Request, res: Response) {
    try {
      const { originId, maxHops } = req.body;
      if (!originId) {
        return res.status(400).json(formatResponse(false, null, undefined, "originId is required (e.g., 'SUS-01', 'SUS-02')"));
      }

      const result = await blastRadiusService.runSimulation(originId, maxHops ? parseInt(maxHops, 10) : 3);
      res.json(formatResponse(true, result, "Blast radius simulation completed"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const blastRadiusController = new BlastRadiusController();

export function blastRadiusRoutes(): Router {
  const router = Router();
  router.post("/simulate", (req, res) => blastRadiusController.handleRunSimulation(req, res));
  return router;
}
