import { Request, Response, NextFunction } from "express";
import { formatResponse } from "../utils/api-response";
import { logger } from "../utils/logger";

// Central API Error Handling Middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`, err.stack);

  res.status(statusCode).json(
    formatResponse(false, null, undefined, message)
  );
}

// 404 Route Not Found Middleware
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    formatResponse(false, null, undefined, `Route not found: ${req.method} ${req.originalUrl}`)
  );
}
