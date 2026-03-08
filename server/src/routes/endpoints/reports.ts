import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../data/db.js';
import { Report } from '../../types/report.js';
import { upload } from '../../middleware/FileAttachment.js';

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const router = Router();

// ─────────────────────────────────────────
// GET /api/reports
// ─────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  const { email } = req.query;

  if (email) {
    const rows = db.prepare(`
      SELECT * FROM reports
      WHERE LOWER(contactEmail) = LOWER(?)
      ORDER BY createdAt DESC
    `).all(email as string) as Report[];
    return res.json(rows);
  }

  const rows = db.prepare(`
    SELECT * FROM reports ORDER BY createdAt DESC
  `).all() as Report[];

  return res.json(rows);
});

// ─────────────────────────────────────────
// GET /api/reports/:id
// Returns a single report by its ID
// ─────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const report = db.prepare(`
    SELECT * FROM reports WHERE id = ?
  `).get(req.params.id) as Report | undefined;

  if (!report) return res.status(404).json({ error: 'Report not found' });

  return res.json(report);
});

// ─────────────────────────────────────────
// POST /api/reports — create a new report
// ─────────────────────────────────────────
router.post('/', upload.single('attachment'), (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const { issueType, description, contactName, contactEmail } = req.body;
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const newReport: Report = {
    id:           uuidv4(),
    issueType:    issueType    || '',
    description:  description  || '',
    contactName:  contactName  || '',
    contactEmail: contactEmail || '',
    status:       'NEW',
    priority:     'MEDIUM',   // default — admin sets it later
    createdAt:    Date.now(),
    attachmentUrl,
  };

  db.prepare(`
    INSERT INTO reports (id, issueType, description, contactName, contactEmail, status, priority, createdAt, approvedAt, attachmentUrl)
    VALUES (@id, @issueType, @description, @contactName, @contactEmail, @status, @priority, @createdAt, @approvedAt, @attachmentUrl)
  `).run({ ...newReport, approvedAt: null });

  return res.status(201).json(newReport);
});

// ─────────────────────────────────────────
// PATCH /api/reports/:id/priority — admin sets priority
// ─────────────────────────────────────────
router.patch('/:id/priority', (req: Request, res: Response) => {
  const { priority } = req.body;

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  const existing = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(req.params.id) as Report | undefined;
  if (!existing) return res.status(404).json({ error: 'Report not found' });

  db.prepare(`UPDATE reports SET priority = ? WHERE id = ?`).run(priority, req.params.id);

  return res.json({ ...existing, priority });
});

// ─────────────────────────────────────────
// POST /api/reports/:id/approve
// Marks a report as APPROVED and stores approval time
// ─────────────────────────────────────────
router.post('/:id/approve', (req: Request, res: Response) => {
  const existing = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(req.params.id) as Report | undefined;
  if (!existing) return res.status(404).json({ error: 'Report not found' });

  const approvedAt = Date.now();
  db.prepare(`UPDATE reports SET status = 'APPROVED', approvedAt = ? WHERE id = ?`).run(approvedAt, req.params.id);

  return res.json({ ...existing, status: 'APPROVED', approvedAt });
});

// ─────────────────────────────────────────
// POST /api/reports/:id/resolve
// Marks a report as RESOLVED
// ─────────────────────────────────────────
router.post('/:id/resolve', (req: Request, res: Response) => {
  const existing = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(req.params.id) as Report | undefined;
  if (!existing) return res.status(404).json({ error: 'Report not found' });

  db.prepare(`UPDATE reports SET status = 'RESOLVED' WHERE id = ?`).run(req.params.id);

  return res.json({ ...existing, status: 'RESOLVED' });
});

// ─────────────────────────────────────────
// DELETE /api/reports/:id
// Deletes a report by its ID
// ─────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  const existing = db.prepare(`SELECT id FROM reports WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Report not found' });

  db.prepare(`DELETE FROM reports WHERE id = ?`).run(req.params.id);
  return res.status(204).send();
});

export default router;