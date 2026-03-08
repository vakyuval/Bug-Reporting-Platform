import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// __dirname equivalent for ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Database file lives at server/data/bug-reporter.db
// It is created automatically if it doesn't exist
const DB_PATH = path.join(__dirname, '../../data/bug-reporter.db');

// Make sure the directory exists before opening the DB
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db: DatabaseType = new Database(DB_PATH);

// ─────────────────────────────────────────
// Performance: WAL mode = faster writes
// ─────────────────────────────────────────
db.pragma('journal_mode = WAL');

// ─────────────────────────────────────────
// Create tables (only if they don't exist)
// ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id            TEXT PRIMARY KEY,
    issueType     TEXT NOT NULL,
    description   TEXT NOT NULL,
    contactName   TEXT NOT NULL,
    contactEmail  TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'NEW',
    priority      TEXT NOT NULL DEFAULT 'MEDIUM',
    createdAt     INTEGER NOT NULL,
    approvedAt    INTEGER,
    attachmentUrl TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS users (
    email    TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    status   TEXT NOT NULL DEFAULT 'allowed',
    reason   TEXT
  );
`);

// Migrate existing databases — add priority column if it doesn't exist yet
try {
  db.exec(`ALTER TABLE reports ADD COLUMN priority TEXT NOT NULL DEFAULT 'MEDIUM'`);
} catch {
  // Column already exists — safe to ignore
}

const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;

if (userCount === 0) {
  const insert = db.prepare(`
    INSERT INTO users (email, password, status, reason)
    VALUES (@email, @password, @status, @reason)
  `);

  const seedUsers = db.transaction(() => {
    insert.run({
      email:    'admin@example.com',
      password: bcrypt.hashSync('Admin123!', 10),
      status:   'admin',
      reason:   null,
    });
    insert.run({
      email:    'user@example.com',
      password: bcrypt.hashSync('User123!', 10),
      status:   'allowed',
      reason:   null,
    });
    insert.run({
      email:    'blocked@example.com',
      password: bcrypt.hashSync('Block123!', 10),
      status:   'blacklisted',
      reason:   'Account suspended due to policy violation',
    });
    insert.run({
      email:    'spam@test.com',
      password: bcrypt.hashSync('Spam123!', 10),
      status:   'blacklisted',
      reason:   'Multiple spam reports received',
    });
  });

  seedUsers();
  console.log('[db] Users seeded.');
}

// ─────────────────────────────────────────
// Seed sample reports (only if table is empty)
// ─────────────────────────────────────────
const reportCount = (db.prepare('SELECT COUNT(*) as count FROM reports').get() as { count: number }).count;

if (reportCount === 0) {
  const insertReport = db.prepare(`
    INSERT INTO reports (id, issueType, description, contactName, contactEmail, status, createdAt, approvedAt, attachmentUrl)
    VALUES (@id, @issueType, @description, @contactName, @contactEmail, @status, @createdAt, @approvedAt, @attachmentUrl)
  `);

  const seedReports = db.transaction(() => {
    insertReport.run({
      id: uuidv4(), issueType: 'Bug',
      description: 'Application crashes when clicking the submit button twice quickly',
      contactName: 'Alice Johnson', contactEmail: 'user@example.com',
      status: 'NEW', createdAt: Date.now() - 86400000 * 3,
      approvedAt: null, attachmentUrl: '',
    });
    insertReport.run({
      id: uuidv4(), issueType: 'Feature Request',
      description: 'Add dark mode support for better accessibility',
      contactName: 'Bob Smith', contactEmail: 'user@example.com',
      status: 'APPROVED', createdAt: Date.now() - 86400000 * 5,
      approvedAt: Date.now() - 86400000 * 2, attachmentUrl: '',
    });
    insertReport.run({
      id: uuidv4(), issueType: 'Bug',
      description: 'Form validation not working on mobile devices',
      contactName: 'Carol Davis', contactEmail: 'user@example.com',
      status: 'RESOLVED', createdAt: Date.now() - 86400000 * 7,
      approvedAt: Date.now() - 86400000 * 4, attachmentUrl: '',
    });
  });

  seedReports();
  console.log('[db] Sample reports seeded.');
}

export default db;