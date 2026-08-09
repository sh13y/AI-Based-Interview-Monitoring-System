<div align="center">
  <img src="frontend/public/logo.png" alt="Modern Matrix Logo" width="200" />
  <p><strong>AI-Based Interview Monitoring System</strong></p>
</div>

## Overview
Modern Matrix is an advanced, AI-powered interview monitoring platform designed to streamline the hiring process. It provides real-time insights, behavioral analysis, and secure role-based access for HR professionals and administrators.

## Key Features
* **Role-Based Access Control (RBAC):** Secure access levels for Candidates, HR Managers, and Administrators.
* **Live Interview Monitoring:** Real-time tracking of candidate performance and system metrics.
* **Behavioral Analysis:** Automated scoring and analysis to assist HR in decision making.
* **Comprehensive Dashboards:** Clean, modern, and data-rich interfaces for quick insights.
* **Secure Authentication:** Email-based login with encrypted session management.

## Technology Stack
* **Frontend:** React, Vite, Custom CSS, Lucide React
* **Backend / Database:** Supabase (PostgreSQL)
* **Charts:** Chart.js, react-chartjs-2

## Getting Started

### Prerequisites
* Node.js (v16 or higher recommended)
* npm

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/sh13y/AI-Based-Interview-Monitoring-System.git
   cd AI-Based-Interview-Monitoring-System
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Database Setup:**
   Run the SQL scripts located in the `database/` folder in your Supabase SQL editor to set up the necessary tables and seed data.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## System Roles
* **Admin:** Full access to all system features, including system maintenance and user management.
* **HR Manager:** Access to view candidates, monitor interviews, and generate reports.
* **Candidate:** Restricted access to participate in assigned interview sessions.

## Codebase Architecture

The project is structured into frontend client and backend configuration directories.

### Directory Breakdown

#### `/frontend` (React + Vite App)
This is the core frontend application where all user interfaces and client-side logic reside.
* **`src/components/`**: Reusable UI components.
  * `Layout/`: Structural components like `DashboardLayout.jsx`, `Sidebar.jsx`, and `Header.jsx`.
  * `Modals/`: Interactive popups and dialogs (e.g., action confirmations).
  * `ui/`: Core design system components like `FormComponents.jsx` (inputs, buttons, secure toggles).
* **`src/pages/`**: Main application views mapped to specific routes.
  * `Dashboard.jsx`: The central analytics and data hub.
  * `LiveInterview.jsx`: The real-time AI interview monitoring interface.
  * `Login.jsx` & `Signup.jsx`: Application authentication flows.
  * `SystemMaintenance.jsx`: Admin-only configuration and oversight area.
* **`src/context/`**: Global state management.
  * `AuthContext.jsx`: Handles user authentication, session persistence, and RBAC (Role-Based Access Control) restrictions.
* **`src/lib/`**: Utility functions and shared resources.
  * `dummyData.js`: Centralized mock data used for development and offline testing.
* **`src/styles/`**: Global CSS stylesheets including design tokens and layout utility classes.

#### `/database` (Supabase configuration)
Contains the essential scripts required to initialize the backend data architecture.
* **`supabase_migration.sql`**: The primary SQL migration file. It defines the PostgreSQL schemas, configures Row Level Security (RLS) policies, and handles seed data insertion with conflict resolution (`ON CONFLICT DO UPDATE`) for safe execution.

## License
This project is proprietary and confidential.
