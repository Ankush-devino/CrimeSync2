import { Router } from "express";
import { caseController } from "./case.controller";

export function caseRoutes(): Router {
  const router = Router();

  router.get("/", (req, res) => caseController.getAllCases(req, res));
  router.post("/", (req, res) => caseController.createCase(req, res));
  router.get("/stats", (req, res) => caseController.getCaseStats(req, res));
  router.get("/:id", (req, res) => caseController.getCaseById(req, res));
  router.patch("/:id/status", (req, res) => caseController.updateCaseStatus(req, res));
  router.post("/:id/notes", (req, res) => caseController.addCaseNote(req, res));
  router.put("/:id/notes/:noteId", (req, res) => caseController.updateCaseNote(req, res));
  router.patch("/:id/notes/:noteId", (req, res) => caseController.updateCaseNote(req, res));
  router.delete("/:id/notes/:noteId", (req, res) => caseController.deleteCaseNote(req, res));

  return router;
}
