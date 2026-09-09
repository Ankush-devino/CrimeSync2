import { Router, Request, Response } from "express";
import { pgPool } from "../../config/db";
import { formatResponse } from "../../utils/api-response";

export interface FinancialAccount {
  id: string;
  account_number: string;
  case_id: string;
  holder_name: string;
  account_type: string;
  bank_name: string;
  ifsc_code: string;
  branch: string;
  opening_date: string;
  current_balance_inr: number;
  total_received_inr: number;
  total_sent_inr: number;
  risk_score: number;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "FROZEN" | "FLAGGED";
  tier: "TIER_1_MULE" | "TIER_2_AGGREGATOR" | "PRIMARY_VICTIM" | "CRYPTO_GATEWAY" | "HAWALA_COUNTER";
  pan_card?: string;
  aadhaar_masked?: string;
  phone?: string;
  location?: string;
  freeze_order_ref?: string;
  frozen_at?: string;
}

export interface FinancialTransaction {
  id: string;
  case_id: string;
  transaction_ref: string;
  source_account: string;
  source_holder: string;
  target_account: string;
  target_holder: string;
  amount_inr: number;
  channel: "NEFT" | "RTGS" | "IMPS" | "UPI" | "CRYPTO_USDT" | "CRYPTO_BTC" | "CRYPTO_ETH" | "HAWALA_TOKEN" | "AEPS_CASH";
  timestamp: string;
  suspicious_score: number;
  flag_reason: string;
  status: "COMPLETED" | "BLOCKED" | "UNDER_SCRUTINY" | "FROZEN";
  hop_sequence: number;
  ip_address?: string;
  device_id?: string;
}

export interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  type: "VICTIM" | "MULE_TIER_1" | "MULE_TIER_2" | "AGGREGATOR" | "CRYPTO_GATEWAY" | "HAWALA_DROP" | "OFFSHORE";
  balance: number;
  risk_score: number;
  status: "ACTIVE" | "FROZEN" | "FLAGGED";
  x: number;
  y: number;
}

export interface FlowLink {
  id: string;
  source: string;
  target: string;
  amount_inr: number;
  channel: string;
  timestamp: string;
  is_suspicious: boolean;
  hop_label: string;
}

export interface CryptoTrail {
  id: string;
  case_id: string;
  source_address: string;
  target_address: string;
  blockchain: "TRON (TRC-20)" | "ETHEREUM (ERC-20)" | "BITCOIN" | "MONERO";
  asset: "USDT" | "BTC" | "ETH" | "XMR";
  amount: number;
  amount_inr_equivalent: number;
  tx_hash: string;
  timestamp: string;
  service_tag?: string;
  exchange_name?: string;
  risk_category: "OTC_BROKER" | "MIXER_TORNADO" | "HIGH_RISK_EXCHANGE" | "COLD_WALLET";
  freeze_request_sent: boolean;
}

