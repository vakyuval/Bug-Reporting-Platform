// In-memory storage
import { v4 as uuidv4 } from 'uuid';
import { Report } from '../types/report.js';
import { UserStatusEntry } from '../types/user.js'

export const reports: Report[] = [
  {
    id: uuidv4(),
    issueType: 'Bug',
    description: 'Application crashes when clicking the submit button twice quickly',
    contactName: 'Alice Johnson',
    contactEmail: 'alice@example.com',
    status: 'NEW',
    createdAt: Date.now() - 86400000 * 3,
    attachmentUrl: '/uploads/placeholder.txt'
  },
  {
    id: uuidv4(),
    issueType: 'Feature Request',
    description: 'Add dark mode support for better accessibility',
    contactName: 'Bob Smith',
    contactEmail: 'bob@example.com',
    status: 'APPROVED',
    createdAt: Date.now() - 86400000 * 5,
    approvedAt: Date.now() - 86400000 * 2,
    attachmentUrl: '/uploads/placeholder.txt'
  },
  {
    id: uuidv4(),
    issueType: 'Bug',
    description: 'Form validation not working on mobile devices',
    contactName: 'Carol Davis',
    contactEmail: 'carol@example.com',
    status: 'RESOLVED',
    createdAt: Date.now() - 86400000 * 7,
    approvedAt: Date.now() - 86400000 * 4,
    attachmentUrl: '/uploads/placeholder.txt'
  }
];

export const userStatuses: UserStatusEntry[] = [
  { email: 'admin@example.com', status: 'admin' },
  { email: 'blocked@example.com', status: 'blacklisted', reason: 'Account suspended due to policy violation' },
  { email: 'spam@test.com', status: 'blacklisted', reason: 'Multiple spam reports received' }
];