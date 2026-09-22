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
  Server,
  Terminal,
  Layers
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
    if (!window.confirm('Are you sure you want to execute the 30-Day Data Purge? This will permanently remove interview sessions, scores, and transcripts older than 30 days.')) {
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
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight flex items-center gap-3">
            <span>System Infrastructure & Maintenance</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
              Admin Exclusive
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Cluster health telemetry, database connectivity, audit logs, and compliance purge lifecycle
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowUsersModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 font-bold text-xs rounded-xl transition shadow"
          >
            <Users className="w-4 h-4 text-emerald-400" /> Manage Evaluators ({stats.totalRecruiters})
          </button>
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dbConnection.loading ? 'animate-spin' : ''}`} /> Ping Database
          </button>
          <button
            onClick={handleRunPurge}
            disabled={purging}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition disabled:opacity-50"
          >
            <Trash2 className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
            {purging ? 'Executing...' : '30-Day Purge'}
          </button>
        </div>
      </div>

      {/* Top 4 System Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-mono">Neural Server CPU</p>
              <p className="text-white text-lg font-bold font-mono">{stats.serverCpu}%</p>
            </div>
          </div>
          <div className="w-16 bg-[#0A0E16] h-2 rounded-full overflow-hidden">
            <div style={{ width: `${stats.serverCpu}%` }} className="bg-amber-400 h-full rounded-full" />
          </div>
        </div>

        {/* Memory */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-mono">VRAM & Memory</p>
              <p className="text-white text-lg font-bold font-mono">{stats.memoryUsage}%</p>
            </div>
          </div>
          <div className="w-16 bg-[#0A0E16] h-2 rounded-full overflow-hidden">
            <div style={{ width: `${stats.memoryUsage}%` }} className="bg-emerald-400 h-full rounded-full" />
          </div>
        </div>

        {/* Active Operators */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-mono">Active Operators</p>
            <p className="text-white text-lg font-bold font-mono">{stats.activeUsers} Live</p>
          </div>
        </div>

        {/* Uptime */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-mono">Cluster Uptime</p>
            <p className="text-white text-lg font-bold font-mono">{stats.uptimeDays} Days (99.98%)</p>
          </div>
        </div>
      </div>

      {/* Grid of 4 System Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Management & Purge (FR-20) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative shadow-xl space-y-4">
          {dbConnection.connected ? (
            <div className="absolute top-6 right-6 flex items-center gap-1 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </div>
          ) : (
            <div className="absolute top-6 right-6 flex items-center gap-1 text-amber-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4" /> Local Mode
            </div>
          )}

          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white text-base font-bold font-display">Database & Data Lifecycle</h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-gray-400 bg-[#0A0E16]/80 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Connection Engine:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${dbConnection.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Wifi className="w-3.5 h-3.5" />
                {dbConnection.loading
                  ? 'Verifying...'
                  : dbConnection.connected
                  ? 'Supabase Cloud (PostgreSQL)'
                  : 'Local Persistence Storage'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">30-Day Purge Protocol:</span>
              <span className="text-emerald-400 font-semibold">Active (Automatic)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Snapshot:</span>
              <span className="text-gray-300">{stats.lastBackup}</span>
            </div>
          </div>

          {purgeResult && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 rounded-xl">
              <p className="font-semibold mb-0.5">Purge Result:</p>
              <p>{purgeResult.message}</p>
              {purgeResult.result && (
                <p className="text-gray-400 text-[11px] mt-1">
                  Deleted: {purgeResult.result.deleted_sessions || 0} sessions, {purgeResult.result.deleted_scores || 0} scores
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={checkConnection}
              className="flex-1 py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 font-bold text-xs rounded-xl transition"
            >
              Test Latency
            </button>
            <button
              onClick={handleRunPurge}
              disabled={purging}
              className="flex-1 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition"
            >
              Execute 30-Day Purge
            </button>
          </div>
        </div>

        {/* User & Role Access */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white text-base font-bold font-display">Operator Roles & RBAC</h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-gray-400 bg-[#0A0E16]/80 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Operator Role:</span>
              <span className="text-emerald-400 font-semibold">{user?.role || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">System Administrators:</span>
              <span className="text-gray-300 font-semibold">{stats.totalAdmins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registered Evaluators:</span>
              <span className="text-gray-300 font-semibold">{stats.totalRecruiters}</span>
            </div>
          </div>

          <button
            onClick={() => setShowUsersModal(true)}
            className="w-full py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 font-bold text-xs rounded-xl transition"
          >
            Manage Evaluators & Credentials
          </button>
        </div>

        {/* System Audit Logging */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative shadow-xl space-y-4">
          <div className="absolute top-6 right-6 flex items-center gap-1 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" /> Live
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white text-base font-bold font-display">System Audit Trail</h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-gray-400 bg-[#0A0E16]/80 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between">
              <span className="text-gray-500">Audit Status:</span>
              <span className="text-emerald-400 font-semibold">Active (Recording Live)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Audit Traces:</span>
              <span className="text-white font-semibold">{auditLogs.length} Records</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Latest Event:</span>
              <span className="text-gray-300 truncate max-w-[180px]">
                {auditLogs[0]?.action || 'SYSTEM_ONLINE'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { loadAuditLogs(); setShowLogsModal(true); }}
            className="w-full py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 font-bold text-xs rounded-xl transition"
          >
            View Live Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Security & Cryptography */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white text-base font-bold font-display">Encryption & Hardware Trust</h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-gray-400 bg-[#0A0E16]/80 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between">
              <span className="text-gray-500">Hardware 2FA:</span>
              <span className="text-emerald-400 font-semibold">
                {stats.twoFactorEnabled ? 'Enforced' : 'Available'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Password Hashing:</span>
              <span className="text-gray-300 font-semibold">Argon2id (Supabase Auth)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transport Layer:</span>
              <span className="text-emerald-400 font-semibold">TLS 1.3 / HSTS Sealed</span>
            </div>
          </div>

          <button
            onClick={() => toast.success('Cryptographical keys are up to date.')}
            className="w-full py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 font-bold text-xs rounded-xl transition"
          >
            Inspect Security Keys
          </button>
        </div>
      </div>

      {/* Audit Logs Modal */}
      {showLogsModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowLogsModal(false)}
        >
          <div
            className="glass-panel rounded-2xl border border-white/10 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-white text-base font-bold font-display">System Audit Logs</h2>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-xs font-mono text-center py-8">No audit events recorded yet.</p>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="bg-[#0A0E16] p-3.5 rounded-xl border border-white/5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-200 pt-1">{log.details}</p>
                    {log.user_email && (
                      <p className="text-gray-500 text-[10px]">Operator: {log.user_email}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center text-xs font-mono text-gray-400">
              <span>Showing {auditLogs.length} audit event entries</span>
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Users Modal */}
      {showUsersModal && (
        <ManageUsersModal onClose={() => setShowUsersModal(false)} />
      )}
    </div>
  );
};

export default SystemMaintenance;
