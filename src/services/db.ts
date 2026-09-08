// NCRB & Ministry of Home Affairs - Database & RBAC Service Layer
// Enterprise Relational Integration with PostgreSQL `users` & `cases`

import { api } from './api';
import { ALL_CASES } from '../constants/cases';
import { getOfficerAvatar } from '../utils/avatarUtils';

export type UserRole = 
  | 'ACP' 
  | 'LEAD_INVESTIGATOR'
  | 'INSPECTOR' 
  | 'CYBER_ANALYST'
  | 'SUB_INSPECTOR' 
  | 'FIELD_OFFICER'
  | 'FORENSIC_ANALYST'
  | 'FORENSIC_EXPERT'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  badgeNumber: string;
  department: string;
  jurisdiction: string;
  clearanceLevel: string;
  clearanceCode: number;
  avatar: string;
  phone: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'RESTRICTED';
  accessibleCases?: string[];
}

export interface RolePermissions {
  canViewAllCases: boolean;
  canLodgeFIR: boolean;
  canEditCaseStatus: boolean;
  canAddSuspects: boolean;
  canAddEvidence: boolean;
  canEditEvidence: boolean;
  canAddDiaryNotes: boolean;
  canEditDiaryNotes: boolean;
  canViewFinancialTrail: boolean;
  canDeployDeceptionHoney: boolean;
  canSimulateBlastRadius: boolean;
  canAccessBlockchainLedger: boolean;
  canExportDossiers: boolean;
  isReadOnly: boolean;
}

// ─── ROLE PERMISSION MATRIX ────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  ACP: {
    canViewAllCases: true,
    canLodgeFIR: true,
    canEditCaseStatus: true,
    canAddSuspects: true,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: true,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: true,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: false,
  },
  LEAD_INVESTIGATOR: {
    canViewAllCases: true,
    canLodgeFIR: true,
    canEditCaseStatus: true,
    canAddSuspects: true,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: true,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: true,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: false,
  },
  INSPECTOR: {
    canViewAllCases: false,
    canLodgeFIR: true,
    canEditCaseStatus: true,
    canAddSuspects: true,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: true,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: true,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: false,
  },
  CYBER_ANALYST: {
    canViewAllCases: false,
    canLodgeFIR: true,
    canEditCaseStatus: true,
    canAddSuspects: true,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: true,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: true,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: false,
  },
  SUB_INSPECTOR: {
    canViewAllCases: false,
    canLodgeFIR: false,
    canEditCaseStatus: false,
    canAddSuspects: false,
    canAddEvidence: true,
    canEditEvidence: false,
    canAddDiaryNotes: true,
    canEditDiaryNotes: false,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: false,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: false,
    isReadOnly: false,
  },
  FIELD_OFFICER: {
    canViewAllCases: false,
    canLodgeFIR: false,
    canEditCaseStatus: false,
    canAddSuspects: false,
    canAddEvidence: true,
    canEditEvidence: false,
    canAddDiaryNotes: true,
    canEditDiaryNotes: false,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: false,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: false,
    isReadOnly: false,
  },
  FORENSIC_ANALYST: {
    canViewAllCases: false,
    canLodgeFIR: false,
    canEditCaseStatus: false,
    canAddSuspects: false,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: false,
    canViewFinancialTrail: false,
    canDeployDeceptionHoney: false,
    canSimulateBlastRadius: false,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: true,
  },
  FORENSIC_EXPERT: {
    canViewAllCases: false,
    canLodgeFIR: false,
    canEditCaseStatus: false,
    canAddSuspects: false,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: false,
    canViewFinancialTrail: false,
    canDeployDeceptionHoney: false,
    canSimulateBlastRadius: false,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: true,
  },
  ADMIN: {
    canViewAllCases: true,
    canLodgeFIR: true,
    canEditCaseStatus: true,
    canAddSuspects: true,
    canAddEvidence: true,
    canEditEvidence: true,
    canAddDiaryNotes: true,
    canEditDiaryNotes: true,
    canViewFinancialTrail: true,
    canDeployDeceptionHoney: true,
    canSimulateBlastRadius: true,
    canAccessBlockchainLedger: true,
    canExportDossiers: true,
    isReadOnly: false,
  },
};

