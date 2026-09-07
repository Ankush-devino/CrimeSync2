export interface StatutoryCharge {
  code: string;
  act: string;
  offence: string;
  maxPenalty: string;
  bailable: 'NON-BAILABLE' | 'BAILABLE';
  cognizable: 'COGNIZABLE' | 'NON-COGNIZABLE';
  courtJurisdiction: string;
}

export interface CaseLawProfile {
  caseId?: string;
  category: string;
  primaryAct: string;
  statutoryRemandDeadlineDays: number;
  overallBailStatus: 'NON-BAILABLE' | 'BAILABLE';
  legalSynopsis: string;
  charges: StatutoryCharge[];
}

export const CASE_SPECIFIC_LAWS: Record<string, CaseLawProfile> = {
  // Case 1: Hawala & Phishing Syndicate
  'CASE-2026-001': {
    caseId: 'CASE-2026-001',
    category: 'FINANCIAL_FRAUD',
    primaryAct: 'Money Laundering & Online Fraud Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Stealing personal IDs, opening fake bank accounts, and moving black money through secret channels.',
    charges: [
      {
        code: 'IPC Section 420',
        act: 'Indian Penal Code',
        offence: 'Online Cheating & Fraud',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Cyber Special Court',
      },
      {
        code: 'IT Act Section 66D',
        act: 'IT Act 2000',
        offence: 'Fake Online Identity',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Cyber Crime Court',
      },
      {
        code: 'PMLA Section 3 & 4',
        act: 'Money Laundering Act',
        offence: 'Money Laundering',
        maxPenalty: 'Up to 7 Years Jail + Assets Seized',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special PMLA Court',
      },
      {
        code: 'IPC Section 120B',
        act: 'Indian Penal Code',
        offence: 'Criminal Gang Planning',
        maxPenalty: 'Matches main crime up to 7 Years',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'District Sessions Court',
      },
    ],
  },

  // Case 2: SCADA Power Grid Cyber Attack
  'CASE-2026-002': {
    caseId: 'CASE-2026-002',
    category: 'CYBER_ATTACK',
    primaryAct: 'Cyber Terrorism & National Security Laws',
    statutoryRemandDeadlineDays: 90,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Hacking attempts into state electricity control systems to shut down the power grid.',
    charges: [
      {
        code: 'IT Act Section 66F',
        act: 'IT Act 2000',
        offence: 'Cyber Terrorism',
        maxPenalty: 'Life Imprisonment without Parole',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'NIA Special Court',
      },
      {
        code: 'IT Act Section 43 & 66',
        act: 'IT Act 2000',
        offence: 'Hacking & System Sabotage',
        maxPenalty: 'Up to 3 Years Jail + ₹5 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Crime Court',
      },
      {
        code: 'IPC Section 121',
        act: 'Indian Penal Code',
        offence: 'Attacking the Nation',
        maxPenalty: 'Life Imprisonment',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'High Court / Special NIA',
      },
      {
        code: 'CII Protection Rule 4',
        act: 'Critical Infrastructure Framework',
        offence: 'Critical Network Breach',
        maxPenalty: 'Up to 10 Years Jail',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Infrastructure Tribunal',
      },
    ],
  },

  // Case 3: Counterfeit SIM & VoIP Spoofing Ring
  'CASE-2026-003': {
    caseId: 'CASE-2026-003',
    category: 'ORGANIZED_SYNDICATE',
    primaryAct: 'Illegal Telecom & Fake ID Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Running fake phone call centers with illegal SIM cards and forged identity papers.',
    charges: [
      {
        code: 'Telegraph Act Sec 20/25',
        act: 'Indian Telegraph Act',
        offence: 'Illegal Phone Routing',
        maxPenalty: 'Up to 3 Years Jail + Hardware Seized',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Judicial Magistrate',
      },
      {
        code: 'Aadhaar Act Sec 42 & 43',
        act: 'Aadhaar Act',
        offence: 'Misusing Aadhaar Data',
        maxPenalty: 'Up to 3 Years Jail + ₹10 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Telecom Magistrate Court',
      },
      {
        code: 'IPC Section 468 & 471',
        act: 'Indian Penal Code',
        offence: 'Making Fake ID Papers',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court',
      },
      {
        code: 'IT Act Section 66C',
        act: 'IT Act 2000',
        offence: 'OTP & Password Theft',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Court',
      },
    ],
  },

  // Case 4: Cross-Border Tech Support & Crypto Scam
  'CASE-2026-004': {
    caseId: 'CASE-2026-004',
    category: 'FINANCIAL_FRAUD',
    primaryAct: 'Foreign Exchange & Call Center Fraud Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Fake tech support call centers tricking foreigners and sending stolen money abroad in crypto.',
    charges: [
      {
        code: 'IPC Section 419 & 420',
        act: 'Indian Penal Code',
        offence: 'Fake Tech Support Scam',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'CBI Special Court',
      },
      {
        code: 'FEMA Section 3 & 4',
        act: 'Foreign Exchange Act',
        offence: 'Illegal Foreign Money Transfer',
        maxPenalty: '300% Fine on Stolen Amount',
        bailable: 'BAILABLE',
        cognizable: 'NON-COGNIZABLE',
        courtJurisdiction: 'Enforcement Directorate',
      },
      {
        code: 'IT Act Section 66D',
        act: 'IT Act 2000',
        offence: 'Screen Share Hacking',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Cyber Crime Magistrate',
      },
      {
        code: 'IPC Section 120B',
        act: 'Indian Penal Code',
        offence: 'Organized Call Center Ring',
        maxPenalty: 'Matches main crime up to 7 Years',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court',
      },
    ],
  },

  // Case 5: Digital Arrest & Fake CBI Extortion
  'CASE-2026-005': {
    caseId: 'CASE-2026-005',
    category: 'ORGANIZED_SYNDICATE',
    primaryAct: 'Fake Police Impersonation & Extortion Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Pretending to be police or CBI officers on video calls and threatening victims for money.',
    charges: [
      {
        code: 'IPC Section 170',
        act: 'Indian Penal Code',
        offence: 'Pretending to be Police or CBI',
        maxPenalty: 'Up to 2 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Metropolitan Magistrate',
      },
      {
        code: 'IPC Section 386',
        act: 'Indian Penal Code',
        offence: 'Threatening Victims for Money',
        maxPenalty: 'Up to 10 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Court of Session',
      },
      {
        code: 'IPC Section 342',
        act: 'Indian Penal Code',
        offence: 'Fake Digital House Arrest',
        maxPenalty: 'Up to 1 Year Jail or Fine',
        bailable: 'BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Magistrate Court',
      },
      {
        code: 'IT Act Section 66D',
        act: 'IT Act 2000',
        offence: 'Sending Fake Arrest Warrants',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Court',
      },
    ],
  },

  // Case 6: Biometric & AePS Micro-ATM Bypass
  'CASE-2026-006': {
    caseId: 'CASE-2026-006',
    category: 'IDENTITY_THEFT',
    primaryAct: 'Biometric Theft & Micro-ATM Fraud Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Making fake rubber fingerprints from property papers to steal cash from micro-ATMs.',
    charges: [
      {
        code: 'Aadhaar Act Sec 42',
        act: 'Aadhaar Act',
        offence: 'Stealing Biometric Fingerprints',
        maxPenalty: 'Up to 3 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Judicial Magistrate',
      },
      {
        code: 'IT Act Section 66C',
        act: 'IT Act 2000',
        offence: 'Cloning Biometrics',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Cyber Crime Court',
      },
      {
        code: 'IPC Section 467',
        act: 'Indian Penal Code',
        offence: 'Forging Land Deed Papers',
        maxPenalty: 'Up to 10 Years or Life in Jail',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Court of Session',
      },
      {
        code: 'Payment Act Sec 26',
        act: 'Payment Systems Act',
        offence: 'Illegal ATM Cashouts',
        maxPenalty: 'Up to 3 Years Jail + ₹10 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Economic Offences Court',
      },
    ],
  },

  // Case 7: AI Deepfake Video Extortion
  'CASE-2026-007': {
    caseId: 'CASE-2026-007',
    category: 'CYBER_ATTACK',
    primaryAct: 'Cyber Blackmail & Privacy Protection Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Creating fake AI videos of people and demanding money to not share them online.',
    charges: [
      {
        code: 'IT Act Section 66E',
        act: 'IT Act 2000',
        offence: 'Invading Privacy',
        maxPenalty: 'Up to 3 Years Jail or ₹2 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Crime Court',
      },
      {
        code: 'IT Act Section 67A',
        act: 'IT Act 2000',
        offence: 'Sharing Inappropriate Media',
        maxPenalty: 'Up to 5 Years Jail + ₹10 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court',
      },
      {
        code: 'IPC Section 503 & 506',
        act: 'Indian Penal Code',
        offence: 'Blackmail & Threats',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Metropolitan Magistrate',
      },
      {
        code: 'IPC Section 469',
        act: 'Indian Penal Code',
        offence: 'Making Fake AI Faces',
        maxPenalty: 'Up to 3 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'First Class Magistrate',
      },
    ],
  },

  // Case 8: Instant Loan App & Hawala Funnel
  'CASE-2026-008': {
    caseId: 'CASE-2026-008',
    category: 'FINANCIAL_FRAUD',
    primaryAct: 'Illegal Loan Apps & Harassment Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Illegal mobile apps that steal phone photos and contacts, followed by abusive blackmail calls.',
    charges: [
      {
        code: 'RBI Act Sec 45-IA',
        act: 'Reserve Bank of India Act',
        offence: 'Unlicensed Loan Business',
        maxPenalty: 'Up to 5 Years Jail + ₹5 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Economic Offences Court',
      },
      {
        code: 'IT Act Section 43b',
        act: 'IT Act 2000',
        offence: 'Stealing Phone Photos & Contacts',
        maxPenalty: 'Up to 3 Years Jail + ₹5 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Cyber Crime Court',
      },
      {
        code: 'IPC Section 384 & 509',
        act: 'Indian Penal Code',
        offence: 'Abusive Blackmail Calls',
        maxPenalty: 'Up to 3 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Metropolitan Magistrate',
      },
      {
        code: 'PMLA Section 3',
        act: 'Money Laundering Act',
        offence: 'Sending Extorted Money Abroad',
        maxPenalty: 'Up to 7 Years Jail + Assets Seized',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special PMLA Court',
      },
    ],
  },

  // Case 9: Power Grid SCADA Ransomware Infiltration
  'CASE-2026-009': {
    caseId: 'CASE-2026-009',
    category: 'CYBER_ATTACK',
    primaryAct: 'Critical Infrastructure Protection & Cyber Terrorism',
    statutoryRemandDeadlineDays: 90,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Planting ransomware viruses into regional power station computers to cause city blackouts.',
    charges: [
      {
        code: 'IT Act Section 66F',
        act: 'IT Act 2000',
        offence: 'Cyber Terrorism',
        maxPenalty: 'Life Imprisonment without Parole',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'NIA Special Court',
      },
      {
        code: 'IT Act Section 66',
        act: 'IT Act 2000',
        offence: 'Ransomware Virus Attack',
        maxPenalty: 'Up to 3 Years Jail + ₹5 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Court',
      },
      {
        code: 'IPC Section 120B',
        act: 'Indian Penal Code',
        offence: 'Conspiracy for City Blackout',
        maxPenalty: 'Matches main crime Life in Prison',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court / NIA',
      },
    ],
  },
};

