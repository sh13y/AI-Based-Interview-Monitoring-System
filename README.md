<div align="center">
  <img src="frontend/public/logo.png" alt="Modern Matrix Logo" width="200" />
  <h1>Modern Matrix</h1>
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

## Project Structure
* `/frontend`: Contains the React web application.
* `/database`: Contains SQL scripts for database configuration.

## License
This project is proprietary and confidential.
