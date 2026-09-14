// =============================================================
// CrimeSync — Operation Parcel Trap: FedEx Digital Arrest Scam
// Full-Case Seed Script (CASE-2026-011)
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

const CASE_ID = 'CASE-2026-011';

// ──────────────────────────────────────────────────────────────
// CASE RECORD
// ──────────────────────────────────────────────────────────────
async function upsertCase(client) {
  console.log('\n📁 Upserting case record…');
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
    'FIR/HYD/2026/1842',
    'Operation Parcel Trap: FedEx Digital Arrest Scam',
    'Dr. Aruna Rao (58, Hyderabad) extorted of ₹10,00,000 via fake FedEx robocall & 6-hour Skype "Digital Arrest". Kingpin Vikram Gurjar (Bharatpur) traced via VoIP voiceprint. ₹6L frozen at HDFC Ahmedabad under Section 106 BNSS; ₹3.6L ATM cash-out in Surat; 97.1% CCTV face match on mule Mukesh Solanki.',
    'ORGANIZED_SYNDICATE',
    'CRITICAL',
    'INVESTIGATING',
    'USR-103',           // DSP Arvind Swaminathan
    'Hyderabad & Surat',
  ]);
  console.log('  ✅ Case upserted');
}

// ──────────────────────────────────────────────────────────────
// EVIDENCE
// ──────────────────────────────────────────────────────────────
async function seedEvidence(client) {
  console.log('\n📂 Seeding evidence vault (5 Exhibits)…');
  await client.query('DELETE FROM evidence WHERE case_id = $1', [CASE_ID]);

  const evidence = [
    {
      id: 'EVD-P01',
      case_id: CASE_ID,
      evidence_code: 'PAR-EVD-001',
      title: 'Skype Video Call Recording (18 Min) — Fake IPS Officer Impersonation',
      category: 'SERVER_LOG',
      sub_type: 'VIDEO_RECORDING_SECRECY_SESSION',
      file_url: 's3://crimesync-forensic-vault/hyd/skype_digital_arrest_recording_case011.mp4',
      hash_sha256: '0x9a10283749102837491028374910283749102837491028374910283749102837',
      ai_fingerprint: 'SKP-011A-9941-4401',
      block_height: 19842701,
      tx_hash: '0x9a10283749102837491028374910283749102837491028374910283749102837',
      merkle_root: '0x11b9842109eefa418471b021dae984210912bcde43c99abf28741e12db984aa1',
      metadata: {
        sourceApp: 'Skype Video Core',
        originHandle: 'mumbai_police_cyber_hq',
        impersonator: 'Vikram Gurjar as "DCP Vikram Rathore"',
        recipient: 'Dr. Aruna Rao (iPad Seizure)',
        chainOfCustody: 'Seized directly from victim iPad under Section 65B BSA 2023',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'CID Cyber Crime Division Hyderabad',
          vaultRoom: 'Digital Forensics Clean Vault A-1',
          storageUnit: 'Sealed Digital Storage Safe #DFS-HYD-01',
          shelfLocation: 'Rack #04, Box #PAR-011',
          physicalLockerNumber: 'Locker #VAULT-HYD-0111',
          cloudVaultUri: 's3://crimesync-forensic-vault/hyd/skype_digital_arrest_recording_case011.mp4',
          ipfsHash: 'ipfs://QmSkype011ExportHash11223344556677889900',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    },
    {
      id: 'EVD-P02',
      case_id: CASE_ID,
      evidence_code: 'PAR-EVD-002',
      title: 'Forged Supreme Court Secrecy Order (PDF) — Counterfeit Judicial Seal',
      category: 'SERVER_LOG',
      sub_type: 'FORGED_JUDICIAL_MANDATE',
      file_url: 's3://crimesync-forensic-vault/hyd/forged_sc_order_case011.pdf',
      hash_sha256: '0x8819203948571029384759201938475819203948571029384759201938475819',
      ai_fingerprint: 'DOC-011B-8832-2204',
      block_height: 19842702,
      tx_hash: '0x8819203948571029384759201938475819203948571029384759201938475819',
      merkle_root: '0x22c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984bb2',
      metadata: {
        documentTitle: 'Supreme Court National Security Secrecy Mandate',
        forgedSignatory: 'Chief Justice of India / Anti-Money Laundering Tribunal',
        forgeryLevel: 'High-Fidelity Optical Forgery',
        chainOfCustody: 'Extracted from WhatsApp Media dump via Cellebrite UFED Touch',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'Forensic Science Laboratory (FSL) Hyderabad',
          vaultRoom: 'Document Examination Vault #02',
          storageUnit: 'Sealed Physical Evidence Container #PEC-011',
          shelfLocation: 'Section #DOC-011',
          physicalLockerNumber: 'Locker #DOC-HYD-0112',
          cloudVaultUri: 's3://crimesync-forensic-vault/hyd/forged_sc_order_case011.pdf',
          ipfsHash: 'ipfs://QmDocument011DumpHash9988776655443322',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    },
    {
      id: 'EVD-P03',
      case_id: CASE_ID,
      evidence_code: 'PAR-EVD-003',
      title: 'SBI Core Banking Statement & RTGS Logs — ₹10,00,000 Outward Transfers',
      category: 'BANK_STATEMENT',
      sub_type: 'SBI_RTGS_CORE_STATEMENT',
      file_url: 's3://crimesync-forensic-vault/hyd/sbi_statement_aruna_case011.enc',
      hash_sha256: '0x7719283749102938471029384710293847102938471029384710293847102938',
      ai_fingerprint: 'BNK-011C-7721-5590',
      block_height: 19842703,
      tx_hash: '0x7719283749102938471029384710293847102938471029384710293847102938',
      merkle_root: '0x33c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984cc3',
      metadata: {
        accountNumber: 'SBIN00192847102',
        accountHolder: 'Dr. Aruna Rao',
        branch: 'SBI Banjara Hills Road No. 12',
        totalDebitedInr: 1000000,
        transactions: [
          { ref: 'RTGS/2026/0914/1130', amount: 600000, target: 'HDFC ****4421 (Dinesh Patel)', status: 'FROZEN_SEC_106' },
          { ref: 'RTGS/2026/0914/1315', amount: 400000, target: 'Axis ****9912 (Mukesh Solanki)', status: 'COMPLETED' }
        ],
        chainOfCustody: 'Certified by SBI Banjara Hills Branch Manager under Section 2A Bankers Books Evidence Act',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'CID Cyber Crime Division Hyderabad',
          vaultRoom: 'Financial Intel Archive Room #01',
          storageUnit: 'Encrypted Server Cluster ESC-01',
          shelfLocation: 'Volume #FIN-011',
          physicalLockerNumber: 'Locker #FIN-HYD-0113',
          cloudVaultUri: 's3://crimesync-forensic-vault/hyd/sbi_statement_aruna_case011.enc',
          ipfsHash: 'ipfs://QmSBI011StatementHash8877665544332211',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    },
    {
      id: 'EVD-P04',
      case_id: CASE_ID,
      evidence_code: 'PAR-EVD-004',
      title: 'Surat Ring Road ATM CCTV Video & Receipt — Mukesh Solanki Cash-Out',
      category: 'CCTV_FOOTAGE',
      sub_type: 'ATM_SURVEILLANCE_OPTICAL_4K',
      file_url: 's3://crimesync-forensic-vault/surat/icici_atm_ringroad_case011.mp4',
      hash_sha256: '0x6610293847592019384758192039485710293847592019384758192039485710',
      ai_fingerprint: 'CTV-011D-6610-8821',
      block_height: 19842704,
      tx_hash: '0x6610293847592019384758192039485710293847592019384758192039485710',
      merkle_root: '0x44c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984dd4',
      metadata: {
        atmLocation: 'ICICI Bank ATM Kiosk, Ring Road Textile Market, Surat',
        recordingTimestamp: '14 Sep 2026 01:50:18 IST',
        muleIdentified: 'Mukesh Solanki (GJ-05-KM-4421)',
        withdrawalAmountInr: 360000,
        faceMatchScore: '97.1% (Surat Cyber Police AFIS Match)',
        chainOfCustody: 'Seized by Surat Cyber Crime Cell under Section 91 CrPC Notice',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'Surat City Police Cyber Cell',
          vaultRoom: 'Video Forensics Unit Safe 01',
          storageUnit: 'Write-Blocked NVMe Vault Unit #03',
          shelfLocation: 'Shelf #SRT-011',
          physicalLockerNumber: 'Locker #SUR-CTV-0114',
          cloudVaultUri: 's3://crimesync-forensic-vault/surat/icici_atm_ringroad_case011.mp4',
          ipfsHash: 'ipfs://QmATM011CCTVFootageHash554433221100',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    },
    {
      id: 'EVD-P05',
      case_id: CASE_ID,
      evidence_code: 'PAR-EVD-005',
      title: 'VoIP SIP Intercept & Voiceprint Biometric — Vikram Gurjar Match (96.8%)',
      category: 'CALL_RECORD',
      sub_type: 'DOT_LIMS_VOIP_SPECTROGRAM',
      file_url: 's3://crimesync-forensic-vault/hyd/voip_voiceprint_spectrogram_case011.enc',
      hash_sha256: '0x5519283749102938471029384710293847102938471029384710293847102938',
      ai_fingerprint: 'TEL-011E-5519-7711',
      block_height: 19842705,
      tx_hash: '0x5519283749102938471029384710293847102938471029384710293847102938',
      merkle_root: '0x55c9842109eefa418471b021dae984210912bcde43c99abf28741e12db984ee5',
      metadata: {
        voipServerIp: '103.212.44.89 (Asterisk SIP Proxy, BKC Mumbai)',
        callerVoiceMatch: 'Vikram Gurjar (96.8% CFSL Spectrogram Match)',
        crossCaseMatchFir: 'FIR/BHR/2023/0419 (Rajasthan Cyber Police Extortion)',
        triangulatedLocation: 'Deeg Road Cyber Belt, Bharatpur, Rajasthan',
        chainOfCustody: 'Extracted via DoT LIMS Gateway & CFSL Voice Analysis Lab',
        integrityStatus: 'Verified',
        storageLocation: {
          facility: 'Central Forensic Science Laboratory (CFSL) Voice Acoustics Division',
          vaultRoom: 'Acoustics & Telecom Safe Vault #01',
          storageUnit: 'Biometric Voice Archive SAN-01',
          shelfLocation: 'Tape #VOIP-011',
          physicalLockerNumber: 'Locker #CFSL-HYD-0115',
          cloudVaultUri: 's3://crimesync-forensic-vault/hyd/voip_voiceprint_spectrogram_case011.enc',
          ipfsHash: 'ipfs://QmTelecom011VoipVoiceHash443322110099',
          encryptionProtocol: 'AES-256-GCM HSM Key Sealed'
        }
      },
      collected_by_id: 'USR-103',
      current_custody_officer_id: 'USR-103',
      status: 'SECURED'
    }
  ];

  for (const ev of evidence) {
    await client.query(`
      INSERT INTO evidence (
        id, case_id, evidence_code, title, category,
        file_url, hash_sha256, metadata, collected_by_id,
        current_custody_officer_id, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [
      ev.id, ev.case_id, ev.evidence_code, ev.title, ev.category,
      ev.file_url, ev.hash_sha256, JSON.stringify(ev.metadata),
      ev.collected_by_id, ev.current_custody_officer_id, ev.status
    ]);
    console.log(`  ✅ Exhibit: ${ev.evidence_code} — ${ev.title.substring(0, 48)}…`);
  }
}

// ──────────────────────────────────────────────────────────────
// FINANCIAL TRANSACTIONS
// ──────────────────────────────────────────────────────────────
async function seedTransactions(client) {
  console.log('\n💳 Seeding financial transactions (4 Transactions)…');
  await client.query('DELETE FROM financial_transactions WHERE case_id = $1', [CASE_ID]);

  const txns = [
    // Transfer 1 — ₹6,00,000 (14 Sep, 11:30 IST)
    [
      'TXN-P01', CASE_ID, 'RTGS/2026/0914/1130',
      'SBIN00192847102', 'Dr. Aruna Rao (Victim SBI)',
      'HDFC00044218901', 'Dinesh Patel (HDFC Mule 1)',
      'HDFC Bank', 600000, 'RTGS', 95,
      '2026-09-14T11:30:00Z',
    ],
    // Transfer 2 — ₹4,00,000 (14 Sep, 13:15 IST)
    [
      'TXN-P02', CASE_ID, 'RTGS/2026/0914/1315',
      'SBIN00192847102', 'Dr. Aruna Rao (Victim SBI)',
      'UTIB00099124810', 'Mukesh Solanki (Axis Mule 2)',
      'Axis Bank', 400000, 'RTGS', 97,
      '2026-09-14T13:15:00Z',
    ],
    // ATM Cash-out ₹3,60,000 — Mule 2 in Surat (14 Sep, 13:50 IST)
    [
      'TXN-P03', CASE_ID, 'ATM/SRT/2026/0914/1350',
      'UTIB00099124810', 'Mukesh Solanki (Axis Mule 2)',
      'CASH-ATM-SURAT', 'Mukesh Solanki / Cash Withdrawal',
      'Axis Bank', 360000, 'IMPS', 99,
      '2026-09-14T13:50:00Z',
    ],
    // Mule Fee ₹40,000 retained (14 Sep, 13:52 IST)
    [
      'TXN-P04', CASE_ID, 'FEE/MULE/2026/0914/1352',
      'UTIB00099124810', 'Mukesh Solanki (Axis Mule 2)',
      'UTIB00099124810-FEE', 'Mukesh Solanki (10% Mule Fee Retained)',
      'Axis Bank', 40000, 'IMPS', 94,
      '2026-09-14T13:52:00Z',
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
// GEO INTEL EVENTS — 5 Pins
// ──────────────────────────────────────────────────────────────
async function seedGeoEvents(client) {
  console.log('\n🗺️  Seeding geo intel events (5 Pins)…');
  await client.query('DELETE FROM geo_intel_events WHERE case_id = $1', [CASE_ID]);

  const geoEvents = [
    ['GEO-P01', CASE_ID, 'CRIME_SCENE', 17.4156, 78.4350,
     'Hyderabad (Victim Node) — Banjara Hills Residence (6-Hour Digital Arrest)', 'Hyderabad', 'Telangana'],
    ['GEO-P02', CASE_ID, 'HAWALA_HUB', 19.0760, 72.8777,
     'Mumbai (VoIP Proxy Ingress) — Bandra-Kurla Complex Asterisk SIP Colocation', 'Mumbai', 'Maharashtra'],
    ['GEO-P03', CASE_ID, 'CCTV_DETECTION', 21.1959, 72.8302,
     'Surat (Cash-Out Node) — Ring Road ICICI ATM (₹3,60,000 Withdrawn)', 'Surat', 'Gujarat'],
    ['GEO-P04', CASE_ID, 'RAID_TARGET', 23.0225, 72.5714,
     'Ahmedabad (Mule 1 Banking Node) — Ashram Road HDFC (₹6,00,000 Frozen)', 'Ahmedabad', 'Gujarat'],
    ['GEO-P05', CASE_ID, 'RAID_TARGET', 27.2152, 77.4930,
     'Bharatpur / Deeg (Kingpin Hub) — Fake Police Studio & Voiceprint Match', 'Bharatpur', 'Rajasthan'],
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
  console.log('\n🕸️  Seeding Neo4j graph (Operation Parcel Trap)…');
  const session = driver.session();
  try {
    await session.run(`
      MERGE (vikram:Person {id: 'vikram_g_parcel_trap'})
      SET vikram.name = 'Vikram Gurjar',
          vikram.alias = 'DCP Vikram Rathore',
          vikram.role = 'Digital Arrest Syndicate Kingpin',
          vikram.riskScore = 98,
          vikram.location = 'Deeg Road Cyber Belt, Bharatpur, Rajasthan',
          vikram.caseId = $caseId

      MERGE (studio:CyberEntity {id: 'voip_studio_parcel_trap'})
      SET studio.name = 'Fake Police Studio / Asterisk SIP Proxy',
          studio.type = 'VoIP Gateway & Fake Police Station Set',
          studio.ip = '103.212.44.89',
          studio.caseId = $caseId

      MERGE (aruna:Person {id: 'victim_aruna_parcel_trap'})
      SET aruna.name = 'Dr. Aruna Rao',
          aruna.role = 'Victim',
          aruna.lossInr = 1000000,
          aruna.location = 'Banjara Hills, Hyderabad',
          aruna.caseId = $caseId

      MERGE (hdfc:BankAccount {id: 'mule_hdfc_parcel_trap'})
      SET hdfc.accountNumber = '****4421',
          hdfc.bank = 'HDFC Bank',
          hdfc.holder = 'Dinesh Patel',
          hdfc.role = 'Mule Layer-1 (Frozen)',
          hdfc.receivedInr = 600000,
          hdfc.status = 'FROZEN_SEC_106',
          hdfc.caseId = $caseId

      MERGE (axis:BankAccount {id: 'mule_axis_parcel_trap'})
      SET axis.accountNumber = '****9912',
          axis.bank = 'Axis Bank',
          axis.holder = 'Mukesh Solanki',
          axis.role = 'Mule Layer-1 (Cash-out)',
          axis.receivedInr = 400000,
          axis.caseId = $caseId

      MERGE (atm:Location {id: 'atm_surat_parcel_trap'})
      SET atm.name = 'ICICI ATM Ring Road',
          atm.city = 'Surat',
          atm.cashOutInr = 360000,
          atm.caseId = $caseId

      MERGE (vikram)-[:OPERATES_STUDIO  {label: 'VoIP SIP & Fake Police Set'}]->(studio)
      MERGE (studio)-[:SKYPE_DIGITAL_ARREST {label: '6-Hour Coercive Video Session'}]->(aruna)
      MERGE (aruna)-[:RTGS_TRANSFER   {amountInr: 600000, label: '₹6,00,000 (Frozen Sec 106)'}]->(hdfc)
      MERGE (aruna)-[:RTGS_TRANSFER   {amountInr: 400000, label: '₹4,00,000 (Tranche 2)'}]->(axis)
      MERGE (axis)-[:CASH_WITHDRAWAL  {amountInr: 360000, label: '₹3,60,000 ATM Cash-out'}]->(atm)
      MERGE (vikram)-[:CONTROLS_MULE  {label: 'Recruited Dinesh Patel'}]->(hdfc)
      MERGE (vikram)-[:CONTROLS_MULE  {label: 'Recruited Mukesh Solanki'}]->(axis)
      MERGE (atm)-[:ANGADIA_COURIER   {amountInr: 360000, label: 'Angadia Cash Transit'}]->(vikram)
    `, { caseId: CASE_ID });
    console.log('  ✅ Neo4j graph seeded for Operation Parcel Trap');
  } finally {
    await session.close();
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 CrimeSync — Operation Parcel Trap Seed (CASE-2026-011)');
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

  console.log('\n🎉  Operation Parcel Trap fully seeded!');
  console.log('   Select CASE-2026-011 in the CrimeSync case switcher to view the full story.');
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