export const ROLE_CASE_MAPPINGS: Record<string, string[]> = {
  ACP: ['*'],
  LEAD_INVESTIGATOR: ['*'],
  ADMIN: ['*'],
  CYBER_ANALYST: ['CASE-2026-002', 'CASE-2026-005'],
  INSPECTOR: ['CASE-2026-001', 'CASE-2026-004'],
  FORENSIC_EXPERT: ['CASE-2026-003', 'CASE-2026-007'],
  FORENSIC_ANALYST: ['CASE-2026-003', 'CASE-2026-007'],
  FIELD_OFFICER: ['CASE-2026-006', 'CASE-2026-008'],
  SUB_INSPECTOR: ['CASE-2026-006', 'CASE-2026-008'],
};

export const OFFICER_EXPLICIT_CASE_ACCESS: Record<string, string[]> = {
  'USR-101': ['*'],
  'DEL-IPS-8821': ['*'],
  'rajesh.sharma@delhipolice.gov.in': ['*'],

  'USR-102': ['CASE-2026-002', 'CASE-2026-005'],
  'MUM-CYB-4091': ['CASE-2026-002', 'CASE-2026-005'],
  'priya.kulkarni@mahapolice.gov.in': ['CASE-2026-002', 'CASE-2026-005'],

  'USR-103': ['CASE-2026-003', 'CASE-2026-007'],
  'BLR-INT-1102': ['CASE-2026-003', 'CASE-2026-007'],
  'arvind.s@ksp.gov.in': ['CASE-2026-003', 'CASE-2026-007'],

  'USR-104': ['CASE-2026-006', 'CASE-2026-008'],
  'HYD-CID-7740': ['CASE-2026-006', 'CASE-2026-008'],
  'vikram.reddy@tspolice.gov.in': ['CASE-2026-006', 'CASE-2026-008'],

  'USR-105': ['*'],
  'CBI-HQ-0012': ['*'],
  'ananya.sengupta@cbi.gov.in': ['*'],
};

export function mapDatabaseUserToOfficer(dbUser: any, token?: string, accessibleCases?: string[]): User {
  const role = (dbUser.role || 'LEAD_INVESTIGATOR') as UserRole;
  
  const roleTitleMap: Record<string, string> = {
    LEAD_INVESTIGATOR: 'Assistant Commissioner of Police (ACP)',
    ACP: 'Assistant Commissioner of Police (ACP)',
    CYBER_ANALYST: 'Cyber Crime Inspector',
    INSPECTOR: 'Inspector of Police',
    FORENSIC_EXPERT: 'Senior Forensic Scientist (FSL)',
    FORENSIC_ANALYST: 'Senior Digital Forensics Examiner',
    FIELD_OFFICER: 'Sub Inspector (Field & Cyber Ops)',
    SUB_INSPECTOR: 'Sub Inspector of Police',
    ADMIN: 'Superintendent of Police (Admin / HQ)',
  };

  const isHighClearance = role === 'LEAD_INVESTIGATOR' || role === 'ACP' || role === 'ADMIN';

  const assignedCases =
    (accessibleCases && accessibleCases.length > 0)
      ? accessibleCases
      : OFFICER_EXPLICIT_CASE_ACCESS[dbUser.id] ||
        OFFICER_EXPLICIT_CASE_ACCESS[dbUser.badge_number] ||
        OFFICER_EXPLICIT_CASE_ACCESS[dbUser.email] ||
        ROLE_CASE_MAPPINGS[role] ||
        (isHighClearance ? ['*'] : ['CASE-2026-002', 'CASE-2026-005']);

  return {
    id: dbUser.id || 'USR-101',
    name: dbUser.full_name || dbUser.name || 'ACP Rajeshwar Sharma',
    email: dbUser.email || 'rajesh.sharma@delhipolice.gov.in',
    role: role,
    roleTitle: roleTitleMap[role] || 'Law Enforcement Officer',
    badgeNumber: dbUser.badge_number || dbUser.badgeNumber || 'DEL-IPS-8821',
    department: dbUser.department || 'Special Cell / Cyber Crime Unit',
    jurisdiction: dbUser.city ? `${dbUser.city} Regional Command` : 'National Cyber Command',
    clearanceLevel: isHighClearance ? 'LEVEL 5 (TOP SECRET)' : 'LEVEL 3 (SECRET)',
    clearanceCode: isHighClearance ? 5 : 3,
    avatar: getOfficerAvatar(
      dbUser.id || dbUser.badge_number || dbUser.email,
      dbUser.full_name || dbUser.name,
      dbUser.avatar
    ),
    phone: dbUser.phone || '+91-9810112233',
    status: 'ON_DUTY',
    accessibleCases: assignedCases,
  };
}

