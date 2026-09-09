// Evidence Vault & Evidence DNA Models

export interface EvidenceDTO {
  id: string;
  caseId: string;
  type: 'digital' | 'physical' | 'forensic' | 'dna';
  title: string;
  hash: string; // SHA-256 / Keccak256 hash for integrity
  dnaSequence?: string;
  storageUrl?: string;
  uploadedBy?: string;
  verified: boolean;
  createdAt: string;
}

export interface DnaMatchItem {
  id: string;
  targetEvidenceId: string;
  targetFileName: string;
  similarity: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  caseRef: string;
  suspect: string;
  matchType: string;
}

export interface EvidenceDnaProfile {
  id: string;
  evidenceId: string;
  caseId: string;
  caseTitle?: string;
  firNumber?: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sha256: string;
  blake3Hash?: string;
  keccak256Hash?: string;
  aiFingerprint: string;
  createdOn: string;
  integrityStatus: 'Verified' | 'Tampered' | 'Pending';
  matchScore: number;
  algorithm: string;
  blockHeight: number;
  txHash: string;
  merkleRoot: string;
  highConfidenceCount: number;
  medConfidenceCount: number;
  lowConfidenceCount: number;
  noMatchCount: number;
  matches: DnaMatchItem[];
}

export interface DnaStats {
  totalEvidence: number;
  dnaProfilesGenerated: number;
  matchedProfiles: number;
  verifiedIntegrity: number;
  tamperedAlerts: number;
  crossCaseMatchesCount: number;
  averageSimilarity: number;
  blockchainAnchorConsensus: string;
}

export interface DnaVerificationResult {
  evidenceId: string;
  dnaFingerprint: string;
  sha256Hash: string;
  merkleRoot: string;
  blockHeight: number;
  txHash: string;
  contractAddress: string;
  validatorNodes: number;
  isTamperFree: boolean;
  timestamp: string;
  zkProof: string;
  status: string;
}

export interface Section65bCertificateData {
  certificateId: string;
  caseId: string;
  firNumber: string;
  evidenceId: string;
  evidenceName: string;
  dnaFingerprint: string;
  sha256Hash: string;
  merkleRoot: string;
  blockHeight: number;
  issuedTo: string;
  investigatingOfficer: string;
  officerBadge: string;
  department: string;
  certifyingAuthority: string;
  issuedAt: string;
  legalAct: string;
  status: string;
}
