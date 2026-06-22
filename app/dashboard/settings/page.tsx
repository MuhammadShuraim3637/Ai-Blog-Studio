// app/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await response.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your AI Blog Studio identity, preferences, and credentials.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">User Identity</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold uppercase shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-gray-800">{user?.name || 'Loading Account...'}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>{user?.email}</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full capitalize">
                {user?.role || 'user'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Security Update Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Security Controls</h3>
        
        {statusMessage && (
          <div className={`p-4 rounded-lg text-sm border ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isUpdating ? 'Saving Verification...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}