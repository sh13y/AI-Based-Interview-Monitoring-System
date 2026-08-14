// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Main Application Router
// Maps Functional Requirements (FR-01, FR-02, FR-03, FR-04, FR-06 - FR-21) to Views
// ==============================================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import QuestionBank from './pages/QuestionBank';
import InterviewSessions from './pages/InterviewSessions';
import LiveInterview from './pages/LiveInterview';
import Reports from './pages/Reports';
import CandidateReport from './pages/CandidateReport';
import SystemMaintenance from './pages/SystemMaintenance';
import Settings from './pages/Settings';
import { ProtectedRoute, AdminRoute } from './components/Layout/DashboardLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ====================================================================
              [FR-01: USER LOGIN & AUTHENTICATION]
              Public routes for login, registration, and email verification
              ==================================================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ====================================================================
              [FR-02: ROLE-BASED ACCESS CONTROL (RBAC)]
              Protected routes wrapped in ProtectedRoute and AdminRoute guards
              ==================================================================== */}
          
          {/* Dashboard Overview */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* [FR-03: CANDIDATE DATA MANAGEMENT] */}
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <Candidates />
              </ProtectedRoute>
            }
          />

          {/* [FR-04: QUESTION BANK MANAGEMENT] */}
          <Route
            path="/question-bank"
            element={
              <ProtectedRoute>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          {/* [FR-18: SESSION HISTORY] */}
          <Route
            path="/interviews"
            element={
              <ProtectedRoute>
                <InterviewSessions />
              </ProtectedRoute>
            }
          />

          {/* [FR-06, FR-07, FR-08, FR-09, FR-10, FR-12, FR-15: LIVE MONITORING & PREPROCESSING] */}
          <Route
            path="/interviews/:id"
            element={
              <ProtectedRoute>
                <LiveInterview />
              </ProtectedRoute>
            }
          />

          {/* Candidate Evaluation & Comparisons */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* [FR-03: CANDIDATE CV VIEW & FR-12: TRANSCRIPT EVALUATION] */}
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <CandidateReport />
              </ProtectedRoute>
            }
          />

          {/* [FR-02: RBAC ADMIN ONLY, FR-20: DATA PURGE & FR-21: AUDIT LOGGING] */}
          <Route
            path="/system"
            element={
              <AdminRoute>
                <SystemMaintenance />
              </AdminRoute>
            }
          />

          {/* [FR-19: PROFILE MANAGEMENT & SECURITY] */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Default Redirection */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
