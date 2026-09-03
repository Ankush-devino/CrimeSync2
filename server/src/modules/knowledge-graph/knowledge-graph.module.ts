import { Router, Request, Response } from "express";
import { neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface GraphNodeDTO {
  id: string;
  label: string;
  category: string;
  properties: Record<string, unknown>;
}

export interface GraphEdgeDTO {
  id: string;
  source: string;
  target: string;
  relationship: string;
  properties: Record<string, unknown>;
}

export class KnowledgeGraphService {
  async getFullGraph(limit = 100) {
    if (!neo4jDriver) {
      throw new Error("Neo4j driver is not initialized");
    }

    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (s)-[r]->(t)
         RETURN s, r, t, elementId(s) as s_id, elementId(t) as t_id, elementId(r) as r_id
         LIMIT $limit`,
        { limit: neo4j.int(limit) }
      );

      const nodesMap = new Map<string, GraphNodeDTO>();
      const edges: GraphEdgeDTO[] = [];

      for (const record of result.records) {
        const sNode = record.get("s");
        const tNode = record.get("t");
        const rel = record.get("r");

        const sKey = sNode.properties.id || sNode.properties.account_number || sNode.properties.phone_number || sNode.properties.ip || record.get("s_id");
        const tKey = tNode.properties.id || tNode.properties.account_number || tNode.properties.phone_number || tNode.properties.ip || record.get("t_id");

        if (!nodesMap.has(sKey)) {
          nodesMap.set(sKey, {
            id: sKey,
            label: sNode.properties.name || sNode.properties.title || sKey,
            category: sNode.labels[0] || "Entity",
            properties: sNode.properties,
          });
        }

        if (!nodesMap.has(tKey)) {
          nodesMap.set(tKey, {
            id: tKey,
            label: tNode.properties.name || tNode.properties.title || tKey,
            category: tNode.labels[0] || "Entity",
            properties: tNode.properties,
          });
        }

        edges.push({
          id: record.get("r_id"),
          source: sKey,
          target: tKey,
          relationship: rel.type,
          properties: rel.properties,
        });
      }

      return {
        nodes: Array.from(nodesMap.values()),
        edges,
        total_nodes: nodesMap.size,
        total_edges: edges.length,
      };
    } finally {
      await session.close();
    }
  }

  async getEntityConnections(entityId: string) {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (s {id: $entityId})-[r]-(target)
         RETURN s, r, target, type(r) as rel_type`,
        { entityId }
      );

      const connections = result.records.map((rec) => ({
        relationship: rec.get("rel_type"),
        connected_entity: rec.get("target").properties,
        labels: rec.get("target").labels,
      }));

      return connections;
    } finally {
      await session.close();
    }
  }
}

const neo4j = require("neo4j-driver");
export const knowledgeGraphService = new KnowledgeGraphService();

export class KnowledgeGraphController {
  async handleGetGraph(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const data = await knowledgeGraphService.getFullGraph(limit);
      res.json(formatResponse(true, data, "Knowledge graph retrieved successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleGetConnections(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await knowledgeGraphService.getEntityConnections(id);
      res.json(formatResponse(true, data, "Entity connections retrieved successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const knowledgeGraphController = new KnowledgeGraphController();

export function knowledgeGraphRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => knowledgeGraphController.handleGetGraph(req, res));
  router.get("/entity/:id", (req, res) => knowledgeGraphController.handleGetConnections(req, res));
  return router;
}
