// ==============================================================================
// Modern Matrix AI Interview Monitoring System - System Maintenance (Admin Only)
// Implements:
//   [FR-02: ROLE-BASED ACCESS CONTROL (Admin Only System Maintenance & User Control)]
//   [FR-20: AUTOMATED DATA PURGE (30-Day Data Retention Policy Execution)]
//   [FR-21: SYSTEM AUDIT LOGGING (Live Activity Log Viewer & Recording)]
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Users,
  Clock,
  Database,
  Shield,
  FileText,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Trash2,
  X,
  Activity,
} from 'lucide-react';
import { dummySystemStats } from '../lib/dummyData';
import {
  testDatabaseConnection,
  isSupabaseConfigured,
  getAuditLogs,
  runDataPurge,
  writeAuditLog,
} from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ManageUsersModal from '../components/Modals/ManageUsersModal';
import toast, { Toaster } from 'react-hot-toast';

const SystemMaintenance = () => {
  const { user } = useAuth();
  const stats = dummySystemStats;
  const [dbConnection, setDbConnection] = useState({ loading: true, connected: false, message: '' });
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  useEffect(() => {
    checkConnection();
    loadAuditLogs();
  }, []);

  const checkConnection = async () => {
    setDbConnection({ loading: true, connected: false, message: 'Testing connection...' });
    const res = await testDatabaseConnection();
    setDbConnection({ loading: false, ...res });
  };

  const loadAuditLogs = async () => {
    const logs = await getAuditLogs();
    setAuditLogs(logs);
  };

  const handleRunPurge = async () => {
    if (!window.confirm('Are you sure you want to execute the 30-Day Data Purge? This will remove interview sessions, scores, and transcripts older than 30 days.')) {
      return;
    }
    setPurging(true);
    const res = await runDataPurge();
    setPurging(false);

    if (res.success) {
      setPurgeResult(res);
      toast.success(res.message || 'Purge completed successfully');
      await writeAuditLog({
        action: 'AUTOMATED_PURGE',
        entityType: 'system',
        details: `Executed 30-day data purge: deleted ${res.result?.deleted_sessions || 0} sessions`,
        userEmail: user?.email,
      });
      loadAuditLogs();
    } else {
      toast.error(`Purge failed: ${res.message}`);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Maintenance</h1>
          <p className="text-gray-400 text-xs">Manage system configuration, database backups, audit logs, and data retention policies</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUsersModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 font-bold text-xs rounded-lg transition shadow"
          >
            <Users className="w-4 h-4" /> Manage HR Managers ({stats.totalRecruiters})
          </button>
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-bold text-xs rounded-lg transition shadow"
          >
            <RefreshCw className={`w-4 h-4 ${dbConnection.loading ? 'animate-spin' : ''}`} /> Check Connection
          </button>
          <button
            onClick={handleRunPurge}
            disabled={purging}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-semibold text-xs rounded-lg transition"
          >
            <Trash2 className={`w-4 h-4 ${purging ? 'animate-spin' : ''}`} />
            {purging ? 'Purging...' : 'Run 30-Day Purge Now'}
          </button>
        </div>
      </div>

      {/* Top 4 System Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* CPU */}
        <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4a843]/20 flex items-center justify-center text-[#d4a843]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Server CPU</p>
              <p className="text-white text-lg font-bold">{stats.serverCpu}%</p>
            </div>
          </div>
          <div className="w-16 bg-gray-800 h-2 rounded-full overflow-hidden">
            <div style={{ width: `${stats.serverCpu}%` }} className="bg-[#d4a843] h-full rounded-full" />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#a8b88c]/20 flex items-center justify-center text-[#a8b88c]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Memory Usage</p>
              <p className="text-white text-lg font-bold">{stats.memoryUsage}%</p>
            </div>
          </div>
          <div className="w-16 bg-gray-800 h-2 rounded-full overflow-hidden">
            <div style={{ width: `${stats.memoryUsage}%` }} className="bg-[#a8b88c] h-full rounded-full" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Active Users</p>
            <p className="text-white text-lg font-bold">{stats.activeUsers}</p>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Uptime</p>
            <p className="text-white text-lg font-bold">{stats.uptimeDays} Days</p>
          </div>
        </div>
      </div>

      {/* Grid of 4 System Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Management & Purge (FR-20) */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 relative">
          {dbConnection.connected ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 absolute top-6 right-6" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-400 absolute top-6 right-6" />
          )}

          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">Database & Retention Policy</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between items-center">
              <span>Database Status:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${dbConnection.connected ? 'text-green-400' : 'text-yellow-400'}`}>
                <Wifi className="w-3.5 h-3.5" />
                {dbConnection.loading
                  ? 'Checking...'
                  : dbConnection.connected
                  ? 'Supabase Cloud Connected'
                  : 'Mock Data Mode'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Automated 30-Day Purge:</span>
              <span className="text-[#a8b88c] font-semibold">Enabled (Active)</span>
            </div>
            <div className="flex justify-between">
              <span>Last Backup:</span>
              <span className="text-gray-300">{stats.lastBackup}</span>
            </div>
            <div className="flex justify-between">
              <span>Database Provider:</span>
              <span className="text-gray-300">Supabase (PostgreSQL)</span>
            </div>
          </div>

          {purgeResult && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300 rounded-lg mb-4">
              <p className="font-semibold mb-1">Purge Execution Result:</p>
              <p>{purgeResult.message}</p>
              {purgeResult.result && (
                <p className="text-gray-400 text-[11px] mt-1">
                  Deleted: {purgeResult.result.deleted_sessions || 0} sessions, {purgeResult.result.deleted_scores || 0} scores, {purgeResult.result.deleted_transcripts || 0} transcripts
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={checkConnection}
              className="flex-1 py-2.5 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-xs rounded-lg transition"
            >
              Test Connection
            </button>
            <button
              onClick={handleRunPurge}
              disabled={purging}
              className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-semibold text-xs rounded-lg transition"
            >
              Run 30-Day Purge
            </button>
          </div>
        </div>

        {/* User & Role Management */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">User & Role Access</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>Current Role:</span>
              <span className="text-[#a8b88c] font-semibold">{user?.role || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Admins:</span>
              <span className="text-gray-300 font-semibold">{stats.totalAdmins}</span>
            </div>
            <div className="flex justify-between">
              <span>Total HR Managers:</span>
              <span className="text-gray-300 font-semibold">{stats.totalRecruiters}</span>
            </div>
          </div>

          <button
            onClick={() => setShowUsersModal(true)}
            className="w-full py-2.5 bg-[#a8b88c] hover:bg-[#98a87c] text-gray-900 font-bold text-xs rounded-lg transition shadow"
          >
            Manage HR Managers & User Permissions
          </button>
        </div>

        {/* System Audit Logging */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 relative">
          <CheckCircle2 className="w-5 h-5 text-green-400 absolute top-6 right-6" />
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">System Audit Logging</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>Audit Logging Status:</span>
              <span className="text-green-400 font-semibold">Active (Recording Events)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Logged Events:</span>
              <span className="text-gray-300 font-semibold">{auditLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Latest Activity:</span>
              <span className="text-gray-300 truncate max-w-[180px]">
                {auditLogs[0]?.action || 'System start'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { loadAuditLogs(); setShowLogsModal(true); }}
            className="w-full py-2.5 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-xs rounded-lg transition"
          >
            View Live Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">Security & Encryption</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>2FA Authentication:</span>
              <span className="text-green-400 font-semibold">
                {stats.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Password Encryption:</span>
              <span className="text-gray-300 font-semibold">Bcrypt / Argon2 (Supabase Auth)</span>
            </div>
            <div className="flex justify-between">
              <span>Data In Transit:</span>
              <span className="text-gray-300 font-semibold">TLS 1.3</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-200 font-semibold text-xs rounded-lg transition">
            Configure Security
          </button>
        </div>
      </div>

      {/* Audit Logs Viewer Modal (FR-21) */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogsModal(false)}>
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#d4a843]" />
                <h2 className="text-white text-base font-bold">System Audit Logs</h2>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-500 hover:text-gray-300 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-8">No audit logs recorded yet.</p>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="bg-[#252525] p-3.5 rounded-lg border border-gray-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#d4a843]/20 text-[#d4a843] rounded text-[11px] font-bold">
                        {log.action}
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-200 font-medium pt-1">{log.details}</p>
                    {log.user_email && (
                      <p className="text-gray-500 text-[11px]">By: {log.user_email}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
              <span>Showing latest {auditLogs.length} audit entries</span>
              <button onClick={() => setShowLogsModal(false)} className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg font-semibold hover:bg-[#3a3a3a] transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Users Modal (Admin only: Delete HR Managers, view session logs) */}
      {showUsersModal && (
        <ManageUsersModal onClose={() => setShowUsersModal(false)} />
      )}
    </div>
  );
};

export default SystemMaintenance;
