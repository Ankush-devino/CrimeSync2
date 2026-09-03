import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export class AuthService {
  async getAllUsers() {
    const query = `SELECT id, badge_number, full_name, email, role, department, city, phone FROM users WHERE is_active = TRUE`;
    const result = await pgPool.query(query);
    return result.rows;
  }

  async getUserByEmail(email: string) {
    const query = `SELECT id, badge_number, full_name, email, role, department, city, phone FROM users WHERE email = $1`;
    const result = await pgPool.query(query, [email]);
    return result.rows[0] || null;
  }

  async login(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Default to ACP Rajeshwar Sharma for demo fallback
      const fallback = await pgPool.query(`SELECT id, badge_number, full_name, email, role, department, city, phone FROM users LIMIT 1`);
      return {
        user: fallback.rows[0],
        token: "demo_jwt_token_delhi_police_hq",
      };
    }
    return {
      user,
      token: `crimesync_token_${user.id}_${Date.now()}`,
    };
  }
}

export const authService = new AuthService();

export function authRoutes(): Router {
  const router = Router();

  router.get("/officers", async (_req: Request, res: Response) => {
    try {
      const users = await authService.getAllUsers();
      res.json(formatResponse(true, users, "Officers list retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  router.post("/login", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await authService.login(email);
      res.json(formatResponse(true, result, "Login successful"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  router.get("/me", async (_req: Request, res: Response) => {
    try {
      const user = (await authService.getAllUsers())[0];
      res.json(formatResponse(true, user, "Current officer profile"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  });

  return router;
}
