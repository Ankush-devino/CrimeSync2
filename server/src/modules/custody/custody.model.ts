// Team Member 2: Chain of Custody Model & DTOs

export type CustodyAction =
  | 'COLLECTED'
  | 'TRANSFERRED'
  | 'ANALYZED'
  | 'SEALED'
  | 'STORED'
  | 'AUDITED'
  | 'SUBMITTED_TO_COURT'
  | 'RELEASED';

export interface CustodyStepDTO {
  id: string;
  evidenceId: string;
  evidenceTitle?: string;
  action: CustodyAction;
  actionColor?: string;
  circleColor?: string;
  iconType?: 'user' | 'lab' | 'lock' | 'camera' | 'shield';
  actorName: string;
  actorRole: string;
  actorBadge: string;
  location: string;
  timestamp: string;
  txHash: string;
  signature: string;
  publicKey?: string;
  notes?: string;
  verifiedOnChain: boolean;
  blockNumber?: number;
  merkleProof?: string[];
}

export interface CustodyItemDTO {
  id: string;
  evidenceId: string;
  evidenceName: string;
  evidenceType: string;
  caseRef: string;
  currentCustodian: string;
  custodianRole: string;
  currentLocation: string;
  status: 'In Custody' | 'In Transit' | 'In Court' | 'Archived';
  integrityStatus: 'Verified' | 'Flagged';
  complianceScore: number;
  totalHandovers: number;
  totalCustodians: number;
  breaksInChain: number;
  lastUpdated: string;
  sealHash: string;
  blockHeight?: number;
  steps: CustodyStepDTO[];
}

export interface CustodyStatsDTO {
  totalTransactions: number;
  evidenceItems: number;
  custodyHolders: number;
  pendingTransfers: number;
  complianceScore: number;
  unbrokenChainPercent: number;
  activeValidators: number;
  latestBlock: number;
}

export interface CustodyVerificationResultDTO {
  evidenceId: string;
  isTamperFree: boolean;
  complianceScore: number;
  totalStepsVerified: number;
  merkleRoot: string;
  latestTxHash: string;
  sealHash: string;
  breaksInChain: number;
  zkSnarkProof: string;
  verificationTimestamp: string;
  status: 'CHAIN_VERIFIED_SECURE' | 'TAMPER_ALERT';
  message: string;
}

export interface CustodyManifestDTO {
  manifestId: string;
  form65BCertificate: string;
  evidenceId: string;
  evidenceName: string;
  caseRef: string;
  leadOfficer: string;
  leadOfficerBadge: string;
  complianceStatus: string;
  digitalSealHash: string;
  merkleRoot: string;
  blockHeight: number;
  totalHandovers: number;
  steps: CustodyStepDTO[];
  qrPayload: string;
  generatedAt: string;
  signingAuthority: string;
}
