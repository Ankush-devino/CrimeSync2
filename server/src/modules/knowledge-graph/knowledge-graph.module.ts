// Team Member 5: Knowledge Graph Entity-Relationship & Link Discovery Module
import { Router, Request, Response } from "express";
import { neo4jDriver } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

const neo4j = require("neo4j-driver");

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
  async getFullGraph(limit = 100, caseId?: string) {
    if (!neo4jDriver) {
      throw new Error("Neo4j driver is not initialized");
    }

    const session = neo4jDriver.session();
    try {
      let cypher = `MATCH (s)-[r]->(t)
         RETURN s, r, t, elementId(s) as s_id, elementId(t) as t_id, elementId(r) as r_id
         LIMIT $limit`;

      const params: any = { limit: neo4j.int(limit) };

      if (caseId && caseId !== "ALL") {
        cypher = `
          MATCH (c:Case {id: $caseId})
          OPTIONAL MATCH (s:Suspect)-[r1:IMPLICATED_IN]->(c)
          OPTIONAL MATCH (s)-[r2]->(t)
          RETURN s, r2 as r, t, elementId(s) as s_id, elementId(t) as t_id, elementId(r2) as r_id
          LIMIT $limit
        `;
        params.caseId = caseId;
      }

      let result = await session.run(cypher, params);

      // If specific case returned 0 (e.g. initial setup), return case with its direct nodes
      if (result.records.length === 0 && caseId && caseId !== "ALL") {
        result = await session.run(
          `MATCH (s:Suspect)-[r:IMPLICATED_IN]->(c:Case {id: $caseId})
           RETURN s, r, c as t, elementId(s) as s_id, elementId(c) as t_id, elementId(r) as r_id`,
          { caseId }
        );
      }

      // Fallback to all nodes if still empty
      if (result.records.length === 0) {
        result = await session.run(
          `MATCH (s)-[r]->(t)
           RETURN s, r, t, elementId(s) as s_id, elementId(t) as t_id, elementId(r) as r_id
           LIMIT $limit`,
          { limit: neo4j.int(limit) }
        );
      }

      const nodesMap = new Map<string, GraphNodeDTO>();
      const edges: GraphEdgeDTO[] = [];

      for (const record of result.records) {
        const sNode = record.get("s");
        const tNode = record.get("t");
        const rel = record.get("r");

        if (!sNode || !tNode) continue;

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

        if (rel) {
          edges.push({
            id: record.get("r_id") || `rel-${sKey}-${tKey}`,
            source: sKey,
            target: tKey,
            relationship: rel.type,
            properties: rel.properties,
          });
        }
      }

      return {
        nodes: Array.from(nodesMap.values()),
        edges,
        total_nodes: nodesMap.size,
        total_edges: edges.length,
        case_id: caseId || "ALL",
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

  async findShortestPath(sourceId: string, targetId: string) {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (a {id: $sourceId}), (b {id: $targetId}),
               p = shortestPath((a)-[*..6]-(b))
         RETURN p, length(p) as distance, [n in nodes(p) | n.name] as node_names, [r in relationships(p) | type(r)] as rel_types`,
        { sourceId, targetId }
      );

      if (result.records.length === 0) {
        return { path_found: false, message: `No path within 6 degrees of separation between ${sourceId} and ${targetId}` };
      }

      const rec = result.records[0];
      return {
        path_found: true,
        degrees_of_separation: rec.get("distance").toNumber(),
        entity_chain: rec.get("node_names"),
        relationship_chain: rec.get("rel_types"),
      };
    } finally {
      await session.close();
    }
  }

  async addRelationship(sourceId: string, targetId: string, relationshipType: string, properties: Record<string, any> = {}) {
    if (!neo4jDriver) throw new Error("Neo4j driver not initialized");
    const session = neo4jDriver.session();
    try {
      const relName = relationshipType.toUpperCase().replace(/\s+/g, "_");
      await session.run(
        `MATCH (s {id: $sourceId}), (t {id: $targetId})
         MERGE (s)-[r:${relName}]->(t)
         SET r += $properties
         RETURN r`,
        { sourceId, targetId, properties }
      );
      return { success: true, source: sourceId, target: targetId, relationship: relName };
    } finally {
      await session.close();
    }
  }
  async addNode(nodeData: {
    id?: string;
    label: string;
    category: string;
    properties?: Record<string, any>;
    connectToId?: string;
    relationship?: string;
    caseId?: string;
  }) {
    const id = nodeData.id || `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const label = nodeData.label.trim();
    const category = nodeData.category || "Suspect";
    const properties = {
      id,
      name: label,
      title: label,
      category,
      created_at: new Date().toISOString(),
      ...(nodeData.properties || {}),
    };

    let createdInNeo4j = false;
    let edgeCreated: any = null;

    if (neo4jDriver) {
      const session = neo4jDriver.session();
      try {
        const safeLabel = category.replace(/[^a-zA-Z0-9_]/g, "") || "Entity";
        await session.run(
          `MERGE (n:${safeLabel} {id: $id})
           SET n += $properties
           RETURN n`,
          { id, properties }
        );
        createdInNeo4j = true;

        if (nodeData.connectToId) {
          const relType = (nodeData.relationship || "LINKED_TO").toUpperCase().replace(/[^a-zA-Z0-9_]/g, "_");
          await session.run(
            `MATCH (s {id: $sourceId}), (t {id: $targetId})
             MERGE (s)-[r:${relType}]->(t)
             RETURN r`,
            { sourceId: id, targetId: nodeData.connectToId }
          );
          edgeCreated = {
            id: `rel-${id}-${nodeData.connectToId}`,
            source: id,
            target: nodeData.connectToId,
            relationship: relType,
            properties: {},
          };
        } else if (nodeData.caseId && nodeData.caseId !== "ALL") {
          await session.run(
            `MATCH (c:Case {id: $caseId}), (n {id: $id})
             MERGE (n)-[r:IMPLICATED_IN]->(c)
             RETURN r`,
            { caseId: nodeData.caseId, id }
          );
          edgeCreated = {
            id: `rel-${id}-${nodeData.caseId}`,
            source: id,
            target: nodeData.caseId,
            relationship: "IMPLICATED_IN",
            properties: {},
          };
        }
      } catch (err) {
        console.warn("Neo4j addNode warning:", err);
      } finally {
        await session.close();
      }
    }

    const newNodeDTO: GraphNodeDTO = {
      id,
      label,
      category,
      properties,
    };

    return {
      node: newNodeDTO,
      edge: edgeCreated,
      createdInNeo4j,
    };
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();

export class KnowledgeGraphController {
  async handleGetGraph(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const caseId = req.query.caseId as string;
      const data = await knowledgeGraphService.getFullGraph(limit, caseId);
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

  async handleFindPath(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      if (!from || !to) {
        return res.status(400).json(formatResponse(false, null, undefined, "'from' and 'to' entity IDs required"));
      }
      const data = await knowledgeGraphService.findShortestPath(from as string, to as string);
      res.json(formatResponse(true, data, "Shortest link path calculated"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleAddRelation(req: Request, res: Response) {
    try {
      const { sourceId, targetId, relationship, properties } = req.body;
      if (!sourceId || !targetId || !relationship) {
        return res.status(400).json(formatResponse(false, null, undefined, "sourceId, targetId, and relationship are required"));
      }
      const data = await knowledgeGraphService.addRelationship(sourceId, targetId, relationship, properties || {});
      res.json(formatResponse(true, data, "Relationship created in Neo4j"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }

  async handleAddNode(req: Request, res: Response) {
    try {
      const { id, label, category, properties, connectToId, relationship, caseId } = req.body;
      if (!label) {
        return res.status(400).json(formatResponse(false, null, undefined, "Node label/name is required"));
      }
      const data = await knowledgeGraphService.addNode({
        id,
        label,
        category: category || "Suspect",
        properties,
        connectToId,
        relationship,
        caseId,
      });
      res.json(formatResponse(true, data, "Knowledge graph node added successfully"));
    } catch (error: any) {
      res.status(500).json(formatResponse(false, null, undefined, error.message));
    }
  }
}

export const knowledgeGraphController = new KnowledgeGraphController();

export function knowledgeGraphRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => knowledgeGraphController.handleGetGraph(req, res));
  router.get("/path", (req, res) => knowledgeGraphController.handleFindPath(req, res));
  router.get("/entity/:id", (req, res) => knowledgeGraphController.handleGetConnections(req, res));
  router.post("/relation", (req, res) => knowledgeGraphController.handleAddRelation(req, res));
  router.post("/node", (req, res) => knowledgeGraphController.handleAddNode(req, res));
  return router;
}
