# 🐛 Bug Reporting Platform - Full-Stack Assignment

A full-stack bug reporting and management system built with **React + TypeScript** (client) and **Express + TypeScript + SQLite** (server).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Backend | Express, TypeScript, Node.js |
| Database | SQLite via `better-sqlite3` |
| Auth | bcrypt password hashing, localStorage persistence |
| File Upload | multer (PNG / JPG / PDF, max 5MB) |
---


## Quick Start

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/vakyuval/Bug-Reporting-Platform.git
cd bug-reporter
```

### 2. Install dependencies
```bash
# Install dependencies
npm install
```

### 3. Run the app
```bash
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

---

## Features Implemented

### Authentication & Authorization
- Email + password login via `POST /api/check-status`
- Passwords hashed with **bcrypt** (10 rounds) — never stored in plain text
- Three user states: `allowed`, `admin`, `blacklisted`
- Blacklisted users see a descriptive error with the reason returned from the server
- Auth state (email + role) persisted globally in `AuthContext` via React context
- Protected routes (`<ProtectedRoute>`) redirect unauthenticated users to `/login`
- Admin-only `ReportsPage` redirects non-admins to `/my-reports`
- User self-registration with automatic login on success

### Bug Report Form (`/report`)
- Issue type **dropdown**: Bug, Feature Request, Improvement, Documentation, Other
- All fields required with **inline validation errors** (triggered on blur)
- Submit button disabled while submission is in-flight or while required fields are empty
- Clear success and error banners after submission
- Contact email pre-filled from the logged-in user's session

### File Attachment
- Single file upload: **PNG, JPG, PDF** only
- Maximum size: **5 MB**
- Client-side validation (MIME type + size) before the request is sent
- Server-side validation via Multer middleware as a second line of defence
- Files saved to `server/uploads/` with UUID-prefixed filenames to avoid collisions
- **Bonus — Screenshot capture**: uses `navigator.mediaDevices.getDisplayMedia` to capture the screen and attach it as a PNG directly from the browser, with a live preview and remove option

### My Reports Page (`/my-reports`)
- Fetches only reports belonging to the logged-in user (server-side `WHERE contactEmail = ?`)
- Handles **loading**, **error**, and **empty** states with appropriate UI and a retry button
- Clickable rows navigate to the full report details page
- Delete button for `NEW` reports (with a confirmation dialog); shows a per-row loading indicator while deleting

### Admin Reports Page (`/reports`)
- Accessible only to admin users; all others are redirected
- Fetches and displays all reports in a responsive table
- Per-row action buttons: **Approve** (NEW → APPROVED) and **Resolve** (any → RESOLVED)
- Table updates optimistically immediately after the API confirms the action
- Per-row loading indicators during approve/resolve operations
- Dismissable error banner for failed actions

### Report Details Page
- Displays full report metadata: ID, type, description, contact name and email, status, created and approved timestamps
- Attachment link opens in a new tab

### Dark Mode
- Toggle button in the nav bar
- Preference persisted to `localStorage` and rehydrated on load
- Applied via a CSS class on `document.body`

### Responsive Navigation
- Hamburger menu on mobile with animated toggle
- Nav links adapt based on user role (admin sees "Admin Reports", standard user sees "My Reports")
- Logout clears auth context and redirects to `/login`

---

## Performance Issue: Analysis & Fix

### What the issue was
`validateField()` in `ReportPage.tsx` was called directly during render on every state change. It created a 10,000-element array then ran 100 iterations of `sort()` + `filter()` + `map()`.
This is ~1,000,000 operations per keystroke causing 100–500ms UI freezes.

```ts
// ❌ BEFORE — ran on every single keystroke
function validateField(field: string, value: string): string {
  const fakeWork = Array.from({ length: 10_000 }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .filter(n => n % 2 === 0)
    .map(n => n * 2);
  // ... real validation logic
}
```

### How it was detected
- Typing in any field felt sluggish with a visible delay
- Chrome DevTools Performance tab showed long scripting tasks (50–200ms) triggered on `input` events
- The bottleneck was clearly isolated to `validateField` — pure validation logic has no reason to allocate or sort arrays


### The Fix

```ts
// ✅ AFTER — only real validation logic
function validateField(field: string, value: string): string {
  if (field === 'description' && value.trim().length < 10)
    return 'Must be at least 10 characters.';
  if (field === 'contactName' && value.trim().length < 3)
    return 'Must be at least 3 characters.';
  if (field === 'contactEmail' && !validateEmail(value))
    return 'Please enter a valid email.';
  return '';
}
```

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Work per keystroke | ~10,000 array ops + sort | O(1) string checks |
| Scripting time (DevTools) | ~50–200ms per keystroke | < 1ms |
| Perceived input lag | Noticeable | None |
