# Modern Matrix

AI-Based Automated Interview Monitoring System — HR dashboard for managing candidates, interview sessions, and behavioral evaluation reports.

## Project Structure

```
modern-matrix/
├── database/
│   └── supabase_migration.sql   # PostgreSQL schema + seed data
├── docs/
│   └── SDS.md                   # System Design Specification
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/          # Dashboard shell, sidebar, route guard
│   │   │   ├── Modals/          # Add candidate, add question
│   │   │   └── FormComponents.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Supabase auth + demo fallback
│   │   ├── lib/
│   │   │   ├── supabase.js      # Supabase client
│   │   │   └── dummyData.js     # Mock data for offline/demo mode
│   │   ├── pages/               # Route pages
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
└── start.bat
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| Charts | Chart.js, react-chartjs-2 |

## Quick Start

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `database/supabase_migration.sql`
3. Copy your project URL and anon key from **Settings → API**

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the dev server:

```bash
npm run dev
```

Or from the project root:

```bash
start.bat
```

App runs at **http://localhost:5173**

### Demo Mode

If Supabase env vars are not set, the app runs in **demo mode** with mock data and localStorage auth — useful for UI development without a database.

## Routes

| Path | Page |
|------|------|
| `/login` | Login |
| `/signup` | Registration |
| `/verify-email` | Email verification |
| `/dashboard` | Overview & analytics |
| `/candidates` | Candidate management |
| `/question-bank` | Interview questions |
| `/interviews` | Session list |
| `/interviews/:id` | Live interview |
| `/reports` | Evaluation leaderboard |
| `/reports/:id` | Candidate radar report |
| `/system` | System maintenance |
| `/settings` | User settings |

## Development Status

- **Done:** Dashboard UI, auth (Supabase), candidate & question CRUD
- **In progress:** Live interview recording, AI scoring pipeline
- **Planned:** PDF export, bulk CSV import, 30-day data purge

See `docs/SDS.md` for the full system design specification.

## Team

Rajarata University of Sri Lanka — Faculty of Applied Sciences, ICT Program (2026)
