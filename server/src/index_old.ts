import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Types
interface Report {
  id: string;
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
}

interface UserStatusEntry {
  email: string;
  status: 'allowed' | 'blacklisted' | 'admin';
  reason?: string;
}

// In-memory storage
const reports: Report[] = [
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

const userStatuses: UserStatusEntry[] = [
  { email: 'admin@example.com', status: 'admin' },
  { email: 'blocked@example.com', status: 'blacklisted', reason: 'Account suspended due to policy violation' },
  { email: 'spam@test.com', status: 'blacklisted', reason: 'Multiple spam reports received' }
];

// API Routes


// POST /api/check-status - check user login status
app.post('/api/check-status', (req: Request, res: Response) => {
  const { email } = req.body;

  // Validation - checks if email was provided
  if (!email){
    return res.status(400).json({ error: 'Email is required for login' });
  }

  // checks if email in userStatuses list
  const userEntry = userStatuses.find( (u) => u.email.toLowerCase() === email.toLowerCase());

  if (!userEntry){
    return res.json({ status: 'allowed' }); // if not found in list - return a regular allowed user
  }

  // if found - return the user status, and reason if blocked
  return res.json({
    status: userEntry.status,
    reason: userEntry.reason, // only for blacklisted users
  });

});


// GET /api/reports - Get all reports
app.get('/api/reports', (_req: Request, res: Response) => {
  res.json(reports);
});

// POST /api/reports - Create a new report
app.post('/api/reports', (req: Request, res: Response) => {
  const { issueType, description, contactName, contactEmail } = req.body;

  const newReport: Report = {
    id: uuidv4(),
    issueType: issueType || '',
    description: description || '',
    contactName: contactName || '',
    contactEmail: contactEmail || '',
    status: 'NEW',
    createdAt: Date.now(),
    attachmentUrl: '/uploads/placeholder.txt'
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Uploads served at http://localhost:${PORT}/uploads`);
});
