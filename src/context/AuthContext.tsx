import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { type User, type RolePermissions, dbService, mapDatabaseUserToOfficer, OFFICER_EXPLICIT_CASE_ACCESS, ROLE_CASE_MAPPINGS } from '../services/db';
import { logOfficerAction } from '../services/activityLogger';
import { getOfficerAvatar } from '../utils/avatarUtils';

export interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  permissions: RolePermissions;
  token: string | null;
  login: (officerIdOrEmail: string, password?: string, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'crimesync_auth_officer_v3';
const AUTH_TOKEN_KEY = 'crimesync_jwt_token';
const AUTH_STATUS_KEY = 'crimesync_is_authenticated_v3';

const DEFAULT_INITIAL_OFFICER = mapDatabaseUserToOfficer({
  id: 'USR-101',
  badge_number: 'DEL-IPS-8821',
  full_name: 'ACP Rajeshwar Sharma',
  email: 'rajesh.sharma@delhipolice.gov.in',
  role: 'LEAD_INVESTIGATOR',
  department: 'Special Cell / Cyber Crime Unit',
  city: 'New Delhi',
  phone: '+91-9810112233',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          parsed.avatar = getOfficerAvatar(parsed.id || parsed.badgeNumber || parsed.email, parsed.name, parsed.avatar);
          if (!parsed.accessibleCases || parsed.accessibleCases.length === 0 || (parsed.accessibleCases.includes('*') && parsed.role !== 'LEAD_INVESTIGATOR' && parsed.role !== 'ACP' && parsed.role !== 'ADMIN')) {
            parsed.accessibleCases = OFFICER_EXPLICIT_CASE_ACCESS[parsed.id] || OFFICER_EXPLICIT_CASE_ACCESS[parsed.badgeNumber] || ROLE_CASE_MAPPINGS[parsed.role] || ['CASE-2026-002', 'CASE-2026-005'];
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_INITIAL_OFFICER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const status = localStorage.getItem(AUTH_STATUS_KEY);
    const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
    return status === 'true' && Boolean(existingToken);
  });

  // Derived permissions based on currentUser.role
  const permissions = useMemo(() => {
    return dbService.getPermissions(currentUser.role);
  }, [currentUser.role]);

  // Production Login Handler (Authenticates against PostgreSQL)
  const login = useCallback(
    async (
      officerIdOrEmail: string,
      password?: string,
      rememberDevice = true
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await dbService.loginUser({
          username: officerIdOrEmail.trim(),
          password: password || '',
        });

        setCurrentUser(res.user);
        setToken(res.token);
        setIsAuthenticated(true);

        if (rememberDevice) {
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          localStorage.setItem(AUTH_STATUS_KEY, 'true');
        } else {
          sessionStorage.setItem(AUTH_TOKEN_KEY, res.token);
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          localStorage.setItem(AUTH_STATUS_KEY, 'true');
        }

        logOfficerAction({
          action: `Officer Authenticated (PostgreSQL)`,
          module: 'Security & Auth',
          caseId: res.user.badgeNumber,
          status: 'Authorized',
          category: 'AUTH',
          details: `${res.user.name} (${res.user.roleTitle}, Badge: ${res.user.badgeNumber}) authenticated with JWT token.`,
        });

        return { success: true };
      } catch (err: any) {
        const errorMsg = err.message || 'Authentication failed. Please verify Officer ID and Password.';
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Logout Handler
  const logout = useCallback(() => {
    logOfficerAction({
      action: `Officer Terminal Session Locked`,
      module: 'Security & Auth',
      caseId: currentUser.badgeNumber,
      status: 'Authorized',
      category: 'AUTH',
      details: `${currentUser.name} signed out. Terminal locked.`,
    });

    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.setItem(AUTH_STATUS_KEY, 'false');
    sessionStorage.clear();
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      permissions,
      token,
      login,
      logout,
    }),
    [currentUser, isAuthenticated, permissions, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
