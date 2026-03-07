import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { reports } from '../../data/store.js';
import { Report } from '../../types/report.js';
import { upload } from '../../middleware/FileAttachment.js';


const router = Router();

// GET /api/reports - Get all reports
router.get('/', (req: Request, res: Response) => {
  const { email } = req.query;
  if (email) {
    // Filter reports to only this user's email
    const userReports = reports.filter(
      (r) => r.contactEmail.toLowerCase() === (email as string).toLowerCase()
    );
    return res.json(userReports);
  }
  // No email param = return everything (admin use)
  return res.json(reports);
});


// POST /api/reports - Create a new report
router.post('/', upload.single('attachment'), (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const { issueType, description, contactName, contactEmail } = req.body;
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const newReport: Report = {
    id: uuidv4(),
    issueType: issueType || '',
    description: description || '',
    contactName: contactName || '',
    contactEmail: contactEmail || '',
    status: 'NEW',
    createdAt: Date.now(),
    attachmentUrl
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});


// GET /api/reports/:id - details of report
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  return res.json(report);
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


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  reports.splice(index, 1);
  return res.status(204).send();
});

export default router;