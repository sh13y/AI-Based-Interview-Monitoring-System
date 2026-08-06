import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  FileBarChart,
  Wrench,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/question-bank', label: 'Question Bank', icon: BookOpen },
  { path: '/interviews', label: 'Interview Sessions', icon: Video },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/system', label: 'System Maintenance', icon: Wrench },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  return (
    <aside className="w-56 bg-[#1e1e1e] border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#a8b88c]/20 border border-[#a8b88c]/40 flex items-center justify-center">
            <span className="text-[#a8b88c] font-bold text-sm">M</span>
          </div>
          <span className="text-gray-200 font-semibold text-sm tracking-wide">Modern Matrix</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#a8b88c] text-gray-900'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
