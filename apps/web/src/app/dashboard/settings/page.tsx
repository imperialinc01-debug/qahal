'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user, tenant } = useAuthStore();

  return (
    <div>
      <div className="mb-5"><h1 className="text-xl font-semibold text-gray-900">Settings</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Church profile */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Church profile</h2>
          <div className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Church name</label><input type="text" defaultValue={tenant?.name || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Subdomain</label>
              <div className="flex rounded-lg border border-gray-200 bg-gray-50"><span className="px-3 py-2 text-sm text-gray-400">{tenant?.subdomain || ''}</span><span className="px-3 py-2 text-sm text-gray-300">.qahal.app</span></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Default currency</label>
              <select defaultValue="GHS" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="GHS">Ghana Cedis (GHS)</option><option value="USD">US Dollars (USD)</option><option value="NGN">Nigerian Naira (NGN)</option><option value="GBP">British Pounds (GBP)</option><option value="EUR">Euros (EUR)</option>
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
              <select defaultValue="Africa/Accra" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="Africa/Accra">Africa/Accra (GMT+0)</option><option value="Africa/Lagos">Africa/Lagos (WAT)</option><option value="Europe/London">Europe/London (GMT)</option><option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Save changes</button>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Your account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              <div><p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p><p className="text-sm text-gray-500">{user?.email}</p><p className="text-xs text-gray-400">{user?.role}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">First name</label><input type="text" defaultValue={user?.firstName || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Last name</label><input type="text" defaultValue={user?.lastName || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label><input type="email" defaultValue={user?.email || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Update profile</button>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Change password</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Current password</label><input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">New password</label><input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Change password</button>
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
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 w-full">Connect</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
