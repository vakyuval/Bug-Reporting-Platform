import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../../data/db.js';

const router = Router();

interface UserRow {
  email:    string;
  password: string;
  status:   'allowed' | 'admin' | 'blacklisted';
  reason:   string | null;
}

// ─────────────────────────────────────────
// POST /api/check-status
// Validates email + password, returns role
// ─────────────────────────────────────────
router.post('/check-status', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Look up user by email
  const user = db.prepare(`
    SELECT * FROM users WHERE LOWER(email) = LOWER(?)
  `).get(email) as UserRow | undefined;

  // User not found — same error message as wrong password 
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Compare submitted password against stored bcrypt hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Correct credentials — return their role
  return res.json({
    status: user.status,
    ...(user.reason ? { reason: user.reason } : {}),
  });

});

// ─────────────────────────────────────────
// POST /api/register
// Creates a new user with 'allowed' status
// ─────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if email is already taken
  const existing = db.prepare(`
    SELECT email FROM users WHERE LOWER(email) = LOWER(?)
  `).get(email);

  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (email, password, status, reason)
    VALUES (@email, @password, @status, @reason)
  `).run({
    email:    email.toLowerCase().trim(),
    password: hashedPassword,
    status:   'allowed',
    reason:   null,
  });

  return res.status(201).json({ message: 'Account created successfully' });
});



export default router;