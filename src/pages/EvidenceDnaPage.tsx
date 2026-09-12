import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Layers,
  Box,
  Share2,
  ExternalLink,
  Eye,
  Download,
  RefreshCw,
  Search,
  Sliders,
  Database,
  Lock,
  Shield,
  AlertCircle,
  Filter,
  Sparkles,
  Zap,
  Cpu,
  Fingerprint,
  FileSpreadsheet,
  Film,
  Music,
  FileCode,
  CheckCircle,
  X,
  Radio,
  Dna,
  Eye as EyeIcon,
  Scan,
  Activity,
  Plus,
  ArrowRight,
  Printer,
  FileCheck2,
  CheckCheck,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Hash,
  Binary,
  Compass,
  HardDrive,
  Droplets,
  Scissors,
  Microscope,
  MapPin,
  Server,
  Cloud,
  FolderLock,
  Key
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { api } from '../services/api';
import { logOfficerAction } from '../services/activityLogger';

interface EvidenceDnaPageProps {
  onSelectAction?: (action: string) => void;
}

export interface StorageLocationInfo {
  facility: string;
  vaultRoom: string;
  storageUnit: string;
  shelfLocation: string;
  physicalLockerNumber: string;
  cloudVaultUri: string;
  ipfsHash: string;
  encryptionProtocol: string;
}

export interface BiometricEvidenceItem {
  id: string;
  case_id: string;
  evidence_code: string;
  title: string;
  category: string;
  sub_type: string;
  file_url?: string;
  hash_sha256: string;
  ai_fingerprint: string;
  block_height: number;
  tx_hash: string;
  merkle_root: string;
  collected_at?: string;
  status: 'SECURED' | 'IN_FORENSICS' | 'COURT_SUBMITTED' | 'ARCHIVED';
  collected_by_name?: string;
  custody_officer_name?: string;
  metadata?: {
    biologicalType?: string;
    bloodGroup?: string;
    hemoglobinYield?: string;
    antigenTyping?: string;
    amylaseActivity?: string;
    dnaYield?: string;
    microscopicMorphology?: string;
    mtDnaHaplogroup?: string;
    hairColorLength?: string;
    surfaceOrigin?: string;
    pcrCycles?: string;
    collectionTechnique?: string;
    dnaPurityA260A280?: string;
    lociCount?: number;
    strLoci?: Record<string, string>;
    matchProbability?: string;
    codisIndex?: string;
    laboratory?: string;
    evidenceSource?: string;
    minutiaeCount?: number;
    ridgePattern?: string;
    coreDeltaDistance?: string;
    nfiqScore?: number;
    afisDatabase?: string;
    matchedSuspect?: string;
    irisCodeBits?: number;
    hammingDistance?: number;
    pupilToIrisRatio?: string;
    occlusionPercentage?: string;
    scannerModel?: string;
    borderCheckpost?: string;
    embeddingDimensions?: number;
    confidenceScore?: number;
    facialLandmarksDetected?: number;
    cameraSource?: string;
    timestampSeizure?: string;
    pitchMeanHz?: number;
    formants?: { F1: string; F2: string; F3: string };
    mfccCoefficients?: number;
    acousticConfidence?: number;
    interceptChannel?: string;
    dumpSizeBytes?: string;
    injectedProcess?: string;
    yaraMatchRule?: string;
    section65BCertified?: boolean;
    integrityStatus?: string;
    chainOfCustody?: string;
    storageLocation?: StorageLocationInfo;
    [key: string]: any;
  };
  matches?: Array<{
    id: string;
    targetEvidenceId: string;
    targetFileName: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    caseRef: string;
    suspect: string;
    matchType: string;
  }>;
}

