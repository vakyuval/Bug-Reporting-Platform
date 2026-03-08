export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Report {
  id: string;
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  priority: Priority;
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
}