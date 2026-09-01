// Team Member 3: Threat Alerts Data Model

export interface ThreatAlertDTO {
  id: string;
  sourceIp: string;
  threatType: 'ransomware' | 'data_exfiltration' | 'ddos' | 'zero_day' | 'insider_threat';
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitreTechniqueId?: string;
  confidenceScore: number;
  status: 'active' | 'investigating' | 'mitigated' | 'false_positive';
  detectedAt: string;
}

export class ThreatModel {
  // Threat detection & telemetry log schema
}
