export type NodeType = 'suspect' | 'account' | 'phone' | 'vehicle' | 'location' | 'fir';
export type RelationType = 'CALLED' | 'TRANSFERRED_FUNDS' | 'CO_ACCUSED' | 'OPERATES' | 'MET_AT';
export type NodeStatus = 'active' | 'contained' | 'surveilled';

export interface CrimeNode {
  id: string;
  name: string;
  role: string; // e.g., 'Syndicate Kingpin', 'Hawala Operator', 'Burner SIM', 'Mule Account'
  type: NodeType;
  status: NodeStatus;
  riskScore: number; // 0 - 100
  hop: number; // 0 (Ground Zero), 1, 2, 3
  details: {
    phone?: string;
    accountNumber?: string;
    firNumber?: string;
    location?: string;
    lastActive?: string;
    bankName?: string;
    amount?: string;
    vehicleNumber?: string;
    notes?: string;
  };
}

export interface CrimeEdge {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  label: string; // e.g., '42 calls in 7 days', '₹15,00,000 Hawala'
  weight: number;
}

export interface PlaybookAction {
  id: string;
  targetNodeId: string;
  targetNodeName: string;
  actionType: 'LOC' | 'FREEZE_ACCOUNT' | 'TELECOM_TAP' | 'SECTION_91' | 'RAID_SEIZE';
  title: string;
  timestamp: string;
  officer: string;
  status: 'EXECUTED' | 'PENDING';
  impactDescription: string;
}

export interface DisruptionMetrics {
  disruptionRate: number;
  severedEdgeCount: number;
  totalEdgeCount: number;
  containedNodeCount: number;
  totalNodeCount: number;
  isolatedNodeCount: number;
  frozenAssetsValue: number;
  activeContagionPaths: number;
}

export interface FocalSuspectOption {
  id: string;
  name: string;
  alias: string;
  syndicate: string;
  jurisdiction: string;
  riskScore: number;
  totalSyndicateEntities: number;
}
