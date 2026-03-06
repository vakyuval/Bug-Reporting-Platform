import { Router, Request, Response } from 'express';
import { userStatuses } from '../../data/store.js';

const router = Router();

// POST /api/check-status - check user login status
router.post('/check-status', (req: Request, res: Response) => {
  const { email } = req.body;

  // Validation - checks if email was provided
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Search for this email in our list
  const userEntry = userStatuses.find( (u) => u.email.toLowerCase() === email.toLowerCase() );

  // Not in the list => regular user
  if (!userEntry) {
    return res.json({ status: 'allowed' });
  }

  // Found => return their status + optional reason
  return res.json({
    status: userEntry.status,
    reason: userEntry.reason,
  });
});

export default router;