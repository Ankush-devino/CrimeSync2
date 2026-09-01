// Team Member 2: Chain of Custody Model

export interface CustodyLogDTO {
  id: string;
  evidenceId: string;
  transferredFrom: string;
  transferredTo: string;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'disposed';
  reason: string;
  signature: string;
  timestamp: string;
  blockchainTxHash?: string;
}

export class CustodyModel {
  // Database schema / ORM model for chain of custody logs
}
