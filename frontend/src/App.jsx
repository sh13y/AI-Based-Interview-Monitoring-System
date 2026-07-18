import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Add dashboard route here later */}
          <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard (Coming Soon)</h1></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
