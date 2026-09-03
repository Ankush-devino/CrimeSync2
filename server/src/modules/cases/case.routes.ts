import { Router } from "express";
import { caseController } from "./case.controller";

export function caseRoutes(): Router {
  const router = Router();

  router.get("/", (req, res) => caseController.getAllCases(req, res));
  router.get("/stats", (req, res) => caseController.getCaseStats(req, res));
  router.get("/:id", (req, res) => caseController.getCaseById(req, res));

  return router;
}
