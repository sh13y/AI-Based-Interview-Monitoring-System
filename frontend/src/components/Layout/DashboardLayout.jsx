import React, { useState, useRef, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'Interview Completed',
      desc: 'Janith Perera completed Round 1 session with score 90%',
      time: '10m ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'New Candidate Registered',
      desc: 'Malith Fernando applied for Marketing Manager position',
      time: '1h ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'System Audit Active',
      desc: 'Automated 30-day data retention policy is operational',
      time: '1d ago',
      type: 'system',
    },
  ];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`
    : 'Kasun Perera';
  const displayEmail = user?.email || 'admin@modernmatrix.com';
  const displayRole = user?.role || 'Admin';

  const handleToggleRole = () => {
    const nextRole = displayRole === 'Admin' ? 'HR_Manager' : 'Admin';
    switchRole(nextRole);
  };

  return (
    <div className="flex h-screen bg-[#0a0e16] text-[#dfe2ee] overflow-hidden">
      {/* Sidebar */}
      <Sidebar onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e16]">
        {/* Header */}
        <header className="h-16 bg-[#0f131c]/90 border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#181c24] border border-white/[0.07] text-[11px] font-mono text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-beacon"></span>
              <span>Aegis Vision AI</span>
              <span className="text-gray-600">•</span>
              <span className="text-[#4edea3]">Active Telemetry</span>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search candidates, sessions, IDs..."
                className="pl-9 pr-8 py-1.5 bg-[#181c24]/90 border border-white/[0.08] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] w-64 transition"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-gray-500 font-mono border border-white/[0.08]">
                ⌘K
              </kbd>
            </div>

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-[#f59e0b] rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#181c24] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#0f131c]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#f59e0b]" />
                      <span className="text-white text-xs font-bold font-display">Telemetry Alerts</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[11px] text-[#10b981] hover:underline font-mono"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-white/[0.05] max-h-72 overflow-y-auto">
                    {sampleNotifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-white/[0.03] transition text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-200 font-medium">{n.title}</span>
                          <span className="text-gray-500 text-[10px] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {n.time}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  {user?.role === 'Admin' && (
                    <div className="p-2.5 border-t border-white/[0.08] text-center bg-[#0f131c]">
                      <Link
                        to="/system"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] text-[#10b981] hover:underline font-mono"
                      >
                        Open System Governance Logs →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Avatar & Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/[0.06] transition border border-transparent hover:border-white/[0.08] focus:outline-none"
                title="Profile Menu"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#181c24] to-[#262a33] border border-[#10b981]/50 flex items-center justify-center overflow-hidden">
                  {user?.avatar_url || user?.profile_picture_url ? (
                    <img
                      src={user.avatar_url || user.profile_picture_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-[#10b981]" />
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#181c24] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl">
                  {/* User Profile Card Header */}
                  <div className="p-4 border-b border-white/[0.08] bg-[#0f131c]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-[#262a33] border border-[#10b981]/40 flex items-center justify-center text-white font-bold text-xs font-mono">
                        {displayName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-xs font-bold truncate font-display">{displayName}</p>
                        <p className="text-gray-400 text-[11px] truncate font-mono">{displayEmail}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#10b981]/15 text-[#4edea3] text-[10px] font-mono font-medium rounded border border-[#10b981]/30">
                          <Shield className="w-2.5 h-2.5" /> {displayRole}
                        </span>
                      </div>
                    </div>

                    {/* Quick Role Switcher for Demo / Testing (FR-02) */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Current Role:</span>
                      <button
                        onClick={handleToggleRole}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#181c24] hover:bg-white/[0.06] text-[#f59e0b] border border-white/[0.1] rounded text-[10px] font-mono font-semibold transition"
                        title="Click to toggle role for RBAC testing"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Switch to {displayRole === 'Admin' ? 'HR Manager' : 'Admin'}
                      </button>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2 space-y-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition"
                    >
                      <Settings className="w-4 h-4 text-[#10b981]" /> Profile & Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4 text-red-400" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-[#0a0e16]">
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
      <div className="flex items-center justify-center h-screen bg-[#0a0e16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-mono tracking-wider">INITIALIZING SESSION...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-mono tracking-wider">VERIFYING PERMISSIONS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access if active role is not Admin
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayout;
