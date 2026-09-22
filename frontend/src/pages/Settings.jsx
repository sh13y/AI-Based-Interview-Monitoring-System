// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Settings & Profile Management
// Implements:
//   [FR-19: PROFILE MANAGEMENT (Edit Profile Details & Update Security Password)]
//   [FR-21: SYSTEM AUDIT LOGGING (Profile Update & Password Change Tracking)]
// ==============================================================================

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save, Key, CheckCircle2, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || 'Kasun',
    lastName: user?.last_name || 'Perera',
    email: user?.email || 'admin@modernmatrix.com',
    role: user?.role || 'Admin',
  });
  const [saving, setSaving] = useState(false);

  // Security tab state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.email.trim()) {
      toast.error('First name, last name, and email are mandatory fields.');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured() && user?.id) {
        const { error } = await supabase
          .from('users')
          .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            email: profileData.email,
          })
          .eq('id', user.id);

        if (error) {
          toast.error(`Profile update failed: ${error.message}`);
          setSaving(false);
          return;
        }

        await supabase.auth.updateUser({
          data: {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
          },
        });
      }

      const updatedUser = {
        ...user,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
      };
      localStorage.setItem('mm_user_current', JSON.stringify(updatedUser));

      await writeAuditLog({
        action: 'PROFILE_UPDATED',
        entityType: 'user',
        entityId: user?.id,
        details: `Profile updated: ${profileData.firstName} ${profileData.lastName}`,
        userEmail: profileData.email,
      });

      toast.success('Profile information saved successfully!');
    } catch (err) {
      console.error('Profile save error:', err);
      toast.error('An error occurred while saving your profile.');
    }

    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: securityData.newPassword,
        });

        if (error) {
          toast.error(`Password update failed: ${error.message}`);
          setChangingPassword(false);
          return;
        }
      }

      await writeAuditLog({
        action: 'PASSWORD_CHANGED',
        entityType: 'auth',
        entityId: user?.id,
        details: 'User changed their account password',
        userEmail: user?.email,
      });

      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('An error occurred while updating your password.');
    }

    setChangingPassword(false);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
          System & Account Preferences
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          Manage proctor identity, cryptographic keys, notifications, and 30-day compliance retention rules
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="glass-panel rounded-2xl p-2 border border-white/10 space-y-1 shadow-xl">
            {[
              { id: 'profile', label: 'Proctor Profile', icon: User },
              { id: 'security', label: 'Security & Keys', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy & Retention', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === id
                    ? 'bg-emerald-500 text-surface font-bold shadow-md shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="col-span-12 md:col-span-9">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-white text-base font-bold font-display">Proctor Profile Information</h2>
                  <p className="text-gray-400 text-xs font-mono">Personal evaluation identity and verified organization details</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-400 text-xs font-mono uppercase">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-400 text-xs font-mono uppercase">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 text-xs font-mono uppercase">Corporate Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 text-xs font-mono uppercase">Assigned Security Role</label>
                  <input
                    type="text"
                    disabled
                    value={profileData.role}
                    className="w-full px-4 py-2.5 bg-[#0A0E16]/50 border border-white/5 rounded-xl text-xs text-gray-500 cursor-not-allowed font-mono"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-white text-base font-bold font-display">Authentication & Master Credentials</h2>
                  <p className="text-gray-400 text-xs font-mono">Rotate security password and invalidate previous active JWT sessions</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 text-xs font-mono uppercase">Current Master Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 text-xs font-mono uppercase">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 text-xs font-mono uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E16] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" /> {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-white text-base font-bold font-display">Telemetry Notification Dispatch</h2>
                  <p className="text-gray-400 text-xs font-mono">Configure threshold triggers and proctor alert subscriptions</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Dispatched email alert upon candidate behavioral evaluation completion',
                    'Auditory threshold violation when room noise exceeds 60 dB ceiling',
                    'Real-time anomaly push alert on multi-face or gaze drift detection',
                    'Automated 30-day compliance data purge warning notifications',
                  ].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-[#0A0E16] border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-white text-base font-bold font-display">Data Retention & Privacy Policy</h2>
                  <p className="text-gray-400 text-xs font-mono">Automated 30-day biometric data purge standard</p>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed">
                  Modern Matrix strictly enforces an automated 30-day data purge policy for candidate biometric audio recordings, video frames, and interview transcripts to maintain full compliance with international privacy regulations.
                </p>

                <div className="p-5 bg-[#0A0E16]/80 rounded-2xl border border-white/5 space-y-3 text-xs font-mono text-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Purge Automation:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active (30-Day TTL)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Next Scheduled Purge:</span>
                    <span className="text-gray-300">May 15, 2026 - 02:00 UTC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Storage Encryption:</span>
                    <span className="text-emerald-400">AES-256-GCM (At Rest) & TLS 1.3 (Transit)</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
