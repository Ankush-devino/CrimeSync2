import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Radio, Building2, UserX, FileText, 
  RotateCcw, Play, CheckCircle2, Lock, X, AlertTriangle
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';

export type NodeType = 'suspect' | 'account' | 'phone' | 'vehicle' | 'location';
export type NodeStatus = 'active' | 'contained';

export interface CrimeNode {
  id: string;
  name: string;
  role: string;
  type: NodeType;
  status: NodeStatus;
  riskScore: number;
  hop: number;
  details: {
    identifier?: string;
    location?: string;
    exposureValue?: string;
    notes?: string;
  };
}

export interface CrimeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
}

// ─── Dynamic Syndicate Datasets Mapping Global Cases & FIRs ──────────────────
export const SYNDICATE_DATASETS: Record<string, { label: string; syndicateName?: string; nodes: CrimeNode[]; edges: CrimeEdge[] }> = {
  'FIR_MUM_1842': {
    label: "Vikramaditya Shinde — D-Company Hawala Cartel",
    syndicateName: "D-Company Coastal & Hawala Cartel",
    nodes: [
      { id: 'n0', name: 'Vikramaditya Shinde', role: 'Syndicate Kingpin', type: 'suspect', status: 'active', riskScore: 98, hop: 0, details: { identifier: 'FIR/DEL/2026/1428', location: 'Mumbai HQ', exposureValue: '₹32.4 Cr ($3.9M)' } },
      { id: 'n1', name: 'Farooq Merchant', role: 'Hawala Courier', type: 'suspect', status: 'active', riskScore: 91, hop: 1, details: { identifier: 'LOC Issued', location: 'Zaveri Bazaar', exposureValue: '₹14.2 Cr' } },
      { id: 'n2', name: 'Burner SIM', role: 'Comms', type: 'phone', status: 'active', riskScore: 84, hop: 1, details: { identifier: '+91-98201-XXXXX', location: 'Cell Tower Sector 4', exposureValue: 'N/A' } },
      { id: 'n3', name: 'Apex Logistics', role: 'Shell Co', type: 'account', status: 'active', riskScore: 88, hop: 2, details: { identifier: 'A/C 921020038192', location: 'Nhava Sheva Port', exposureValue: '₹8.9 Cr' } },
      { id: 'n4', name: 'Al-Rayyan Escrow', role: 'Offshore', type: 'account', status: 'active', riskScore: 95, hop: 3, details: { identifier: 'IBAN: AE028192001', location: 'Dubai International', exposureValue: '₹12.0 Cr' } }
    ],
    edges: [
      { id: 'e1', source: 'n0', target: 'n1', label: 'Hawala Pipeline', weight: 3 },
      { id: 'e2', source: 'n0', target: 'n2', label: 'CDR Link', weight: 2 },
      { id: 'e3', source: 'n1', target: 'n3', label: 'Invoice Fraud', weight: 2 },
      { id: 'e4', source: 'n3', target: 'n4', label: 'Swift Wire', weight: 3 }
    ]
  },
  'CASE-2026-001': {
    label: "Vikramaditya Shinde — D-Company Hawala Cartel",
    syndicateName: "D-Company Coastal & Hawala Cartel",
    nodes: [
      { id: 'n0', name: 'Vikramaditya Shinde', role: 'Syndicate Kingpin', type: 'suspect', status: 'active', riskScore: 98, hop: 0, details: { identifier: 'FIR/DEL/2026/0891', location: 'Mumbai HQ', exposureValue: '₹32.4 Cr ($3.9M)' } },
      { id: 'n1', name: 'Farooq Merchant', role: 'Hawala Chief Operator', type: 'suspect', status: 'active', riskScore: 91, hop: 1, details: { identifier: 'LOC Issued (ED)', location: 'Zaveri Bazaar', exposureValue: '₹14.2 Cr' } },
      { id: 'n2', name: 'Burner SIM (VoIP Proxy)', role: 'Encrypted Comms Line', type: 'phone', status: 'active', riskScore: 84, hop: 1, details: { identifier: '+91-98201-XXXXX', location: 'Cell Tower Sector 4', exposureValue: 'N/A' } },
      { id: 'n3', name: 'Priya Sharma', role: 'Document Forger & Benami', type: 'suspect', status: 'active', riskScore: 78, hop: 1, details: { identifier: 'Passport Seizure Pending', location: 'Thane', exposureValue: '₹4.5 Cr' } },
      { id: 'n4', name: 'Apex Logistics Vault', role: 'Shell Import/Export Co.', type: 'account', status: 'active', riskScore: 88, hop: 2, details: { identifier: 'A/C 921020038192', location: 'Nhava Sheva Port', exposureValue: '₹8.9 Cr' } },
      { id: 'n5', name: 'Axis Mule Gateway', role: 'Crypto Liquidity Layer', type: 'account', status: 'active', riskScore: 82, hop: 2, details: { identifier: 'A/C 108920194012', location: 'Bandra West Branch', exposureValue: '₹3.1 Cr' } },
      { id: 'n6', name: 'Cold-Storage Safehouse', role: 'Contraband Cache', type: 'location', status: 'active', riskScore: 74, hop: 2, details: { identifier: 'GPS: 18.9401, 72.8347', location: 'Wadala Terminus', exposureValue: '₹1.7 Cr' } },
      { id: 'n7', name: 'Al-Rayyan Escrow LLC', role: 'Offshore Remittance Node', type: 'account', status: 'active', riskScore: 95, hop: 3, details: { identifier: 'IBAN: AE028192001', location: 'Dubai International', exposureValue: '₹12.0 Cr' } },
      { id: 'n8', name: 'Benami Real Estate Asset', role: 'High-Value Land Parcel', type: 'location', status: 'active', riskScore: 69, hop: 3, details: { identifier: 'Registry #4810/2025', location: 'Alibaug Coast', exposureValue: '₹7.5 Cr' } }
    ],
    edges: [
      { id: 'e1', source: 'n0', target: 'n1', label: 'Hawala Pipeline (₹14.2 Cr)', weight: 3 },
      { id: 'e2', source: 'n0', target: 'n2', label: '142 Calls (CDR Link)', weight: 2 },
      { id: 'e3', source: 'n0', target: 'n3', label: 'Co-Accused FIR Sec 420', weight: 1 },
      { id: 'e4', source: 'n1', target: 'n4', label: 'Invoice Fraud Routing', weight: 2 },
      { id: 'e5', source: 'n1', target: 'n5', label: 'Layering Transfers', weight: 2 },
      { id: 'e6', source: 'n2', target: 'n6', label: 'Dispatch Telemetry', weight: 1 },
      { id: 'e7', source: 'n4', target: 'n7', label: 'Swift Wire (Offshore)', weight: 3 },
      { id: 'e8', source: 'n5', target: 'n8', label: 'Asset Liquidation', weight: 1 }
    ]
  },
  'CASE-2026-002': {
    label: "Meera Krishnan — GridShield SCADA Cyber Attack",
    syndicateName: "GridShield APT SCADA Infiltration Cell",
    nodes: [
      { id: 'm0', name: 'Meera Krishnan', role: 'Malware Developer & C2 Handler', type: 'suspect', status: 'active', riskScore: 96, hop: 0, details: { identifier: 'FIR/MUM/2026/1044', location: 'Navi Mumbai Hub', exposureValue: 'SCADA Critical Infra' } },
      { id: 'm1', name: 'Cobalt Strike C2 Beacon', role: 'Egress Command Gateway', type: 'location', status: 'active', riskScore: 92, hop: 1, details: { identifier: 'IP: 185.220.101.44', location: 'Bucharest VPS', exposureValue: 'Heartbeat: 30s' } },
      { id: 'm2', name: 'Spoofed VPN Gateway', role: 'Credential Access Vector', type: 'phone', status: 'active', riskScore: 85, hop: 1, details: { identifier: 'IPSec: 10.240.12.1', location: 'Power Grid DMZ', exposureValue: 'Privilege: Domain Admin' } },
      { id: 'm3', name: 'Substation RTU Unit #4', role: 'SCADA Relay Controller', type: 'account', status: 'active', riskScore: 89, hop: 2, details: { identifier: 'Modbus Unit ID 0x0A', location: 'Kalwa Grid Substation', exposureValue: '400kV Feeder Bus' } },
      { id: 'm4', name: 'Staging Jump Box', role: 'Lateral Movement Node', type: 'location', status: 'active', riskScore: 81, hop: 2, details: { identifier: 'Host: WS-SUB-09', location: 'Trombay Ops Room', exposureValue: 'SSH Port 22 Forward' } },
      { id: 'm5', name: 'Exfiltration Proxy (Tor)', role: 'Firmware Exfil Canal', type: 'account', status: 'active', riskScore: 94, hop: 3, details: { identifier: '.onion: pwrgrid7...hidden', location: 'Dark Web Egress', exposureValue: '4.8 GB Telemetry' } }
    ],
    edges: [
      { id: 'me1', source: 'm0', target: 'm1', label: 'C2 Command Push', weight: 3 },
      { id: 'me2', source: 'm0', target: 'm2', label: 'VPN Token Inject', weight: 2 },
      { id: 'me3', source: 'm1', target: 'm3', label: 'Modbus Command Injection', weight: 3 },
      { id: 'me4', source: 'm2', target: 'm4', label: 'RDP Lateral Pivot', weight: 2 },
      { id: 'me5', source: 'm4', target: 'm5', label: 'SCADA Config Exfiltration', weight: 3 }
    ]
  },
  'CASE-2026-003': {
    label: "Sunil Yadav — Operation Garud SIM & OTP Ring",
    syndicateName: "Operation Garud — Fake Aadhaar & SIM Farm Ring",
    nodes: [
      { id: 'g0', name: 'Sunil Yadav', role: 'SIM Farm Operator', type: 'suspect', status: 'active', riskScore: 91, hop: 0, details: { identifier: 'FIR/BLR/2026/0332', location: 'Bengaluru Peenya', exposureValue: '12,000 Forged SIMs' } },
      { id: 'g1', name: 'VoIP GSM Modem Farm', role: '64-Channel Auto Dialler', type: 'phone', status: 'active', riskScore: 88, hop: 1, details: { identifier: 'IMEI Pool: 86490102...', location: 'Peenya Industrial Area', exposureValue: '4,500 OTPs Intercepted' } },
      { id: 'g2', name: 'Aadhaar Forgery Kiosk', role: 'Biometric Fabrication Lab', type: 'location', status: 'active', riskScore: 84, hop: 1, details: { identifier: 'CSC Center ID 90129', location: 'Koramangala 4th Block', exposureValue: '850 Fake Aadhaar PDFs' } },
      { id: 'g3', name: 'OTP Resale Telegram Bot', role: 'Darknet OTP-as-a-Service', type: 'account', status: 'active', riskScore: 93, hop: 2, details: { identifier: '@IndFastOTP_Bot', location: 'Telegram Cloud', exposureValue: '₹18 Lakhs Revenue' } },
      { id: 'g4', name: 'Cryptocurrency Mixer Wallet', role: 'Monero OTC Cashout', type: 'account', status: 'active', riskScore: 96, hop: 3, details: { identifier: 'XMR: 888tNk19...01', location: 'Tornado Cash Proxy', exposureValue: '₹14.2 Lakhs' } }
    ],
    edges: [
      { id: 'ge1', source: 'g0', target: 'g1', label: 'GSM Modem Rack Admin', weight: 3 },
      { id: 'ge2', source: 'g0', target: 'g2', label: 'KYC Document Supply', weight: 2 },
      { id: 'ge3', source: 'g1', target: 'g3', label: 'Live OTP Packet Relay', weight: 3 },
      { id: 'ge4', source: 'g3', target: 'g4', label: 'Dark Web Subscription Flow', weight: 3 }
    ]
  },
  'CASE-2026-004': {
    label: "Anirban Mukherjee — Operation Chakra Tech Scam",
    syndicateName: "Operation Chakra — Illicit VOIP Call Center Cartel",
    nodes: [
      { id: 'k0', name: 'Anirban Mukherjee', role: 'Call Center Kingpin', type: 'suspect', status: 'active', riskScore: 94, hop: 0, details: { identifier: 'FIR/KOL/2026/0412', location: 'Salt Lake Sector V, Kolkata', exposureValue: '₹4.13 Cr ($500K)' } },
      { id: 'k1', name: 'Salt Lake Tech Hub', role: 'Scam Floor Operation', type: 'location', status: 'active', riskScore: 89, hop: 1, details: { identifier: 'Tower B, 4th Floor', location: 'Salt Lake, Kolkata', exposureValue: '60 Scam Agents' } },
      { id: 'k2', name: 'AnyDesk / TeamViewer C2', role: 'Remote Access RAT Vector', type: 'phone', status: 'active', riskScore: 86, hop: 1, details: { identifier: 'AnyDesk ID: 491-019-204', location: 'Cloud Proxy Singapore', exposureValue: 'Remote Screen Lock' } },
      { id: 'k3', name: 'Wire Mule Bank (Yes Bank)', role: 'Layer 1 Inflow Vault', type: 'account', status: 'active', riskScore: 83, hop: 2, details: { identifier: 'A/C 0019910281920', location: 'Yes Bank Camac Street', exposureValue: '₹1.8 Cr' } },
      { id: 'k4', name: 'Gift Card Clearing Desk', role: 'Target/Apple Card Siphon', type: 'account', status: 'active', riskScore: 91, hop: 2, details: { identifier: 'Paxful Vendor: KolGold', location: 'P2P Trading Hub', exposureValue: '₹1.2 Cr' } },
      { id: 'k5', name: 'USDT OTC Hawala Liquidation', role: 'Dubai Off-Ramp Gateway', type: 'account', status: 'active', riskScore: 97, hop: 3, details: { identifier: 'TRC20: TT891x...Km90', location: 'Deira, Dubai', exposureValue: '₹3.5 Cr' } }
    ],
    edges: [
      { id: 'ke1', source: 'k0', target: 'k1', label: 'Floor Management & Scripts', weight: 3 },
      { id: 'ke2', source: 'k0', target: 'k2', label: 'Remote Access RAT Push', weight: 2 },
      { id: 'ke3', source: 'k1', target: 'k3', label: 'Coerced Wire Transfers', weight: 3 },
      { id: 'ke4', source: 'k1', target: 'k4', label: 'Gift Card Code Harvest', weight: 2 },
      { id: 'ke5', source: 'k3', target: 'k5', label: 'Wire to Crypto Buy', weight: 3 },
      { id: 'ke6', source: 'k4', target: 'k5', label: 'Gift Card to USDT OTC', weight: 3 }
    ]
  },
  'CASE-2026-005': {
    label: "Kunwar Pratap Singh — Operation Vajra Digital Arrest",
    syndicateName: "Operation Vajra — Fake CBI Virtual Arrest Cartel",
    nodes: [
      { id: 'v0', name: 'Kunwar Pratap Singh', role: 'Digital Arrest Ring Leader', type: 'suspect', status: 'active', riskScore: 97, hop: 0, details: { identifier: 'FIR/MUM/2026/1842', location: 'Jaipur Safehouse', exposureValue: '₹51.5 Lakhs Extorted' } },
      { id: 'v1', name: 'Skype Video Studio', role: 'Fake Police Station Setup', type: 'location', status: 'active', riskScore: 90, hop: 1, details: { identifier: 'Skype ID: cbi_investigation_hq', location: 'Noida Sector 62', exposureValue: 'Fake Uniforms & Seals' } },
      { id: 'v2', name: 'Spoofed Landline Line', role: 'VoIP Display Injector', type: 'phone', status: 'active', riskScore: 87, hop: 1, details: { identifier: '+91-11-23092011 (CBI HQ)', location: 'SIP Server Frankfurt', exposureValue: '180 Extortion Calls' } },
      { id: 'v3', name: 'Mule Account (PNB Jaipur)', role: 'Immediate Layering Drop', type: 'account', status: 'active', riskScore: 85, hop: 2, details: { identifier: 'A/C 0291001099238', location: 'PNB MI Road, Jaipur', exposureValue: '₹22.0 Lakhs' } },
      { id: 'v4', name: 'Mule Account (HDFC Surat)', role: 'RTGS Splitter Account', type: 'account', status: 'active', riskScore: 83, hop: 2, details: { identifier: 'A/C 50100291823901', location: 'HDFC Ring Road, Surat', exposureValue: '₹29.5 Lakhs' } },
      { id: 'v5', name: 'P2P Crypto Cash-out Desk', role: 'USDT Over-The-Counter Desk', type: 'account', status: 'active', riskScore: 98, hop: 3, details: { identifier: 'Binance UID: 8192001', location: 'Dubai Escrow', exposureValue: '61,000 USDT' } }
    ],
    edges: [
      { id: 've1', source: 'v0', target: 'v1', label: 'Studio Ops Management', weight: 3 },
      { id: 've2', source: 'v0', target: 'v2', label: 'VoIP Spoof Trigger', weight: 2 },
      { id: 've3', source: 'v1', target: 'v3', label: 'Coerced RTGS Transfer', weight: 3 },
      { id: 've4', source: 'v2', target: 'v4', label: 'Demanded Clearance Fee', weight: 2 },
      { id: 've5', source: 'v3', target: 'v5', label: 'Hawala-to-USDT Conversion', weight: 3 },
      { id: 've6', source: 'v4', target: 'v5', label: 'P2P Escrow Siphon', weight: 3 }
    ]
  },
  'CASE-2026-006': {
    label: "Jignesh Patel — Operation Durg Biometric & AePS Bypass",
    syndicateName: "Operation Durg — AePS Biometric Cloning Ring",
    nodes: [
      { id: 'd0', name: 'Jignesh Patel', role: 'Biometric Cloner & AePS Hacker', type: 'suspect', status: 'active', riskScore: 93, hop: 0, details: { identifier: 'FIR/AHM/2026/0593', location: 'Ahmedabad CID Watch', exposureValue: '₹19.6 Lakhs Siphoned' } },
      { id: 'd1', name: 'Registry Land Deed Scraper', role: 'Public Land Deed Scraping Bot', type: 'location', status: 'active', riskScore: 87, hop: 1, details: { identifier: 'IP: 103.21.144.12', location: 'Surat Server Lab', exposureValue: '3,200 High-Res Fingerprints' } },
      { id: 'd2', name: 'Silicone Molding Lab', role: 'Polymer Casting Station', type: 'location', status: 'active', riskScore: 89, hop: 1, details: { identifier: 'Unit 12, GIDC Odhav', location: 'Ahmedabad', exposureValue: '500+ Silicone Thumbs' } },
      { id: 'd3', name: 'Micro-ATM Pos Network', role: 'Roving BC Banking Points', type: 'account', status: 'active', riskScore: 84, hop: 2, details: { identifier: 'Terminal ID: MATM-9021', location: 'Rural Anand & Kheda', exposureValue: '₹8.4 Lakhs' } },
      { id: 'd4', name: 'Cash Mule Vault (Surat)', role: 'Cash Hoard Vault', type: 'account', status: 'active', riskScore: 92, hop: 3, details: { identifier: 'Lockbox #912', location: 'Surat Textile Market', exposureValue: '₹11.2 Lakhs Cash' } }
    ],
    edges: [
      { id: 'de1', source: 'd0', target: 'd1', label: 'Deed Scraper Command', weight: 3 },
      { id: 'de2', source: 'd0', target: 'd2', label: 'Fingerprint Casting Data', weight: 3 },
      { id: 'de3', source: 'd2', target: 'd3', label: 'Silicone Stamp Distribution', weight: 2 },
      { id: 'de4', source: 'd3', target: 'd4', label: 'Daily Micro-ATM Cash Sweep', weight: 3 }
    ]
  },
  'CASE-2026-007': {
    label: "Kavita Nair — Operation Netra AI Deepfake Video Extortion",
    syndicateName: "Operation Netra — AI Deepfake Blackmail Network",
    nodes: [
      { id: 'nt0', name: 'Kavita Nair', role: 'AI Deepfake Synthesizer', type: 'suspect', status: 'active', riskScore: 92, hop: 0, details: { identifier: 'FIR/BLR/2026/0778', location: 'Bengaluru Indiranagar', exposureValue: '₹25.5 Lakhs Extorted' } },
      { id: 'nt1', name: 'GPU Cluster (RunPod)', role: 'Generative Diffusion Server', type: 'location', status: 'active', riskScore: 90, hop: 1, details: { identifier: 'RTX 4090 Pod 0x489', location: 'US East RunPod', exposureValue: '20 Deepfake Models' } },
      { id: 'nt2', name: 'WhatsApp Web Automation', role: 'Bulk Blackmail Delivery', type: 'phone', status: 'active', riskScore: 85, hop: 1, details: { identifier: '+91-80-4920XXXX', location: 'Bengaluru Server', exposureValue: '45 High-Profile Targets' } },
      { id: 'nt3', name: 'Monero Stealth Escrow', role: 'Untraceable Crypto Drop', type: 'account', status: 'active', riskScore: 97, hop: 2, details: { identifier: 'XMR: 44AFF...998', location: 'Decentralized Monero Node', exposureValue: '18.4 XMR' } },
      { id: 'nt4', name: 'Benami Luxury Jewelry Token', role: 'Gold Bar Purchase Layer', type: 'account', status: 'active', riskScore: 88, hop: 3, details: { identifier: 'Bullion Inv #9102/2026', location: 'Commercial Street, BLR', exposureValue: '₹15 Lakhs Gold' } }
    ],
    edges: [
      { id: 'nte1', source: 'nt0', target: 'nt1', label: 'Face Swap Model Training', weight: 3 },
      { id: 'nte2', source: 'nt0', target: 'nt2', label: 'Extortion Video Dispatch', weight: 2 },
      { id: 'nte3', source: 'nt2', target: 'nt3', label: 'Monero Ransom Demands', weight: 3 },
      { id: 'nte4', source: 'nt3', target: 'nt4', label: 'P2P Gold Bar Purchase', weight: 2 }
    ]
  },
  'CASE-2026-008': {
    label: "Chirag Mehta — Operation Kuber Loan App & Hawala",
    syndicateName: "Operation Kuber — Predatory Loan App & Harassment Cartel",
    nodes: [
      { id: 'kb0', name: 'Chirag Mehta', role: 'Hawala Settlement Broker', type: 'suspect', status: 'active', riskScore: 95, hop: 0, details: { identifier: 'FIR/PUN/2026/1129', location: 'Pune Koregaon Park', exposureValue: '₹62.8 Lakhs' } },
      { id: 'kb1', name: 'Predatory APK Distribution', role: 'Malware Host Server', type: 'location', status: 'active', riskScore: 89, hop: 1, details: { identifier: 'Domain: fastkredit-apk.in', location: 'Singapore CloudFlare', exposureValue: '85,000 Infected Phones' } },
      { id: 'kb2', name: 'Harassment Call Center', role: 'Contact Scraping & Defamation Floor', type: 'phone', status: 'active', riskScore: 91, hop: 1, details: { identifier: 'VoIP Trunk: 020-6799XXXX', location: 'Hyderabad Madhapur', exposureValue: 'Morphing & Photo Leak Threat' } },
      { id: 'kb3', name: 'UPI Aggregator RazorMule', role: 'Virtual Account Siphon', type: 'account', status: 'active', riskScore: 88, hop: 2, details: { identifier: 'UPI: paykuber@kotak', location: 'Kotak Mahindra Pune', exposureValue: '₹38.5 Lakhs' } },
      { id: 'kb4', name: 'Cross-Border Hawala Settlement', role: 'Nepal-Dubai Trade Invoicing', type: 'account', status: 'active', riskScore: 96, hop: 3, details: { identifier: 'Hawala Token #KBR-889', location: 'Kathmandu Transit', exposureValue: '₹45 Lakhs Remitted' } }
    ],
    edges: [
      { id: 'kbe1', source: 'kb0', target: 'kb1', label: 'APK S3 Bucket Deployment', weight: 3 },
      { id: 'kbe2', source: 'kb0', target: 'kb2', label: 'Victim Contact Feed', weight: 3 },
      { id: 'kbe3', source: 'kb1', target: 'kb3', label: 'Automated Loan Repayments', weight: 2 },
      { id: 'kbe4', source: 'kb2', target: 'kb3', label: 'Extorted Penalty Deposits', weight: 2 },
      { id: 'kbe5', source: 'kb3', target: 'kb4', label: 'Hawala Remittance Wire', weight: 3 }
    ]
  },
  'CASE-2026-009': {
    label: "Karthik Ramanathan — Operation Rudra Power Grid SCADA",
    syndicateName: "Operation Rudra — Critical Energy Infrastructure APT",
    nodes: [
      { id: 'rd0', name: 'Karthik Ramanathan', role: 'APT Exploit Developer', type: 'suspect', status: 'active', riskScore: 99, hop: 0, details: { identifier: 'FIR/CHE/2026/0204', location: 'Chennai & Darknet', exposureValue: '₹1.00 Cr Bounty Pool' } },
      { id: 'rd1', name: 'Zero-Day VPN Exploit Injector', role: 'Fortinet SSL-VPN Exploit', type: 'location', status: 'active', riskScore: 94, hop: 1, details: { identifier: 'CVE-2024-21762', location: 'Southern Grid WAN Gate', exposureValue: 'Kernel Memory Dump' } },
      { id: 'rd2', name: 'Encrypted Relay Node', role: 'Command & Control Ghost Line', type: 'phone', status: 'active', riskScore: 88, hop: 1, details: { identifier: 'Signal Protocol Proxy', location: 'Stockholm Server', exposureValue: 'Military Grade C2' } },
      { id: 'rd3', name: 'SCADA Relay Controller #8', role: 'Frequency Modulator Terminal', type: 'account', status: 'active', riskScore: 96, hop: 2, details: { identifier: 'IEC 60870-5-104 Protocol', location: 'Sriperumbudur 400kV Substation', exposureValue: 'Grid Frequency Intercept' } },
      { id: 'rd4', name: 'Darknet Ransomware Drop Account', role: 'Industrial Extortion Escrow', type: 'account', status: 'active', riskScore: 99, hop: 3, details: { identifier: 'BTC: bc1qrd99...2026', location: 'Dark Web Multi-Sig', exposureValue: '50 BTC Demand' } }
    ],
    edges: [
      { id: 'rde1', source: 'rd0', target: 'rd1', label: 'Zero-Day Weaponization', weight: 3 },
      { id: 'rde2', source: 'rd0', target: 'rd2', label: 'Encrypted Signal C2 Channel', weight: 2 },
      { id: 'rde3', source: 'rd1', target: 'rd3', label: 'SCADA Relay Memory Patch', weight: 3 },
      { id: 'rde4', source: 'rd3', target: 'rd4', label: 'Blackout Ransom Trigger', weight: 3 }
    ]
  },
  'DEFAULT_FALLBACK': {
    label: "Operation Vajra — Jamtara Phishing Syndicate",
    syndicateName: "Operation Vajra — Jamtara Phishing Syndicate",
    nodes: [
      { id: 'c0', name: 'Rajesh "Techie" Kumar', role: 'Phishing Architect', type: 'suspect', status: 'active', riskScore: 95, hop: 0, details: { identifier: 'FIR/MUM/2026/1842', location: 'Jamtara Command Node', exposureValue: '₹18.6 Cr ($2.2M)' } },
      { id: 'c1', name: 'Telegram Bot API', role: 'C2 Server', type: 'location', status: 'active', riskScore: 88, hop: 1, details: { identifier: 'IP: 192.168.1.45', location: 'Noida Data Center', exposureValue: '1,200 Phishing Pings/hr' } },
      { id: 'c2', name: 'Mule A/C Cluster', role: 'Drop Accounts', type: 'account', status: 'active', riskScore: 82, hop: 2, details: { identifier: '50+ UPI IDs', location: 'Ranchi Regional Branch', exposureValue: '₹6.8 Cr' } },
      { id: 'c3', name: 'Binance Wallet', role: 'Crypto Mixer', type: 'account', status: 'active', riskScore: 99, hop: 3, details: { identifier: 'USDT TRC20', location: 'Unhosted Hardware Wallet', exposureValue: '₹9.4 Cr ($1.1M USDT)' } }
    ],
    edges: [
      { id: 'ce1', source: 'c0', target: 'c1', label: 'Server Admin', weight: 3 },
      { id: 'ce2', source: 'c0', target: 'c1', label: 'Auto-Routing', weight: 2 },
      { id: 'ce3', source: 'c2', target: 'c3', label: 'P2P Crypto Buy', weight: 3 }
    ]
  }
};

