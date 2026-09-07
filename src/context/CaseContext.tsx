import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { getApplicableLawForCase, type CaseLawProfile } from '../data/applicableLaws';

export interface CaseContextType {
  cases: any[];
  selectedCaseId: string;
  selectedCase: any | null;
  applicableLaw: CaseLawProfile;
  loading: boolean;
  detailsLoading: boolean;
  toastMessage: { text: string; type: 'success' | 'info' } | null;
  setSelectedCaseId: (id: string) => void;
  fetchCases: (selectNewId?: string) => Promise<void>;
  fetchCaseDetails: (caseId: string) => Promise<void>;
  updateCaseStatus: (newStatus: string) => Promise<void>;
  addCaseNote: (note: string, category?: string) => Promise<void>;
  editCaseNote: (noteId: string, note: string, category?: string) => Promise<void>;
  deleteCaseNote: (noteId: string) => Promise<void>;
  editEvidence: (evidenceId: string, payload: { title?: string; category?: string; status?: string }) => Promise<void>;
  deleteEvidence: (evidenceId: string) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'info') => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseIdState] = useState<string>(() => {
    return localStorage.getItem('crimesync_selected_case') || 'CASE-2026-004';
  });
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const setSelectedCaseId = useCallback((id: string) => {
    setSelectedCaseIdState(id);
    localStorage.setItem('crimesync_selected_case', id);
  }, []);

  // Fetch all cases from Neon PostgreSQL
  const fetchCases = useCallback(async (selectNewId?: string) => {
    try {
      setLoading(true);
      const data = await api.cases.getAll();
      setCases(data || []);
      if (data && data.length > 0) {
        if (selectNewId) {
          setSelectedCaseId(selectNewId);
        } else if (!selectedCaseId || !data.some((c) => c.id === selectedCaseId)) {
          setSelectedCaseId(data[0].id);
        }
      }
    } catch (err) {
      console.error('CaseContext: Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCaseId, setSelectedCaseId]);

  // Fetch details of the active case
  const fetchCaseDetails = useCallback(async (caseId: string) => {
    if (!caseId) return;
    try {
      setDetailsLoading(true);
      const details = await api.cases.getById(caseId);
      setSelectedCase(details);
    } catch (err) {
      console.error('CaseContext: Failed to fetch case details:', err);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetails(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseDetails]);

  // 1-Click Update Case Status
  const updateCaseStatus = useCallback(async (newStatus: string) => {
    if (!selectedCase || selectedCase.status === newStatus) return;
    try {
      await api.cases.updateStatus(selectedCase.id, newStatus);
      setSelectedCase((prev: any) => ({ ...prev, status: newStatus }));
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? { ...c, status: newStatus } : c))
      );
      showToast(`Case status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status', 'info');
    }
  }, [selectedCase, showToast]);

  // Add Case Note
  const addCaseNote = useCallback(async (note: string, category = 'INVESTIGATION_NOTE') => {
    if (!selectedCase || !note.trim()) return;
    try {
      await api.cases.addNote(selectedCase.id, {
        note: note.trim(),
        category,
      });
      showToast('Note added to Case Diary');
      await fetchCaseDetails(selectedCase.id);
    } catch (err) {
      console.error('Failed to add note:', err);
      showToast('Failed to save note', 'info');
    }
  }, [selectedCase, fetchCaseDetails, showToast]);

  // Edit Case Note
  const editCaseNote = useCallback(async (noteId: string, note: string, category = 'INVESTIGATION_NOTE') => {
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
  }, [selectedCase, fetchCaseDetails, showToast]);

  // Delete Case Note
  const deleteCaseNote = useCallback(async (noteId: string) => {
    if (!selectedCase || !noteId) return;
    try {
      await api.cases.deleteNote(selectedCase.id, noteId);
      // Optimistically update local state in selectedCase
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
  }, [selectedCase, fetchCaseDetails, showToast]);

  // Edit Evidence
  const editEvidence = useCallback(
    async (
      evidenceId: string,
      payload: { title?: string; category?: string; status?: string }
    ) => {
      if (!selectedCase || !evidenceId) return;
      try {
        await api.evidence.update(evidenceId, payload);
        // Optimistically update local state in selectedCase
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
    [selectedCase, fetchCaseDetails, showToast]
  );

  // Delete Evidence
  const deleteEvidence = useCallback(
    async (evidenceId: string) => {
      if (!selectedCase || !evidenceId) return;
      try {
        await api.evidence.delete(evidenceId);
        // Optimistically update local state in selectedCase
        setSelectedCase((prev: any) => {
          if (!prev || !prev.evidence) return prev;
          return {
            ...prev,
            evidence: prev.evidence.filter((ev: any) => ev.id !== evidenceId),
          };
        });
        showToast('Evidence deleted from Case Locker');
        await fetchCaseDetails(selectedCase.id);
      } catch (err) {
        console.error('Failed to delete evidence:', err);
        showToast('Failed to delete evidence', 'info');
      }
    },
    [selectedCase, fetchCaseDetails, showToast]
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
