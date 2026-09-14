import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { FIRCase, AnalysisResult } from '../types/fir';
import { analyzeFIRCase } from '../services/deceptionAnalyzer';
import { mockFIRReports, deceptiveFIRPayload } from '../data/mockFIR';

export interface FIRContextType {
  cases: AnalysisResult[];
  selectedCase: AnalysisResult | null;
  selectCase: (id: string) => void;
  ingestFIR: (newCase: FIRCase) => AnalysisResult;
  injectDeceptiveSample: () => void;
}

const FIRContext = createContext<FIRContextType | undefined>(undefined);

// Initial baseline cases evaluated through the deception analyzer engine
const INITIAL_CASES: AnalysisResult[] = mockFIRReports.map((c) => analyzeFIRCase(c));

export const FIRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<AnalysisResult[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    INITIAL_CASES.length > 0 ? INITIAL_CASES[0].id : null
  );

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null;
    return cases.find((c) => c.id === selectedCaseId || c.firNumber === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  const selectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
  }, []);

  const ingestFIR = useCallback((newCase: FIRCase): AnalysisResult => {
    const analyzedResult = analyzeFIRCase(newCase);

    setCases((prevCases) => {
      // If case already exists with the same ID, replace it; otherwise prepend to the beginning
      const existingIndex = prevCases.findIndex((c) => c.id === analyzedResult.id);
      if (existingIndex >= 0) {
        const updated = [...prevCases];
        updated[existingIndex] = analyzedResult;
        return updated;
      }
      return [analyzedResult, ...prevCases];
    });

    setSelectedCaseId(analyzedResult.id);
    return analyzedResult;
  }, []);

  const injectDeceptiveSample = useCallback(() => {
    ingestFIR(deceptiveFIRPayload);
  }, [ingestFIR]);

  const value = useMemo<FIRContextType>(
    () => ({
      cases,
      selectedCase,
      selectCase,
      ingestFIR,
      injectDeceptiveSample,
    }),
    [cases, selectedCase, selectCase, ingestFIR, injectDeceptiveSample]
  );

  return <FIRContext.Provider value={value}>{children}</FIRContext.Provider>;
};

export function useFIR(): FIRContextType {
  const context = useContext(FIRContext);
  if (!context) {
    throw new Error('useFIR must be used within a FIRProvider');
  }
  return context;
}
