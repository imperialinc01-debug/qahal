'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    churchName: '',
    subdomain: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'churchName') {
      const sub = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm((prev) => ({ ...prev, [field]: value, subdomain: sub }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Qahal</h1>
          <p className="mt-1 text-sm text-gray-500">Register your church to get started</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Church name</label>
              <input
                type="text"
                required
                value={form.churchName}
                onChange={(e) => update('churchName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Grace Community Church"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
              <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
                <input
                  type="text"
                  required
                  value={form.subdomain}
                  onChange={(e) => setForm((p) => ({ ...p, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="flex-1 rounded-l-lg border-0 px-3 py-2.5 text-sm focus:outline-none focus:ring-0"
                  placeholder="grace"
                />
                <span className="px-3 text-sm text-gray-400">.qahal.app</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="you@church.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Minimum 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating your church...' : 'Register church'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