// Aliases for alternate ID references
SYNDICATE_DATASETS['shinde'] = SYNDICATE_DATASETS['CASE-2026-001'];
SYNDICATE_DATASETS['cyber'] = SYNDICATE_DATASETS['CASE-2026-005'];
SYNDICATE_DATASETS['FIR/DEL/2026/0891'] = SYNDICATE_DATASETS['CASE-2026-001'];
SYNDICATE_DATASETS['FIR/MUM/2026/1044'] = SYNDICATE_DATASETS['CASE-2026-002'];
SYNDICATE_DATASETS['FIR/BLR/2026/0332'] = SYNDICATE_DATASETS['CASE-2026-003'];
SYNDICATE_DATASETS['FIR/KOL/2026/0412'] = SYNDICATE_DATASETS['CASE-2026-004'];
SYNDICATE_DATASETS['FIR/MUM/2026/1842'] = SYNDICATE_DATASETS['CASE-2026-005'];
SYNDICATE_DATASETS['FIR/AHM/2026/0593'] = SYNDICATE_DATASETS['CASE-2026-006'];
SYNDICATE_DATASETS['FIR/BLR/2026/0778'] = SYNDICATE_DATASETS['CASE-2026-007'];
SYNDICATE_DATASETS['FIR/PUN/2026/1129'] = SYNDICATE_DATASETS['CASE-2026-008'];
SYNDICATE_DATASETS['FIR/CHE/2026/0204'] = SYNDICATE_DATASETS['CASE-2026-009'];
SYNDICATE_DATASETS['FIR_DEL_1428'] = SYNDICATE_DATASETS['FIR_MUM_1842'];

