export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';

export interface StatMetric {
  id: string;
  title: string;
  value: string;
  changeText: string;
  changeType: 'positive' | 'negative' | 'critical' | 'neutral';
  icon: string;
  theme: 'cyan' | 'purple' | 'red' | 'emerald' | 'teal' | 'amber';
}

export interface NetworkNode {
  id: string;
  label: string;
  category: 'People' | 'Phones' | 'Vehicles' | 'Locations' | 'Accounts' | 'Organisations' | 'Events';
  risk: 'HIGH' | 'LOW' | 'MEDIUM';
  riskScore?: number;
  icon?: string;
  x: number; // percentage in graph canvas
  y: number;
  avatar?: string;
  details?: {
    role?: string;
    phone?: string;
    vehicleNumber?: string;
    location?: string;
    notes?: string;
  };
}

export interface NetworkEdge {
  from: string;
  to: string;
  relation: string;
  isHighRisk?: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  target: string;
  time: string;
  severity: Severity;
  iconType: 'lock' | 'shield' | 'export' | 'key' | 'user';
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  category: 'call' | 'transaction' | 'location' | 'cctv' | 'alert';
}

export interface HoneyTrigger {
  id: string;
  resource: string;
  accessor: string;
  time: string;
  severity: Severity;
}

export type DecoyType = 
  | 'honey_document' 
  | 'ghost_database' 
  | 'canary_token' 
  | 'fake_endpoint' 
  | 'stego_media' 
  | 'iam_credential';

export type { AccessLog, CompromisedFile } from './fir';
import type { AccessLog, CompromisedFile } from './fir';

export type DecoyAccessLog = AccessLog;

export interface DeceptionAsset {
  id: string;
  name: string;
  type: DecoyType;
  categoryLabel: string;
  caseId: string;
  status: DecoyStatus;
  deploymentDate: string;
  targetFolder: string;
  accessCount: number;
  lastTriggered?: string;
  accessedBy?: string;
  accessTimestamp?: string;
  accessLogs?: DecoyAccessLog[];
  stegoWatermarkId?: string;
  fingerprintHash: string;
  fakePayloadPreview?: string;
  radarX: number; // percentage in radar coordinate system
  radarY: number; // percentage in radar coordinate system
  sensitivity: 'Low' | 'Standard' | 'Ultra-High';
  containmentPolicy: string;
}

export interface TripwireIncident {
  id: string;
  incidentRef: string;
  timestamp: string;
  decoyId: string;
  decoyName: string;
  decoyType: DecoyType;
  severity: Severity;
  accessorBadge: string;
  accessorName: string;
  accessorRole: string;
  accessorUnit: string;
  sourceIp: string;
  deviceUuid: string;
  geoLocation: string;
  attackVector: string;
  exfiltrationMethod: string;
  sha256Proof: string;
  watermarkMatched: boolean;
  watermarkRecipient?: string;
  containmentStatus: 'CONTAINED' | 'ACTION_REQUIRED' | 'UNDER_SURVEILLANCE' | 'ISOLATED';
  containmentNotes?: string;
}

export interface InsiderThreatProfile {
  id: string;
  badgeNumber: string;
  officerName: string;
  rank: string;
  department: string;
  threatScore: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  avatar?: string;
  trippedHoneypotsCount: number;
  lastActive: string;
  status: 'SUSPENDED' | 'UNDER_SURVEILLANCE' | 'RESTRICTED' | 'ACTIVE';
  exfiltratedAssets: string[];
  stealthNotes: string;
}

export interface StegoWatermarkPayload {
  token: string;
  officerBadge: string;
  officerName: string;
  timestamp: string;
  caseRef: string;
  invisibleZeroWidthSequence: string;
  sha256Signature: string;
  integrityVerified: boolean;
}

export type BlastNodeType = 
  | 'workstation' 
  | 'server' 
  | 'database' 
  | 'router' 
  | 'cloud_service' 
  | 'officer_identity' 
  | 'case_folder' 
  | 'evidence_vault';

export type CompromiseStatus = 
  | 'GROUND_ZERO' 
  | 'COMPROMISED' 
  | 'HIGH_RISK_EXPOSED' 
  | 'CONTAINED_SHIELDED' 
  | 'UNAFFECTED';

