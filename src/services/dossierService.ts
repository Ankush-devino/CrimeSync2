/**
 * Forensic Dossier Service
 * Generates court-ready, Section 65B BSA 2023 certified investigative reports
 * with full 10-section legal and forensic data injection.
 */

import { ALL_CASES, type LawCase, getCaseById } from '../constants/cases';

export interface ForensicDossier {
  id: string;
  reportName: string;
  type: 'Investigation Master' | 'Financial Crime' | 'Cyber Intrusion' | 'Suspect Dossier';
  typeColor: string;
  caseId: string;
  firNumber: string;
  classification: string;
  status: 'Certified' | 'Outdated';
  generatedOn: string;
  generatedTimestamp: number;
  lastEvidenceSync: string;
  blockchainHash: string;
  blockHeight: number;
  merkleRoot: string;
  network: string;
  author: string;
  authorBadge: string;
  authorRole: string;
  department: string;
  jurisdiction: string;
  fileSize: string;
  pages: number;
  summary: string;
  certificate65bId: string;

  // 10 Detailed Dossier Sections
  sections: {
    // 1. Executive Summary
    executiveSummary: {
      synopsis: string;
      modusOperandi: string;
      threatVector: string;
      damageAssessment: string;
      investigativeBreakthrough: string;
    };

    // 2. Case Information
    caseInfo: {
      firNumber: string;
      policeStation: string;
      filingDate: string;
      occurrenceDate: string;
      crimeClassification: string;
      priority: string;
      investigatingOfficer: string;
      badgeNumber: string;
      department: string;
      courtJurisdiction: string;
    };

    // 3. Persons Involved
    personsInvolved: {
      suspects: Array<{
        name: string;
        alias: string;
        role: string;
        riskScore: number;
        status: string;
        biometricMatch: string;
        aadhaarMasked: string;
      }>;
      victims: Array<{
        name: string;
        city: string;
        lossInr: number;
        reportingDate: string;
        channel: string;
      }>;
      witnesses: Array<{
        name: string;
        designation: string;
        statementRef: string;
        credibility: string;
      }>;
    };

    // 4. Criminal Network Analysis
    networkAnalysis: {
      mastermind: string;
      keyHubs: string[];
      nodesCount: number;
      edgesCount: number;
      density: number;
      centralityScore: number;
      syndicateClustering: string;
      graphSnapshotDescription: string;
    };

    // 5. Timeline Reconstruction
    timeline: Array<{
      time: string;
      date: string;
      event: string;
      category: 'CALL' | 'TRANSACTION' | 'CCTV' | 'GEO' | 'CYBER';
      location: string;
      evidenceRef: string;
    }>;

    // 6. Financial Intelligence
    financialIntel: {
      totalVolumeInr: number;
      frozenAmountInr: number;
      recoveryRate: number;
      launderingHops: Array<{
        hop: number;
        source: string;
        destination: string;
        channel: string;
        amountInr: number;
        suspiciousScore: number;
      }>;
      muleAccountsCount: number;
      cryptoWalletsCount: number;
    };

    // 7. Digital Evidence Manifest
    digitalEvidence: Array<{
      code: string;
      name: string;
      type: string;
      seizedAt: string;
      size: string;
      sha256: string;
      custodyStatus: string;
      section65bAdmissible: boolean;
    }>;

    // 8. Chain of Custody
    chainOfCustody: Array<{
      stepId: string;
      evidenceCode: string;
      handledBy: string;
      role: string;
      action: string;
      timestamp: string;
      transferredTo: string;
      txHash: string;
    }>;

    // 9. Applicable Laws
    applicableLaws: Array<{
      act: string;
      section: string;
      title: string;
      punishment: string;
      applicabilityNotes: string;
    }>;

    // 10. AI Findings & Prosecution Strategy
    aiFindings: {
      confidenceScore: number;
      smokingGuns: string[];
      prosecutionStrategy: string[];
      bailOppositionGrounds: string[];
      recommendedCharges: string[];
    };
  };
}

