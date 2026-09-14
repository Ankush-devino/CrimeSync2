// =============================================================
// CrimeSync — Operation Task Trap: Fake YouTube Like Job Scam
// Full-Case Seed Script (CASE-2026-010)
// Populates: Cases, Evidence, Financial Transactions, Geo Events, Neo4j
// Matches exact schema in server/src/config/schema.sql
// =============================================================

const { Pool } = require('pg');
const neo4j = require('neo4j-driver');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

const CASE_ID = 'CASE-2026-010';

// ──────────────────────────────────────────────────────────────
// CASE RECORD
// cases(id, fir_number, title, description, crime_category,
//        priority, status, lead_investigator_id, jurisdiction_city)
// ──────────────────────────────────────────────────────────────
async function upsertCase(client) {
  console.log('\n📁 Upserting case record…');
  // Use USR-102 as lead investigator (Inspector Priya Kulkarni from existing seed)
  await client.query(`
    INSERT INTO cases (
      id, fir_number, title, description,
      crime_category, priority, status,
      lead_investigator_id, jurisdiction_city
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      title              = EXCLUDED.title,
      description        = EXCLUDED.description,
      priority           = EXCLUDED.priority,
      status             = EXCLUDED.status,
      jurisdiction_city  = EXCLUDED.jurisdiction_city
  `, [
    CASE_ID,
    'FIR/BLR/2026/0910',
    'Operation Task Trap: Fake YouTube Like Job Scam',
    'College student Pooja (21, Bengaluru) defrauded of ₹5,00,000 via a fake "earn by liking YouTube videos" Telegram scam. Kingpin Rohit Verma (Mewat) traced via IMEI cross-case match to Jamtara FIR/2024/0882. Two money mules used to layer funds across Canara Bank and ICICI Bank. ₹1,80,000 cashed out at Jaipur ATM — mule face clearly identified from CCTV.',
    'FINANCIAL_FRAUD',
    'HIGH',
    'INVESTIGATING',
    'USR-102',           // lead investigator FK
    'Bengaluru',
  ]);
  console.log('  ✅ Case upserted');
}

