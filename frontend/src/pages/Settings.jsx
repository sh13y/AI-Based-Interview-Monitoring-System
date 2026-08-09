import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || 'Kasun',
    lastName: user?.last_name || 'Perera',
    email: user?.email || 'admin@modernmatrix.com',
    role: user?.role || 'Admin',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
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
            {saved && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-lg flex items-center justify-between">
                <span>Settings saved successfully!</span>
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold text-xs rounded-lg hover:bg-[#98a87c] transition"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSave} className="space-y-4">
                <h2 className="text-white text-base font-bold mb-4">Account Security</h2>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#a8b88c]"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#a8b88c] text-gray-900 font-semibold text-xs rounded-lg hover:bg-[#98a87c] transition"
                  >
                    <Save className="w-4 h-4" /> Update Password
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
