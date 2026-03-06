import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { reports } from '../../data/store.js';
import { Report } from '../../types/report.js';

const router = Router();

// GET /api/reports
router.get('/', (_req: Request, res: Response) => {
  res.json(reports);
});

// POST /api/reports
router.post('/', (req: Request, res: Response) => {
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
  return res.status(201).json(newReport);
});

// POST /api/reports/:id/approve
router.post('/:id/approve', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = 'APPROVED';
  report.approvedAt = Date.now();

  return res.json(report);
});

// POST /api/reports/:id/resolve
router.post('/:id/resolve', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = 'RESOLVED';

  return res.json(report);
});

export default router;