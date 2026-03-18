'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { PasswordInputSmall } from '@/components/ui/PasswordInput';

export default function SettingsPage() {
  const { user, tenant, setUser, setTenant } = useAuthStore();

  // ─── Church profile state ─────────────────────────────────
  const [churchName, setChurchName] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [timezone, setTimezone] = useState('Africa/Accra');
  const [savingChurch, setSavingChurch] = useState(false);
  const [churchMsg, setChurchMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Account state ────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Password state ───────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Load initial values from store ───────────────────────
  useEffect(() => {
    if (tenant) {
      setChurchName(tenant.name || '');
      setCurrency(tenant.currency || 'GHS');
      setTimezone(tenant.timezone || 'Africa/Accra');
    }
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [tenant, user]);

  // ─── Clear feedback messages after 4 seconds ─────────────
  useEffect(() => {
    if (churchMsg) { const t = setTimeout(() => setChurchMsg(null), 4000); return () => clearTimeout(t); }
  }, [churchMsg]);
  useEffect(() => {
    if (profileMsg) { const t = setTimeout(() => setProfileMsg(null), 4000); return () => clearTimeout(t); }
  }, [profileMsg]);
  useEffect(() => {
    if (passwordMsg) { const t = setTimeout(() => setPasswordMsg(null), 4000); return () => clearTimeout(t); }
  }, [passwordMsg]);

  // ─── Save church profile ──────────────────────────────────
  const handleSaveChurch = async () => {
    setSavingChurch(true);
    setChurchMsg(null);
    try {
      const res = await api.updateTenant({ name: churchName, currency, timezone });
      const updated = res.data;
      // Update Zustand store so sidebar/header reflect changes
      if (setTenant && updated) {
        setTenant({ ...tenant, ...updated });
      }
      setChurchMsg({ type: 'success', text: 'Church profile saved' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save church profile';
      setChurchMsg({ type: 'error', text: typeof msg === 'string' ? msg : msg[0] });
    } finally {
      setSavingChurch(false);
    }
  };

  // ─── Update user profile ──────────────────────────────────
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({ firstName, lastName });
      const updated = res.data;
      // Update Zustand store
      if (setUser && updated) {
        setUser({ ...user, ...updated });
      }
      // Also update localStorage so it persists on refresh
      const stored = localStorage.getItem('qahal_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('qahal_user', JSON.stringify({ ...parsed, firstName, lastName }));
      }
      setProfileMsg({ type: 'success', text: 'Profile updated' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update profile';
      setProfileMsg({ type: 'error', text: typeof msg === 'string' ? msg : msg[0] });
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Change password ──────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Both fields are required' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password';
      setPasswordMsg({ type: 'error', text: typeof msg === 'string' ? msg : msg[0] });
    } finally {
      setSavingPassword(false);
    }
  };

  // ─── Feedback badge ───────────────────────────────────────
  const FeedbackBadge = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) => {
    if (!msg) return null;
    return (
      <p className={`text-xs mt-2 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {msg.text}
      </p>
    );
  };

  return (
    <div>
      <div className="mb-5"><h1 className="text-xl font-semibold text-gray-900">Settings</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Church profile */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Church profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Church name</label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subdomain</label>
              <div className="flex rounded-lg border border-gray-200 bg-gray-50">
                <span className="px-3 py-2 text-sm text-gray-400">{tenant?.subdomain || ''}</span>
                <span className="px-3 py-2 text-sm text-gray-300">.qahal.app</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Default currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="GHS">Ghana Cedis (GHS)</option>
                <option value="USD">US Dollars (USD)</option>
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="GBP">British Pounds (GBP)</option>
                <option value="EUR">Euros (EUR)</option>
                <option value="KES">Kenyan Shillings (KES)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="CAD">Canadian Dollars (CAD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Toronto">America/Toronto (EST)</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleSaveChurch}
                disabled={savingChurch}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {savingChurch ? 'Saving...' : 'Save changes'}
              </button>
              <FeedbackBadge msg={churchMsg} />
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Your account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                {firstName?.[0]}{lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{firstName} {lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <button
                onClick={handleUpdateProfile}
                disabled={savingProfile}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Update profile'}
              </button>
              <FeedbackBadge msg={profileMsg} />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Change password</h3>
            <div className="space-y-3">
              <div>
              <PasswordInputSmall
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <PasswordInputSmall
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {savingPassword ? 'Changing...' : 'Change password'}
                </button>
                <FeedbackBadge msg={passwordMsg} />
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Integrations</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'Paystack', desc: 'Accept online tithes and offerings via mobile money and card', status: 'Not connected' },
              { name: 'Twilio', desc: 'Send SMS messages to your congregation', status: 'Not connected' },
              { name: 'Resend', desc: 'Send transactional and bulk emails', status: 'Not connected' },
            ].map(i => (
              <div key={i.name} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{i.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{i.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{i.desc}</p>
                <button
                  onClick={() => alert(`${i.name} integration is coming soon! This will be available once the app is deployed.`)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 w-full"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
