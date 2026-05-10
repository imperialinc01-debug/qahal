'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Members', href: '/dashboard/members' },
  { label: 'Attendance', href: '/dashboard/attendance' },
  { label: 'Giving', href: '/dashboard/giving' },
  { label: 'Groups', href: '/dashboard/groups' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Events', href: '/dashboard/events' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Assets', href: '/dashboard/assets' },
];

const bottomItems = [
  { label: 'Settings', href: '/dashboard/settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, tenant, logout } = useAuthStore();

  const sidebarContent = (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-gray-50">
      {/* Branding */}
      <div className="border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Qahal</h1>
        <p className="text-xs text-gray-500 truncate">{tenant?.name || 'Church Management'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 px-2 py-3">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}

        {/* User info */}
        <div className="mt-3 flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            Exit
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex h-screen w-60 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