export interface BlastRadiusSimulatorProps {
  onSelectAction?: (action: string) => void;
}

export const BlastRadiusSimulator: React.FC<BlastRadiusSimulatorProps> = ({ onSelectAction }) => {
  // ─── 1. Locate and Consume Global State ─────────────────────────────────────
  const { selectedCaseId, selectedCase, cases, setSelectedCaseId } = useCaseContext();
  const activeInvestigationId = selectedCaseId || selectedCase?.id || 'DEFAULT_FALLBACK';

  // ─── 2. Reactive State Architecture (No hardcoded initial values) ────────────
  const [nodes, setNodes] = useState<CrimeNode[]>([]);
  const [edges, setEdges] = useState<CrimeEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedHop, setSelectedHop] = useState<number | 'all'>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Decoupled modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    actionType: 'LOC' | 'SEC91' | 'RESTORE' | null;
    targetNode: CrimeNode | null;
  }>({
    isOpen: false,
    actionType: null,
    targetNode: null,
  });

  // ─── 3. Reactive Data Sync (Deep Clone on Global State Changes) ─────────────
  useEffect(() => {
    if (!activeInvestigationId) return;

    // Match the ID to our datasets, or use FIR, or fallback
    const dataset = SYNDICATE_DATASETS[activeInvestigationId] ||
      (selectedCase?.fir_number ? SYNDICATE_DATASETS[selectedCase.fir_number] : undefined) ||
      (selectedCase?.id ? SYNDICATE_DATASETS[selectedCase.id] : undefined) ||
      SYNDICATE_DATASETS['DEFAULT_FALLBACK'];

    // DEEP CLONE to wipe out old 'contained' statuses from previous renders
    const freshNodes: CrimeNode[] = JSON.parse(JSON.stringify(dataset.nodes));

    setNodes(freshNodes);
    setEdges(dataset.edges);
    setSelectedHop('all');

    // Safely select the new Ground Zero node
    const groundZero = freshNodes.find((n: CrimeNode) => n.hop === 0) || freshNodes[0];
    if (groundZero) {
      setSelectedNodeId(groundZero.id);
    }
  }, [activeInvestigationId, selectedCase?.fir_number, selectedCase?.id]);

  // ─── 4. Auto-Derive Max Hops, Dynamic Radii & Semantic Labels ───────────────
  // 1. Calculate max depth
  const maxHop = useMemo(() => {
    if (!nodes || nodes.length === 0) return 0;
    return Math.max(...nodes.map(n => n.hop), 0);
  }, [nodes]);

  // 2. Dynamically generate ring radii
  const HOP_RADII = useMemo(() => {
    return Array.from({ length: maxHop + 1 }, (_, i) => i === 0 ? 0 : 110 + ((i - 1) * 100));
  }, [maxHop]);

  // 3. Auto-generate semantic labels for the UI based on the node roles at that hop
  const dynamicHopLabels = useMemo(() => {
    return Array.from({ length: maxHop + 1 }, (_, hop) => {
      if (hop === 0) return 'Epicenter';
      const hopNodes = nodes.filter(n => n.hop === hop);
      if (hopNodes.length === 0) return `Hop ${hop}`;
      const uniqueRoles = Array.from(new Set(hopNodes.map(n => n.role || n.type)));
      return uniqueRoles.slice(0, 2).join(' & ');
    });
  }, [nodes, maxHop]);

  // Selected & Ground Zero Node Memo
  const selectedNode = useMemo(() => {
    if (nodes.length === 0) return null;
    const found = nodes.find(n => n.id === selectedNodeId);
    if (found) return found;
    return nodes.find(n => n.hop === 0) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  const groundZeroNode = useMemo(() => {
    if (nodes.length === 0) return null;
    return nodes.find(n => n.hop === 0) || nodes[0] || null;
  }, [nodes]);

  // Reactive Disruption Rate based on dynamic edges state variable
  const disruptionRate = useMemo(() => {
    if (edges.length === 0) return 0;
    const totalWeights = edges.reduce((sum, e) => sum + (e.weight || 1), 0);
    if (totalWeights === 0) return 0;
    const containedIds = new Set(nodes.filter(n => n.status === 'contained').map(n => n.id));
    const severedWeight = edges
      .filter(e => containedIds.has(e.source) || containedIds.has(e.target))
      .reduce((sum, e) => sum + (e.weight || 1), 0);
    return Math.round((severedWeight / totalWeights) * 100);
  }, [nodes, edges]);

  // Polar Coordinate Math for Radar View (SVG 800x800)
  const CX = 400;
  const CY = 400;

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    if (nodes.length === 0) return positions;

    Array.from({ length: maxHop + 1 }, (_, hop) => {
      const hopNodes = nodes.filter(n => n.hop === hop);
      const total = hopNodes.length;
      hopNodes.forEach((node, idx) => {
        if (hop === 0) {
          positions[node.id] = { x: CX, y: CY };
        } else {
          const radius = HOP_RADII[hop] || (110 + (hop - 1) * 100);
          const angle = (2 * Math.PI * idx) / (total || 1) - Math.PI / 2 + (hop * 0.4);
          positions[node.id] = {
            x: Math.round(CX + radius * Math.cos(angle)),
            y: Math.round(CY + radius * Math.sin(angle))
          };
        }
      });
    });
    return positions;
  }, [nodes, maxHop, HOP_RADII]);

  // Current Dataset Reference
  const currentDataset = useMemo(() => {
    return SYNDICATE_DATASETS[activeInvestigationId] ||
      (selectedCase?.fir_number ? SYNDICATE_DATASETS[selectedCase.fir_number] : undefined) ||
      SYNDICATE_DATASETS['DEFAULT_FALLBACK'];
  }, [activeInvestigationId, selectedCase?.fir_number]);

  // Open confirmation modal
  const handleOpenActionModal = (e: React.MouseEvent, type: 'LOC' | 'SEC91' | 'RESTORE') => {
    e.stopPropagation();
    if (!selectedNode) return;
    setModalState({
      isOpen: true,
      actionType: type,
      targetNode: selectedNode,
    });
  };

  // Close modal without performing any action
  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalState({
      isOpen: false,
      actionType: null,
      targetNode: null,
    });
  };

  // Confirm and execute action
  const handleConfirmAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalState.targetNode || !modalState.actionType) return;

    setIsExecuting(true);
    const targetId = modalState.targetNode.id;
    const isRestoring = modalState.actionType === 'RESTORE';

    setNodes(prev => prev.map(n => n.id === targetId ? {
      ...n,
      status: isRestoring ? 'active' : 'contained',
    } : n));

    if (onSelectAction) {
      const actionLabels = {
        LOC: `Issued LOC & Froze Vector on ${modalState.targetNode.name}`,
        SEC91: `Applied Section 91 Surveillance on ${modalState.targetNode.name}`,
        RESTORE: `Restored Channel for ${modalState.targetNode.name}`,
      };
      onSelectAction(actionLabels[modalState.actionType]);
    }

    setIsExecuting(false);
    handleCloseModal();
  };

  const runSimulation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSimulating(true);
    if (onSelectAction) {
      onSelectAction(`Contagion Simulation Triggered: ${currentDataset.label}`);
    }
    setTimeout(() => setIsSimulating(false), 2400);
  };

  const isVisible = (hop: number) => selectedHop === 'all' || selectedHop === hop;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-[#070b14] text-slate-100 custom-scrollbar p-6 space-y-6">
      
      {/* ─── 1. Header & Unified Control Strip ───────────────────────────── */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800 rounded">
              Contagion Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">BFS Dynamic Multi-Source Radar</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide mt-1">Syndicate Blast Radius Simulator</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Investigation Selector Dropdown (Synched with Global State) */}
          <div className="flex items-center gap-2 bg-[#070b14] border border-slate-800 rounded-lg px-3 py-1.5">
            <UserX className="w-4 h-4 text-slate-400"/>
            <select 
              value={selectedCaseId || activeInvestigationId}
              onChange={(e) => {
                const newId = e.target.value;
                if (setSelectedCaseId) {
                  setSelectedCaseId(newId);
                }
                if (onSelectAction) {
                  const d = SYNDICATE_DATASETS[newId] || SYNDICATE_DATASETS['DEFAULT_FALLBACK'];
                  onSelectAction(`Switched Investigation to ${d.label}`);
                }
              }}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer max-w-[280px] truncate"
            >
              {cases && cases.length > 0 ? (
                cases.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-[#0c1322] text-white">
                    {c.fir_number ? `${c.fir_number} — ` : ''}{c.lead_suspect || c.title}
                  </option>
                ))
              ) : (
                Object.entries(SYNDICATE_DATASETS)
                  .filter(([key]) => !key.includes('/') && key.startsWith('CASE-'))
                  .map(([key, data]) => (
                    <option key={key} value={key} className="bg-[#0c1322] text-white">
                      {data.label}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Dynamic Hop Selector */}
          <div className="flex items-center bg-[#070b14] border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHop('all');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                selectedHop === 'all' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Hops
            </button>
            {dynamicHopLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHop(idx);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedHop === idx ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={label}
              >
                Hop {idx}
              </button>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold tracking-wider shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating Trace...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* ─── 2. Reactive 3 KPI Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Zero Suspect</div>
            <div className="text-base font-bold text-white mt-1">{groundZeroNode?.name || 'Loading Suspect...'}</div>
            <div className="text-xs text-red-400 font-mono mt-0.5">
              {groundZeroNode?.role || 'Identifying Anchor'} {groundZeroNode ? `(Risk: ${groundZeroNode.riskScore}/100)` : ''}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-400"/>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Assets at Risk</div>
            <div className="text-base font-bold text-amber-400 mt-1">
              {nodes.filter(n => n.hop > 0 && (n.type === 'account' || n.type === 'location' || n.type === 'vehicle' || n.type === 'phone')).length} Connected Entities & Shells
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">Est. Illicit Flow: {groundZeroNode?.details?.exposureValue || '₹24.0 Cr'}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-400"/>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syndicate Disruption Rate</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{disruptionRate}%</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {nodes.filter(n => n.status === 'contained').length} of {nodes.length} Nodes Isolated
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-400"/>
          </div>
        </div>
      </div>

      {/* ─── 3. Main Split-Screen Workspace ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Left Column: Interactive SVG Radial Radar Canvas */}
        <div className="lg:col-span-8 bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-inner min-h-[560px]">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse"/>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 truncate max-w-[340px]">
                {currentDataset.syndicateName || currentDataset.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {dynamicHopLabels.map((label, idx) => {
                const colorMap = ['bg-red-500', 'bg-amber-500', 'bg-cyan-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'];
                return (
                  <span key={idx} className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorMap[idx % colorMap.length]} inline-block`} />
                    Hop {idx} ({label})
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
            <svg 
              viewBox="0 0 800 800" 
              className="w-full h-full max-h-[560px] object-contain select-none"
            >
              <defs>
                <radialGradient id="epicenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(220, 38, 38, 0.3)" /> {/* Visible Crimson Center */}
                  <stop offset="30%" stopColor="rgba(220, 38, 38, 0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* 1. Dedicated Epicenter Glow (Independent of dynamic hops) */}
              <circle cx={CX} cy={CY} r="400" fill="url(#epicenterGlow)" pointerEvents="none" />

              {/* 2. Dynamic Concentric Radar Rings */}
              {HOP_RADII.map((r, i) => {
                if (r === 0) return null; // Skip center point
                return (
                  <circle
                    key={r}
                    cx={CX}
                    cy={CY}
                    r={r}
                    fill="none"
                    stroke="#475569" /* Lightened to slate-600 for better visibility */
                    strokeWidth={i === 1 ? "1.5" : "1"}
                    strokeDasharray={i > 1 ? "6 6" : "none"}
                    className="transition-all duration-300 pointer-events-none"
                  />
                );
              })}

              {/* 1. LAYER 1: Connecting Vector Lines (Rendered FIRST, with pointer-events-none) */}
              <g className="edges-layer">
                {edges.map(edge => {
                  const s = nodePositions[edge.source];
                  const t = nodePositions[edge.target];
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);

                  // Strict safety checks to prevent crashes during dataset swaps
                  if (!s || !t || !sourceNode || !targetNode) return null;
                  if (!isVisible(sourceNode.hop) && !isVisible(targetNode.hop)) return null;

                  const isSevered = sourceNode.status === 'contained' || targetNode.status === 'contained';

                  return (
                    <line
                      key={edge.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isSevered ? '#475569' : '#dc2626'}
                      strokeWidth={isSevered ? 1.5 : 2}
                      strokeDasharray={isSevered ? "4 4" : "none"}
                      strokeOpacity={isSevered ? 0.35 : 0.8}
                      className="pointer-events-none"
                    />
                  );
                })}
              </g>

              {/* 2. LAYER 2: Render Nodes SECOND (Above Lines, with Static Invisible Hitbox) */}
              <g className="nodes-layer">
                {nodes.map(node => {
                  const pos = nodePositions[node.id];
                  if (!pos || !isVisible(node.hop)) return null;

                  const isSelected = selectedNode ? node.id === selectedNode.id : false;
                  const isContained = node.status === 'contained';

                  // Dynamic color by Hop level
                  const colorMap = ['#ef4444', '#f59e0b', '#06b6d4', '#a855f7', '#10b981', '#ec4899'];
                  const nodeColor = isContained ? '#64748b' : colorMap[node.hop % colorMap.length] || '#ef4444';

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* 1. INVISIBLE HITBOX: Catches mouse events stably without jitter */}
                      <circle r="40" fill="transparent" className="z-50" />

                      {/* Pulsing ring for Ground Zero or Selected */}
                      {(node.hop === 0 || isSelected) && !isContained && (
                        <circle 
                          r={node.hop === 0 ? 28 : 22} 
                          fill="none" 
                          stroke={nodeColor} 
                          strokeWidth="2" 
                          opacity="0.5" 
                          className="animate-ping pointer-events-none" 
                        />
                      )}

                      {/* 2. VISUALS: Scale up on hover, separate from the hitbox */}
                      <g className="transition-transform duration-200 group-hover:scale-110 pointer-events-none">
                        {/* Outer Glow Ring */}
                        <circle
                          r={node.hop === 0 ? 22 : 16}
                          fill="#0b1120"
                          stroke={nodeColor}
                          strokeWidth={isSelected ? 3 : 2}
                          filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"
                        />

                        {/* Center Dot */}
                        <circle
                          r={node.hop === 0 ? 10 : 7}
                          fill={isContained ? '#475569' : nodeColor}
                        />
                      </g>

                      {/* 3. STATIC TEXT: Remains crisp, does not stretch */}
                      <text
                        y={node.hop === 0 ? 36 : 28}
                        textAnchor="middle"
                        className={`text-[11px] font-semibold tracking-wide pointer-events-none select-none ${
                          isContained 
                            ? 'fill-slate-500 line-through' 
                            : isSelected 
                            ? 'fill-white font-bold' 
                            : 'fill-slate-300'
                        }`}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Column: Asset Inspector & Police Playbook */}
        <div className="lg:col-span-4 bg-[#0c1322] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          {selectedNode ? (
            <>
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-400"/>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Asset Risk Inspector</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    selectedNode.status === 'contained' 
                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                      : 'bg-red-950 text-red-400 border-red-800'
                  }`}>
                    {selectedNode.status === 'contained' ? 'Severed / Contained' : 'Active Channel'}
                  </span>
                </div>

                {/* Selected Node Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.name}</h3>
                    <p className="text-xs text-red-400 font-medium">{selectedNode.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#070b14] border border-slate-800/80 p-3 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase">Hop Tier</span>
                      <p className="font-semibold text-white">Hop {selectedNode.hop} {selectedNode.hop === 0 ? '(Epicenter)' : ''}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase">Compromise Risk</span>
                      <p className="font-bold text-red-400">{selectedNode.riskScore} / 100</p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400 text-[10px] uppercase">Record / Identifier</span>
                      <p className="font-mono text-slate-300">{selectedNode.details?.identifier || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase">Known Coordinates</span>
                      <p className="text-slate-300">{selectedNode.details?.location || 'Unknown'}</p>
                    </div>
                    {selectedNode.details?.exposureValue && (
                      <div className="col-span-2 pt-1 border-t border-slate-800/60">
                        <span className="text-slate-400 text-[10px] uppercase">Estimated Exposure</span>
                        <p className="font-semibold text-amber-400">{selectedNode.details.exposureValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operational Playbook Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400"/>
                  Operational Containment Playbook
                </h4>

                <div className="space-y-2">
                  <button
                    onClick={(e) => handleOpenActionModal(e, selectedNode.status === 'contained' ? 'RESTORE' : 'LOC')}
                    disabled={isExecuting}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedNode.status === 'contained'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {selectedNode.status === 'contained' ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5"/>
                        Restore Channel
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5"/>
                        Issue LOC & Freeze Vector
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleOpenActionModal(e, 'SEC91')}
                    disabled={isExecuting || selectedNode.status === 'contained'}
                    className="w-full py-2 px-3 bg-[#070b14] hover:bg-slate-800/80 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
                    Apply CrPC Sec 91 Surveillance
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              Select an entity node on the radar canvas to view intelligence details and containment actions.
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. Decoupled Action Confirmation Modal ────────────────────── */}
      {modalState.isOpen && modalState.targetNode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-[#0c1322] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {modalState.actionType === 'RESTORE'
                    ? 'Confirm Channel Restoration'
                    : modalState.actionType === 'SEC91'
                    ? 'Execute Section 91 Surveillance'
                    : 'Enforce LOC & Vector Containment'}
                </h3>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal(e);
                }}
                className="p-1 text-slate-400 hover:text-white rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Target Entity: <strong className="text-white">{modalState.targetNode.name}</strong> ({modalState.targetNode.role})
              </p>
              <p className="text-slate-400">
                {modalState.actionType === 'RESTORE'
                  ? 'This will lift containment and resume active intelligence telemetry across this vector.'
                  : modalState.actionType === 'SEC91'
                  ? 'Statutory CDR interception warrant will be dispatched to nodal telecom authorities.'
                  : 'Lookout Circular (LOC) will be issued to Immigration authorities and underlying escrow pipelines will be severed.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal(e);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isExecuting}
                className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 ${
                  modalState.actionType === 'RESTORE'
                    ? 'bg-cyan-600 hover:bg-cyan-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {modalState.actionType === 'RESTORE' ? 'Confirm Restoration' : 'Execute Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
