// Team Member 2: Chain of Custody Controller & Routes
import { Router, Request, Response } from "express";
import { custodyService } from "./custody.service";
import { formatResponse } from "../../utils/api-response";

export class CustodyController {
  async handleListAll(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const data = await custodyService.getAllCustodyItems(caseId);
      res.json(formatResponse(true, data, "Chain of custody records retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetStats(req: Request, res: Response) {
    try {
      const caseId = req.query.case_id ? String(req.query.case_id) : undefined;
      const data = await custodyService.getCustodyStats(caseId);
      res.json(formatResponse(true, data, "Custody statistics calculated"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetManifest(req: Request, res: Response) {
    try {
      const evidenceId = String(req.params.evidenceId || "EV-1246");
      const data = await custodyService.generateCourtManifest(evidenceId);
      res.json(formatResponse(true, data, "Section 65B Court Dossier generated"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetByEvidence(req: Request, res: Response) {
    try {
      const evidenceId = String(req.params.evidenceId);
      const data = await custodyService.getItemByEvidenceId(evidenceId);
      if (!data) {
        return res.status(404).json(formatResponse(false, null, undefined, "Evidence record not found"));
      }
      res.json(formatResponse(true, data, "Custody record retrieved"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleLogHandover(req: Request, res: Response) {
    try {
      const {
        evidenceId,
        recipientName,
        recipientBadge,
        destinationLocation,
        action,
        reasonNotes,
        currentOfficerName,
        currentOfficerBadge
      } = req.body;

      if (!evidenceId) {
        return res.status(400).json(formatResponse(false, null, undefined, "evidenceId is required"));
      }
      if (!recipientName) {
        return res.status(400).json(formatResponse(false, null, undefined, "recipientName is required"));
      }

      const result = await custodyService.logHandover({
        evidenceId,
        recipientName,
        recipientBadge: recipientBadge || "SEC-POL-9920",
        destinationLocation: destinationLocation || "Central Forensic Science Lab",
        action: action || "TRANSFERRED",
        reasonNotes: reasonNotes || "Standard evidentiary custody transfer",
        currentOfficerName,
        currentOfficerBadge
      });

      res.status(201).json(formatResponse(true, result, "Custody transfer anchored to blockchain"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleVerifyChain(req: Request, res: Response) {
    try {
      const { evidenceId } = req.body;
      if (!evidenceId) {
        return res.status(400).json(formatResponse(false, null, undefined, "evidenceId is required"));
      }
      const data = await custodyService.verifyChainIntegrity(evidenceId);
      res.json(formatResponse(true, data, "Chain of custody cryptographic integrity verified"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const custodyController = new CustodyController();

export function custodyRoutes(): Router {
  const router = Router();
  router.get("/stats", (req, res) => custodyController.handleGetStats(req, res));
  router.get("/manifest/:evidenceId", (req, res) => custodyController.handleGetManifest(req, res));
  router.get("/:evidenceId", (req, res) => custodyController.handleGetByEvidence(req, res));
  router.get("/", (req, res) => custodyController.handleListAll(req, res));
  router.post("/handover", (req, res) => custodyController.handleLogHandover(req, res));
  router.post("/verify", (req, res) => custodyController.handleVerifyChain(req, res));
  return router;
}
