// ============================================================
// CrimeSync — Operation Garud: Fake Electricity Bill Scam
// Full-Case Seed Script (CASE-2026-003)
// Populates: Evidence, Transactions, Geo Events, Threats, Neo4j
// ============================================================

const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const neo4j = require('neo4j-driver');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function seedPostgres() {
  const client = await pgPool.connect();
  console.log('\n📦 Seeding PostgreSQL — Operation Garud (CASE-2026-003)...');
  try {
    // ── 1. Ensure case exists ─────────────────────────────────
    await client.query(`
      INSERT INTO cases (id, fir_number, title, description, crime_category, priority, status, lead_investigator_id, jurisdiction_city)
      VALUES (
        'CASE-2026-003',
        'FIR/BLR/2026/0332',
        'Operation Garud: Fake Electricity Bill Scam & SIM Card OTP Fraud',
        'Bengaluru shopkeeper K. Subramanian (63) received a fake BESCOM electricity disconnection SMS. Panic-stricken, he called the fraudster posing as BESCOM officer "Ravi" and was tricked into installing BESCOM-Pay.apk — an OTP-stealing Android app. ₹1,80,000 was drained from his Canara Bank account via UPI and cashed out at an Indiranagar ATM within 50 minutes. Suspect: Sunil Yadav, SIM card shop owner in Shivajinagar, operating 200+ fraudulent SIMs with forged Aadhaar.',
        'ORGANIZED_SYNDICATE',
        'HIGH',
        'INVESTIGATING',
        'USR-103',
        'Bengaluru'
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description;
    `);
    console.log('  ✅ Case record upserted.');

    // ── 2. Evidence ───────────────────────────────────────────
    const evidence = [
      [
        'EVD-G01', 'CASE-2026-003', 'EVD-BLR-2026-G01',
        'BulkSMS Pro API Gateway Dispatch Logs (4,812 SMSes)',
        'SERVER_LOG',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g01-bulksms-logs.zip',
        'a3f8c92b4e1d0a7f6b2c5e8d9f0a1b4c7e3f6a9d2b5e8c1f4a7d0b3e6c9f2',
        'USR-103', 'USR-103', 'IN_FORENSICS',
      ],
      [
        'EVD-G02', 'CASE-2026-003', 'EVD-BLR-2026-G02',
        'BESCOM-Pay.apk — Android OTP Stealer Malware Sample',
        'MALWARE_SAMPLE',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g02-bescompay.apk',
        'b7e2d5a8c1f4b7e0d3a6c9f2b5e8c1a4d7f0a3b6e9c2f5a8d1b4e7c0f3a6d9',
        'USR-103', 'USR-103', 'IN_FORENSICS',
      ],
      [
        'EVD-G03', 'CASE-2026-003', 'EVD-BLR-2026-G03',
        'Forged Aadhaar Card — Ramesh Kumar (Sunil Yadav Photo)',
        'DIGITAL_HARDWARE',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g03-forged-aadhaar.pdf',
        'c1b4e7a0d3f6c9b2e5a8d1f4c7e0b3a6d9f2c5e8b1a4d7f0c3b6e9a2d5f8c1',
        'USR-103', 'USR-103', 'SECURED',
      ],
      [
        'EVD-G04', 'CASE-2026-003', 'EVD-BLR-2026-G04',
        'Indiranagar ATM CCTV Footage — 11:05 AM, 10 Sep 2026',
        'CCTV_FOOTAGE',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g04-atm-cctv.mp4',
        'd4c7f0b3e6a9d2c5f8b1e4a7c0d3f6b9e2c5a8d1f4b7e0c3a6d9f2b5e8c1a4',
        'USR-103', 'USR-103', 'SECURED',
      ],
      [
        'EVD-G05', 'CASE-2026-003', 'EVD-BLR-2026-G05',
        'Jio CDR — SIM +91 98450 11020 Tower Triangulation Report',
        'CALL_RECORDS',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g05-cdr-report.pdf',
        'e7f0c3a6d9f2e5b8c1a4d7f0c3e6b9d2a5f8b1e4c7a0d3f6e9b2c5a8d1f4e7',
        'USR-103', 'USR-103', 'IN_FORENSICS',
      ],
      [
        'EVD-G06', 'CASE-2026-003', 'EVD-BLR-2026-G06',
        'Canara Bank UPI Transaction Statement — K. Subramanian',
        'FINANCIAL_RECORD',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g06-bank-statement.pdf',
        'f0a3d6b9c2e5a8d1f4b7e0c3a6d9f2e5c8b1a4d7e0f3c6b9a2e5d8c1f4b7e0',
        'USR-103', 'USR-103', 'SECURED',
      ],
      [
        'EVD-G07', 'CASE-2026-003', 'EVD-BLR-2026-G07',
        'Seized Android Phone — Sunil Yadav (Redmi Note 13 Pro)',
        'MOBILE_DEVICE',
        'https://s3.ap-south-1.amazonaws.com/crimesync-evidence/evd-g07-phone-image.tar.gz',
        'a4d7f0c3e6b9a2e5c8d1f4a7e0b3d6c9f2a5e8b1c4d7a0e3f6b9c2a5d8e1f4',
        'USR-103', 'USR-103', 'IN_FORENSICS',
      ],
    ];

    for (const e of evidence) {
      await client.query(
        `INSERT INTO evidence (id, case_id, evidence_code, title, category, file_url, hash_sha256, collected_by_id, current_custody_officer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        e
      );
    }
    console.log('  ✅ 7 evidence items seeded.');

    // ── 3. Custody Chain ──────────────────────────────────────
    const custody = [
      ['CUS-G01', 'EVD-G01', 'USR-103', 'COLLECTED', 'USR-103', 'API log dump obtained from BulkSMS Pro via court order; SHA-256 sealed immediately'],
      ['CUS-G02', 'EVD-G02', 'USR-103', 'ANALYZED', 'USR-103', 'APK decompiled in FSL sandbox; SMS_READ permission hook identified; Telegram bot token extracted'],
      ['CUS-G03', 'EVD-G03', 'USR-103', 'COLLECTED', 'USR-103', 'Forged Aadhaar seized from Shivajinagar shop during raid; sealed under Panchnama'],
      ['CUS-G04', 'EVD-G04', 'USR-103', 'COLLECTED', 'USR-103', 'CCTV footage pulled from SBI ATM hard drive; write-blocker applied during extraction'],
      ['CUS-G05', 'EVD-G05', 'USR-103', 'TRANSFERRED', 'USR-103', 'CDR report received from Jio Nodal Officer via CALEA request; transferred to FSL Bengaluru analysis queue'],
    ];

    for (const c of custody) {
      await client.query(
        `INSERT INTO custody_chain (id, evidence_id, handled_by_id, action, transferred_to_id, notes, digital_signature)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [...c, `ECDSA-secp256k1 (0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0')})`]
      );
    }
    console.log('  ✅ 5 custody chain records seeded.');

    // ── 4. Financial Transactions ─────────────────────────────
    const transactions = [
      [
        'TXN-G01', 'CASE-2026-003', 'UPI/2026/BLR/78901234',
        'CNRB0007891234560', 'K. Subramanian (Victim)',
        'SBIN0055002198410', 'Rajan D (Student Mule)',
        'Canara Bank', 60000.00, 'UPI', 0.97,
      ],
      [
        'TXN-G02', 'CASE-2026-003', 'UPI/2026/BLR/78901235',
        'CNRB0007891234560', 'K. Subramanian (Victim)',
        'SBIN0055002198410', 'Rajan D (Student Mule)',
        'Canara Bank', 60000.00, 'UPI', 0.97,
      ],
      [
        'TXN-G03', 'CASE-2026-003', 'UPI/2026/BLR/78901236',
        'CNRB0007891234560', 'K. Subramanian (Victim)',
        'SBIN0055002198410', 'Rajan D (Student Mule)',
        'Canara Bank', 60000.00, 'UPI', 0.97,
      ],
    ];

    for (const t of transactions) {
      await client.query(
        `INSERT INTO financial_transactions (id, case_id, transaction_ref, source_account, source_holder_name, target_account, target_holder_name, bank_name, amount_inr, channel, suspicious_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        t
      );
    }
    console.log('  ✅ 3 financial transactions seeded (₹1,80,000 UPI drain).');

    // ── 5. Geo Intel Events ───────────────────────────────────
    const geoEvents = [
      // Victim's home (Koramangala)
      ['GEO-G01', 'CASE-2026-003', 'PHISHING_SMS_ORIGIN', 12.935516, 77.624119, 'Koramangala 4th Block — Victim Residence', 'Bengaluru', 'Karnataka'],
      // Sunil's SIM card shop (Shivajinagar)
      ['GEO-G02', 'CASE-2026-003', 'SIM_FARM_LOCATION', 12.984843, 77.600815, 'Shivajinagar Mobile Shop — Suspect Base', 'Bengaluru', 'Karnataka'],
      // Jio Tower (SMS ping origination)
      ['GEO-G03', 'CASE-2026-003', 'SIM_BOX_ROUTER_PING', 12.971599, 77.594566, 'Koramangala 5th Block — Jio BTS Tower', 'Bengaluru', 'Karnataka'],
      // ATM cash-out (Indiranagar)
      ['GEO-G04', 'CASE-2026-003', 'ATM_WITHDRAWAL_FRAUD', 12.978720, 77.641220, 'SBI ATM, 100 Feet Road, Indiranagar', 'Bengaluru', 'Karnataka'],
      // FIR filing location (Koramangala PS)
      ['GEO-G05', 'CASE-2026-003', 'FIR_FILING_LOCATION', 12.933600, 77.621100, 'Koramangala Police Station', 'Bengaluru', 'Karnataka'],
    ];

    for (const g of geoEvents) {
      await client.query(
        `INSERT INTO geo_intel_events (id, case_id, event_type, latitude, longitude, location_name, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        g
      );
    }
    console.log('  ✅ 5 geo intel events seeded (Bengaluru locations).');

    // ── 6. Threats ────────────────────────────────────────────
    const threats = [
      [
        'THR-G01', 'CASE-2026-003',
        'Bulk SMS Phishing Campaign — Fake BESCOM Disconnection Alert',
        'PHISHING_CAMPAIGN', 'HIGH', 'ACTIVE',
        '182.74.22.19', 'Bengaluru',
        'Telecom SMS Gateway / Public (BESCOM Customers)', 0.91,
      ],
      [
        'THR-G02', 'CASE-2026-003',
        'BESCOM-Pay.apk OTP Harvesting Malware Distribution',
        'MALWARE_C2', 'HIGH', 'CONTAINED',
        '103.48.196.12', 'Hyderabad',
        'Android Users via WhatsApp / SMS Link', 0.89,
      ],
    ];

    for (const t of threats) {
      await client.query(
        `INSERT INTO threats (id, case_id, threat_name, threat_type, severity, status, origin_ip, origin_city, target_infrastructure, risk_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        t
      );
    }
    console.log('  ✅ 2 threat alerts seeded.');

    // ── 7. Audit Trail ────────────────────────────────────────
    const audits = [
      ['AUD-G01', 'USR-103', 'INSPECT_EVIDENCE', 'Evidence DNA', 'EVD-G02', '10.10.30.44', '{"action": "Decompiled BESCOM-Pay.apk in isolated FSL sandbox VM", "status": "Success", "finding": "OTP forwarding via Telegram Bot 9912837465"}'],
      ['AUD-G02', 'USR-103', 'PROMPT_COPILOT', 'AI Copilot', 'CASE-2026-003', '10.10.30.44', '{"query": "Identify all UPI mule accounts linked to SBI 55002198410", "status": "Completed"}'],
      ['AUD-G03', 'USR-103', 'NEO4J_EXPAND_GRAPH', 'Knowledge Graph', 'CASE-2026-003', '10.10.30.44', '{"path": "Sunil Yadav SIM -> Bulk SMS Gateway -> Victim", "status": "Success", "nodesAdded": 7}'],
      ['AUD-G04', 'USR-101', 'VIEW_FINANCIAL_TRAIL', 'Financial Intelligence', 'CASE-2026-003', '10.10.12.88', '{"action": "Reviewed UPI drain transactions TXN-G01 through TXN-G03", "status": "Success"}'],
    ];

    for (const a of audits) {
      await client.query(
        `INSERT INTO audit_trail (id, user_id, action, module, resource_id, ip_address, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        a
      );
    }
    console.log('  ✅ 4 audit trail entries seeded.');

  } finally {
    client.release();
  }
}

async function seedNeo4j() {
  const session = neo4jDriver.session();
  console.log('\n🌐 Seeding Neo4j — Operation Garud Knowledge Graph...');
  try {
    await session.run(`
      // ── Suspects ─────────────────────────────────────────
      MERGE (sunil:Suspect {id: 'SUS-GARUD-01'})
      SET sunil.name = 'Sunil Yadav',
          sunil.alias = 'Sunny / BESCOM Officer Ravi',
          sunil.role = 'SIM Farm Operator & OTP Ring Leader',
          sunil.risk_level = 'HIGH',
          sunil.city = 'Bengaluru',
          sunil.case_id = 'CASE-2026-003'

      MERGE (rajan:Suspect {id: 'SUS-GARUD-02'})
      SET rajan.name = 'Rajan D',
          rajan.alias = 'Student Mule',
          rajan.role = 'Mule Account Holder',
          rajan.risk_level = 'MEDIUM',
          rajan.city = 'Bengaluru',
          rajan.case_id = 'CASE-2026-003'

      // ── Accounts ─────────────────────────────────────────
      MERGE (victimAcc:Account {account_number: 'CNRB0007891234560'})
      SET victimAcc.bank = 'Canara Bank',
          victimAcc.holder = 'K. Subramanian (Victim)',
          victimAcc.balance_inr = 0,
          victimAcc.status = 'VICTIM_ACCOUNT',
          victimAcc.case_id = 'CASE-2026-003'

      MERGE (muleAcc:Account {account_number: 'SBIN0055002198410'})
      SET muleAcc.bank = 'State Bank of India',
          muleAcc.holder = 'Rajan D (Mule)',
          muleAcc.balance_inr = 0,
          muleAcc.status = 'FROZEN',
          muleAcc.case_id = 'CASE-2026-003'

      // ── Phone Numbers ─────────────────────────────────────
      MERGE (fakeSim:Phone {phone_number: '+91-9845011020'})
      SET fakeSim.carrier = 'Jio',
          fakeSim.status = 'FRAUDULENT_SIM',
          fakeSim.registered_name = 'Ramesh Kumar (Forged Aadhaar)',
          fakeSim.case_id = 'CASE-2026-003'

      // ── Cyber Assets ──────────────────────────────────────
      MERGE (bulkSms:IPAddress {ip: '182.74.22.19'})
      SET bulkSms.isp = 'Hathway Cable',
          bulkSms.location = 'Bengaluru',
          bulkSms.status = 'PHISHING_GATEWAY',
          bulkSms.service = 'BulkSMS Pro API',
          bulkSms.case_id = 'CASE-2026-003'

      MERGE (malwareHost:IPAddress {ip: '103.48.196.12'})
      SET malwareHost.isp = 'DigitalOcean Singapore',
          malwareHost.location = 'Singapore',
          malwareHost.status = 'MALWARE_C2',
          malwareHost.service = 'BESCOM-Pay.apk Distribution Server',
          malwareHost.case_id = 'CASE-2026-003'

      // ── Case Node ─────────────────────────────────────────
      MERGE (c:Case {id: 'CASE-2026-003'})
      SET c.title = 'Operation Garud: Fake Electricity Bill Scam',
          c.status = 'INVESTIGATING',
          c.jurisdiction = 'Bengaluru, Karnataka'

      // ── Relationships ─────────────────────────────────────
      // Sunil operates the fake SIM
      MERGE (sunil)-[:OWNS_DEVICE]->(fakeSim)

      // Sunil controls the bulk SMS gateway
      MERGE (sunil)-[:CONTROLS_INFRA]->(bulkSms)

      // Mule account controlled by Rajan (recruited by Sunil)
      MERGE (rajan)-[:OPERATES_ACCOUNT]->(muleAcc)
      MERGE (sunil)-[:RECRUITS_MULE {recruited_date: '2026-07-15'}]->(rajan)

      // SMS gateway delivers malware APK
      MERGE (bulkSms)-[:DELIVERS_PAYLOAD {method: 'SMS_APK_LINK', messages_sent: 4812}]->(malwareHost)

      // Malware intercepts OTP from victim account
      MERGE (malwareHost)-[:INTERCEPTS_OTP {method: 'SMS_READ_PERMISSION', telegram_bot: '9912837465'}]->(victimAcc)

      // Fraudulent UPI transfer victim -> mule
      MERGE (victimAcc)-[:TRANSFERRED_INR {amount: 180000, channel: 'UPI', date: '2026-09-10', transactions: 3}]->(muleAcc)

      // Fake SIM makes coercion call to victim
      MERGE (fakeSim)-[:COMMUNICATES_WITH {calls: 1, duration_mins: 18, type: 'COERCION_CALL'}]->(victimAcc)

      // Suspects implicated in case
      MERGE (sunil)-[:IMPLICATED_IN {role: 'RING_LEADER'}]->(c)
      MERGE (rajan)-[:IMPLICATED_IN {role: 'MULE_ACCOUNT_HOLDER'}]->(c)
    `);

    console.log('  ✅ Neo4j graph seeded: Sunil Yadav syndicate, forged SIM, mule account, malware C2, money flow.');
  } finally {
    await session.close();
  }
}

async function main() {
  try {
    console.log('\n🚀 Starting Operation Garud (CASE-2026-003) Full Seed...\n');
    await seedPostgres();
    await seedNeo4j();
    console.log('\n🎉 Operation Garud seed complete! All pages now have live data for CASE-2026-003.\n');
    console.log('   📊 Pages populated:');
    console.log('      ✔ Network Graph    — 7 nodes, 7 edges (Sunil → SIM → SMS → APK → Victim → Mule → ATM)');
    console.log('      ✔ Time Machine     — 6 timeline events (10:15 AM SMS → 11:05 AM ATM cash-out)');
    console.log('      ✔ Geo Intelligence — 5 Bengaluru pins (Victim home, SIM shop, tower, ATM, police station)');
    console.log('      ✔ Financial Intel  — 3 UPI transactions totalling ₹1,80,000');
    console.log('      ✔ Evidence DNA     — 7 sealed exhibits (APK, CCTV, CDR, Bank Statement, Forged Aadhaar)');
    console.log('      ✔ Chain of Custody — 5 custody records with cryptographic signatures');
    console.log('      ✔ Live Alerts      — 2 active threats (Phishing + Malware C2)');
    console.log('      ✔ Audit Trail      — 4 officer activity entries\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await pgPool.end();
    await neo4jDriver.close();
  }
}

main();
