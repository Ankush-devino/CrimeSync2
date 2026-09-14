import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Shield,
  ShieldAlert,
  Radio,
  FileText,
  Database,
  Key,
  Globe,
  Video,
  Search,
  Plus,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Fingerprint,
  UserCheck,
  UserX,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Maximize2,
  Flame,
  Check,
  X,
  Copy
} from 'lucide-react';
import {
  deceptionMetricsData,
  deceptionAssetsData,
  tripwireIncidentsData,
  insiderThreatsData,
  stegoWatermarkSamples,
} from '../data/mockData';
import { printCourtDossier } from '../utils/courtDossierPrinter';
import { buildDossierForCase } from '../services/dossierService';
import { ALL_CASES, type LawCase } from '../constants/cases';
import { useCaseContext } from '../context/CaseContext';
import { CaseSelector } from '../components/CaseSelector';
import type {
  DeceptionAsset,
  TripwireIncident,
  DecoyType,
  DecoyStatus,
  Severity,
  CompromisedFile,
  AccessLog,
} from '../types/dashboard';

// Registry of case-tailored deception assets & incidents
const CASE_DECEPTION_REGISTRY: Record<string, { assets: DeceptionAsset[]; incidents: TripwireIncident[] }> = {
  'CASE-2026-002': {
    assets: [
      {
        id: 'case-002-decoy-1',
        name: 'SCADA_KALWA_400KV_GATEWAY_CONFIG.pdf',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CASE-2026-002',
        status: 'TRIPPED',
        deploymentDate: '24 Aug 2026',
        targetFolder: '/vault/evidence/scada_telemetry/mumbai_grid/',
        accessCount: 5,
        lastTriggered: '11:14 PM (Today)',
        accessedBy: 'SI-7740 (SI Vikramaditya Reddy)',
        accessTimestamp: '2026-09-14 23:14:02 IST',
        accessLogs: [
          { user: 'SI Vikramaditya Reddy (SI-7740)', timestamp: '2026-09-14 23:14:02 IST', role: 'Investigative Officer', ip: '115.242.18.94', action: 'OFF_GRID_FILE_DOWNLOAD' },
          { user: 'SI Vikramaditya Reddy (SI-7740)', timestamp: '2026-09-14 23:12:15 IST', role: 'Investigative Officer', ip: '115.242.18.94', action: 'AUTH_KEY_REQUEST' },
        ],
        stegoWatermarkId: 'STG-TARIQ-4491-Z',
        fingerprintHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        fakePayloadPreview: 'FABRICATED: Contains fake Modbus TCP/502 register addresses and dummy Kalwa grid substation breaker IDs.',
        radarX: 42,
        radarY: 34,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Auto-silent memory dump + IP trace + Telegram exfil beacon kill',
      },
      {
        id: 'case-002-decoy-2',
        name: 'pg_decoy://scada_telemetry_bus:5432',
        type: 'ghost_database',
        categoryLabel: 'Ghost Database Table',
        caseId: 'CASE-2026-002',
        status: 'TRIPPED',
        deploymentDate: '21 Aug 2026',
        targetFolder: 'db.crimesync.internal/scada_dispatch/staging',
        accessCount: 14,
        lastTriggered: '11:22 PM (Today)',
        accessedBy: 'EXT-ADVERSARY-99 (194.26.29.112)',
        accessTimestamp: '2026-09-14 23:22:18 IST',
        accessLogs: [
          { user: 'EXT-ADVERSARY-99 (194.26.29.112)', timestamp: '2026-09-14 23:22:18 IST', role: 'External APT Actor', ip: '194.26.29.112', action: 'SQLI_TELEMETRY_DUMP' },
          { user: 'EXT-ADVERSARY-99 (194.26.29.112)', timestamp: '2026-09-14 23:21:04 IST', role: 'External APT Actor', ip: '194.26.29.112', action: 'MODBUS_PORT_PROBE' },
        ],
        fingerprintHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        fakePayloadPreview: 'GHOST SCHEMA: 8 simulated transformer load feeds with decoy telemetry commands matching CVE-2026-8812.',
        radarX: 68,
        radarY: 28,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Delay query response by 3s, record SQL fingerprint, auto-lock DB session',
      },
      {
        id: 'case-002-decoy-3',
        name: 'AWS_CANARY_POWERGRID_IAM_KEY',
        type: 'iam_credential',
        categoryLabel: 'Canary Cloud Token',
        caseId: 'CASE-2026-002',
        status: 'ARMED',
        deploymentDate: '15 Aug 2026',
        targetFolder: '.aws/credentials on Tariq Workstation',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '7b91d90a980998f4803b91a7889ff0189d98e8432a9010049281a8c9098711ef',
        fakePayloadPreview: 'CANARY TOKEN: AKIA99POWERGRID2026. Trips AWS CloudWatch Canary immediately upon STS GetCallerIdentity.',
        radarX: 78,
        radarY: 62,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Instant revoke officer session + SMS broadcast to Chief Cyber Warden',
      },
      {
        id: 'case-002-decoy-4',
        name: 'CDR_TARIQ_QURESHI_BURNER_DECOY.xlsx',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CASE-2026-002',
        status: 'TRIPPED',
        deploymentDate: '26 Aug 2026',
        targetFolder: '/intelligence/telecom_dumps/mumbai_bkc/',
        accessCount: 3,
        lastTriggered: '10:55 PM (Today)',
        accessedBy: 'SI-4091 (Inspector Priya Kulkarni)',
        accessTimestamp: '2026-09-14 22:55:10 IST',
        accessLogs: [
          { user: 'Inspector Priya Kulkarni (SI-4091)', timestamp: '2026-09-14 22:55:10 IST', role: 'Cyber Intelligence Inspector', ip: '10.240.4.18', action: 'DIRECT_CDR_DOWNLOAD' },
        ],
        stegoWatermarkId: 'STG-MUM-9912-Q',
        fingerprintHash: '1a90c298018ef902b4890c91823abce809182470129a01f98109340982481023',
        fakePayloadPreview: 'SPOOFED CDR: 42 fake burner calls mapped to honey BTS towers in Bandra-Kurla Complex with geo-beacon webhooks.',
        radarX: 30,
        radarY: 66,
        sensitivity: 'Standard',
        containmentPolicy: 'Silently embed zero-width watermark matching downloader badge ID',
      },
      {
        id: 'case-002-decoy-5',
        name: 'api.crimesync.internal/v2/scada/kalwa_telemetry_stream',
        type: 'fake_endpoint',
        categoryLabel: 'Ghost REST Endpoint',
        caseId: 'CASE-2026-002',
        status: 'ARMED',
        deploymentDate: '20 Aug 2026',
        targetFolder: 'API Gateway / SCADA Mesh',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '8910492810a9c8012894b91029381029c0192840192834019283401928340192',
        fakePayloadPreview: 'SYNTHETIC PACKETS: Emits simulated DNP3/Modbus packet streams to detect unauthorized network sniffers.',
        radarX: 52,
        radarY: 82,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Port-mirror traffic, capture full PCAP dump, isolate switch port',
      },
      {
        id: 'case-002-decoy-6',
        name: 'CCTV_KALWA_400KV_CONTROL_ROOM_CAM04.mp4',
        type: 'stego_media',
        categoryLabel: 'Steganographic Video Trap',
        caseId: 'CASE-2026-002',
        status: 'ARMED',
        deploymentDate: '27 Aug 2026',
        targetFolder: '/evidence/cctv_vault/mumbai_grid/',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        stegoWatermarkId: 'STG-CCTV-002-MUM',
        fingerprintHash: '9840192834019283401928340192834019283401928340192834019283401928',
        fakePayloadPreview: 'STEGANOGRAPHIC VIDEO: High-bitrate 1080p surveillance video with embedded zero-width steganographic officer watermarks.',
        radarX: 22,
        radarY: 42,
        sensitivity: 'Standard',
        containmentPolicy: 'Extract frame LSB watermark, cross-reference duty roster',
      },
    ],
    incidents: [
      {
        id: 'inc-002-1',
        incidentRef: 'TRIP-2026-4401',
        timestamp: '11:22 PM (Today)',
        decoyId: 'case-002-decoy-2',
        decoyName: 'pg_decoy://scada_telemetry_bus:5432',
        decoyType: 'ghost_database',
        severity: 'CRITICAL',
        accessorBadge: 'EXT-ADVERSARY-99',
        accessorName: 'Adversary (IP: 194.26.29.112)',
        accessorRole: 'External APT Actor',
        accessorUnit: 'Bulgarian Relay Host',
        sourceIp: '194.26.29.112',
        deviceUuid: 'UNKNOWN-APT-SCANNER',
        geoLocation: 'Bulgaria (Cobalt Strike C2)',
        attackVector: 'Port 502 Modbus / SCADA exploit probe',
        exfiltrationMethod: 'SQL injection on simulated telemetry bus',
        sha256Proof: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        watermarkMatched: true,
        watermarkRecipient: 'Kalwa Grid Control Security',
        containmentStatus: 'CONTAINED',
        containmentNotes: 'eBPF socket filter airgapped communication pipeline instantly.',
      },
      {
        id: 'inc-002-2',
        incidentRef: 'TRIP-2026-4402',
        timestamp: '11:14 PM (Today)',
        decoyId: 'case-002-decoy-1',
        decoyName: 'SCADA_KALWA_400KV_GATEWAY_CONFIG.pdf',
        decoyType: 'honey_document',
        severity: 'CRITICAL',
        accessorBadge: 'SI-7740',
        accessorName: 'SI Vikramaditya Reddy',
        accessorRole: 'Investigative Officer',
        accessorUnit: 'CID Financial Fraud',
        sourceIp: '115.242.18.94 (Off-Grid Commercial IP)',
        deviceUuid: 'MAC: E4:5F:01:8A:22:9C',
        geoLocation: 'Hyderabad, TS',
        attackVector: 'Direct download of classified SCADA gateway dossier',
        exfiltrationMethod: 'Off-grid residential IP file download',
        sha256Proof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        watermarkMatched: true,
        watermarkRecipient: 'SI Vikramaditya Reddy (HYD-CID-7740)',
        containmentStatus: 'ACTION_REQUIRED',
        containmentNotes: 'Tripwire alert dispatched to Central Oversight Cell.',
      },
    ],
  },
  'CASE-2026-001': {
    assets: [
      {
        id: 'case-001-decoy-1',
        name: 'HAWALA_VIP_LEDGER_CONFIDENTIAL.xlsx',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CASE-2026-001',
        status: 'TRIPPED',
        deploymentDate: '24 Aug 2026',
        targetFolder: '/vault/evidence/confidential/delhi-syndicate/',
        accessCount: 6,
        lastTriggered: '10:21 PM (Today)',
        accessedBy: 'ACP-23 (ACP Rajeshwar Sharma)',
        accessTimestamp: '2026-09-14 22:21:45 IST',
        accessLogs: [
          { user: 'ACP Rajeshwar Sharma (ACP-23)', timestamp: '2026-09-14 22:21:45 IST', role: 'Supervisory Officer', ip: '10.240.8.21', action: 'LOCAL_EXPORT' },
          { user: 'ACP Rajeshwar Sharma (ACP-23)', timestamp: '2026-09-14 22:19:10 IST', role: 'Supervisory Officer', ip: '10.240.8.21', action: 'DIRECT_FILE_OPEN' },
        ],
        stegoWatermarkId: 'STG-ACP23-9981-Z',
        fingerprintHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        fakePayloadPreview: 'FABRICATED: Contains fake swiss banking swift routes and dummy safehouse coordinates in Connaught Place.',
        radarX: 38,
        radarY: 30,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Auto-silent memory dump + IP trace + Telegram exfil beacon kill',
      },
      {
        id: 'case-001-decoy-2',
        name: 'pg_decoy://mule_accounts_ledger:5432',
        type: 'ghost_database',
        categoryLabel: 'Ghost Database Table',
        caseId: 'CASE-2026-001',
        status: 'TRIPPED',
        deploymentDate: '21 Aug 2026',
        targetFolder: 'db.crimesync.internal/banking_lake/staging',
        accessCount: 12,
        lastTriggered: '10:36 PM (Today)',
        accessedBy: 'EXT-ADVERSARY-99 (194.26.29.112)',
        accessTimestamp: '2026-09-14 22:36:12 IST',
        accessLogs: [
          { user: 'EXT-ADVERSARY-99 (194.26.29.112)', timestamp: '2026-09-14 22:36:12 IST', role: 'External APT Actor', ip: '194.26.29.112', action: 'SQL_ENUMERATION' },
        ],
        fingerprintHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        fakePayloadPreview: 'GHOST SCHEMA: 14 fake bank accounts containing decoy INR balances tied to synthetic PAN numbers.',
        radarX: 72,
        radarY: 24,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Delay query response by 3s, record SQL fingerprint, auto-lock DB session',
      },
      {
        id: 'case-001-decoy-3',
        name: 'AWS_CANARY_IAM_KEY_CRIMESYNC_BACKUP',
        type: 'iam_credential',
        categoryLabel: 'Canary Cloud Token',
        caseId: 'CASE-2026-001',
        status: 'ARMED',
        deploymentDate: '15 Aug 2026',
        targetFolder: '.aws/credentials on Investigator Workstations',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '7b91d90a980998f4803b91a7889ff0189d98e8432a9010049281a8c9098711ef',
        fakePayloadPreview: 'CANARY TOKEN: AKIA99HONEYCRIME2026. Trips AWS CloudWatch Canary immediately upon STS GetCallerIdentity.',
        radarX: 82,
        radarY: 58,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Instant revoke officer session + SMS broadcast to Chief Cyber Warden',
      },
      {
        id: 'case-001-decoy-4',
        name: 'CDR_HARSH_SINGHANIA_BURNER_DECOY.xlsx',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CASE-2026-001',
        status: 'TRIPPED',
        deploymentDate: '26 Aug 2026',
        targetFolder: '/intelligence/telecom_dumps/south_delhi/',
        accessCount: 2,
        lastTriggered: '10:28 PM (Today)',
        accessedBy: 'SI-17 (SI Aman Khan)',
        accessTimestamp: '2026-09-14 22:28:04 IST',
        accessLogs: [
          { user: 'SI Aman Khan (SI-17)', timestamp: '2026-09-14 22:28:04 IST', role: 'Investigative Sub-Inspector', ip: '10.240.6.14', action: 'FILE_STREAM_READ' },
        ],
        stegoWatermarkId: 'STG-INS17-4402-Q',
        fingerprintHash: '1a90c298018ef902b4890c91823abce809182470129a01f98109340982481023',
        fakePayloadPreview: 'SPOOFED CDR: 35 fake burner calls mapped to honey BTS towers in Chandni Chowk with geo-beacon webhooks.',
        radarX: 26,
        radarY: 62,
        sensitivity: 'Standard',
        containmentPolicy: 'Silently embed zero-width watermark matching downloader badge ID',
      },
      {
        id: 'case-001-decoy-5',
        name: 'api.crimesync.internal/v2/wiretaps/dubai_angadia_stream',
        type: 'fake_endpoint',
        categoryLabel: 'Ghost REST Endpoint',
        caseId: 'CASE-2026-001',
        status: 'ARMED',
        deploymentDate: '20 Aug 2026',
        targetFolder: 'API Gateway / Internal Routing Mesh',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '8910492810a9c8012894b91029381029c0192840192834019283401928340192',
        fakePayloadPreview: 'SYNTHETIC AUDIO: Generates simulated VOIP raw pings to identify unauthorized packet sniffing within HQ LAN.',
        radarX: 48,
        radarY: 80,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Port-mirror traffic, capture full PCAP dump, isolate switch port',
      },
      {
        id: 'case-001-decoy-6',
        name: 'CCTV_KAROL_BAGH_CASH_VAULT_CAM02.mp4',
        type: 'stego_media',
        categoryLabel: 'Steganographic Video Trap',
        caseId: 'CASE-2026-001',
        status: 'ARMED',
        deploymentDate: '27 Aug 2026',
        targetFolder: '/evidence/cctv_vault/karol_bagh/',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        stegoWatermarkId: 'STG-CCTV-8819-B',
        fingerprintHash: '9840192834019283401928340192834019283401928340192834019283401928',
        fakePayloadPreview: 'STEGANOGRAPHIC VIDEO: High-bitrate 1080p surveillance video with embedded zero-width steganographic officer watermarks.',
        radarX: 20,
        radarY: 45,
        sensitivity: 'Standard',
        containmentPolicy: 'Extract frame LSB watermark, cross-reference duty roster',
      },
    ],
    incidents: [
      {
        id: 'inc-001-1',
        incidentRef: 'TRIP-2026-8821',
        timestamp: '10:21 PM (Today)',
        decoyId: 'case-001-decoy-1',
        decoyName: 'HAWALA_VIP_LEDGER_CONFIDENTIAL.xlsx',
        decoyType: 'honey_document',
        severity: 'CRITICAL',
        accessorBadge: 'ACP-23',
        accessorName: 'ACP Rajeshwar Sharma',
        accessorRole: 'Supervisory Officer',
        accessorUnit: 'Special Crime Cell (Delhi)',
        sourceIp: '10.240.8.21 (HQ Terminal #4)',
        deviceUuid: 'MAC: D2:11:44:89:AF:02',
        geoLocation: 'Delhi Police HQ, Floor 4',
        attackVector: 'Direct file read on unassigned Hawala case dossier',
        exfiltrationMethod: 'Export to staged local directory',
        sha256Proof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        watermarkMatched: true,
        watermarkRecipient: 'ACP Rajeshwar Sharma (DEL-IPS-8821)',
        containmentStatus: 'ACTION_REQUIRED',
        containmentNotes: 'Zero assigned investigation duties. Flagged as Canary Trap incident.',
      },
    ],
  },
  'CRS-2026-HNY-047': {
    assets: [
      {
        id: 'case-047-decoy-1',
        name: 'FIR_0947_SYNTHETIC_AADHAAR_REGISTRY.pdf',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CRS-2026-HNY-047',
        status: 'TRIPPED',
        deploymentDate: '28 Aug 2026',
        targetFolder: '/vault/evidence/deceptive_firs/chennai_cyber/',
        accessCount: 8,
        lastTriggered: '09:44 PM (Today)',
        accessedBy: 'SYS-AUTOBOT (Automated Ingestion Script #CHE-99)',
        accessTimestamp: '2026-09-14 21:44:19 IST',
        accessLogs: [
          { user: 'Automated Bot #CHE-99 (SYS-AUTOBOT)', timestamp: '2026-09-14 21:44:19 IST', role: 'Scraper Bot', ip: '185.220.101.5', action: 'API_INJECTION_ATTEMPT' },
        ],
        stegoWatermarkId: 'STG-PHANTOM-0947-X',
        fingerprintHash: '9a01f82710381029384710293847102938471029384710293847102938471029',
        fakePayloadPreview: 'FABRICATED: Synthetic biometric IRIS hash and forged Connaught Place FIR narrative generated via AI hallucination.',
        radarX: 40,
        radarY: 32,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Auto-quarantine FIR registry + Push alert to Doppelgänger detector',
      },
      {
        id: 'case-047-decoy-2',
        name: 'pg_decoy://biometric_hash_collision_db:5432',
        type: 'ghost_database',
        categoryLabel: 'Ghost Database Table',
        caseId: 'CRS-2026-HNY-047',
        status: 'TRIPPED',
        deploymentDate: '28 Aug 2026',
        targetFolder: 'db.crimesync.internal/uidai_cache/staging',
        accessCount: 9,
        lastTriggered: '09:50 PM (Today)',
        accessedBy: 'EXT-PROBE-88 (185.220.101.5 Tor)',
        accessTimestamp: '2026-09-14 21:50:33 IST',
        accessLogs: [
          { user: 'EXT-PROBE-88 (185.220.101.5 Tor)', timestamp: '2026-09-14 21:50:33 IST', role: 'Anonymous Prober', ip: '185.220.101.5', action: 'DATABASE_QUERY' },
        ],
        fingerprintHash: '8b91a7889ff0189d98e8432a9010049281a8c9098711ef4f53cda18c2baa0c03',
        fakePayloadPreview: 'GHOST SCHEMA: Decoy Aadhaar terminal scan logs showing Mumbai BKC terminal vs Delhi timestamp conflict.',
        radarX: 66,
        radarY: 26,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Lock session token, trigger biometric re-authentication',
      },
      {
        id: 'case-047-decoy-3',
        name: 'AWS_CANARY_IAM_KEY_JUDICIAL_INGEST_API',
        type: 'iam_credential',
        categoryLabel: 'Canary Cloud Token',
        caseId: 'CRS-2026-HNY-047',
        status: 'ARMED',
        deploymentDate: '27 Aug 2026',
        targetFolder: '.aws/credentials on CCTNS Gateway Node',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '1a90c298018ef902b4890c91823abce809182470129a01f98109340982481023',
        fakePayloadPreview: 'CANARY TOKEN: AKIA99JUDICIAL2026. Alerts judicial compliance cell upon unauthorized PUT to Section 65B manifest.',
        radarX: 80,
        radarY: 60,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Instant revoke officer session + SMS broadcast to Chief Cyber Warden',
      },
      {
        id: 'case-047-decoy-4',
        name: 'CDR_SATYAKIRAN_PHANTOM_BTS_DUMP.xlsx',
        type: 'honey_document',
        categoryLabel: 'Decoy Document',
        caseId: 'CRS-2026-HNY-047',
        status: 'TRIPPED',
        deploymentDate: '28 Aug 2026',
        targetFolder: '/intelligence/telecom_dumps/chennai_hyderabad/',
        accessCount: 4,
        lastTriggered: '09:30 PM (Today)',
        accessedBy: 'SI-9941 (SI Satyakiran)',
        accessTimestamp: '2026-09-14 21:30:12 IST',
        accessLogs: [
          { user: 'SI Satyakiran (SI-9941)', timestamp: '2026-09-14 21:30:12 IST', role: 'Investigative Officer', ip: '10.240.9.11', action: 'DIRECT_CDR_DOWNLOAD' },
        ],
        stegoWatermarkId: 'STG-CHE-0947-P',
        fingerprintHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        fakePayloadPreview: 'SPOOFED CDR: 52 simulated cell tower handoffs along Chennai-Hyderabad corridor with kinematic speed violations.',
        radarX: 28,
        radarY: 64,
        sensitivity: 'Standard',
        containmentPolicy: 'Silently embed zero-width watermark matching downloader badge ID',
      },
      {
        id: 'case-047-decoy-5',
        name: 'api.crimesync.internal/v2/doppelganger/synthetic_fir_stream',
        type: 'fake_endpoint',
        categoryLabel: 'Ghost REST Endpoint',
        caseId: 'CRS-2026-HNY-047',
        status: 'ARMED',
        deploymentDate: '28 Aug 2026',
        targetFolder: 'API Gateway / Doppelgänger Ingestion Mesh',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        fingerprintHash: '7b91d90a980998f4803b91a7889ff0189d98e8432a9010049281a8c9098711ef',
        fakePayloadPreview: 'SYNTHETIC INGESTION: Detects automated bot injections of hallucinated FIR narratives into live database.',
        radarX: 50,
        radarY: 80,
        sensitivity: 'Ultra-High',
        containmentPolicy: 'Port-mirror traffic, capture full PCAP dump, isolate switch port',
      },
      {
        id: 'case-047-decoy-6',
        name: 'CCTV_BKC_TERMINAL_BIOMETRIC_SCAN_CAM11.mp4',
        type: 'stego_media',
        categoryLabel: 'Steganographic Video Trap',
        caseId: 'CRS-2026-HNY-047',
        status: 'ARMED',
        deploymentDate: '28 Aug 2026',
        targetFolder: '/evidence/cctv_vault/biometric_audit/',
        accessCount: 0,
        accessedBy: 'None (Armed & Pristine)',
        accessTimestamp: 'N/A',
        accessLogs: [],
        stegoWatermarkId: 'STG-CCTV-0947-BKC',
        fingerprintHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        fakePayloadPreview: 'STEGANOGRAPHIC VIDEO: High-bitrate CCTV footage of suspect Vikramaditya Sen at Mumbai terminal with biometric watermark.',
        radarX: 18,
        radarY: 40,
        sensitivity: 'Standard',
        containmentPolicy: 'Extract frame LSB watermark, cross-reference duty roster',
      },
    ],
    incidents: [
      {
        id: 'inc-047-1',
        incidentRef: 'TRIP-2026-0947',
        timestamp: '09:44 PM (Today)',
        decoyId: 'case-047-decoy-1',
        decoyName: 'FIR_0947_SYNTHETIC_AADHAAR_REGISTRY.pdf',
        decoyType: 'honey_document',
        severity: 'CRITICAL',
        accessorBadge: 'SYS-AUTOBOT',
        accessorName: 'Automated Ingestion Script #CHE-99',
        accessorRole: 'System Bot',
        accessorUnit: 'Automated Scripting',
        sourceIp: '185.220.101.5 (Tor Exit)',
        deviceUuid: 'UNKNOWN-BOT-RUNNER',
        geoLocation: 'Tor Egress / Unknown',
        attackVector: 'Synthetic FIR injection attempt into police records',
        exfiltrationMethod: 'HTTP POST to /api/v1/cases/inject with forged signature',
        sha256Proof: '9a01f82710381029384710293847102938471029384710293847102938471029',
        watermarkMatched: true,
        watermarkRecipient: 'Doppelgänger AI Engine',
        containmentStatus: 'CONTAINED',
        containmentNotes: 'Deceptive narrative quarantined; suspect identity flagged as synthetic collision.',
      },
    ],
  },
};

