import type { FIRCase, AnalysisResult } from '../types/fir';

export const deceptiveFIRPayload: AnalysisResult = {
  id: 'FIR-2026-HYD-9942',
  suspectName: 'Dr. Armaan "Cipher" Qureshi',
  location: 'HITEC Cyber Towers, Hyderabad, TS',
  timestamp: '03:15 IST',
  biometricLocation: 'Electronic City Terminal, Bengaluru, KA',
  biometricTimestamp: '03:20 IST',
  reportingOfficer: 'ACP Devendra Singhania (Badge #HYD-CYB-9921)',
  firNumber: 'FIR/HYD/2026/9942',
  complainantName: 'National Financial Intelligence Unit (FIU-IND)',
  incidentDescription: 'High-frequency unauthorized intrusion into State Central Banking Gateway and automated ledger alteration reported in Hyderabad, while suspect authenticated via Aadhaar IRIS biometric terminal in Bengaluru 5 minutes later.',
  isCompromised: true,
  status: 'compromised',
  confidenceScore: 99,
  anomalySummary: 'Autonomous Doppelgänger AI engine flagged impossible physical travel: Suspect reported committing crime in Hyderabad at 03:15 IST, but Aadhaar IRIS biometric scan authenticated in Bengaluru at 03:20 IST (570km delta in 5 mins requiring 6,840 km/h kinematic velocity).',
  flaggedParameters: [
    'Crime Incident Geolocation: HITEC Cyber Towers, Hyderabad, TS (03:15 IST)',
    'Biometric Terminal Scan: Electronic City Terminal, Bengaluru, KA (03:20 IST)',
    'Kinematic Velocity Anomaly: 6,840 km/h required travel speed (Physical Impossibility)',
    'Identity Doppelgänger State: COMPROMISED (Biometric Collision & Geolocation Mismatch)',
    'NLP Narrative Syntax: 96% Synthetic LLM Structure Match (Automated Modus Operandi Generation)',
  ],
};

export const syntheticHoneypotFIRPayload: AnalysisResult = {
  id: 'CRS-2026-HNY-047',
  suspectName: 'satyakiran "Phantom" Sen',
  location: 'Anna Salai Substation, Chennai, TN',
  timestamp: '14:00 IST',
  biometricLocation: 'HITEC Cyber Towers, Hyderabad, TS',
  biometricTimestamp: '14:06 IST',
  reportingOfficer: 'ACP Devendra Singhania (Badge #CHE-CYB-0947)',
  firNumber: 'FIR/CHE/2026/0947',
  complainantName: 'State Deception & Counter-Forensics Bureau',
  incidentDescription: 'Autonomous Honeypot tripwire detected synthetic FIR filing: Suspect satyakiran reported physical server tampering in Chennai at 14:00 IST, but Aadhaar IRIS biometric terminal authentication registered in Hyderabad at 14:06 IST (630km delta in 6 mins requiring 6,300 km/h kinematic velocity).',
  isCompromised: true,
  status: 'compromised',
  confidenceScore: 99,
  anomalySummary: 'Autonomous Doppelgänger AI engine flagged impossible physical travel: Suspect satyakiran reported committing crime in Chennai at 14:00 IST, but Aadhaar IRIS biometric scan authenticated in Hyderabad at 14:06 IST (630km delta in 6 mins requiring 6,300 km/h kinematic velocity).',
  flaggedParameters: [
    'Identity Anomaly: Synthetic profile signature collision for satyakiran with archived dossier #NCRB-HYD-8812',
    'FIR Anomaly: 98% NLP Generative Model Syntax Match (Automated Modus Operandi Generation)',
    'Spatio-Temporal / CDR Anomaly: Chennai (14:00 IST) vs Hyderabad (14:06 IST) - 6,300 km/h required velocity',
    'Biometric Hash Collision: SHA-256 IRIS template match collision with inactive identity record',
    'Cross-Jurisdiction Conflict: Officer badge (#CHE-CYB-0947) registered to Chennai while biometric terminal located in Hyderabad',
  ],
};

export const nominalFIRPayload1: AnalysisResult = {
  id: 'FIR-2026-DEL-1022',
  suspectName: 'Rohan Malhotra',
  location: 'Connaught Place, New Delhi, DL',
  timestamp: '11:30 IST',
  biometricLocation: 'Connaught Place, New Delhi, DL',
  biometricTimestamp: '11:30 IST',
  reportingOfficer: 'SI Rajesh Kumar (Badge #DEL-CYB-1088)',
  firNumber: 'FIR/DEL/2026/1022',
  incidentDescription: 'Standard merchant gateway charge inquiry with valid physical authentication.',
  complainantName: 'Delhi Cyber Crime Cell',
  isCompromised: false,
  status: 'nominal',
  confidenceScore: 8,
  anomalySummary: 'Nominal profile: Spatio-temporal and biometric parameters within standard operational thresholds.',
  flaggedParameters: [],
};

export const nominalFIRPayload2: AnalysisResult = {
  id: 'FIR-2026-MUM-3041',
  suspectName: 'Vikramaditya Roy',
  location: 'Nariman Point, Mumbai, MH',
  timestamp: '16:45 IST',
  biometricLocation: 'Nariman Point, Mumbai, MH',
  biometricTimestamp: '16:45 IST',
  reportingOfficer: 'Inspector Neha Joshi (Badge #MUM-CYB-5521)',
  firNumber: 'FIR/MUM/2026/3041',
  incidentDescription: 'Routine corporate email spoofing investigation with verified credentials.',
  complainantName: 'Maharashtra Cyber Police',
  isCompromised: false,
  status: 'nominal',
  confidenceScore: 12,
  anomalySummary: 'Nominal profile: Verified location signatures match telemetry.',
  flaggedParameters: [],
};

export const mockFIRReports: AnalysisResult[] = [
  deceptiveFIRPayload,
  syntheticHoneypotFIRPayload,
  nominalFIRPayload1,
  nominalFIRPayload2,
];

// Helper: Filter to strictly return ONLY reports marked as compromised
export function getCompromisedFIRReports(): AnalysisResult[] {
  return mockFIRReports.filter(report => report.isCompromised === true);
}


