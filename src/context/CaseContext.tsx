import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';
import { getApplicableLawForCase, type CaseLawProfile } from '../data/applicableLaws';
import { logOfficerAction } from '../services/activityLogger';
import { ALL_CASES, getCaseById } from '../constants/cases';

export interface CaseContextType {
  cases: any[];
  selectedCaseId: string;
  selectedCase: any | null;
  applicableLaw: CaseLawProfile;
  loading: boolean;
  detailsLoading: boolean;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  setSelectedCaseId: (id: string) => void;
  fetchCases: (selectNewId?: string) => Promise<void>;
  fetchCaseDetails: (caseId: string) => Promise<void>;
  updateCaseStatus: (newStatus: string) => Promise<void>;
  addCaseNote: (note: string, category?: string) => Promise<void>;
  editCaseNote: (noteId: string, note: string, category?: string) => Promise<void>;
  deleteCaseNote: (noteId: string) => Promise<void>;
  editEvidence: (evidenceId: string, payload: { title?: string; category?: string; status?: string }) => Promise<void>;
  deleteEvidence: (evidenceId: string) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, permissions } = useAuth();

  const [cases, setCases] = useState<any[]>(() => dbService.getInitialUserCases(currentUser));
  const [selectedCaseId, setSelectedCaseIdState] = useState<string>(() => {
    const initialList = dbService.getInitialUserCases(currentUser);
    const stored = localStorage.getItem('crimesync_selected_case');
    if (stored && initialList.some((c: any) => c.id === stored)) {
      return stored;
    }
    return initialList[0]?.id || 'CASE-2026-002';
  });
  const [selectedCase, setSelectedCase] = useState<any | null>(() => {
    const initialList = dbService.getInitialUserCases(currentUser);
    const stored = localStorage.getItem('crimesync_selected_case');
    if (stored && initialList.some((c: any) => c.id === stored)) {
      return initialList.find((c: any) => c.id === stored) || getCaseById(stored);
    }
    return initialList[0] || getCaseById('CASE-2026-002');
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const casesRef = React.useRef(cases);
  casesRef.current = cases;

  const selectedCaseIdRef = React.useRef(selectedCaseId);
  selectedCaseIdRef.current = selectedCaseId;

  const setSelectedCaseId = useCallback((id: string) => {
    setSelectedCaseIdState(id);
    localStorage.setItem('crimesync_selected_case', id);
    const currentCases = casesRef.current;
    const foundCase = currentCases.find((c) => c.id === id) || ALL_CASES.find((c) => c.id === id);
    if (foundCase) {
      logOfficerAction({
        action: `Switched Active Case to ${foundCase.fir_number || id}`,
        module: 'Case Switcher',
        caseId: foundCase.fir_number || id,
        status: 'Success',
        category: 'CASES',
        details: `${currentUser.name} (${currentUser.role}) activated workspace for "${foundCase.title || id}"`
      });
    }
  }, [currentUser]);

  // Fetch RBAC-scoped cases from DB Service (PostgreSQL + user_cases join)
  const fetchCases = useCallback(async (selectNewId?: string) => {
    try {
      setLoading(true);
      const data = await dbService.fetchUserCases(currentUser);
      if (data && data.length > 0) {
        setCases(data);
        if (selectNewId) {
          setSelectedCaseId(selectNewId);
        } else {
          const currentId = selectedCaseIdRef.current;
          // If current case is not in user's authorized list, auto-select highest priority available case
          if (!currentId || !data.some((c: any) => c.id === currentId)) {
            setSelectedCaseId(data[0].id);
          }
        }
      } else {
        const fallbackCases = dbService.getInitialUserCases(currentUser);
        setCases(fallbackCases);
        if (fallbackCases.length > 0) {
          setSelectedCaseId(fallbackCases[0].id);
        }
      }
    } catch (err) {
      console.warn('CaseContext: DB query fallback...', err);
      const fallbackCases = dbService.getInitialUserCases(currentUser);
      setCases(fallbackCases);
    } finally {
      setLoading(false);
    }
  }, [currentUser, setSelectedCaseId]);

  // Fetch details of the active case
  const fetchCaseDetails = useCallback(async (caseId: string) => {
    if (!caseId) return;
    try {
      setDetailsLoading(true);
      const details = await api.cases.getById(caseId);
      if (details) {
        setSelectedCase(details);
      } else {
        setSelectedCase(getCaseById(caseId));
      }
    } catch (err) {
      console.warn('CaseContext: Live API case detail fallback', err);
      setSelectedCase(getCaseById(caseId));
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // Re-fetch cases whenever the logged-in user changes (RBAC trigger)
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetails(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseDetails]);

  // 1-Click Update Case Status (Guarded by RBAC permissions)
  const updateCaseStatus = useCallback(async (newStatus: string) => {
    if (!permissions.canEditCaseStatus) {
      showToast('Action Denied: Your role does not permit modifying case status.', 'error');
      return;
    }
    if (!selectedCase || selectedCase.status === newStatus) return;
    try {
      await api.cases.updateStatus(selectedCase.id, newStatus);
      setSelectedCase((prev: any) => ({ ...prev, status: newStatus }));
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? { ...c, status: newStatus } : c))
      );
      showToast(`Case status updated to ${newStatus}`);
      logOfficerAction({
        action: `Updated Case Status: ${newStatus}`,
        module: 'Investigations',
        caseId: selectedCase.fir_number || 'CR-2026-0417',
        status: 'Success',
        category: 'CASES',
        details: `${currentUser.name} modified case status of "${selectedCase.title || selectedCase.fir_number}" to ${newStatus}`
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status', 'info');
    }
  }, [selectedCase, permissions, currentUser, showToast]);

  // Add Case Note (Append-Only)
  const addCaseNote = useCallback(async (note: string, category = 'INVESTIGATION_NOTE') => {
    if (!permissions.canAddDiaryNotes) {
      showToast('Action Denied: Role lacks permissions to log case diary notes.', 'error');
      return;
    }
    if (!selectedCase || !note.trim()) return;
    try {
      await dbService.addCaseNote(selectedCase.id, note.trim(), category, currentUser);
      showToast('Note recorded in Case Diary');
      logOfficerAction({
        action: `Added Case Diary Note`,
        module: 'Investigations',
        caseId: selectedCase.fir_number || 'CR-2026-0417',
        status: 'Success',
        category: 'CASES',
        details: `${currentUser.name} recorded: "${note.slice(0, 50)}${note.length > 50 ? '...' : ''}"`
      });
      await fetchCaseDetails(selectedCase.id);
    } catch (err) {
      console.error('Failed to add note:', err);
      showToast('Failed to save note', 'info');
    }
  }, [selectedCase, permissions, currentUser, fetchCaseDetails, showToast]);

  // Edit Case Note
  const editCaseNote = useCallback(async (noteId: string, note: string, category = 'INVESTIGATION_NOTE') => {
    if (!permissions.canEditDiaryNotes) {
      showToast('Action Denied: Your role does not permit editing diary entries.', 'error');
      return;
    }
    if (!selectedCase || !note.trim() || !noteId) return;
    try {
      await api.cases.updateNote(selectedCase.id, noteId, {
        note: note.trim(),
        category,
      });
      // Optimistically update local state in selectedCase
      setSelectedCase((prev: any) => {
        if (!prev || !prev.case_notes) return prev;
        const updatedNotes = prev.case_notes.map((n: any) => {
          if (n.id === noteId) {
            let detailsObj: any = {};
            try {
              detailsObj = typeof n.details === 'string' ? JSON.parse(n.details) : n.details || {};
            } catch {
              detailsObj = {};
            }
            detailsObj.note = note.trim();
            detailsObj.category = category;
            return {
              ...n,
              action: category,
              details: JSON.stringify(detailsObj),
            };
          }
          return n;
        });
        return { ...prev, case_notes: updatedNotes };
      });
      showToast('Case Diary note updated');
      await fetchCaseDetails(selectedCase.id);
    } catch (err) {
      console.error('Failed to update note:', err);
      showToast('Failed to update note', 'info');
    }
  }, [selectedCase, permissions, fetchCaseDetails, showToast]);

  // Delete Case Note (Protected)
  const deleteCaseNote = useCallback(async (noteId: string) => {
    if (permissions.isReadOnly) {
      showToast('Action Denied: Read-only role cannot delete notes.', 'error');
      return;
    }
    if (!selectedCase || !noteId) return;
    try {
      await api.cases.deleteNote(selectedCase.id, noteId);
      setSelectedCase((prev: any) => {
        if (!prev || !prev.case_notes) return prev;
        return {
          ...prev,
          case_notes: prev.case_notes.filter((n: any) => n.id !== noteId),
        };
      });
      showToast('Note deleted from Case Diary');
      await fetchCaseDetails(selectedCase.id);
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast('Failed to delete note', 'info');
    }
  }, [selectedCase, permissions, fetchCaseDetails, showToast]);

  // Edit Evidence (Forensic or Investigator)
  const editEvidence = useCallback(
    async (
      evidenceId: string,
      payload: { title?: string; category?: string; status?: string }
    ) => {
      if (!permissions.canEditEvidence) {
        showToast('Action Denied: You do not have permission to edit evidence exhibits.', 'error');
        return;
      }
      if (!selectedCase || !evidenceId) return;
      try {
        await api.evidence.update(evidenceId, payload);
        setSelectedCase((prev: any) => {
          if (!prev || !prev.evidence) return prev;
          const updatedEvidence = prev.evidence.map((ev: any) => {
            if (ev.id === evidenceId) {
              return {
                ...ev,
                ...payload,
              };
            }
            return ev;
          });
          return { ...prev, evidence: updatedEvidence };
        });
        showToast('Evidence exhibit record updated');
        await fetchCaseDetails(selectedCase.id);
      } catch (err) {
        console.error('Failed to update evidence:', err);
        showToast('Failed to update evidence', 'info');
      }
    },
    [selectedCase, permissions, fetchCaseDetails, showToast]
  );

  // Delete Evidence (Append-Only Guard)
  const deleteEvidence = useCallback(
    async (evidenceId: string) => {
      if (permissions.isReadOnly) {
        showToast('Action Denied: Append-only compliance prevents deleting evidence.', 'error');
        return;
      }
      if (!selectedCase || !evidenceId) return;
      try {
        await api.evidence.delete(evidenceId);
        setSelectedCase((prev: any) => {
          if (!prev || !prev.evidence) return prev;
          return {
            ...prev,
            evidence: prev.evidence.filter((ev: any) => ev.id !== evidenceId),
          };
        });
        showToast('Evidence exhibit archived from active locker');
        await fetchCaseDetails(selectedCase.id);
      } catch (err) {
        console.error('Failed to delete evidence:', err);
        showToast('Failed to archive evidence', 'info');
      }
    },
    [selectedCase, permissions, fetchCaseDetails, showToast]
  );

  // Derived Applicable Law profile tailored to the active case
  const applicableLaw = useMemo(() => {
    return getApplicableLawForCase(selectedCase?.id || selectedCaseId, selectedCase?.crime_category);
  }, [selectedCase, selectedCaseId]);

  const value = useMemo(
    () => ({
      cases,
      selectedCaseId,
      selectedCase,
      applicableLaw,
      loading,
      detailsLoading,
      toastMessage,
      setSelectedCaseId,
      fetchCases,
      fetchCaseDetails,
      updateCaseStatus,
      addCaseNote,
      editCaseNote,
      deleteCaseNote,
      editEvidence,
      deleteEvidence,
      showToast,
    }),
    [
      cases,
      selectedCaseId,
      selectedCase,
      applicableLaw,
      loading,
      detailsLoading,
      toastMessage,
      setSelectedCaseId,
      fetchCases,
      fetchCaseDetails,
      updateCaseStatus,
      addCaseNote,
      editCaseNote,
      deleteCaseNote,
      editEvidence,
      deleteEvidence,
      showToast,
    ]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};

export const useCaseContext = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};
