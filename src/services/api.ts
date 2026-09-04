// CrimeSync Central Frontend API Service
// Connects UI to Live PostgreSQL & Neo4j Backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json: ApiResponse<T> = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || `API Error: ${res.statusText}`);
    }
    return json.data;
  } catch (err: any) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. Cases & Investigations (PostgreSQL)
  cases: {
    getAll: (params?: { status?: string; priority?: string; city?: string }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request<any[]>(`/cases${qs}`);
    },
    getById: (id: string) => request<any>(`/cases/${id}`),
    getStats: () =>
      request<{
        total_cases: string;
        active_cases: string;
        critical_cases: string;
        resolved_cases: string;
      }>(`/cases/stats`),
  },

  // 2. Knowledge Graph (Neo4j AuraDB)
  knowledgeGraph: {
    getFullGraph: (limit = 100, caseId?: string) => {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (caseId) qs.append("caseId", caseId);
      return request<{
        nodes: Array<{ id: string; label: string; category: string; properties: any }>;
        edges: Array<{ id: string; source: string; target: string; relationship: string; properties: any }>;
        total_nodes: number;
        total_edges: number;
      }>(`/knowledge-graph?${qs.toString()}`);
    },
    getEntityConnections: (id: string) => request<any[]>(`/knowledge-graph/entity/${id}`),
    findPath: (from: string, to: string) =>
      request<{
        path_found: boolean;
        degrees_of_separation?: number;
        entity_chain?: string[];
        relationship_chain?: string[];
        message?: string;
      }>(`/knowledge-graph/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    addRelation: (sourceId: string, targetId: string, relationship: string, properties?: any) =>
      request<any>(`/knowledge-graph/relation`, {
        method: "POST",
        body: JSON.stringify({ sourceId, targetId, relationship, properties }),
      }),
  },

  // 3. Blast Radius Simulator (Neo4j AuraDB)
  blastRadius: {
    getSuspects: () =>
      request<Array<{ id: string; name: string; role: string; city: string; risk_score: number }>>(
        `/blast-radius/suspects`
      ),
    simulate: (originName: string, maxHops = 3) =>
      request<{
        origin_entity: string;
        origin_name: string;
        max_hops: number;
        total_impacted_nodes: number;
        risk_severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        impact_radius_percentage: number;
        impacted_nodes: Array<{ id: string; label: string; category: string; distance_hops: number; properties?: any }>;
        containment_actions: string[];
      }>(`/blast-radius/simulate`, {
        method: "POST",
        body: JSON.stringify({ originName, maxHops }),
      }),
  },

  // 4. Financial Intelligence (PostgreSQL)
  financial: {
    getAll: () => request<any[]>(`/financial`),
    getFlagged: (threshold = 0.8) => request<any[]>(`/financial/flagged?threshold=${threshold}`),
    getAccountTrail: (account: string) => request<any[]>(`/financial/trail/${account}`),
  },

  // 5. Geo-Intelligence (PostgreSQL)
  geo: {
    getHotspots: () => request<any[]>(`/geo/hotspots`),
    getClusters: () => request<any[]>(`/geo/clusters`),
  },

  // 6. Threat Intel (PostgreSQL)
  threats: {
    getAll: (params?: { severity?: string; status?: string }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request<any[]>(`/threats${qs}`);
    },
    getById: (id: string) => request<any>(`/threats/${id}`),
  },

  // 7. Evidence & Chain of Custody (PostgreSQL)
  evidence: {
    getAll: () => request<any[]>(`/evidence`),
    getByCase: (caseId: string) => request<any[]>(`/evidence/case/${caseId}`),
    verifyHash: (evidenceId: string, hash: string) =>
      request<{
        evidence_id: string;
        stored_hash: string;
        provided_hash: string;
        is_valid: boolean;
        status: string;
      }>(`/evidence/verify`, {
        method: "POST",
        body: JSON.stringify({ evidenceId, hash }),
      }),
  },

  // 8. Auth & Officers
  auth: {
    getOfficers: () => request<any[]>(`/auth/officers`),
    getProfile: () => request<any>(`/auth/me`),
  },

  // 9. Member 5: AI Copilot & Autonomous Agent Sandbox
  ai: {
    getLiveContext: (caseId?: string) => {
      const qs = caseId ? `?caseId=${caseId}` : "";
      return request<{
        cases: any[];
        officers: any[];
        evidence: any[];
        financial_transactions: any[];
        suspects: any[];
      }>(`/ai/context${qs}`);
    },
    askCopilot: (prompt: string, contextType?: string, caseId?: string) =>
      request<{
        session_id: string;
        answer: string;
        confidence_score: number;
        context_retrieved: any;
        recommended_actions: string[];
        timestamp: string;
      }>(`/ai/copilot/chat`, {
        method: "POST",
        body: JSON.stringify({ prompt, contextType, caseId }),
      }),
    executeAgentAction: (agentId: string, actionType: string, targetId?: string, caseId?: string) =>
      request<{
        agent_id: string;
        action_type: string;
        status: string;
        message: string;
        data?: any;
        dossier_id?: string;
        executed_at: string;
      }>(`/ai/sandbox/execute`, {
        method: "POST",
        body: JSON.stringify({ agentId, actionType, targetId, caseId }),
      }),
    getSummaryDossier: (caseId: string) => request<any>(`/ai/dossier/${caseId}`),
  },

  // 10. Member 5: Forensic & Court-Ready Reports
  reports: {
    list: () => request<any[]>(`/reports`),
    generateCourtReport: (caseId: string, officerName?: string) =>
      request<any>(`/reports/generate`, {
        method: "POST",
        body: JSON.stringify({ caseId, officerName }),
      }),
    getById: (reportId: string) => request<any>(`/reports/${reportId}`),
  },

  // 11. Member 5: Time Machine & Chronological Crime Reconstruction
  timeline: {
    getEvents: (params?: { caseId?: string; range?: string }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request<{
        total_events: number;
        time_range: string;
        case_id: string;
        events: Array<{
          id: string;
          timestamp: string;
          timeFormatted: string;
          dateFormatted: string;
          type: string;
          category: string;
          title: string;
          sub: string;
          entities: string;
          entitiesSub: string;
          evidence: string;
          evidenceType: 'doc' | 'audio' | 'video' | 'geo' | 'hash';
          riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
          properties?: any;
        }>;
      }>(`/timeline${qs}`);
    },
  },
};
