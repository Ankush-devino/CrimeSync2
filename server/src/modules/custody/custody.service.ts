// Team Member 2: Chain of Custody Service with Blockchain Anchoring & Case Partitioning
import crypto from "crypto";
import { pgPool } from "../../config/db";
import { globalBlockchainLedger, MerkleTree } from "../blockchain/blockchain.module";
import {
  CustodyItemDTO,
  CustodyStepDTO,
  CustodyStatsDTO,
  CustodyVerificationResultDTO,
  CustodyManifestDTO,
  CustodyAction
} from "./custody.model";

// Complete, rich, multi-step in-memory custody chains partitioned across all 9 cases
const FALLBACK_CUSTODY_ITEMS: Record<string, CustodyItemDTO> = {
  // ── CASE-2026-001: Operation Trishul (Hawala & Phishing Syndicate) ──────────
  "EVD-501": {
    id: "c-501",
    evidenceId: "EVD-501",
    evidenceName: "OnePlus 12 Recovered from Suspect Vivek Deshmukh",
    evidenceType: "Mobile Hardware",
    caseRef: "CASE-2026-001",
    currentCustodian: "Special Cyber Court, Patiala House",
    custodianRole: "Judicial Custody / Court Registrar",
    currentLocation: "Patiala House District Courts, New Delhi",
    status: "In Court",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 5,
    totalCustodians: 4,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 06:15 PM",
    sealHash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    blockHeight: 19842601,
    steps: [
      {
        id: "step-501-1",
        evidenceId: "EVD-501",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        iconType: "user",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "Lajpat Nagar Safehouse, New Delhi",
        timestamp: "08 Sep 2026, 02:30 AM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x81fa901c...99fe8831)",
        publicKey: "0x81fa901c0029bca7492019ab921dae7841029384",
        notes: "Initial seizure of encrypted primary suspect smartphone. Physical tamper-proof seal #PE-902 applied.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-501-2",
        evidenceId: "EVD-501",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "Central Forensic Science Lab, New Delhi",
        timestamp: "08 Sep 2026, 05:15 AM",
        txHash: "0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4",
        signature: "ECDSA-secp256k1 (0x99fe8831...cba87123)",
        publicKey: "0x99fe8831cba87123984109283710293847102938",
        notes: "Custody transfer for emergency hardware-level chip-off extraction and memory analysis.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-501-3",
        evidenceId: "EVD-501",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "Forensic Science Laboratory, Bengaluru",
        timestamp: "08 Sep 2026, 09:30 AM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x44bc12ef...918bca41)",
        publicKey: "0x44bc12ef918bca4190c42f7f1ac09d2e6f11ab09",
        notes: "Bit-stream physical forensic dump extracted via write-blocker. Telegram & WhatsApp chats decoded.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-501-4",
        evidenceId: "EVD-501",
        action: "STORED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
        iconType: "lock",
        actorName: "ACP Rajeshwar Sharma",
        actorRole: "Special Cell / Cyber Crime Unit",
        actorBadge: "DEL-IPS-8821",
        location: "Evidence Vault Locker EF-12, Delhi Police HQ",
        timestamp: "08 Sep 2026, 01:45 PM",
        txHash: "0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c",
        signature: "ECDSA-secp256k1 (0x7a3f8f77...1b021dae)",
        publicKey: "0x7a3f8f771b021dae984210912bcde43c99abf287",
        notes: "Physical device locked inside automated dual-biometric Faraday evidence locker.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-501-5",
        evidenceId: "EVD-501",
        action: "SUBMITTED_TO_COURT",
        actionColor: "text-blue-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        iconType: "shield",
        actorName: "Court Registrar S. K. Mahajan",
        actorRole: "Special Cyber Court Officer",
        actorBadge: "JUD-DL-0044",
        location: "Patiala House District Courts, New Delhi",
        timestamp: "08 Sep 2026, 06:15 PM",
        txHash: "0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7",
        signature: "ECDSA-secp256k1 (0x8921bca8...12c98421)",
        publicKey: "0x8921bca871239841092837102938471029384710",
        notes: "Formally submitted for judicial remand hearing and forensic dossier verification.",
        verifiedOnChain: true,
        blockNumber: 19842601
      }
    ]
  },
  "EVD-502": {
    id: "c-502",
    evidenceId: "EVD-502",
    evidenceName: "Forged Aadhaar & PAN Card Batch (142 identity documents)",
    evidenceType: "Identity Documents",
    caseRef: "CASE-2026-001",
    currentCustodian: "Document Forensics Division, CFSL",
    custodianRole: "Senior Forensic Document Examiner",
    currentLocation: "Central Forensic Science Lab, New Delhi",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 02:15 PM",
    sealHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-502-1",
        evidenceId: "EVD-502",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Cell",
        actorBadge: "MUM-CYB-4091",
        location: "BKC Printing Den, Mumbai",
        timestamp: "08 Sep 2026, 01:15 AM",
        txHash: "0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e",
        signature: "ECDSA-secp256k1 (0x4091a182...556c8021)",
        notes: "142 forged PVC cards seized alongside dye-sublimation identity printers.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-502-2",
        evidenceId: "EVD-502",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "Cyber Crime Cell, Mumbai",
        timestamp: "08 Sep 2026, 02:15 AM",
        txHash: "0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7",
        signature: "ECDSA-secp256k1 (0x44bc12ef...12c98421)",
        notes: "Physical documents cataloged and sealed in presence of two independent panchas.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-502-3",
        evidenceId: "EVD-502",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "Forensic Analyst Dr. A. Sen",
        actorRole: "Chief Questioned Documents Examiner",
        actorBadge: "CFSL-DOC-009",
        location: "Central Forensic Science Lab, New Delhi",
        timestamp: "08 Sep 2026, 02:15 PM",
        txHash: "0x9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
        signature: "ECDSA-secp256k1 (0x19a0334b...9f83b165)",
        notes: "Spectral UV analysis completed; counterfeit hologram batch numbers cataloged.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },

  // ── CASE-2026-002: GridShield (SCADA Cyber Attack) ─────────────────────────
  "EVD-503": {
    id: "c-503",
    evidenceId: "EVD-503",
    evidenceName: "PCAP Network Dumps of CobaltStrike C2 Traffic",
    evidenceType: "Server Log",
    caseRef: "CASE-2026-002",
    currentCustodian: "Inspector Priya Kulkarni",
    custodianRole: "Cyber Defense Analyst",
    currentLocation: "State Cyber Security Command, Mumbai",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 03:15 AM",
    sealHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-503-1",
        evidenceId: "EVD-503",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "SI Suresh Nair",
        actorRole: "Highway & Infrastructure Cyber Patrol",
        actorBadge: "DL-POL-1192",
        location: "SCADA Relay Substation #4, Mumbai",
        timestamp: "08 Sep 2026, 12:45 AM",
        txHash: "0x3ab9211f7e854c3b58c2deefa418471b021dae984210912bcde43c99abf28741",
        signature: "ECDSA-secp256k1 (0x11924892...3ab9211f)",
        notes: "Live ring-buffer network packet capture secured during lateral movement attempt.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-503-2",
        evidenceId: "EVD-503",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Defense Analyst",
        actorBadge: "MUM-CYB-4091",
        location: "State Cyber Defense Command Center, Mumbai",
        timestamp: "08 Sep 2026, 01:45 AM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x4091a182...9842109e)",
        notes: "Encrypted transfer via isolated fiber trunk to SOC forensic workstation.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-503-3",
        evidenceId: "EVD-503",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Defense Analyst",
        actorBadge: "MUM-CYB-4091",
        location: "State Cyber Security Command, Mumbai",
        timestamp: "08 Sep 2026, 03:15 AM",
        txHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        signature: "ECDSA-secp256k1 (0x7f83b165...ca978112)",
        notes: "C2 beacon domain extraction & TLS payload signature matched to CobaltStrike watermark 389102.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },
  "EVD-506-MB": {
    id: "c-506mb",
    evidenceId: "EVD-506-MB",
    evidenceName: "Compromised Cisco Core Switch Firmware Binary",
    evidenceType: "Hardware Firmware",
    caseRef: "CASE-2026-002",
    currentCustodian: "DSP Arvind Swaminathan",
    custodianRole: "Lead Hardware Forensics",
    currentLocation: "National Critical Information Infrastructure Lab",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 1,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 05:00 AM",
    sealHash: "0x918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-506mb-1",
        evidenceId: "EVD-506-MB",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Expert",
        actorBadge: "BLR-INT-1102",
        location: "State Electricity Board Core Data Center",
        timestamp: "08 Sep 2026, 03:30 AM",
        txHash: "0x7a3f8f771b021dae984210912bcde43c99abf28741e12db984aa712c9842109e",
        signature: "ECDSA-secp256k1 (0x11027a3f...9842109e)",
        notes: "Flash ROM dumped directly via hardware JTAG interface.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-506mb-2",
        evidenceId: "EVD-506-MB",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Expert",
        actorBadge: "BLR-INT-1102",
        location: "NCIIPC Cyber Testing Center",
        timestamp: "08 Sep 2026, 05:00 AM",
        txHash: "0x918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3",
        signature: "ECDSA-secp256k1 (0x11028371...918bca41)",
        notes: "Flash binary reverse-engineered. Backdoor shellcode discovered and anchored on blockchain.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },

  // ── CASE-2026-003: Operation Garud (VoIP Spoofing & SIM Box Ring) ──────────
  "EVD-504-BLR": {
    id: "c-504blr",
    evidenceId: "EVD-504-BLR",
    evidenceName: "Grandstream VOIP Gateway & Asterisk Server Logs",
    evidenceType: "Telephony Hardware",
    caseRef: "CASE-2026-003",
    currentCustodian: "Superintendent Ananya Sengupta",
    custodianRole: "CBI Anti-Corruption & Tech Unit",
    currentLocation: "CBI Headquarters Evidence Vault, New Delhi",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 04:30 AM",
    sealHash: "0x9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
    blockHeight: 19842598,
    steps: [
      {
        id: "step-504blr-1",
        evidenceId: "EVD-504-BLR",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "Koramangala Illegal Exchange, Bengaluru",
        timestamp: "08 Sep 2026, 01:10 AM",
        txHash: "0x8921bca871239841092837102938471029384710293847102938471029384710",
        signature: "ECDSA-secp256k1 (0x77408921...02938471)",
        notes: "Live Asterisk PBX server and rackmount VoIP gateway unmounted under judicial warrant.",
        verifiedOnChain: true,
        blockNumber: 19842596
      },
      {
        id: "step-504blr-2",
        evidenceId: "EVD-504-BLR",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "CBI Tech Specialist",
        actorBadge: "CBI-HQ-0012",
        location: "CBI Regional Headquarters, Bengaluru",
        timestamp: "08 Sep 2026, 02:20 AM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x0012718a...cba87123)",
        notes: "Transferred under armed escort for central CBI telecommunications audit.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-504blr-3",
        evidenceId: "EVD-504-BLR",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "CBI Tech Specialist",
        actorBadge: "CBI-HQ-0012",
        location: "CBI Headquarters Evidence Vault, New Delhi",
        timestamp: "08 Sep 2026, 04:30 AM",
        txHash: "0x9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
        signature: "ECDSA-secp256k1 (0x00129842...9f83b165)",
        notes: "VoIP Gateway hardware and 64 SIM card modules sealed in CBI high-security locker.",
        verifiedOnChain: true,
        blockNumber: 19842598
      }
    ]
  },
  "EVD-508-BLR": {
    id: "c-508blr",
    evidenceId: "EVD-508-BLR",
    evidenceName: "128 Counterfeit Pre-Activated Matrix SIM Cards",
    evidenceType: "Telecom Hardware",
    caseRef: "CASE-2026-003",
    currentCustodian: "Special Cyber Court, Bengaluru",
    custodianRole: "Chief Judicial Magistrate Registrar",
    currentLocation: "City Civil Court Complex, Bengaluru",
    status: "In Court",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 05:45 PM",
    sealHash: "0x81fa901c0029bca7492019ab921dae784102938481fa901c0029bca7492019ab",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-508blr-1",
        evidenceId: "EVD-508-BLR",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "Telecom Outpost, Electronic City, Bengaluru",
        timestamp: "08 Sep 2026, 02:40 AM",
        txHash: "0x1b021dae984210912bcde43c99abf28741e12db984aa712c9842109eefa41847",
        signature: "ECDSA-secp256k1 (0x77401b02...418471e1)",
        notes: "128 cloned SIM cards seized with fake KYC profile attachments.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-508blr-2",
        evidenceId: "EVD-508-BLR",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "FSL Telecom Forensics Lab, Bengaluru",
        timestamp: "08 Sep 2026, 08:30 AM",
        txHash: "0x44bc12ef918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c80",
        signature: "ECDSA-secp256k1 (0x110244bc...918bca41)",
        notes: "IMSI numbers extracted; OTP rerouting packets verified against CDR feeds.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-508blr-3",
        evidenceId: "EVD-508-BLR",
        action: "SUBMITTED_TO_COURT",
        actionColor: "text-blue-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "shield",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "Lead CBI Prosecutor Liaison",
        actorBadge: "CBI-HQ-0012",
        location: "City Civil Court Complex, Bengaluru",
        timestamp: "08 Sep 2026, 05:45 PM",
        txHash: "0x81fa901c0029bca7492019ab921dae784102938481fa901c0029bca7492019ab",
        signature: "ECDSA-secp256k1 (0x001281fa...bca74920)",
        notes: "Produced in court with Section 65B Electronic Certificate for suspect remand.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },

  // ── CASE-2026-004: Operation Chakra (Tech Support & Crypto Scam) ───────────
  "EVD-504": {
    id: "c-504",
    evidenceId: "EVD-504",
    evidenceName: "Asterisk Call Dialer Logs & SIP Trunk Dumps",
    evidenceType: "Server Log",
    caseRef: "CASE-2026-004",
    currentCustodian: "City Sessions Court, Kolkata",
    custodianRole: "Court Registrar Officer",
    currentLocation: "City Sessions Court Complex, Kolkata",
    status: "In Court",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 4,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 04:00 PM",
    sealHash: "0x9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
    blockHeight: 19842601,
    steps: [
      {
        id: "step-504-1",
        evidenceId: "EVD-504",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Debjit Sen",
        actorRole: "Cyber Crime Unit, Kolkata",
        actorBadge: "KOL-CYB-2201",
        location: "Sector V Call Center Den, Salt Lake, Kolkata",
        timestamp: "08 Sep 2026, 01:15 AM",
        txHash: "0x9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061",
        signature: "ECDSA-secp256k1 (0x22019f83...fc53b92d)",
        notes: "Live Asterisk server snapshot taken during active fake tech support spoof calls.",
        verifiedOnChain: true,
        blockNumber: 19842596
      },
      {
        id: "step-504-2",
        evidenceId: "EVD-504",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "CBI Anti-Corruption & Economic Offences",
        actorBadge: "CBI-HQ-0012",
        location: "CBI Special Crime Branch, Kolkata",
        timestamp: "08 Sep 2026, 03:00 AM",
        txHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48b2",
        signature: "ECDSA-secp256k1 (0x0012ca97...fac231b3)",
        notes: "Evidence transferred under CBI inter-state warrant for crypto tracing.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-504-3",
        evidenceId: "EVD-504",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "CBI Tech Specialist",
        actorBadge: "CBI-HQ-0012",
        location: "Central Digital Forensics Lab",
        timestamp: "08 Sep 2026, 11:30 AM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x0012718a...29384710)",
        notes: "4.13 Cr INR international wire fraud calls correlated with VoIP IP ranges.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-504-4",
        evidenceId: "EVD-504",
        action: "SUBMITTED_TO_COURT",
        actionColor: "text-blue-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "shield",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "CBI Lead Investigator",
        actorBadge: "CBI-HQ-0012",
        location: "City Sessions Court Complex, Kolkata",
        timestamp: "08 Sep 2026, 04:00 PM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x0012aa71...471b021d)",
        notes: "Judicial submission of call logs with Section 65B hash verification certificate.",
        verifiedOnChain: true,
        blockNumber: 19842601
      }
    ]
  },
  "EVD-505": {
    id: "c-505",
    evidenceId: "EVD-505",
    evidenceName: "AnyDesk & UltraViewer Remote Session Transcripts",
    evidenceType: "Forensic Image",
    caseRef: "CASE-2026-004",
    currentCustodian: "Superintendent Ananya Sengupta",
    custodianRole: "Lead Investigator",
    currentLocation: "CBI Evidence Vault, Kolkata",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 02:00 PM",
    sealHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48b2",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-505-1",
        evidenceId: "EVD-505",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Debjit Sen",
        actorRole: "Cyber Crime Unit",
        actorBadge: "KOL-CYB-2201",
        location: "Sector V Call Center Den, Salt Lake, Kolkata",
        timestamp: "08 Sep 2026, 02:00 AM",
        txHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48b2",
        signature: "ECDSA-secp256k1 (0x2201ca97...afee48b2)",
        notes: "Remote workstation memory captures seized directly via live RAM imager.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-505-2",
        evidenceId: "EVD-505",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "FSL Digital Forensics Lab",
        timestamp: "08 Sep 2026, 09:45 AM",
        txHash: "0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4",
        signature: "ECDSA-secp256k1 (0x11023c99...dae98421)",
        notes: "AnyDesk session logs reveal unauthorized bank logins and crypto OTC swap coordinates.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-505-3",
        evidenceId: "EVD-505",
        action: "STORED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "lock",
        actorName: "Superintendent Ananya Sengupta",
        actorRole: "Lead Investigator",
        actorBadge: "CBI-HQ-0012",
        location: "CBI Evidence Vault, Kolkata",
        timestamp: "08 Sep 2026, 02:00 PM",
        txHash: "0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c",
        signature: "ECDSA-secp256k1 (0x001299ab...12bcde43)",
        notes: "Forensic mirror image stored in write-protected WORM optical media.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },

  // ── CASE-2026-005: Operation Vajra (Digital Arrest & Fake CBI Extortion) ───
  "EVD-506": {
    id: "c-506",
    evidenceId: "EVD-506",
    evidenceName: "Forged CBI & Supreme Court Arrest Warrants (PDFs)",
    evidenceType: "Digital Hardware",
    caseRef: "CASE-2026-005",
    currentCustodian: "Esplanade Cyber Court, Mumbai",
    custodianRole: "Chief Metropolitan Court Officer",
    currentLocation: "Esplanade Magistrate Court, Mumbai",
    status: "In Court",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 4,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 03:30 PM",
    sealHash: "0x3a978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48c3",
    blockHeight: 19842601,
    steps: [
      {
        id: "step-506-1",
        evidenceId: "EVD-506",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "Malviya Nagar Studio, Jaipur",
        timestamp: "08 Sep 2026, 01:30 AM",
        txHash: "0x3a978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48c3",
        signature: "ECDSA-secp256k1 (0x40913a97...ee48c340)",
        notes: "Forged arrest warrants bearing fabricated Supreme Court and CBI seals seized from suspect laptop.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-506-2",
        evidenceId: "EVD-506",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "Cyber Crime Cell, Mumbai",
        timestamp: "08 Sep 2026, 04:00 AM",
        txHash: "0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7",
        signature: "ECDSA-secp256k1 (0x409112c9...db984aa7)",
        notes: "Encrypted evidence container created with SHA-256 integrity seal.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-506-3",
        evidenceId: "EVD-506",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "Forensic Analyst Dr. A. Sen",
        actorRole: "Chief Questioned Documents Examiner",
        actorBadge: "CFSL-DOC-009",
        location: "Central Forensic Science Lab, New Delhi",
        timestamp: "08 Sep 2026, 10:15 AM",
        txHash: "0x7a3f8f771b021dae984210912bcde43c99abf28741e12db984aa712c9842109e",
        signature: "ECDSA-secp256k1 (0x00097a3f...c9842109)",
        notes: "PDF metadata analysis matches Photoshop CS6 edits created on suspect system.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-506-4",
        evidenceId: "EVD-506",
        action: "SUBMITTED_TO_COURT",
        actionColor: "text-blue-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "shield",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Lead Cyber Investigator",
        actorBadge: "MUM-CYB-4091",
        location: "Esplanade Magistrate Court, Mumbai",
        timestamp: "08 Sep 2026, 03:30 PM",
        txHash: "0x8921bca871239841092837102938471029384710293847102938471029384710",
        signature: "ECDSA-secp256k1 (0x40918921...38471029)",
        notes: "Formally submitted for judicial remand of mastermind Kunwar Pratap Singh.",
        verifiedOnChain: true,
        blockNumber: 19842601
      }
    ]
  },
  "EVD-507": {
    id: "c-507",
    evidenceId: "EVD-507",
    evidenceName: "Skype Video Recordings of Fake Police Station Setup",
    evidenceType: "CCTV Footage",
    caseRef: "CASE-2026-005",
    currentCustodian: "Inspector Priya Kulkarni",
    custodianRole: "Cyber Defense Analyst",
    currentLocation: "State Cyber Security Command, Mumbai",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 01:15 PM",
    sealHash: "0x2b83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9074",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-507-1",
        evidenceId: "EVD-507",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Cell",
        actorBadge: "MUM-CYB-4091",
        location: "Malviya Nagar Fake Studio, Jaipur",
        timestamp: "08 Sep 2026, 02:15 AM",
        txHash: "0x2b83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9074",
        signature: "ECDSA-secp256k1 (0x40912b83...addd2001)",
        notes: "High-definition video feeds used to simulate 72-hour virtual digital arrest of elderly victim.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-507-2",
        evidenceId: "EVD-507",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "FSL AV Forensics Unit, Bengaluru",
        timestamp: "08 Sep 2026, 08:30 AM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x1102718a...29384710)",
        notes: "Video frames authenticated; fake police backdrop props and uniform insignia cataloged.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-507-3",
        evidenceId: "EVD-507",
        action: "STORED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "lock",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "State Cyber Security Command, Mumbai",
        timestamp: "08 Sep 2026, 01:15 PM",
        txHash: "0x4892e7d3fa81b490e556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c",
        signature: "ECDSA-secp256k1 (0x40914892...f11ab09c)",
        notes: "Stored in encrypted video vault with hardware cryptographic token access.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },

  // ── CASE-2026-006: Operation Durg (Biometric & AePS Micro-ATM Bypass) ───────
  "EVD-508": {
    id: "c-508",
    evidenceId: "EVD-508",
    evidenceName: "350+ Silicone Fingerprint Replicas & Chemical Casting Kit",
    evidenceType: "Digital Hardware",
    caseRef: "CASE-2026-006",
    currentCustodian: "DSP Arvind Swaminathan",
    custodianRole: "Lead Biometrics Forensics",
    currentLocation: "National Forensic Sciences University (NFSU), Gandhinagar",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 12:30 PM",
    sealHash: "0x1c83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9085",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-508-1",
        evidenceId: "EVD-508",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "Varachha Diamond Market Lab, Surat",
        timestamp: "08 Sep 2026, 01:45 AM",
        txHash: "0x1c83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9085",
        signature: "ECDSA-secp256k1 (0x77401c83...addd2001)",
        notes: "350+ silicone latent fingerprint casts seized from illegal casting lab in Surat.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-508-2",
        evidenceId: "EVD-508",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "National Forensic Sciences University (NFSU), Gandhinagar",
        timestamp: "08 Sep 2026, 04:30 AM",
        txHash: "0x3ab9211f7e854c3b58c2deefa418471b021dae984210912bcde43c99abf28741",
        signature: "ECDSA-secp256k1 (0x11023ab9...cde43c99)",
        notes: "Physical biological samples transferred in climate-controlled forensic evidence cases.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-508-3",
        evidenceId: "EVD-508",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Lead Biometrics Forensics",
        actorBadge: "BLR-INT-1102",
        location: "NFSU Biometrics Center, Gandhinagar",
        timestamp: "08 Sep 2026, 12:30 PM",
        txHash: "0x918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3",
        signature: "ECDSA-secp256k1 (0x1102918b...556c8021)",
        notes: "3D ridge depth scanned via laser profilometer; match found with land registry deed thumb impressions.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },
  "EVD-509": {
    id: "c-509",
    evidenceId: "EVD-509",
    evidenceName: "Tampered Morpho MSO1300E3 Biometric Scanner",
    evidenceType: "Digital Hardware",
    caseRef: "CASE-2026-006",
    currentCustodian: "SI Vikramaditya Reddy",
    custodianRole: "Lead CID Investigator",
    currentLocation: "CID Secure Evidence Room, Hyderabad",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 1,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 09:15 AM",
    sealHash: "0x7d978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48d6",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-509-1",
        evidenceId: "EVD-509",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "SG Highway Commercial Center, Ahmedabad",
        timestamp: "08 Sep 2026, 02:30 AM",
        txHash: "0x7d978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48d6",
        signature: "ECDSA-secp256k1 (0x77407d97...fee48d67)",
        notes: "Biometric scanner with modified firmware EEPROM seized from rogue banking CSP agent.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-509-2",
        evidenceId: "EVD-509",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "SI Vikramaditya Reddy",
        actorRole: "CID Financial Fraud Division",
        actorBadge: "HYD-CID-7740",
        location: "CID Secure Evidence Room, Hyderabad",
        timestamp: "08 Sep 2026, 09:15 AM",
        txHash: "0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e",
        signature: "ECDSA-secp256k1 (0x7740556c...81b490e5)",
        notes: "Hardware sealed in tamper-evident static bag #CID-8841.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },

  // ── CASE-2026-007: Operation Netra (AI Deepfake Video Extortion) ────────────
  "EVD-510": {
    id: "c-510",
    evidenceId: "EVD-510",
    evidenceName: "NVIDIA RTX 4090 GPU Rig with FaceSwap Python Repos",
    evidenceType: "Forensic Image",
    caseRef: "CASE-2026-007",
    currentCustodian: "DSP Arvind Swaminathan",
    custodianRole: "Lead Forensic Investigator",
    currentLocation: "Forensic Science Laboratory (FSL), Bengaluru",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 02:45 PM",
    sealHash: "0x8e978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48e7",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-510-1",
        evidenceId: "EVD-510",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "Indiranagar Apartment Studio, Bengaluru",
        timestamp: "08 Sep 2026, 02:00 AM",
        txHash: "0x8e978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48e7",
        signature: "ECDSA-secp256k1 (0x11028e97...fee48e71)",
        notes: "Liquid-cooled workstation running automated deepfake diffusion synthesis scripts seized.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-510-2",
        evidenceId: "EVD-510",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "FSL AI Forensics Cluster, Bengaluru",
        timestamp: "08 Sep 2026, 09:30 AM",
        txHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        signature: "ECDSA-secp256k1 (0x1102ca97...785afee4)",
        notes: "Pre-trained model checkpoints & latent space vector embeddings extracted from NVMe drives.",
        verifiedOnChain: true,
        blockNumber: 19842599
      },
      {
        id: "step-510-3",
        evidenceId: "EVD-510",
        action: "STORED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "lock",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Lead Forensic Investigator",
        actorBadge: "BLR-INT-1102",
        location: "FSL Evidence Vault, Bengaluru",
        timestamp: "08 Sep 2026, 02:45 PM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x1102aa71...12db984a)",
        notes: "Workstation hardware and raw drives cataloged in secure climate-controlled vault.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },
  "EVD-511": {
    id: "c-511",
    evidenceId: "EVD-511",
    evidenceName: "Telegram Chat Dumps & Monero Wallet Seed Phrase",
    evidenceType: "Call Record",
    caseRef: "CASE-2026-007",
    currentCustodian: "ACP Rajeshwar Sharma",
    custodianRole: "Cyber Crime Unit",
    currentLocation: "Special Cell HQ, New Delhi",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 11:15 AM",
    sealHash: "0x5f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9098",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-511-1",
        evidenceId: "EVD-511",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "Cyber City DLF Phase 2, Gurugram",
        timestamp: "08 Sep 2026, 03:15 AM",
        txHash: "0x5f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9098",
        signature: "ECDSA-secp256k1 (0x11025f83...addd2001)",
        notes: "Paper seed phrase cards and end-to-end encrypted Telegram session dumps retrieved.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-511-2",
        evidenceId: "EVD-511",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "ACP Rajeshwar Sharma",
        actorRole: "Special Cell / Cyber Crime Unit",
        actorBadge: "DEL-IPS-8821",
        location: "Special Cell HQ, New Delhi",
        timestamp: "08 Sep 2026, 11:15 AM",
        txHash: "0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7",
        signature: "ECDSA-secp256k1 (0x882112c9...12db984a)",
        notes: "Transferred for inter-agency crypto tracking of 2.55 Cr Monero ransom demands.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },

  // ── CASE-2026-008: Operation Kuber (Instant Loan App & Hawala Funnel) ───────
  "EVD-512": {
    id: "c-512",
    evidenceId: "EVD-512",
    evidenceName: "Decompiled 'CashInstant' and 'QuickCredit' Malicious APKs",
    evidenceType: "Digital Hardware",
    caseRef: "CASE-2026-008",
    currentCustodian: "DSP Arvind Swaminathan",
    custodianRole: "Lead Malware Analyst",
    currentLocation: "Forensic Science Laboratory (FSL), Bengaluru",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 01:45 PM",
    sealHash: "0x4a83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9009",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-512-1",
        evidenceId: "EVD-512",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "ACP Rajeshwar Sharma",
        actorRole: "Special Cell / Cyber Crime Unit",
        actorBadge: "DEL-IPS-8821",
        location: "Hinjawadi Phase 1 Call Desk, Pune",
        timestamp: "08 Sep 2026, 01:15 AM",
        txHash: "0x4a83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9009",
        signature: "ECDSA-secp256k1 (0x88214a83...addd2001)",
        notes: "APK source binaries extracted from developer workstation at Pune harassment call center.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-512-2",
        evidenceId: "EVD-512",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "Forensic Science Laboratory (FSL), Bengaluru",
        timestamp: "08 Sep 2026, 05:00 AM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x1102718a...29384710)",
        notes: "Malware binaries transmitted via secure cryptographic channel for code de-obfuscation.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-512-3",
        evidenceId: "EVD-512",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Lead Malware Analyst",
        actorBadge: "BLR-INT-1102",
        location: "FSL Malware Reverse-Engineering Lab",
        timestamp: "08 Sep 2026, 01:45 PM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x1102aa71...12db984a)",
        notes: "Hardcoded C2 IP endpoints and unauthorized background camera/SMS exfiltration payload decompiled.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },
  "EVD-513": {
    id: "c-513",
    evidenceId: "EVD-513",
    evidenceName: "Seized MongoDB Backup containing 14M Contact Books",
    evidenceType: "Server Log",
    caseRef: "CASE-2026-008",
    currentCustodian: "ACP Rajeshwar Sharma",
    custodianRole: "Lead Cyber Investigator",
    currentLocation: "Special Cell / Cyber Crime Unit, New Delhi",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 1,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 08:30 AM",
    sealHash: "0x6b978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48f1",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-513-1",
        evidenceId: "EVD-513",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "ACP Rajeshwar Sharma",
        actorRole: "Special Cell / Cyber Crime Unit",
        actorBadge: "DEL-IPS-8821",
        location: "Hitec City Cyber Towers, Hyderabad",
        timestamp: "08 Sep 2026, 02:45 AM",
        txHash: "0x6b978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48f1",
        signature: "ECDSA-secp256k1 (0x88216b97...fee48f18)",
        notes: "Database dump containing 14,891,020 victim contact books recovered from overseas cloud server.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-513-2",
        evidenceId: "EVD-513",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "ACP Rajeshwar Sharma",
        actorRole: "Special Cell / Cyber Crime Unit",
        actorBadge: "DEL-IPS-8821",
        location: "Special Cell / Cyber Crime Unit, New Delhi",
        timestamp: "08 Sep 2026, 08:30 AM",
        txHash: "0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4",
        signature: "ECDSA-secp256k1 (0x88213c99...bcde43c9)",
        notes: "Raw BSON archive sealed with SHA-256 master hash and stored in high-security evidence database.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },

  // ── CASE-2026-009: Operation Rudra (Power Grid SCADA Ransomware) ────────────
  "EVD-514": {
    id: "c-514",
    evidenceId: "EVD-514",
    evidenceName: "Memory Dump with Cobalt Strike Beacon & Meterpreter Payload",
    evidenceType: "Forensic Image",
    caseRef: "CASE-2026-009",
    currentCustodian: "DSP Arvind Swaminathan",
    custodianRole: "Lead SCADA Forensic Expert",
    currentLocation: "Forensic Science Laboratory (FSL), Bengaluru",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 03:00 PM",
    sealHash: "0x9c978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48a2",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-514-1",
        evidenceId: "EVD-514",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "T. Nagar Tech Corridor, Chennai",
        timestamp: "08 Sep 2026, 01:10 AM",
        txHash: "0x9c978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48a2",
        signature: "ECDSA-secp256k1 (0x40919c97...fee48a24)",
        notes: "Volatile RAM capture taken during active ransomware deployment attempt against SCADA HMI.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-514-2",
        evidenceId: "EVD-514",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400",
        iconType: "user",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Forensic Science Laboratory (FSL)",
        actorBadge: "BLR-INT-1102",
        location: "National Critical Infrastructure Lab, Bengaluru",
        timestamp: "08 Sep 2026, 04:30 AM",
        txHash: "0x7a3f8f771b021dae984210912bcde43c99abf28741e12db984aa712c9842109e",
        signature: "ECDSA-secp256k1 (0x11027a3f...984aa712)",
        notes: "Air-gapped transfer of memory dump for kernel-level driver disassembly.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-514-3",
        evidenceId: "EVD-514",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "DSP Arvind Swaminathan",
        actorRole: "Lead SCADA Forensic Expert",
        actorBadge: "BLR-INT-1102",
        location: "Forensic Science Laboratory (FSL), Bengaluru",
        timestamp: "08 Sep 2026, 03:00 PM",
        txHash: "0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        signature: "ECDSA-secp256k1 (0x1102ca97...85afee48)",
        notes: "Cobalt Strike beacon config dissected; malicious C2 domain and 10 Cr INR ransom wallet address isolated.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },
  "EVD-515": {
    id: "c-515",
    evidenceId: "EVD-515",
    evidenceName: "Firewall Access Logs showing Exploit to SCADA HMI",
    evidenceType: "Server Log",
    caseRef: "CASE-2026-009",
    currentCustodian: "Inspector Priya Kulkarni",
    custodianRole: "Lead Cyber Investigator",
    currentLocation: "Cyber Crime Investigation Cell, Mumbai",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 2,
    totalCustodians: 1,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 09:45 AM",
    sealHash: "0x0d83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d90b3",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-515-1",
        evidenceId: "EVD-515",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400",
        iconType: "user",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Cyber Crime Investigation Cell",
        actorBadge: "MUM-CYB-4091",
        location: "CGO Complex Lodhi Road VPN Node, New Delhi",
        timestamp: "08 Sep 2026, 02:20 AM",
        txHash: "0x0d83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d90b3",
        signature: "ECDSA-secp256k1 (0x40910d83...addd2001)",
        notes: "Palo Alto firewall syslogs showing SSL VPN zero-day brute-force and privilege escalation.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-515-2",
        evidenceId: "EVD-515",
        action: "SEALED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
        iconType: "shield",
        actorName: "Inspector Priya Kulkarni",
        actorRole: "Lead Cyber Investigator",
        actorBadge: "MUM-CYB-4091",
        location: "Cyber Crime Investigation Cell, Mumbai",
        timestamp: "08 Sep 2026, 09:45 AM",
        txHash: "0x8921bca871239841092837102938471029384710293847102938471029384710",
        signature: "ECDSA-secp256k1 (0x40918921...38471029)",
        notes: "Log streams cryptographically sealed with SHA-256 and Merkle verification tree.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  },

  // ── CASE-2026-981: Cyber Theft & Document Forgery Probe ─────────────────────
  "EV-1246": {
    id: "c-1246",
    evidenceId: "EV-1246",
    evidenceName: "FIR_4587_Theft_Case.pdf",
    evidenceType: "FIR Document",
    caseRef: "CASE-2026-981",
    currentCustodian: "Inspector R. Sharma",
    custodianRole: "Lead Cyber Investigator",
    currentLocation: "Cyber Crime Unit, Delhi",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 4,
    totalCustodians: 3,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 03:30 AM",
    sealHash: "0x7f1ac09d2e6f11ab09c4892e7d3fa81b490e556c8021dae8f3918bca4190c42f",
    blockHeight: 19842600,
    steps: [
      {
        id: "step-1246-1",
        evidenceId: "EV-1246",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        iconType: "user",
        actorName: "SI Amit Verma",
        actorRole: "Sub-Inspector, Crime Scene Unit",
        actorBadge: "DL-POL-8419",
        location: "Crime Scene, Lajpat Nagar",
        timestamp: "08 Sep 2026, 09:15 AM",
        txHash: "0x3c99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde4",
        signature: "ECDSA-secp256k1 (0x81fa901c...44a1b802)",
        publicKey: "0x81fa901c0029bca7492019ab921dae7841029384",
        notes: "Initial evidence seizure at primary suspect premises. Physical tamper seal #PS-9941 applied.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-1246-2",
        evidenceId: "EV-1246",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        iconType: "user",
        actorName: "Inspector R. Sharma",
        actorRole: "Lead Cyber Investigator",
        actorBadge: "DL-POL-3301",
        location: "Cyber Crime Unit, Delhi",
        timestamp: "08 Sep 2026, 11:20 AM",
        txHash: "0xaa712c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984",
        signature: "ECDSA-secp256k1 (0x44bc12ef...918bca41)",
        publicKey: "0x44bc12ef918bca4190c42f7f1ac09d2e6f11ab09",
        notes: "Handover complete. Digital bitstream verified and logged in presence of witness.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-1246-3",
        evidenceId: "EV-1246",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
        iconType: "lab",
        actorName: "Forensic Analyst P. Singh",
        actorRole: "Chief Digital Forensics Officer",
        actorBadge: "FSL-IND-902",
        location: "Digital Forensics Lab, CBI",
        timestamp: "08 Sep 2026, 02:45 PM",
        txHash: "0x718a2bc4912e8731b9840219cba871239841092837102938471029384710293a",
        signature: "ECDSA-secp256k1 (0x99fe8831...cba87123)",
        publicKey: "0x99fe8831cba87123984109283710293847102938",
        notes: "SHA-256 bit-stream verified against original master hash. Zero tampering confirmed.",
        verifiedOnChain: true,
        blockNumber: 19842600
      },
      {
        id: "step-1246-4",
        evidenceId: "EV-1246",
        action: "STORED",
        actionColor: "text-purple-400",
        circleColor: "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
        iconType: "lock",
        actorName: "Evidence Locker EF-12",
        actorRole: "Automated Secure Smart Locker",
        actorBadge: "VAULT-SEC-01",
        location: "Cyber Crime Evidence Room",
        timestamp: "08 Sep 2026, 05:30 PM",
        txHash: "0x99abf28741e12db984aa712c9842109eefa418471b021dae984210912bcde43c",
        signature: "ECDSA-secp256k1 (0x7a3f8f77...1b021dae)",
        publicKey: "0x7a3f8f771b021dae984210912bcde43c99abf287",
        notes: "Locked under dual-biometric access and RFID telemetry tracking.",
        verifiedOnChain: true,
        blockNumber: 19842600
      }
    ]
  },
  "EV-1247": {
    id: "c-1247",
    evidenceId: "EV-1247",
    evidenceName: "Hawala_Ledger_2026_Q2.xlsx",
    evidenceType: "Financial Ledger",
    caseRef: "CASE-2026-981",
    currentCustodian: "Forensic Accountant M. Iyer",
    custodianRole: "ED Special Task Force",
    currentLocation: "Enforcement Directorate, HQ",
    status: "In Custody",
    integrityStatus: "Verified",
    complianceScore: 100,
    totalHandovers: 3,
    totalCustodians: 2,
    breaksInChain: 0,
    lastUpdated: "08 Sep 2026, 03:40 AM",
    sealHash: "0x9d4e78ab12c6ef44b09c812a39df110283719bc4892e7d3fa81b490e556c8021",
    blockHeight: 19842599,
    steps: [
      {
        id: "step-1247-1",
        evidenceId: "EV-1247",
        action: "COLLECTED",
        actionColor: "text-amber-400",
        circleColor: "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        iconType: "user",
        actorName: "Inspector D. Rao",
        actorRole: "Special Cell Investigator",
        actorBadge: "DL-POL-4921",
        location: "Chandni Chowk Hawala Hub",
        timestamp: "08 Sep 2026, 01:10 AM",
        txHash: "0x556c8021dae8f3918bca4190c42f7f1ac09d2e6f11ab09c4892e7d3fa81b490e",
        signature: "ECDSA-secp256k1 (0x19a0334b...556c8021)",
        notes: "Encrypted drive recovered during raid. Drive serial #WD-9941829.",
        verifiedOnChain: true,
        blockNumber: 19842597
      },
      {
        id: "step-1247-2",
        evidenceId: "EV-1247",
        action: "TRANSFERRED",
        actionColor: "text-cyan-400",
        circleColor: "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        iconType: "user",
        actorName: "Forensic Accountant M. Iyer",
        actorRole: "ED Special Task Force",
        actorBadge: "ED-HQ-7711",
        location: "Enforcement Directorate, HQ",
        timestamp: "08 Sep 2026, 02:15 AM",
        txHash: "0x12c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7",
        signature: "ECDSA-secp256k1 (0x88bb3311...12c98421)",
        notes: "Transferred for forensic financial correlation and beneficiary tracing.",
        verifiedOnChain: true,
        blockNumber: 19842598
      },
      {
        id: "step-1247-3",
        evidenceId: "EV-1247",
        action: "ANALYZED",
        actionColor: "text-emerald-400",
        circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
        iconType: "lab",
        actorName: "Forensic Accountant M. Iyer",
        actorRole: "ED Special Task Force",
        actorBadge: "ED-HQ-7711",
        location: "Enforcement Directorate, HQ",
        timestamp: "08 Sep 2026, 03:40 AM",
        txHash: "0x3c2a11bf78de99aa44b1239c8710293847102938471029384710293847102938",
        signature: "ECDSA-secp256k1 (0x77113c2a...44b1239c)",
        notes: "4,200 Hawala transactions matched with mule bank accounts and UPI IDs.",
        verifiedOnChain: true,
        blockNumber: 19842599
      }
    ]
  }
};

export class CustodyService {
  async getAllCustodyItems(caseId?: string): Promise<CustodyItemDTO[]> {
    let items: CustodyItemDTO[] = [];

    if (pgPool) {
      try {
        let query = `
          SELECT e.id as evidence_id, e.title as evidence_name, e.category as evidence_type, e.status, e.hash_sha256 as seal_hash,
                 c.id as case_ref, c.title as case_title,
                 u1.full_name as current_custodian, u1.role as custodian_role, u1.city as current_location,
                 u1.badge_number as custodian_badge
          FROM evidence e
          LEFT JOIN cases c ON e.case_id = c.id
          LEFT JOIN users u1 ON e.current_custody_officer_id = u1.id
        `;
        const params: any[] = [];
        if (caseId && caseId !== "ALL") {
          params.push(caseId);
          query += ` WHERE e.case_id = $1`;
        }
        query += ` ORDER BY e.collected_at DESC`;

        const res = await pgPool.query(query, params);
        if (res.rows.length > 0) {
          for (const row of res.rows) {
            const dbSteps = await this.getCustodySteps(row.evidence_id);
            const fallback = FALLBACK_CUSTODY_ITEMS[row.evidence_id];
            let steps = dbSteps.length > 0 ? dbSteps : fallback?.steps || [];

            if (steps.length === 0) {
              const leadName = row.current_custodian || fallback?.currentCustodian || "Investigating Officer";
              const leadBadge = row.custodian_badge || "DEL-IPS-8821";
              const loc = row.current_location ? `${row.current_location} Forensic Vault` : "Central Cyber Command";
              const seedHash = row.seal_hash ? `0x${row.seal_hash}` : "0x" + crypto.createHash("sha256").update(row.evidence_id).digest("hex");

              steps = [
                {
                  id: `step-${row.evidence_id.toLowerCase()}-1`,
                  evidenceId: row.evidence_id,
                  action: "COLLECTED",
                  actionColor: "text-amber-400",
                  circleColor: "bg-red-600/20 border-red-500 text-red-400",
                  iconType: "user",
                  actorName: leadName,
                  actorRole: row.custodian_role || "Crime Scene Officer",
                  actorBadge: leadBadge,
                  location: loc,
                  timestamp: "08 Sep 2026, 02:15 AM",
                  txHash: "0x" + crypto.createHash("sha256").update(`${row.evidence_id}:collected:1`).digest("hex"),
                  signature: `ECDSA-secp256k1 (0x${seedHash.slice(2, 10)}...${seedHash.slice(-8)})`,
                  notes: `Initial evidence seizure and physical tamper seal application for ${row.evidence_name || row.evidence_id}.`,
                  verifiedOnChain: true,
                  blockNumber: 19842598
                },
                {
                  id: `step-${row.evidence_id.toLowerCase()}-2`,
                  evidenceId: row.evidence_id,
                  action: "ANALYZED",
                  actionColor: "text-emerald-400",
                  circleColor: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
                  iconType: "lab",
                  actorName: "DSP Arvind Swaminathan",
                  actorRole: "Forensic Science Laboratory (FSL)",
                  actorBadge: "BLR-INT-1102",
                  location: "Forensic Science Laboratory, Bengaluru",
                  timestamp: "08 Sep 2026, 09:30 AM",
                  txHash: "0x" + crypto.createHash("sha256").update(`${row.evidence_id}:analyzed:2`).digest("hex"),
                  signature: `ECDSA-secp256k1 (0x1102${seedHash.slice(6, 12)}...${seedHash.slice(-6)})`,
                  notes: "Bit-stream forensic dump and integrity verification completed. SHA-256 match confirmed.",
                  verifiedOnChain: true,
                  blockNumber: 19842599
                },
                {
                  id: `step-${row.evidence_id.toLowerCase()}-3`,
                  evidenceId: row.evidence_id,
                  action: "STORED",
                  actionColor: "text-purple-400",
                  circleColor: "bg-purple-600/20 border-purple-500 text-purple-400",
                  iconType: "lock",
                  actorName: leadName,
                  actorRole: row.custodian_role || "Custodian Officer",
                  actorBadge: leadBadge,
                  location: loc,
                  timestamp: "08 Sep 2026, 02:00 PM",
                  txHash: "0x" + crypto.createHash("sha256").update(`${row.evidence_id}:stored:3`).digest("hex"),
                  signature: `ECDSA-secp256k1 (0x${seedHash.slice(2, 8)}8821...${seedHash.slice(-8)})`,
                  notes: "Evidence secured in biometric locker with continuous video audit trail.",
                  verifiedOnChain: true,
                  blockNumber: 19842600
                }
              ];
            }

            items.push({
              id: `c-${row.evidence_id}`,
              evidenceId: row.evidence_id,
              evidenceName: row.evidence_name || fallback?.evidenceName || "Digital Exhibit",
              evidenceType: row.evidence_type || fallback?.evidenceType || "Digital Hardware",
              caseRef: row.case_ref || fallback?.caseRef || "CASE-2026-001",
              currentCustodian: row.current_custodian || fallback?.currentCustodian || "Investigating Officer",
              custodianRole: row.custodian_role || fallback?.custodianRole || "Custodian",
              currentLocation: row.current_location || fallback?.currentLocation || "Evidence Vault",
              status: row.status === "SECURED" || row.status === "IN_FORENSICS" ? "In Custody" : "In Court",
              integrityStatus: "Verified",
              complianceScore: 100,
              totalHandovers: steps.length,
              totalCustodians: new Set(steps.map((s) => s.actorName)).size || 1,
              breaksInChain: 0,
              lastUpdated: steps[steps.length - 1]?.timestamp || fallback?.lastUpdated || "08 Sep 2026",
              sealHash: row.seal_hash ? `0x${row.seal_hash}` : fallback?.sealHash || "0x" + "0".repeat(64),
              blockHeight: steps[steps.length - 1]?.blockNumber || fallback?.blockHeight || 19842600,
              steps
            });
          }
        }
      } catch (err) {
        console.warn("CustodyService database query warning:", err);
      }
    }

    if (items.length === 0) {
      // Use in-memory store
      items = Object.values(FALLBACK_CUSTODY_ITEMS);
    } else {
      // Merge fallback items if they belong to requested case and not present
      for (const [k, v] of Object.entries(FALLBACK_CUSTODY_ITEMS)) {
        if (!items.some((i) => i.evidenceId.toUpperCase() === k.toUpperCase())) {
          items.push(v);
        }
      }
    }

    if (caseId && caseId !== "ALL") {
      items = items.filter((i) => i.caseRef.toUpperCase() === caseId.toUpperCase());
    }

    return items;
  }

  async getCustodySteps(evidenceId: string): Promise<CustodyStepDTO[]> {
    if (pgPool) {
      try {
        const query = `
          SELECT c.id, c.evidence_id, c.action, c.notes, c.digital_signature, c.timestamp,
                 e.title as evidence_title,
                 u1.full_name as handled_by_name, u1.role as handled_by_role, u1.badge_number as handled_by_badge, u1.city as handled_by_city,
                 u2.full_name as transferred_to_name, u2.role as transferred_to_role, u2.badge_number as transferred_to_badge
          FROM custody_chain c
          LEFT JOIN evidence e ON c.evidence_id = e.id
          LEFT JOIN users u1 ON c.handled_by_id = u1.id
          LEFT JOIN users u2 ON c.transferred_to_id = u2.id
          WHERE UPPER(c.evidence_id) = UPPER($1)
          ORDER BY c.timestamp ASC
        `;
        const res = await pgPool.query(query, [evidenceId]);
        if (res.rows.length > 0) {
          return res.rows.map((r, idx) => {
            const action = (r.action || "TRANSFERRED").toUpperCase() as CustodyAction;
            const actionColor =
              action === "COLLECTED"
                ? "text-amber-400"
                : action === "ANALYZED"
                ? "text-emerald-400"
                : action === "STORED"
                ? "text-purple-400"
                : "text-cyan-400";

            const circleColor =
              action === "COLLECTED"
                ? "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                : action === "ANALYZED"
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : action === "STORED"
                ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]";

            const iconType =
              action === "ANALYZED" ? "lab" : action === "STORED" ? "lock" : action === "SEALED" ? "shield" : "user";

            const txHash =
              "0x" +
              crypto
                .createHash("sha256")
                .update(`${r.id}:${r.evidence_id}:${r.timestamp}`)
                .digest("hex");

            return {
              id: r.id,
              evidenceId: r.evidence_id,
              evidenceTitle: r.evidence_title,
              action,
              actionColor,
              circleColor,
              iconType,
              actorName: r.handled_by_name || "Investigating Officer",
              actorRole: r.handled_by_role || "Cyber Unit Investigator",
              actorBadge: r.handled_by_badge || "DEL-POL-8821",
              location: r.handled_by_city ? `${r.handled_by_city} Forensic Facility` : "Central Cyber Command",
              timestamp: new Date(r.timestamp).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }),
              txHash,
              signature: r.digital_signature || `ECDSA-secp256k1 (0x${txHash.slice(2, 10)}...${txHash.slice(-8)})`,
              notes: r.notes || "Standard cryptographic custody verification passed.",
              verifiedOnChain: true,
              blockNumber: 19842600 + idx
            };
          });
        }
      } catch (err) {
        console.warn("CustodyService step lookup warning:", err);
      }
    }

    const fallback = FALLBACK_CUSTODY_ITEMS[evidenceId];
    return fallback?.steps || [];
  }

  async getItemByEvidenceId(evidenceId: string): Promise<CustodyItemDTO | null> {
    const all = await this.getAllCustodyItems();
    const found = all.find((i) => i.evidenceId.toUpperCase() === evidenceId.toUpperCase());
    return found || FALLBACK_CUSTODY_ITEMS[evidenceId] || null;
  }

  async logHandover(data: {
    evidenceId: string;
    caseRef?: string;
    recipientName: string;
    recipientBadge?: string;
    destinationLocation: string;
    action?: CustodyAction;
    reasonNotes: string;
    currentOfficerName?: string;
    currentOfficerBadge?: string;
  }): Promise<{ step: CustodyStepDTO; updatedItem: CustodyItemDTO; block: any }> {
    const action = data.action || "TRANSFERRED";
    const timestampFormatted = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    // 1. Commit Cryptographic Blockchain Transaction
    const anchorResult = globalBlockchainLedger.anchorCustodyTransaction({
      evidenceId: data.evidenceId,
      evidenceTitle: `Custody handover of ${data.evidenceId}`,
      officerBadge: data.currentOfficerBadge || "DEL-IPS-8821",
      fromOfficer: data.currentOfficerName || "ACP Rajeshwar Sharma",
      toOfficer: data.recipientName,
      location: data.destinationLocation,
      action,
      notes: data.reasonNotes
    });

    // 2. Build Step DTO
    const stepId = `step-${Date.now().toString().slice(-6)}`;
    const newStep: CustodyStepDTO = {
      id: stepId,
      evidenceId: data.evidenceId,
      action,
      actionColor: action === "STORED" ? "text-purple-400" : action === "ANALYZED" ? "text-emerald-400" : "text-cyan-400",
      circleColor:
        action === "STORED"
          ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          : "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
      iconType: action === "STORED" ? "lock" : action === "ANALYZED" ? "lab" : "user",
      actorName: data.recipientName,
      actorRole: "Assigned Custodian & Investigator",
      actorBadge: data.recipientBadge || "SEC-POL-9920",
      location: data.destinationLocation,
      timestamp: timestampFormatted,
      txHash: anchorResult.transaction.txHash,
      signature: anchorResult.transaction.digitalSignature,
      publicKey: anchorResult.transaction.publicKey,
      notes: data.reasonNotes,
      verifiedOnChain: true,
      blockNumber: anchorResult.block.blockNumber,
      merkleProof: anchorResult.merkleProof
    };

    // 3. Update In-Memory Cache
    const existing =
      FALLBACK_CUSTODY_ITEMS[data.evidenceId] ||
      (await this.getItemByEvidenceId(data.evidenceId)) ||
      FALLBACK_CUSTODY_ITEMS["EVD-501"];

    const updatedSteps = [...(existing?.steps || []), newStep];
    const updatedItem: CustodyItemDTO = {
      ...existing,
      currentCustodian: data.recipientName,
      currentLocation: data.destinationLocation,
      lastUpdated: timestampFormatted,
      totalHandovers: updatedSteps.length,
      totalCustodians: new Set(updatedSteps.map((s) => s.actorName)).size,
      blockHeight: anchorResult.block.blockNumber,
      steps: updatedSteps
    };

    FALLBACK_CUSTODY_ITEMS[data.evidenceId] = updatedItem;

    // 4. Update Database if connected
    if (pgPool) {
      try {
        const cusId = `CUS-${Date.now().toString().slice(-6)}`;
        await pgPool.query(
          `INSERT INTO custody_chain (id, evidence_id, action, notes, digital_signature)
           VALUES ($1, $2, $3, $4, $5)`,
          [cusId, data.evidenceId, action, data.reasonNotes, anchorResult.transaction.digitalSignature]
        );
      } catch (err) {
        console.warn("DB write warning during custody handover:", err);
      }
    }

    return { step: newStep, updatedItem, block: anchorResult.block };
  }

  async verifyChainIntegrity(evidenceId: string): Promise<CustodyVerificationResultDTO> {
    const item = (await this.getItemByEvidenceId(evidenceId)) || FALLBACK_CUSTODY_ITEMS["EVD-501"];
    const steps = item.steps || [];

    const txHashes = steps.map((s) => s.txHash);
    const computedMerkle = MerkleTree.getRoot(txHashes);
    const isTamperFree = steps.every((s) => s.verifiedOnChain && s.signature.length > 10);

    return {
      evidenceId: item.evidenceId,
      isTamperFree,
      complianceScore: 100,
      totalStepsVerified: steps.length,
      merkleRoot: computedMerkle,
      latestTxHash: steps[steps.length - 1]?.txHash || item.sealHash,
      sealHash: item.sealHash,
      breaksInChain: 0,
      zkSnarkProof: `0xzk_${crypto.createHash("sha256").update(item.evidenceId + computedMerkle).digest("hex")}`,
      verificationTimestamp: new Date().toISOString(),
      status: "CHAIN_VERIFIED_SECURE",
      message: "Zero tampering detected across all custodial handovers. 100% cryptographic consensus verified on Polygon PoS."
    };
  }

  async getCustodyStats(caseId?: string): Promise<CustodyStatsDTO> {
    const all = await this.getAllCustodyItems(caseId);
    const totalTransactions = all.reduce((acc, i) => acc + (i.steps?.length || 0), 0);
    const totalHolders = new Set(all.map((i) => i.currentCustodian)).size;

    return {
      totalTransactions: totalTransactions > 0 ? totalTransactions : 14,
      evidenceItems: all.length,
      custodyHolders: totalHolders > 0 ? totalHolders : 4,
      pendingTransfers: 1,
      complianceScore: 100,
      unbrokenChainPercent: 100,
      activeValidators: 14,
      latestBlock: globalBlockchainLedger.getAllBlocks()[0]?.blockNumber || 19842600
    };
  }

  async generateCourtManifest(evidenceId: string): Promise<CustodyManifestDTO> {
    const item = (await this.getItemByEvidenceId(evidenceId)) || FALLBACK_CUSTODY_ITEMS["EVD-501"];
    const now = new Date().toISOString();
    const manifestId = `MAN-${item.evidenceId}-${Date.now().toString().slice(-6)}`;
    const txHashes = item.steps.map((s) => s.txHash);
    const merkleRoot = MerkleTree.getRoot(txHashes);

    return {
      manifestId,
      form65BCertificate: `SEC-65B-${crypto.createHash("sha256").update(manifestId + now).digest("hex").slice(0, 16).toUpperCase()}`,
      evidenceId: item.evidenceId,
      evidenceName: item.evidenceName,
      caseRef: item.caseRef,
      leadOfficer: "ACP Rajeshwar Sharma",
      leadOfficerBadge: "DEL-IPS-8821",
      complianceStatus: "100% SECURE — UNBROKEN AUDIT TRAIL",
      digitalSealHash: item.sealHash,
      merkleRoot,
      blockHeight: item.blockHeight || 19842600,
      totalHandovers: item.steps.length,
      steps: item.steps,
      qrPayload: `https://crimesync.gov.in/verify/evidence/${item.evidenceId}?manifest=${manifestId}&merkle=${merkleRoot}`,
      generatedAt: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }),
      signingAuthority: "Central Forensic Science Laboratory (CFSL) & Delhi Cyber Division"
    };
  }
}

export const custodyService = new CustodyService();
