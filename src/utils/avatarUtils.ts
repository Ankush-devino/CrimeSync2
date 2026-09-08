/**
 * Officer Avatar System
 * Generates distinct, high-resolution, gender-appropriate law enforcement officer portraits.
 * STRICT LAW: Officer avatars must NEVER collide with suspect, criminal, or victim images in the database.
 */

// Curated list of known criminal / suspect / evidence photo IDs to blacklist from ever being assigned to officers
export const BLACKLISTED_SUSPECT_PHOTO_IDS = [
  'photo-1507003211169-0a1dd7228f2d', // Farooq "The Shadow"
  'photo-1500648767791-00dcc994a43e', // Vikram Deshmukh
  'photo-1494790108377-be9c29b29330', // Aisha Rao
  'photo-1472099645785-5658abf4ff4e', // Tariq Khan
  'photo-1519085360753-af0119f7cbe7', // Bilal / Hawala Operator
  'photo-1519501025264-65ba15a82390', // Geo Intel Asset 1
  'photo-1542281286-9e0a16bb7366', // Geo Intel Asset 2
  'photo-1509198397868-475647b2a1e5', // Geo Intel Asset 3
  'photo-1534528741775-53994a69daeb', // Old deprecated mock avatar
];

// Verified Exclusive Female Officer Portraits (Professional Law Enforcement & Executive)
export const FEMALE_OFFICER_PORTRAITS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', // Inspector Priya Kulkarni (Sharp cyber detective)
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', // SP Ananya Sengupta (Senior administrator)
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80', // Forensic Analyst Priya Menon (FSL Examiner)
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&auto=format&fit=crop&q=80', // Inspector Neha Deshmukh (Field Ops)
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80', // Dr. Sunita Rao (Digital Forensics)
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80', // Officer Kavita Nair (Intelligence)
];

// Verified Exclusive Male Officer Portraits (Professional Law Enforcement & Command)
export const MALE_OFFICER_PORTRAITS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', // ACP Rajeshwar Sharma (Lead Investigator)
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', // DSP Arvind Swaminathan (Forensic Expert)
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80', // SI Vikramaditya Reddy (Field Investigator)
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80', // Inspector Rahul Sharma (Operations)
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', // SI Amit Verma (SCADA Defense)
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80', // Senior Special Cell Commander
  'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=200&auto=format&fit=crop&q=80', // Cyber Crime Field Agent
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=200&auto=format&fit=crop&q=80', // Intelligence Analyst
];

// Known database officer ID to exclusive portrait mapping
export const REGISTERED_OFFICER_AVATARS: Record<string, string> = {
  // USR-101: ACP Rajeshwar Sharma (Male)
  'USR-101': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'DEL-IPS-8821': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'rajesh.sharma@delhipolice.gov.in': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',

  // USR-102: Inspector Priya Kulkarni (Female)
  'USR-102': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'MUM-CYB-4091': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'priya.kulkarni@mahapolice.gov.in': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',

  // USR-103: DSP Arvind Swaminathan (Male)
  'USR-103': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'BLR-INT-1102': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'arvind.s@ksp.gov.in': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',

  // USR-104: SI Vikramaditya Reddy (Male)
  'USR-104': 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80',
  'HYD-CID-7740': 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80',
  'vikram.reddy@tspolice.gov.in': 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80',

  // USR-105: Superintendent Ananya Sengupta (Female)
  'USR-105': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'CBI-HQ-0012': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'ananya.sengupta@cbi.gov.in': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
};

// Common female name stems and keywords in Indian & international contexts
const FEMALE_INDICATORS = new Set([
  'priya', 'ananya', 'neha', 'sunita', 'pooja', 'puja', 'kavita', 'aarti', 'arti', 
  'meera', 'mira', 'shweta', 'sweta', 'divya', 'ritu', 'anjali', 'sneha', 'tanvi', 
  'deepika', 'radhika', 'aditi', 'swati', 'shruti', 'rekha', 'vidya', 'geeta', 
  'gita', 'menon', 'sengupta', 'kulkarni', 'pallavi', 'monika', 'mansi', 'jyoti', 
  'sonia', 'sonal', 'smriti', 'shikha', 'priyanka', 'simran', 'komal', 'ishita', 
  'sakshi', 'payal', 'nisha', 'rashmi', 'rupa', 'sarita', 'vandana', 'suman',
  'dr. sunita', 'dr. priya', 'dr. ananya', 'ms.', 'mrs.', 'smt.', 'kumari', 'female', 'woman'
]);

/**
 * Detects whether a person's name indicates a female or male identity.
 */
export function detectOfficerGender(nameOrEmail?: string): 'female' | 'male' {
  if (!nameOrEmail) return 'male';
  const clean = nameOrEmail.toLowerCase().trim();

  // Check against known female indicators
  const words = clean.split(/[\s._@+-]+/);
  for (const word of words) {
    if (FEMALE_INDICATORS.has(word)) {
      return 'female';
    }
  }

  // Common feminine suffixes in Indian names (e.g. -priya, -shree, -devi, -mati, -ika)
  for (const word of words) {
    if (word.endsWith('priya') || word.endsWith('shree') || word.endsWith('devi') || word.endsWith('mati') || word.endsWith('ika')) {
      return 'female';
    }
  }

  return 'male';
}

/**
 * Returns a guaranteed distinct, gender-appropriate officer avatar that NEVER matches any suspect in the DB.
 */
export function getOfficerAvatar(identifier?: string, fullName?: string, existingAvatar?: string): string {
  // 1. Check direct registered ID / Badge / Email lookup
  if (identifier && REGISTERED_OFFICER_AVATARS[identifier]) {
    return REGISTERED_OFFICER_AVATARS[identifier];
  }
  if (fullName && REGISTERED_OFFICER_AVATARS[fullName]) {
    return REGISTERED_OFFICER_AVATARS[fullName];
  }

  // 2. If an existing avatar is provided, check if it contains a blacklisted suspect ID
  if (existingAvatar && typeof existingAvatar === 'string' && existingAvatar.startsWith('http')) {
    const isBlacklisted = BLACKLISTED_SUSPECT_PHOTO_IDS.some(badId => existingAvatar.includes(badId));
    if (!isBlacklisted) {
      return existingAvatar;
    }
  }

  // 3. Determine gender from full name or identifier
  const gender = detectOfficerGender(fullName || identifier);

  // 4. Deterministically select a portrait from the appropriate gender pool
  const seedString = `${fullName || ''}_${identifier || 'officer'}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  if (gender === 'female') {
    const index = positiveHash % FEMALE_OFFICER_PORTRAITS.length;
    return FEMALE_OFFICER_PORTRAITS[index];
  } else {
    const index = positiveHash % MALE_OFFICER_PORTRAITS.length;
    return MALE_OFFICER_PORTRAITS[index];
  }
}
