// Team Member 3: Attack Graph & Lateral Movement Path Visualizer

export interface AttackNodeDTO {
  id: string;
  label: string;
  type: 'host' | 'credential' | 'cve' | 'target_asset';
  vulnerabilityScore: number;
}

export interface AttackEdgeDTO {
  source: string;
  target: string;
  protocol: string;
  lateralRisk: 'high' | 'medium' | 'low';
}

export class AttackGraphService {
  async getGraphTopology(caseId?: string) {}
  async calculateCriticalPaths(startNode: string, endNode: string) {}
}

export class AttackGraphController {
  async handleGetTopology(req: unknown, res: unknown) {}
}

export function attackGraphRoutes() {
  // GET  /api/attack-graph
  // POST /api/attack-graph/simulate-path
}
