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
