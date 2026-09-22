import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Radio,
  FileBarChart,
  Wrench,
  Settings,
  LogOut,
  Shield,
  Activity,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/question-bank', label: 'Question Bank', icon: BookOpen },
  { path: '/interviews', label: 'Interview Sessions', icon: Radio },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/system', label: 'System Governance', icon: Wrench, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || 'Admin';
  const isAdmin = userRole === 'Admin';

  // Filter items according to Role-Based Access Control (FR-02)
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-60 bg-[#0f131c]/95 border-r border-white/[0.08] backdrop-blur-xl flex flex-col flex-shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981]/20 to-[#6366f1]/20 border border-[#10b981]/40 flex items-center justify-center p-1.5 shadow-sm">
              <img src="/favicon.svg" alt="Modern Matrix" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight font-display flex items-center gap-1.5">
                Modern Matrix
              </span>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Proctor Intelligence</p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#4edea3] text-[9px] font-mono font-bold border border-[#10b981]/30">
            PRO
          </span>
        </div>

        {/* Role & Verification Badge */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#181c24] rounded-md border border-white/[0.06] text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Shield className="w-3 h-3 text-[#10b981]" />
            <span className="text-gray-300 font-medium truncate max-w-[90px]">{userRole}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-[#4edea3] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-beacon"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
          Operations
        </div>
        {visibleNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#10b981] text-[#0a0e16] font-semibold shadow-glow-emerald'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#0a0e16]' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span>{label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0a0e16]"></div>}
            </NavLink>
          );
        })}
      </nav>

      {/* System Telemetry Micro-Widget */}
      <div className="px-3 py-2.5 mx-3 mb-2 rounded-lg bg-[#181c24]/90 border border-white/[0.06] text-[10px] font-mono text-gray-400 space-y-1">
        <div className="flex items-center justify-between text-gray-300">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#10b981]" /> Neural Engine
          </span>
          <span className="text-[#4edea3] font-semibold">99.98%</span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-gray-500">
          <span>Latency: 18ms</span>
          <span>Aegis v4.2</span>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.07]">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

