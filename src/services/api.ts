// CrimeSync Central Frontend API Service
// Connects UI to Live PostgreSQL & Neo4j Backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('crimesync_jwt_token') : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    create: (payload: {
      fir_number: string;
      title: string;
      description: string;
      crime_category: string;
      priority: string;
      status: string;
      jurisdiction_city: string;
      lead_investigator_id?: string;
    }) =>
      request<any>(`/cases`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/cases/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    addNote: (caseId: string, payload: { note: string; category?: string; userId?: string }) =>
      request<any>(`/cases/${caseId}/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateNote: (caseId: string, noteId: string, payload: { note: string; category?: string }) =>
      request<any>(`/cases/${caseId}/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteNote: (caseId: string, noteId: string) =>
      request<any>(`/cases/${caseId}/notes/${noteId}`, {
        method: "DELETE",
      }),
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
    addNode: (payload: {
      id?: string;
      label: string;
      category: string;
      properties?: Record<string, any>;
      connectToId?: string;
      relationship?: string;
      caseId?: string;
    }) =>
      request<{
        node: { id: string; label: string; category: string; properties: any };
        edge?: { id: string; source: string; target: string; relationship: string; properties: any };
        createdInNeo4j: boolean;
      }>(`/knowledge-graph/node`, {
        method: "POST",
        body: JSON.stringify(payload),
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

  // 4. Financial Intelligence
  financial: {
    getSummary: (caseId?: string) => {
      const qs = caseId && caseId !== 'ALL' ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<any>(`/financial/summary${qs}`);
    },
    getAccounts: (caseId?: string) => {
      const qs = caseId && caseId !== 'ALL' ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<any[]>(`/financial/accounts${qs}`);
    },
    getTransactions: (caseId?: string, limit = 100) => {
      const params = new URLSearchParams();
      if (caseId && caseId !== 'ALL') params.append('case_id', caseId);
      if (limit) params.append('limit', String(limit));
      const qs = params.toString() ? `?${params.toString()}` : "";
      return request<any[]>(`/financial/transactions${qs}`);
    },
    getFlowNetwork: (caseId?: string) => {
      const qs = caseId && caseId !== 'ALL' ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<{ nodes: any[]; links: any[] }>(`/financial/flow-network${qs}`);
    },
    getCryptoTrails: (caseId?: string) => {
      const qs = caseId && caseId !== 'ALL' ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<any[]>(`/financial/crypto-trails${qs}`);
    },
    getHawalaLedger: (caseId?: string) => {
      const qs = caseId && caseId !== 'ALL' ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<any[]>(`/financial/hawala-ledger${qs}`);
    },
    freezeAccount: (payload: { account_id: string; reason?: string; officer_name?: string }) =>
      request<any>(`/financial/freeze-account`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getAll: () => request<any[]>(`/financial/transactions`),
    getFlagged: (threshold = 0.8) => request<any[]>(`/financial/transactions?threshold=${threshold}`),
    getAccountTrail: (account: string) => request<any[]>(`/financial/transactions?account=${account}`),
  },

  // 5. Geo-Intelligence (PostgreSQL)
  geo: {
    getHotspots: (params?: { case_id?: string; city?: string; severity?: string; event_type?: string }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request<any[]>(`/geo/hotspots${qs}`);
    },
    getClusters: () => request<any[]>(`/geo/clusters`),
    getSuspectMovements: (caseId?: string) => {
      const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : "";
      return request<any[]>(`/geo/suspect-movements${qs}`);
    },
    getCctvFeeds: (city?: string) => {
      const qs = city ? `?city=${encodeURIComponent(city)}` : "";
      return request<any[]>(`/geo/cctv-feeds${qs}`);
    },
    getPoliceStations: (city?: string) => {
      const qs = city ? `?city=${encodeURIComponent(city)}` : "";
      return request<any[]>(`/geo/police-stations${qs}`);
    },
    createEvent: (payload: any) =>
      request<any>(`/geo/events`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    triangulateBts: (towers: { latitude: number; longitude: number; distance_km: number; rssi_dbm?: number }[]) =>
      request<any>(`/geo/triangulate`, {
        method: "POST",
        body: JSON.stringify({ towers }),
      }),
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
    create: (payload: {
      case_id: string;
      evidence_code: string;
      title: string;
      category: string;
      hash_sha256: string;
      collected_by_id?: string;
      current_custody_officer_id?: string;
      status?: string;
    }) =>
      request<any>(`/evidence`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
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
    update: (
      id: string,
      payload: {
        title?: string;
        category?: string;
        status?: string;
        hash_sha256?: string;
        current_custody_officer_id?: string;
      }
    ) =>
      request<any>(`/evidence/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<any>(`/evidence/${id}`, {
        method: "DELETE",
      }),
  },

  // 8. Auth & Officers
  auth: {
    login: (credentials: { username?: string; email?: string; badge_number?: string; password?: string }) =>
      request<{
        user: {
          id: string;
          badge_number: string;
          full_name: string;
          email: string;
          role: string;
          department: string;
          city: string;
          phone: string;
          is_active: boolean;
        };
        token: string;
        token_type: string;
        expires_in: number;
        accessible_cases: string[];
        gateway: string;
        security_clearance: string;
      }>(`/auth/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    getOfficers: () => request<any[]>(`/auth/officers`),
    getProfile: () => request<any>(`/auth/me`),
  },

  // 9. AI Copilot & Autonomous Agent Sandbox
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

  // 10. Forensic & Court-Ready Reports
  reports: {
    list: () => request<any[]>(`/reports`),
    generateCourtReport: (caseId: string, officerName?: string) =>
      request<any>(`/reports/generate`, {
        method: "POST",
        body: JSON.stringify({ caseId, officerName }),
      }),
    getById: (reportId: string) => request<any>(`/reports/${reportId}`),
  },

  // 11. Time Machine & Chronological Crime Reconstruction
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
    addEvent: (payload: {
      case_id: string;
      title: string;
      type?: string;
      category?: string;
      sub?: string;
      entities?: string;
      entitiesSub?: string;
      evidence?: string;
      evidenceType?: 'doc' | 'audio' | 'video' | 'geo' | 'hash';
      riskSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      timestamp?: string;
      properties?: Record<string, any>;
    }) =>
      request<any>(`/timeline/event`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // 12. Blockchain Explorer & Immutable Ledger
  blockchain: {
    getBlocks: (limit = 10) => request<any[]>(`/blockchain/blocks?limit=${limit}`),
    getBlockById: (id: string) => request<any>(`/blockchain/blocks/${id}`),
    verifyProof: (hash: string) =>
      request<any>(`/blockchain/verify`, {
        method: "POST",
        body: JSON.stringify({ hash }),
      }),
    getStats: () => request<any>(`/blockchain/stats`),
  },

  // 13. Audit Trail
  auditTrail: {
    getLogs: (params?: { module?: string; userId?: string; search?: string; limit?: number }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request<any[]>(`/audit-trail${qs}`);
    },
    logAction: (payload: {
      userId?: string;
      action: string;
      module: string;
      resourceId?: string;
      details?: Record<string, any>;
    }) =>
      request<any>(`/audit-trail/log`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getStats: () => request<any>(`/audit-trail/stats`),
  },

  // 14. Deception Network & Honeypot Telemetry
  deception: {
    getDecoys: () => request<any[]>(`/deception/decoys`),
    getIncidents: () => request<any[]>(`/deception/incidents`),
    deployDecoy: (payload: { name: string; type: string; location?: string }) =>
      request<any>(`/deception/deploy`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    simulate: (sensorId?: string) =>
      request<any>(`/deception/simulate`, {
        method: "POST",
        body: JSON.stringify({ sensorId }),
      }),
    getStats: () => request<any>(`/deception/stats`),
  },

  // 15. Identity Security & Biometrics
  identity: {
    getProfiles: () => request<any[]>(`/identity/profiles`),
    getProfile: (id: string) => request<any>(`/identity/profiles/${id}`),
    verify: (officerId: string) =>
      request<any>(`/identity/verify`, {
        method: "POST",
        body: JSON.stringify({ officerId }),
      }),
    escalate: (profileId: string, notes?: string) =>
      request<any>(`/identity/escalate`, {
        method: "POST",
        body: JSON.stringify({ profileId, notes }),
      }),
    getStats: () => request<any>(`/identity/stats`),
  },

  // 16. Attack Graph & Lateral Movement
  attackGraph: {
    getKillChain: () => request<any>(`/attack-graph/kill-chain`),
    isolate: (nodeId: string) =>
      request<any>(`/attack-graph/isolate`, {
        method: "POST",
        body: JSON.stringify({ nodeId }),
      }),
    getStats: () => request<any>(`/attack-graph/stats`),
  },

  // 17. Chain of Custody
  custody: {
    getAll: () => request<any[]>(`/custody`),
    getByEvidence: (evidenceId: string) => request<any[]>(`/custody/${evidenceId}`),
    logHandover: (payload: {
      evidenceId: string;
      handledById?: string;
      transferredToId?: string;
      action: string;
      notes?: string;
    }) =>
      request<any>(`/custody/handover`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};
