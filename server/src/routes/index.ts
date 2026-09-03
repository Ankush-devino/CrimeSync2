import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { caseRoutes } from "../modules/cases/case.routes";
import { evidenceRoutes } from "../modules/evidence/evidence.routes";
import { threatRoutes } from "../modules/threats/threat.routes";
import { knowledgeGraphRoutes } from "../modules/knowledge-graph/knowledge-graph.module";
import { blastRadiusRoutes } from "../modules/blast-radius/blast-radius.module";
import { financialRoutes } from "../modules/financial-intel/financial.module";
import { geoRoutes } from "../modules/geo-intel/geo.module";
import { aiEngineRoutes } from "../modules/ai-engine/ai-engine.module";
import { reportRoutes } from "../modules/reports/reports.module";
import { timelineRoutes } from "../modules/timeline/timeline.module";

export function registerRoutes(): Router {
  const router = Router();

  // Root API Health & Info
  router.get("/", (_req, res) => {
    res.json({
      name: "CrimeSync API",
      version: "1.0.0",
      status: "ONLINE",
      timestamp: new Date().toISOString(),
      modules: [
        "/auth",
        "/cases",
        "/evidence",
        "/threats",
        "/knowledge-graph",
        "/blast-radius",
        "/financial",
        "/geo",
        "/ai",
        "/reports"
      ]
    });
  });

  // Domain Route Registration
  router.use("/auth", authRoutes());
  router.use("/cases", caseRoutes());
  router.use("/evidence", evidenceRoutes());
  router.use("/threats", threatRoutes());
  router.use("/knowledge-graph", knowledgeGraphRoutes());
  router.use("/blast-radius", blastRadiusRoutes());
  router.use("/financial", financialRoutes());
  router.use("/geo", geoRoutes());
  router.use("/ai", aiEngineRoutes());
  router.use("/reports", reportRoutes());
  router.use("/timeline", timelineRoutes());

  return router;
}
