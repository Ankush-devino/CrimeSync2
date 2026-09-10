// Universal Audit Logger Hook for CrimeSync Event-Driven Architecture
import { useDbContext } from '../context/DbContext';

export function useAuditLog() {
  const db = useDbContext();

  return {
    // Audit Logging
    logEvent: db.logEvent,
    auditLogs: db.auditLogs,
    
    // Security & Trust Engine State
    trustScore: db.trustScore,
    permissions: db.permissions,
    sessionState: db.sessionState,
    
    // Attack Simulation & Reset
    simulateCyberAttack: db.simulateCyberAttack,
    resetSessionState: db.resetSessionState,
    isSimulatingAttack: db.isSimulatingAttack,

    // Dynamic Database Data Binding
    activeCase: db.activeCase,
    activeCaseId: db.activeCaseId,
    setActiveCaseId: db.setActiveCaseId,
    cases: db.cases,
    evidence: db.evidence,
    users: db.users,
    getCaseById: db.getCaseById,
    getEvidenceByCase: db.getEvidenceByCase,
  };
}