export interface BlastNode {
  id: string;
  name: string;
  type: BlastNodeType;
  categoryLabel: string;
  ip: string;
  subnet: string;
  hopDistance: 0 | 1 | 2 | 3;
  compromiseStatus: CompromiseStatus;
  riskScore: number; // 0 - 100
  ownerOrService: string;
  department: string;
  linkedCases: string[];
  vulnerabilityVector: string;
  containmentStatus: 'AIRGAPPED' | 'ACTIVE_MONITORED' | 'VULNERABLE' | 'REVOKED';
  x: number; // percentage in visualizer canvas (0 - 100)
  y: number; // percentage in visualizer canvas (0 - 100)
  shockwaveRadius?: number;
  credentialsExposed?: number;
  dataVolumeExposed?: string;
}

export interface BlastEdge {
  id: string;
  from: string;
  to: string;
  protocol: string;
  port: number;
  isCompromisedPivot: boolean;
  pivotMethod?: string;
  trafficVolume?: string;
}

export interface KillChainStep {
  id: string;
  stepNumber: number;
  timestamp: string;
  title: string;
  sourceNode: string;
  targetNode: string;
  vector: string;
  technique: string;
  mitreAttackId: string;
  severity: Severity;
  status: 'ACTIVE_PIVOT' | 'CONTAINED' | 'BLOCKED';
  containmentAction: string;
}

export interface CircuitBreakerPolicy {
  id: string;
  name: string;
  targetSubnetOrAsset: string;
  triggerCondition: string;
  actionTaken: string;
  status: 'ARMED' | 'TRIGGERED' | 'STANDBY';
  autoEngage: boolean;
  isolationProtocol: string;
}

export interface RemediationTask {
  id: string;
  stepNumber: number;
  title: string;
  category: 'IDENTITY' | 'NETWORK' | 'DATABASE' | 'FORENSICS' | 'COMPLIANCE';
  priority: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  assignedTo: string;
  estimatedTime: string;
  automatedScript?: string;
}

export type AiAgentStatus = 
  | 'EXECUTING' 
  | 'IDLE' 
  | 'SUSPICIOUS_PROBE' 
  | 'CONTAINED_QUARANTINED' 
  | 'ESCAPE_PREVENTED';

export type AiAgentType = 
  | 'FORENSIC_REASONER' 
  | 'REDTEAM_ADVERSARY' 
  | 'GRAPH_SYNTHESIZER' 
  | 'TELECOM_EXTRACTOR' 
  | 'FUZZER' 
  | 'BIOMETRIC_DECODER';

export interface AiAgent {
  id: string;
  name: string;
  role: string;
  type: AiAgentType;
  modelBackbone: string;
  status: AiAgentStatus;
  cpuUsage: number; // percentage (0 - 100)
  memoryUsage: string; // e.g. "1.8 GB / 4.0 GB"
  vramUsage: string; // e.g. "6.2 GB"
  tokensPerSec: number;
  totalTokensProcessed: string;
  sandboxIsolationLevel: 'GVISOR_STRICT' | 'MICROVM_FIRECRACKER' | 'EBPF_FILTERED';
  activeToolCalls: string[];
  systemPrompt: string;
  thoughtStream: string[];
  permissions: string[];
  lastActivity: string;
  containerUuid: string;
  riskRating: number; // 0 - 100
}

export interface EscapeIncident {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  vector: string;
  syscallAttempted: string;
  destinationTarget: string;
  severity: Severity;
  mitigationStatus: 'PREVENTED_BY_EBPF' | 'CONTAINER_KILLED' | 'UNDER_ANALYSIS';
  eBpfRuleApplied: string;
}

export interface RedTeamSimulation {
  id: string;
  title: string;
  targetSurface: string;
  attackVector: string;
  simulatedAdversary: string;
  defenseScore: number; // 0 - 100
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  stepsExecuted: {
    step: number;
    description: string;
    result: 'BLOCKED' | 'EVADED' | 'HONEYPOT_TRAPPED';
  }[];
  mitigationRecommendation: string;
}

export interface AgentArtifact {
  id: string;
  title: string;
  category: 'HAWALA_GRAPH' | 'AUDIO_TRANSCRIPT' | 'CALL_CORRELATION' | 'COURT_DOSSIER';
  agentName: string;
  timestamp: string;
  previewContent: string;
  sha256Proof: string;
  caseRef: string;
  courtAdmissible: boolean;
}

export interface SandboxPolicy {
  id: string;
  name: string;
  category: 'SYSCALL' | 'NETWORK' | 'FILESYSTEM' | 'MEMORY';
  rule: string;
  status: 'ENFORCED' | 'ALERT_ONLY' | 'DISABLED';
  strictEnforcement: boolean;
}

