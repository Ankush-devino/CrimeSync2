import React from 'react';
import { BlastRadiusSimulator } from '../components/BlastRadiusSimulator';

export interface BlastRadiusPageProps {
  onSelectAction?: (action: string) => void;
}

export const BlastRadiusPage: React.FC<BlastRadiusPageProps> = ({ onSelectAction }) => {
  return <BlastRadiusSimulator onSelectAction={onSelectAction} />;
};
