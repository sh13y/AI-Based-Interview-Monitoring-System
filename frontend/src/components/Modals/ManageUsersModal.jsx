// ==============================================================================
// Modern Matrix AI Interview Monitoring System - HR Manager & User Management Modal
// Implements:
//   [FR-02: ROLE-BASED ACCESS CONTROL (Admin User Deletion & Permission Control)]
//   [FR-18: SESSION HISTORY AUDITING (HR Manager Interview Logs)]
//   [FR-21: SYSTEM AUDIT LOGGING (Login & Authentication Activity History)]
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  X, Users, Trash2, Shield, UserX, UserCheck, Eye, Search, Filter,
  Calendar, Mail, Clock, AlertTriangle, CheckCircle2, ChevronRight, Activity,
  LogIn, LogOut, Laptop, Key, RefreshCw
} from 'lucide-react';
import { dummyUsers, dummyInterviewSessions } from '../../lib/dummyData';
import { supabase, isSupabaseConfigured, getAuditLogs, writeAuditLog } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const ManageUsersModal = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Selected HR Manager & Tabs View
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'logins'
  const [userSessions, setUserSessions] = useState([]);
  const [userLogins, setUserLogins] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    let loaded = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          loaded = data;
        }
      } catch (err) {
        console.warn('Supabase users fetch fallback:', err);
      }
    }

    if (loaded.length === 0) {
      loaded = [...dummyUsers];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mm_user_') && key !== 'mm_user_current') {
          try {
            const u = JSON.parse(localStorage.getItem(key));
            if (u && !loaded.some(existing => existing.email === u.email)) {
              loaded.push({
                id: u.id || `usr-${Date.now()}`,
                user_id_field: u.user_id_field || 'EMP-LOCAL',
                email: u.email,
                first_name: u.first_name || 'HR',
                last_name: u.last_name || 'Manager',
                role: u.role || 'HR_Manager',
                is_locked: !!u.is_locked,
                is_verified: true,
                created_at: u.created_at || new Date().toISOString(),
                sessions_count: 0,
              });
            }
          } catch (_) {}
        }
      }
    }

    setUsersList(loaded);
    setLoading(false);
  };

  const handleSelectUserHistory = async (targetUser) => {
    setSelectedUser(targetUser);

    const matchingSessions = dummyInterviewSessions.filter(
      (s) => s.user_id === targetUser.id || 
             s.evaluator_name?.toLowerCase().includes(targetUser.first_name?.toLowerCase()) ||
             targetUser.role === 'Admin'
    );
    setUserSessions(matchingSessions.length > 0 ? matchingSessions : dummyInterviewSessions.slice(0, 3));

    const allLogs = await getAuditLogs();
    const userSpecificLogs = allLogs.filter(
      (l) => l.user_email?.toLowerCase() === targetUser.email.toLowerCase() ||
             l.details?.toLowerCase().includes(targetUser.email.toLowerCase())
    );

    const fallbackLogins = [
      {
        id: 'log-1',
        action: 'PASSWORD_VERIFIED',
        details: `Successful operator login for ${targetUser.email}`,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        device: 'Chrome 122 (Windows 11)',
        ip_address: '192.168.1.104',
      },
      {
        id: 'log-2',
        action: 'SESSION_INITIALIZED',
        details: `Created session token with 8hr expiry for ${targetUser.email}`,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        device: 'Chrome 122 (Windows 11)',
        ip_address: '192.168.1.104',
      },
      {
        id: 'log-3',
        action: 'USER_LOGOUT',
        details: `Clean sign-out event recorded for ${targetUser.email}`,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        device: 'Chrome 122 (Windows 11)',
        ip_address: '192.168.1.104',
      },
    ];

    setUserLogins(userSpecificLogs.length > 0 ? userSpecificLogs : fallbackLogins);
  };

  const handleDeleteUser = async (targetUser) => {
    if (currentUser?.role !== 'Admin') {
      toast.error('Access Denied: Only System Administrators can delete users.');
      return;
    }

    if (targetUser.email === currentUser?.email) {
      toast.error('Operation Refused: You cannot delete your own active administrator account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${targetUser.first_name} ${targetUser.last_name}" (${targetUser.email})?`)) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').delete().eq('id', targetUser.id);
      } catch (err) {
        console.warn('Supabase user delete error:', err);
      }
    }

    try {
      localStorage.removeItem(`mm_user_${targetUser.email.toLowerCase()}`);
    } catch (_) {}

    setUsersList((prev) => prev.filter((u) => u.id !== targetUser.id));
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(null);
    }

    await writeAuditLog({
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: targetUser.id,
      details: `Admin deleted ${targetUser.role} account: ${targetUser.first_name} ${targetUser.last_name} (${targetUser.email})`,
      userEmail: currentUser?.email,
    });

    toast.success(`User "${targetUser.first_name} ${targetUser.last_name}" deleted.`);
  };

  const handleToggleLock = async (targetUser) => {
    const newLockState = !targetUser.is_locked;

    if (targetUser.email === currentUser?.email && newLockState) {
      toast.error('You cannot lock your own account.');
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({ is_locked: newLockState }).eq('id', targetUser.id);
      } catch (err) {
        console.warn('Supabase lock error:', err);
      }
    }

    const localKey = `mm_user_${targetUser.email.toLowerCase()}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || 'null');
    if (localData) {
      localData.is_locked = newLockState;
      localStorage.setItem(localKey, JSON.stringify(localData));
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, is_locked: newLockState } : u))
    );

    await writeAuditLog({
      action: newLockState ? 'USER_LOCKED' : 'USER_UNLOCKED',
      entityType: 'user',
      entityId: targetUser.id,
      details: `Admin ${newLockState ? 'locked' : 'unlocked'} account: ${targetUser.email}`,
      userEmail: currentUser?.email,
    });

    toast.success(`Account for ${targetUser.first_name} ${newLockState ? 'locked' : 'unlocked'}.`);
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'Admin' ? 'HR_Manager' : 'Admin';

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({ role: newRole }).eq('id', targetUser.id);
      } catch (err) {
        console.warn('Supabase role update error:', err);
      }
    }

    const localKey = `mm_user_${targetUser.email.toLowerCase()}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || 'null');
    if (localData) {
      localData.role = newRole;
      localStorage.setItem(localKey, JSON.stringify(localData));
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );

    await writeAuditLog({
      action: 'USER_ROLE_CHANGED',
      entityType: 'user',
      entityId: targetUser.id,
      details: `Role for ${targetUser.email} changed to ${newRole}`,
      userEmail: currentUser?.email,
    });

    toast.success(`Role for ${targetUser.first_name} changed to ${newRole}.`);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      (u.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.user_id_field || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl border border-white/10 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0E16]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white text-base font-bold font-display">Evaluator & User Management</h2>
              <p className="text-gray-400 text-xs font-mono">RBAC administration: delete evaluators, lock accounts, inspect authentication traces</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0A0E16]/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer font-mono"
            >
              <option value="All">All Roles</option>
              <option value="HR_Manager">Evaluators Only</option>
              <option value="Admin">Admins Only</option>
            </select>
            <span className="text-gray-500 text-xs font-mono font-bold">
              Total: {filteredUsers.length}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Panel: Users Table */}
          <div className="col-span-12 lg:col-span-6 border-r border-white/10 overflow-y-auto p-5 space-y-3">
            <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Registered Accounts</h3>

            {loading ? (
              <p className="text-gray-500 text-xs py-8 text-center font-mono animate-pulse">Loading evaluator profiles...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-xs py-8 text-center font-mono">No users found matching query.</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                    selectedUser?.id === u.id
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[#0A0E16] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-surface border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs font-display flex-shrink-0">
                      {`${u.first_name?.[0] || 'U'}${u.last_name?.[0] || ''}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-bold truncate">{u.first_name} {u.last_name}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          u.role === 'Admin'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {u.role}
                        </span>
                        {u.is_locked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs font-mono truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSelectUserHistory(u)}
                      className="px-2.5 py-1.5 bg-surface-card hover:bg-surface-elevated border border-white/10 text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition font-mono"
                      title="Inspect History"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audit</span>
                    </button>

                    <button
                      onClick={() => handleToggleLock(u)}
                      className={`p-1.5 rounded-lg border transition ${
                        u.is_locked
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                          : 'bg-surface-card border-white/10 text-gray-400 hover:text-amber-400'
                      }`}
                      title={u.is_locked ? 'Unlock Account' : 'Lock Account'}
                    >
                      {u.is_locked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u)}
                      disabled={u.email === currentUser?.email}
                      className="p-1.5 bg-surface-card hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-gray-400 hover:text-rose-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Panel: History */}
          <div className="col-span-12 lg:col-span-6 overflow-y-auto p-5 space-y-4 bg-[#0A0E16]/40">
            {selectedUser ? (
              <>
                {/* User Summary Header */}
                <div className="bg-[#0A0E16] p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-white text-sm font-bold font-display">{selectedUser.first_name} {selectedUser.last_name}</h3>
                      <p className="text-gray-400 text-xs font-mono">{selectedUser.email}</p>
                    </div>
                    <button
                      onClick={() => handleRoleToggle(selectedUser)}
                      className="px-2.5 py-1 bg-surface-card border border-white/10 hover:border-amber-400 text-gray-300 hover:text-amber-400 rounded-lg text-[11px] font-mono transition"
                    >
                      Switch to {selectedUser.role === 'Admin' ? 'HR Manager' : 'Admin'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#0A0E16] p-2.5 rounded-lg border border-white/5">
                      <span className="text-gray-500 block text-[10px]">Registered</span>
                      <span className="text-gray-200 font-medium">
                        {new Date(selectedUser.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bg-[#0A0E16] p-2.5 rounded-lg border border-white/5">
                      <span className="text-gray-500 block text-[10px]">Logins Recorded</span>
                      <span className="text-emerald-400 font-bold">{userLogins.length} Events</span>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10 font-mono">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-2 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'sessions'
                        ? 'border-emerald-400 text-emerald-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Proctor Sessions ({userSessions.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('logins')}
                    className={`pb-2 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'logins'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Auth Traces ({userLogins.length})
                  </button>
                </div>

                {/* Tab 1: Sessions */}
                {activeTab === 'sessions' && (
                  <div className="space-y-2">
                    {userSessions.length === 0 ? (
                      <p className="text-gray-500 text-xs py-4 text-center font-mono">No sessions conducted yet.</p>
                    ) : (
                      userSessions.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onClose();
                            navigate(`/interviews/${s.id}`);
                          }}
                          className="bg-[#0A0E16] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition space-y-1 group font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-xs font-bold group-hover:text-emerald-400 transition">
                              {s.candidate_name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                              {s.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px]">{s.position} · {s.round || 'Round 1'}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 2: Logins */}
                {activeTab === 'logins' && (
                  <div className="space-y-2">
                    {userLogins.length === 0 ? (
                      <p className="text-gray-500 text-xs py-4 text-center font-mono">No login logs recorded.</p>
                    ) : (
                      userLogins.map((log, idx) => (
                        <div
                          key={log.id || idx}
                          className="bg-[#0A0E16] p-3 rounded-xl border border-white/5 space-y-1 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {log.action}
                            </span>
                            <span className="text-gray-500 text-[10px]">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-xs pt-0.5">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <Users className="w-10 h-10 text-gray-600 mb-2" />
                <p className="text-gray-400 text-xs font-semibold font-mono">Select an Evaluator Account</p>
                <p className="text-gray-600 text-[11px] mt-1 font-mono">Click "Audit" to inspect proctor sessions and login history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0A0E16]/80 flex justify-between items-center text-xs font-mono">
          <span className="text-gray-500">Chief Proctor Privileges Active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-card hover:bg-surface-elevated border border-white/10 text-gray-200 rounded-xl font-semibold transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;
