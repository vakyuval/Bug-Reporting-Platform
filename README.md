# 🐛 Bug Reporting Platform

A full-stack bug reporting and management system built with **React + TypeScript** (client) and **Express + TypeScript + SQLite** (server).

---

## Table of Contents

- [🐛 Bug Reporting Platform](#-bug-reporting-platform)
  - [Table of Contents](#table-of-contents)
  - [Quick Start](#quick-start)
  - [The SQLite database (`server/data/bug-reporter.db`) is created and seeded automatically on first run — no manual setup required.](#the-sqlite-database-serverdatabug-reporterdb-is-created-and-seeded-automatically-on-first-run--no-manual-setup-required)
  - [Project Structure](#project-structure)
  - [Seed Accounts](#seed-accounts)
  - [API Endpoints](#api-endpoints)
  - [Data Model](#data-model)
  - [Environment Variables](#environment-variables)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run both client and server
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:4000

The SQLite database (`server/data/bug-reporter.db`) is created and seeded automatically on first run — no manual setup required.
---

## Project Structure

```
Bug-Reporting-Platform/
├── package.json              # Root workspace config + concurrently script
├── client/                   # React + TypeScript (Vite)
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx           # Router, nav, dark mode, protected routes
│       ├── api/
│       │   └── client.ts     # Typed API client class (all fetch calls)
│       ├── context/
│       │   └── AuthContext.tsx  # Global auth state (email, role, login/logout)
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── ReportPage.tsx          # Bug submission form
│       │   ├── MyReportsPage.tsx       # User's own report list
│       │   ├── ReportsPage.tsx         # Admin-only reports table
│       │   └── ReportDetailsPage.tsx
│       └── types/
│           ├── Report.ts
│           └── AuthContext.ts
└── server/                   # Express + TypeScript
    ├── src/
    │   ├── index.ts              # App entry point, middleware setup
    │   ├── data/
    │   │   └── db.ts             # SQLite init, migrations, and seeding
    │   ├── middleware/
    │   │   └── FileAttachment.ts # Multer config (type + size validation)
    │   ├── routes/
    │   │   ├── router.ts         # Mounts sub-routers
    │   │   └── endpoints/
    │   │       ├── auth.ts       # /check-status, /register
    │   │       └── reports.ts    # All report CRUD + actions
    │   └── types/
    │       ├── report.ts
    │       └── user.ts
    ├── data/                 # SQLite database files (auto-created)
    └── uploads/              # Uploaded attachments (auto-created)
```

---

---

## Seed Accounts

Two user roles are supported:
- **Standard Users** — register, log in, submit bug reports, view and delete their own reports.
- **Administrators** — view all submitted reports, approve them, resolve them, and set priority levels.

These accounts are created automatically on first run:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Admin123!` | Admin |
| `user@example.com` | `User123!` | Standard User |
| `blocked@example.com` | `Block123!` | Blacklisted |
| `spam@test.com` | `Spam123!` | Blacklisted |

You can also register a new account via the **Sign Up** page — new accounts are always given the `allowed` (standard user) role.

---


## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/check-status` | Login — validates email + password, returns role |
| `POST` | `/api/register` | Creates a new `allowed` user account |
| `GET`  | `/api/reports` | Get all reports (filter by `?email=` for user-scoped view) |
| `GET`  | `/api/reports/:id` | Get a single report by ID |
| `POST` | `/api/reports` | Submit a new report (multipart/form-data) |
| `POST` | `/api/reports/:id/approve` | Set status → APPROVED + record approvedAt timestamp |
| `POST` | `/api/reports/:id/resolve` | Set status → RESOLVED |
| `PATCH`| `/api/reports/:id/priority` | Update priority (LOW / MEDIUM / HIGH / CRITICAL) |
| `DELETE`| `/api/reports/:id` | Delete a report by ID |
| `GET`  | `/api/health` | Health check |

---

## Data Model

```typescript
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
```

## Environment Variables

Client `.env` (already configured):
```
VITE_API_BASE_URL=http://localhost:4000
```
