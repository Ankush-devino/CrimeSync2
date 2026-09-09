import { Router, Request, Response } from "express";
import { evidenceController } from "./evidence.controller";

export function evidenceRoutes(): Router {
  const router = Router();

  // ── EVIDENCE DNA ENDPOINTS ────────────────────────────────────────────────
  router.get("/dna/profiles", (req: Request, res: Response) =>
    evidenceController.handleGetDnaProfiles(req, res)
  );

  router.get("/dna/stats", (req: Request, res: Response) =>
    evidenceController.handleGetDnaStats(req, res)
  );

  router.get("/dna/profile/:id", (req: Request, res: Response) =>
    evidenceController.handleGetDnaProfileById(req, res)
  );

  router.post("/dna/generate", (req: Request, res: Response) =>
    evidenceController.handleGenerateDna(req, res)
  );

  router.post("/dna/verify-blockchain", (req: Request, res: Response) =>
    evidenceController.handleVerifyBlockchain(req, res)
  );

  router.get("/dna/certificate/:id", (req: Request, res: Response) =>
    evidenceController.handleGetCertificate(req, res)
  );

  // ── STANDARD EVIDENCE REGISTRY ENDPOINTS ──────────────────────────────────
  router.get("/", (req: Request, res: Response) =>
    evidenceController.handleGetAllEvidence(req, res)
  );

  router.get("/case/:caseId", (req: Request, res: Response) =>
    evidenceController.handleGetEvidenceByCase(req, res)
  );

  router.post("/", (req: Request, res: Response) =>
    evidenceController.handleCreateEvidence(req, res)
  );

  router.post("/verify", (req: Request, res: Response) =>
    evidenceController.handleVerifyIntegrity(req, res)
  );

  return router;
}
