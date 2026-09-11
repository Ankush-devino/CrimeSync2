// Global Live Activity Logger for ACP Raj Verma
// Captures real-time telemetry & user actions performed by ACP Raj Verma across all pages

export interface OfficerActivity {
  id: string;
  timestamp: string;
  timeAgo: string;
  action: string;
  module: string;
  caseId: string;
  status: 'Success' | 'Authorized' | 'Completed' | 'Active';
  details?: string;
  category?: 'EVIDENCE' | 'COPILOT' | 'GRAPH' | 'CASES' | 'TIMELINE' | 'GEO' | 'AUTH' | 'REPORT' | 'SECURITY' | 'FINANCIAL';
}

const STORAGE_KEY = 'crimesync_acp_raj_verma_activities_v2';
const EVENT_NAME = 'crimesync:officer-activity-update';

export const DEFAULT_INITIAL_ACTIVITIES: OfficerActivity[] = [
  {
    id: 'ACT-INIT-1',
    timestamp: '10:48 PM',
    timeAgo: 'Just now',
    action: 'Inspected Evidence Exhibit #EV-1246',
    module: 'Evidence DNA',
    caseId: 'CR-2026-0417',
    status: 'Success',
    category: 'EVIDENCE',
    details: 'Verified SHA-256 digital custody seal: 9f83c18b... for Hawala Transaction Ledger image'
  },
  {
    id: 'ACT-INIT-2',
    timestamp: '10:42 PM',
    timeAgo: '6 min ago',
    action: 'Prompted AI Copilot for Syndicate Risk Analysis',
    module: 'AI Copilot',
    caseId: 'CR-2026-0417',
    status: 'Completed',
    category: 'COPILOT',
    details: 'Query: "Analyze primary money laundering kingpins connected to South Delhi Hawala network"'
  },
  {
    id: 'ACT-INIT-3',
    timestamp: '10:35 PM',
    timeAgo: '13 min ago',
    action: 'Traversed Entity Links in Neo4j Knowledge Graph',
    module: 'Knowledge Graph',
    caseId: 'CR-2026-0417',
    status: 'Success',
    category: 'GRAPH',
    details: 'Expanded 3-degree shortest path connecting suspect Vikram Malhotra to Shell Corp #904'
  },
  {
    id: 'ACT-INIT-4',
    timestamp: '10:28 PM',
    timeAgo: '20 min ago',
    action: 'Switched Active Investigation to FIR-2026-0881',
    module: 'Case Selector',
    caseId: 'CR-2026-0417',
    status: 'Success',
    category: 'CASES',
    details: 'Focused operational workspace on "South Delhi Cyber Fraud & Extortion Syndicate"'
  },
  {
    id: 'ACT-INIT-5',
    timestamp: '10:19 PM',
    timeAgo: '29 min ago',
    action: 'Triangulated Satellite Cell Tower CDR Coordinates',
    module: 'Geo Intelligence',
    caseId: 'CR-2026-0417',
    status: 'Success',
    category: 'GEO',
    details: 'Swept 2.5km radius around Nehru Place tower handoffs for 3 burner mobile devices'
  },
  {
    id: 'ACT-INIT-6',
    timestamp: '10:10 PM',
    timeAgo: '38 min ago',
    action: 'Approved Section 65B Electronic Court Certificate',
    module: 'Reports & Dossiers',
    caseId: 'CR-2026-0417',
    status: 'Authorized',
    category: 'REPORT',
    details: 'Digitally signed Indian Evidence Act compliant electronic evidence dossier for Court Tribunal'
  },
  {
    id: 'ACT-INIT-7',
    timestamp: '09:55 PM',
    timeAgo: '53 min ago',
    action: 'Reconstructed 4D Crime Time Machine Sequence',
    module: 'Time Machine',
    caseId: 'CR-2026-0152',
    status: 'Success',
    category: 'TIMELINE',
    details: 'Synchronized CCTV entry timestamps with automated number plate recognition logs'
  },
  {
    id: 'ACT-INIT-8',
    timestamp: '09:40 PM',
    timeAgo: '1.1 hrs ago',
    action: 'Audited Blockchain Merkle Root Block #15842',
    module: 'Blockchain Explorer',
    caseId: 'CR-2026-0417',
    status: 'Success',
    category: 'EVIDENCE',
    details: 'Validated immutability state proofs across 14 new digital evidence hashes'
  },
  {
    id: 'ACT-INIT-9',
    timestamp: '09:25 PM',
    timeAgo: '1.3 hrs ago',
    action: 'Triaged Honeypot Tripwire Alert #TRIP-884',
    module: 'Deception Network',
    caseId: 'CR-2026-0417',
    status: 'Authorized',
    category: 'CASES',
    details: 'Intercepted unauthorized access attempt against decoy FIR_999_HONEY.pdf canary token'
  },
  {
    id: 'ACT-INIT-10',
    timestamp: '09:10 PM',
    timeAgo: '1.5 hrs ago',
    action: 'Biometric Officer Login (ACP Raj Verma)',
    module: 'Authentication',
    caseId: 'SYSTEM',
    status: 'Authorized',
    category: 'AUTH',
    details: 'PKI Smart Card + Hardware WebAuthn FIDO2 token authenticated at Command Station VIP'
  }
];

export function getOfficerActivities(): OfficerActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_ACTIVITIES));
      return DEFAULT_INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_INITIAL_ACTIVITIES;
  }
}

export function getOfficerLogs(officerId?: string): OfficerActivity[] {
  return getOfficerActivities();
}

export function clearOfficerActivities(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
    }
  } catch (e) {
    console.error('Failed to clear activities', e);
  }
}

export function logOfficerAction(payload: {
  action: string;
  module: string;
  caseId?: string;
  status?: 'Success' | 'Authorized' | 'Completed' | 'Active';
  details?: string;
  category?: OfficerActivity['category'];
}): OfficerActivity {
  const current = getOfficerActivities();
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newEntry: OfficerActivity = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: timeString,
    timeAgo: 'Just now',
    action: payload.action,
    module: payload.module,
    caseId: payload.caseId || 'CR-2026-0417',
    status: payload.status || 'Success',
    details: payload.details || `ACP Raj Verma performed ${payload.action} in ${payload.module}`,
    category: payload.category || 'CASES'
  };

  // Avoid duplicate back-to-back duplicate action spam
  if (current.length > 0 && current[0].action === newEntry.action && current[0].module === newEntry.module) {
    return current[0];
  }

  const updated = [newEntry, ...current].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save officer activity', e);
  }

  // Dispatch custom window event for real-time live sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newEntry }));
  }

  return newEntry;
}

export function subscribeToOfficerActivities(callback: (activities: OfficerActivity[]) => void): () => void {
  const handleUpdate = () => {
    callback(getOfficerActivities());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}
