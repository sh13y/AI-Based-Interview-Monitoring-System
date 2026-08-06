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
} from 'lucide-react';
import { dummySystemStats } from '../lib/dummyData';
import { testDatabaseConnection, isSupabaseConfigured } from '../lib/supabase';

const SystemMaintenance = () => {
  const stats = dummySystemStats;
  const [dbConnection, setDbConnection] = useState({ loading: true, connected: false, message: '' });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setDbConnection({ loading: true, connected: false, message: 'Testing connection...' });
    const res = await testDatabaseConnection();
    setDbConnection({ loading: false, ...res });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Maintenance</h1>
          <p className="text-gray-400 text-xs">Manage system configuration, backups, roles and platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-bold text-xs rounded-lg transition shadow"
          >
            <RefreshCw className={`w-4 h-4 ${dbConnection.loading ? 'animate-spin' : ''}`} /> Check Connection
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 font-semibold text-xs rounded-lg border border-gray-700 hover:border-gray-600 transition">
            <Sliders className="w-4 h-4" /> Advanced Setting
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
        {/* Database Management */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 relative">
          {dbConnection.connected ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 absolute top-6 right-6" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-400 absolute top-6 right-6" />
          )}

          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">Database Management</h3>
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
              <span>Connection Details:</span>
              <span className="text-gray-300 truncate max-w-[220px]">
                {dbConnection.loading ? 'Pinging database...' : dbConnection.message}
              </span>
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

          <div className="flex items-center gap-3">
            <button
              onClick={checkConnection}
              className="flex-1 py-2.5 bg-[#d4a843] hover:bg-[#c39732] text-gray-900 font-semibold text-xs rounded-lg transition"
            >
              Test Connection Now
            </button>
            <button className="flex-1 py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-200 font-semibold text-xs rounded-lg transition">
              Restore Backup
            </button>
          </div>
        </div>

        {/* User & Role Management */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">User & Role Management</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>Total Admins</span>
              <span className="text-gray-300 font-semibold">{stats.totalAdmins}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Recruiters</span>
              <span className="text-gray-300 font-semibold">{stats.totalRecruiters}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interviews</span>
              <span className="text-gray-300 font-semibold">{stats.totalInterviews}</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-200 font-semibold text-xs rounded-lg transition">
            Manage Roles
          </button>
        </div>

        {/* System Logs */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 relative">
          <CheckCircle2 className="w-5 h-5 text-green-400 absolute top-6 right-6" />
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">System Logs</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>Recent Errors:</span>
              <span className="text-red-400 font-semibold">{stats.recentErrors}</span>
            </div>
            <div className="flex justify-between">
              <span>Warnings:</span>
              <span className="text-yellow-400 font-semibold">{stats.warnings}</span>
            </div>
            <div className="flex justify-between">
              <span>Last System Update:</span>
              <span className="text-gray-300">{stats.lastSystemUpdate}</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-200 font-semibold text-xs rounded-lg transition">
            View Logs
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#d4a843]" />
            <h3 className="text-white text-base font-bold">Security Settings</h3>
          </div>

          <div className="space-y-2 text-xs text-gray-400 mb-6">
            <div className="flex justify-between">
              <span>2FA:</span>
              <span className="text-green-400 font-semibold">
                {stats.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Password Policy:</span>
              <span className="text-gray-300 font-semibold">{stats.passwordPolicy}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Session:</span>
              <span className="text-gray-300 font-semibold">{stats.activeSessions}</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-200 font-semibold text-xs rounded-lg transition">
            Configure Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemMaintenance;
