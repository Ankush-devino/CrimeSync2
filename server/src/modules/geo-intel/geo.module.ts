import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export class GeoIntelService {
  async getHotspots() {
    const query = `
      SELECT g.*, c.title as case_title, c.crime_category, c.priority
      FROM geo_intel_events g
      LEFT JOIN cases c ON g.case_id = c.id
      ORDER BY g.timestamp DESC
    `;
    const result = await pgPool.query(query);
    return result.rows;
  }

  async getCityClusters() {
    const query = `
      SELECT city, state, COUNT(*) as event_count, AVG(latitude) as center_lat, AVG(longitude) as center_lng
      FROM geo_intel_events
      GROUP BY city, state
      ORDER BY event_count DESC
    `;
    const result = await pgPool.query(query);
    return result.rows;
  }
}

export const geoIntelService = new GeoIntelService();

export class GeoIntelController {
  async handleGetHotspots(_req: Request, res: Response) {
    try {
      const hotspots = await geoIntelService.getHotspots();
      res.json(formatResponse(true, hotspots, "Geo-intel crime hotspots retrieved successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetClusters(_req: Request, res: Response) {
    try {
      const clusters = await geoIntelService.getCityClusters();
      res.json(formatResponse(true, clusters, "City-level spatial clusters retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const geoIntelController = new GeoIntelController();

export function geoRoutes(): Router {
  const router = Router();
  router.get("/hotspots", (req, res) => geoIntelController.handleGetHotspots(req, res));
  router.get("/clusters", (req, res) => geoIntelController.handleGetClusters(req, res));
  return router;
}
