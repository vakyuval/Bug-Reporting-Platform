# Bug Reporter - Take-Home Assignment

## Quick Start

```bash
# Install dependencies
npm install

# Run both client and server
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:4000

## Project Structure

```
bug-reporter-starter/
├── client/          # React + TypeScript (Vite)
│   └── src/
│       ├── api/     # API client
│       ├── pages/   # Page components
│       └── types/   # TypeScript types
└── server/          # Express + TypeScript
    ├── src/         # Server code
    └── uploads/     # Static uploads folder
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Get all reports |
| POST | `/api/reports` | Create a new report |
| GET | `/api/health` | Health check |

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
```

## Environment Variables

Client `.env` (already configured):
```
VITE_API_BASE_URL=http://localhost:4000
```
