# Modern Matrix

**AI-Based Automated Interview Monitoring System** — An HR dashboard for managing candidates, interview sessions, and AI-driven behavioral evaluation reports.

> Rajarata University of Sri Lanka — Faculty of Applied Sciences, ICT Program (2026)

---

## Project Structure

```
Modern-Matrix/
├── database/
│   └── supabase_migration.sql       # PostgreSQL schema + seed data
├── docs/
│   └── SDS.md                       # System Design Specification (Full)
├── frontend/
│   ├── public/                      # Static assets (favicon, logo, icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/              # Dashboard shell & sidebar
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── Modals/              # Dialog components
│   │   │   │   ├── AddCandidateModal.jsx
│   │   │   │   └── AddQuestionModal.jsx
│   │   │   └── ui/                  # Reusable form elements
│   │   │       └── FormComponents.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Supabase auth + demo fallback
│   │   ├── hooks/                   # Custom React hooks (Phase 2)
│   │   ├── lib/
│   │   │   ├── supabase.js          # Supabase client initializer
│   │   │   └── dummyData.js         # Mock data for offline/demo mode
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Candidates.jsx
│   │   │   ├── QuestionBank.jsx
│   │   │   ├── InterviewSessions.jsx
│   │   │   ├── LiveInterview.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── CandidateReport.jsx
│   │   │   ├── SystemMaintenance.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── styles/
│   │   │   └── globals.css          # Tailwind directives + global styles
│   │   ├── App.jsx                  # Route definitions
│   │   └── main.jsx                 # Application entry point
│   ├── .env.example                 # Environment variable template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── vite.config.js
├── .gitignore
├── README.md
└── start.bat                        # One-click dev server launcher (Windows)
```

## Tech Stack

| Layer              | Technology                                    |
| ------------------ | --------------------------------------------- |
| Frontend Framework | React 19 + Vite                               |
| Styling            | Tailwind CSS 3                                |
| Routing            | React Router v6                               |
| Auth & Database    | Supabase (PostgreSQL + Auth)                  |
| Charts             | Chart.js + react-chartjs-2                    |
| Icons              | Lucide React                                  |
| Forms              | React Hook Form                               |

## Quick Start

### 1. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `database/supabase_migration.sql`
3. Copy your **Project URL** and **Anon Key** from **Settings → API**

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local    # Then fill in your Supabase credentials
npm install
npm run dev
```

Or from the project root (Windows):

```bash
start.bat
```

The app runs at **http://localhost:5173**

### Demo Mode

If Supabase environment variables are not configured, the app automatically runs in **Demo Mode** with mock data and localStorage-based auth — useful for UI development and presentations without a live database.

## Application Routes

| Path              | Page                     | Description                         |
| ----------------- | ------------------------ | ----------------------------------- |
| `/login`          | Login                    | User authentication                 |
| `/signup`         | Registration             | New account creation                |
| `/verify-email`   | Email Verification       | Post-signup confirmation            |
| `/dashboard`      | Dashboard                | Overview & analytics                |
| `/candidates`     | Candidate Management     | CRUD operations for candidates      |
| `/question-bank`  | Question Bank            | Interview question management       |
| `/interviews`     | Interview Sessions       | Session listing & scheduling        |
| `/interviews/:id` | Live Interview           | Real-time interview monitoring      |
| `/reports`        | Reports                  | Evaluation leaderboard              |
| `/reports/:id`    | Candidate Report         | Individual radar chart analysis     |
| `/system`         | System Maintenance       | Server health & admin tools         |
| `/settings`       | Settings                 | User profile & preferences          |

## Development Status

### Phase 1 — Completed ✅
- Dashboard UI with analytics charts
- Authentication (Supabase + Demo fallback)
- Candidate management (CRUD)
- Question bank management (CRUD with AI scoring weights)
- Interview session listing
- Live interview recording UI
- Reports with radar chart visualization
- System maintenance dashboard
- User settings & profile management

### Phase 2 — In Progress 🔄
- LLM integration for behavioral scoring pipeline
- Real-time speech-to-text transcription
- AI-powered evaluation metrics (honesty, confidence, attitude, relevance)

### Phase 3 — Planned 📋
- PDF report export
- Bulk CSV candidate import
- 30-day automated data purge
- Role-based access control refinements

## Documentation

See [docs/SDS.md](docs/SDS.md) for the full System Design Specification.

## Team

**Group Members:**
- USS S Sankalpa
- DMUK Dissanayake
- KGSM Chamikara
- AWKD Jayarathne
- RPIPP Gotabhaya

**Supervisor:** Ms. A KNL Aththanagoda

Rajarata University of Sri Lanka — Faculty of Applied Sciences, ICT Program (2026)