// ──────────────────────────────────────────────────────────────
// EVIDENCE
// evidence(id, case_id, evidence_code, title, category,
//          file_url, hash_sha256, collected_by_id,
//          current_custody_officer_id, status)
// valid categories: DIGITAL_HARDWARE | MOBILE_DEVICE | BANK_STATEMENT
//                   CALL_RECORD | SERVER_LOG | FORENSIC_IMAGE | CCTV_FOOTAGE
// valid statuses:   SECURED | IN_FORENSICS | COURT_SUBMITTED | ARCHIVED
// ──────────────────────────────────────────────────────────────
async function seedEvidence(client) {
  console.log('\n📂 Seeding evidence vault…');

  // Clean old evidence for this case
  await client.query('DELETE FROM evidence WHERE case_id = $1', [CASE_ID]);

  const evidence = [
    {
      id: 'EVD-T01',
      case_id: CASE_ID,
      evidence_code: 'TT-EVD-001',
      title: 'WhatsApp Chat Export — Initial Scam Lure Message (Spoofed US Number +1-202-555-0143)',
      category: 'SERVER_LOG',
      sub_type: 'WHATSAPP_CHAT_METRIC',
      file_url: 's3://crimesync-forensic-vault/blr/whatsapp_chat_export_case010.enc',
      hash_sha256: '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      ai_fingerprint: 'WTS-010A-9941-2201',
      block_height: 19842611,
      tx_hash: '0x9a10283749102837491028374910283749102837491028374910283749102837',
      merkle_root: '0x12b9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa7',
      metadata: {
        sourceApp: 'WhatsApp Meta Core',
        originNumber: '+1-202-555-0143 (VoIP)',
        recipient: 'Pooja R. (+91-98450-XXXXX)',
        chainOfCustody: 'Extracted directly from victim handset under Section 65B BSA 2023',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'State Forensic Science Laboratory (FSL) Bengaluru',
          vaultRoom: 'Digital Forensics Clean Vault Level -1',
          storageUnit: 'Sealed Digital Storage Safe #DFS-02',
          shelfLocation: 'Rack #02, Box #WTS-010',
          physicalLockerNumber: 'Locker #VAULT-0101',
          cloudVaultUri: 's3://crimesync-forensic-vault/blr/whatsapp_chat_export_case010.enc',
          ipfsHash: 'ipfs://QmWts010ExportHash11223344556677889900',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-102',
      current_custody_officer_id: 'USR-102',
      status: 'SECURED'
    },
    {
      id: 'EVD-T02',
      case_id: CASE_ID,
      evidence_code: 'TT-EVD-002',
      title: 'Telegram Chat Export — @crypto_tasks_admin VIP Group & Fake Balance Dashboard',
      category: 'SERVER_LOG',
      sub_type: 'TELEGRAM_CHANNEL_DUMP',
      file_url: 's3://crimesync-forensic-vault/blr/telegram_vip_tasks_case010.enc',
      hash_sha256: '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
      ai_fingerprint: 'TLG-010B-8832-1104',
      block_height: 19842612,
      tx_hash: '0x8819203948571029384759201938475819203948571029384759201938475819',
      merkle_root: '0x23c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984bb8',
      metadata: {
        channelName: '@vip_yt_tasks',
        adminHandle: '@crypto_tasks_admin',
        botCount: 218,
        fakeDashboardUrl: 'https://task-rewards-vip.xyz',
        chainOfCustody: 'Full JSON & Media Dump forensically mirrored via UFED Touch',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'Cyber Crime Investigation Cell (CCIC) Bengaluru',
          vaultRoom: 'Digital Forensics Vault #03',
          storageUnit: 'High-Density Encrypted NAS SAN-02',
          shelfLocation: 'Volume #TLG-010',
          physicalLockerNumber: 'Locker #DIG-BLR-0102',
          cloudVaultUri: 's3://crimesync-forensic-vault/blr/telegram_vip_tasks_case010.enc',
          ipfsHash: 'ipfs://QmTelegram010DumpHash9988776655443322',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-102',
      current_custody_officer_id: 'USR-102',
      status: 'SECURED'
    },
    {
      id: 'EVD-T03',
      case_id: CASE_ID,
      evidence_code: 'TT-EVD-003',
      title: 'Victim\'s SBI Bank Statement — Pooja R. (3 UPI Transfers: ₹5,00,000 + ₹150 Bait Credit)',
      category: 'BANK_STATEMENT',
      sub_type: 'NPCI_UPI_CORE_LEDGER',
      file_url: 's3://crimesync-forensic-vault/blr/sbi_statement_pooja_case010.enc',
      hash_sha256: '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      ai_fingerprint: 'BNK-010C-7721-4490',
      block_height: 19842613,
      tx_hash: '0x7719283749102938471029384710293847102938471029384710293847102938',
      merkle_root: '0x34c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984cc9',
      metadata: {
        accountNumber: 'SBIN00481920194',
        accountHolder: 'Pooja R.',
        bankName: 'State Bank of India',
        totalDefrauded: '₹5,00,000 (Tranches: ₹50K, ₹2.5L, ₹2L)',
        baitCredit: '₹150 (UPI/260912111500)',
        chainOfCustody: 'Certified by SBI Branch Manager under Section 65B Indian Evidence Act',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'CID Economic Offences Evidence Repository',
          vaultRoom: 'Financial Forensics Archive #01',
          storageUnit: 'Fireproof Banking Evidence Safe #BNK-09',
          shelfLocation: 'Drawer #10, Binder #SBI-010',
          physicalLockerNumber: 'Locker #BNK-BLR-0103',
          cloudVaultUri: 's3://crimesync-forensic-vault/blr/sbi_statement_pooja_case010.enc',
          ipfsHash: 'ipfs://QmSbiStatement010Hash77665544332211',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-102',
      current_custody_officer_id: 'USR-102',
      status: 'SECURED'
    },
    {
      id: 'EVD-T04',
      case_id: CASE_ID,
      evidence_code: 'TT-EVD-004',
      title: 'Jaipur ATM CCTV Video Frame & Slip — ICICI Bank MI Road (Rahul Sharma Identified)',
      category: 'CCTV_FOOTAGE',
      sub_type: 'ATM_CCTV_4K_ANPR',
      file_url: 's3://crimesync-forensic-vault/jpr/icici_atm_cctv_rahul_sharma_case010.enc',
      hash_sha256: '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
      ai_fingerprint: 'CCT-010D-6610-8822',
      block_height: 19842614,
      tx_hash: '0x6610293847592019384758192039485710293847592019384758192039485710',
      merkle_root: '0x45c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984dd0',
      metadata: {
        atmLocation: 'ICICI Bank ATM Kiosk, MI Road, Jaipur',
        withdrawalAmount: '₹1,80,000 (9 transactions of ₹20,000)',
        withdrawalTimestamp: '13-Sep-2026 12:15 PM IST',
        faceMatchConfidence: '96.4% match to Rahul Sharma (Aadhaar KYC photo)',
        cameraResolution: '4K Ultra-HD Optical IR',
        chainOfCustody: 'Seized by Jaipur Cyber Police via Section 91 CrPC Notice',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'Jaipur Cyber Crime Police Station Evidence Vault',
          vaultRoom: 'Video Telemetry Vault #02',
          storageUnit: 'Sealed Optical Media Safe #CCTV-04',
          shelfLocation: 'Cabinet #JPR-01, Tray #CCTV-010',
          physicalLockerNumber: 'Locker #CCT-JPR-0104',
          cloudVaultUri: 's3://crimesync-forensic-vault/jpr/icici_atm_cctv_rahul_sharma_case010.enc',
          ipfsHash: 'ipfs://QmAtmCctv010Hash5544332211009988',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-102',
      current_custody_officer_id: 'USR-102',
      status: 'SECURED'
    },
    {
      id: 'EVD-T05',
      case_id: CASE_ID,
      evidence_code: 'TT-EVD-005',
      title: 'CDR / IMEI Cross-Case Match Report — Burner SIM to Rohit Verma (Jamtara FIR Link)',
      category: 'CALL_RECORD',
      sub_type: 'IMEI_CROSS_CORRELATION',
      file_url: 's3://crimesync-forensic-vault/del/imei_cross_match_rohit_verma_case010.enc',
      hash_sha256: '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
      ai_fingerprint: 'CDR-010E-5509-3311',
      block_height: 19842615,
      tx_hash: '0x5519283749102938471029384710293847102938471029384710293847102938',
      merkle_root: '0x56c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984ee1',
      metadata: {
        handsetImei: '867381024917624',
        burnerSim: '+91-96500-71028 (Airtel Pre-paid)',
        primarySuspect: 'Rohit Verma (Alias: @crypto_tasks_admin / Ricky Boss)',
        suspectLocation: 'Nuh / Tauru Cyber Hub, Mewat, Haryana',
        crossCaseLink: 'FIR/JAM/2024/0882 (Jamtara Cyber Fraud Syndicate)',
        correlationConfidence: '94.2% AI Handset Behavioral Match',
        chainOfCustody: 'Department of Telecom (DoT) LIMS & Section 91 CrPC CDR Dump',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'National Cyber Crime Forensics Repository (New Delhi HQ)',
          vaultRoom: 'Telecom & IPDR Archive Room #05',
          storageUnit: 'EMP-Proof High Security Enclosure #CDR-12',
          shelfLocation: 'Rack #CDR-01, Binder #010',
          physicalLockerNumber: 'Locker #CDR-DEL-0105',
          cloudVaultUri: 's3://crimesync-forensic-vault/del/imei_cross_match_rohit_verma_case010.enc',
          ipfsHash: 'ipfs://QmImeiMatch010Hash3322110099887766',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    },
  ];

  for (const ev of evidence) {
    await client.query(`
      INSERT INTO evidence (
        id, case_id, evidence_code, title, category, sub_type,
        file_url, hash_sha256, ai_fingerprint, block_height, tx_hash, merkle_root, metadata,
        collected_by_id, current_custody_officer_id, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    `, [
      ev.id, ev.case_id, ev.evidence_code, ev.title, ev.category, ev.sub_type,
      ev.file_url, ev.hash_sha256, ev.ai_fingerprint, ev.block_height, ev.tx_hash, ev.merkle_root, JSON.stringify(ev.metadata),
      ev.collected_by_id, ev.current_custody_officer_id, ev.status
    ]);
    console.log(`  ✅ Evidence: ${ev.id} — ${ev.title.substring(0, 55)}…`);
  }
}

// ──────────────────────────────────────────────────────────────
// FINANCIAL TRANSACTIONS
// ──────────────────────────────────────────────────────────────
async function seedTransactions(client) {
  console.log('\n💸 Seeding financial transactions…');
  await client.query('DELETE FROM financial_transactions WHERE case_id = $1', [CASE_ID]);

  const txns = [
    // Trust bait ₹150 from scammer to victim
    [
      'TXN-T00', CASE_ID, 'UPI/260912111500',
      'SCAMMER-GPAY-BAIT', 'Scammer Trust Builder (GPay)',
      'SBIN00481920194',    'Pooja R. (Victim SBI)',
      'State Bank of India', 150, 'UPI', 75,
      '2026-09-12T11:15:00Z',
    ],
    // Transfer 1 — ₹50,000 (Day 1, 14:00 IST)
    [
      'TXN-T01', CASE_ID, 'UPI/260912140001',
      'SBIN00481920194',   'Pooja R. (Victim SBI)',
      'CNRB00011029481',   'Amit Kumar (Canara Mule 1)',
      'Canara Bank', 50000, 'UPI', 92,
      '2026-09-12T14:00:00Z',
    ],
    // Transfer 2 — ₹2,50,000 (Day 2, 09:30 IST)
    [
      'TXN-T02', CASE_ID, 'UPI/260913093002',
      'SBIN00481920194',    'Pooja R. (Victim SBI)',
      'CNRB00011029481',   'Amit Kumar (Canara Mule 1)',
      'Canara Bank', 250000, 'UPI', 96,
      '2026-09-13T09:30:00Z',
    ],
    // Transfer 3 — ₹2,00,000 (Day 2, 11:45 IST)
    [
      'TXN-T03', CASE_ID, 'UPI/260913114503',
      'SBIN00481920194',   'Pooja R. (Victim SBI)',
      'ICIC00088419203',   'Rahul Sharma (ICICI Mule 2)',
      'ICICI Bank', 200000, 'UPI', 98,
      '2026-09-13T11:45:00Z',
    ],
    // ATM Cash-out ₹1,80,000 — Mule 2 in Jaipur (Day 2, 12:15 IST)
    [
      'TXN-T04', CASE_ID, 'ATM/JPR/2026/0913/1215',
      'ICIC00088419203',   'Rahul Sharma (ICICI Mule 2)',
      'CASH-ATM-JAIPUR',   'Rahul Sharma / Cash Handover',
      'ICICI Bank', 180000, 'IMPS', 99,
      '2026-09-13T12:15:00Z',
    ],
  ];

  for (const txn of txns) {
    await client.query(`
      INSERT INTO financial_transactions (
        id, case_id, transaction_ref,
        source_account, source_holder_name,
        target_account, target_holder_name,
        bank_name, amount_inr, channel, suspicious_score, timestamp
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, txn);
    console.log(`  ✅ Transaction: ${txn[0]} — ₹${Number(txn[8]).toLocaleString('en-IN')} via ${txn[9]}`);
  }
}

// ──────────────────────────────────────────────────────────────
// GEO INTEL EVENTS — Exactly 3 Pins
// ──────────────────────────────────────────────────────────────
async function seedGeoEvents(client) {
  console.log('\n🗺️  Seeding geo intel events (3 Pins)…');
  await client.query('DELETE FROM geo_intel_events WHERE case_id = $1', [CASE_ID]);

  const geoEvents = [
    ['GEO-T01', CASE_ID, 'CRIME_SCENE', 12.9352, 77.6245,
     'Bengaluru (Victim) — WhatsApp Hook & UPI Fraud Node (₹5,00,000 Lost)', 'Bengaluru', 'Karnataka'],
    ['GEO-T02', CASE_ID, 'RAID_TARGET', 28.1070, 76.9980,
     'Mewat/Nuh (Rohit\'s Tower Cluster) — IMEI Triangulated Operations Hub', 'Nuh', 'Haryana'],
    ['GEO-T03', CASE_ID, 'CCTV_DETECTION', 26.9124, 75.7873,
     'Jaipur (ATM Cashout) — ₹1,80,000 Withdrawn (CCTV Match: Rahul Sharma)', 'Jaipur', 'Rajasthan'],
  ];

  for (const geo of geoEvents) {
    await client.query(`
      INSERT INTO geo_intel_events (
        id, case_id, event_type, latitude, longitude,
        location_name, city, state
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, geo);
    console.log(`  ✅ Geo Event: ${geo[0]} — ${geo[5].substring(0, 45)}…`);
  }
}

// ──────────────────────────────────────────────────────────────
// NEO4J GRAPH
// ──────────────────────────────────────────────────────────────
async function seedNeo4j() {
  console.log('\n🕸️  Seeding Neo4j graph (Operation Task Trap)…');
  const session = driver.session();
  try {
    await session.run(`
      MERGE (rohit:Person {id: 'rohit_v_task_trap'})
      SET rohit.name = 'Rohit Verma',
          rohit.alias = '@crypto_tasks_admin',
          rohit.role = 'Syndicate Kingpin',
          rohit.riskScore = 89,
          rohit.location = 'Nuh, Mewat, Haryana',
          rohit.caseId = $caseId

      MERGE (telegram:CyberEntity {id: 'telegram_task_trap'})
      SET telegram.name = 'Telegram: @crypto_tasks_admin',
          telegram.type = 'Phishing Channel',
          telegram.caseId = $caseId

      MERGE (site:CyberEntity {id: 'phish_site_task_trap'})
      SET site.name = 'task-rewards-vip.xyz',
          site.type = 'Fake Crypto Portal',
          site.caseId = $caseId

      MERGE (pooja:Person {id: 'victim_pooja_task_trap'})
      SET pooja.name = 'Pooja',
          pooja.role = 'Victim',
          pooja.lossInr = 500000,
          pooja.location = 'Koramangala, Bengaluru',
          pooja.caseId = $caseId

      MERGE (canara:BankAccount {id: 'mule_canara_task_trap'})
      SET canara.accountNumber = '****1102',
          canara.bank = 'Canara Bank',
          canara.holder = 'Amit Kumar',
          canara.role = 'Mule Layer-1',
          canara.receivedInr = 300000,
          canara.caseId = $caseId

      MERGE (icici:BankAccount {id: 'mule_icici_task_trap'})
      SET icici.accountNumber = '****8841',
          icici.bank = 'ICICI Bank',
          icici.holder = 'Rahul Sharma',
          icici.role = 'Mule Layer-1',
          icici.receivedInr = 200000,
          icici.caseId = $caseId

      MERGE (atm:Location {id: 'atm_jaipur_task_trap'})
      SET atm.name = 'ICICI ATM Malviya Nagar',
          atm.city = 'Jaipur',
          atm.cashOutInr = 180000,
          atm.caseId = $caseId

      MERGE (rohit)-[:OPERATES_CHANNEL  {label: 'Runs Fake VIP Group'}]->(telegram)
      MERGE (rohit)-[:CONTROLS_SERVER   {label: 'Admin Credentials'}]->(site)
      MERGE (telegram)-[:RECRUITED_VICTIM {label: '₹150 Trust Bait'}]->(pooja)
      MERGE (site)-[:DISPLAYED_FAKE_BALANCE {label: 'Showed ₹14.2L Profit'}]->(pooja)
      MERGE (pooja)-[:UPI_TRANSFER   {amountInr: 300000, label: '₹3,00,000'}]->(canara)
      MERGE (pooja)-[:UPI_TRANSFER   {amountInr: 200000, label: '₹2,00,000'}]->(icici)
      MERGE (icici)-[:CASH_WITHDRAWAL {amountInr: 180000, label: '₹1,80,000 ATM Cash-out'}]->(atm)
      MERGE (rohit)-[:CONTROLS_MULE  {label: 'Recruited Amit Kumar'}]->(canara)
      MERGE (rohit)-[:CONTROLS_MULE  {label: 'Recruited Rahul Sharma'}]->(icici)
    `, { caseId: CASE_ID });
    console.log('  ✅ Neo4j graph seeded for Operation Task Trap');
  } finally {
    await session.close();
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 CrimeSync — Operation Task Trap Seed (CASE-2026-010)');
  console.log('='.repeat(55));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await upsertCase(client);
    await seedEvidence(client);
    await seedTransactions(client);
    await seedGeoEvents(client);

    await client.query('COMMIT');
    console.log('\n✅  PostgreSQL seed committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ PostgreSQL seed FAILED — rolled back:', err.message);
    throw err;
  } finally {
    client.release();
  }

  try {
    await seedNeo4j();
  } catch (err) {
    console.error('⚠️  Neo4j seed failed (non-fatal):', err.message);
  }

  await pool.end();
  await driver.close();

  console.log('\n🎉  Operation Task Trap fully seeded!');
  console.log('   Select CASE-2026-010 in the CrimeSync case switcher to view the full story.');
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