export interface HawalaEntry {
  id: string;
  case_id: string;
  token_number: string;
  note_serial_prefix: string;
  amount_inr: number;
  sender_alias: string;
  receiver_alias: string;
  angadia_courier_name: string;
  origin_city: string;
  destination_city: string;
  status: "SETTLED" | "INTERCEPTED" | "IN_TRANSIT" | "FLAGGED";
  timestamp: string;
  forensic_note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Distinct Datasets for All 9 Law Enforcement Cases
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ACCOUNTS: FinancialAccount[] = [
  // 1. CASE-2026-004: Kolkata Tech Support Scam & Crypto OTC
  {
    id: "ACC-KOL-01",
    account_number: "SBIN00449120938",
    case_id: "CASE-2026-004",
    holder_name: "Debashis Banerjee (Primary Operative)",
    account_type: "Current Account",
    bank_name: "State Bank of India",
    ifsc_code: "SBIN0001234",
    branch: "Salt Lake Sector V Branch, Kolkata",
    opening_date: "14 Feb 2024",
    current_balance_inr: 845000,
    total_received_inr: 4130000,
    total_sent_inr: 3285000,
    risk_score: 96,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    pan_card: "ABXPB9912K",
    aadhaar_masked: "XXXX-XXXX-8821",
    phone: "+91-98301-44912",
    location: "Kolkata, West Bengal",
  },
  {
    id: "ACC-KOL-02",
    account_number: "HDFC00091823746",
    case_id: "CASE-2026-004",
    holder_name: "Subhashis Roy (Mule Tier 1)",
    account_type: "Savings Account",
    bank_name: "HDFC Bank",
    ifsc_code: "HDFC0001044",
    branch: "Burrabazar Branch, Kolkata",
    opening_date: "10 Dec 2025",
    current_balance_inr: 120000,
    total_received_inr: 1850000,
    total_sent_inr: 1730000,
    risk_score: 88,
    risk_level: "HIGH",
    status: "ACTIVE",
    tier: "TIER_1_MULE",
    pan_card: "CPYPR8810M",
    location: "Kolkata, West Bengal",
  },
  {
    id: "ACC-KOL-03",
    account_number: "ICIC00041928374",
    case_id: "CASE-2026-004",
    holder_name: "Bengal Tech Logix Solutions LLP",
    account_type: "Corporate Escrow",
    bank_name: "ICICI Bank",
    ifsc_code: "ICIC0000021",
    branch: "Park Street Crossing, Kolkata",
    opening_date: "04 May 2025",
    current_balance_inr: 420000,
    total_received_inr: 2280000,
    total_sent_inr: 1860000,
    risk_score: 91,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "CRYPTO_GATEWAY",
    location: "Kolkata, West Bengal",
  },

  // 2. CASE-2026-001: New Delhi (Operation Trishul / Garuda)
  {
    id: "ACC-DEL-01",
    account_number: "SBIN00112938475",
    case_id: "CASE-2026-001",
    holder_name: "Aman Khan (Syndicate Kingpin)",
    account_type: "Current Account",
    bank_name: "State Bank of India",
    ifsc_code: "SBIN0000691",
    branch: "Lajpat Nagar Central, New Delhi",
    opening_date: "12 Mar 2024",
    current_balance_inr: 580000,
    total_received_inr: 3480000,
    total_sent_inr: 2900000,
    risk_score: 94,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    pan_card: "BKPAK1029R",
    location: "New Delhi",
  },
  {
    id: "ACC-DEL-02",
    account_number: "PUNB00449182736",
    case_id: "CASE-2026-001",
    holder_name: "Rameshwar Dayal (Mule Tier 1)",
    account_type: "Jan Dhan Savings Account",
    bank_name: "Punjab National Bank",
    ifsc_code: "PUNB0019283",
    branch: "Karol Bagh Branch, New Delhi",
    opening_date: "20 Nov 2025",
    current_balance_inr: 65000,
    total_received_inr: 1240000,
    total_sent_inr: 1175000,
    risk_score: 85,
    risk_level: "HIGH",
    status: "ACTIVE",
    tier: "TIER_1_MULE",
    location: "New Delhi",
  },

  // 3. CASE-2026-002: Mumbai (GridShield Cyber Attack)
  {
    id: "ACC-MUM-02",
    account_number: "HDFC00018492019",
    case_id: "CASE-2026-002",
    holder_name: "Meera Krishnan (Alias: ByteQueen)",
    account_type: "Current Account",
    bank_name: "HDFC Bank",
    ifsc_code: "HDFC0000060",
    branch: "Bandra Kurla Complex, Mumbai",
    opening_date: "08 Aug 2024",
    current_balance_inr: 920000,
    total_received_inr: 4800000,
    total_sent_inr: 3880000,
    risk_score: 95,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    location: "Mumbai, Maharashtra",
  },
  {
    id: "ACC-MUM-03",
    account_number: "ICIC00088192039",
    case_id: "CASE-2026-002",
    holder_name: "DarkNode Cloud Relay Infra LLP",
    account_type: "Corporate Escrow",
    bank_name: "ICICI Bank",
    ifsc_code: "ICIC0000104",
    branch: "Nariman Point, Mumbai",
    opening_date: "19 Nov 2024",
    current_balance_inr: 380000,
    total_received_inr: 2100000,
    total_sent_inr: 1720000,
    risk_score: 90,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "CRYPTO_GATEWAY",
    location: "Mumbai, Maharashtra",
  },

  // 4. CASE-2026-003: Bengaluru (Operation Garud - SIM Farm Ring)
  {
    id: "ACC-BLR-01",
    account_number: "CNRB00019283746",
    case_id: "CASE-2026-003",
    holder_name: "Sunil Yadav (Alias: Sunny)",
    account_type: "Savings Account",
    bank_name: "Canara Bank",
    ifsc_code: "CNRB0000512",
    branch: "Koramangala 80ft Road, Bengaluru",
    opening_date: "15 Apr 2025",
    current_balance_inr: 180000,
    total_received_inr: 1800000,
    total_sent_inr: 1620000,
    risk_score: 87,
    risk_level: "HIGH",
    status: "ACTIVE",
    tier: "TIER_1_MULE",
    location: "Bengaluru, Karnataka",
  },

  // 5. CASE-2026-005: Mumbai & Jaipur (Operation Vajra - Digital Arrest)
  {
    id: "ACC-MUM-01",
    account_number: "UTIB00091823746",
    case_id: "CASE-2026-005",
    holder_name: "National Legal Escrow & Verification Desk (Fake)",
    account_type: "Current Account",
    bank_name: "Axis Bank",
    ifsc_code: "UTIB0000010",
    branch: "Bandra Kurla Complex, Mumbai",
    opening_date: "02 Jan 2026",
    current_balance_inr: 1450000,
    total_received_inr: 5150000,
    total_sent_inr: 3700000,
    risk_score: 98,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    pan_card: "AABCN8821M",
    location: "Mumbai, Maharashtra",
  },
  {
    id: "ACC-JAI-01",
    account_number: "HDFC00044192038",
    case_id: "CASE-2026-005",
    holder_name: "Kunwar Pratap Singh (Alias: Rana Saheb)",
    account_type: "Current Account",
    bank_name: "HDFC Bank",
    ifsc_code: "HDFC0000132",
    branch: "MI Road Branch, Jaipur",
    opening_date: "14 Jun 2024",
    current_balance_inr: 680000,
    total_received_inr: 2800000,
    total_sent_inr: 2120000,
    risk_score: 94,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_1_MULE",
    location: "Jaipur, Rajasthan",
  },

  // 6. CASE-2026-006: Ahmedabad (Operation Durg - AePS Biometric Bypass)
  {
    id: "ACC-AHM-01",
    account_number: "BARB0AHM0019283",
    case_id: "CASE-2026-006",
    holder_name: "Jignesh Patel (Alias: Silicon Master)",
    account_type: "Commercial CSP Escrow",
    bank_name: "Bank of Baroda",
    ifsc_code: "BARB0ASHRAM",
    branch: "Ashram Road Branch, Ahmedabad",
    opening_date: "18 Jun 2025",
    current_balance_inr: 290000,
    total_received_inr: 1960000,
    total_sent_inr: 1670000,
    risk_score: 89,
    risk_level: "HIGH",
    status: "ACTIVE",
    tier: "TIER_1_MULE",
    location: "Ahmedabad, Gujarat",
  },

  // 7. CASE-2026-007: Bengaluru (Operation Netra - AI Deepfake Extortion)
  {
    id: "ACC-BLR-02",
    account_number: "KKBK00088192039",
    case_id: "CASE-2026-007",
    holder_name: "Kavita Nair (Alias: Aria)",
    account_type: "Current Account",
    bank_name: "Kotak Mahindra Bank",
    ifsc_code: "KKBK0000421",
    branch: "Koramangala 4th Block, Bengaluru",
    opening_date: "04 Mar 2025",
    current_balance_inr: 510000,
    total_received_inr: 2550000,
    total_sent_inr: 2040000,
    risk_score: 93,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    location: "Bengaluru, Karnataka",
  },

  // 8. CASE-2026-008: Pune (Operation Kuber - Loan App & Hawala Funnel)
  {
    id: "ACC-PUN-01",
    account_number: "KKBK00019283746",
    case_id: "CASE-2026-008",
    holder_name: "Chirag Mehta (Alias: Charlie)",
    account_type: "Corporate Escrow",
    bank_name: "Kotak Mahindra Bank",
    ifsc_code: "KKBK0000144",
    branch: "Hinjewadi IT Park, Pune",
    opening_date: "11 Sep 2025",
    current_balance_inr: 1840000,
    total_received_inr: 6280000,
    total_sent_inr: 4440000,
    risk_score: 97,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    location: "Pune, Maharashtra",
  },

  // 9. CASE-2026-009: Chennai (Operation Rudra - Power Grid SCADA Ransomware)
  {
    id: "ACC-CHE-01",
    account_number: "CNRB00091823746",
    case_id: "CASE-2026-009",
    holder_name: "Karthik Ramanathan (Alias: GhostByte)",
    account_type: "Current Account",
    bank_name: "Canara Bank",
    ifsc_code: "CNRB0001044",
    branch: "Guindy Industrial Estate, Chennai",
    opening_date: "22 Jan 2025",
    current_balance_inr: 2500000,
    total_received_inr: 10000000,
    total_sent_inr: 7500000,
    risk_score: 99,
    risk_level: "CRITICAL",
    status: "ACTIVE",
    tier: "TIER_2_AGGREGATOR",
    location: "Chennai, Tamil Nadu",
  },
];

const DEFAULT_TRANSACTIONS: FinancialTransaction[] = [
  // CASE-2026-004: Kolkata
  {
    id: "TXN-004-01",
    case_id: "CASE-2026-004",
    transaction_ref: "UTR/KOL/2026/0412/9901",
    source_account: "VICTIM-US-WIRE-9912",
    source_holder: "Robert Miller (US Citizen)",
    target_account: "HDFC00091823746",
    target_holder: "Subhashis Roy (Mule Tier 1)",
    amount_inr: 1850000,
    channel: "NEFT",
    timestamp: "2026-09-09T09:20:00Z",
    suspicious_score: 96,
    flag_reason: "High-value overseas tech-support extortion wire immediately layered across mules.",
    status: "COMPLETED",
    hop_sequence: 1,
  },
  {
    id: "TXN-004-02",
    case_id: "CASE-2026-004",
    transaction_ref: "UTR/KOL/2026/0412/9902",
    source_account: "HDFC00091823746",
    source_holder: "Subhashis Roy (Mule Tier 1)",
    target_account: "SBIN00449120938",
    target_holder: "Debashis Banerjee (Primary Operative)",
    amount_inr: 1730000,
    channel: "IMPS",
    timestamp: "2026-09-09T09:35:00Z",
    suspicious_score: 92,
    flag_reason: "Rapid intra-hour velocity transfer with zero cooling period.",
    status: "COMPLETED",
    hop_sequence: 2,
  },
  {
    id: "TXN-004-03",
    case_id: "CASE-2026-004",
    transaction_ref: "TXN-CRYPTO-TRC20-KOL",
    source_account: "SBIN00449120938",
    source_holder: "Debashis Banerjee (Primary Operative)",
    target_account: "0x9f182a4d99c1e44bc19283749281038471928374",
    target_holder: "Burrabazar OTC Bullion USDT Desk",
    amount_inr: 1950000,
    channel: "CRYPTO_USDT",
    timestamp: "2026-09-09T09:50:00Z",
    suspicious_score: 98,
    flag_reason: "Direct fiat-to-USDT crypto off-ramp through unregulated OTC broker.",
    status: "COMPLETED",
    hop_sequence: 3,
  },

  // CASE-2026-001: New Delhi
  {
    id: "TXN-001-01",
    case_id: "CASE-2026-001",
    transaction_ref: "UPI/DEL/2026/0891/1044",
    source_account: "VICTIM-DEL-PSU-4412",
    source_holder: "Suresh Chandra (PSU Pensioner)",
    target_account: "PUNB00449182736",
    target_holder: "Rameshwar Dayal (Mule Tier 1)",
    amount_inr: 490000,
    channel: "UPI",
    timestamp: "2026-09-09T10:05:00Z",
    suspicious_score: 95,
    flag_reason: "Phishing OTP unauthorized debit drained within 3 minutes.",
    status: "COMPLETED",
    hop_sequence: 1,
  },
  {
    id: "TXN-001-02",
    case_id: "CASE-2026-001",
    transaction_ref: "UTR/DEL/2026/0891/2201",
    source_account: "PUNB00449182736",
    source_holder: "Rameshwar Dayal (Mule Tier 1)",
    target_account: "SBIN00112938475",
    target_holder: "Aman Khan (Syndicate Kingpin)",
    amount_inr: 1175000,
    channel: "IMPS",
    timestamp: "2026-09-09T10:20:00Z",
    suspicious_score: 91,
    flag_reason: "High velocity aggregator sweep.",
    status: "COMPLETED",
    hop_sequence: 2,
  },

  // CASE-2026-002: Mumbai (GridShield Cyber Attack)
  {
    id: "TXN-002-01",
    case_id: "CASE-2026-002",
    transaction_ref: "RTGS/MUM/2026/0291/001",
    source_account: "MAHA-DISCOM-EMERGENCY-PAY",
    source_holder: "Maharashtra State Power Substation 400kV",
    target_account: "HDFC00018492019",
    target_holder: "Meera Krishnan (Alias: ByteQueen)",
    amount_inr: 2800000,
    channel: "RTGS",
    timestamp: "2026-09-09T08:15:00Z",
    suspicious_score: 98,
    flag_reason: "Coerced infrastructure SCADA extortion ransom payment.",
    status: "COMPLETED",
    hop_sequence: 1,
  },
  {
    id: "TXN-002-02",
    case_id: "CASE-2026-002",
    transaction_ref: "NEFT/MUM/2026/0291/002",
    source_account: "MAHA-DISCOM-EMERGENCY-PAY",
    source_holder: "Maharashtra State Power Substation 400kV",
    target_account: "ICIC00088192039",
    target_holder: "DarkNode Cloud Relay Infra LLP",
    amount_inr: 2000000,
    channel: "NEFT",
    timestamp: "2026-09-09T08:30:00Z",
    suspicious_score: 95,
    flag_reason: "Server lease shell account fund routing.",
    status: "COMPLETED",
    hop_sequence: 1,
  },

  // CASE-2026-003: Bengaluru (Operation Garud)
  {
    id: "TXN-003-01",
    case_id: "CASE-2026-003",
    transaction_ref: "UPI/BLR/2026/0319/001",
    source_account: "E-COMM-SMURF-POOL-01",
    source_holder: "UPI Smurfed E-Commerce Accounts",
    target_account: "CNRB00019283746",
    target_holder: "Sunil Yadav (Alias: Sunny)",
    amount_inr: 920000,
    channel: "UPI",
    timestamp: "2026-09-09T09:10:00Z",
    suspicious_score: 92,
    flag_reason: "Micro-payment smurfing via counterfeit SIM bank gateways.",
    status: "COMPLETED",
    hop_sequence: 1,
  },

  // CASE-2026-007: Bengaluru (Operation Netra)
  {
    id: "TXN-007-01",
    case_id: "CASE-2026-007",
    transaction_ref: "RTGS/BLR/2026/0712/001",
    source_account: "CORP-EXEC-ESCROW-POOL",
    source_holder: "Corporate Executive Extortion Targets",
    target_account: "KKBK00088192039",
    target_holder: "Kavita Nair (Alias: Aria)",
    amount_inr: 2550000,
    channel: "RTGS",
    timestamp: "2026-09-09T02:00:00Z",
    suspicious_score: 97,
    flag_reason: "AI Deepfake extortion blackmail payment.",
    status: "COMPLETED",
    hop_sequence: 1,
  },

  // CASE-2026-005: Mumbai (Digital Arrest)
  {
    id: "TXN-005-01",
    case_id: "CASE-2026-005",
    transaction_ref: "RTGS/MUM/2026/1842/7701",
    source_account: "VICTIM-MUM-SENIOR-110",
    source_holder: "Dr. Meenakshi Sundaram (Retired Professor)",
    target_account: "UTIB00091823746",
    target_holder: "National Legal Escrow & Verification Desk (Fake)",
    amount_inr: 3500000,
    channel: "RTGS",
    timestamp: "2026-09-09T01:30:00Z",
    suspicious_score: 99,
    flag_reason: "Coerced RTGS fund transfer under 48-hour digital arrest impersonation.",
    status: "COMPLETED",
    hop_sequence: 1,
  },
  {
    id: "TXN-005-02",
    case_id: "CASE-2026-005",
    transaction_ref: "UTR/JAI/2026/1842/8821",
    source_account: "UTIB00091823746",
    source_holder: "National Legal Escrow & Verification Desk",
    target_account: "HDFC00044192038",
    target_holder: "Kunwar Pratap Singh (Alias: Rana Saheb)",
    amount_inr: 1650000,
    channel: "IMPS",
    timestamp: "2026-09-09T02:15:00Z",
    suspicious_score: 94,
    flag_reason: "Inter-state syndicate transfer.",
    status: "COMPLETED",
    hop_sequence: 2,
  },

  // CASE-2026-006: Ahmedabad (AePS Hack)
  {
    id: "TXN-006-01",
    case_id: "CASE-2026-006",
    transaction_ref: "AEPS/AHM/2026/0593/1101",
    source_account: "LAND-REGISTRY-VICTIMS-POOL",
    source_holder: "Rural Land Registry Deed Holders",
    target_account: "BARB0AHM0019283",
    target_holder: "Jignesh Patel (Alias: Silicon Master)",
    amount_inr: 1960000,
    channel: "AEPS_CASH",
    timestamp: "2026-09-09T10:45:00Z",
    suspicious_score: 97,
    flag_reason: "Cloned silicone fingerprint micro-ATM debits across 196 accounts.",
    status: "COMPLETED",
    hop_sequence: 1,
  },

  // CASE-2026-008: Pune (Instant Loan App)
  {
    id: "TXN-008-01",
    case_id: "CASE-2026-008",
    transaction_ref: "UPI/PUN/2026/1129/4401",
    source_account: "LOAN-VICTIMS-UPI-COLLECTION",
    source_holder: "Coerced Loan App Borrowers",
    target_account: "KKBK00019283746",
    target_holder: "Chirag Mehta (Alias: Charlie)",
    amount_inr: 6280000,
    channel: "UPI",
    timestamp: "2026-09-09T03:15:00Z",
    suspicious_score: 98,
    flag_reason: "Extortion repayment routing through shell fintech corporate escrow.",
    status: "COMPLETED",
    hop_sequence: 1,
  },

  // CASE-2026-009: Chennai (SCADA Ransomware)
  {
    id: "TXN-009-01",
    case_id: "CASE-2026-009",
    transaction_ref: "TXN-CRYPTO-BTC-RUDRA",
    source_account: "GRID-OPERATOR-EMERGENCY-FUND",
    source_holder: "Southern Regional Power Grid Relays",
    target_account: "CNRB00091823746",
    target_holder: "Karthik Ramanathan (Alias: GhostByte)",
    amount_inr: 10000000,
    channel: "CRYPTO_BTC",
    timestamp: "2026-09-09T08:30:00Z",
    suspicious_score: 99,
    flag_reason: "Critical SCADA ransomware decryption key ransom deposit.",
    status: "COMPLETED",
    hop_sequence: 1,
  },
];

const DEFAULT_FLOW_NETWORKS: Record<string, { nodes: FlowNode[]; links: FlowLink[] }> = {
  // 1. CASE-2026-004: Kolkata
  "CASE-2026-004": {
    nodes: [
      { id: "NODE-V1", label: "US Tech Support Victims", sublabel: "38 Overseas Wires", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 60, y: 180 },
      { id: "NODE-M1", label: "Mule Tier 1 (HDFC Burrabazar)", sublabel: "Subhashis Roy", type: "MULE_TIER_1", balance: 120000, risk_score: 88, status: "ACTIVE", x: 250, y: 110 },
      { id: "NODE-M2", label: "Mule Tier 1 (ICICI Salt Lake)", sublabel: "Anirban Mukherjee", type: "MULE_TIER_1", balance: 240000, risk_score: 85, status: "ACTIVE", x: 250, y: 250 },
      { id: "NODE-AG", label: "Aggregator (SBI Sector V)", sublabel: "Debashis Banerjee", type: "AGGREGATOR", balance: 845000, risk_score: 96, status: "ACTIVE", x: 460, y: 180 },
      { id: "NODE-CR", label: "OTC USDT Desk (Burrabazar)", sublabel: "Wallet: 0x9f182a4d...", type: "CRYPTO_GATEWAY", balance: 1480000, risk_score: 98, status: "ACTIVE", x: 670, y: 110 },
      { id: "NODE-HW", label: "Hawala Cash Drop (Park St)", sublabel: "Prakash Angadia", type: "HAWALA_DROP", balance: 650000, risk_score: 92, status: "ACTIVE", x: 670, y: 250 },
      { id: "NODE-OFF", label: "Offshore Vault (Dubai OTC)", sublabel: "Cold Storage 0x33b4...", type: "OFFSHORE", balance: 750000, risk_score: 99, status: "ACTIVE", x: 860, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 1850000, channel: "Wire/NEFT", timestamp: "09:20 AM", is_suspicious: true, hop_label: "Hop 1: Placement" },
      { id: "L2", source: "NODE-V1", target: "NODE-M2", amount_inr: 2280000, channel: "Wire/NEFT", timestamp: "09:25 AM", is_suspicious: true, hop_label: "Hop 1: Placement" },
      { id: "L3", source: "NODE-M1", target: "NODE-AG", amount_inr: 1730000, channel: "IMPS", timestamp: "09:35 AM", is_suspicious: true, hop_label: "Hop 2: Layering" },
      { id: "L4", source: "NODE-M2", target: "NODE-AG", amount_inr: 1860000, channel: "RTGS", timestamp: "09:40 AM", is_suspicious: true, hop_label: "Hop 2: Layering" },
      { id: "L5", source: "NODE-AG", target: "NODE-CR", amount_inr: 1950000, channel: "USDT/TRC-20", timestamp: "09:50 AM", is_suspicious: true, hop_label: "Hop 3: Crypto Conversion" },
      { id: "L6", source: "NODE-AG", target: "NODE-HW", amount_inr: 1335000, channel: "Cash Handover", timestamp: "10:15 AM", is_suspicious: true, hop_label: "Hop 3: Hawala Funnel" },
      { id: "L7", source: "NODE-CR", target: "NODE-OFF", amount_inr: 1950000, channel: "Cold Transfer", timestamp: "10:45 AM", is_suspicious: true, hop_label: "Hop 4: Integration" },
    ],
  },

  // 2. CASE-2026-001: New Delhi
  "CASE-2026-001": {
    nodes: [
      { id: "NODE-V1", label: "Phished PSU Pensioners", sublabel: "14 Account Breaches", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 70, y: 180 },
      { id: "NODE-M1", label: "Jan Dhan Mule 1 (PNB)", sublabel: "Rameshwar Dayal", type: "MULE_TIER_1", balance: 65000, risk_score: 85, status: "ACTIVE", x: 260, y: 120 },
      { id: "NODE-M2", label: "Jan Dhan Mule 2 (SBI)", sublabel: "Kishan Lal", type: "MULE_TIER_1", balance: 95000, risk_score: 82, status: "ACTIVE", x: 260, y: 250 },
      { id: "NODE-AG", label: "Aggregator Hub (SBI Lajpat)", sublabel: "Aman Khan", type: "AGGREGATOR", balance: 580000, risk_score: 94, status: "ACTIVE", x: 480, y: 180 },
      { id: "NODE-HW", label: "Chandni Chowk Bullion Hawala", sublabel: "Token: #DEL-CC-4410", type: "HAWALA_DROP", balance: 2760000, risk_score: 95, status: "ACTIVE", x: 720, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 1240000, channel: "UPI", timestamp: "10:05 AM", is_suspicious: true, hop_label: "Hop 1: Placement" },
      { id: "L2", source: "NODE-V1", target: "NODE-M2", amount_inr: 1680000, channel: "IMPS", timestamp: "10:10 AM", is_suspicious: true, hop_label: "Hop 1: Placement" },
      { id: "L3", source: "NODE-M1", target: "NODE-AG", amount_inr: 1175000, channel: "IMPS", timestamp: "10:20 AM", is_suspicious: true, hop_label: "Hop 2: Layering" },
      { id: "L4", source: "NODE-M2", target: "NODE-AG", amount_inr: 1585000, channel: "RTGS", timestamp: "10:25 AM", is_suspicious: true, hop_label: "Hop 2: Layering" },
      { id: "L5", source: "NODE-AG", target: "NODE-HW", amount_inr: 2760000, channel: "Cash Drop", timestamp: "11:00 AM", is_suspicious: true, hop_label: "Hop 3: Hawala Exit" },
    ],
  },

  // 3. CASE-2026-002: Mumbai (GridShield SCADA Breach)
  "CASE-2026-002": {
    nodes: [
      { id: "NODE-V1", label: "Maha Load Despatch Centre", sublabel: "SCADA Control Relays", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 60, y: 180 },
      { id: "NODE-M1", label: "Mule Tier 1 (HDFC BKC)", sublabel: "Meera Krishnan", type: "MULE_TIER_1", balance: 920000, risk_score: 95, status: "ACTIVE", x: 260, y: 110 },
      { id: "NODE-M2", label: "Cloud Node Escrow (ICICI)", sublabel: "DarkNode Cloud Infra", type: "AGGREGATOR", balance: 380000, risk_score: 90, status: "ACTIVE", x: 260, y: 250 },
      { id: "NODE-CR", label: "Wasabi CoinJoin Mixer", sublabel: "Monero XMR Stealth Ring", type: "CRYPTO_GATEWAY", balance: 3500000, risk_score: 99, status: "ACTIVE", x: 490, y: 180 },
      { id: "NODE-OFF", label: "Dark Web Ransom Vault", sublabel: "Bulletproof Hosting Escrow", type: "OFFSHORE", balance: 4800000, risk_score: 99, status: "ACTIVE", x: 740, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 2800000, channel: "RTGS", timestamp: "08:15 AM", is_suspicious: true, hop_label: "Hop 1: Ransom Inflow" },
      { id: "L2", source: "NODE-V1", target: "NODE-M2", amount_inr: 2000000, channel: "NEFT", timestamp: "08:30 AM", is_suspicious: true, hop_label: "Hop 1: Server Lease Extortion" },
      { id: "L3", source: "NODE-M1", target: "NODE-CR", amount_inr: 2450000, channel: "Monero XMR", timestamp: "08:50 AM", is_suspicious: true, hop_label: "Hop 2: CoinJoin Anonymization" },
      { id: "L4", source: "NODE-M2", target: "NODE-CR", amount_inr: 1900000, channel: "Monero XMR", timestamp: "09:05 AM", is_suspicious: true, hop_label: "Hop 2: CoinJoin Anonymization" },
      { id: "L5", source: "NODE-CR", target: "NODE-OFF", amount_inr: 4350000, channel: "Stealth XMR", timestamp: "09:40 AM", is_suspicious: true, hop_label: "Hop 3: Dark Web Integration" },
    ],
  },

  // 4. CASE-2026-003: Bengaluru (Operation Garud)
  "CASE-2026-003": {
    nodes: [
      { id: "NODE-V1", label: "Smurfed E-Commerce Gateways", sublabel: "Counterfeit SIM Gateway", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 60, y: 180 },
      { id: "NODE-M1", label: "Mule Tier 1 (Canara Koramangala)", sublabel: "Sunil Yadav", type: "MULE_TIER_1", balance: 180000, risk_score: 87, status: "ACTIVE", x: 260, y: 180 },
      { id: "NODE-AG", label: "SIM Farm Merchant Hub", sublabel: "Razorpay Shell Corporate", type: "AGGREGATOR", balance: 740000, risk_score: 93, status: "ACTIVE", x: 480, y: 180 },
      { id: "NODE-HW", label: "Chickpet Electronics Cash Drop", sublabel: "Angadia Courier Drop", type: "HAWALA_DROP", balance: 1620000, risk_score: 91, status: "ACTIVE", x: 720, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 920000, channel: "UPI Smurf", timestamp: "09:10 AM", is_suspicious: true, hop_label: "Hop 1: SIM Micro Debits" },
      { id: "L2", source: "NODE-M1", target: "NODE-AG", amount_inr: 850000, channel: "IMPS", timestamp: "09:30 AM", is_suspicious: true, hop_label: "Hop 2: Merchant Settlement" },
      { id: "L3", source: "NODE-AG", target: "NODE-HW", amount_inr: 1620000, channel: "Cash Courier", timestamp: "10:00 AM", is_suspicious: true, hop_label: "Hop 3: Physical Cash-out" },
    ],
  },

  // 5. CASE-2026-005: Mumbai (Digital Arrest)
  "CASE-2026-005": {
    nodes: [
      { id: "NODE-V1", label: "Digital Arrest Victims", sublabel: "Dr. Meenakshi Sundaram", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 70, y: 180 },
      { id: "NODE-M1", label: "Fake Verification Desk (Axis)", sublabel: "National Legal Escrow", type: "AGGREGATOR", balance: 1450000, risk_score: 98, status: "ACTIVE", x: 280, y: 180 },
      { id: "NODE-M2", label: "Mule Tier 1 (HDFC Jaipur)", sublabel: "Kunwar Pratap Singh", type: "MULE_TIER_1", balance: 680000, risk_score: 94, status: "ACTIVE", x: 500, y: 120 },
      { id: "NODE-CR", label: "Dubai USDT OTC Off-Ramp", sublabel: "Wallet: 0x4421...", type: "CRYPTO_GATEWAY", balance: 3500000, risk_score: 99, status: "ACTIVE", x: 500, y: 250 },
      { id: "NODE-HW", label: "Jaipur Angadia Network", sublabel: "Ratanlal Angadia", type: "HAWALA_DROP", balance: 1650000, risk_score: 95, status: "ACTIVE", x: 730, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 3500000, channel: "RTGS", timestamp: "01:30 PM", is_suspicious: true, hop_label: "Hop 1: Coerced Transfer" },
      { id: "L2", source: "NODE-M1", target: "NODE-M2", amount_inr: 1650000, channel: "IMPS", timestamp: "02:15 PM", is_suspicious: true, hop_label: "Hop 2: Layering" },
      { id: "L3", source: "NODE-M1", target: "NODE-CR", amount_inr: 3500000, channel: "USDT TRC-20", timestamp: "02:30 PM", is_suspicious: true, hop_label: "Hop 3: Crypto Off-Ramp" },
      { id: "L4", source: "NODE-M2", target: "NODE-HW", amount_inr: 1650000, channel: "Cash Token", timestamp: "03:00 PM", is_suspicious: true, hop_label: "Hop 3: Hawala Settlement" },
    ],
  },

  // 6. CASE-2026-006: Ahmedabad (AePS Bypass)
  "CASE-2026-006": {
    nodes: [
      { id: "NODE-V1", label: "Rural Land Registry Holders", sublabel: "196 Cloned Fingerprints", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 70, y: 180 },
      { id: "NODE-M1", label: "Micro-ATM CSP Agent (BoB)", sublabel: "Jignesh Patel", type: "MULE_TIER_1", balance: 290000, risk_score: 89, status: "ACTIVE", x: 280, y: 180 },
      { id: "NODE-AG", label: "Surat Diamond Cash Point", sublabel: "Manek Chowk Bullion", type: "AGGREGATOR", balance: 1670000, risk_score: 96, status: "ACTIVE", x: 500, y: 180 },
      { id: "NODE-HW", label: "Ahmedabad Angadia Courier", sublabel: "Token: #AHM-MNK-5520", type: "HAWALA_DROP", balance: 1960000, risk_score: 97, status: "ACTIVE", x: 730, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 1960000, channel: "AePS Debits", timestamp: "10:45 AM", is_suspicious: true, hop_label: "Hop 1: Biometric Drain" },
      { id: "L2", source: "NODE-M1", target: "NODE-AG", amount_inr: 1670000, channel: "Cash Sweep", timestamp: "11:15 AM", is_suspicious: true, hop_label: "Hop 2: Aggregation" },
      { id: "L3", source: "NODE-AG", target: "NODE-HW", amount_inr: 1960000, channel: "Angadia Note", timestamp: "11:45 AM", is_suspicious: true, hop_label: "Hop 3: Physical Laundering" },
    ],
  },

  // 7. CASE-2026-007: Bengaluru (Operation Netra - AI Deepfake)
  "CASE-2026-007": {
    nodes: [
      { id: "NODE-V1", label: "Corporate Exec Targets", sublabel: "High-Profile Blackmail", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 60, y: 180 },
      { id: "NODE-M1", label: "Mule Tier 1 (Kotak Koramangala)", sublabel: "Kavita Nair", type: "MULE_TIER_1", balance: 510000, risk_score: 93, status: "ACTIVE", x: 260, y: 180 },
      { id: "NODE-AG", label: "Deepfake Compute Escrow", sublabel: "GPU Farm Billing Node", type: "AGGREGATOR", balance: 1120000, risk_score: 95, status: "ACTIVE", x: 480, y: 180 },
      { id: "NODE-CR", label: "Tornado.cash Mixer", sublabel: "Contract: 0x71C8821...", type: "CRYPTO_GATEWAY", balance: 2550000, risk_score: 99, status: "ACTIVE", x: 700, y: 120 },
      { id: "NODE-OFF", label: "Unhosted Cold Vault", sublabel: "Address: 0x3A91102...", type: "OFFSHORE", balance: 2550000, risk_score: 99, status: "ACTIVE", x: 700, y: 250 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 2550000, channel: "RTGS", timestamp: "02:00 PM", is_suspicious: true, hop_label: "Hop 1: Extortion Transfer" },
      { id: "L2", source: "NODE-M1", target: "NODE-AG", amount_inr: 2040000, channel: "IMPS", timestamp: "02:10 PM", is_suspicious: true, hop_label: "Hop 2: Cloud Invoicing" },
      { id: "L3", source: "NODE-AG", target: "NODE-CR", amount_inr: 2550000, channel: "8.5 ETH", timestamp: "02:15 PM", is_suspicious: true, hop_label: "Hop 3: Tornado Mixer" },
      { id: "L4", source: "NODE-CR", target: "NODE-OFF", amount_inr: 2550000, channel: "Relayer TX", timestamp: "02:40 PM", is_suspicious: true, hop_label: "Hop 4: Integration" },
    ],
  },

  // 8. CASE-2026-008: Pune (Instant Loan App)
  "CASE-2026-008": {
    nodes: [
      { id: "NODE-V1", label: "Coerced Loan App Victims", sublabel: "500+ Borrowers", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 70, y: 180 },
      { id: "NODE-M1", label: "Shell Fintech Escrow (Kotak)", sublabel: "Chirag Mehta", type: "AGGREGATOR", balance: 1840000, risk_score: 97, status: "ACTIVE", x: 280, y: 180 },
      { id: "NODE-CR", label: "TRC-20 USDT Off-Ramp", sublabel: "38,000 USDT", type: "CRYPTO_GATEWAY", balance: 3150000, risk_score: 98, status: "ACTIVE", x: 500, y: 120 },
      { id: "NODE-HW", label: "Pune-Hyderabad Angadia", sublabel: "Token: #PUN-VM-1102", type: "HAWALA_DROP", balance: 3130000, risk_score: 95, status: "ACTIVE", x: 500, y: 250 },
      { id: "NODE-OFF", label: "Offshore Syndicate Core", sublabel: "Dubai Settlement", type: "OFFSHORE", balance: 6280000, risk_score: 99, status: "ACTIVE", x: 730, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 6280000, channel: "UPI Escrow", timestamp: "03:15 PM", is_suspicious: true, hop_label: "Hop 1: Extortion Inflow" },
      { id: "L2", source: "NODE-M1", target: "NODE-CR", amount_inr: 3150000, channel: "USDT TRC-20", timestamp: "03:45 PM", is_suspicious: true, hop_label: "Hop 2: Crypto Split" },
      { id: "L3", source: "NODE-M1", target: "NODE-HW", amount_inr: 3130000, channel: "Hawala Token", timestamp: "04:00 PM", is_suspicious: true, hop_label: "Hop 2: Cash Split" },
      { id: "L4", source: "NODE-CR", target: "NODE-OFF", amount_inr: 3150000, channel: "Cold Wallet", timestamp: "04:30 PM", is_suspicious: true, hop_label: "Hop 3: Integration" },
      { id: "L5", source: "NODE-HW", target: "NODE-OFF", amount_inr: 3130000, channel: "Cross-Border", timestamp: "05:00 PM", is_suspicious: true, hop_label: "Hop 3: Integration" },
    ],
  },

  // 9. CASE-2026-009: Chennai (Power Grid SCADA Ransomware)
  "CASE-2026-009": {
    nodes: [
      { id: "NODE-V1", label: "Southern Grid Relays", sublabel: "400kV Substation Relays", type: "VICTIM", balance: 0, risk_score: 10, status: "ACTIVE", x: 60, y: 180 },
      { id: "NODE-M1", label: "Canara Guindy Mules", sublabel: "Karthik Ramanathan", type: "MULE_TIER_1", balance: 2500000, risk_score: 99, status: "ACTIVE", x: 260, y: 180 },
      { id: "NODE-AG", label: "Decryption Escrow Desk", sublabel: "Critical Infra Ransom Pool", type: "AGGREGATOR", balance: 7500000, risk_score: 99, status: "ACTIVE", x: 480, y: 180 },
      { id: "NODE-CR", label: "Bitcoin Multisig Escrow", sublabel: "2.8 BTC Escrow (3J98t1...)", type: "CRYPTO_GATEWAY", balance: 10000000, risk_score: 99, status: "ACTIVE", x: 700, y: 180 },
      { id: "NODE-OFF", label: "Cold Storage Vault", sublabel: "Air-Gapped Vault 1A1zP1...", type: "OFFSHORE", balance: 10000000, risk_score: 99, status: "ACTIVE", x: 890, y: 180 },
    ],
    links: [
      { id: "L1", source: "NODE-V1", target: "NODE-M1", amount_inr: 10000000, channel: "Emergency Wire", timestamp: "08:30 AM", is_suspicious: true, hop_label: "Hop 1: Ransom Payment" },
      { id: "L2", source: "NODE-M1", target: "NODE-AG", amount_inr: 9850000, channel: "RTGS", timestamp: "08:45 AM", is_suspicious: true, hop_label: "Hop 2: Inter-Bank Sweep" },
      { id: "L3", source: "NODE-AG", target: "NODE-CR", amount_inr: 10000000, channel: "2.8 BTC", timestamp: "09:00 AM", is_suspicious: true, hop_label: "Hop 3: BTC Settlement" },
      { id: "L4", source: "NODE-CR", target: "NODE-OFF", amount_inr: 10000000, channel: "Air-Gapped TX", timestamp: "09:30 AM", is_suspicious: true, hop_label: "Hop 4: Cold Integration" },
    ],
  },
};

const DEFAULT_CRYPTO_TRAILS: CryptoTrail[] = [
  // Kolkata (CASE-2026-004)
  {
    id: "CRY-004-01",
    case_id: "CASE-2026-004",
    source_address: "TCp88192a8bc9910293847102938471928",
    target_address: "TX9921038471029384710293847102938",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 23500,
    amount_inr_equivalent: 1950000,
    tx_hash: "0x8819283749102938471029384710293847102938471029384710293847102938",
    timestamp: "2026-09-09T09:50:00Z",
    service_tag: "Burrabazar OTC Crypto Liquidity Node",
    exchange_name: "Binance OTC P2P",
    risk_category: "OTC_BROKER",
    freeze_request_sent: true,
  },

  // Delhi (CASE-2026-001)
  {
    id: "CRY-001-01",
    case_id: "CASE-2026-001",
    source_address: "TD44192039485710293847592019384758",
    target_address: "TK11203948571029384759201938475819",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 14500,
    amount_inr_equivalent: 1203500,
    tx_hash: "0x1122334455667788990011223344556677889900112233445566778899001122",
    timestamp: "2026-09-09T10:30:00Z",
    service_tag: "Chandni Chowk Bullion USDT Conversion",
    exchange_name: "Bybit P2P",
    risk_category: "OTC_BROKER",
    freeze_request_sent: false,
  },

  // Mumbai (CASE-2026-002)
  {
    id: "CRY-002-01",
    case_id: "CASE-2026-002",
    source_address: "888tNkZrPN6JsEhnkjTu24ddN992019283",
    target_address: "83192039485710293847592019384758",
    blockchain: "MONERO",
    asset: "XMR",
    amount: 220,
    amount_inr_equivalent: 3500000,
    tx_hash: "0x3344556677889900112233445566778899001122334455667788990011223344",
    timestamp: "2026-09-09T08:50:00Z",
    service_tag: "Wasabi CoinJoin Mixer Ring",
    risk_category: "MIXER_TORNADO",
    freeze_request_sent: true,
  },

  // Bengaluru (CASE-2026-003)
  {
    id: "CRY-003-01",
    case_id: "CASE-2026-003",
    source_address: "TN11203948571029384759201938475819",
    target_address: "TT99102938471029384710293847102938",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 8500,
    amount_inr_equivalent: 705500,
    tx_hash: "0x5566778899001122334455667788990011223344556677889900112233445566",
    timestamp: "2026-09-09T09:40:00Z",
    service_tag: "SIM Gateway Bulk USDT Cash-out",
    exchange_name: "KuCoin P2P",
    risk_category: "OTC_BROKER",
    freeze_request_sent: false,
  },

  // Mumbai (CASE-2026-005)
  {
    id: "CRY-005-01",
    case_id: "CASE-2026-005",
    source_address: "TY99018273645192837461928374619283",
    target_address: "TX55192837461928374619283746192837",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 42000,
    amount_inr_equivalent: 3500000,
    tx_hash: "0x4455667788990011223344556677889900112233445566778899001122334455",
    timestamp: "2026-09-09T02:30:00Z",
    service_tag: "Dubai OTC Luxury Asset Liquidation Desk",
    exchange_name: "Huobi OTC Desk",
    risk_category: "OTC_BROKER",
    freeze_request_sent: true,
  },

  // Ahmedabad (CASE-2026-006)
  {
    id: "CRY-006-01",
    case_id: "CASE-2026-006",
    source_address: "TG88192039485710293847592019384758",
    target_address: "TW11203948571029384759201938475819",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 19600,
    amount_inr_equivalent: 1626800,
    tx_hash: "0x6677889900112233445566778899001122334455667788990011223344556677",
    timestamp: "2026-09-09T11:30:00Z",
    service_tag: "Surat CSP Cash-to-USDT Conversion Node",
    exchange_name: "Binance P2P",
    risk_category: "OTC_BROKER",
    freeze_request_sent: false,
  },

  // Bengaluru (CASE-2026-007)
  {
    id: "CRY-007-01",
    case_id: "CASE-2026-007",
    source_address: "0x71C8821A4B0019283746192837461928",
    target_address: "0x3A91102B991029384710293847102938",
    blockchain: "ETHEREUM (ERC-20)",
    asset: "ETH",
    amount: 8.5,
    amount_inr_equivalent: 2550000,
    tx_hash: "0x7719283749102938471029384710293847102938471029384710293847102938",
    timestamp: "2026-09-09T02:15:00Z",
    service_tag: "Tornado.cash Mixer Contract",
    risk_category: "MIXER_TORNADO",
    freeze_request_sent: true,
  },

  // Pune (CASE-2026-008)
  {
    id: "CRY-008-01",
    case_id: "CASE-2026-008",
    source_address: "TP11203948571029384759201938475819",
    target_address: "TC44192039485710293847592019384758",
    blockchain: "TRON (TRC-20)",
    asset: "USDT",
    amount: 38000,
    amount_inr_equivalent: 3150000,
    tx_hash: "0x9900112233445566778899001122334455667788990011223344556677889900",
    timestamp: "2026-09-09T03:45:00Z",
    service_tag: "Instant Loan Repayment Pool Off-Ramp",
    exchange_name: "Binance OTC",
    risk_category: "OTC_BROKER",
    freeze_request_sent: true,
  },

  // Chennai (CASE-2026-009)
  {
    id: "CRY-009-01",
    case_id: "CASE-2026-009",
    source_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    target_address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    blockchain: "BITCOIN",
    asset: "BTC",
    amount: 2.8,
    amount_inr_equivalent: 10000000,
    tx_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: "2026-09-09T08:30:00Z",
    service_tag: "SCADA Ransomware Bulletproof Escrow",
    risk_category: "COLD_WALLET",
    freeze_request_sent: true,
  },
];

const DEFAULT_HAWALA_ENTRIES: HawalaEntry[] = [
  // Kolkata (CASE-2026-004)
  {
    id: "HW-004-01",
    case_id: "CASE-2026-004",
    token_number: "KOL-BUR-9921",
    note_serial_prefix: "7EC 882910 (INR 500 Note Half)",
    amount_inr: 1335000,
    sender_alias: "Debashis / Bobby",
    receiver_alias: "Dubai Angadia Settlement Desk",
    angadia_courier_name: "Prakash Angadia & Sons, Burrabazar",
    origin_city: "Kolkata",
    destination_city: "Mumbai / Dubai",
    status: "SETTLED",
    timestamp: "2026-09-09T10:15:00Z",
    forensic_note: "Physical currency token snapshot matched with encrypted WhatsApp file found on suspect phone.",
  },

  // Delhi (CASE-2026-001)
  {
    id: "HW-001-01",
    case_id: "CASE-2026-001",
    token_number: "DEL-CC-4410",
    note_serial_prefix: "2AB 991823 (INR 200 Note Half)",
    amount_inr: 2760000,
    sender_alias: "Aman / Vicky Bhai",
    receiver_alias: "Surat Textile Diamond Courier",
    angadia_courier_name: "Mahadev Angadia Services, Chandni Chowk",
    origin_city: "New Delhi",
    destination_city: "Surat / Ahmedabad",
    status: "SETTLED",
    timestamp: "2026-09-09T11:00:00Z",
    forensic_note: "Cash laundering channel for phishing proceeds to purchase gold bullion.",
  },

  // Mumbai (CASE-2026-002)
  {
    id: "HW-002-01",
    case_id: "CASE-2026-002",
    token_number: "MUM-ZVR-8801",
    note_serial_prefix: "9KK 441029 (INR 500 Note Half)",
    amount_inr: 1720000,
    sender_alias: "DarkNode / Operator",
    receiver_alias: "Zaveri Bazaar Gold Settlement",
    angadia_courier_name: "Shreeji Angadia Services, Zaveri Bazaar",
    origin_city: "Mumbai",
    destination_city: "Surat / Dubai",
    status: "SETTLED",
    timestamp: "2026-09-09T08:45:00Z",
    forensic_note: "Infrastructure ransom conversion to physical precious metals.",
  },

  // Bengaluru (CASE-2026-003)
  {
    id: "HW-003-01",
    case_id: "CASE-2026-003",
    token_number: "BLR-CHK-3310",
    note_serial_prefix: "3TY 889102 (INR 500 Note Half)",
    amount_inr: 1620000,
    sender_alias: "Sunil / Sunny",
    receiver_alias: "Chickpet Electronics Merchant",
    angadia_courier_name: "Bangalore Angadia Network, Chickpet",
    origin_city: "Bengaluru",
    destination_city: "Chennai",
    status: "SETTLED",
    timestamp: "2026-09-09T10:00:00Z",
    forensic_note: "Counterfeit SIM farm merchant cash collection handover token.",
  },

  // Mumbai (CASE-2026-005)
  {
    id: "HW-005-01",
    case_id: "CASE-2026-005",
    token_number: "JAI-MI-8812",
    note_serial_prefix: "9DF 110294 (INR 500 Note Half)",
    amount_inr: 1650000,
    sender_alias: "Kunwar Pratap / Rana Saheb",
    receiver_alias: "Mumbai Gateway Angadia",
    angadia_courier_name: "Ratanlal Angadia Services, Jaipur",
    origin_city: "Jaipur",
    destination_city: "Mumbai",
    status: "SETTLED",
    timestamp: "2026-09-09T03:00:00Z",
    forensic_note: "Digital arrest extorted cash routed across inter-state Angadia conduit.",
  },

  // Ahmedabad (CASE-2026-006)
  {
    id: "HW-006-01",
    case_id: "CASE-2026-006",
    token_number: "AHM-MNK-5520",
    note_serial_prefix: "4KL 771928 (INR 500 Note Half)",
    amount_inr: 1960000,
    sender_alias: "Jignesh / Silicon Master",
    receiver_alias: "Surat CSP Cash Collector",
    angadia_courier_name: "Manek Chowk Angadia Bullion Exchange",
    origin_city: "Ahmedabad",
    destination_city: "Surat",
    status: "SETTLED",
    timestamp: "2026-09-09T11:45:00Z",
    forensic_note: "AePS biometric cash drain physical handover token.",
  },

  // Bengaluru (CASE-2026-007)
  {
    id: "HW-007-01",
    case_id: "CASE-2026-007",
    token_number: "BLR-MG-7701",
    note_serial_prefix: "1LM 992014 (INR 500 Note Half)",
    amount_inr: 2040000,
    sender_alias: "Kavita / Aria",
    receiver_alias: "Offshore Cloud GPU Facilitator",
    angadia_courier_name: "Karnataka Commercial Angadia, MG Road",
    origin_city: "Bengaluru",
    destination_city: "Hyderabad / Mumbai",
    status: "SETTLED",
    timestamp: "2026-09-09T02:20:00Z",
    forensic_note: "Deepfake extortion pool cash clearing to private GPU compute supplier.",
  },

  // Pune (CASE-2026-008)
  {
    id: "HW-008-01",
    case_id: "CASE-2026-008",
    token_number: "PUN-VM-1102",
    note_serial_prefix: "5GH 331902 (INR 500 Note Half)",
    amount_inr: 3130000,
    sender_alias: "Chirag / Charlie",
    receiver_alias: "Hyderabad Loan Recovery Desk",
    angadia_courier_name: "Gujarat Angadia & Courier, Pune",
    origin_city: "Pune",
    destination_city: "Hyderabad",
    status: "SETTLED",
    timestamp: "2026-09-09T04:00:00Z",
    forensic_note: "Loan app harassment collection cash funneled to offshore hawala book.",
  },

  // Chennai (CASE-2026-009)
  {
    id: "HW-009-01",
    case_id: "CASE-2026-009",
    token_number: "CHE-PAR-4490",
    note_serial_prefix: "6QQ 110928 (INR 500 Note Half)",
    amount_inr: 7500000,
    sender_alias: "Karthik / GhostByte",
    receiver_alias: "Colombo Transit Desk",
    angadia_courier_name: "Parrys Corner Hawala Network, Chennai",
    origin_city: "Chennai",
    destination_city: "Colombo / Singapore",
    status: "SETTLED",
    timestamp: "2026-09-09T08:50:00Z",
    forensic_note: "Cross-border SCADA attack cash physical settlement.",
  },
];

let inMemoryAccounts = [...DEFAULT_ACCOUNTS];
let inMemoryTransactions = [...DEFAULT_TRANSACTIONS];
let inMemoryCrypto = [...DEFAULT_CRYPTO_TRAILS];
let inMemoryHawala = [...DEFAULT_HAWALA_ENTRIES];

// ─────────────────────────────────────────────────────────────────────────────
// Financial Intel Service Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class FinancialIntelService {
  async getSummary(case_id?: string) {
    const accs = await this.getAccounts(case_id);
    const txns = await this.getTransactions(case_id);
    const crypto = await this.getCryptoTrails(case_id);

    const totalVolume = txns.reduce((sum, t) => sum + (t.amount_inr || 0), 0);
    const frozenAmount = accs
      .filter((a) => a.status === "FROZEN")
      .reduce((sum, a) => sum + (a.current_balance_inr || 0), 0);
    const recoveryRate = totalVolume > 0 ? Math.min(Math.round((frozenAmount / totalVolume) * 100), 100) : 0;
    const suspiciousCount = txns.filter((t) => t.suspicious_score >= 80).length;
    const highRiskAccounts = accs.filter((a) => a.risk_level === "CRITICAL" || a.risk_level === "HIGH").length;

    return {
      total_transactions: txns.length,
      total_volume_inr: totalVolume || 4130000,
      frozen_amount_inr: frozenAmount,
      recovery_rate_percent: recoveryRate,
      suspicious_transactions: suspiciousCount || txns.length,
      high_risk_accounts: highRiskAccounts || accs.length,
      crypto_volume_inr: crypto.reduce((sum, c) => sum + (c.amount_inr_equivalent || 0), 0),
      last_updated: new Date().toISOString(),
    };
  }

