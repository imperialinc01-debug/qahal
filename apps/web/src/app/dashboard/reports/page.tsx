'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [tab, setTab] = useState<'overview' | 'attendance' | 'giving' | 'pledges'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [memberRates, setMemberRates] = useState<any>(null);
  const [conversions, setConversions] = useState<any>(null);
  const [seasonal, setSeasonal] = useState<any[]>([]);
  const [serviceComp, setServiceComp] = useState<any[]>([]);
  const [weeklyGiving, setWeeklyGiving] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<any>(null);
  const [pledgeReport, setPledgeReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t: string) => {
    setLoading(true);
    try {
      if (t === 'overview') {
        const r = await api.getReportOverview();
        setOverview(r.data);
      } else if (t === 'attendance') {
        const [mr, cv, se, sc] = await Promise.allSettled([
          api.getMemberAttendanceRates(3),
          api.getFirstTimerConversions(),
          api.getSeasonalTrends(),
          api.getServiceComparison(),
        ]);
        if (mr.status === 'fulfilled') setMemberRates(mr.value.data);
        if (cv.status === 'fulfilled') setConversions(cv.value.data);
        if (se.status === 'fulfilled') setSeasonal(se.value.data || []);
        if (sc.status === 'fulfilled') setServiceComp(sc.value.data || []);
      } else if (t === 'giving') {
        const [wk, mo] = await Promise.allSettled([api.getWeeklyGiving(8), api.getMonthlyIncome()]);
        if (wk.status === 'fulfilled') setWeeklyGiving(wk.value.data || []);
        if (mo.status === 'fulfilled') setMonthlyIncome(mo.value.data);
      } else if (t === 'pledges') {
        const r = await api.getPledgeReport();
        setPledgeReport(r.data);
      }
    } catch {} finally { setLoading(false); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'giving', label: 'Giving' },
    { id: 'pledges', label: 'Pledges' },
  ];

  return (
    <div>
      <div className="mb-5"><h1 className="text-xl font-semibold text-gray-900">Reports</h1><p className="text-sm text-gray-500">Comprehensive church analytics</p></div>

      <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {loading ? <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading report...</p></div> : (
        <>
          {tab === 'overview' && overview && <OverviewReport data={overview} />}
          {tab === 'attendance' && <AttendanceReport memberRates={memberRates} conversions={conversions} seasonal={seasonal} serviceComp={serviceComp} />}
          {tab === 'giving' && <GivingReport weekly={weeklyGiving} monthly={monthlyIncome} />}
          {tab === 'pledges' && pledgeReport && <PledgeReport data={pledgeReport} />}
        </>
      )}
    </div>
  );
}

