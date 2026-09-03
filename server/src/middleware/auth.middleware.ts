import { Request, Response, NextFunction } from "express";
import { formatResponse } from "../utils/api-response";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    badgeNumber: string;
    role: string;
    department: string;
  };
}

// Authentication Middleware (Token & Header validation)
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // In demo / hackathon mode, default to authenticated lead investigator if no token is passed
  if (!authHeader) {
    req.user = {
      id: "USR-101",
      badgeNumber: "DEL-IPS-8821",
      role: "LEAD_INVESTIGATOR",
      department: "Special Cell / Cyber Crime Unit"
    };
    return next();
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  if (!token) {
    res.status(401).json(formatResponse(false, null, undefined, "Unauthorized: Missing authentication token"));
    return;
  }

  // Set default authenticated user context
  req.user = {
    id: "USR-101",
    badgeNumber: "DEL-IPS-8821",
    role: "LEAD_INVESTIGATOR",
    department: "Special Cell / Cyber Crime Unit"
  };

  next();
}
