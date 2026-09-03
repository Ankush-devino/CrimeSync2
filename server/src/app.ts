import express, { Application } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { ENV } from "./config/env";

export function createApp(): Application {
  const app: Application = express();

  // 1. Core Security & Parsing Middleware
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, "http://localhost:5173", "http://localhost:3000", "*"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 2. Health Check Endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // 3. API Routes Mounting (/api and /api/v1)
  const apiRouter = registerRoutes();
  app.use("/api/v1", apiRouter);
  app.use("/api", apiRouter);

  // 4. Fallback 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
