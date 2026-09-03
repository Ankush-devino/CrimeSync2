import { Router, Request, Response } from "express";
import { threatService } from "./threat.service";
import { formatResponse } from "../../utils/api-response";

export function threatRoutes(): Router {
  const router = Router();

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
