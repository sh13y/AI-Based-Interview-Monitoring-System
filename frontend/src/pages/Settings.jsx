// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Settings & Profile Management
// Implements:
//   [FR-19: PROFILE MANAGEMENT (Edit Profile Details & Update Security Password)]
//   [FR-21: SYSTEM AUDIT LOGGING (Profile Update & Password Change Tracking)]
// ==============================================================================

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
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

    // Validate mandatory fields
    if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.email.trim()) {
      toast.error('First name, last name, and email are mandatory fields.');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured() && user?.id) {
        // Update the public.users table
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

        // Also update auth metadata
        await supabase.auth.updateUser({
          data: {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
          },
        });
      }

      // Update localStorage for demo/fallback mode
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
    <div>
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Navigation */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#252525] rounded-xl p-3 border border-gray-800 space-y-1">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'security', label: 'Account Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy & Retention', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === id
                    ? 'bg-[#a8b88c] text-gray-900'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className="col-span-12 md:col-span-9">
          <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">

            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Role</label>
                  <input
                    type="text"
                    disabled
                    value={profileData.role}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold text-xs rounded-lg hover:bg-[#98a87c] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Account Security</h2>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold text-xs rounded-lg hover:bg-[#98a87c] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" /> {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Notification Preferences</h2>
                <div className="space-y-3">
                  {[
                    'Email notification on candidate evaluation complete',
                    'Alert when environmental noise exceeds 60 dB threshold',
                    'Weekly summary of interview metrics',
                    'Automated 30-day data purge warning alerts',
                  ].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-[#1e1e1e] border-gray-700 text-[#a8b88c] focus:ring-[#a8b88c]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Data Retention & Privacy Policy</h2>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Modern Matrix strictly enforces an automated 30-day data purge policy for candidate biometric audio recordings and interview transcripts to ensure compliance with privacy regulations.
                </p>
                <div className="p-4 bg-[#1e1e1e] rounded-xl border border-gray-800 space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Auto-Purge Cycle:</span>
                    <span className="text-[#a8b88c] font-semibold">Active (Every 30 Days)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Scheduled Purge:</span>
                    <span className="text-gray-400">May 15, 2026 - 02:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption Standard:</span>
                    <span className="text-gray-400">AES-256 (At Rest) & TLS 1.3 (In Transit)</span>
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
