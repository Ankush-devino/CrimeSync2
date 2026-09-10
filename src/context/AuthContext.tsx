import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { type User, type RolePermissions, dbService, mapDatabaseUserToOfficer } from '../services/db';
import { logOfficerAction } from '../services/activityLogger';
import { getOfficerAvatar } from '../utils/avatarUtils';
import { api } from '../services/api';
import { Lock, ShieldAlert, AlertOctagon, X, ArrowRight, Ban, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useDbContext } from './DbContext';

export type ThreatMode = 'TRUSTED' | 'SUSPICIOUS' | 'COMPROMISED' | 'HONEY_TRIGGERED';

export interface BlockedActionDetail {
  title: string;
  action: string;
  reason: string;
  score: number;
  mode: ThreatMode;
  category: string;
}

export interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  permissions: RolePermissions;
  token: string | null;
  threatMode: ThreatMode;
  trustScore: number;
  isAdaptiveRestricted: boolean;
  blockedActionNotification: BlockedActionDetail | null;
  setThreatMode: (mode: ThreatMode) => Promise<void>;
  enforceAdaptiveAction: (actionName: string, executeCallback: () => void, category?: string) => boolean;
  dismissBlockedNotification: () => void;
  login: (officerIdOrEmail: string, password?: string, rememberDevice?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'crimesync_auth_officer_v3';
const AUTH_TOKEN_KEY = 'crimesync_jwt_token';
const AUTH_STATUS_KEY = 'crimesync_is_authenticated_v3';
const AUTH_THREAT_MODE_KEY = 'crimesync_active_threat_mode_v2';

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
  const db = useDbContext();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          parsed.avatar = getOfficerAvatar(parsed.id || parsed.badgeNumber || parsed.email, parsed.name, parsed.avatar);
          parsed.accessibleCases = ['*'];
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return {
      ...DEFAULT_INITIAL_OFFICER,
      accessibleCases: ['*'],
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || 'crimesync_default_token';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Global Threat Mode & Real-time Trust Scoring state
  const [threatMode, setThreatModeState] = useState<ThreatMode>(() => {
    try {
      const stored = localStorage.getItem(AUTH_THREAT_MODE_KEY);
      if (stored && ['TRUSTED', 'SUSPICIOUS', 'COMPROMISED', 'HONEY_TRIGGERED'].includes(stored)) {
        return stored as ThreatMode;
      }
    } catch {
      // Fallback
    }
    return 'TRUSTED';
  });

  const [blockedActionNotification, setBlockedActionNotification] = useState<BlockedActionDetail | null>(null);

  // Derive explicit Trust Score combining Threat Mode and real-time live DbContext trust engine
  const trustScore = useMemo(() => {
    let modeScore = 100;
    switch (threatMode) {
      case 'TRUSTED':
        modeScore = 100;
        break;
      case 'SUSPICIOUS':
        modeScore = 65;
        break;
      case 'COMPROMISED':
        modeScore = 40;
        break;
      case 'HONEY_TRIGGERED':
        modeScore = 10;
        break;
    }
    return Math.min(modeScore, db.trustScore);
  }, [threatMode, db.trustScore]);

  // Adaptive Restriction is active whenever Trust Score < 50
  const isAdaptiveRestricted = trustScore < 50;

  // Derived permissions based on currentUser.role AND real-time behavioral Trust Score
  const permissions = useMemo(() => {
    const base = dbService.getPermissions(currentUser.role);
    if (isAdaptiveRestricted) {
      // Dynamic containment enforcement: Quarantine sensitive write & exfiltration actions
      return {
        ...base,
        canExportDossiers: false,
        canAccessBlockchainLedger: false,
        canAddEvidence: false,
        canEditEvidence: false,
        canLodgeFIR: false,
        canEditCaseStatus: false,
        canAddDiaryNotes: false,
        canEditDiaryNotes: false,
        canDeployDeceptionHoney: false,
        isReadOnly: true,
      };
    }
    return base;
  }, [currentUser.role, isAdaptiveRestricted]);

  // Synchronize Threat Mode with Backend API & Broadcast Globally
  const setThreatMode = useCallback(async (newMode: ThreatMode) => {
    setThreatModeState(newMode);
    try {
      localStorage.setItem(AUTH_THREAT_MODE_KEY, newMode);
      if (newMode === 'HONEY_TRIGGERED') {
        await api.identity.triggerHoneyTrap();
      } else {
        await api.identity.simulateBehavioralSession(newMode);
      }
    } catch (err) {
      console.warn('[AuthContext] Backend threat sync:', err);
    }
  }, []);

  // Dismiss global blocked notification modal
  const dismissBlockedNotification = useCallback(() => {
    setBlockedActionNotification(null);
  }, []);

  // Central Enforcement Interceptor: Guarantees blocked actions cannot execute when High Risk
  const enforceAdaptiveAction = useCallback(
    (actionName: string, executeCallback: () => void, category = 'EXFILTRATION'): boolean => {
      if (isAdaptiveRestricted) {
        // STRICT BLOCK: Prevent execution and pop containment alert
        const blockedDetail: BlockedActionDetail = {
          title: `ACCESS DENIED: ${actionName}`,
          action: actionName,
          reason: `Action quarantined because current session behavioral Trust Score (${trustScore}/100) is below the security threshold (50). Sensitive exfiltration & write operations are strictly blocked.`,
          score: trustScore,
          mode: threatMode,
          category,
        };

        setBlockedActionNotification(blockedDetail);

        logOfficerAction({
          action: `BLOCKED ACTION ATTEMPT: ${actionName}`,
          module: 'Adaptive Account Protection',
          caseId: currentUser.badgeNumber || 'GENERAL',
          status: 'Active',
          category: 'SECURITY',
          details: `Autonomous policy enforcement contained unauthorized execution: ${actionName}. Session Trust Score: ${trustScore}/100.`,
        });

        db.logEvent(
          'REPORT_EXPORT',
          { target: actionName, status: 'BLOCKED_BY_ADAPTIVE_FIREWALL' },
          { module: 'Adaptive Account Protection Firewall', category: 'SECURITY', severity: 'CONTAINED', details: `Autonomous firewall intercepted ${actionName}` }
        );

        return false;
      }

      // Allowed: Execute original action
      executeCallback();
      return true;
    },
    [isAdaptiveRestricted, trustScore, threatMode, currentUser.badgeNumber]
  );

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
        setThreatModeState('TRUSTED');

        if (rememberDevice) {
          localStorage.setItem(AUTH_TOKEN_KEY, res.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          localStorage.setItem(AUTH_STATUS_KEY, 'true');
          localStorage.setItem(AUTH_THREAT_MODE_KEY, 'TRUSTED');
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

  // Reset Session Handler
  const logout = useCallback(() => {
    logOfficerAction({
      action: `Officer Terminal Session Reset`,
      module: 'Security & Auth',
      caseId: currentUser.badgeNumber,
      status: 'Authorized',
      category: 'AUTH',
      details: `${currentUser.name} reset session.`,
    });

    setCurrentUser({
      ...DEFAULT_INITIAL_OFFICER,
      accessibleCases: ['*'],
    });
    setThreatModeState('TRUSTED');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    localStorage.setItem(AUTH_THREAT_MODE_KEY, 'TRUSTED');
    sessionStorage.clear();
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      permissions,
      token,
      threatMode,
      trustScore,
      isAdaptiveRestricted,
      blockedActionNotification,
      setThreatMode,
      enforceAdaptiveAction,
      dismissBlockedNotification,
      login,
      logout,
    }),
    [
      currentUser,
      isAuthenticated,
      permissions,
      token,
      threatMode,
      trustScore,
      isAdaptiveRestricted,
      blockedActionNotification,
      setThreatMode,
      enforceAdaptiveAction,
      dismissBlockedNotification,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Global Cyber Containment Security Modal */}
      <AnimatePresence>
        {blockedActionNotification && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[#060a16] border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] font-mono text-slate-100 relative overflow-hidden"
            >
              {/* Pulsing Alert Radar */}
              <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
                <Radio className="w-32 h-32 text-red-500 animate-ping" />
              </div>

              <div className="flex items-start justify-between gap-3 border-b border-red-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 flex-shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Lock className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">
                      ADAPTIVE CONTAINMENT ENFORCED
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Autonomous Security Policy Lockdown (Trust Score &lt; 50)
                    </p>
                  </div>
                </div>

                <button
                  onClick={dismissBlockedNotification}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">ATTEMPTED ACTION</span>
                  <span className="text-white font-black text-sm tracking-wide block mt-0.5">
                    {blockedActionNotification.action}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#030610] border border-slate-800">
                    <span className="text-slate-500 block text-[9.5px]">SESSION TRUST SCORE</span>
                    <span className="text-red-400 font-bold text-base">{blockedActionNotification.score} / 100</span>
                    <span className="text-[9.5px] text-red-300 block">High Risk (Containment Active)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#030610] border border-slate-800">
                    <span className="text-slate-500 block text-[9.5px]">POLICY STATUS</span>
                    <span className="text-amber-400 font-bold text-xs mt-1 block">QUARANTINED</span>
                    <span className="text-[9.5px] text-slate-400 block">Exfiltration Blocked</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-[#030713] p-3 rounded-xl border border-slate-800/80">
                  {blockedActionNotification.reason}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  NCRB Defense Interceptor active
                </span>
                <button
                  onClick={dismissBlockedNotification}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Acknowledge & Return</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
