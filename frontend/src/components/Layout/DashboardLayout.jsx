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
      desc: 'Jenny Adams completed Round 1 session with score 90%',
      time: '10m ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'New Candidate Registered',
      desc: 'Mark Chen applied for Marketing Manager position',
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
    : 'Jessica Smith';
  const displayEmail = user?.email || 'admin@modernmatrix.com';
  const displayRole = user?.role || 'Admin';

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Sidebar */}
      <Sidebar onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div></div>

          {/* Right side icons */}
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

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-gray-400 hover:text-gray-200 transition rounded-full hover:bg-[#2a2a2a]"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#d4a843] rounded-full text-[10px] flex items-center justify-center text-gray-900 font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#252525]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#d4a843]" />
                      <span className="text-white text-xs font-bold">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[11px] text-[#a8b88c] hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-800/60 max-h-72 overflow-y-auto">
                    {sampleNotifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-[#252525] transition text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-200 font-semibold">{n.title}</span>
                          <span className="text-gray-500 text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {n.time}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-gray-800 text-center bg-[#252525]">
                    <Link
                      to="/system"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-[#a8b88c] hover:underline font-bold"
                    >
                      View System Maintenance & Logs
                    </Link>
                  </div>
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
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#2a2a2a] transition focus:outline-none"
                title="Profile Menu"
              >
                <div className="w-9 h-9 rounded-full bg-[#3a3a3a] border-2 border-[#a8b88c] flex items-center justify-center overflow-hidden">
                  {user?.avatar_url || user?.profile_picture_url ? (
                    <img
                      src={user.avatar_url || user.profile_picture_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-[#a8b88c]" />
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {/* User Profile Card Header */}
                  <div className="p-4 border-b border-gray-800 bg-[#252525]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#3a3a3a] border border-[#a8b88c] flex items-center justify-center text-white font-bold">
                        {displayName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-xs font-bold truncate">{displayName}</p>
                        <p className="text-gray-400 text-[11px] truncate">{displayEmail}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#a8b88c]/20 text-[#a8b88c] text-[10px] font-bold rounded-full border border-[#a8b88c]/30">
                          <Shield className="w-2.5 h-2.5" /> {displayRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2 space-y-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#252525] rounded-lg transition"
                    >
                      <Settings className="w-4 h-4 text-[#a8b88c]" /> Profile & Account Settings
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

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  // Restrict access if active role is not Admin
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayout;