class DatabaseService {
  /**
   * Authenticate officer against PostgreSQL `users` table
   */
  async loginUser(credentials: { username: string; password?: string }): Promise<{
    user: User;
    token: string;
    accessible_cases: string[];
  }> {
    const res = await api.auth.login(credentials);
    const officer = mapDatabaseUserToOfficer(res.user, res.token, res.accessible_cases);
    return {
      user: officer,
      token: res.token,
      accessible_cases: res.accessible_cases || officer.accessibleCases || [],
    };
  }

  /**
   * Get permissions for a given role
   */
  getPermissions(role: UserRole | string): RolePermissions {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.LEAD_INVESTIGATOR;
  }

  /**
   * Synchronous initial fallback for fast render without flashing unauthorized cases
   */
  getInitialUserCases(user: User): any[] {
    const permissions = this.getPermissions(user.role);
    if (permissions.canViewAllCases || user.accessibleCases?.includes('*')) {
      return ALL_CASES;
    }

    const allowedIds =
      user.accessibleCases && user.accessibleCases.length > 0
        ? user.accessibleCases
        : OFFICER_EXPLICIT_CASE_ACCESS[user.id] ||
          OFFICER_EXPLICIT_CASE_ACCESS[user.badgeNumber] ||
          ROLE_CASE_MAPPINGS[user.role] ||
          ['CASE-2026-002', 'CASE-2026-005'];

    const scoped = ALL_CASES.filter((c) => allowedIds.includes(c.id));
    return scoped.length > 0 ? scoped : ALL_CASES.slice(0, 2);
  }

  /**
   * Fetch RBAC-scoped cases from database
   */
  async fetchUserCases(user: User): Promise<any[]> {
    let allLiveCases: any[] = [];
    try {
      allLiveCases = await api.cases.getAll();
    } catch {
      allLiveCases = ALL_CASES;
    }

    if (!allLiveCases || allLiveCases.length === 0) {
      allLiveCases = ALL_CASES;
    }

    const permissions = this.getPermissions(user.role);
    if (permissions.canViewAllCases || user.accessibleCases?.includes('*')) {
      return allLiveCases;
    }

    const allowedIds =
      user.accessibleCases && user.accessibleCases.length > 0
        ? user.accessibleCases
        : OFFICER_EXPLICIT_CASE_ACCESS[user.id] ||
          OFFICER_EXPLICIT_CASE_ACCESS[user.badgeNumber] ||
          ROLE_CASE_MAPPINGS[user.role] ||
          ['CASE-2026-002', 'CASE-2026-005'];

    const scopedCases = allLiveCases.filter((c) => allowedIds.includes(c.id));
    return scopedCases.length > 0 ? scopedCases : allLiveCases.slice(0, 2);
  }

  /**
   * Append-Only Case Creation
   */
  async createCase(
    caseData: {
      fir_number: string;
      title: string;
      description: string;
      crime_category: string;
      priority: string;
      status: string;
      jurisdiction_city: string;
    },
    creatorUser: User
  ): Promise<any> {
    return api.cases.create({
      ...caseData,
      lead_investigator_id: creatorUser.id,
    });
  }

  /**
   * Append-Only Case Diary Note
   */
  async addCaseNote(
    caseId: string,
    note: string,
    category = 'INVESTIGATION_NOTE',
    user: User
  ): Promise<any> {
    return api.cases.addNote(caseId, {
      note,
      category,
      userId: user.id,
    });
  }
}

export const dbService = new DatabaseService();