  async getAccounts(case_id?: string) {
    if (case_id && case_id !== "*") {
      const filtered = inMemoryAccounts.filter((a) => a.case_id === case_id);
      if (filtered.length > 0) return filtered;
    }
    return inMemoryAccounts;
  }

  async getTransactions(case_id?: string, limit = 100) {
    if (case_id && case_id !== "*") {
      const filtered = inMemoryTransactions.filter((t) => t.case_id === case_id);
      if (filtered.length > 0) return filtered.slice(0, limit);
    }
    return inMemoryTransactions.slice(0, limit);
  }

  async getFlowNetwork(case_id?: string) {
    if (case_id && DEFAULT_FLOW_NETWORKS[case_id]) {
      return DEFAULT_FLOW_NETWORKS[case_id];
    }
    return DEFAULT_FLOW_NETWORKS["CASE-2026-004"];
  }

  async getCryptoTrails(case_id?: string) {
    if (case_id && case_id !== "*") {
      const filtered = inMemoryCrypto.filter((c) => c.case_id === case_id);
      if (filtered.length > 0) return filtered;
    }
    return inMemoryCrypto;
  }

  async getHawalaLedger(case_id?: string) {
    if (case_id && case_id !== "*") {
      const filtered = inMemoryHawala.filter((h) => h.case_id === case_id);
      if (filtered.length > 0) return filtered;
    }
    return inMemoryHawala;
  }

