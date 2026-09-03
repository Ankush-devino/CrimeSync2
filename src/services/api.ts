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
    getStats: () => request<{
      total_cases: string;
      active_cases: string;
      critical_cases: string;
      resolved_cases: string;
    }>(`/cases/stats`),
  },

  // 2. Knowledge Graph (Neo4j AuraDB)
  knowledgeGraph: {
    getFullGraph: (limit = 100) => request<{
      nodes: Array<{ id: string; label: string; category: string; properties: any }>;
      edges: Array<{ id: string; source: string; target: string; relationship: string; properties: any }>;
      total_nodes: number;
      total_edges: number;
    }>(`/knowledge-graph?limit=${limit}`),
    getEntityConnections: (id: string) => request<any[]>(`/knowledge-graph/entity/${id}`),
  },

  // 3. Blast Radius Simulator (Neo4j AuraDB)
  blastRadius: {
    simulate: (originId: string, maxHops = 3) => request<{
      origin_entity: string;
      max_hops: number;
      total_impacted_nodes: number;
      risk_severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
      impact_radius_percentage: number;
      impacted_nodes: Array<{ id: string; label: string; category: string; distance_hops: number }>;
      containment_actions: string[];
    }>(`/blast-radius/simulate`, {
      method: "POST",
      body: JSON.stringify({ originId, maxHops }),
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
    verifyHash: (evidenceId: string, hash: string) => request<{
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
};
