// Database Initializer & Indian Dummy Data Generator for CrimeSync
// Seeds PostgreSQL (Neon) & Neo4j (AuraDB)

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

async function initPostgres() {
  console.log('📦 Initializing PostgreSQL Schema on Neon...');
  const schemaPath = path.resolve(__dirname, '../src/config/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  const client = await pgPool.connect();
  try {
    await client.query(schemaSql);
    console.log('✅ PostgreSQL Tables & Indexes created successfully.');

    console.log('🌱 Seeding PostgreSQL with Indian Law Enforcement Data...');

    // 1. Users (Indian Police & Cyber Intelligence Officers)
    const users = [
      ['USR-101', 'DEL-IPS-8821', 'ACP Rajeshwar Sharma', 'rajesh.sharma@delhipolice.gov.in', '$2b$10$hashedpass1', 'LEAD_INVESTIGATOR', 'Special Cell / Cyber Crime Unit', 'New Delhi', '+91-9810112233'],
      ['USR-102', 'MUM-CYB-4091', 'Inspector Priya Kulkarni', 'priya.kulkarni@mahapolice.gov.in', '$2b$10$hashedpass2', 'CYBER_ANALYST', 'Cyber Crime Investigation Cell', 'Mumbai', '+91-9820223344'],
      ['USR-103', 'BLR-INT-1102', 'DSP Arvind Swaminathan', 'arvind.s@ksp.gov.in', '$2b$10$hashedpass3', 'FORENSIC_EXPERT', 'Forensic Science Laboratory (FSL)', 'Bengaluru', '+91-9845334455'],
      ['USR-104', 'HYD-CID-7740', 'SI Vikramaditya Reddy', 'vikram.reddy@tspolice.gov.in', '$2b$10$hashedpass4', 'FIELD_OFFICER', 'CID Financial Fraud Division', 'Hyderabad', '+91-9876445566'],
      ['USR-105', 'CBI-HQ-0012', 'Superintendent Ananya Sengupta', 'ananya.sengupta@cbi.gov.in', '$2b$10$hashedpass5', 'ADMIN', 'Anti-Corruption & Economic Offences', 'Kolkata', '+91-9831556677']
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, badge_number, full_name, email, password_hash, role, department, city, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        u
      );
    }

    // 2. Cases (FIRs)
    const cases = [
      ['CASE-2026-001', 'FIR/DEL/2026/0891', 'Operation Trishul: Coordinated Hawala & Phishing Syndicate', 'Large-scale identity theft and mule bank account network targeting PSU bank customers in NCR and MMR region.', 'FINANCIAL_FRAUD', 'CRITICAL', 'INVESTIGATING', 'USR-101', 'New Delhi'],
      ['CASE-2026-002', 'FIR/MUM/2026/1044', 'GridShield: Cyber Attack Attempt on State Power Distribution Grid', 'Targeted spear-phishing and C2 beaconing detected attempting lateral movement into SCADA systems.', 'CYBER_ATTACK', 'CRITICAL', 'OPEN', 'USR-102', 'Mumbai'],
      ['CASE-2026-003', 'FIR/BLR/2026/0332', 'Operation Garud: Counterfeit SIM & OTP Interception Ring', 'Unlicensed spoofed VoIP exchanges routing fraudulent OTP requests through forged Aadhaar cards.', 'ORGANIZED_SYNDICATE', 'HIGH', 'INVESTIGATING', 'USR-103', 'Bengaluru']
    ];

    for (const c of cases) {
      await client.query(
        `INSERT INTO cases (id, fir_number, title, description, crime_category, priority, status, lead_investigator_id, jurisdiction_city) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        c
      );
    }

    // 3. Evidence
    const evidence = [
      ['EVD-501', 'CASE-2026-001', 'EVD-DL-2026-01', 'OnePlus 12 Recovered from Suspect Vivek Deshmukh', 'MOBILE_DEVICE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-501.tar.gz', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'USR-104', 'USR-103', 'IN_FORENSICS'],
      ['EVD-502', 'CASE-2026-001', 'EVD-DL-2026-02', 'Forged Aadhaar & PAN Card Batch (142 identity documents)', 'DIGITAL_HARDWARE', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-502.pdf', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'USR-101', 'USR-101', 'SECURED'],
      ['EVD-503', 'CASE-2026-002', 'EVD-MB-2026-01', 'PCAP Network Dumps of CobaltStrike C2 Traffic', 'SERVER_LOG', 'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-503.pcap', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', 'USR-102', 'USR-102', 'IN_FORENSICS']
    ];

    for (const e of evidence) {
      await client.query(
        `INSERT INTO evidence (id, case_id, evidence_code, title, category, file_url, hash_sha256, collected_by_id, current_custody_officer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
        e
      );
    }

    // 4. Financial Transactions (Indian Banks & UPI)
    const transactions = [
      ['TXN-901', 'CASE-2026-001', 'UPI/2026/99812039', 'SBIN0004921001', 'Rohan Verma (Mule)', 'HDFC0001829032', 'Alok Pandey (Operator)', 'State Bank of India', 450000.00, 'UPI', 0.92],
      ['TXN-902', 'CASE-2026-001', 'RTGS/2026/11029384', 'HDFC0001829032', 'Alok Pandey (Operator)', 'ICIC0009981201', 'Vikramaditya Shinde (Kingpin)', 'HDFC Bank', 2850000.00, 'RTGS', 0.98],
      ['TXN-903', 'CASE-2026-001', 'IMPS/2026/44910238', 'SBIN0004921001', 'Rohan Verma (Mule)', 'PUNB0007829102', 'Sunil Yadav (Crypto OTC)', 'State Bank of India', 180000.00, 'IMPS', 0.85]
    ];

    for (const t of transactions) {
      await client.query(
        `INSERT INTO financial_transactions (id, case_id, transaction_ref, source_account, source_holder_name, target_account, target_holder_name, bank_name, amount_inr, channel, suspicious_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
        t
      );
    }

    // 5. Geo Intel Events (Indian Crime Coordinates)
    const geoEvents = [
      ['GEO-01', 'CASE-2026-001', 'SUSPECT_CELL_TOWER_PING', 28.613939, 77.209023, 'Connaught Place Circle', 'New Delhi', 'Delhi'],
      ['GEO-02', 'CASE-2026-001', 'ATM_WITHDRAWAL_FRAUD', 19.076090, 72.877426, 'Bandra Kurla Complex (BKC)', 'Mumbai', 'Maharashtra'],
      ['GEO-03', 'CASE-2026-003', 'SIM_BOX_ROUTER_PING', 12.971599, 77.594566, 'Koramangala 5th Block', 'Bengaluru', 'Karnataka'],
      ['GEO-04', 'CASE-2026-001', 'HAWALA_MEET_POINT', 17.385044, 78.486671, 'Charminar Old City', 'Hyderabad', 'Telangana']
    ];

    for (const g of geoEvents) {
      await client.query(
        `INSERT INTO geo_intel_events (id, case_id, event_type, latitude, longitude, location_name, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        g
      );
    }

    console.log('✅ PostgreSQL seeded with Indian crime & police records.');
  } finally {
    client.release();
  }
}

async function initNeo4j() {
  console.log('🌐 Initializing Neo4j AuraDB Graph Schema & Constraints...');
  const session = neo4jDriver.session();
  try {
    // 1. Constraints
    await session.run(`CREATE CONSTRAINT suspect_id_unique IF NOT EXISTS FOR (s:Suspect) REQUIRE s.id IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT account_number_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.account_number IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT phone_number_unique IF NOT EXISTS FOR (p:Phone) REQUIRE p.phone_number IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT ip_unique IF NOT EXISTS FOR (ip:IPAddress) REQUIRE ip.ip IS UNIQUE`);

    console.log('✅ Neo4j Constraints created.');

    console.log('🌱 Seeding Neo4j with Knowledge Graph & Blast Radius network...');

    // 2. Clear old demo nodes and seed fresh graph
    await session.run(`
      // Create Suspects (Indian Network)
      MERGE (s1:Suspect {id: 'SUS-01', name: 'Vikramaditya Shinde', alias: 'Vicky Bhai', role: 'Syndicate Kingpin', risk_level: 'CRITICAL', city: 'Mumbai'})
      MERGE (s2:Suspect {id: 'SUS-02', name: 'Alok Pandey', alias: 'Pandeyji', role: 'Hawala & Crypto Operator', risk_level: 'HIGH', city: 'New Delhi'})
      MERGE (s3:Suspect {id: 'SUS-03', name: 'Rohan Verma', alias: 'Chintu', role: 'Mule Account Recruiter', risk_level: 'MEDIUM', city: 'Noida'})
      MERGE (s4:Suspect {id: 'SUS-04', name: 'Meera Krishnan', alias: 'ByteQueen', role: 'Malware Developer & C2 Handler', risk_level: 'HIGH', city: 'Bengaluru'})
      MERGE (s5:Suspect {id: 'SUS-05', name: 'Sunil Yadav', alias: 'Sunny', role: 'SIM Farm Operator', risk_level: 'MEDIUM', city: 'Hyderabad'})

      // Create Accounts
      MERGE (a1:Account {account_number: 'SBIN0004921001', bank: 'SBI', holder: 'Rohan Verma', balance_inr: 45000})
      MERGE (a2:Account {account_number: 'HDFC0001829032', bank: 'HDFC', holder: 'Alok Pandey', balance_inr: 3200000})
      MERGE (a3:Account {account_number: 'ICIC0009981201', bank: 'ICICI', holder: 'Vikramaditya Shinde', balance_inr: 12500000})

      // Create Phone Numbers
      MERGE (p1:Phone {phone_number: '+91-9811099881', carrier: 'Jio', suspect_id: 'SUS-01'})
      MERGE (p2:Phone {phone_number: '+91-9822088772', carrier: 'Airtel', suspect_id: 'SUS-02'})
      MERGE (p3:Phone {phone_number: '+91-9833077663', carrier: 'Vodafone Idea', suspect_id: 'SUS-03'})

      // Create Cyber Assets & IPs
      MERGE (ip1:IPAddress {ip: '103.241.12.88', isp: 'ACT Fibernet', location: 'Bengaluru', status: 'ACTIVE_C2'})
      MERGE (ip2:IPAddress {ip: '49.36.18.102', isp: 'Jio 5G', location: 'Mumbai', status: 'PROXY_HOP'})

      // Create Case Node
      MERGE (c1:Case {id: 'CASE-2026-001', title: 'Operation Trishul', status: 'INVESTIGATING'})

      // Create Relationships (Financial Flow, Link Analysis, Attack Paths)
      MERGE (s3)-[:OPERATES_ACCOUNT]->(a1)
      MERGE (s2)-[:OPERATES_ACCOUNT]->(a2)
      MERGE (s1)-[:OPERATES_ACCOUNT]->(a3)

      MERGE (s1)-[:OWNS_DEVICE]->(p1)
      MERGE (s2)-[:OWNS_DEVICE]->(p2)
      MERGE (s3)-[:OWNS_DEVICE]->(p3)

      MERGE (p3)-[:COMMUNICATES_WITH {calls: 48, sms: 120, last_contact: '2026-08-28'}]->(p2)
      MERGE (p2)-[:COMMUNICATES_WITH {calls: 112, sms: 350, last_contact: '2026-08-30'}]->(p1)

      MERGE (a1)-[:TRANSFERRED_INR {amount: 450000, channel: 'UPI', date: '2026-08-25'}]->(a2)
      MERGE (a2)-[:TRANSFERRED_INR {amount: 2850000, channel: 'RTGS', date: '2026-08-27'}]->(a3)

      MERGE (s4)-[:CONTROLS_INFRA]->(ip1)
      MERGE (ip1)-[:ROUTES_TRAFFIC_THROUGH]->(ip2)
      MERGE (ip2)-[:TARGETS_INFRASTRUCTURE {attack_vector: 'SPEAR_PHISHING', severity: 'CRITICAL'}]->(c1)

      MERGE (s1)-[:IMPLICATED_IN {role: 'KINGPIN'}]->(c1)
      MERGE (s2)-[:IMPLICATED_IN {role: 'FINANCIAL_CHIEF'}]->(c1)
      MERGE (s3)-[:IMPLICATED_IN {role: 'MULE_RECRUITER'}]->(c1)
    `);

    console.log('✅ Neo4j Graph seeded with Indian syndicate knowledge graph & attack graph relationships.');
  } finally {
    await session.close();
  }
}

async function main() {
  try {
    console.log('🚀 Starting CrimeSync Database Setup (Phase 1)...');
    await initPostgres();
    await initNeo4j();
    console.log('\n🎉 Phase 1 Complete! Both databases are fully seeded with Indian law enforcement & syndicate data.');
  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    await pgPool.end();
    await neo4jDriver.close();
  }
}

main();
