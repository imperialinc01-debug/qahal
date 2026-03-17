'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loadProfile } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('qahal_access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadProfile().finally(() => setReady(true));
  }, [router, loadProfile]);

  if (!ready) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}><p>Loading...</p></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
