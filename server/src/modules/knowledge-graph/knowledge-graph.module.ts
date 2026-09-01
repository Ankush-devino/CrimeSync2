// Team Member 5: Knowledge Graph Entity-Relationship Module

export interface GraphNodeDTO {
  id: string;
  label: string;
  category: 'suspect' | 'victim' | 'vehicle' | 'location' | 'bank_account' | 'weapon';
  properties: Record<string, unknown>;
}

export interface GraphEdgeDTO {
  id: string;
  source: string;
  target: string;
  relationship: 'communicated_with' | 'transferred_funds_to' | 'spotted_at' | 'owns' | 'accomplice_of';
}

export class KnowledgeGraphService {
  async getFullGraph(caseId?: string) {}
  async getEntityConnections(entityId: string) {}
  async addRelationship(source: string, target: string, relation: string) {}
}

export class KnowledgeGraphController {
  async handleGetGraph(req: unknown, res: unknown) {}
  async handleGetConnections(req: unknown, res: unknown) {}
}

export function knowledgeGraphRoutes() {
  // GET  /api/knowledge-graph
  // GET  /api/knowledge-graph/entity/:id
  // POST /api/knowledge-graph/relation
}