export type AlertCategory = 
  | 'INTRUSION' 
  | 'DATA_LEAK' 
  | 'INSIDER' 
  | 'HONEYPOT' 
  | 'MALWARE' 
  | 'IDENTITY';

export type AlertStatus = 
  | 'NEW' 
  | 'ACKNOWLEDGED' 
  | 'INVESTIGATING' 
  | 'CONTAINED' 
  | 'DISMISSED';

export interface SiemAlert {
  id: string;
  title: string;
  severity: Severity;
  category: AlertCategory;
  status: AlertStatus;
  timestamp: string;
  sourceIp: string;
  destinationTarget: string;
  sourceMac?: string;
  geoLocation: string;
  mitreAttackId: string;
  mitreTechnique: string;
  attackVector: string;
  payloadHash: string;
  correlatedCaseRef: string;
  assignedInvestigator: string;
  rawPcapSummary?: string;
  automatedContainmentAvailable: boolean;
  threatScore: number; // 0 - 100
}

export interface ThreatCampaign {
  id: string;
  name: string;
  threatActor: string;
  status: 'ACTIVE_CAMPAIGN' | 'MONITORED' | 'NEUTRALIZED';
  severity: Severity;
  activeAlertsCount: number;
  firstSeen: string;
  lastSeen: string;
  primaryVector: string;
  targetAssetSummary: string;
  overallThreatScore: number; // 0 - 100
  correlatedIocs: string[];
}

export interface ThreatActorDossier {
  id: string;
  name: string;
  alias: string;
  origin: string;
  threatTier: 'TIER_1_ADVANCED' | 'TIER_2_ORGANIZED' | 'TIER_3_OPPORTUNISTIC';
  knownTtps: string[];
  targetSectors: string[];
  activeCampaignsCount: number;
  attributionConfidence: number; // 0 - 100%
  description: string;
  primaryMotives: string[];
}

export interface SoarPlaybook {
  id: string;
  name: string;
  triggerCondition: string;
  actionPipeline: string[];
  automatedExecution: boolean;
  status: 'ENABLED' | 'TEST_MODE' | 'PAUSED';
  executionsCount: number;
  lastTriggered: string;
}

export interface SiemConnectorHealth {
  id: string;
  connectorName: string;
  type: 'IDS_IPS' | 'EDR_AGENT' | 'CLOUD_TRAIL' | 'FIREWALL' | 'HONEYPOT_MESH';
  status: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
  eventsPerSecond: number;
  latencyMs: number;
  bufferUtilization: number; // 0 - 100%
  lastSync: string;
}

// ==========================================
// LEAN THREAT ALERTS & INSIDER WATCHDOGS
// ==========================================

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type VulnerabilityStatus = 'VULNERABLE' | 'PATCHING' | 'PATCHED';

export interface PlatformVulnerability {
  id: string;
  cveId: string;
  title: string;
  targetComponent: 'Web Frontend' | 'Express REST API' | 'Neon PostgreSQL' | 'AuraDB Neo4j' | 'Auth & Sessions';
  severity: VulnerabilitySeverity;
  status: VulnerabilityStatus;
  description: string;
  patchActionLabel: string;
  impactDescription: string;
  cvssScore: number; // e.g. 9.1
}

export type OfficerWatchdogType = 
  | 'EVIDENCE_TAMPER' 
  | 'CANARY_TRAP' 
  | 'BULK_EXPORT' 
  | 'DEVICE_HIJACK';

export interface OfficerAuditStep {
  time: string;
  action: string;
  detail: string;
  ip: string;
  device: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
}

export interface SuspiciousOfficerWatchdog {
  id: string;
  officerId: string;
  officerName: string;
  badgeNumber: string;
  rank: string;
  department: string;
  jurisdictionCity: string;
  avatarUrl?: string;
  watchdogType: OfficerWatchdogType;
  threatTitle: string;
  riskScore: number; // 0 - 100
  timeAgo: string;
  timestamp: string;
  caseRef: string;
  caseTitle: string;
  status: 'ACTIVE_FLAG' | 'CONTAINED' | 'DISMISSED';
  actionTaken?: string;
  summary: string;
  primaryActionLabel: string;
  primaryActionType: 'FREEZE_LEDGER' | 'FLAG_MOLE' | 'BLOCK_EXPORT' | 'KILL_SESSION';
  forensicEvidence: {
    targetResource: string;
    anomalyMetric: string;
    ipAddress: string;
    deviceFingerprint: string;
    geolocation: string;
  };
  auditTrail: OfficerAuditStep[];
}