function OverviewReport({ data }: { data: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Membership</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold">{data.members.total}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">New this month</p><p className="text-xl font-semibold text-emerald-600">+{data.members.newThisMonth}</p></div>
        </div>
        {data.members.byStatus && <div className="space-y-2">
          {Object.entries(data.members.byStatus).map(([status, count]) => {
            const pct = data.members.total > 0 ? Math.round((Number(count) / data.members.total) * 100) : 0;
            return (<div key={status}><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 capitalize">{status.replace('_', ' ').toLowerCase()}</span><span className="text-gray-500">{String(count)} ({pct}%)</span></div><div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} /></div></div>);
          })}
        </div>}
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Giving (GHS)</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">This month</p><p className="text-xl font-semibold">{formatCurrency(data.giving.thisMonth)}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Last month</p><p className="text-xl font-semibold">{formatCurrency(data.giving.lastMonth)}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Year to date</p><p className="text-xl font-semibold">{formatCurrency(data.giving.ytd)}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Month change</p><p className={`text-xl font-semibold ${data.giving.monthChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{data.giving.monthChange >= 0 ? '+' : ''}{data.giving.monthChange}%</p></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Assets</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Total assets</p><p className="text-xl font-semibold">{data.assets.total}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Total value</p><p className="text-xl font-semibold">{formatCurrency(data.assets.totalValue)}</p></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Events this month</p><p className="text-xl font-semibold">{data.events.thisMonth}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Active pledges</p><p className="text-xl font-semibold">{data.pledges.active}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">YTD transactions</p><p className="text-xl font-semibold">{data.giving.ytdTransactions}</p></div>
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Total members</p><p className="text-xl font-semibold">{data.members.total}</p></div>
        </div>
      </div>
    </div>
  );
}

function AttendanceReport({ memberRates, conversions, seasonal, serviceComp }: any) {
  return (
    <div className="space-y-6">
      {/* Service comparison */}
      {serviceComp.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Service comparison (last 3 months)</h2>
          <div className="grid grid-cols-3 gap-4">
            {serviceComp.map((s: any) => {
              const labels: Record<string, string> = { SUNDAY_SERVICE: 'Sunday', MIDWEEK_SERVICE: 'Midweek', PRAYER_MEETING: 'Prayer' };
              return (
                <div key={s.type} className="rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">{labels[s.type] || s.type}</p>
                  <p className="text-3xl font-bold text-gray-900">{s.averageAttendance}</p>
                  <p className="text-xs text-gray-400">avg attendance</p>
                  <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                    <div><p className="text-sm font-semibold text-emerald-600">{s.peak}</p><p className="text-[10px] text-gray-400">Peak</p></div>
                    <div><p className="text-sm font-semibold text-red-500">{s.lowest}</p><p className="text-[10px] text-gray-400">Low</p></div>
                    <div><p className="text-sm font-semibold text-gray-600">{s.totalEvents}</p><p className="text-[10px] text-gray-400">Events</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seasonal trends */}
      {seasonal.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly attendance trends (Sunday services)</h2>
          <div className="flex items-end gap-2 h-40 mb-2">
            {seasonal.map((m: any) => {
              const max = Math.max(...seasonal.map((s: any) => s.averageAttendance), 1);
              const h = Math.max(5, (m.averageAttendance / max) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-medium">{m.averageAttendance}</span>
                  <div className="w-full bg-brand-400 rounded-t hover:bg-brand-600 transition-colors" style={{ height: `${h}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {seasonal.map((m: any) => <div key={m.month} className="flex-1 text-center text-[10px] text-gray-400">{m.month.slice(5)}</div>)}
          </div>
        </div>
      )}

      {/* First-timer conversions */}
      {conversions && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">First-timer conversion (last 6 months)</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-2xl font-bold text-gray-900">{conversions.total}</p><p className="text-xs text-gray-500">First-timers</p></div>
            <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{conversions.converted}</p><p className="text-xs text-gray-500">Converted</p></div>
            <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-2xl font-bold text-gray-900">{conversions.conversionRate}%</p><p className="text-xs text-gray-500">Rate</p></div>
            <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-2xl font-bold text-amber-600">{conversions.total - conversions.converted}</p><p className="text-xs text-gray-500">Still visitors</p></div>
          </div>
          {conversions.byStatus && Object.keys(conversions.byStatus).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(conversions.byStatus).map(([s, c]) => (
                <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{s.replace('_', ' ')}: {String(c)}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Individual attendance rates */}
      {memberRates && memberRates.members.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Individual attendance rates</h2>
          <p className="text-xs text-gray-500 mb-4">{memberRates.period} — {memberRates.totalEvents} services tracked</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {memberRates.members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-32 truncate text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</div>
                <div className="flex-1">
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all ${m.rate >= 80 ? 'bg-emerald-400' : m.rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${m.rate}%` }} />
                  </div>
                </div>
                <span className={`text-sm font-semibold w-12 text-right ${m.rate >= 80 ? 'text-emerald-600' : m.rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{m.rate}%</span>
                <span className="text-xs text-gray-400 w-16 text-right">{m.attended}/{m.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GivingReport({ weekly, monthly }: { weekly: any[]; monthly: any }) {
  return (
    <div className="space-y-6">
      {/* Weekly summary */}
      {weekly.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Weekly giving summary (for board meetings)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Week</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Tithes</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Offerings</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Other</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {weekly.map((w: any, i: number) => {
                  const tithes = w.byCategory?.TITHE || 0;
                  const offerings = w.byCategory?.OFFERING || 0;
                  const other = w.total - tithes - offerings;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{w.weekStart}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(w.total)}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(tithes)}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(offerings)}</td>
                      <td className="px-3 py-2 text-right text-gray-400">{formatCurrency(other)}</td>
                      <td className="px-3 py-2 text-right text-gray-400">{w.count}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-3 py-2 text-gray-900">Total</td>
                  <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(weekly.reduce((s: number, w: any) => s + w.total, 0))}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(weekly.reduce((s: number, w: any) => s + (w.byCategory?.TITHE || 0), 0))}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(weekly.reduce((s: number, w: any) => s + (w.byCategory?.OFFERING || 0), 0))}</td>
                  <td className="px-3 py-2 text-right text-gray-400">{formatCurrency(weekly.reduce((s: number, w: any) => { const t = w.byCategory?.TITHE || 0; const o = w.byCategory?.OFFERING || 0; return s + w.total - t - o; }, 0))}</td>
                  <td className="px-3 py-2 text-right text-gray-400">{weekly.reduce((s: number, w: any) => s + w.count, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Monthly income */}
      {monthly && monthly.months.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Monthly income report — {monthly.year}</h2>
          <p className="text-xs text-gray-500 mb-4">Year total: {formatCurrency(monthly.yearTotal)}</p>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-40 mb-2">
            {monthly.months.map((m: any) => {
              const max = Math.max(...monthly.months.map((x: any) => x.total), 1);
              const h = Math.max(3, (m.total / max) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-medium">{m.total > 0 ? formatCurrency(m.total).replace('GHS', '').trim() : ''}</span>
                  <div className="w-full bg-emerald-400 rounded-t hover:bg-emerald-600 transition-colors" style={{ height: `${h}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {monthly.months.map((m: any) => <div key={m.month} className="flex-1 text-center text-[10px] text-gray-400">{m.monthName.slice(0, 3)}</div>)}
          </div>

          {/* Breakdown table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Month</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Tithes</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Offerings</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.months.map((m: any) => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{m.monthName}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(m.total)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(m.byCategory?.TITHE || 0)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(m.byCategory?.OFFERING || 0)}</td>
                    <td className="px-3 py-2 text-right text-gray-400">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PledgeReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total pledges</p><p className="mt-1 text-2xl font-semibold text-gray-900">{data.summary.totalPledges}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Fulfillment rate</p><p className="mt-1 text-2xl font-semibold text-emerald-600">{data.summary.fulfillmentRate}%</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total pledged</p><p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(data.summary.totalPledged)}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total paid</p><p className="mt-1 text-2xl font-semibold text-emerald-600">{formatCurrency(data.summary.totalPaid)}</p></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center"><p className="text-2xl font-bold text-emerald-700">{data.summary.completed}</p><p className="text-xs text-emerald-600">Completed</p></div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center"><p className="text-2xl font-bold text-blue-700">{data.summary.active}</p><p className="text-xs text-blue-600">Active</p></div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center"><p className="text-2xl font-bold text-red-700">{data.summary.overdue}</p><p className="text-xs text-red-600">Overdue</p></div>
      </div>

      {data.pledges.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pledge</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Member</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Target</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.pledges.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.member}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(p.targetAmount)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(p.paidAmount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-2 rounded-full ${p.progress >= 100 ? 'bg-emerald-400' : p.progress >= 50 ? 'bg-blue-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, p.progress)}%` }} /></div>
                      <span className="text-xs text-gray-500 w-10 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : p.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : p.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
