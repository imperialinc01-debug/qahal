'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';

interface DashboardData {
  memberStats: any;
  attendanceStats: any;
  givingSummary: any;
  birthdays: any[];
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-emerald-600">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [members, attendance, giving, birthdays] = await Promise.allSettled([
          api.getMemberStats(),
          api.getAttendanceStats(),
          api.getGivingSummary(),
          api.getUpcomingBirthdays(30),
        ]);

        setData({
          memberStats: members.status === 'fulfilled' ? members.value.data : null,
          attendanceStats: attendance.status === 'fulfilled' ? attendance.value.data : null,
          givingSummary: giving.status === 'fulfilled' ? giving.value.data : null,
          birthdays: birthdays.status === 'fulfilled' ? birthdays.value.data : [],
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const ms = data?.memberStats;
  const as = data?.attendanceStats;
  const gs = data?.givingSummary;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Total members"
          value={String(ms?.total || 0)}
          sub={ms?.newThisMonth ? `+${ms.newThisMonth} this month` : undefined}
        />
        <MetricCard
          label="Last Sunday"
          value={String(as?.lastSunday || 0)}
          sub={as?.changeFromPrevious > 0 ? `+${as.changeFromPrevious} vs prior` : as?.changeFromPrevious < 0 ? `${as.changeFromPrevious} vs prior` : undefined}
        />
        <MetricCard
          label="Giving (this month)"
          value={formatCurrency(gs?.thisMonth?.total || 0)}
          sub={gs?.thisMonth?.change > 0 ? `+${gs.thisMonth.change}% vs last month` : undefined}
        />
        <MetricCard
          label="YTD giving"
          value={formatCurrency(gs?.ytd?.total || 0)}
          sub={`${gs?.ytd?.count || 0} transactions`}
        />
      </div>

      {/* Two-column content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Birthdays */}
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming birthdays</h2>
            <Link href="/dashboard/members?tab=birthdays" className="text-xs text-brand-600 hover:text-brand-500">
              View all
            </Link>
          </div>
          {data?.birthdays && data.birthdays.length > 0 ? (
            <ul className="space-y-3">
              {data.birthdays.slice(0, 5).map((m: any) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(m.firstName + m.lastName)}`}>
                    {getInitials(m.firstName, m.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-gray-500">{formatDate(m.dateOfBirth, { month: 'short', day: 'numeric' })} &middot; Turning {m.turningAge}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {m.daysUntil === 0 ? 'Today!' : m.daysUntil === 1 ? 'Tomorrow' : `In ${m.daysUntil} days`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No upcoming birthdays in the next 30 days</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/members?action=add"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-brand-600 font-bold">+</span> Add member
            </Link>
            <Link
              href="/dashboard/giving?action=record"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-brand-600 font-bold">+</span> Record giving
            </Link>
            <Link
              href="/dashboard/attendance"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-brand-600 font-bold">&#10003;</span> Take attendance
            </Link>
            <Link
              href="/dashboard/messages?action=send"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-brand-600 font-bold">&#9993;</span> Send message
            </Link>
          </div>

          {/* Member status breakdown */}
          {ms?.byStatus && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Members by status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ms.byStatus).map(([status, count]) => (
                  <span key={status} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace('_', ' ').toLowerCase()} <span className="text-[10px] opacity-70">{String(count)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
