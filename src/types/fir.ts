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
}

export interface AnalysisResult extends FIRCase {
  isCompromised: boolean;
  status?: 'compromised' | 'nominal';
  flaggedParameters: string[];
  confidenceScore?: number;
  anomalySummary?: string;
  firCase?: FIRCase;
}

