'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/lib/store';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/members': 'Members',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/giving': 'Giving',
  '/dashboard/groups': 'Groups',
  '/dashboard/messages': 'Messages',
  '/dashboard/events': 'Events',
  '/dashboard/reports': 'Reports',
  '/dashboard/assets': 'Assets',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loadProfile } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('qahal_access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadProfile().finally(() => setReady(true));
  }, [router, loadProfile]);

  // Derive page title — fall back to member detail pages etc.
  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/dashboard/members/') ? 'Member detail' : 'Dashboard');

  if (!ready) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="4" width="16" height="2" rx="1" />
              <rect x="2" y="9" width="16" height="2" rx="1" />
              <rect x="2" y="14" width="16" height="2" rx="1" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-900">{pageTitle}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
