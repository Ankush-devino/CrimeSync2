// Team Member 2: Evidence Vault & Evidence DNA Model

export interface EvidenceDTO {
  id: string;
  caseId: string;
  type: 'digital' | 'physical' | 'forensic' | 'dna';
  title: string;
  hash: string; // SHA-256 / Keccak256 hash for integrity
  dnaSequence?: string;
  storageUrl: string;
  uploadedBy: string;
  verified: boolean;
  createdAt: string;
}

export class EvidenceModel {
  // Database schema / ORM model for evidence items
}