/**
 * Generates an exhaustive 10-section forensic dossier for any case.
 */
export function buildDossierForCase(
  c: LawCase,
  officerName = 'ACP Rajeshwar Sharma',
  officerBadge = 'DEL-IPS-8821',
  officerDept = 'Special Cell / Cyber Crime Unit',
  isOutdated = false
): ForensicDossier {
  const hashSeed = `${c.id}_${c.fir_number}_${Date.now()}`;
  const sha256Snippet = pseudoSha256(hashSeed);
  const blockHeight = 19482000 + Math.floor(Math.random() * 900);
  const merkleRoot = `0x${pseudoSha256(c.id + '_merkle')}`;

  const reportType =
    c.crime_category === 'CYBER_ATTACK'
      ? 'Cyber Intrusion'
      : c.crime_category === 'FINANCIAL_FRAUD'
      ? 'Financial Crime'
      : c.crime_category === 'IDENTITY_THEFT'
      ? 'Suspect Dossier'
      : 'Investigation Master';

  const typeColor =
    reportType === 'Cyber Intrusion'
      ? 'text-purple-400 bg-purple-950/60 border-purple-800/60'
      : reportType === 'Financial Crime'
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
      : reportType === 'Suspect Dossier'
      ? 'text-amber-400 bg-amber-950/60 border-amber-800/60'
      : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';

  const totalTracked = c.tracked_money_inr || 3500000;
  const frozen = Math.round(totalTracked * 0.68);
  const recovery = Math.round((frozen / totalTracked) * 100);

  return {
    id: `REP-${c.id.replace('CASE-', '')}-2026`,
    reportName: `${c.title} — Comprehensive Forensic Dossier`,
    type: reportType,
    typeColor: typeColor,
    caseId: c.id,
    firNumber: c.fir_number,
    classification: 'TOP SECRET // LAW ENFORCEMENT SENSITIVE',
    status: isOutdated ? 'Outdated' : 'Certified',
    generatedOn: new Date(Date.now() - (isOutdated ? 86400000 * 3 : 3600000)).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    generatedTimestamp: Date.now() - (isOutdated ? 86400000 * 3 : 3600000),
    lastEvidenceSync: isOutdated ? '3 days ago (New CDR data unsealed)' : 'Live DB Synchronized',
    blockchainHash: `0x${sha256Snippet.slice(0, 40)}`,
    blockHeight: blockHeight,
    merkleRoot: merkleRoot,
    network: 'Hyperledger Besu (National Forensic Ledger)',
    author: c.lead_investigator_name || officerName,
    authorBadge: c.badge_number || officerBadge,
    authorRole: 'Lead Investigating Officer',
    department: c.department || officerDept,
    jurisdiction: c.jurisdiction_city || 'National Cyber Command',
    fileSize: '14.8 MB',
    pages: 28,
    summary: `Comprehensive court-ready forensic dossier for ${c.fir_number}. Contains Section 65B BSA 2023 certified digital exhibits, CDR tower triangulation, multi-hop financial tracking (₹${(totalTracked / 100000).toFixed(2)} Lakhs), and AI explainable prosecution strategy.`,
    certificate65bId: `CERT-65B-${c.fir_number.replace(/\//g, '-')}-V3`,

    sections: {
      // 1. Executive Summary
      executiveSummary: {
        synopsis: `This final forensic prosecution dossier consolidates intelligence, digital forensics, CDR tower handoffs, and multi-hop financial trails for ${c.title} (${c.fir_number}). The syndicate operated a decentralized criminal infrastructure spanning multiple states, utilizing spoofed VoIP exchanges, forged identity documents, and high-velocity mule accounts to execute organized operations.`,
        modusOperandi: `The primary threat actor, ${c.lead_suspect} (${c.lead_suspect_role}), orchestrated operations via encrypted Telegram C2 channels and burner VoIP PBX nodes. Funds and unauthorized digital access were routed across 4 distinct layering tiers before cash extraction at unmonitored micro-ATMs and OTC cryptocurrency swaps.`,
        threatVector: `Zero-day exploitation combined with sophisticated social engineering and automated SIM-farm OTP interception targeting PSU financial institutions and critical state infrastructure.`,
        damageAssessment: `Total verified illicit transactions: ₹${(totalTracked / 100000).toFixed(2)} Lakhs. ₹${(frozen / 100000).toFixed(2)} Lakhs successfully frozen under Section 102 CrPC across 14 beneficiary accounts.`,
        investigativeBreakthrough: `Physical seizure and Section 65B forensic bit-stream acquisition of the primary controller terminal matching immutable MAC address and SHA-256 evidence DNA registered in the national cyber registry.`,
      },

      // 2. Case Information
      caseInfo: {
        firNumber: c.fir_number,
        policeStation: `${c.jurisdiction_city} Cyber Crime Police Station`,
        filingDate: '12 Jan 2026, 11:30 AM',
        occurrenceDate: '08 Jan 2026 – 28 Aug 2026',
        crimeClassification: c.crime_category.replace(/_/g, ' '),
        priority: c.priority,
        investigatingOfficer: c.lead_investigator_name || officerName,
        badgeNumber: c.badge_number || officerBadge,
        department: c.department || officerDept,
        courtJurisdiction: `Special Court of Chief Metropolitan Magistrate, ${c.jurisdiction_city}`,
      },

      // 3. Persons Involved
      personsInvolved: {
        suspects: [
          {
            name: (c.lead_suspect ? c.lead_suspect.replace(/\(Alias:[^)]+\)/i, '').trim() : '') || 'Vikramaditya Singhania',
            alias: (c.lead_suspect && c.lead_suspect.includes('Alias:'))
              ? c.lead_suspect.match(/\(Alias:\s*([^)]+)\)/i)?.[1] || 'The Mastermind / Vicky'
              : 'The Mastermind / Vicky',
            role: c.lead_suspect_role || 'Syndicate Kingpin & Financial Architect',
            riskScore: 96,
            status: 'ARRESTED — In Judicial Custody',
            biometricMatch: '99.4% (Aadhaar Facial & Fingerprint)',
            aadhaarMasked: 'XXXX-XXXX-4891',
          },
          {
            name: 'Aman Deep Sharma',
            alias: 'Tech Operator / RootZero',
            role: 'VoIP PBX & Script Handler',
            riskScore: 88,
            status: 'ARRESTED — Remand Day 4',
            biometricMatch: '98.1% (CCTV Cross-Match)',
            aadhaarMasked: 'XXXX-XXXX-7723',
          },
          {
            name: 'Pooja V. Nair',
            alias: 'Account Broker / Ria',
            role: 'Mule Account Aggregator',
            riskScore: 79,
            status: 'WANTED — Non-Bailable Warrant Issued',
            biometricMatch: '94.6% (KYC Video Extraction)',
            aadhaarMasked: 'XXXX-XXXX-3310',
          },
        ],
        victims: [
          {
            name: 'Col. Sanjeev Bakshi (Retd.)',
            city: 'New Delhi',
            lossInr: 1250000,
            reportingDate: '14 Jan 2026',
            channel: '1930 Cyber Helpline',
          },
          {
            name: 'Sunita Mehra',
            city: 'Mumbai',
            lossInr: 850000,
            reportingDate: '18 Jan 2026',
            channel: 'National Cyber Portal (NCRP)',
          },
          {
            name: 'State Infrastructure Power Relay #4',
            city: 'Regional Grid',
            lossInr: 0,
            reportingDate: '22 Jan 2026',
            channel: 'CERT-In Incident Alert',
          },
        ],
        witnesses: [
          {
            name: 'Rameshwar Dayal',
            designation: 'Senior Branch Manager, State Bank of India',
            statementRef: 'PW-1 (Section 161 CrPC)',
            credibility: '100% Corroborated with Core Banking Logs',
          },
          {
            name: 'Dr. Alok Verma',
            designation: 'Senior Scientific Officer, Central Forensic Science Lab',
            statementRef: 'PW-2 (Expert Witness u/s 45 IEA)',
            credibility: 'Certified Forensic Examiner',
          },
        ],
      },

      // 4. Criminal Network Analysis
      networkAnalysis: {
        mastermind: c.lead_suspect,
        keyHubs: [c.lead_suspect, 'Aman Deep Sharma', 'Mule Syndicate Hub #4'],
        nodesCount: 18,
        edgesCount: 42,
        density: 0.64,
        centralityScore: 0.94,
        syndicateClustering: 'High Bipartite Modularity (0.78) with Centralized Financial Dispatcher',
        graphSnapshotDescription: `Graph traversal indicates a 3-tier hub-and-spoke topology. The mastermind maintained strict operational security by communicating exclusively through 2 intermediate brokers, who disseminated commands to 8 disposable mule accounts.`,
      },

      // 5. Timeline Reconstruction
      timeline: [
        {
          time: '04:12 AM',
          date: '14 Jan 2026',
          event: 'Initial spear-phishing / spoofed OTP packet dispatched from IP 185.220.101.5',
          category: 'CYBER',
          location: 'Noida VoIP Server Cluster',
          evidenceRef: 'EVD-DL-2026-03 (PCAP)',
        },
        {
          time: '04:18 AM',
          date: '14 Jan 2026',
          event: 'Unsolicited OTP intercept logged at Cell Tower DL-ND-104 (Lajpat Nagar)',
          category: 'CALL',
          location: 'South Delhi CDR Tower',
          evidenceRef: 'EVD-DL-2026-01 (CDR)',
        },
        {
          time: '04:22 AM',
          date: '14 Jan 2026',
          event: 'First fraudulent transfer of ₹4,50,000 to Mule Account SBI-XXXX-9901',
          category: 'TRANSACTION',
          location: 'SBI Connaught Place',
          evidenceRef: 'FIN-TX-0891 (IMPS)',
        },
        {
          time: '05:05 AM',
          date: '14 Jan 2026',
          event: 'CCTV facial match of Suspect #2 withdrawing cash at Micro-ATM #04',
          category: 'CCTV',
          location: 'Nehru Place Metro Concourse',
          evidenceRef: 'EVD-DL-2026-04 (CCTV 4K)',
        },
        {
          time: '06:30 AM',
          date: '14 Jan 2026',
          event: 'Layered dispersion of remaining funds into Binance P2P OTC Escrow',
          category: 'TRANSACTION',
          location: 'Crypto Gateway',
          evidenceRef: 'TX-ETH-0x891ab',
        },
      ],

      // 6. Financial Intelligence
      financialIntel: {
        totalVolumeInr: totalTracked,
        frozenAmountInr: frozen,
        recoveryRate: recovery,
        launderingHops: [
          {
            hop: 1,
            source: 'Victim Account (Primary Debit)',
            destination: 'Tier-1 Mule: SBI-XXXX-4819',
            channel: 'IMPS Fast Transfer',
            amountInr: 1250000,
            suspiciousScore: 0.94,
          },
          {
            hop: 2,
            source: 'Tier-1 Mule: SBI-XXXX-4819',
            destination: 'Tier-2 Layering: HDFC Shell Account (Apex Trade)',
            channel: 'RTGS Split Transfer',
            amountInr: 800000,
            suspiciousScore: 0.98,
          },
          {
            hop: 3,
            source: 'HDFC Shell Account',
            destination: 'Hawala Courier Cash Settlement & OTC USDT Escrow',
            channel: 'Crypto P2P & Cash Out',
            amountInr: 450000,
            suspiciousScore: 0.99,
          },
        ],
        muleAccountsCount: 14,
        cryptoWalletsCount: 3,
      },

      // 7. Digital Evidence Manifest
      digitalEvidence: [
        {
          code: 'EVD-DL-2026-01',
          name: `OnePlus 12 Recovered from Suspect ${c.lead_suspect}`,
          type: 'Physical Mobile Hardware',
          seizedAt: '18 Jan 2026, 09:30 PM (Lajpat Nagar Safehouse)',
          size: '256 GB Physical Bit-Stream Dump',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          custodyStatus: 'SECURED in Evidence Vault #4',
          section65bAdmissible: true,
        },
        {
          code: 'EVD-DL-2026-02',
          name: 'Batch of 142 Forged Aadhaar, PAN & Biometric Silicon Stamps',
          type: 'Physical Forged Documents',
          seizedAt: '18 Jan 2026, 10:15 PM (Lajpat Nagar Workshop)',
          size: '142 Physical Exhibits',
          sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          custodyStatus: 'IN_FORENSICS (CFSL New Delhi)',
          section65bAdmissible: true,
        },
        {
          code: 'EVD-DL-2026-03',
          name: 'PCAP Packet Capture of Spoofed VoIP C2 Beaconing Traffic',
          type: 'Network PCAP Dump',
          seizedAt: '19 Jan 2026, 02:00 AM (ISP Cloud Mirror)',
          size: '18.4 GB PCAP File',
          sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
          custodyStatus: 'BLOCKCHAIN SEALED',
          section65bAdmissible: true,
        },
      ],

      // 8. Chain of Custody
      chainOfCustody: [
        {
          stepId: 'CUS-01',
          evidenceCode: 'EVD-DL-2026-01',
          handledBy: 'SI Vikramaditya Reddy (HYD-CID-7740)',
          role: 'Seizing Officer',
          action: 'SEIZED at Crime Scene under Section 100 CrPC',
          timestamp: '18 Jan 2026, 09:30 PM',
          transferredTo: 'DSP Arvind Swaminathan (BLR-INT-1102)',
          txHash: '0x81fa901c33b490ae...',
        },
        {
          stepId: 'CUS-02',
          evidenceCode: 'EVD-DL-2026-01',
          handledBy: 'DSP Arvind Swaminathan (BLR-INT-1102)',
          role: 'Senior Forensic Scientist',
          action: 'BIT-STREAM FORENSIC IMAGE EXTRACTED with Tableau Write-Blocker',
          timestamp: '19 Jan 2026, 10:00 AM',
          transferredTo: 'Evidence Vault Custodian',
          txHash: '0x99fe8831cc4100be...',
        },
        {
          stepId: 'CUS-03',
          evidenceCode: 'EVD-DL-2026-02',
          handledBy: 'ACP Rajeshwar Sharma (DEL-IPS-8821)',
          role: 'Lead Investigating Officer',
          action: 'CERTIFICATE GENERATED under Section 65B Bharatiya Sakshya Adhiniyam',
          timestamp: '20 Jan 2026, 04:30 PM',
          transferredTo: 'Special Court Registry',
          txHash: '0x44bc12ef9011ff22...',
        },
      ],

      // 9. Applicable Laws
      applicableLaws: [
        {
          act: 'Bharatiya Nyaya Sanhita, 2023 (BNS) / IPC',
          section: 'Section 318(4) BNS [Sec 420 IPC]',
          title: 'Cheating and dishonestly inducing delivery of property',
          punishment: 'Rigorous Imprisonment up to 7 Years with Fine',
          applicabilityNotes: 'Deceptive inducement of victims into transferring savings via fraudulent phone impersonation.',
        },
        {
          act: 'Bharatiya Nyaya Sanhita, 2023 (BNS) / IPC',
          section: 'Section 61(2) BNS [Sec 120B IPC]',
          title: 'Criminal Conspiracy to commit offences punishable with imprisonment',
          punishment: 'Punishment equal to substantive offence',
          applicabilityNotes: 'Pre-meditated conspiracy between mastermind, VoIP operators, and mule account managers.',
        },
        {
          act: 'Information Technology Act, 2000',
          section: 'Section 66C & 66D',
          title: 'Identity Theft & Cheating by Personation using Computer Resource',
          punishment: 'Imprisonment up to 3 Years and Fine up to ₹1,00,000',
          applicabilityNotes: 'Impersonation of government officials and illegal utilization of victims biometric passwords.',
        },
        {
          act: 'Information Technology Act, 2000',
          section: 'Section 66F',
          title: 'Cyber Terrorism (Threatening State Security / Critical Infrastructure)',
          punishment: 'Imprisonment for Life',
          applicabilityNotes: 'Applied in cases involving deliberate disruptions to electrical power grids or telecom exchanges.',
        },
        {
          act: 'Prevention of Money Laundering Act, 2002',
          section: 'Section 3 & 4 (PMLA)',
          title: 'Offence of Money Laundering & Layering of Proceeds of Crime',
          punishment: 'Rigorous Imprisonment up to 7 Years and Attachment of Property',
          applicabilityNotes: 'Routing criminal proceeds through shell companies and Binance OTC cryptocurrency channels.',
        },
        {
          act: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
          section: 'Section 63 & 65B Admissibility',
          title: 'Special provisions as to electronic evidence non-repudiation',
          punishment: 'Statutory Admissibility Mandate',
          applicabilityNotes: 'Ensures cryptographic SHA-256 integrity and chain of custody compliance for all submitted exhibits.',
        },
      ],

      // 10. AI Findings & Prosecution Strategy
      aiFindings: {
        confidenceScore: 98.6,
        smokingGuns: [
          'Unique IMEI & WiFi MAC Address of seized OnePlus 12 matched the admin session login on the Telegram C2 server.',
          'Synchronized CDR cell-tower ping directly overlapped with ATM CCTV footage at the exact second of cash withdrawal.',
          'Forensic hash of seized forged Aadhaar card batch matched 100% with the documents used to open SBI Mule Account #4819.',
          'Unbroken cryptographic SHA-256 Merkle tree logged on Hyperledger Besu proving zero evidence tampering since seizure.',
        ],
        prosecutionStrategy: [
          'File Formal Charge Sheet under BNS 318(4), 61(2), IT Act 66D, 66F, and PMLA Section 3.',
          'Oppose bail under stringent provisions of Section 45 PMLA and Section 66F IT Act due to high flight risk and cross-border proceeds.',
          'Introduce Section 65B BSA 2023 Certificate (ID: ' + `CERT-65B-${c.fir_number.replace(/\//g, '-')}` + ') along with forensic CFSL expert witness testimony.',
          'Issue formal Section 102 CrPC notices to Binance and banking channels for final forfeiture and restitution to victims.',
        ],
        bailOppositionGrounds: [
          'Primary accused possesses active offshore cryptocurrency keys and flight risk capability.',
          'Tampering with remaining unapprehended mule network and witness intimidation risk is classified CRITICAL.',
          'Offence involves economic sabotage exceeding statutory threshold under PMLA Schedule of Offences.',
        ],
        recommendedCharges: [
          'BNS Section 318(4) (Aggravated Cheating)',
          'BNS Section 61(2) (Criminal Conspiracy)',
          'BNS Section 336(3) (Forgery for Purpose of Cheating)',
          'IT Act Section 66C & 66D (Cyber Personation & ID Theft)',
          'IT Act Section 66F (Cyber Terrorism — where applicable)',
          'PMLA Section 3 & 4 (Money Laundering & Proceeds Layering)',
        ],
      },
    },
  };
}

/**
 * Generates the full list of mock reports for authorized cases.
 */
export function getAllForensicDossiers(
  officerName = 'ACP Rajeshwar Sharma',
  authorBadge = 'DEL-IPS-8821',
  department = 'Special Cell / Cyber Crime Unit',
  allowedCases?: any[]
): ForensicDossier[] {
  const targetCases = (allowedCases && allowedCases.length > 0) ? allowedCases : ALL_CASES;
  return targetCases.map((c, idx) => {
    // Make 1 of the reports "Outdated" so the user can showcase the Regenerate flow!
    const isOutdated = idx === 1;
    return buildDossierForCase(c, officerName, authorBadge, department, isOutdated);
  });
}

function pseudoSha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}e44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 64);
}
