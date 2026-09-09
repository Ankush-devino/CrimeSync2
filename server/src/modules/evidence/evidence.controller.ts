import { Request, Response } from "express";
import { evidenceService } from "./evidence.service";
import { formatResponse } from "../../utils/api-response";

export class EvidenceController {
  async handleGetAllEvidence(req: Request, res: Response) {
    try {
      const items = await evidenceService.getAllEvidence();
      res.json(formatResponse(true, items, "Evidence registry retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetEvidenceByCase(req: Request, res: Response) {
    try {
      const caseId = req.params.caseId as string;
      const items = await evidenceService.getEvidenceByCase(caseId);
      res.json(formatResponse(true, items, "Case evidence retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleCreateEvidence(req: Request, res: Response) {
    try {
      const item = await evidenceService.createEvidence(req.body);
      res.status(201).json(formatResponse(true, item, "Evidence registered successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleVerifyIntegrity(req: Request, res: Response) {
    try {
      const { evidenceId, hash } = req.body;
      const result = await evidenceService.verifyEvidenceHash(evidenceId, hash);
      if (!result) return res.status(404).json(formatResponse(false, null, undefined, "Evidence record not found"));
      res.json(formatResponse(true, result, "Evidence integrity check complete"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetDnaProfiles(req: Request, res: Response) {
    try {
      const caseId = req.query.caseId as string | undefined;
      const profiles = await evidenceService.getDnaProfiles(caseId);
      res.json(formatResponse(true, profiles, "Evidence DNA profiles loaded"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetDnaProfileById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const profile = await evidenceService.getDnaProfileById(id);
      if (!profile) return res.status(404).json(formatResponse(false, null, undefined, "DNA profile not found"));
      res.json(formatResponse(true, profile, "DNA profile retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGenerateDna(req: Request, res: Response) {
    try {
      const { fileName, fileType, fileSize, rawContent, caseId, algorithm } = req.body;
      if (!fileName) {
        return res.status(400).json(formatResponse(false, null, undefined, "fileName is required"));
      }
      const newProfile = await evidenceService.generateEvidenceDna({
        fileName,
        fileType,
        fileSize,
        rawContent,
        caseId,
        algorithm,
      });
      res.status(201).json(formatResponse(true, newProfile, "Evidence DNA generated & anchored on-chain"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetDnaStats(_req: Request, res: Response) {
    try {
      const stats = await evidenceService.getDnaStats();
      res.json(formatResponse(true, stats, "Evidence DNA stats retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleVerifyBlockchain(req: Request, res: Response) {
    try {
      const { evidenceId, hash } = req.body;
      const result = await evidenceService.verifyDnaBlockchain(evidenceId, hash);
      res.json(formatResponse(true, result, "Blockchain consensus verified"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetCertificate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const cert = await evidenceService.generateSection65BCertificate(id);
      res.json(formatResponse(true, cert, "Section 65B Electronic Certificate generated"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const evidenceController = new EvidenceController();