function getCaseDeceptionAssetsAndIncidents(caseId: string, caseObj?: any): { assets: DeceptionAsset[]; incidents: TripwireIncident[] } {
  if (CASE_DECEPTION_REGISTRY[caseId]) {
    return CASE_DECEPTION_REGISTRY[caseId];
  }

  const c = caseObj || ALL_CASES.find((item) => item.id === caseId) || {
    id: caseId,
    fir_number: caseId,
    title: 'Active Cyber & Financial Fraud Investigation',
    lead_suspect: 'Primary Target Operative',
    jurisdiction_city: 'Delhi NCR',
    crime_category: 'FINANCIAL_FRAUD',
  };

  const fir = c.fir_number || (c as any).firNumber || caseId;
  const suspect = c.lead_suspect || (c as any).suspectName || 'Target Operative';
  const cleanSuspect = suspect.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const city = c.jurisdiction_city || (c as any).location || 'National Scope';

  const dynamicAssets: DeceptionAsset[] = [
    {
      id: `${caseId}-decoy-1`,
      name: `${fir.replace(/[^a-zA-Z0-9]/g, '_')}_CONFIDENTIAL_DOSSIER.pdf`,
      type: 'honey_document',
      categoryLabel: 'Decoy Document',
      caseId: caseId,
      status: 'TRIPPED',
      deploymentDate: '24 Aug 2026',
      targetFolder: `/vault/evidence/confidential/${caseId.toLowerCase()}/`,
      accessCount: 4,
      lastTriggered: '10:45 PM (Today)',
      accessedBy: `EXT-ADVERSARY-99 (Unregistered IP)`,
      accessTimestamp: '2026-09-14 22:45:10 IST',
      accessLogs: [
        { user: 'EXT-ADVERSARY-99 (Unregistered IP)', timestamp: '2026-09-14 22:45:10 IST', role: 'External Actor', ip: '115.242.18.94', action: 'DIRECT_DOSSIER_READ' },
        { user: 'OFFICER-PROBE (#9941)', timestamp: '2026-09-14 22:40:02 IST', role: 'Terminal Operator', ip: '10.240.8.214', action: 'METADATA_PROBE' },
      ],
      stegoWatermarkId: `STG-${cleanSuspect.slice(0, 8)}-9912-Z`,
      fingerprintHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fakePayloadPreview: `FABRICATED: Contains synthetic ledger accounts and dummy safehouse coordinates for ${suspect} in ${city}.`,
      radarX: 42,
      radarY: 34,
      sensitivity: 'Ultra-High',
      containmentPolicy: 'Auto-silent memory dump + IP trace + Telegram exfil beacon kill',
    },
    {
      id: `${caseId}-decoy-2`,
      name: `pg_decoy://${cleanSuspect.toLowerCase().slice(0, 10)}_mule_ledger:5432`,
      type: 'ghost_database',
      categoryLabel: 'Ghost Database Table',
      caseId: caseId,
      status: 'TRIPPED',
      deploymentDate: '21 Aug 2026',
      targetFolder: `db.crimesync.internal/${caseId.toLowerCase()}/staging`,
      accessCount: 11,
      lastTriggered: '10:52 PM (Today)',
      accessedBy: `OFFICER-PROBE (#9941 ${city})`,
      accessTimestamp: '2026-09-14 22:52:40 IST',
      accessLogs: [
        { user: `OFFICER-PROBE (#9941 ${city})`, timestamp: '2026-09-14 22:52:40 IST', role: 'Station Terminal', ip: '10.240.8.214', action: 'SQL_BULK_DUMP' },
      ],
      fingerprintHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
      fakePayloadPreview: `GHOST SCHEMA: 12 fake transactions linked to ${suspect} with decoy balances to attract unauthorized queries.`,
      radarX: 68,
      radarY: 28,
      sensitivity: 'Ultra-High',
      containmentPolicy: 'Delay query response by 3s, record SQL fingerprint, auto-lock DB session',
    },
    {
      id: `${caseId}-decoy-3`,
      name: `AWS_CANARY_IAM_KEY_${caseId.replace(/[^a-zA-Z0-9]/g, '_')}_VAULT`,
      type: 'iam_credential',
      categoryLabel: 'Canary Cloud Token',
      caseId: caseId,
      status: 'ARMED',
      deploymentDate: '15 Aug 2026',
      targetFolder: `.aws/credentials on Investigator Workstations`,
      accessCount: 0,
      accessedBy: 'None (Armed & Pristine)',
      accessTimestamp: 'N/A',
      accessLogs: [],
      fingerprintHash: '7b91d90a980998f4803b91a7889ff0189d98e8432a9010049281a8c9098711ef',
      fakePayloadPreview: `CANARY TOKEN: AKIA99${cleanSuspect.slice(0, 6)}2026. Trips CloudWatch Canary immediately upon STS GetCallerIdentity.`,
      radarX: 78,
      radarY: 62,
      sensitivity: 'Ultra-High',
      containmentPolicy: 'Instant revoke officer session + SMS broadcast to Chief Cyber Warden',
    },
    {
      id: `${caseId}-decoy-4`,
      name: `CDR_${cleanSuspect.slice(0, 12)}_BURNER_DUMP.xlsx`,
      type: 'honey_document',
      categoryLabel: 'Decoy Document',
      caseId: caseId,
      status: 'TRIPPED',
      deploymentDate: '26 Aug 2026',
      targetFolder: `/intelligence/telecom_dumps/${city.toLowerCase().replace(/[^a-z0-9]/g, '_')}/`,
      accessCount: 2,
      lastTriggered: '10:18 PM (Today)',
      accessedBy: `SI-4091 (Inspector Priya Kulkarni)`,
      accessTimestamp: '2026-09-14 22:18:22 IST',
      accessLogs: [
        { user: 'Inspector Priya Kulkarni (SI-4091)', timestamp: '2026-09-14 22:18:22 IST', role: 'Investigative Officer', ip: '10.240.4.18', action: 'DIRECT_FILE_DOWNLOAD' },
      ],
      stegoWatermarkId: `STG-CDR-${caseId.slice(-4)}`,
      fingerprintHash: '1a90c298018ef902b4890c91823abce809182470129a01f98109340982481023',
      fakePayloadPreview: `SPOOFED CDR: 48 simulated burner calls and tower pings across ${city} with embedded tracking webhooks.`,
      radarX: 30,
      radarY: 66,
      sensitivity: 'Standard',
      containmentPolicy: 'Silently embed zero-width watermark matching downloader badge ID',
    },
    {
      id: `${caseId}-decoy-5`,
      name: `api.crimesync.internal/v2/${caseId.toLowerCase()}/telemetry_stream`,
      type: 'fake_endpoint',
      categoryLabel: 'Ghost REST Endpoint',
      caseId: caseId,
      status: 'ARMED',
      deploymentDate: '20 Aug 2026',
      targetFolder: 'API Gateway / Internal Routing Mesh',
      accessCount: 0,
      accessedBy: 'None (Armed & Pristine)',
      accessTimestamp: 'N/A',
      accessLogs: [],
      fingerprintHash: '8910492810a9c8012894b91029381029c0192840192834019283401928340192',
      fakePayloadPreview: 'SYNTHETIC STREAM: Generates realistic mock telemetry packets to trap packet sniffers and crawler bots.',
      radarX: 52,
      radarY: 82,
      sensitivity: 'Ultra-High',
      containmentPolicy: 'Port-mirror traffic, capture full PCAP dump, isolate switch port',
    },
    {
      id: `${caseId}-decoy-6`,
      name: `CCTV_${city.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SURVEILLANCE_CAM04.mp4`,
      type: 'stego_media',
      categoryLabel: 'Steganographic Video Trap',
      caseId: caseId,
      status: 'ARMED',
      deploymentDate: '27 Aug 2026',
      targetFolder: `/evidence/cctv_vault/${city.toLowerCase().replace(/[^a-z0-9]/g, '_')}/`,
      accessCount: 0,
      accessedBy: 'None (Armed & Pristine)',
      accessTimestamp: 'N/A',
      accessLogs: [],
      stegoWatermarkId: `STG-CCTV-${caseId.slice(-4)}`,
      fingerprintHash: '9840192834019283401928340192834019283401928340192834019283401928',
      fakePayloadPreview: `STEGANOGRAPHIC VIDEO: 1080p footage with embedded zero-width watermarks identifying any unauthenticated exfiltration.`,
      radarX: 22,
      radarY: 42,
      sensitivity: 'Standard',
      containmentPolicy: 'Extract frame LSB watermark, cross-reference duty roster',
    },
  ];

  const dynamicIncidents: TripwireIncident[] = [
    {
      id: `inc-${caseId}-1`,
      incidentRef: `TRIP-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: '10:52 PM (Today)',
      decoyId: `${caseId}-decoy-2`,
      decoyName: dynamicAssets[1].name,
      decoyType: 'ghost_database',
      severity: 'CRITICAL',
      accessorBadge: 'OFFICER-PROBE',
      accessorName: 'Unauthorized Session #9941',
      accessorRole: 'Terminal Operator',
      accessorUnit: city,
      sourceIp: '10.240.8.214 (HQ Workstation)',
      deviceUuid: 'MAC: E4:5F:01:8A:22:9C',
      geoLocation: `${city} Police Cyber Ops`,
      attackVector: `SQL enumeration query against ${dynamicAssets[1].name}`,
      exfiltrationMethod: 'Bulk table export attempt',
      sha256Proof: dynamicAssets[1].fingerprintHash,
      watermarkMatched: true,
      watermarkRecipient: 'CrimeSync Canary Oversight System',
      containmentStatus: 'CONTAINED',
      containmentNotes: 'Automatic memory dump created and session access tokens revoked.',
    },
    {
      id: `inc-${caseId}-2`,
      incidentRef: `TRIP-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: '10:45 PM (Today)',
      decoyId: `${caseId}-decoy-1`,
      decoyName: dynamicAssets[0].name,
      decoyType: 'honey_document',
      severity: 'CRITICAL',
      accessorBadge: 'EXT-ADVERSARY-99',
      accessorName: 'Adversary (Unregistered IP)',
      accessorRole: 'External Threat Actor',
      accessorUnit: 'External Egress',
      sourceIp: '115.242.18.94 (Commercial Subnet)',
      deviceUuid: 'UNKNOWN-DEVICE',
      geoLocation: city,
      attackVector: `Unauthorized download of sealed dossier for ${suspect}`,
      exfiltrationMethod: 'Direct REST API file read',
      sha256Proof: dynamicAssets[0].fingerprintHash,
      watermarkMatched: true,
      watermarkRecipient: 'Counter-Deception Unit',
      containmentStatus: 'ACTION_REQUIRED',
      containmentNotes: 'Tripwire tripped; digital forensic custody log recorded.',
    },
  ];

  return { assets: dynamicAssets, incidents: dynamicIncidents };
}

