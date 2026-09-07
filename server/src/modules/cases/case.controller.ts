import { Request, Response } from "express";
import { caseService } from "./case.service";
import { formatResponse } from "../../utils/api-response";

export class CaseController {
  async getAllCases(req: Request, res: Response) {
    try {
      const { status, priority, city } = req.query;
      const cases = await caseService.getAllCases({
        status: status as string,
        priority: priority as string,
        city: city as string,
      });
      res.json(formatResponse(true, cases, "Cases retrieved successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async getCaseById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const caseItem = await caseService.getCaseById(id);
      if (!caseItem) {
        return res.status(404).json(formatResponse(false, null, undefined, "Case not found"));
      }
      res.json(formatResponse(true, caseItem, "Case details retrieved successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async createCase(req: Request, res: Response) {
    try {
      const newCase = await caseService.createCase(req.body);
      res.status(201).json(formatResponse(true, newCase, "FIR Case created successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async updateCaseStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updatedCase = await caseService.updateCaseStatus(id, status);
      if (!updatedCase) {
        return res.status(404).json(formatResponse(false, null, undefined, "Case not found"));
      }
      res.json(formatResponse(true, updatedCase, "Case status updated successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async addCaseNote(req: Request, res: Response) {
    try {
      const caseId = req.params.id as string;
      const note = await caseService.addCaseNote(caseId, req.body);
      res.status(201).json(formatResponse(true, note, "Case diary note added"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async updateCaseNote(req: Request, res: Response) {
    try {
      const noteId = req.params.noteId as string;
      const updated = await caseService.updateCaseNote(noteId, req.body);
      if (!updated) {
        return res.status(404).json(formatResponse(false, null, undefined, "Case diary note not found"));
      }
      res.json(formatResponse(true, updated, "Case diary note updated successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async deleteCaseNote(req: Request, res: Response) {
    try {
      const noteId = req.params.noteId as string;
      await caseService.deleteCaseNote(noteId);
      res.json(formatResponse(true, { noteId }, "Case diary note deleted successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async getCaseStats(_req: Request, res: Response) {
    try {
      const stats = await caseService.getCaseStats();
      res.json(formatResponse(true, stats, "Case statistics retrieved successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const caseController = new CaseController();