// Fallback legal profile by crime category
export const CATEGORY_DEFAULT_LAWS: Record<string, CaseLawProfile> = {
  FINANCIAL_FRAUD: {
    category: 'FINANCIAL_FRAUD',
    primaryAct: 'Online Cheating & Financial Fraud Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Stealing money online, fake banking transfers, and moving black money.',
    charges: [
      {
        code: 'IPC Section 420',
        act: 'Indian Penal Code',
        offence: 'Online Cheating & Fraud',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Judicial Magistrate',
      },
      {
        code: 'IT Act Section 66D',
        act: 'IT Act 2000',
        offence: 'Online Impersonation',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Crime Court',
      },
    ],
  },
  CYBER_ATTACK: {
    category: 'CYBER_ATTACK',
    primaryAct: 'Hacking & Cyber Crime Laws',
    statutoryRemandDeadlineDays: 90,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Breaking into computers without permission, planting viruses, and locking systems.',
    charges: [
      {
        code: 'IT Act Section 66F',
        act: 'IT Act 2000',
        offence: 'Cyber Terrorism',
        maxPenalty: 'Life Imprisonment',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'NIA / Special Cyber Court',
      },
      {
        code: 'IT Act Section 43 & 66',
        act: 'IT Act 2000',
        offence: 'Computer Hacking & Data Damage',
        maxPenalty: 'Up to 3 Years Jail + ₹5 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Crime Court',
      },
    ],
  },
  ORGANIZED_SYNDICATE: {
    category: 'ORGANIZED_SYNDICATE',
    primaryAct: 'Organized Crime & Extortion Laws',
    statutoryRemandDeadlineDays: 90,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Criminal gang working together to threaten people and run illegal operations.',
    charges: [
      {
        code: 'IPC Section 120B',
        act: 'Indian Penal Code',
        offence: 'Gang Conspiracy',
        maxPenalty: 'Matches main crime',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court',
      },
      {
        code: 'IPC Section 384',
        act: 'Indian Penal Code',
        offence: 'Extortion & Threatening',
        maxPenalty: 'Up to 3 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Judicial Magistrate',
      },
    ],
  },
  IDENTITY_THEFT: {
    category: 'IDENTITY_THEFT',
    primaryAct: 'Identity Theft & Forgery Laws',
    statutoryRemandDeadlineDays: 60,
    overallBailStatus: 'NON-BAILABLE',
    legalSynopsis: 'Stealing personal IDs, fake fingerprints, and creating forged documents.',
    charges: [
      {
        code: 'IT Act Section 66C',
        act: 'IT Act 2000',
        offence: 'Identity & Password Theft',
        maxPenalty: 'Up to 3 Years Jail + ₹1 Lakh Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Special Cyber Crime Court',
      },
      {
        code: 'IPC Section 468',
        act: 'Indian Penal Code',
        offence: 'Making Fake Papers',
        maxPenalty: 'Up to 7 Years Jail + Fine',
        bailable: 'NON-BAILABLE',
        cognizable: 'COGNIZABLE',
        courtJurisdiction: 'Sessions Court',
      },
    ],
  },
};

export function getApplicableLawForCase(caseId?: string, category?: string): CaseLawProfile {
  if (caseId && CASE_SPECIFIC_LAWS[caseId]) {
    return CASE_SPECIFIC_LAWS[caseId];
  }
  if (category && CATEGORY_DEFAULT_LAWS[category]) {
    return CATEGORY_DEFAULT_LAWS[category];
  }
  return CASE_SPECIFIC_LAWS['CASE-2026-001'];
}
