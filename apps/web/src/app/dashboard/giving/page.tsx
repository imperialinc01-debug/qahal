'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportGivingCSV } from '@/lib/export';

const CATEGORY_LABELS: Record<string, string> = {
  TITHE: 'Tithe', OFFERING: 'Offering', SPECIAL_SEED: 'Special Seed',
  PLEDGE_PAYMENT: 'Pledge Payment', BUILDING_FUND: 'Building Fund',
  MISSIONS: 'Missions', WELFARE: 'Welfare', OTHER: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  TITHE: 'bg-blue-100 text-blue-700', OFFERING: 'bg-emerald-100 text-emerald-700',
  SPECIAL_SEED: 'bg-purple-100 text-purple-700', PLEDGE_PAYMENT: 'bg-pink-100 text-pink-700',
  BUILDING_FUND: 'bg-amber-100 text-amber-700', MISSIONS: 'bg-indigo-100 text-indigo-700',
  WELFARE: 'bg-teal-100 text-teal-700', OTHER: 'bg-gray-100 text-gray-600',
};

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-emerald-600">{sub}</p>}
    </div>
  );
}

export default function GivingPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, sumRes] = await Promise.all([
        api.getGivingRecords({ page, limit: 25 }),
        api.getGivingSummary(),
      ]);
      setRecords(recRes.data);
      setMeta(recRes.meta);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load giving data', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteGiving = async (id: string) => {
    if (!confirm('Delete this giving record?')) return;
    try { await api.deleteGiving(id); loadData(); } catch {}
  };

  const gs = summary;
  const tithes = gs?.byCategory?.TITHE || 0;
  const offerings = gs?.byCategory?.OFFERING || 0;
  const monthTotal = gs?.thisMonth?.total || 0;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Giving</h1>
          <p className="text-sm text-gray-500">Track tithes, offerings, and donations in GHS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportGivingCSV(records)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
            + Record giving
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="This month" value={formatCurrency(monthTotal)}
          sub={gs?.thisMonth?.change > 0 ? `+${gs.thisMonth.change}% vs last month` : undefined} />
        <MetricCard label="Tithes" value={formatCurrency(tithes)}
          sub={monthTotal > 0 ? `${Math.round((tithes / monthTotal) * 100)}% of total` : undefined} />
        <MetricCard label="Offerings" value={formatCurrency(offerings)}
          sub={monthTotal > 0 ? `${Math.round((offerings / monthTotal) * 100)}% of total` : undefined} />
        <MetricCard label="YTD total" value={formatCurrency(gs?.ytd?.total || 0)}
          sub={`${gs?.ytd?.count || 0} transactions`} />
      </div>

      {/* Records table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Member</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No giving records yet</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.member ? `${r.member.firstName} ${r.member.lastName}` : <span className="italic text-gray-400">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(Number(r.amount), r.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[r.category] || 'bg-gray-100 text-gray-600'}`}>
                      {CATEGORY_LABELS[r.category] || r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => deleteGiving(r.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Page {page} of {meta.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-white">Prev</button>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-white">Next</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <RecordGivingModal onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); loadData(); }} />}
    </div>
  );
}

// ─── Record Giving Modal ────────────────────────────────────
function RecordGivingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({
    memberId: '', amount: '', category: 'TITHE', paymentMethod: 'CASH',
    date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMembers({ limit: 100 }).then((res) => setMembers(res.data)).catch(() => {});
  }, []);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data: any = {
        ...form,
        amount: parseFloat(form.amount),
        currency: 'GHS',
      };
      if (!data.memberId) delete data.memberId; // anonymous
      if (!data.notes) delete data.notes;
      await api.recordGiving(data);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record giving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record giving</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Member (leave empty for anonymous)</label>
            <select value={form.memberId} onChange={(e) => update('memberId', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Anonymous</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (GHS) *</label>
              <input type="number" step="0.01" min="0.01" required value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" required value={form.date} onChange={(e) => update('date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment method *</label>
              <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="POS">POS</option>
                <option value="ONLINE_CARD">Online Card</option>
                <option value="PAYSTACK">Paystack</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Record giving'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