interface DeceptionNetworkPageProps {
  onSelectAction?: (action: string) => void;
}

type TabType = 'sensor-grid' | 'breach-stream' | 'asset-inventory' | 'insider-matrix' | 'watermark-lab';

export const DeceptionNetworkPage: React.FC<DeceptionNetworkPageProps> = ({ onSelectAction }) => {
  const { selectedCaseId, selectedCase, setSelectedCaseId } = useCaseContext();
  const activeCaseKey = selectedCase?.id || selectedCaseId || 'CASE-2026-002';

  // Page State
  const [activeTab, setActiveTab] = useState<TabType>('sensor-grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Data State (supports live additions & simulations & reactive case switching)
  const initialData = useMemo(() => {
    return getCaseDeceptionAssetsAndIncidents(activeCaseKey, selectedCase);
  }, [activeCaseKey, selectedCase]);

  const [assets, setAssets] = useState<DeceptionAsset[]>(initialData.assets);
  const [incidents, setIncidents] = useState<TripwireIncident[]>(initialData.incidents);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialData.assets[0]?.id || '');
  const [selectedIncident, setSelectedIncident] = useState<TripwireIncident | null>(null);
  const [radarZoom, setRadarZoom] = useState<number>(1);
  const [radarFilter, setRadarFilter] = useState<'ALL' | 'TRIPPED' | 'ARMED'>('ALL');

  // Reactively synchronize assets and incidents when the selected report/case changes
  React.useEffect(() => {
    const updated = getCaseDeceptionAssetsAndIncidents(activeCaseKey, selectedCase);
    setAssets(updated.assets);
    setIncidents(updated.incidents);
    setSelectedAssetId(updated.assets[0]?.id || '');
  }, [activeCaseKey, selectedCase]);

  // Modals & Banners
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [simulationAlert, setSimulationAlert] = useState<{ active: boolean; message: string; incidentRef?: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Stego Lab State
  const [selectedStegoSample, setSelectedStegoSample] = useState<number>(0);
  const [decodedWatermark, setDecodedWatermark] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // New Decoy Form State
  const [newDecoyName, setNewDecoyName] = useState('');
  const [newDecoyType, setNewDecoyType] = useState<DecoyType>('honey_document');
  const [newDecoyCase, setNewDecoyCase] = useState('RC-2026-0417');
  const [newDecoyFolder, setNewDecoyFolder] = useState('/vault/evidence/confidential/');
  const [newDecoyPayload, setNewDecoyPayload] = useState('');
  const [newDecoySensitivity, setNewDecoySensitivity] = useState<'Low' | 'Standard' | 'Ultra-High'>('Ultra-High');
  const [newDecoyPolicy, setNewDecoyPolicy] = useState('Auto-silent memory dump + IP trace');

  // Active Law Case & Compromise Status
  const activeLawCase: LawCase | undefined = useMemo(() => {
    return ALL_CASES.find((c) => c.id === (selectedCase?.id || selectedCaseId)) || (selectedCase as LawCase);
  }, [selectedCase, selectedCaseId]);

  const isCaseCompromised = Boolean(activeLawCase?.isCompromised);
  const compromisedFilesList: CompromisedFile[] = useMemo(() => {
    if (!isCaseCompromised || !activeLawCase?.compromisedFiles) return [];
    return activeLawCase.compromisedFiles;
  }, [activeLawCase, isCaseCompromised]);

  const [selectedFileId, setSelectedFileId] = useState<string>('');

  React.useEffect(() => {
    if (compromisedFilesList.length > 0) {
      setSelectedFileId(compromisedFilesList[0].id);
    } else {
      setSelectedFileId('');
    }
  }, [compromisedFilesList, activeCaseKey]);

  // Active Selected Compromised File
  const selectedFile: CompromisedFile | null = useMemo(() => {
    return compromisedFilesList.find((f) => f.id === selectedFileId) || compromisedFilesList[0] || null;
  }, [compromisedFilesList, selectedFileId]);

  // Dynamic Compromised File Nodes for Radar Grid
  const displayedCompromisedFiles = useMemo(() => {
    if (!isCaseCompromised || compromisedFilesList.length === 0) return [];
    return compromisedFilesList.filter((file) => {
      const isTripped = file.accessLogs && file.accessLogs.length > 0;
      if (radarFilter === 'TRIPPED' && !isTripped) return false;
      if (radarFilter === 'ARMED' && isTripped) return false;
      return true;
    });
  }, [isCaseCompromised, compromisedFilesList, radarFilter]);

  // Dynamic Legacy Radar Nodes
  const radarNodes = useMemo(() => {
    if (!selectedCase?.id && !selectedCaseId) {
      return [];
    }
    const currentCaseId = selectedCase?.id || selectedCaseId;

    return assets.filter((asset) => {
      if (asset.caseId !== currentCaseId) return false;
      const isTripped = asset.status === 'TRIPPED';
      if (radarFilter === 'TRIPPED' && !isTripped) return false;
      if (radarFilter === 'ARMED' && isTripped) return false;
      return true;
    });
  }, [assets, selectedCaseId, selectedCase, radarFilter]);

  // Active Selected Asset
  const selectedAsset = useMemo(() => {
    return radarNodes.find((a) => a.id === selectedAssetId) || radarNodes[0] || null;
  }, [radarNodes, selectedAssetId]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        inc.decoyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.accessorBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.accessorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.incidentRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.sourceIp.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchType = typeFilter === 'ALL' || inc.decoyType === typeFilter;

      return matchSearch && matchSeverity && matchType;
    });
  }, [incidents, searchQuery, severityFilter, typeFilter]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((ast) => {
      const matchSearch =
        ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.targetFolder.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'ALL' || ast.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [assets, searchQuery, typeFilter]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Trigger Breach Simulation
  const handleSimulateBreach = () => {
    const randomBadge = ['ACP-23 (Raj Verma)', 'INS-17 (Vikram Rathore)', 'EXT-ADVERSARY-99', 'U-48 (Contractor)'][
      Math.floor(Math.random() * 4)
    ];
    const targetAsset = assets[Math.floor(Math.random() * assets.length)];
    if (!targetAsset) return;
    const incidentRef = `TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const breachTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Just Now)';
    const exactIsoTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newIncident: TripwireIncident = {
      id: `inc-${Date.now()}`,
      incidentRef,
      timestamp: breachTimestamp,
      decoyId: targetAsset.id,
      decoyName: targetAsset.name,
      decoyType: targetAsset.type,
      severity: 'CRITICAL',
      accessorBadge: randomBadge.split(' ')[0],
      accessorName: randomBadge.split('(')[1]?.replace(')', '') || 'Unknown Entity',
      accessorRole: 'Investigative Personnel',
      accessorUnit: 'Special Crime Cell',
      sourceIp: '10.240.8.214 (HQ Workstation)',
      deviceUuid: 'MAC: E4:5F:01:8A:22:9C',
      geoLocation: 'Delhi Police HQ Cyber Ops, Floor 3',
      attackVector: `Simulated tripwire breach on ${targetAsset.name}`,
      exfiltrationMethod: 'Direct Unauthorized Read & Memory Hook',
      sha256Proof: '7c91e0a819b18204918204918204918204918204918204918204918204918204',
      watermarkMatched: true,
      watermarkRecipient: `${randomBadge} - Instant Canary Alert`,
      containmentStatus: 'ACTION_REQUIRED',
      containmentNotes: 'Simulated breach tripwire successfully registered across sensor nodes.',
    };

    const newAccessLog: DecoyAccessLog = {
      user: randomBadge,
      timestamp: exactIsoTimestamp,
      role: 'Investigative Personnel',
      ip: '10.240.8.214',
      action: 'UNAUTHORIZED_ACCESS',
    };

    // Update asset status to TRIPPED and prepend access log
    setAssets((prev) =>
      prev.map((a) =>
        a.id === targetAsset.id
          ? {
              ...a,
              status: 'TRIPPED',
              accessCount: a.accessCount + 1,
              accessedBy: randomBadge,
              accessTimestamp: exactIsoTimestamp,
              accessLogs: [newAccessLog, ...(a.accessLogs || [])],
            }
          : a
      )
    );

    // Insert incident at top
    setIncidents((prev) => [newIncident, ...prev]);

    // Show simulation banner
    setSimulationAlert({
      active: true,
      message: `TRIPWIRE ALARM TRIPPED: ${targetAsset.name} accessed by ${randomBadge}!`,
      incidentRef,
    });

    if (onSelectAction) {
      onSelectAction(`Canary Tripwire Triggered on ${targetAsset.name}`);
    }

    setTimeout(() => {
      setSimulationAlert(null);
    }, 6000);
  };

  // Deploy New Decoy Handler
  const handleDeployDecoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecoyName.trim()) return;

    const newAsset: DeceptionAsset = {
      id: `decoy-${Date.now()}`,
      name: newDecoyName.trim(),
      type: newDecoyType,
      categoryLabel:
        newDecoyType === 'honey_document'
          ? 'Decoy Document'
          : newDecoyType === 'ghost_database'
          ? 'Ghost Database Table'
          : newDecoyType === 'iam_credential'
          ? 'Canary Cloud Token'
          : newDecoyType === 'fake_endpoint'
          ? 'Ghost REST Endpoint'
          : newDecoyType === 'stego_media'
          ? 'Steganographic Video Trap'
          : 'Canary Token',
      caseId: newDecoyCase.trim() || activeCaseKey,
      status: 'ARMED',
      deploymentDate: 'Just Now',
      targetFolder: newDecoyFolder.trim() || '/vault/evidence/confidential/',
      accessCount: 0,
      accessedBy: 'None (Armed & Pristine)',
      accessTimestamp: 'N/A',
      accessLogs: [],
      fingerprintHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      fakePayloadPreview: newDecoyPayload.trim() || 'SYNTHETIC PAYLOAD: Auto-generated decoy telemetry payload.',
      radarX: Math.floor(20 + Math.random() * 60),
      radarY: Math.floor(20 + Math.random() * 60),
      sensitivity: newDecoySensitivity,
      containmentPolicy: newDecoyPolicy.trim() || 'Auto-silent memory dump + IP trace',
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);
    setIsDeployModalOpen(false);
    setNewDecoyName('');
    setNewDecoyPayload('');

    if (onSelectAction) {
      onSelectAction(`Canary Decoy Deployed: ${newAsset.name}`);
    }
  };

  // Decode Steganographic Watermark
  const handleDecodeSample = (idx: number) => {
    setSelectedStegoSample(idx);
    setIsDecoding(true);
    setDecodedWatermark(null);

    setTimeout(() => {
      setIsDecoding(false);
      const sample = stegoWatermarkSamples[idx];
      if (sample) {
        setDecodedWatermark(
          `[STEGO FORENSIC REPORT]\nOFFICER BADGE: ${sample.officerBadge}\nNAME: ${sample.officerName}\nCASE REF: ${sample.caseRef}\nTIMESTAMP: ${sample.timestamp}\nZERO-WIDTH HEX PAYLOAD: ${sample.invisibleZeroWidthSequence}\nSHA-256 SIGNATURE: ${sample.sha256Signature}\nINTEGRITY PROOF: 100% MATCH (CRYPTOGRAPHICALLY VERIFIED)`
        );
      }
    }, 600);
  };

  // Helper for Type Icons (supporting DecoyType and raw string labels)
  const renderTypeIcon = (type: DecoyType | string, className = 'w-4 h-4') => {
    const t = String(type).toLowerCase();
    if (t.includes('database') || t.includes('sql') || t === 'ghost_database') {
      return <Database className={`${className} text-cyan-400`} />;
    }
    if (t.includes('video') || t.includes('media') || t.includes('mp4') || t === 'stego_media') {
      return <Video className={`${className} text-pink-400`} />;
    }
    if (t.includes('credential') || t.includes('key') || t.includes('token') || t === 'iam_credential') {
      return <Key className={`${className} text-purple-400`} />;
    }
    if (t.includes('endpoint') || t.includes('api') || t.includes('pcap') || t === 'fake_endpoint') {
      return <Globe className={`${className} text-blue-400`} />;
    }
    if (t.includes('doc') || t.includes('pdf') || t.includes('xlsx') || t.includes('spreadsheet') || t.includes('biometric') || t === 'honey_document') {
      return <FileText className={`${className} text-amber-400`} />;
    }
    return <Target className={`${className} text-emerald-400`} />;
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: DecoyStatus) => {
    switch (status) {
      case 'TRIPPED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-red-950/80 border border-red-500/50 text-red-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            TRIPPED ALARM
          </span>
        );
      case 'ENGAGED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ENGAGED BAIT
          </span>
        );
      case 'ARMED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ARMED & ACTIVE
          </span>
        );
      case 'ISOLATED':
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-purple-950/80 border border-purple-500/50 text-purple-400">
            ISOLATED
          </span>
        );
      case 'MAINTENANCE':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-900 border border-slate-700 text-slate-400">
            MAINTENANCE
          </span>
        );
    }
  };

  // Helper for Severity Badges
  const renderSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-950/90 border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-400">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-950/80 border border-blue-500/50 text-blue-400">
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-900 border border-slate-700 text-slate-400">
            LOW
          </span>
        );
    }
  };

  return (
    <div key={activeCaseKey} className="flex-1 p-3.5 flex flex-col h-full bg-[#030712] text-slate-100 font-sans overflow-hidden">
      {/* ─── Simulation Alert Toast ──────────────────────────────────────────────── */}
      {simulationAlert && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-950/90 via-[#1f0a0a] to-amber-950/90 border border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  DECEPTION SENSOR TRIPWIRE BREACH DETECTED
                </span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-bold rounded">
                  {simulationAlert.incidentRef}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{simulationAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('breach-stream')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Inspect Tripwire
            </button>
            <button
              onClick={() => setSimulationAlert(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Top Control & Status Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#111e33] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Target className="w-4 h-4" />
            </div>
            <h1 className="text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              HONEYPOT
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold">
                GRID STATUS: ARMED & ACTIVE
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Proactive counter-intelligence, honeypot traps, canary files & insider threat attribution</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span className="text-amber-400 font-mono text-[10.5px]">24 Sensors Deployed</span>
          </p>
        </div>

        {/* Action Buttons & Case Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Honeypot Active Investigation Selector (Shows all reports with compromised highlighted) */}
          <CaseSelector
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              if (onSelectAction) {
                onSelectAction(`Selected Active Case: ${id}`);
              }
            }}
            allowAll={false}
            className="hidden sm:flex"
          />

          {/* Simulate Tripwire Breach Button */}
          <button
            onClick={handleSimulateBreach}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1107] hover:bg-[#2e1d09] border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all"
            title="Simulate a breach on a random honeypot to verify tripwire sensors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Breach</span>
          </button>

          {/* Stego Lab Quick Trigger */}
          <button
            onClick={() => setActiveTab('watermark-lab')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stego Scanner</span>
          </button>

          {/* Deploy New Canary Decoy Button */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Canary Decoy</span>
          </button>

          {/* Export Dossier */}
          <button
            onClick={() => onSelectAction && onSelectAction('Exporting Certified Deception Forensics Dossier')}
            className="p-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-400 hover:text-slate-200 transition-colors"
            title="Export Forensics Dossier"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Top Telemetry KPI Row (6 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Card 1 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Active Decoys</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white font-mono">{assets.length}</span>
            <span className="text-[9px] font-medium text-emerald-400">8 Vault Folders</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.trapsChange}</span>
        </div>

        {/* Card 2 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-red-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider">Tripwire Alerts (24h)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-red-400 font-mono">{incidents.length}</span>
            <span className="text-[9px] font-bold text-red-400">3 Critical</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Unauthorized access attempts</span>
        </div>

        {/* Card 3 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Mean Time To Alert</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{deceptionMetricsData.meanTimeToAlert}</span>
            <span className="text-[9px] font-medium text-emerald-400">Instant</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.mttaStatus}</span>
        </div>

        {/* Card 4 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-purple-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Flagged Insiders</span>
            <UserX className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-purple-300 font-mono">{insiderThreatsData.length}</span>
            <span className="text-[9px] font-bold text-purple-400">Restricted</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.insiderRiskLevel}</span>
        </div>

        {/* Card 5 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Deception Coverage</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{deceptionMetricsData.deceptionCoverage}</span>
            <span className="text-[9px] font-medium text-cyan-300">High</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">{deceptionMetricsData.coverageTarget}</span>
        </div>

        {/* Card 6 */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#0b1322] to-[#070c16] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Stego Watermarks</span>
            <Fingerprint className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-pink-400 font-mono">{deceptionMetricsData.watermarkedDocs}</span>
            <span className="text-[9px] font-medium text-slate-400">Sealed</span>
          </div>
          <span className="text-[8.5px] text-slate-500 block truncate">Zero-width leak tracking</span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#111e33] pb-2 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sensor-grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'sensor-grid'
                ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar & Sensor Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('breach-stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'breach-stream'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tripwire Incident Stream</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 font-mono text-[9px] font-bold border border-red-500/40">
              {incidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('asset-inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'asset-inventory'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Canary Asset Inventory</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/40">
              {assets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('insider-matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'insider-matrix'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Insider Threat Attribution</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/40">
              {insiderThreatsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('watermark-lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'watermark-lab'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Steganographic Lab</span>
          </button>
        </div>

        {/* Global Search Bar in tab line */}
        <div className="relative min-w-[200px] ml-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter decoys, badges, IPs..."
            className="w-full bg-[#081224] border border-[#162744] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* ─── Main Content Views ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: RADAR & SENSOR GRID                                                */}
        {/* ========================================================================= */}
        {activeTab === 'sensor-grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 8 cols: Interactive Radar Scanner + Live Traps */}
            <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
              <div 
                key={`radar-${activeCaseKey}`}
                className="rounded-xl bg-[#050b18] border border-[#111e33] flex flex-col relative overflow-hidden shadow-xl flex-1 min-h-[380px]"
              >
                {/* Radar Toolbar */}
                <div className="px-3 py-2 border-b border-[#111e33] flex items-center justify-between bg-[#040813] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Honeypot Topography:
                    </span>
                    <button
                      onClick={() => setRadarFilter('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'ALL' ? 'bg-amber-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      All ({isCaseCompromised ? compromisedFilesList.length : 0})
                    </button>
                    <button
                      onClick={() => setRadarFilter('TRIPPED')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'TRIPPED' ? 'bg-red-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      Breached ({isCaseCompromised ? compromisedFilesList.filter((f) => f.accessLogs && f.accessLogs.length > 0).length : 0})
                    </button>
                    <button
                      onClick={() => setRadarFilter('ARMED')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        radarFilter === 'ARMED' ? 'bg-emerald-600 text-white' : 'bg-[#081224] text-slate-400'
                      }`}
                    >
                      Nominal ({isCaseCompromised ? compromisedFilesList.filter((f) => !f.accessLogs || f.accessLogs.length === 0).length : 0})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">Sensors: 24/24 Online</span>
                    <button
                      onClick={() => setRadarZoom((z) => (z === 1 ? 1.15 : 1))}
                      className={`p-1 rounded transition-colors ${
                        radarZoom > 1 ? 'bg-amber-600 text-white' : 'bg-[#081224] text-slate-400 hover:text-white'
                      }`}
                      title="Toggle Radar Zoom"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Radar Visualizer Canvas */}
                <div className="relative flex-1 bg-[#020612] flex items-center justify-center overflow-hidden">
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:22px_22px] opacity-30 pointer-events-none" />

                  {/* Concentric Radar Rings Container with Scale */}
                  <div
                    className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center pointer-events-none transition-transform duration-300"
                    style={{ transform: `scale(${radarZoom})` }}
                  >
                    {/* Ring 1 - Outer */}
                    <div className="absolute inset-0 rounded-full border border-amber-500/20" />
                    <span className="absolute top-2 text-[8px] font-mono text-amber-500/50">PERIMETER: 1.5 KM</span>

                    {/* Ring 2 - Mid */}
                    <div className="absolute inset-10 rounded-full border border-amber-500/30" />
                    <span className="absolute top-12 text-[8px] font-mono text-amber-500/60">HQ VAULT: 1.0 KM</span>

                    {/* Ring 3 - Inner */}
                    <div className="absolute inset-20 rounded-full border border-amber-500/40" />
                    <span className="absolute top-22 text-[8px] font-mono text-amber-500/70">CORE DB: 0.5 KM</span>

                    {/* Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-amber-500/15" />
                    <div className="absolute h-full w-[1px] bg-amber-500/15" />

                    {/* Rotating Radar Sweep Cone */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="w-full h-full radar-sweep bg-gradient-to-tr from-amber-500/30 via-transparent to-transparent" />
                    </div>

                    {/* Center Command Core */}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/40 border border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                      <Target className="w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                  </div>

                  {/* Safe State Overlay vs Plotted Compromised Nodes */}
                  {!isCaseCompromised || displayedCompromisedFiles.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 font-mono tracking-widest text-2xl font-bold bg-emerald-900/10 backdrop-blur-sm z-30 select-none">
                      SAFE: NO DATA BREACHED
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 pointer-events-auto transition-transform duration-300"
                      style={{ transform: `scale(${radarZoom})`, transformOrigin: 'center center' }}
                    >
                      {displayedCompromisedFiles.map((file) => {
                        const isSelected = file.id === (selectedFile?.id || displayedCompromisedFiles[0]?.id);
                        const hasLogs = file.accessLogs && file.accessLogs.length > 0;

                        return (
                          /* Tier 1: Purely positional wrapper — zero transform scale or dimensions mutation */
                          <div
                            key={file.id}
                            style={{
                              position: 'absolute',
                              left: `${file.radarX || 50}%`,
                              top: `${file.radarY || 50}%`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: isSelected ? 30 : 20,
                            }}
                          >
                            {/* Tier 2: Static interactive hitbox with strictly constant dimensions */}
                            <div
                              onClick={() => setSelectedFileId(file.id)}
                              className="graph-interactive-node cursor-pointer flex flex-col items-center group relative select-none"
                            >
                              {/* Tier 3: Inner visual elements with pointer-events-none and non-dimensional hover filters */}
                              <div className="pointer-events-none flex flex-col items-center transition-all duration-150 group-hover:brightness-125 group-hover:drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]">
                                {/* Animated Ping Ring for Tripped / Breached Nodes */}
                                {hasLogs && (
                                  <span className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping pointer-events-none" />
                                )}

                                {/* Node Icon Box */}
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-lg transition-all ${
                                    hasLogs
                                      ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_12px_#ef4444]'
                                      : 'bg-[#081224] border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                                  } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                                >
                                  {renderTypeIcon(file.fileType, 'w-3.5 h-3.5')}
                                </div>

                                {/* Label Pill */}
                                <div className="mt-1 px-1.5 py-0.5 rounded bg-[#050b18]/95 border border-[#162744] text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-md pointer-events-none group-hover:border-amber-400">
                                  {file.fileName}
                                  {hasLogs && <span className="ml-1 text-red-400 font-mono">({file.accessLogs.length} LOGS)</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Radar Legend */}
                <div className="px-3 py-2 border-t border-[#111e33] bg-[#040813] flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping" />
                      <span>Compromised File</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      <span>Engaged Trap</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      <span>Nominal / Shielded</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-500">Scan Frequency: 2.4 GHz Pulse</span>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Compromised Files Metadata & Telemetry */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              {isCaseCompromised && selectedFile ? (
                <>
                  {/* Card 1: Selected File Metadata & Access Logs */}
                  <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        COMPROMISED FILES METADATA
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-[9.5px] font-mono font-bold">
                        BREACHED ({selectedFile.accessLogs?.length || 0} HITS)
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h3 className="text-sm font-bold text-slate-100 font-mono break-all">{selectedFile.fileName}</h3>
                      <span className="text-[10px] text-amber-400 font-medium">{selectedFile.fileType}</span>
                    </div>

                    {/* Metadata list */}
                    <div className="mt-3 space-y-2 text-xs border-t border-[#111e33]/80 pt-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Folder / URI</span>
                        <span className="font-mono text-slate-200 truncate max-w-[170px]" title={selectedFile.targetFolder || '/vault/evidence/'}>
                          {selectedFile.targetFolder || '/vault/evidence/'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Linked Case</span>
                        <span className="font-mono font-bold text-cyan-400">{activeLawCase?.fir_number || activeLawCase?.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Unauthorized Hits</span>
                        <span className="font-mono font-bold text-red-400">{selectedFile.accessLogs?.length || 0} accesses</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">File Size</span>
                        <span className="font-mono text-slate-300 text-[10px]">{selectedFile.fileSize || '32.4 MB'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Sensitivity Level</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                          {selectedFile.sensitivity || 'Ultra-High'}
                        </span>
                      </div>
                    </div>

                    {/* Access Logs / Telemetry List */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#030610] border border-red-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-red-400" />
                          Unauthorized Access Logs ({selectedFile.accessLogs?.length || 0})
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Forensic Audit</span>
                      </div>

                      {selectedFile.accessLogs && selectedFile.accessLogs.length > 0 ? (
                        <div className="space-y-1 max-h-[180px] overflow-y-auto pr-0.5">
                          {selectedFile.accessLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between border-b border-red-500/20 py-2 items-center text-xs">
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-white font-semibold font-mono truncate">{log.user}</span>
                                <span className="text-gray-400 font-mono text-[10px]">{log.timestamp}</span>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-red-400 font-mono font-bold text-[11px] uppercase">{log.action}</span>
                                {log.ip && <span className="text-slate-500 font-mono text-[9px]">{log.ip}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-400 font-mono text-xs py-2 text-center">
                          No unauthorized access recorded (Pristine)
                        </p>
                      )}
                    </div>

                    {/* SHA-256 Proof */}
                    {selectedFile.sha256Proof && (
                      <div className="mt-2.5 flex items-center justify-between p-1.5 rounded bg-[#030610] border border-[#111e33] text-[9px]">
                        <span className="text-slate-400 font-mono">SHA-256:</span>
                        <span className="font-mono text-slate-300 truncate max-w-[180px]">{selectedFile.sha256Proof}</span>
                        <button
                          onClick={() => handleCopy(selectedFile.sha256Proof!)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Copy Fingerprint Hash"
                        >
                          {copiedHash === selectedFile.sha256Proof ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {/* Quick Actions on Selected Decoy */}
                    <div className="mt-3 pt-2.5 border-t border-[#111e33] flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectAction) onSelectAction(`Quarantine Triggered on ${selectedFile.fileName}`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Quarantine File</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectAction) onSelectAction(`Regenerating Watermarks on ${selectedFile.fileName}`);
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-[10.5px] font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        title="Regenerate Zero-Width Watermark"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        <span>Reseal</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Deception Containment Policy Rule */}
                  <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        AUTOMATED ENTRAPMENT POLICY
                      </span>
                    </div>
                    <div className="mt-2 space-y-2 text-[10.5px]">
                      <div className="p-2 rounded bg-[#030610] border border-[#14233c] text-slate-300">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">Active Rule:</span>
                        Auto-silent memory dump + IP trace + Telegram exfil beacon kill
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>DLP Interception:</span>
                        <span className="text-emerald-400 font-semibold font-mono">ENABLED (Strict)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Court Chain-of-Custody:</span>
                        <span className="text-emerald-400 font-semibold font-mono">SIGNED ON-CHAIN</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                    {isCaseCompromised ? 'No File Selected' : 'SAFE: NO DATA BREACHED'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-[200px] leading-relaxed">
                    {isCaseCompromised
                      ? 'Click on any compromised file node on the radar grid to view its forensic access logs.'
                      : 'No compromised files or data breaches detected for this case.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRIPWIRE INCIDENT STREAM                                           */}
        {/* ========================================================================= */}
        {activeTab === 'breach-stream' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Filter Pills */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all ${
                      severityFilter === sev
                        ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Decoy Type:</span>
                {['ALL', 'honey_document', 'ghost_database', 'iam_credential'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      typeFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#081224] text-slate-400 hover:text-white border border-[#162744]'
                    }`}
                  >
                    {t === 'ALL'
                      ? 'All Types'
                      : t === 'honey_document'
                      ? 'Documents'
                      : t === 'ghost_database'
                      ? 'Databases'
                      : 'Tokens'}
                  </button>
                ))}
              </div>
            </div>

            {/* Incidents Table */}
            <div className="flex-1 min-h-0 overflow-y-auto mt-2 rounded-xl border border-[#111e33] bg-[#050b18]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111e33] bg-[#040813] text-[9.5px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-2 px-3">INCIDENT REF</th>
                    <th className="py-2 px-3">TIMESTAMP</th>
                    <th className="py-2 px-3">TARGET HONEYPOT</th>
                    <th className="py-2 px-3">ACCESSOR / BADGE</th>
                    <th className="py-2 px-3">VECTOR / ATTACK METHOD</th>
                    <th className="py-2 px-3">SOURCE TERMINAL / IP</th>
                    <th className="py-2 px-3">CONTAINMENT</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111e33]/70">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="hover:bg-[#091428] cursor-pointer transition-colors group"
                    >
                      {/* Ref & Severity */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {renderSeverityBadge(inc.severity)}
                          <span className="font-mono text-slate-300 font-bold text-[10.5px]">
                            {inc.incidentRef}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                        {inc.timestamp}
                      </td>

                      {/* Target Honeypot */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {renderTypeIcon(inc.decoyType, 'w-3.5 h-3.5')}
                          <span className="font-bold text-slate-200 font-mono truncate max-w-[180px]">
                            {inc.decoyName}
                          </span>
                        </div>
                      </td>

                      {/* Accessor Badge */}
                      <td className="py-2.5 px-3">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-amber-300 font-mono text-[11px]">{inc.accessorBadge}</span>
                            <span className="text-slate-300 text-[10.5px]">({inc.accessorName})</span>
                          </div>
                          <span className="text-[9px] text-slate-500 block">{inc.accessorUnit}</span>
                        </div>
                      </td>

                      {/* Vector */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-300 truncate max-w-[200px] block text-[10.5px]">
                          {inc.attackVector}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate block font-mono">
                          {inc.exfiltrationMethod}
                        </span>
                      </td>

                      {/* Source IP */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-300 text-[10.5px] block">{inc.sourceIp}</span>
                        <span className="text-[9px] text-slate-500 truncate block">{inc.geoLocation}</span>
                      </td>

                      {/* Containment Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            inc.containmentStatus === 'ACTION_REQUIRED'
                              ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                              : inc.containmentStatus === 'UNDER_SURVEILLANCE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              : inc.containmentStatus === 'ISOLATED'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {inc.containmentStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(inc);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0e1f3b] hover:bg-blue-600 text-slate-300 hover:text-white font-medium text-[10.5px] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Forensics</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CANARY ASSET INVENTORY                                             */}
        {/* ========================================================================= */}
        {activeTab === 'asset-inventory' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111e33]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CANARY ASSET REPOSITORY ({filteredAssets.length})
                </span>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Canary Decoy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto mt-3 pr-0.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                      <div className="flex items-center gap-2">
                        {renderTypeIcon(asset.type, 'w-4 h-4')}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {asset.categoryLabel}
                        </span>
                      </div>
                      {renderStatusBadge(asset.status)}
                    </div>

                    {/* Asset Name */}
                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-slate-100 font-mono break-all group-hover:text-amber-400 transition-colors">
                        {asset.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{asset.targetFolder}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-2.5 p-2 rounded bg-[#030610] border border-[#111e33] space-y-1 text-[10.5px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Case Linkage:</span>
                        <span className="font-bold text-cyan-400 font-mono">{asset.caseId}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Sensitivity:</span>
                        <span className="text-amber-300 font-semibold">{asset.sensitivity}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Access Hits:</span>
                        <span className="font-mono font-bold text-red-400">{asset.accessCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Deployed:</span>
                        <span className="font-mono text-slate-300">{asset.deploymentDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(asset.fingerprintHash)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedHash === asset.fingerprintHash ? 'Copied Hash' : 'SHA-256 Hash'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setActiveTab('sensor-grid');
                      }}
                      className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <span>Radar Locate</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INSIDER THREAT ATTRIBUTION MATRIX                                  */}
        {/* ========================================================================= */}
        {activeTab === 'insider-matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 7 cols: Profiles of Flagged Badges */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#070c18] to-red-950/40 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    INTERNAL PERSONNEL EXFILTRATION CORRELATION MATRIX
                  </h3>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Automatic attribution correlating honeypot query logs, zero-width steganographic document seals, and
                  DLP web-egress tripwires.
                </p>
              </div>

              {insiderThreatsData.map((insider) => (
                <div
                  key={insider.id}
                  className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] hover:border-purple-500/50 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={insider.avatar}
                        alt={insider.officerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/60 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{insider.officerName}</h4>
                          <span className="px-2 py-0.2 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 font-mono font-bold text-[10px]">
                            {insider.badgeNumber}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 block">{insider.rank} • {insider.department}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">THREAT RISK SCORE</span>
                      <span className="text-base font-black text-red-400 font-mono">{insider.threatScore} / 100</span>
                    </div>
                  </div>

                  {/* Exfiltrated Assets Pill List */}
                  <div className="mt-3 pt-2 border-t border-[#111e33]">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tripped Honeypot Assets ({insider.exfiltratedAssets.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {insider.exfiltratedAssets.map((ast, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#091325] border border-[#162744] text-[10px] font-mono text-red-300 font-medium"
                        >
                          {ast}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stealth Notes */}
                  <div className="mt-2.5 p-2 rounded bg-[#030610] border border-slate-900 text-[10.5px] text-slate-300 leading-relaxed">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                      Intelligence Assessment:
                    </span>
                    {insider.stealthNotes}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Last active: {insider.lastActive}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectAction && onSelectAction(`Locking Credentials for ${insider.officerName}`)}
                        className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-600 border border-red-500/50 text-red-300 hover:text-white text-[10.5px] font-bold transition-all"
                      >
                        Lockdown Badge Token
                      </button>
                      <button
                        onClick={() => onSelectAction && onSelectAction(`Generating Court Dossier on ${insider.officerName}`)}
                        className="px-2.5 py-1 rounded bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-slate-300 text-[10.5px] font-medium transition-colors"
                      >
                        Export IA Dossier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 cols: Forensic Watermark Chain & Rules */}
            <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#111e33]">
                  <Fingerprint className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    CRYPTOGRAPHIC WATERMARK PROOF CHAIN
                  </span>
                </div>

                <div className="mt-2.5 space-y-2.5 text-xs text-[11px]">
                  {stegoWatermarkSamples.map((sample, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#030610] border border-[#14233c] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 font-mono">{sample.token}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold rounded">
                          SEAL VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Assigned Officer:</span>
                        <span className="text-amber-300 font-bold">{sample.officerName} ({sample.officerBadge})</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Timestamp:</span>
                        <span className="font-mono text-slate-300">{sample.timestamp}</span>
                      </div>
                      <div className="pt-1 text-[9px] font-mono text-slate-500 truncate" title={sample.sha256Signature}>
                        SIG: {sample.sha256Signature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Canary Tripwire Policies */}
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    DECEPTION TRIPWIRE DAEMON
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-[10.5px]">
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Auto-Revoke Session on Canary Trip</span>
                    <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Steganographic Zero-Width Watermarking</span>
                    <span className="text-emerald-400 font-mono font-bold">ON-THE-FLY</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#030610] border border-[#111e33]">
                    <span className="text-slate-300">Live Tor / VPN Node Blacklisting</span>
                    <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STEGANOGRAPHIC WATERMARK LAB                                       */}
        {/* ========================================================================= */}
        {activeTab === 'watermark-lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left 6 cols: Stego Payload Decoder Sandbox */}
            <div className="lg:col-span-6 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-pink-400" />
                    ZERO-WIDTH STEGANOGRAPHIC FILE DECODER
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  CrimeSync embeds invisible zero-width Unicode sequences (`\u200B`, `\u200C`, `\uFEFF`) into all
                  downloaded FIR and evidence documents. If a leaked file is found on Telegram, WhatsApp, or darknet forums,
                  inspect it here to reveal the exact leaker officer badge ID.
                </p>

                {/* Preset sample buttons */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Select Test Leaked Evidence Sample:
                  </span>
                  <div className="space-y-1.5">
                    {stegoWatermarkSamples.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDecodeSample(idx)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                          selectedStegoSample === idx
                            ? 'bg-pink-950/60 border-pink-500/80 text-pink-200'
                            : 'bg-[#081224] border-[#162744] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-pink-400" />
                          <span className="font-mono font-bold">{s.token}</span>
                          <span className="text-[10px] text-slate-400">({s.officerBadge})</span>
                        </div>
                        <span className="text-[10px] font-mono text-pink-400">Click to Inspect</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decode Trigger Button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleDecodeSample(selectedStegoSample)}
                    disabled={isDecoding}
                    className="w-full py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isDecoding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Extracting Zero-Width Steganographic Tokens...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Decode Zero-Width Watermark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Decoded Result Manifest */}
            <div className="lg:col-span-6 flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
              <div className="p-3.5 rounded-xl bg-[#050b18] border border-[#111e33] shadow-xl flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#111e33]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    DECODED FORENSIC MANIFEST
                  </span>
                  {decodedWatermark && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold">
                      VERIFIED MATCH
                    </span>
                  )}
                </div>

                <div className="mt-3 flex-1 bg-[#02050e] rounded-lg border border-[#14233c] p-3 font-mono text-xs overflow-y-auto">
                  {decodedWatermark ? (
                    <pre className="text-emerald-400 leading-relaxed whitespace-pre-wrap">{decodedWatermark}</pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                      <Fingerprint className="w-10 h-10 text-slate-600 mb-2" />
                      <p>No document scanned yet. Select a sample on the left and click "Decode Zero-Width Watermark".</p>
                    </div>
                  )}
                </div>

                {decodedWatermark && (
                  <div className="mt-3 pt-2 border-t border-[#111e33] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(decodedWatermark)}
                      className="px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Forensic Proof</span>
                    </button>

                    <button
                      onClick={() => onSelectAction && onSelectAction('Exporting Steganographic Court Affidavit')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                    >
                      Export Court Affidavit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: DEPLOY NEW CANARY DECOY ───────────────────────────────────── */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-xl bg-[#070e1c] border border-amber-500/40 p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    DEPLOY NEW CANARY HONEYPOT DECOY
                  </h3>
                  <span className="text-[10px] text-slate-400">Configure synthetic lure and tripwire alarm policy</span>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleDeployDecoy} className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {/* Decoy Type */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Decoy Asset Category:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'honey_document', label: 'Honey Document (PDF/DOCX)' },
                    { type: 'ghost_database', label: 'Ghost SQL Table' },
                    { type: 'iam_credential', label: 'Canary Cloud Key' },
                    { type: 'fake_endpoint', label: 'Ghost REST API' },
                    { type: 'stego_media', label: 'Stego Video/CCTV' },
                    { type: 'canary_token', label: 'Physical Vault QR' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setNewDecoyType(item.type as DecoyType)}
                      className={`p-2 rounded-lg border text-left text-[10.5px] font-medium transition-all ${
                        newDecoyType === item.type
                          ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-[#040813] border-[#162744] text-slate-400 hover:text-white'
                      }`}
                    >
                      {renderTypeIcon(item.type as DecoyType, 'w-3.5 h-3.5 mb-1')}
                      <span className="block leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decoy Name */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Decoy File / Resource Name:
                </label>
                <input
                  type="text"
                  required
                  value={newDecoyName}
                  onChange={(e) => setNewDecoyName(e.target.value)}
                  placeholder="e.g., FIR_SECRET_TRANSCRIPTS_HONEY.pdf or pg_decoy://mule_table"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Case Link & Folder Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Target Case ID:
                  </label>
                  <input
                    type="text"
                    value={newDecoyCase}
                    onChange={(e) => setNewDecoyCase(e.target.value)}
                    placeholder="RC-2026-0417"
                    className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Sensitivity Level:
                  </label>
                  <select
                    value={newDecoySensitivity}
                    onChange={(e) => setNewDecoySensitivity(e.target.value as any)}
                    className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Ultra-High">Ultra-High (Instant Lockdown)</option>
                    <option value="Low">Low (Silent Telemetry)</option>
                  </select>
                </div>
              </div>

              {/* Target Folder */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Deployment Directory / Endpoint Path:
                </label>
                <input
                  type="text"
                  value={newDecoyFolder}
                  onChange={(e) => setNewDecoyFolder(e.target.value)}
                  placeholder="/vault/evidence/confidential/"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Fake Bait Payload */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Synthetic Lure Payload Content:
                </label>
                <textarea
                  rows={2}
                  value={newDecoyPayload}
                  onChange={(e) => setNewDecoyPayload(e.target.value)}
                  placeholder="Fabricated banking coordinates, dummy call logs, synthetic CDR records..."
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Auto Containment Policy */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Auto-Containment Tripwire Trigger:
                </label>
                <input
                  type="text"
                  value={newDecoyPolicy}
                  onChange={(e) => setNewDecoyPolicy(e.target.value)}
                  placeholder="Auto-silent memory dump + IP trace + Lock officer token"
                  className="w-full bg-[#040813] border border-[#162744] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#14233c] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0e1d38] border border-[#162744] text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Arm & Deploy Decoy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: INCIDENT FORENSIC INSPECTOR ───────────────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-xl bg-[#060c18] border border-red-500/50 p-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-600/30 border border-red-500 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      CANARY TRIPWIRE FORENSIC DOSSIER
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 font-bold">
                      {selectedIncident.incidentRef}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Timestamp: {selectedIncident.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {/* Accessor Attribution Card */}
              <div className="p-3 rounded-lg bg-[#040813] border border-[#14233c] flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">ATTRIBUTED ACCESSOR</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-white">{selectedIncident.accessorName}</span>
                    <span className="px-2 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-mono font-bold text-[10px]">
                      {selectedIncident.accessorBadge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{selectedIncident.accessorRole} • {selectedIncident.accessorUnit}</span>
                </div>
                {renderSeverityBadge(selectedIncident.severity)}
              </div>

              {/* Vector & Device Fingerprint */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">ATTACK VECTOR</span>
                  <p className="text-[10.5px] font-medium text-slate-200">{selectedIncident.attackVector}</p>
                  <p className="text-[9.5px] font-mono text-slate-400">{selectedIncident.exfiltrationMethod}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">DEVICE & GEOLOCATION</span>
                  <p className="text-[10px] font-mono text-slate-200">{selectedIncident.sourceIp}</p>
                  <p className="text-[9.5px] text-slate-400">{selectedIncident.geoLocation}</p>
                  <p className="text-[8.5px] font-mono text-slate-500">{selectedIncident.deviceUuid}</p>
                </div>
              </div>

              {/* Watermark Match Proof */}
              <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider block">STEGO WATERMARK MATCH</span>
                  <span className="text-[10.5px] font-mono text-slate-200">{selectedIncident.watermarkRecipient || 'No watermark embedded'}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold text-[9px]">
                  MATCH CONFIRMED
                </span>
              </div>

              {/* SHA-256 Tamper Seal */}
              <div className="p-2.5 rounded-lg bg-[#040813] border border-[#14233c] space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EVIDENCE SHA-256 SEAL</span>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <span className="truncate max-w-[450px]">{selectedIncident.sha256Proof}</span>
                  <button
                    onClick={() => handleCopy(selectedIncident.sha256Proof)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Containment Notes */}
              {selectedIncident.containmentNotes && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-[10.5px] text-slate-300">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block mb-0.5">CONTAINMENT DIRECTIVE</span>
                  {selectedIncident.containmentNotes}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-[#14233c] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Chain of Custody: Sealed to Ledger</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(`Revoking Badge ${selectedIncident.accessorBadge}`);
                    setSelectedIncident(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                >
                  Revoke Badge Credentials
                </button>
                <button
                  onClick={() => {
                    const fallbackCase = ALL_CASES[0];
                    const dossier = buildDossierForCase(fallbackCase);
                    dossier.reportName = `Deception Incident Dossier — ${selectedIncident.incidentRef}`;
                    dossier.summary = `Deception tripwire incident report for ${selectedIncident.incidentRef}. Triggered by IP ${selectedIncident.sourceIp} against decoy asset ${selectedIncident.decoyName}. Cryptographically sealed under Section 65B BSA 2023.`;
                    if (onSelectAction) onSelectAction(`Exported Court-Ready PDF Dossier: ${selectedIncident.incidentRef}`);
                    printCourtDossier(dossier);
                    setSelectedIncident(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Court Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeceptionNetworkPage;
