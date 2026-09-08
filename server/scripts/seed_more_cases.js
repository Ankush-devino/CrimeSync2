// Seeding 6 additional high-profile Indian Law Enforcement cases into PostgreSQL & Neo4j AuraDB
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const neo4j = require('neo4j-driver');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function seedAdditionalData() {
  console.log('🚀 Starting Seeding of 6 Additional Indian Law Enforcement Cases...');

  const client = await pgPool.connect();
  const session = neo4jDriver.session();

  try {
    // ==========================================
    // 1. PostgreSQL Inserts
    // ==========================================
    console.log('📦 Inserting into PostgreSQL (Neon Cloud)...');

    const newCases = [
      [
        'CASE-2026-004',
        'FIR/KOL/2026/0412',
        'Operation Chakra: Cross-Border Tech Support & Crypto Scam',
        'Illicit VOIP call center ring masquerading as global tech support, coercing wire transfers into Indian mule accounts and OTC USDT channels.',
        'FINANCIAL_FRAUD',
        'CRITICAL',
        'INVESTIGATING',
        'USR-105',
        'Kolkata'
      ],
      [
        'CASE-2026-005',
        'FIR/MUM/2026/1842',
        'Operation Vajra: Digital Arrest & Fake Law Enforcement Extortion',
        'Syndicate impersonating CBI & ED officers on Skype/WhatsApp, placing victims under 72-hour virtual house arrest to extort crores.',
        'ORGANIZED_SYNDICATE',
        'CRITICAL',
        'INVESTIGATING',
        'USR-102',
        'Mumbai'
      ],
      [
        'CASE-2026-006',
        'FIR/AHM/2026/0593',
        'Operation Durg: Counterfeit Biometric & AePS Micro-ATM Bypass',
        'High-precision silicone fingerprint casting from public deed registries used to execute unauthorized AePS micro-ATM withdrawals.',
        'IDENTITY_THEFT',
        'HIGH',
        'INVESTIGATING',
        'USR-104',
        'Ahmedabad'
      ],
      [
        'CASE-2026-007',
        'FIR/BLR/2026/0778',
        'Operation Netra: AI Deepfake Video Extortion & Honeytrap Ring',
        'Generative diffusion models used to fabricate high-ranking corporate executive compromising videos for Monero and USDT extortion.',
        'CYBER_ATTACK',
        'HIGH',
        'OPEN',
        'USR-103',
        'Bengaluru'
      ],
      [
        'CASE-2026-008',
        'FIR/PUN/2026/1129',
        'Operation Kuber: Predatory Instant Loan App & Hawala Funnel',
        'Malicious Android APKs stealing contacts/photos, backed by aggressive harassment call centers and automated Hawala money laundering.',
        'FINANCIAL_FRAUD',
        'CRITICAL',
        'INVESTIGATING',
        'USR-101',
        'Pune'
      ],
      [
        'CASE-2026-009',
        'FIR/CHE/2026/0204',
        'Operation Rudra: National Critical SCADA Ransomware Infiltration',
        'Targeted zero-day VPN exploitation attempting unauthorized command injection into Southern Regional Power Grid SCADA relays.',
        'CYBER_ATTACK',
        'CRITICAL',
        'OPEN',
        'USR-102',
        'Chennai'
      ]
    ];

    for (const c of newCases) {
      await client.query(
        `INSERT INTO cases (id, fir_number, title, description, crime_category, priority, status, lead_investigator_id, jurisdiction_city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           fir_number = EXCLUDED.fir_number,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           crime_category = EXCLUDED.crime_category,
           priority = EXCLUDED.priority,
           status = EXCLUDED.status,
           lead_investigator_id = EXCLUDED.lead_investigator_id,
           jurisdiction_city = EXCLUDED.jurisdiction_city,
           updated_at = CURRENT_TIMESTAMP`,
        c
      );
    }
    console.log('✅ Cases inserted/updated in PostgreSQL.');

    // 2. Evidence
    const newEvidence = [
      // Case 4
      ['EVD-504', 'CASE-2026-004', 'EVD-KOL-2026-01', 'Grandstream VOIP Gateway & Asterisk Server Logs', 'SERVER_LOG', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-504.log', '9f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9061', 'USR-105', 'USR-105', 'IN_FORENSICS'],
      ['EVD-505', 'CASE-2026-004', 'EVD-KOL-2026-02', 'AnyDesk & UltraViewer Remote Session Transcripts', 'FORENSIC_IMAGE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-505.pcap', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48b2', 'USR-105', 'USR-103', 'SECURED'],
      // Case 5
      ['EVD-506', 'CASE-2026-005', 'EVD-MUM-2026-02', 'Forged CBI & Supreme Court Arrest Warrants (PDFs)', 'DIGITAL_HARDWARE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-506.pdf', '3a978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48c3', 'USR-102', 'USR-102', 'COURT_SUBMITTED'],
      ['EVD-507', 'CASE-2026-005', 'EVD-MUM-2026-03', 'Skype Video Recordings of Fake Police Station Setup', 'CCTV_FOOTAGE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-507.mp4', '2b83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9074', 'USR-102', 'USR-104', 'SECURED'],
      // Case 6
      ['EVD-508', 'CASE-2026-006', 'EVD-AHM-2026-01', '350+ Silicone Fingerprint Replicas & Chemical Casting Kit', 'DIGITAL_HARDWARE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-508.tar.gz', '1c83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9085', 'USR-104', 'USR-103', 'IN_FORENSICS'],
      ['EVD-509', 'CASE-2026-006', 'EVD-AHM-2026-02', 'Tampered Morpho MSO1300E3 Biometric Scanner', 'DIGITAL_HARDWARE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-509.raw', '7d978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48d6', 'USR-104', 'USR-104', 'SECURED'],
      // Case 7
      ['EVD-510', 'CASE-2026-007', 'EVD-BLR-2026-02', 'NVIDIA RTX 4090 GPU Rig with FaceSwap Python Repos', 'FORENSIC_IMAGE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-510.dd', '8e978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48e7', 'USR-103', 'USR-103', 'IN_FORENSICS'],
      ['EVD-511', 'CASE-2026-007', 'EVD-BLR-2026-03', 'Telegram Chat Dumps & Monero Wallet Seed Phrase', 'CALL_RECORD', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-511.json', '5f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9098', 'USR-103', 'USR-101', 'SECURED'],
      // Case 8
      ['EVD-512', 'CASE-2026-008', 'EVD-PUN-2026-01', 'Decompiled "CashInstant" and "QuickCredit" Malicious APKs', 'DIGITAL_HARDWARE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-512.apk', '4a83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9009', 'USR-101', 'USR-103', 'IN_FORENSICS'],
      ['EVD-513', 'CASE-2026-008', 'EVD-PUN-2026-02', 'Seized MongoDB Backup containing 14M Contact Books', 'SERVER_LOG', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-513.bson', '6b978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48f1', 'USR-101', 'USR-101', 'SECURED'],
      // Case 9
      ['EVD-514', 'CASE-2026-009', 'EVD-CHE-2026-01', 'Memory Dump with Cobalt Strike Beacon & Meterpreter Payload', 'FORENSIC_IMAGE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-514.raw', '9c978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48a2', 'USR-102', 'USR-103', 'IN_FORENSICS'],
      ['EVD-515', 'CASE-2026-009', 'EVD-CHE-2026-02', 'Firewall Access Logs showing Exploit to SCADA HMI', 'SERVER_LOG', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-515.log', '0d83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d90b3', 'USR-102', 'USR-102', 'SECURED']
    ];

    for (const e of newEvidence) {
      await client.query(
        `INSERT INTO evidence (id, case_id, evidence_code, title, category, file_url, hash_sha256, collected_by_id, current_custody_officer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           case_id = EXCLUDED.case_id,
           evidence_code = EXCLUDED.evidence_code,
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           status = EXCLUDED.status`,
        e
      );
    }
    console.log('✅ Evidence records inserted/updated in PostgreSQL.');

    // 3. Financial Transactions
    const newTxns = [
      ['TXN-904', 'CASE-2026-004', 'UPI/2026/88410294', 'AXIS0009182374', 'Debjit Sen (VOIP Admin)', 'ICIC0003892110', 'Anirban Mukherjee (Kingpin)', 'Axis Bank', 680000.00, 'UPI', 0.94],
      ['TXN-905', 'CASE-2026-004', 'RTGS/2026/77192039', 'ICIC0003892110', 'Anirban Mukherjee (Kingpin)', 'WZR0009918273', 'OTC Crypto Desk (USDT)', 'ICICI Bank', 3450000.00, 'RTGS', 0.99],
      ['TXN-906', 'CASE-2026-005', 'RTGS/2026/33918204', 'SBIN0006719023', 'Manish Rathore (Mule)', 'HDFC0004819201', 'Kunwar Pratap Singh (Leader)', 'State Bank of India', 4200000.00, 'RTGS', 0.98],
      ['TXN-907', 'CASE-2026-005', 'IMPS/2026/22019483', 'HDFC0004819201', 'Kunwar Pratap Singh (Leader)', 'HAWALA/DEL/09', 'Old Delhi Hawala Hub', 'HDFC Bank', 950000.00, 'HAWALA', 0.96],
      ['TXN-908', 'CASE-2026-006', 'AEPS/2026/11928374', 'BARB0SURAT01', 'Paresh Dave (CSP Agent)', 'KKBK0001928374', 'Jignesh Patel (Silicon Master)', 'Bank of Baroda', 120000.00, 'IMPS', 0.91],
      ['TXN-909', 'CASE-2026-006', 'RTGS/2026/99482716', 'KKBK0001928374', 'Jignesh Patel (Silicon Master)', 'SBIN0001827364', 'Surat Bullion Trader', 'Kotak Mahindra Bank', 1840000.00, 'RTGS', 0.95],
      ['TXN-910', 'CASE-2026-007', 'UPI/2026/55918273', 'PUNB0008819201', 'Harpreet Singh (Extortion Caller)', 'YESB0002918273', 'Kavita Nair (AI Dev)', 'Punjab National Bank', 350000.00, 'UPI', 0.88],
      ['TXN-911', 'CASE-2026-007', 'CRYP/2026/66019284', 'YESB0002918273', 'Kavita Nair (AI Dev)', 'XMR_WALLET_88A', 'Offshore Monero Pool', 'Yes Bank', 2200000.00, 'CRYPTO_CONVERSION', 0.97],
      ['TXN-912', 'CASE-2026-008', 'UPI/2026/11029384', 'IDFB0004918271', 'Siddharth Joshi (App Dev)', 'UTIB0001928374', 'Chirag Mehta (Hawala Agent)', 'IDFC First Bank', 780000.00, 'UPI', 0.93],
      ['TXN-913', 'CASE-2026-008', 'RTGS/2026/44910283', 'UTIB0001928374', 'Chirag Mehta (Hawala Agent)', 'HK_EXCHANGE_99', 'Guangzhou Sourcing Co', 'Axis Bank', 5500000.00, 'RTGS', 0.99],
      ['TXN-914', 'CASE-2026-009', 'CRYP/2026/77819201', 'IOBA0001928371', 'Karthik Ramanathan (APT Dev)', 'BTC_ESCROW_91', 'Darknet Ransom Escrow', 'Indian Overseas Bank', 8500000.00, 'CRYPTO_CONVERSION', 0.99],
      ['TXN-915', 'CASE-2026-009', 'RTGS/2026/12093847', 'CBIN0281928391', 'Deepak Sharma (Insider)', 'IOBA0001928371', 'Karthik Ramanathan (APT Dev)', 'Central Bank of India', 1500000.00, 'RTGS', 0.92]
    ];

    for (const t of newTxns) {
      await client.query(
        `INSERT INTO financial_transactions (id, case_id, transaction_ref, source_account, source_holder_name, target_account, target_holder_name, bank_name, amount_inr, channel, suspicious_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           case_id = EXCLUDED.case_id,
           transaction_ref = EXCLUDED.transaction_ref,
           amount_inr = EXCLUDED.amount_inr,
           suspicious_score = EXCLUDED.suspicious_score`,
        t
      );
    }
    console.log('✅ Financial transactions inserted/updated in PostgreSQL.');

    // 4. Geo-intel Events
    const newGeo = [
      ['GEO-05', 'CASE-2026-004', 'CALL_CENTER_RAID', 22.572645, 88.363892, 'Salt Lake Sector V, Bidhannagar', 'Kolkata', 'West Bengal'],
      ['GEO-06', 'CASE-2026-004', 'VOIP_PBX_TOWER_PING', 28.535517, 77.391029, 'Sector 62 Tech Zone', 'Noida', 'Uttar Pradesh'],
      ['GEO-07', 'CASE-2026-005', 'FAKE_STUDIO_LOCATION', 26.912434, 75.787270, 'Malviya Nagar Industrial Area', 'Jaipur', 'Rajasthan'],
      ['GEO-08', 'CASE-2026-005', 'HAWALA_COURIER_PICKUP', 18.921984, 72.834654, 'Nariman Point Financial District', 'Mumbai', 'Maharashtra'],
      ['GEO-09', 'CASE-2026-006', 'AEPS_FRAUD_HUB', 23.022505, 72.571365, 'SG Highway Commercial Complex', 'Ahmedabad', 'Gujarat'],
      ['GEO-10', 'CASE-2026-006', 'SILICONE_LAB_SEIZURE', 21.170240, 72.831062, 'Varachha Diamond Market', 'Surat', 'Gujarat'],
      ['GEO-11', 'CASE-2026-007', 'GPU_CLUSTER_HOSTING', 12.978369, 77.640837, '100ft Road, Indiranagar', 'Bengaluru', 'Karnataka'],
      ['GEO-12', 'CASE-2026-007', 'SIM_ACTIVATION_POINT', 28.459497, 77.026638, 'Cyber City DLF Phase 2', 'Gurugram', 'Haryana'],
      ['GEO-13', 'CASE-2026-008', 'HARASSMENT_CALL_DESK', 18.520430, 73.856743, 'Hinjawadi Phase 1 IT Park', 'Pune', 'Maharashtra'],
      ['GEO-14', 'CASE-2026-008', 'CRYPTO_OTC_EXCHANGE', 17.443500, 78.377200, 'Hitec City Cyber Towers', 'Hyderabad', 'Telangana'],
      ['GEO-15', 'CASE-2026-009', 'SCADA_INTRUSION_SOURCE', 13.082680, 80.270721, 'T. Nagar Tech Corridor', 'Chennai', 'Tamil Nadu'],
      ['GEO-16', 'CASE-2026-009', 'VPN_GATEWAY_NODE', 28.592100, 77.228500, 'CGO Complex Lodhi Road', 'New Delhi', 'Delhi']
    ];

    for (const g of newGeo) {
      await client.query(
        `INSERT INTO geo_intel_events (id, case_id, event_type, latitude, longitude, location_name, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           case_id = EXCLUDED.case_id,
           location_name = EXCLUDED.location_name,
           city = EXCLUDED.city,
           state = EXCLUDED.state`,
        g
      );
    }
    console.log('✅ Geo-Intel events inserted/updated in PostgreSQL.');

    // ==========================================
    // 2. Neo4j Inserts (Knowledge Graph)
    // ==========================================
    console.log('🌐 Inserting into Neo4j AuraDB Knowledge Graph...');

    await session.run(`
      // Cases
      MERGE (c4:Case {id: 'CASE-2026-004'}) SET c4.title = 'Operation Chakra', c4.status = 'INVESTIGATING'
      MERGE (c5:Case {id: 'CASE-2026-005'}) SET c5.title = 'Operation Vajra', c5.status = 'INVESTIGATING'
      MERGE (c6:Case {id: 'CASE-2026-006'}) SET c6.title = 'Operation Durg', c6.status = 'INVESTIGATING'
      MERGE (c7:Case {id: 'CASE-2026-007'}) SET c7.title = 'Operation Netra', c7.status = 'OPEN'
      MERGE (c8:Case {id: 'CASE-2026-008'}) SET c8.title = 'Operation Kuber', c8.status = 'INVESTIGATING'
      MERGE (c9:Case {id: 'CASE-2026-009'}) SET c9.title = 'Operation Rudra', c9.status = 'OPEN'

      // New Suspects
      MERGE (s6:Suspect {id: 'SUS-06'}) SET s6.name = 'Anirban Mukherjee', s6.alias = 'Bobby', s6.role = 'Call Center Kingpin', s6.risk_level = 'CRITICAL', s6.city = 'Kolkata'
      MERGE (s7:Suspect {id: 'SUS-07'}) SET s7.name = 'Debjit Sen', s7.alias = 'Dave', s7.role = 'VOIP & SIP Administrator', s7.risk_level = 'HIGH', s7.city = 'Noida'
      MERGE (s8:Suspect {id: 'SUS-08'}) SET s8.name = 'Kunwar Pratap Singh', s8.alias = 'Rana Saheb', s8.role = 'Digital Arrest Impersonation Boss', s8.risk_level = 'CRITICAL', s8.city = 'Jaipur'
      MERGE (s9:Suspect {id: 'SUS-09'}) SET s9.name = 'Manish Rathore', s9.alias = 'Munna', s9.role = 'Mule Account Manager', s9.risk_level = 'HIGH', s9.city = 'Mumbai'
      MERGE (s10:Suspect {id: 'SUS-10'}) SET s10.name = 'Jignesh Patel', s10.alias = 'Silicon Master', s10.role = 'Biometric Cloner & AePS Hacker', s10.risk_level = 'HIGH', s10.city = 'Ahmedabad'
      MERGE (s11:Suspect {id: 'SUS-11'}) SET s11.name = 'Paresh Dave', s11.alias = 'Masterji', s11.role = 'Micro-ATM CSP Operator', s11.risk_level = 'MEDIUM', s11.city = 'Surat'
      MERGE (s12:Suspect {id: 'SUS-12'}) SET s12.name = 'Kavita Nair', s12.alias = 'Aria', s12.role = 'AI Deepfake Synthesizer', s12.risk_level = 'CRITICAL', s12.city = 'Bengaluru'
      MERGE (s13:Suspect {id: 'SUS-13'}) SET s13.name = 'Harpreet Singh', s13.alias = 'Happy', s13.role = 'Extortion Call Operator', s13.risk_level = 'HIGH', s13.city = 'Gurugram'
      MERGE (s14:Suspect {id: 'SUS-14'}) SET s14.name = 'Siddharth Joshi', s14.alias = 'Sid', s14.role = 'Malicious APK Distributor', s14.risk_level = 'HIGH', s14.city = 'Pune'
      MERGE (s15:Suspect {id: 'SUS-15'}) SET s15.name = 'Chirag Mehta', s15.alias = 'Charlie', s15.role = 'Hawala Settlement Broker', s15.risk_level = 'CRITICAL', s15.city = 'Hyderabad'
      MERGE (s16:Suspect {id: 'SUS-16'}) SET s16.name = 'Karthik Ramanathan', s16.alias = 'GhostByte', s16.role = 'APT Exploit Developer', s16.risk_level = 'CRITICAL', s16.city = 'Chennai'
      MERGE (s17:Suspect {id: 'SUS-17'}) SET s17.name = 'Deepak Sharma', s17.alias = 'RootAdmin', s17.role = 'SCADA Insider Access Broker', s17.risk_level = 'HIGH', s17.city = 'New Delhi'

      // New Accounts
      MERGE (a4:Account {account_number: 'AXIS0009182374'}) SET a4.bank = 'Axis Bank', a4.holder = 'Debjit Sen', a4.balance_inr = 890000
      MERGE (a5:Account {account_number: 'ICIC0003892110'}) SET a5.bank = 'ICICI Bank', a5.holder = 'Anirban Mukherjee', a5.balance_inr = 4500000
      MERGE (a6:Account {account_number: 'SBIN0006719023'}) SET a6.bank = 'SBI', a6.holder = 'Manish Rathore', a6.balance_inr = 5200000
      MERGE (a7:Account {account_number: 'HDFC0004819201'}) SET a7.bank = 'HDFC Bank', a7.holder = 'Kunwar Pratap Singh', a7.balance_inr = 8900000
      MERGE (a8:Account {account_number: 'KKBK0001928374'}) SET a8.bank = 'Kotak Bank', a8.holder = 'Jignesh Patel', a8.balance_inr = 2100000
      MERGE (a9:Account {account_number: 'YESB0002918273'}) SET a9.bank = 'Yes Bank', a9.holder = 'Kavita Nair', a9.balance_inr = 3400000
      MERGE (a10:Account {account_number: 'IDFB0004918271'}) SET a10.bank = 'IDFC First', a10.holder = 'Siddharth Joshi', a10.balance_inr = 1750000
      MERGE (a11:Account {account_number: 'UTIB0001928374'}) SET a11.bank = 'Axis Bank', a11.holder = 'Chirag Mehta', a11.balance_inr = 12000000
      MERGE (a12:Account {account_number: 'IOBA0001928371'}) SET a12.bank = 'IOB', a12.holder = 'Karthik Ramanathan', a12.balance_inr = 9500000

      // New Phones
      MERGE (p4:Phone {phone_number: '+91-9831998877'}) SET p4.carrier = 'Airtel', p4.suspect_id = 'SUS-06'
      MERGE (p5:Phone {phone_number: '+91-9874112233'}) SET p5.carrier = 'Jio', p5.suspect_id = 'SUS-07'
      MERGE (p6:Phone {phone_number: '+91-9829001122'}) SET p6.carrier = 'Vi', p6.suspect_id = 'SUS-08'
      MERGE (p7:Phone {phone_number: '+91-9825112233'}) SET p7.carrier = 'Jio', p7.suspect_id = 'SUS-10'
      MERGE (p8:Phone {phone_number: '+91-9844001199'}) SET p8.carrier = 'Airtel', p8.suspect_id = 'SUS-12'
      MERGE (p9:Phone {phone_number: '+91-9823004455'}) SET p9.carrier = 'Vi', p9.suspect_id = 'SUS-14'
      MERGE (p10:Phone {phone_number: '+91-9840112233'}) SET p10.carrier = 'BSNL', p10.suspect_id = 'SUS-16'

      // New Cyber Assets
      MERGE (ip3:IPAddress {ip: '182.74.22.19'}) SET ip3.isp = 'Tata Tele', ip3.location = 'Kolkata', ip3.status = 'VOIP_SIP_TRUNK'
      MERGE (ip4:IPAddress {ip: '115.240.91.44'}) SET ip4.isp = 'Airtel Broadband', ip4.location = 'Jaipur', ip4.status = 'SKYPE_PROXY'
      MERGE (ip5:IPAddress {ip: '103.110.170.8'}) SET ip5.isp = 'Spectranet', ip5.location = 'Bengaluru', ip5.status = 'AI_MODEL_C2'
      MERGE (ip6:IPAddress {ip: '45.114.128.5'}) SET ip6.isp = 'ACT Enterprise', ip6.location = 'Chennai', ip6.status = 'SCADA_EXPLOIT_STAGING'

      // Relationships - Case Involvements
      MERGE (s6)-[:IMPLICATED_IN {role: 'KINGPIN'}]->(c4)
      MERGE (s7)-[:IMPLICATED_IN {role: 'VOIP_ADMIN'}]->(c4)
      MERGE (s8)-[:IMPLICATED_IN {role: 'CHIEF_EXTORTIONIST'}]->(c5)
      MERGE (s9)-[:IMPLICATED_IN {role: 'MULE_HANDLER'}]->(c5)
      MERGE (s10)-[:IMPLICATED_IN {role: 'BIOMETRIC_CLONER'}]->(c6)
      MERGE (s11)-[:IMPLICATED_IN {role: 'CSP_OPERATOR'}]->(c6)
      MERGE (s12)-[:IMPLICATED_IN {role: 'AI_CREATOR'}]->(c7)
      MERGE (s13)-[:IMPLICATED_IN {role: 'CALL_OPERATOR'}]->(c7)
      MERGE (s14)-[:IMPLICATED_IN {role: 'APK_DEVELOPER'}]->(c8)
      MERGE (s15)-[:IMPLICATED_IN {role: 'HAWALA_BROKER'}]->(c8)
      MERGE (s16)-[:IMPLICATED_IN {role: 'APT_DEVELOPER'}]->(c9)
      MERGE (s17)-[:IMPLICATED_IN {role: 'INSIDER_ACCESS'}]->(c9)

      // Relationships - Account Ownership
      MERGE (s7)-[:OPERATES_ACCOUNT]->(a4)
      MERGE (s6)-[:OPERATES_ACCOUNT]->(a5)
      MERGE (s9)-[:OPERATES_ACCOUNT]->(a6)
      MERGE (s8)-[:OPERATES_ACCOUNT]->(a7)
      MERGE (s10)-[:OPERATES_ACCOUNT]->(a8)
      MERGE (s12)-[:OPERATES_ACCOUNT]->(a9)
      MERGE (s14)-[:OPERATES_ACCOUNT]->(a10)
      MERGE (s15)-[:OPERATES_ACCOUNT]->(a11)
      MERGE (s16)-[:OPERATES_ACCOUNT]->(a12)

      // Relationships - Device Ownership
      MERGE (s6)-[:OWNS_DEVICE]->(p4)
      MERGE (s7)-[:OWNS_DEVICE]->(p5)
      MERGE (s8)-[:OWNS_DEVICE]->(p6)
      MERGE (s10)-[:OWNS_DEVICE]->(p7)
      MERGE (s12)-[:OWNS_DEVICE]->(p8)
      MERGE (s14)-[:OWNS_DEVICE]->(p9)
      MERGE (s16)-[:OWNS_DEVICE]->(p10)

      // Relationships - Phone Communications
      MERGE (p5)-[:COMMUNICATES_WITH {calls: 84, sms: 210, last_contact: '2026-08-31'}]->(p4)
      MERGE (p6)-[:COMMUNICATES_WITH {calls: 62, sms: 140, last_contact: '2026-09-01'}]->(p4)
      MERGE (p8)-[:COMMUNICATES_WITH {calls: 95, sms: 430, last_contact: '2026-09-02'}]->(p9)
      MERGE (p9)-[:COMMUNICATES_WITH {calls: 142, sms: 580, last_contact: '2026-09-03'}]->(p10)

      // Relationships - Money Flow (Financial Edges)
      MERGE (a4)-[:TRANSFERRED_INR {amount: 680000, channel: 'UPI', date: '2026-08-28'}]->(a5)
      MERGE (a6)-[:TRANSFERRED_INR {amount: 4200000, channel: 'RTGS', date: '2026-08-30'}]->(a7)
      MERGE (a10)-[:TRANSFERRED_INR {amount: 780000, channel: 'UPI', date: '2026-09-01'}]->(a11)
      MERGE (a12)-[:TRANSFERRED_INR {amount: 8500000, channel: 'CRYPTO_CONVERSION', date: '2026-09-02'}]->(a11)

      // Relationships - Cyber Infrastructure
      MERGE (s7)-[:CONTROLS_INFRA]->(ip3)
      MERGE (s8)-[:CONTROLS_INFRA]->(ip4)
      MERGE (s12)-[:CONTROLS_INFRA]->(ip5)
      MERGE (s16)-[:CONTROLS_INFRA]->(ip6)

      MERGE (ip3)-[:TARGETS_INFRASTRUCTURE {attack_vector: 'VOIP_SPOOFING', severity: 'HIGH'}]->(c4)
      MERGE (ip4)-[:TARGETS_INFRASTRUCTURE {attack_vector: 'DIGITAL_ARREST', severity: 'CRITICAL'}]->(c5)
      MERGE (ip5)-[:TARGETS_INFRASTRUCTURE {attack_vector: 'DEEPFAKE_GENERATION', severity: 'HIGH'}]->(c7)
      MERGE (ip6)-[:TARGETS_INFRASTRUCTURE {attack_vector: 'SCADA_ZERO_DAY', severity: 'CRITICAL'}]->(c9)
    `);

    console.log('✅ Neo4j Knowledge Graph enriched with 6 new cases and syndicate networks.');
    console.log('\n🎉 ALL 9 CASES ARE NOW LIVE IN BOTH POSTGRESQL & NEO4J!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    client.release();
    await session.close();
    await pgPool.end();
    await neo4jDriver.close();
  }
}

seedAdditionalData();