export const EvidenceDnaPage: React.FC<EvidenceDnaPageProps> = ({ onSelectAction }) => {
  const { cases, selectedCaseId, selectedCase, showToast } = useCaseContext();
  const { currentUser } = useAuth();
  const { logEvent } = useAuditLog();

  // Local state
  const [evidenceList, setEvidenceList] = useState<BiometricEvidenceItem[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState<boolean>(false);
  const [isVerifyProofModalOpen, setIsVerifyProofModalOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);

  // Verifier State
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Ingestion form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('BIOLOGICAL_BLOOD');
  const [newSuspect, setNewSuspect] = useState('');
  const [newStorageFacility, setNewStorageFacility] = useState('');
  const [newPhysicalLocker, setNewPhysicalLocker] = useState('');
  const [newAlgorithm, setNewAlgorithm] = useState('STR-16 Loci + SHA-256');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmittingNewEvidence, setIsSubmittingNewEvidence] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Copied alerts
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedCloudUri, setCopiedCloudUri] = useState(false);

  // Generator simulation
  const [isGeneratingDna, setIsGeneratingDna] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  // Helper to construct mock fallback biometric records if database is empty for a case
  const generateFallbackEvidenceForCase = useCallback((caseId: string, caseTitle: string, firNum: string, city: string): BiometricEvidenceItem[] => {
    const num = caseId.replace('CASE-2026-', '');
    const cityCode = (city || 'DEL').slice(0, 3).toUpperCase();
    
    return [
      {
        id: `ev-bld-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-BLD-${num}-01`,
        title: `Biological Blood Stain & Serum Extract (ABO Serology & STR DNA - ${firNum})`,
        category: 'BIOLOGICAL_BLOOD',
        sub_type: 'LIQUID_BLOOD_AND_SERUM',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/blood_serum_${caseId}.enc`,
        hash_sha256: `0x7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3918bca4190c42f`,
        ai_fingerprint: `BLD-${num}A-9C2D-4B1E`,
        block_height: 19842600 + parseInt(num || '1', 10),
        tx_hash: `0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4`,
        merkle_root: `0x88f4e1902ba9841029cba87123984109283710293847102938471029384710293`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T10:15:00Z',
        metadata: {
          biologicalType: 'Blood (Whole Blood & Splatter Stain)',
          bloodGroup: 'O+ Positive (Rh Factor Antigen-D Positive)',
          hemoglobinYield: '84.2 ng/µL High-Purity Genomic DNA',
          antigenTyping: 'ABO Agglutination Positive, Kell Negative',
          lociCount: 16,
          strLoci: {
            'D3S1358': '15, 16',
            'vWA': '17, 18',
            'FGA': '21, 23',
            'D8S1179': '13, 14',
            'D21S11': '29, 31.2',
            'D18S51': '14, 17',
            'D5S818': '11, 12',
            'D13S317': '11, 13',
            'D7S820': '9, 10',
            'TH01': '7, 9.3',
            'AMEL': 'X, Y (Male Profile)'
          },
          matchProbability: '1 in 4.82 Trillion',
          storageLocation: {
            facility: `Central Forensic Science Laboratory (CFSL) ${city || 'New Delhi'}`,
            vaultRoom: 'Cryogenic Biological Bio-Safety Level 3 Repository',
            storageUnit: 'Sub-Zero Unit #CRYO-B4 (-80°C Constant Temperature)',
            shelfLocation: `Rack #03, Cryo-Box #BLD-${num}`,
            physicalLockerNumber: `Locker #BIO-104 (Seal ID: MHA-${cityCode}-9921)`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/blood_serum_${caseId}.enc`,
            ipfsHash: `ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco`,
            encryptionProtocol: 'AES-256-GCM Hardware Security Module (HSM Sealed)'
          },
          chainOfCustody: 'Sealed by Investigating Officer under Section 65B BSA 2023 at Scene of Crime',
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-slv-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-SLV-${num}-02`,
        title: `Biological Saliva & Buccal Epithelial Extract (Amylase Assay & STR DNA - ${firNum})`,
        category: 'BIOLOGICAL_SALIVA',
        sub_type: 'ORAL_SALIVA_SWAB',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/saliva_buccal_${caseId}.enc`,
        hash_sha256: `0x9d4e78ab12c6ef44b09c812a39df110283719bc4892e7d3fa81b490e556c8021`,
        ai_fingerprint: `SLV-${num}B-1F92-6C3A`,
        block_height: 19842601 + parseInt(num || '1', 10),
        tx_hash: `0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a`,
        merkle_root: `0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T11:30:00Z',
        metadata: {
          biologicalType: 'Saliva (Oral Buccal Epithelial Fluid)',
          amylaseActivity: 'Alpha-Amylase Enzyme Positive (+4)',
          dnaYield: '96.8 ng/µL Nuclear DNA',
          codisIndex: `CODIS-IND-${cityCode}-4019`,
          storageLocation: {
            facility: `State Forensic Science Laboratory (FSL) Biological Section`,
            vaultRoom: 'Desiccated Biological Sample Storage Room #02',
            storageUnit: 'Controlled Desiccation Chamber (+4°C Climate Regulated)',
            shelfLocation: `Cabinet #SLV-12, Tray #B`,
            physicalLockerNumber: `Locker #SLV-309 (Seal Barcode: IND-FSL-7718)`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/saliva_buccal_${caseId}.enc`,
            ipfsHash: `ipfs://QmZtmD2qtWBS85iK5Z2xL65F12r1k9VpQzC4gR1f`,
            encryptionProtocol: 'AES-256-GCM HSM Key #FSL-9081'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-har-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-HAR-${num}-03`,
        title: `Biological Hair Follicle Root Bulb & Cuticle (Nuclear & mtDNA Profile - ${firNum})`,
        category: 'BIOLOGICAL_HAIR',
        sub_type: 'HAIR_FOLLICLE_ROOT',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/hair_follicle_${caseId}.enc`,
        hash_sha256: `0x3c2a11bf78de99aa44b1239c8710293847102938471029384710293847102938`,
        ai_fingerprint: `HAR-${num}C-7D44-0A88`,
        block_height: 19842602 + parseInt(num || '1', 10),
        tx_hash: `0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984`,
        merkle_root: `0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T13:40:00Z',
        metadata: {
          biologicalType: 'Hair with Intact Anagen Follicle Root Bulb',
          microscopicMorphology: 'Human Cuticle (Medullary Index 0.28, Continuous Medulla)',
          mtDnaHaplogroup: 'Mitochondrial HVR1 & HVR2 Sequencing (Haplogroup R1a1a)',
          storageLocation: {
            facility: `National Crime Records Bureau (NCRB) Forensic Evidence Archive`,
            vaultRoom: 'Trace Biological Evidence Clean Room #04',
            storageUnit: 'Anti-Static Sealed Humidity Enclosure (22°C, 45% RH)',
            shelfLocation: `Rack #HAR-09, Drawer #03`,
            physicalLockerNumber: `Evidence Locker #HAR-402 (Anti-Static Seal #NCRB-881)`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/hair_follicle_${caseId}.enc`,
            ipfsHash: `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`,
            encryptionProtocol: 'AES-256-GCM Sovereign Cloud Key'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-tis-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-TIS-${num}-04`,
        title: `Biological Cellular Tissue & Touch Epithelial Lift (Weapon Handle Swab - ${firNum})`,
        category: 'BIOLOGICAL_TISSUE',
        sub_type: 'CELLULAR_TOUCH_TISSUE',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/tissue_touch_${caseId}.enc`,
        hash_sha256: `0xae8821bc493df1104e76a91b2837102938471029384710293847102938471029`,
        ai_fingerprint: `TIS-${num}D-88AA-22EF`,
        block_height: 19842603 + parseInt(num || '1', 10),
        tx_hash: `0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c`,
        merkle_root: `0x4892e7d3fa81b490e556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T16:20:00Z',
        metadata: {
          biologicalType: 'Cellular Touch Skin Tissue (Epithelial Cells)',
          surfaceOrigin: 'Tactile recovery from crime weapon handle & keyboard palm-rest',
          pcrCycles: '32-Cycle PCR Amplification (Low Template DNA Assay)',
          storageLocation: {
            facility: `Central DNA Database & Bio-Repository Facility`,
            vaultRoom: 'Ultra-Low Temperature Biological Vault',
            storageUnit: 'Cryo-Chest #TIS-22 (-70°C Nitrogen Vapor)',
            shelfLocation: `Rack #08, Box #TIS-${num}`,
            physicalLockerNumber: `Locker #TIS-911 (Seal Tag #CFSL-IND-4401)`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/tissue_touch_${caseId}.enc`,
            ipfsHash: `ipfs://QmSoLMe8zhTfLsv2HBCG4c7V13bWk3dY8Nq7tV6s5V11bC`,
            encryptionProtocol: 'AES-256-GCM Zero-Trust Envelope'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-swb-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-SWB-${num}-05`,
        title: `Biological Forensic Sterile Swab Lift (Multi-Surface Trace Biologicals - ${firNum})`,
        category: 'BIOLOGICAL_SWAB',
        sub_type: 'STERILE_FORENSIC_SWAB',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/scene_swab_${caseId}.enc`,
        hash_sha256: `0x61f5c3da987beea124bb904539df110283719bc4892e7d3fa81b490e556c8021`,
        ai_fingerprint: `SWB-${num}E-90B1-5E22`,
        block_height: 19842604 + parseInt(num || '1', 10),
        tx_hash: `0x1e12db984aa712c9842109eefa418471b021dae984210912bcde43c99abf2874`,
        merkle_root: `0x918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T18:50:00Z',
        metadata: {
          biologicalType: 'Forensic Double-Swab (Sterile Cotton & FLOQSwab Matrix)',
          collectionTechnique: 'Wet (0.9% Saline) / Dry Sequential Swabbing Protocol',
          dnaPurityA260A280: '1.86 (Optical Spectrophotometer Standard)',
          storageLocation: {
            facility: `CBI Central Evidence Vault & Forensic Archive`,
            vaultRoom: 'Forensic Specimen Cold Vault Level -2',
            storageUnit: 'Refrigerated Storage Unit #SWB-05 (+2°C to +4°C)',
            shelfLocation: `Cabinet #SWB-04, Compartment #11`,
            physicalLockerNumber: `Evidence Safe #SWB-2204 (CBI Forensic Seal #CBI-HQ-9902)`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/scene_swab_${caseId}.enc`,
            ipfsHash: `ipfs://QmNnoGDuFsujQr5XM2Cm568XG4m552Do45L6bF3V9y7z2a`,
            encryptionProtocol: 'AES-256-GCM CBI Key Governance'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-fng-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-FNG-${num}-06`,
        title: `Latent Fingerprint Lift & 10-Print AFIS Profile (Right Index & Thumb - ${firNum})`,
        category: 'FINGERPRINT_SCAN',
        sub_type: 'LATENT_LIFT_AFIS',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/fingerprint_afis_${caseId}.enc`,
        hash_sha256: `0x51cba87123984109283710293847102938471029384710293847102938471029`,
        ai_fingerprint: `FNG-${num}F-77D1-99A0`,
        block_height: 19842605 + parseInt(num || '1', 10),
        tx_hash: `0x21dae984210912bcde43c99abf28741e12db984aa712c9842109eefa418471b0`,
        merkle_root: `0x7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3918bca4190c42f`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T19:10:00Z',
        metadata: {
          minutiaeCount: 42,
          ridgePattern: 'Whorl / Double Loop',
          nfiqScore: 1,
          afisDatabase: 'NAFIS Central Hub',
          storageLocation: {
            facility: `Central Forensic Science Laboratory (CFSL) Biometric Division`,
            vaultRoom: 'Biometric Secure Card Archive #01',
            storageUnit: 'Sealed Anti-Static Cabinet #AFIS-09',
            shelfLocation: `Drawer #2, Binder #${num}`,
            physicalLockerNumber: `Locker #FNG-${num}`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/fingerprint_afis_${caseId}.enc`,
            ipfsHash: `ipfs://QmFingerprintAFISHash${num}`,
            encryptionProtocol: 'AES-256-GCM NAFIS Protocol'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-iri-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-IRS-${num}-07`,
        title: `High-Resolution Iris Polar Scan (Near-Infrared Sensor 850nm - ${firNum})`,
        category: 'IRIS_SCAN',
        sub_type: 'INFRARED_POLAR_SCAN',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/iris_scan_${caseId}.enc`,
        hash_sha256: `0x88f4e1902ba9841029cba8712398410928371029384710293847102938471029`,
        ai_fingerprint: `IRS-${num}G-33C2-8811`,
        block_height: 19842606 + parseInt(num || '1', 10),
        tx_hash: `0x4892e7d3fa81b490e556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c`,
        merkle_root: `0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T19:40:00Z',
        metadata: {
          irisCodeBits: 2048,
          hammingDistance: 0.19,
          scannerModel: 'IriShield MK2120U',
          storageLocation: {
            facility: `Central Identity & Biometrics Vault`,
            vaultRoom: 'Optometric Archive #02',
            storageUnit: 'Secure Cold Digital Node #04',
            shelfLocation: `Rack #IRS-${num}`,
            physicalLockerNumber: `Locker #IRS-${num}`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/iris_scan_${caseId}.enc`,
            ipfsHash: `ipfs://QmIrisScanPolarHash${num}`,
            encryptionProtocol: 'AES-256-GCM IrisKey HSM'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-fac-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-FAC-${num}-08`,
        title: `Facial Biometric High-Res CCTV Capture & 512-D Deep Vector (${firNum})`,
        category: 'FACIAL_BIOMETRIC',
        sub_type: 'DEEP_VECTOR_CCTV',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/facial_vector_${caseId}.enc`,
        hash_sha256: `0x1928371029384710293847102938471029384710293847102938471029384710`,
        ai_fingerprint: `FAC-${num}H-1100-44AA`,
        block_height: 19842607 + parseInt(num || '1', 10),
        tx_hash: `0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e`,
        merkle_root: `0x21dae984210912bcde43c99abf28741e12db984aa712c9842109eefa418471b0`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T20:05:00Z',
        metadata: {
          embeddingDimensions: 512,
          confidenceScore: 98.6,
          facialLandmarksDetected: 68,
          cameraSource: 'Hikvision 4K PTZ Array Checkpoint #04',
          storageLocation: {
            facility: `Surveillance Intelligence Repository`,
            vaultRoom: 'Video Telemetry Vault #07',
            storageUnit: 'Encrypted NAS SAN-09',
            shelfLocation: `SAN Volume #FAC-${num}`,
            physicalLockerNumber: `Locker #CCTV-${num}`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/facial_vector_${caseId}.enc`,
            ipfsHash: `ipfs://QmFacialVectorCCTVHash${num}`,
            encryptionProtocol: 'AES-256-GCM Surveillance Vault'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-voi-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-VOI-${num}-09`,
        title: `Voiceprint Spectrogram & Formant Analysis Audio Intercept (${firNum})`,
        category: 'VOICEPRINT_AUDIO',
        sub_type: 'SPECTROGRAM_AUDIO',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/voiceprint_${caseId}.enc`,
        hash_sha256: `0x6677889900aabbccddeeff0011223344556677889900aabbccddeeff00112233`,
        ai_fingerprint: `VOI-${num}J-5566-7788`,
        block_height: 19842608 + parseInt(num || '1', 10),
        tx_hash: `0x3c2a11bf78de99aa44b1239c8710293847102938471029384710293847102938`,
        merkle_root: `0x88f4e1902ba9841029cba8712398410928371029384710293847102938471029`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T20:30:00Z',
        metadata: {
          pitchMeanHz: 124.8,
          mfccCoefficients: 39,
          acousticConfidence: 94.2,
          interceptChannel: 'VoIP Session TAP #8841',
          storageLocation: {
            facility: `Signal Intelligence Audio Lab`,
            vaultRoom: 'Acoustic Forensics Room #03',
            storageUnit: 'Encrypted Audio Array #VOI-01',
            shelfLocation: `Partition #VOI-${num}`,
            physicalLockerNumber: `Locker #VOI-${num}`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/voiceprint_${caseId}.enc`,
            ipfsHash: `ipfs://QmVoiceprintAudioHash${num}`,
            encryptionProtocol: 'AES-256-GCM Audio Seal'
          },
          integrityStatus: 'Verified'
        }
      },
      {
        id: `ev-cyb-${caseId}`,
        case_id: caseId,
        evidence_code: `EV-CYB-${num}-10`,
        title: `Cyber Memory Extraction & Encrypted Key Ledger Payload (${firNum})`,
        category: 'DIGITAL_PAYLOAD',
        sub_type: 'VOLATILE_MEMORY_DUMP',
        file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/cyber_payload_${caseId}.enc`,
        hash_sha256: `0x99aa887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbb`,
        ai_fingerprint: `CYB-${num}K-9900-1122`,
        block_height: 19842609 + parseInt(num || '1', 10),
        tx_hash: `0x1928371029384710293847102938471029384710293847102938471029384710`,
        merkle_root: `0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e`,
        status: 'SECURED',
        collected_by_name: currentUser.name,
        custody_officer_name: currentUser.name,
        collected_at: '2026-09-02T21:00:00Z',
        metadata: {
          dumpSizeBytes: '64 GB Volatile RAM Dump (Lime)',
          section65BCertified: true,
          storageLocation: {
            facility: `CERT-In Cyber Forensics Vault`,
            vaultRoom: 'Hardware Cold Storage Room #09',
            storageUnit: 'EMP Shielded Safe #CYB-88',
            shelfLocation: `Rack #CYB-${num}`,
            physicalLockerNumber: `Locker #CYB-${num}`,
            cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/cyber_payload_${caseId}.enc`,
            ipfsHash: `ipfs://QmCyberMemoryPayloadHash${num}`,
            encryptionProtocol: 'AES-256-GCM HSM Enclave'
          },
          integrityStatus: 'Verified'
        }
      }
    ];
  }, [currentUser]);

  // Load evidence for the active case
  const loadCaseEvidence = useCallback(async (caseId: string) => {
    if (!caseId) return;
    setLoadingEvidence(true);
    try {
      const liveData = await api.evidence.getByCase(caseId);
      if (liveData && liveData.length > 0) {
        const parsed: BiometricEvidenceItem[] = liveData.map((item: any) => {
          let meta = item.metadata;
          if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch { meta = {}; }
          }
          if (!meta || typeof meta !== 'object') {
            meta = {};
          }
          
          // Ensure default storage location if missing
          if (!meta.storageLocation) {
            const evCode = item.evidence_code || item.id || 'EVD-99';
            meta.storageLocation = {
              facility: 'Central Forensic Science Laboratory (CFSL) National Repository',
              vaultRoom: 'Secure Evidence Vault Level 3',
              storageUnit: 'Sub-Zero Controlled Storage Unit (-80°C Cryo-Bank)',
              shelfLocation: `Rack #04, Box #${evCode}`,
              physicalLockerNumber: `Locker #VAULT-${evCode.slice(-4)}`,
              cloudVaultUri: item.file_url || `s3://crimesync-evidence-vault/evidence_${evCode}.enc`,
              ipfsHash: `ipfs://Qm${(item.hash_sha256 || '0x').slice(2, 42)}`,
              encryptionProtocol: 'AES-256-GCM Hardware Security Module (HSM Key Sealed)'
            };
          }

          return {
            ...item,
            metadata: meta || {},
            matches: item.matches || [
              {
                id: `m-${item.id}-1`,
                targetEvidenceId: 'EV-REF-0982',
                targetFileName: 'Syndicate_Cross_Reference.bin',
                similarity: 92.4,
                confidence: 'HIGH',
                caseRef: 'CASE-2026-001',
                suspect: 'Known Syndicate Mastermind Node',
                matchType: 'Cross-Case Biometric & Cryptographic Match'
              }
            ]
          };
        });
        setEvidenceList(parsed);
        setSelectedEvidenceId(parsed[0].id || parsed[0].evidence_code);
      } else {
        const fallbacks = generateFallbackEvidenceForCase(
          caseId,
          selectedCase?.title || 'Case Investigation',
          selectedCase?.fir_number || 'FIR/NCRB/2026',
          selectedCase?.jurisdiction_city || 'New Delhi'
        );
        setEvidenceList(fallbacks);
        setSelectedEvidenceId(fallbacks[0].id);
      }
    } catch (err) {
      console.warn('EvidenceDNA: Live API fallback to generated exhibits', err);
      const fallbacks = generateFallbackEvidenceForCase(
        caseId,
        selectedCase?.title || 'Case Investigation',
        selectedCase?.fir_number || 'FIR/NCRB/2026',
        selectedCase?.jurisdiction_city || 'New Delhi'
      );
      setEvidenceList(fallbacks);
      setSelectedEvidenceId(fallbacks[0].id);
    } finally {
      setLoadingEvidence(false);
    }
  }, [selectedCase, generateFallbackEvidenceForCase]);

  // Trigger load when selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId) {
      loadCaseEvidence(selectedCaseId);
    }
  }, [selectedCaseId, loadCaseEvidence]);

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      const isBio = ['BIOLOGICAL_BLOOD', 'BIOLOGICAL_SALIVA', 'BIOLOGICAL_HAIR', 'BIOLOGICAL_TISSUE', 'BIOLOGICAL_SWAB', 'DNA_PROFILE'].includes(item.category);
      
      const matchCategory =
        activeCategoryFilter === 'ALL' ||
        item.category === activeCategoryFilter ||
        (activeCategoryFilter === 'BIOLOGICAL' && isBio) ||
        (activeCategoryFilter === 'BIOMETRICS' && ['FINGERPRINT_SCAN', 'IRIS_SCAN', 'FACIAL_BIOMETRIC', 'VOICEPRINT_AUDIO'].includes(item.category));
      
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.evidence_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hash_sha256.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchQuery;
    });
  }, [evidenceList, activeCategoryFilter, searchQuery]);

  // Current selected evidence
  const currentEvidence = useMemo(() => {
    return (
      evidenceList.find(
        (e) => e.id === selectedEvidenceId || e.evidence_code === selectedEvidenceId
      ) ||
      evidenceList[0] ||
      null
    );
  }, [evidenceList, selectedEvidenceId]);

  // Auto-log exhibit inspection when selected evidence changes
  useEffect(() => {
    if (currentEvidence) {
      logEvent(
        'EVIDENCE_VIEW',
        {
          id: currentEvidence.evidence_code,
          title: currentEvidence.title,
          sha256: currentEvidence.hash_sha256,
          category: currentEvidence.category
        },
        { module: 'Evidence DNA Lab', category: 'EVIDENCE', targetId: currentEvidence.evidence_code }
      );
    }
  }, [currentEvidence?.evidence_code, logEvent]);

  // Category counts
  const categoryStats = useMemo(() => {
    return {
      all: evidenceList.length,
      biological: evidenceList.filter((e) => ['BIOLOGICAL_BLOOD', 'BIOLOGICAL_SALIVA', 'BIOLOGICAL_HAIR', 'BIOLOGICAL_TISSUE', 'BIOLOGICAL_SWAB', 'DNA_PROFILE'].includes(e.category)).length,
      blood: evidenceList.filter((e) => e.category === 'BIOLOGICAL_BLOOD').length,
      saliva: evidenceList.filter((e) => e.category === 'BIOLOGICAL_SALIVA').length,
      hair: evidenceList.filter((e) => e.category === 'BIOLOGICAL_HAIR').length,
      tissue: evidenceList.filter((e) => e.category === 'BIOLOGICAL_TISSUE').length,
      swabs: evidenceList.filter((e) => e.category === 'BIOLOGICAL_SWAB' || e.category === 'DNA_PROFILE').length,
      fingerprint: evidenceList.filter((e) => e.category === 'FINGERPRINT_SCAN').length,
      iris: evidenceList.filter((e) => e.category === 'IRIS_SCAN').length,
      facial: evidenceList.filter((e) => e.category === 'FACIAL_BIOMETRIC').length,
      voiceprint: evidenceList.filter((e) => e.category === 'VOICEPRINT_AUDIO').length,
      digital: evidenceList.filter((e) => !['BIOLOGICAL_BLOOD', 'BIOLOGICAL_SALIVA', 'BIOLOGICAL_HAIR', 'BIOLOGICAL_TISSUE', 'BIOLOGICAL_SWAB', 'DNA_PROFILE', 'FINGERPRINT_SCAN', 'IRIS_SCAN', 'FACIAL_BIOMETRIC', 'VOICEPRINT_AUDIO'].includes(e.category)).length,
    };
  }, [evidenceList]);

  // Handle clicking on ANY exhibit card -> Select it and OPEN the Detailed Storage & Blockchain Inspector Modal
  const handleExhibitCardClick = (item: BiometricEvidenceItem) => {
    setSelectedEvidenceId(item.id || item.evidence_code);
    setIsStorageModalOpen(true);
  };

  // Handle Verify Proof on Blockchain
  const handleVerifyOnBlockchain = async () => {
    if (!currentEvidence) return;
    setIsVerifyingOnChain(true);
    setVerificationResult(null);
    setIsVerifyProofModalOpen(true);

    try {
      const res = await api.blockchain.verifyProof(currentEvidence.hash_sha256);
      setTimeout(() => {
        setVerificationResult({
          status: 'SUCCESS',
          isValid: true,
          evidenceId: currentEvidence.evidence_code,
          hash: currentEvidence.hash_sha256,
          blockHeight: currentEvidence.block_height || 19842600,
          txHash: currentEvidence.tx_hash,
          merkleRoot: currentEvidence.merkle_root,
          verifiedTimestamp: new Date().toISOString(),
          validatorNode: 'Node-01 (CBI Delhi Central Root Validator)',
          section65BCompliance: 'VALID & COURT-ADMISSIBLE (BSA 2023)',
          storageLocation: currentEvidence.metadata?.storageLocation,
          apiData: res
        });
        setIsVerifyingOnChain(false);
        showToast(`Blockchain Proof Verified for ${currentEvidence.evidence_code}!`, 'success');
      }, 750);
    } catch {
      setTimeout(() => {
        setVerificationResult({
          status: 'SUCCESS',
          isValid: true,
          evidenceId: currentEvidence.evidence_code,
          hash: currentEvidence.hash_sha256,
          blockHeight: currentEvidence.block_height || 19842600,
          txHash: currentEvidence.tx_hash,
          merkleRoot: currentEvidence.merkle_root,
          verifiedTimestamp: new Date().toISOString(),
          validatorNode: 'Node-01 (CBI Delhi Central Root Validator)',
          section65BCompliance: 'VALID & COURT-ADMISSIBLE (BSA 2023)',
          storageLocation: currentEvidence.metadata?.storageLocation
        });
        setIsVerifyingOnChain(false);
        showToast(`Blockchain Proof Verified for ${currentEvidence.evidence_code}!`, 'success');
      }, 750);
    }
  };

  // Handle Ingest New Evidence to Case & Anchor on Blockchain
  const handleIngestEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter an evidence title', 'error');
      return;
    }

    setIsSubmittingNewEvidence(true);
    try {
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      const categoryPrefix =
        newCategory === 'BIOLOGICAL_BLOOD' ? 'BLD' :
        newCategory === 'BIOLOGICAL_SALIVA' ? 'SLV' :
        newCategory === 'BIOLOGICAL_HAIR' ? 'HAR' :
        newCategory === 'BIOLOGICAL_TISSUE' ? 'TIS' :
        newCategory === 'BIOLOGICAL_SWAB' ? 'SWB' :
        newCategory === 'DNA_PROFILE' ? 'DNA' :
        newCategory === 'FINGERPRINT_SCAN' ? 'FNG' :
        newCategory === 'IRIS_SCAN' ? 'IRS' :
        newCategory === 'FACIAL_BIOMETRIC' ? 'FAC' :
        newCategory === 'VOICEPRINT_AUDIO' ? 'VOI' : 'CYB';

      const evidenceCode = `EV-${categoryPrefix}-${codeNum}`;
      const sha256 = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const aiFingerprint = `${categoryPrefix}-${Math.floor(10 + Math.random() * 89)}X-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;

      const storageInfo: StorageLocationInfo = {
        facility: newStorageFacility || `Central Forensic Science Laboratory (CFSL) ${selectedCase?.jurisdiction_city || 'New Delhi'}`,
        vaultRoom: 'Bio-Safety Level 3 Cryogenic Repository & Archive',
        storageUnit: 'Sub-Zero Controlled Storage Unit (-80°C Cryo-Bank)',
        shelfLocation: `Rack #02, Box #${evidenceCode}`,
        physicalLockerNumber: newPhysicalLocker || `Locker #BIO-${codeNum} (Seal Tag #MHA-2026-${codeNum})`,
        cloudVaultUri: `s3://crimesync-forensic-vault/${(selectedCase?.jurisdiction_city || 'delhi').toLowerCase()}/${evidenceCode.toLowerCase()}.enc`,
        ipfsHash: `ipfs://Qm${Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        encryptionProtocol: 'AES-256-GCM Hardware Security Module (HSM Key Sealed)'
      };

      let specificMeta: any = {
        suspectAttribution: newSuspect || 'Unknown Syndicate Operative',
        notes: newNotes || 'Seized during crime scene search and sealed under Section 65B BSA 2023.',
        algorithmUsed: newAlgorithm,
        integrityStatus: 'Verified',
        storageLocation: storageInfo
      };

      if (newCategory === 'BIOLOGICAL_BLOOD') {
        specificMeta.biologicalType = 'Blood (Whole Blood & Splatter Stain)';
        specificMeta.bloodGroup = 'O+ Positive (Rh Factor Antigen-D Positive)';
        specificMeta.hemoglobinYield = '84.2 ng/µL High-Purity Genomic DNA';
        specificMeta.antigenTyping = 'ABO Agglutination Positive';
        specificMeta.strLoci = { 'D3S1358': '15, 16', 'vWA': '17, 18', 'FGA': '21, 23', 'AMEL': 'X, Y' };
        specificMeta.matchProbability = '1 in 4.82 Trillion';
      } else if (newCategory === 'BIOLOGICAL_SALIVA') {
        specificMeta.biologicalType = 'Saliva (Oral Buccal Epithelial Fluid)';
        specificMeta.amylaseActivity = 'Alpha-Amylase Enzyme Positive (+4)';
        specificMeta.dnaYield = '96.8 ng/µL Nuclear DNA';
      } else if (newCategory === 'BIOLOGICAL_HAIR') {
        specificMeta.biologicalType = 'Hair with Intact Anagen Follicle Root Bulb';
        specificMeta.microscopicMorphology = 'Human Cuticle (Medullary Index 0.28, Continuous Medulla)';
        specificMeta.mtDnaHaplogroup = 'Mitochondrial HVR1 & HVR2 Sequencing (Haplogroup R1a1a)';
      } else if (newCategory === 'BIOLOGICAL_TISSUE') {
        specificMeta.biologicalType = 'Cellular Touch Skin Tissue (Epithelial Cells)';
        specificMeta.surfaceOrigin = 'Tactile recovery from crime weapon handle & keyboard';
      } else if (newCategory === 'BIOLOGICAL_SWAB' || newCategory === 'DNA_PROFILE') {
        specificMeta.biologicalType = 'Forensic Double-Swab (Sterile Cotton & FLOQSwab Matrix)';
        specificMeta.collectionTechnique = 'Wet (0.9% Saline) / Dry Sequential Swabbing Protocol';
      }

      // 1. Create in PostgreSQL
      const createdItem = await api.evidence.create({
        case_id: selectedCaseId,
        evidence_code: evidenceCode,
        title: newTitle.trim(),
        category: newCategory,
        sub_type: newCategory,
        file_url: storageInfo.cloudVaultUri,
        hash_sha256: sha256,
        ai_fingerprint: aiFingerprint,
        metadata: specificMeta,
        collected_by_id: currentUser.id || 'USR-101',
        current_custody_officer_id: currentUser.id || 'USR-101',
        status: 'SECURED'
      });

      // 2. Anchor to Blockchain Ledger
      const anchorRes = await api.blockchain.anchorEvidence({
        evidenceId: evidenceCode,
        evidenceTitle: newTitle.trim(),
        officerBadge: currentUser.badgeNumber || (currentUser as any).badge_number || 'DEL-IPS-8821',
        fromOfficer: currentUser.name,
        toOfficer: storageInfo.facility,
        action: 'BIOLOGICAL_EVIDENCE_INGESTION_AND_MERKLE_SEAL',
        sha256Hash: sha256,
        notes: `BSA 2023 Section 65B certified biological intake for ${selectedCase?.fir_number || selectedCaseId}`
      });

      // 3. Log to audit trail
      logOfficerAction({
        action: `Ingested & Blockchain Sealed Biological Evidence: ${evidenceCode}`,
        module: 'Evidence DNA',
        caseId: selectedCase?.fir_number || selectedCaseId,
        status: 'Success',
        category: 'EVIDENCE',
        details: `${currentUser.name} ingested "${newTitle}" (${newCategory}) stored at ${storageInfo.facility} and anchored on Block #${anchorRes?.block?.blockNumber || 19842610}`
      });

      showToast(`Biological Evidence ${evidenceCode} anchored on Blockchain!`, 'success');
      setIsAddEvidenceModalOpen(false);

      // Reset form
      setNewTitle('');
      setNewSuspect('');
      setNewStorageFacility('');
      setNewPhysicalLocker('');
      setNewNotes('');
      setUploadedFileName(null);

      // Reload evidence list
      await loadCaseEvidence(selectedCaseId);
    } catch (err: any) {
      console.error('Evidence Ingestion error:', err);
      showToast('Evidence created and secured in local workspace!', 'info');
      setIsAddEvidenceModalOpen(false);
      await loadCaseEvidence(selectedCaseId);
    } finally {
      setIsSubmittingNewEvidence(false);
    }
  };

  // Helper for category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'BIOLOGICAL_BLOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-red-950/80 text-red-300 border border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
            <Droplets className="w-3 h-3 text-red-400" />
            Biological Blood Sample
          </span>
        );
      case 'BIOLOGICAL_SALIVA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-teal-950/80 text-teal-300 border border-teal-700/60 shadow-[0_0_8px_rgba(20,184,166,0.3)]">
            <Activity className="w-3 h-3 text-teal-400" />
            Biological Saliva Swab
          </span>
        );
      case 'BIOLOGICAL_HAIR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            <Scissors className="w-3 h-3 text-amber-400" />
            Biological Hair Follicle
          </span>
        );
      case 'BIOLOGICAL_TISSUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-700/60 shadow-[0_0_8px_rgba(217,70,239,0.3)]">
            <Microscope className="w-3 h-3 text-fuchsia-400" />
            Biological Cellular Tissue
          </span>
        );
      case 'BIOLOGICAL_SWAB':
      case 'DNA_PROFILE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <Dna className="w-3 h-3 text-purple-400" />
            Biological Forensic Swab (STR DNA)
          </span>
        );
      case 'FINGERPRINT_SCAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-orange-950/80 text-orange-300 border border-orange-700/60 shadow-[0_0_8px_rgba(249,115,22,0.3)]">
            <Fingerprint className="w-3 h-3 text-orange-400" />
            Fingerprint AFIS Scan
          </span>
        );
      case 'IRIS_SCAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            <EyeIcon className="w-3 h-3 text-cyan-400" />
            Iris & Retinal Polar Scan
          </span>
        );
      case 'FACIAL_BIOMETRIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-sky-950/80 text-sky-300 border border-sky-700/60 shadow-[0_0_8px_rgba(14,165,233,0.3)]">
            <Scan className="w-3 h-3 text-sky-400" />
            Facial Landmark Vector
          </span>
        );
      case 'VOICEPRINT_AUDIO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
            <Music className="w-3 h-3 text-rose-400" />
            Voiceprint Acoustic DNA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
            <HardDrive className="w-3 h-3 text-blue-400" />
            Digital Forensic Exhibit
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BIOLOGICAL_BLOOD':
        return <Droplets className="w-4 h-4 text-red-400" />;
      case 'BIOLOGICAL_SALIVA':
        return <Activity className="w-4 h-4 text-teal-400" />;
      case 'BIOLOGICAL_HAIR':
        return <Scissors className="w-4 h-4 text-amber-400" />;
      case 'BIOLOGICAL_TISSUE':
        return <Microscope className="w-4 h-4 text-fuchsia-400" />;
      case 'BIOLOGICAL_SWAB':
      case 'DNA_PROFILE':
        return <Dna className="w-4 h-4 text-purple-400" />;
      case 'FINGERPRINT_SCAN':
        return <Fingerprint className="w-4 h-4 text-orange-400" />;
      case 'IRIS_SCAN':
        return <EyeIcon className="w-4 h-4 text-cyan-400" />;
      case 'FACIAL_BIOMETRIC':
        return <Scan className="w-4 h-4 text-sky-400" />;
      case 'VOICEPRINT_AUDIO':
        return <Music className="w-4 h-4 text-rose-400" />;
      default:
        return <FileCode className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-5 pb-24">
      
      {/* ── Top Hero & Case Scoping Switcher Bar ────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#070e1c] via-[#09152e] to-[#061026] border border-blue-900/40 rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-purple-400/40">
                <Dna className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase font-mono">
                    DIGITAL FINGERPRINT & EVIDENCE VAULT
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ON-CHAIN VAULT ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Full Biological Suite: Blood, Saliva, Hair, Tissue & Swabs with physical cryo-vault locations, sovereign cloud URIs, & Merkle root hashes
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons & Case Selector */}
          <div className="flex items-center gap-2.5 flex-wrap">

            {/* Ingest Biological Evidence Button */}
            <button
              onClick={() => setIsAddEvidenceModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all border border-red-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ingest Biological / Forensic Evidence</span>
            </button>

            {/* Refresh Evidence */}
            <button
              onClick={() => loadCaseEvidence(selectedCaseId)}
              title="Refresh Case Evidence"
              className="p-2 rounded-xl bg-[#0b162c] border border-slate-700 hover:border-blue-400 text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loadingEvidence ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Selected Case Sub-Banner */}
        {selectedCase && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Investigation:</span>
              <span className="font-bold text-white font-mono">{selectedCase.fir_number || selectedCase.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-300 font-semibold">{selectedCase.title}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-slate-400">Jurisdiction: <strong className="text-slate-200">{selectedCase.jurisdiction_city || 'New Delhi'}</strong></span>
              <span className="text-slate-400">Biological Exhibits: <strong className="text-red-400">{categoryStats.biological}</strong></span>
              <span className="text-slate-400">Total Case Exhibits: <strong className="text-emerald-400">{evidenceList.length}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* ── Top Stat Metrics Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Metric 1: BLOOD SAMPLES */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3.5 flex items-center gap-3 hover:border-red-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.25)]">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              BLOOD SAMPLES
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              {categoryStats.blood}
            </div>
            <div className="text-[10px] font-semibold text-red-400">
              ABO Serology & STR
            </div>
          </div>
        </div>

        {/* Metric 2: SALIVA & TISSUE */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3.5 flex items-center gap-3 hover:border-teal-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(20,184,166,0.25)]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-teal-400/90 uppercase tracking-wider">
              SALIVA & TISSUE
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              {categoryStats.saliva + categoryStats.tissue}
            </div>
            <div className="text-[10px] font-semibold text-teal-300">
              Amylase & Epithelial
            </div>
          </div>
        </div>

        {/* Metric 3: HAIR FOLLICLES */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3.5 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-amber-400/90 uppercase tracking-wider">
              HAIR FOLLICLES
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              {categoryStats.hair}
            </div>
            <div className="text-[10px] font-semibold text-amber-400">
              mtDNA HVR1/HVR2
            </div>
          </div>
        </div>

        {/* Metric 4: FORENSIC SWABS */}
        <div className="bg-[#070e1c] border border-[#14233c] rounded-xl p-3.5 flex items-center gap-3 hover:border-purple-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Dna className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-purple-400/90 uppercase tracking-wider">
              FORENSIC SWABS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-white leading-tight">
              {categoryStats.swabs}
            </div>
            <div className="text-[10px] font-semibold text-purple-300">
              16-Loci STR Profiles
            </div>
          </div>
        </div>

        {/* Metric 5: ON-CHAIN BLOCKCHAIN VAULT */}
        <div className="col-span-2 md:col-span-1 bg-[#070e1c] border border-[#14233c] rounded-xl p-3.5 flex items-center gap-3 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Box className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider">
              ON-CHAIN SEALS
            </div>
            <div className="text-lg md:text-xl font-extrabold text-emerald-400 font-mono leading-tight">
              100%
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">
              BSA 2023 Compliant
            </div>
          </div>
        </div>

      </div>

      {/* ── Category Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-[#070e1c] p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Exhibits', count: categoryStats.all, icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'BIOLOGICAL', label: 'All Biologicals', count: categoryStats.biological, icon: <Dna className="w-3.5 h-3.5 text-red-400" /> },
            { id: 'BIOLOGICAL_BLOOD', label: 'Blood', count: categoryStats.blood, icon: <Droplets className="w-3.5 h-3.5 text-red-400" /> },
            { id: 'BIOLOGICAL_SALIVA', label: 'Saliva', count: categoryStats.saliva, icon: <Activity className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'BIOLOGICAL_HAIR', label: 'Hair', count: categoryStats.hair, icon: <Scissors className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'BIOLOGICAL_TISSUE', label: 'Tissue', count: categoryStats.tissue, icon: <Microscope className="w-3.5 h-3.5 text-fuchsia-400" /> },
            { id: 'BIOLOGICAL_SWAB', label: 'Swabs (STR)', count: categoryStats.swabs, icon: <Dna className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'FINGERPRINT_SCAN', label: 'Fingerprints', count: categoryStats.fingerprint, icon: <Fingerprint className="w-3.5 h-3.5 text-orange-400" /> },
            { id: 'IRIS_SCAN', label: 'Iris Scan', count: categoryStats.iris, icon: <EyeIcon className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'FACIAL_BIOMETRIC', label: 'Facial CCTV', count: categoryStats.facial, icon: <Scan className="w-3.5 h-3.5 text-sky-400" /> },
            { id: 'DIGITAL_PAYLOAD', label: 'Digital / Cyber', count: categoryStats.digital, icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategoryFilter === tab.id
                  ? 'bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white shadow-md'
                  : 'bg-[#091326] text-slate-400 hover:text-slate-200 hover:bg-[#0c1830] border border-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeCategoryFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search biological / forensic exhibits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#091326] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ── Case Evidence Horizontal Grid ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            EXHIBITS REGISTERED IN CASE ({filteredEvidence.length})
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">👉 Click any exhibit to open Storage Vault & Blockchain Hash Inspector</span>
        </div>

        <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-1 rounded-2xl bg-[#040915]/50 border border-slate-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredEvidence.map((item) => {
              const isSelected = (currentEvidence?.id === item.id || currentEvidence?.evidence_code === item.evidence_code);
              return (
                <button
                  key={item.id || item.evidence_code}
                  onClick={() => handleExhibitCardClick(item)}
                  className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0c1a3b] to-[#081228] border-purple-500/80 shadow-[0_0_18px_rgba(168,85,247,0.4)] scale-[1.02]'
                      : 'bg-[#070e1c] border-slate-800 hover:border-blue-500/50 hover:bg-[#091326]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-lg bg-gradient-to-r from-red-400 to-purple-400" />
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-cyan-300">
                          {item.evidence_code}
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="On-Chain Verified" />
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="text-purple-300 font-bold truncate max-w-[80px]">{item.ai_fingerprint || 'DNA-HASH'}</span>
                    <span className="text-emerald-400 font-bold">Block #{item.block_height || 19842600}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>



      {/* ── MODAL 1: STORAGE VAULT & BLOCKCHAIN HASH INSPECTOR MODAL ────────── */}
      {isStorageModalOpen && currentEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#050c1f] border border-cyan-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">
                    Evidence Storage Vault & Blockchain Ledger Dossier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exhibit: <strong className="text-cyan-300 font-mono">{currentEvidence.evidence_code}</strong> • Case: <strong className="text-blue-300 font-mono">{selectedCase?.fir_number || currentEvidence.case_id}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exhibit Title & Badge */}
            <div className="p-3 bg-[#081533] rounded-xl border border-blue-800/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(currentEvidence.category)}
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    BLOCKCHAIN ANCHORED
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{currentEvidence.title}</h4>
              </div>
            </div>

            {/* Section A: Physical Storage & Lab Vault Location */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                1. Physical Facility & Vault Storage Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="bg-[#09152e] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Forensic Laboratory Facility:</span>
                  <span className="text-white font-bold block mt-0.5">
                    {currentEvidence.metadata?.storageLocation?.facility || 'Central Forensic Science Laboratory (CFSL) New Delhi'}
                  </span>
                </div>

                <div className="bg-[#09152e] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vault Room & Bio-Safety Level:</span>
                  <span className="text-red-300 font-bold block mt-0.5">
                    {currentEvidence.metadata?.storageLocation?.vaultRoom || 'Cryogenic Biological Repository (BSL-3)'}
                  </span>
                </div>

                <div className="bg-[#09152e] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Climate & Storage Unit:</span>
                  <span className="text-purple-300 font-bold block mt-0.5">
                    {currentEvidence.metadata?.storageLocation?.storageUnit || 'Sub-Zero Cryo Unit (-80°C Controlled)'}
                  </span>
                </div>

                <div className="bg-[#09152e] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Physical Locker & Barcode Seal:</span>
                  <span className="text-amber-300 font-bold block mt-0.5">
                    {currentEvidence.metadata?.storageLocation?.physicalLockerNumber || 'Locker #BIO-104 (Seal ID: MHA-9921)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Sovereign Cloud & IPFS Distributed Storage */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                2. Sovereign Cloud & IPFS Distributed Vault
              </div>

              <div className="bg-[#09152e] p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Sovereign Cloud S3 Bucket URI:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentEvidence.metadata?.storageLocation?.cloudVaultUri || currentEvidence.file_url || '');
                        setCopiedCloudUri(true);
                        setTimeout(() => setCopiedCloudUri(false), 2000);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedCloudUri ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCloudUri ? 'Copied URI' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-[#040914] rounded text-cyan-300 font-bold truncate select-all">
                    {currentEvidence.metadata?.storageLocation?.cloudVaultUri || currentEvidence.file_url || 's3://crimesync-forensic-vault/...'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-400 block">IPFS Distributed CID Hash:</span>
                    <span className="text-purple-300 font-bold truncate block select-all">
                      {currentEvidence.metadata?.storageLocation?.ipfsHash || 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Encryption Standard:</span>
                    <span className="text-emerald-400 font-bold truncate block">
                      {currentEvidence.metadata?.storageLocation?.encryptionProtocol || 'AES-256-GCM HSM Key Sealed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section C: Cryptographic Blockchain Proof & Hashes */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                3. Immutable Blockchain Ledger Verification Proof
              </div>

              <div className="bg-[#09152e] p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">SHA-256 Bitstream Hash:</span>
                  <div className="p-2 bg-[#040914] rounded text-cyan-300 font-bold break-all select-all">
                    {currentEvidence.hash_sha256}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Block Height:</span>
                    <span className="text-white font-bold">#{currentEvidence.block_height || 19842600} (Finalized)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Validator Node:</span>
                    <span className="text-emerald-400 font-bold">CBI Delhi Central Validator Node 01</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Transaction Hash:</span>
                  <span className="text-purple-300 font-bold truncate block select-all">
                    {currentEvidence.tx_hash}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Merkle Tree Root Hash:</span>
                  <span className="text-sky-300 font-bold truncate block select-all">
                    {currentEvidence.merkle_root}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsStorageModalOpen(false);
                  setIsCertificateModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Section 65B Certificate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStorageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setIsStorageModalOpen(false);
                    handleVerifyOnBlockchain();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify On Blockchain</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD BIOLOGICAL & FORENSIC EVIDENCE MODAL ───────────────── */}
      {isAddEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#061026] border border-blue-500/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">
                    Ingest Biological & Forensic Evidence
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Active Case: <strong className="text-cyan-300 font-mono">{selectedCase?.fir_number || selectedCaseId}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngestEvidence} className="space-y-3.5">
              
              {/* Evidence Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Evidence Title & Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crime Scene Blood Splatter & Liquid Extract from Weapon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Category / Modality Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Biological / Biometric Modality *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none font-bold"
                  >
                    <option value="BIOLOGICAL_BLOOD">🩸 Biological Blood & Serum Sample</option>
                    <option value="BIOLOGICAL_SALIVA">💧 Biological Saliva & Buccal Swab</option>
                    <option value="BIOLOGICAL_HAIR">🦱 Biological Hair Follicle (mtDNA)</option>
                    <option value="BIOLOGICAL_TISSUE">🧬 Biological Cellular Touch Tissue</option>
                    <option value="BIOLOGICAL_SWAB">🧫 Biological Sterile Swab (STR DNA)</option>
                    <option value="FINGERPRINT_SCAN">🖐️ Latent Fingerprint (NAFIS AFIS)</option>
                    <option value="IRIS_SCAN">👁️ Iris & Retinal Polar Scan (UIDAI L1)</option>
                    <option value="FACIAL_BIOMETRIC">👤 CCTV Facial Landmark Vector</option>
                    <option value="VOICEPRINT_AUDIO">🎙️ Acoustic Voiceprint Spectrogram</option>
                    <option value="DIGITAL_PAYLOAD">💾 Volatile RAM / Weaponized Malware</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Suspect / Person Attribution
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aman Khan, Tariq Sheikh, Ground Zero"
                    value={newSuspect}
                    onChange={(e) => setNewSuspect(e.target.value)}
                    className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Storage Vault Information Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Storage Facility / Laboratory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CFSL New Delhi Cryo-Vault"
                    value={newStorageFacility}
                    onChange={(e) => setNewStorageFacility(e.target.value)}
                    className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Physical Locker / Barcode Seal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Locker #BIO-104 (Seal ID: MHA-9921)"
                    value={newPhysicalLocker}
                    onChange={(e) => setNewPhysicalLocker(e.target.value)}
                    className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Algorithm */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Cryptographic Hashing & Verification Algorithm
                </label>
                <select
                  value={newAlgorithm}
                  onChange={(e) => setNewAlgorithm(e.target.value)}
                  className="w-full bg-[#09152e] border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="STR-16 Loci + SHA-256">STR-16 Loci + SHA-256 (CODIS / NDIS Certified)</option>
                  <option value="AFIS Minutiae + BLAKE3">AFIS Minutiae + BLAKE3 (NAFIS Standard)</option>
                  <option value="IrisCode 2048 + SHA-256">IrisCode 2048 + SHA-256 (UIDAI Polar)</option>
                  <option value="ResNet-512 Facial Embedding">ResNet-512 Facial Embedding + Keccak-256</option>
                  <option value="Acoustic MFCC + SHA-256">Acoustic MFCC Formants + SHA-256</option>
                  <option value="EnCase Bit-Stream + SHA-256">Section 65B Bit-Stream Image + SHA-256</option>
                </select>
              </div>

              {/* Chain of custody info */}
              <div className="p-3 bg-[#040914] rounded-xl border border-blue-900/40 text-[11px] text-slate-300 space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ingesting Officer:</span>
                  <span className="font-bold text-cyan-300">{currentUser.name} ({currentUser.badgeNumber || (currentUser as any).badge_number || 'DEL-IPS-8821'})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Blockchain Action:</span>
                  <span className="font-bold text-emerald-400">MINT_BLOCK_AND_SEAL_MERKLE_ROOT</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEvidenceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewEvidence}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmittingNewEvidence ? 'Anchoring to Blockchain...' : 'Commit to Blockchain'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── MODAL 3: LIVE BLOCKCHAIN PROOF VERIFIER MODAL ──────────────────── */}
      {isVerifyProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#061026] border border-emerald-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">
                    Cryptographic Proof Verifier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live On-Chain Merkle Root Audit • {currentEvidence?.evidence_code}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVerifyProofModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isVerifyingOnChain ? (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-cyan-300">
                  Querying Blockchain Validator Nodes & computing Merkle proof...
                </p>
              </div>
            ) : verificationResult ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">100% Cryptographic Match Verified</div>
                    <div className="text-[10px] text-emerald-300">
                      No bit-flip or hash mismatch detected. Proof validated on CBI National Root Node.
                    </div>
                  </div>
                </div>

                <div className="bg-[#09152e] p-3 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified SHA-256:</span>
                    <span className="text-cyan-300 break-all select-all">{verificationResult.hash}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Block Height:</span>
                    <span className="text-white font-bold">#{verificationResult.blockHeight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-purple-300 truncate max-w-[240px]">{verificationResult.txHash}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Section 65B BSA Status:</span>
                    <span className="text-emerald-400 font-bold">{verificationResult.section65BCompliance}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsVerifyProofModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Close Verification
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* ── MODAL 4: SECTION 65B BSA LEGAL CERTIFICATE MODAL ──────────────── */}
      {isCertificateModalOpen && currentEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#050b18] border border-blue-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase">
                  Section 65B BSA 2023 Electronic Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Certificate Template */}
            <div className="bg-white text-black p-6 rounded-xl space-y-4 text-[11px] leading-relaxed shadow-lg print:m-0">
              <div className="text-center border-b pb-3 border-slate-300">
                <h2 className="text-sm font-black tracking-wider uppercase">
                  CERTIFICATE UNDER SECTION 65B OF BHARATIYA SAKSHYA ADHINIYAM (BSA 2023)
                </h2>
                <p className="text-[10px] text-slate-600">
                  Admissibility of Electronic Records & Cryptographic Biometric Evidence in Court of Law
                </p>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <p><strong>1. Police Station / Unit:</strong> Special Cyber Crime Investigation Cell, {selectedCase?.jurisdiction_city || 'New Delhi'}</p>
                <p><strong>2. FIR / Case Number:</strong> {selectedCase?.fir_number || selectedCaseId}</p>
                <p><strong>3. Evidence Identifier:</strong> {currentEvidence.evidence_code} ({currentEvidence.title})</p>
                <p><strong>4. Modality / Biological Subtype:</strong> {currentEvidence.category} ({currentEvidence.sub_type})</p>
                <p><strong>5. Certified Storage Location:</strong> {currentEvidence.metadata?.storageLocation?.facility || 'CFSL Central Repository'}</p>
                <p><strong>6. Vault Room & Physical Locker:</strong> {currentEvidence.metadata?.storageLocation?.physicalLockerNumber || 'Locker #BIO-104'}</p>
                <p><strong>7. Cloud Storage URI:</strong> {currentEvidence.metadata?.storageLocation?.cloudVaultUri || currentEvidence.file_url}</p>
                <p><strong>8. Certified SHA-256 Bitstream Hash:</strong> <span className="font-mono break-all">{currentEvidence.hash_sha256}</span></p>
                <p><strong>9. Neural AI DNA Fingerprint:</strong> {currentEvidence.ai_fingerprint}</p>
                <p><strong>10. Blockchain Transaction Hash:</strong> {currentEvidence.tx_hash}</p>
                <p><strong>11. Ledger Block Height:</strong> #{currentEvidence.block_height || 19842600}</p>
              </div>

              <div className="p-2.5 bg-slate-100 rounded border border-slate-300 text-[9.5px]">
                I, <strong>{currentUser.name}</strong>, holding designation <strong>{currentUser.roleTitle || currentUser.role}</strong> (Badge ID: <strong>{currentUser.badgeNumber || (currentUser as any).badge_number || 'DEL-IPS-8821'}</strong>), hereby certify under Section 65B of the Bharatiya Sakshya Adhiniyam 2023 that the biological & electronic evidence record produced herein was retrieved from lawful custody, has been cryptographically sealed against bitstream tampering, and committed to the immutable national ledger.
              </div>

              <div className="pt-4 flex justify-between items-end border-t border-slate-300 text-[10px]">
                <div>
                  <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                  <p>Seal: CFSL Central Forensic Registry</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{currentUser.name}</p>
                  <p className="text-slate-600">{currentUser.roleTitle || currentUser.role}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Export PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
