import React from 'react';
import { BlastRadiusSimulator } from '../components/BlastRadiusSimulator';
import { useCaseContext } from '../context/CaseContext';

export interface BlastRadiusPageProps {
  onSelectAction?: (action: string) => void;
}

export const BlastRadiusPage: React.FC<BlastRadiusPageProps> = ({ onSelectAction }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();
  const activeCaseKey = selectedCase?.id || selectedCaseId || 'default-case';

  return (
    <div key={activeCaseKey} className="w-full h-full flex flex-col min-h-0">
      <BlastRadiusSimulator key={activeCaseKey} onSelectAction={onSelectAction} />
    </div>
  );
};