  async freezeAccount(account_id: string, reason: string, officer_name = "Superintendent Ananya Sengupta") {
    const target = inMemoryAccounts.find((a) => a.id === account_id || a.account_number === account_id);
    if (!target) {
      throw new Error(`Bank account with ID or Number ${account_id} not found.`);
    }

    const orderRef = `BNSS-106-FREEZE-${Date.now().toString().slice(-6)}`;
    target.status = "FROZEN";
    target.freeze_order_ref = orderRef;
    target.frozen_at = new Date().toISOString();

    return {
      success: true,
      account_id: target.id,
      account_number: target.account_number,
      holder_name: target.holder_name,
      bank_name: target.bank_name,
      amount_frozen_inr: target.current_balance_inr,
      freeze_order_ref: orderRef,
      statutory_provision: "Section 106 Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 / Section 5 PMLA 2002",
      freezing_officer: officer_name,
      timestamp: target.frozen_at,
      status: "DEBIT_FREEZE_ACTIVE",
    };
  }
}

export const financialIntelService = new FinancialIntelService();

// ─────────────────────────────────────────────────────────────────────────────
// Financial Intel Controller & Router
// ─────────────────────────────────────────────────────────────────────────────

export class FinancialIntelController {
  async handleGetSummary(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const summary = await financialIntelService.getSummary(case_id as string);
      res.json(formatResponse(true, summary, "Financial intelligence summary retrieved successfully"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetAccounts(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const accounts = await financialIntelService.getAccounts(case_id as string);
      res.json(formatResponse(true, accounts, "Mule and syndicate bank accounts retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetTransactions(req: Request, res: Response) {
    try {
      const { case_id, limit } = req.query;
      const txns = await financialIntelService.getTransactions(case_id as string, limit ? Number(limit) : 100);
      res.json(formatResponse(true, txns, "Financial transaction ledger retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetFlowNetwork(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const flow = await financialIntelService.getFlowNetwork(case_id as string);
      res.json(formatResponse(true, flow, "Money laundering network graph nodes and links retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetCryptoTrails(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const crypto = await financialIntelService.getCryptoTrails(case_id as string);
      res.json(formatResponse(true, crypto, "Blockchain and crypto OTC trails retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleGetHawalaLedger(req: Request, res: Response) {
    try {
      const { case_id } = req.query;
      const hawala = await financialIntelService.getHawalaLedger(case_id as string);
      res.json(formatResponse(true, hawala, "Hawala and Angadia settlement ledger retrieved"));
    } catch (err: any) {
      res.status(500).json(formatResponse(false, null, undefined, err.message));
    }
  }

  async handleFreezeAccount(req: Request, res: Response) {
    try {
      const { account_id, reason, officer_name } = req.body;
      if (!account_id) {
        return res.status(400).json(formatResponse(false, null, undefined, "account_id is required."));
      }
      const freezeResult = await financialIntelService.freezeAccount(
        account_id,
        reason || "Section 106 BNSS 2023 Immediate Debit Freeze Order",
        officer_name
      );
      res.json(formatResponse(true, freezeResult, "Bank account freeze order executed and registered successfully"));
    } catch (err: any) {
      res.status(400).json(formatResponse(false, null, undefined, err.message));
    }
  }
}

export const financialIntelController = new FinancialIntelController();

export function financialRoutes(): Router {
  const router = Router();
  router.get("/summary", (req, res) => financialIntelController.handleGetSummary(req, res));
  router.get("/accounts", (req, res) => financialIntelController.handleGetAccounts(req, res));
  router.get("/transactions", (req, res) => financialIntelController.handleGetTransactions(req, res));
  router.get("/flow-network", (req, res) => financialIntelController.handleGetFlowNetwork(req, res));
  router.get("/crypto-trails", (req, res) => financialIntelController.handleGetCryptoTrails(req, res));
  router.get("/hawala-ledger", (req, res) => financialIntelController.handleGetHawalaLedger(req, res));
  router.post("/freeze-account", (req, res) => financialIntelController.handleFreezeAccount(req, res));

  // Legacy fallback routes
  router.get("/", (req, res) => financialIntelController.handleGetTransactions(req, res));
  router.get("/flagged", (req, res) => financialIntelController.handleGetTransactions(req, res));
  return router;
}
