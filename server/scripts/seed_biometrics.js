const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function sha(text) {
  return '0x' + crypto.createHash('sha256').update(text).digest('hex');
}

async function seedAllBiologicalAndBiometricEvidence() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding complete suite of Biological (Blood, Saliva, Hair, Tissue, Swabs) & Digital exhibits for all cases into Neon PostgreSQL...');

    const casesRes = await client.query('SELECT id, fir_number, title, jurisdiction_city FROM cases');
    const cases = casesRes.rows;

    let totalInserted = 0;

    for (const c of cases) {
      const caseId = c.id;
      const city = c.jurisdiction_city || 'Delhi';
      const cityCode = city.slice(0, 3).toUpperCase();
      const numSuffix = caseId.replace('CASE-2026-', '');

      const exhibits = [
        // 1. BIOLOGICAL BLOOD EXHIBIT
        {
          code: `EV-BLD-${numSuffix}-01`,
          title: `Biological Blood Stain & Serum Extract (ABO Serology & STR DNA - ${c.fir_number})`,
          category: 'BIOLOGICAL_BLOOD',
          sub_type: 'LIQUID_BLOOD_AND_SERUM',
          file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/blood_serum_${caseId}.enc`,
          hash: sha(`${caseId}_BLOOD_SERUM_DNA_STR_${c.fir_number}`),
          fingerprint: `BLD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842600 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_BLD_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_BLD_${caseId}`),
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
              facility: `Central Forensic Science Laboratory (CFSL) ${city}`,
              vaultRoom: 'Cryogenic Biological Bio-Safety Level 3 Repository',
              storageUnit: 'Sub-Zero Unit #CRYO-B4 (-80°C Constant Temperature)',
              shelfLocation: `Rack #03, Cryo-Box #BLD-${numSuffix}`,
              physicalLockerNumber: `Locker #BIO-104 (Seal ID: MHA-${cityCode}-9921)`,
              cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/blood_serum_${caseId}.enc`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM Hardware Security Module (HSM Sealed)'
            },
            chainOfCustody: 'Sealed by Investigating Officer under Section 65B BSA 2023 at Scene of Crime',
            integrityStatus: 'Verified'
          }
        },

        // 2. BIOLOGICAL SALIVA EXHIBIT
        {
          code: `EV-SLV-${numSuffix}-02`,
          title: `Biological Saliva & Buccal Epithelial Extract (Amylase Assay & STR DNA - ${c.fir_number})`,
          category: 'BIOLOGICAL_SALIVA',
          sub_type: 'ORAL_SALIVA_SWAB',
          file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/saliva_buccal_${caseId}.enc`,
          hash: sha(`${caseId}_SALIVA_AMYLASE_STR_${c.fir_number}`),
          fingerprint: `SLV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842601 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_SLV_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_SLV_${caseId}`),
          metadata: {
            biologicalType: 'Saliva (Oral Buccal Epithelial Fluid)',
            amylaseActivity: 'Alpha-Amylase Enzyme Positive (+4)',
            dnaYield: '96.8 ng/µL Nuclear DNA',
            codisIndex: `CODIS-IND-${cityCode}-4019`,
            strLoci: {
              'D3S1358': '14, 16',
              'vWA': '16, 18',
              'FGA': '20, 22',
              'D8S1179': '12, 14',
              'D21S11': '28, 30.2',
              'AMEL': 'X, Y'
            },
            storageLocation: {
              facility: `State Forensic Science Laboratory (FSL) Biological Section`,
              vaultRoom: 'Desiccated Biological Sample Storage Room #02',
              storageUnit: 'Controlled Desiccation Chamber (+4°C Climate Regulated)',
              shelfLocation: `Cabinet #SLV-12, Tray #B`,
              physicalLockerNumber: `Locker #SLV-309 (Seal Barcode: IND-FSL-7718)`,
              cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/saliva_buccal_${caseId}.enc`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM HSM Key #FSL-9081'
            },
            integrityStatus: 'Verified'
          }
        },

        // 3. BIOLOGICAL HAIR FOLLICLE EXHIBIT
        {
          code: `EV-HAR-${numSuffix}-03`,
          title: `Biological Hair Follicle Root Bulb & Cuticle (Nuclear & mtDNA Profile - ${c.fir_number})`,
          category: 'BIOLOGICAL_HAIR',
          sub_type: 'HAIR_FOLLICLE_ROOT',
          file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/hair_follicle_${caseId}.enc`,
          hash: sha(`${caseId}_HAIR_FOLLICLE_MTDNA_${c.fir_number}`),
          fingerprint: `HAR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842602 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_HAR_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_HAR_${caseId}`),
          metadata: {
            biologicalType: 'Hair with Intact Anagen Follicle Root Bulb',
            microscopicMorphology: 'Human Cuticle (Medullary Index 0.28, Continuous Medulla)',
            mtDnaHaplogroup: 'Mitochondrial HVR1 & HVR2 Sequencing (Haplogroup R1a1a)',
            hairColorLength: 'Natural Black / 4.2 cm / Wavy Morphology',
            storageLocation: {
              facility: `National Crime Records Bureau (NCRB) Forensic Evidence Archive`,
              vaultRoom: 'Trace Biological Evidence Clean Room #04',
              storageUnit: 'Anti-Static Sealed Humidity Enclosure (22°C, 45% RH)',
              shelfLocation: `Rack #HAR-09, Drawer #03`,
              physicalLockerNumber: `Evidence Locker #HAR-402 (Anti-Static Seal #NCRB-881)`,
              cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/hair_follicle_${caseId}.enc`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM Sovereign Cloud Key'
            },
            integrityStatus: 'Verified'
          }
        },

        // 4. BIOLOGICAL TISSUE & TOUCH EPITHELIAL EXHIBIT
        {
          code: `EV-TIS-${numSuffix}-04`,
          title: `Biological Cellular Tissue & Touch Epithelial Lift (Weapon Handle Swab - ${c.fir_number})`,
          category: 'BIOLOGICAL_TISSUE',
          sub_type: 'CELLULAR_TOUCH_TISSUE',
          file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/tissue_touch_${caseId}.enc`,
          hash: sha(`${caseId}_TISSUE_TOUCH_CELLULAR_${c.fir_number}`),
          fingerprint: `TIS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842603 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_TIS_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_TIS_${caseId}`),
          metadata: {
            biologicalType: 'Cellular Touch Skin Tissue (Epithelial Cells)',
            surfaceOrigin: 'Tactile recovery from crime weapon handle & keyboard palm-rest',
            pcrCycles: '32-Cycle PCR Amplification (Low Template DNA Assay)',
            strLoci: {
              'D3S1358': '15, 17',
              'vWA': '17, 18',
              'FGA': '22, 24',
              'AMEL': 'X, Y'
            },
            storageLocation: {
              facility: `Central DNA Database & Bio-Repository Facility`,
              vaultRoom: 'Ultra-Low Temperature Biological Vault',
              storageUnit: 'Cryo-Chest #TIS-22 (-70°C Nitrogen Vapor)',
              shelfLocation: `Rack #08, Box #TIS-${numSuffix}`,
              physicalLockerNumber: `Locker #TIS-911 (Seal Tag #CFSL-IND-4401)`,
              cloudVaultUri: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/tissue_touch_${caseId}.enc`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM Zero-Trust Envelope'
            },
            integrityStatus: 'Verified'
          }
        },

        // 5. BIOLOGICAL FORENSIC SWAB EXHIBIT
        {
          code: `EV-SWB-${numSuffix}-05`,
          title: `Biological Forensic Sterile Swab Lift (Multi-Surface Trace Biologicals - ${c.fir_number})`,
          category: 'BIOLOGICAL_SWAB',
          sub_type: 'STERILE_FORENSIC_SWAB',
          file_url: `s3://crimesync-forensic-vault/${cityCode.toLowerCase()}/scene_swab_${caseId}.enc`,
          hash: sha(`${caseId}_STERILE_SWAB_FORENSIC_${c.fir_number}`),
          fingerprint: `SWB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842604 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_SWB_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_SWB_${caseId}`),
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
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM CBI Key Governance'
            },
            integrityStatus: 'Verified'
          }
        },

        // 6. LATENT FINGERPRINT AFIS SCAN
        {
          code: `EV-FNG-${numSuffix}-06`,
          title: `Latent Fingerprint Lift (Right Index & Thumb AFIS Match - ${c.fir_number})`,
          category: 'FINGERPRINT_SCAN',
          sub_type: 'BIOMETRIC_FINGERPRINT',
          file_url: `s3://crimesync-biometrics/afis_scan_${caseId}.wsq`,
          hash: sha(`${caseId}_FINGERPRINT_AFIS_WSQ_${c.fir_number}`),
          fingerprint: `FNG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842605 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_FNG_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_FNG_${caseId}`),
          metadata: {
            minutiaeCount: 84,
            ridgePattern: 'Double Loop Whorl (DLW-Type B)',
            coreDeltaDistance: '14.2 mm',
            nfiqScore: 98,
            afisDatabase: 'NAFIS (National Automated Fingerprint Identification System)',
            storageLocation: {
              facility: 'NAFIS Central Server & Biometric Vault (NIC CGO Complex, New Delhi)',
              vaultRoom: 'Biometric Server Rack #AFIS-01',
              storageUnit: 'High-IOPS NVMe WSQ Biometric Cluster',
              shelfLocation: 'NAFIS Tenprint Card Registry #DEL-8812',
              physicalLockerNumber: 'Biometric Safe #NAFIS-109',
              cloudVaultUri: `s3://crimesync-biometrics/afis_scan_${caseId}.wsq`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM NIC National HSM'
            },
            integrityStatus: 'Verified'
          }
        },

        // 7. IRIS POLAR SCAN
        {
          code: `EV-IRS-${numSuffix}-07`,
          title: `Iris & Retinal Biometric Polar Scan (UIDAI / Airport Border Kiosk - ${c.fir_number})`,
          category: 'IRIS_SCAN',
          sub_type: 'BIOMETRIC_IRIS',
          file_url: `s3://crimesync-biometrics/iris_polar_${caseId}.bin`,
          hash: sha(`${caseId}_IRISCODE_256_POLAR_${c.fir_number}`),
          fingerprint: `IRS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842606 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_IRS_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_IRS_${caseId}`),
          metadata: {
            irisCodeBits: 2048,
            hammingDistance: 0.12,
            pupilToIrisRatio: '0.38',
            scannerModel: 'IriShield MK2120U (UIDAI L1 Certified)',
            borderCheckpost: `${city} International Airport E-Gate 04`,
            storageLocation: {
              facility: 'UIDAI Certified National Security Biometric Enclave',
              vaultRoom: 'HSM Cryptographic Cluster #04',
              storageUnit: 'Encrypted Biometric Node #IRS-UIDAI-09',
              shelfLocation: 'Identity Card Link #Aadhaar-Auth-Enclave',
              physicalLockerNumber: 'HSM Vault Unit #IRS-881',
              cloudVaultUri: `s3://crimesync-biometrics/iris_polar_${caseId}.bin`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'UIDAI L1 RSA-2048 / AES-256'
            },
            integrityStatus: 'Verified'
          }
        },

        // 8. FACIAL BIOMETRIC CCTV
        {
          code: `EV-FAC-${numSuffix}-08`,
          title: `Facial Landmark Geometric DNA & CCTV 4K Multi-Angle Vector - ${c.fir_number}`,
          category: 'FACIAL_BIOMETRIC',
          sub_type: 'CCTV_FACIAL_DNA',
          file_url: `s3://crimesync-cctv/cctv_facial_${caseId}.mp4`,
          hash: sha(`${caseId}_FACIAL_EMBEDDING_512D_${c.fir_number}`),
          fingerprint: `FAC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842607 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_FAC_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_FAC_${caseId}`),
          metadata: {
            embeddingDimensions: 512,
            confidenceScore: 97.8,
            facialLandmarksDetected: 106,
            cameraSource: `CCTV-CAM-${cityCode}-TOWER-09 (4K PTZ Optical Zoom)`,
            timestampSeizure: '2026-09-02T18:42:10Z',
            storageLocation: {
              facility: `State Police Integrated Command & Control Center (ICCC) ${city}`,
              vaultRoom: 'SOC SAN Storage Server Room #02',
              storageUnit: 'High-Density 4K Video Archival SAN Array #04',
              shelfLocation: `Drive Bay #14, LUN #CCTV-${cityCode}`,
              physicalLockerNumber: 'Optical Disc Vault #DVD-MHA-908',
              cloudVaultUri: `s3://crimesync-cctv/cctv_facial_${caseId}.mp4`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256 Bitstream Encrypted'
            },
            integrityStatus: 'Verified'
          }
        },

        // 9. VOICEPRINT ACOUSTIC DNA
        {
          code: `EV-VOI-${numSuffix}-09`,
          title: `Acoustic Voiceprint Spectrogram & Formant Frequency DNA - ${c.fir_number}`,
          category: 'VOICEPRINT_AUDIO',
          sub_type: 'ACOUSTIC_VOICEPRINT',
          file_url: `s3://crimesync-audio/wiretap_spectrogram_${caseId}.wav`,
          hash: sha(`${caseId}_ACOUSTIC_SPECTROGRAM_WAV_${c.fir_number}`),
          fingerprint: `VOI-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842608 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_VOI_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_VOI_${caseId}`),
          metadata: {
            pitchMeanHz: 138.4,
            formants: { F1: '520 Hz', F2: '1640 Hz', F3: '2780 Hz' },
            mfccCoefficients: 26,
            acousticConfidence: 94.6,
            interceptChannel: 'SIP Trunk VoIP Intercept via Section 5(2) Indian Telegraph Act',
            storageLocation: {
              facility: 'Department of Telecommunications (DoT) Lawful Intercept Facility (Sanchar Bhawan)',
              vaultRoom: 'Voice Surveillance Cryptographic Vault #LIM-03',
              storageUnit: 'Encrypted PCM Audio Storage Node #AUD-91',
              shelfLocation: 'WORM (Write Once Read Many) Optical Cartridge #VOI-09',
              physicalLockerNumber: 'Locker #LIM-7701 (MHA Authorized)',
              cloudVaultUri: `s3://crimesync-audio/wiretap_spectrogram_${caseId}.wav`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'AES-256-GCM DoT Cryptographic Seal'
            },
            integrityStatus: 'Verified'
          }
        },

        // 10. CYBER MEMORY EXTRACTION
        {
          code: `EV-CYB-${numSuffix}-10`,
          title: `Volatile RAM Memory Extraction & Weaponized Payload Artifact - ${c.fir_number}`,
          category: 'DIGITAL_PAYLOAD',
          sub_type: 'CYBER_MEMORY_DUMP',
          file_url: `s3://crimesync-digital/memdump_${caseId}.raw`,
          hash: sha(`${caseId}_VOLATILE_RAM_MEMDUMP_${c.fir_number}`),
          fingerprint: `CYB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          block_height: 19842609 + Math.floor(Math.random() * 80),
          tx_hash: sha(`TX_CYB_${caseId}_${Date.now()}`),
          merkle_root: sha(`MERKLE_CYB_${caseId}`),
          metadata: {
            dumpSizeBytes: '16.4 GB',
            injectedProcess: 'svchost.exe (PID 4892)',
            yaraMatchRule: 'APT_INDIAN_CRITICAL_INFRA_STAGER_v4',
            section65BCertified: true,
            storageLocation: {
              facility: 'Indian Computer Emergency Response Team (CERT-In) Cyber Forensics Lab',
              vaultRoom: 'Air-Gapped Digital Evidence Cold Storage Room',
              storageUnit: 'Cyber Forensics Storage Array #SAN-09',
              shelfLocation: 'Faraday Cage Locker #CYB-14',
              physicalLockerNumber: 'Hardware Evidence Locker #CYB-8812',
              cloudVaultUri: `s3://crimesync-digital/memdump_${caseId}.raw`,
              ipfsHash: `ipfs://Qm${crypto.randomBytes(22).toString('hex')}`,
              encryptionProtocol: 'BitLocker XTS-AES 256 / SHA-256 Ledger Sealed'
            },
            integrityStatus: 'Verified'
          }
        }
      ];

      for (const ex of exhibits) {
        await client.query(
          `INSERT INTO evidence (id, case_id, evidence_code, title, category, sub_type, file_url, hash_sha256, ai_fingerprint, block_height, tx_hash, merkle_root, metadata, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'SECURED')
           ON CONFLICT (evidence_code) DO UPDATE 
           SET title = EXCLUDED.title,
               category = EXCLUDED.category,
               sub_type = EXCLUDED.sub_type,
               file_url = EXCLUDED.file_url,
               hash_sha256 = EXCLUDED.hash_sha256,
               ai_fingerprint = EXCLUDED.ai_fingerprint,
               block_height = EXCLUDED.block_height,
               tx_hash = EXCLUDED.tx_hash,
               merkle_root = EXCLUDED.merkle_root,
               metadata = EXCLUDED.metadata,
               status = 'SECURED'`,
          [
            `EVD-${crypto.randomBytes(4).toString('hex')}`,
            caseId,
            ex.code,
            ex.title,
            ex.category,
            ex.sub_type,
            ex.file_url,
            ex.hash,
            ex.fingerprint,
            ex.block_height,
            ex.tx_hash,
            ex.merkle_root,
            JSON.stringify(ex.metadata)
          ]
        );
        totalInserted++;
      }
    }

    console.log(`✅ Successfully seeded ${totalInserted} full biological (blood, saliva, hair, tissue, swabs) & biometric exhibits across all cases!`);
  } catch (err) {
    console.error('Error seeding biological evidence:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedAllBiologicalAndBiometricEvidence();
