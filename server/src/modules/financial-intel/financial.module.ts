import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export class FinancialIntelService {
  async getAllTransactions(limit = 50) {
    const query = `
      SELECT * FROM financial_transactions 
      ORDER BY timestamp DESC 
      LIMIT $1
    `;
    const result = await pgPool.query(query, [limit]);
    return result.rows;
  }

  async getFlaggedTransactions(minScore = 0.8) {
    const query = `
      SELECT * FROM financial_transactions 
      WHERE suspicious_score >= $1 
      ORDER BY suspicious_score DESC, amount_inr DESC
    `;
    const result = await pgPool.query(query, [minScore]);
    return result.rows;
  }

  async getAccountTrail(accountNumber: string) {
    const query = `
      SELECT * FROM financial_transactions 
      WHERE source_account = $1 OR target_account = $1 
      ORDER BY timestamp DESC
    `;
    const result = await pgPool.query(query, [accountNumber]);
    return result.rows;
  }
}

export const financialIntelService = new FinancialIntelService();

export class FinancialIntelController {
  async handleGetAll(req: Request, res: Response) {
    try {
      const txns = await financialIntelService.getAllTransactions();
      res.json(formatResponse(true, txns, "Financial transactions retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetFlagged(req: Request, res: Response) {
    try {
      const score = req.query.threshold ? parseFloat(req.query.threshold as string) : 0.8;
      const txns = await financialIntelService.getFlaggedTransactions(score);
      res.json(formatResponse(true, txns, "Flagged suspicious transactions retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetTrail(req: Request, res: Response) {
    try {
      const account = req.params.account as string;
      const trail = await financialIntelService.getAccountTrail(account);
      res.json(formatResponse(true, trail, `Money trail for account ${account} retrieved`));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const financialIntelController = new FinancialIntelController();

export function financialRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => financialIntelController.handleGetAll(req, res));
  router.get("/flagged", (req, res) => financialIntelController.handleGetFlagged(req, res));
  router.get("/trail/:account", (req, res) => financialIntelController.handleGetTrail(req, res));
  return router;
}
