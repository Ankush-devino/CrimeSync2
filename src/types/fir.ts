export interface AccessLog {
  user: string;
  timestamp: string;
  action: string;
  role?: string;
  ip?: string;
}

export interface CompromisedFile {
  id: string;
  fileName: string;
  fileType: string;
  accessLogs: AccessLog[];
  radarX?: number;
  radarY?: number;
  fileSize?: string;
  sensitivity?: 'Low' | 'Standard' | 'Ultra-High';
  sha256Proof?: string;
  targetFolder?: string;
}

export interface FIRCase {
  id: string;
  suspectName: string;
  location: string;
  timestamp: string;
  biometricLocation: string;
  reportingOfficer: string;
  firNumber?: string;
  incidentDescription?: string;
  complainantName?: string;
  biometricTimestamp?: string;
  isCompromised: boolean;
  compromisedFiles?: CompromisedFile[];
}

export interface AnalysisResult extends FIRCase {
  isCompromised: boolean;
  compromisedFiles?: CompromisedFile[];
  status?: 'compromised' | 'nominal';
  flaggedParameters: string[];
  confidenceScore?: number;
  anomalySummary?: string;
  firCase?: FIRCase;
}
