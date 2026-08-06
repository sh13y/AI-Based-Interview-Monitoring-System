import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import {
  Search,
  Bell,
  User,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Sidebar */}
      <Sidebar onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          {/* Page Title rendered by children */}
          <div></div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search Anything..."
                className="pl-10 pr-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-full text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a8b88c] focus:ring-1 focus:ring-[#a8b88c] w-64 transition"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-200 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#d4a843] rounded-full text-[10px] flex items-center justify-center text-gray-900 font-bold">3</span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#a8b88c]" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#a8b88c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayout;
