import { Router, Request, Response } from "express";
import { threatService } from "./threat.service";
import { formatResponse } from "../../utils/api-response";

export function threatRoutes(): Router {
  const router = Router();

  // 1. GET /api/v1/threats/vulnerabilities
  router.get("/vulnerabilities", async (_req: Request, res: Response) => {
    try {
      const vulns = await threatService.getVulnerabilities();
      res.json(formatResponse(true, vulns, "Platform vulnerabilities retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 2. POST /api/v1/threats/vulnerabilities/:id/patch
  router.post("/vulnerabilities/:id/patch", async (req: Request, res: Response) => {
    try {
      const result = await threatService.patchVulnerability(req.params.id as string);
      res.json(formatResponse(true, result, "Vulnerability patched successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 3. POST /api/v1/threats/vulnerabilities/:id/rollback
  router.post("/vulnerabilities/:id/rollback", async (req: Request, res: Response) => {
    try {
      const result = await threatService.rollbackVulnerability(req.params.id as string);
      res.json(formatResponse(true, result, "Vulnerability status rolled back"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 4. POST /api/v1/threats/vulnerabilities/patch-all
  router.post("/vulnerabilities/patch-all", async (_req: Request, res: Response) => {
    try {
      const result = await threatService.patchAllVulnerabilities();
      res.json(formatResponse(true, result, "All vulnerabilities patched"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 5. GET /api/v1/threats/watchdogs
  router.get("/watchdogs", async (_req: Request, res: Response) => {
    try {
      const watchdogs = await threatService.getWatchdogs();
      res.json(formatResponse(true, watchdogs, "Suspicious officer watchdog alerts retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 6. POST /api/v1/threats/watchdogs/:id/contain
  router.post("/watchdogs/:id/contain", async (req: Request, res: Response) => {
    try {
      const { actionType } = req.body;
      const result = await threatService.containOfficer(req.params.id as string, actionType);
      res.json(formatResponse(true, result, "Officer contained successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 7. POST /api/v1/threats/watchdogs/:id/reset
  router.post("/watchdogs/:id/reset", async (req: Request, res: Response) => {
    try {
      const result = await threatService.resetOfficerStatus(req.params.id as string);
      res.json(formatResponse(true, result, "Officer alert reset to active flag"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 8. POST /api/v1/threats/scan
  router.post("/scan", async (_req: Request, res: Response) => {
    try {
      const result = await threatService.scanSystem();
      res.json(formatResponse(true, result, "Security scan completed"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 9. POST /api/v1/threats/simulate-drill
  router.post("/simulate-drill", async (_req: Request, res: Response) => {
    try {
      const result = await threatService.simulateDrill();
      res.json(formatResponse(true, result, "Security drill simulated"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // 10. POST /api/v1/threats/reset-all
  router.post("/reset-all", async (_req: Request, res: Response) => {
    try {
      const result = await threatService.resetAll();
      res.json(formatResponse(true, result, "All threat alerts reset"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  // Legacy route: GET /api/v1/threats
  router.get("/", async (req: Request, res: Response) => {
    try {
      const { severity, status } = req.query;
      const threats = await threatService.getActiveAlerts({
        severity: severity as string,
        status: status as string,
      });
      res.json(formatResponse(true, threats, "Threat alerts retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const threat = await threatService.getThreatById(req.params.id as string);
      if (!threat) return res.status(404).json(formatResponse(false, null, undefined, "Threat not found"));
      res.json(formatResponse(true, threat, "Threat details retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  return router;
}
