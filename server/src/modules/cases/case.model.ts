// Team Member 1: Cases Data Model

export interface CaseDTO {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed' | 'escalated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
}

export class CaseModel {
  // Database schema / ORM model for investigations
}
