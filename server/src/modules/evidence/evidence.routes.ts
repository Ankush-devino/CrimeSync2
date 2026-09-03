import { Router, Request, Response } from "express";
import { evidenceService } from "./evidence.service";
import { formatResponse } from "../../utils/api-response";

export function evidenceRoutes(): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const items = await evidenceService.getAllEvidence();
      res.json(formatResponse(true, items, "Evidence registry retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  router.get("/case/:caseId", async (req: Request, res: Response) => {
    try {
      const items = await evidenceService.getEvidenceByCase(req.params.caseId as string);
      res.json(formatResponse(true, items, "Case evidence retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  router.post("/verify", async (req: Request, res: Response) => {
    try {
      const { evidenceId, hash } = req.body;
      const result = await evidenceService.verifyEvidenceHash(evidenceId, hash);
      if (!result) return res.status(404).json(formatResponse(false, null, undefined, "Evidence record not found"));
      res.json(formatResponse(true, result, "Evidence integrity check complete"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  return router;
}
