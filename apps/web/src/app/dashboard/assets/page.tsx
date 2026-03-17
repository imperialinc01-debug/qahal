'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const CAT_LABELS: Record<string, string> = { EQUIPMENT: 'Equipment', FURNITURE: 'Furniture', VEHICLE: 'Vehicle', PROPERTY: 'Property', INSTRUMENT: 'Instrument', ELECTRONICS: 'Electronics', OTHER: 'Other' };
const CAT_COLORS: Record<string, string> = { EQUIPMENT: 'bg-blue-100 text-blue-700', FURNITURE: 'bg-amber-100 text-amber-700', VEHICLE: 'bg-purple-100 text-purple-700', PROPERTY: 'bg-emerald-100 text-emerald-700', INSTRUMENT: 'bg-pink-100 text-pink-700', ELECTRONICS: 'bg-teal-100 text-teal-700', OTHER: 'bg-gray-100 text-gray-600' };
const COND_COLORS: Record<string, string> = { NEW: 'bg-emerald-100 text-emerald-700', GOOD: 'bg-blue-100 text-blue-700', FAIR: 'bg-amber-100 text-amber-700', POOR: 'bg-red-100 text-red-700', DAMAGED: 'bg-red-200 text-red-800', DISPOSED: 'bg-gray-200 text-gray-600' };

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (catFilter) params.category = catFilter;
      if (search) params.search = search;
      const [aRes, sRes] = await Promise.all([api.getAssets(params), api.getAssetSummary()]);
      setAssets(aRes.data || []);
      setMeta(aRes.meta);
      setSummary(sRes.data);
    } catch {} finally { setLoading(false); }
  }, [catFilter, search]);

  useEffect(() => { load(); }, [load]);

  const deleteAsset = async (id: string, name: string) => {
    if (!confirm('Delete asset "' + name + '"?')) return;
    try { await api.deleteAsset(id); load(); } catch {}
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Asset inventory</h1><p className="text-sm text-gray-500">Track equipment, furniture, vehicles, and property</p></div>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ Add asset</button>
      </div>

      {summary && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total assets</p><p className="mt-1 text-2xl font-semibold text-gray-900">{summary.total}</p></div>
          <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total value</p><p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalValue)}</p></div>
          {summary.byCategory?.slice(0, 2).map((c: any) => (
            <div key={c.category} className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">{CAT_LABELS[c.category]}</p><p className="mt-1 text-2xl font-semibold text-gray-900">{c.count}</p><p className="text-xs text-gray-400">{formatCurrency(c.value)}</p></div>
          ))}
        </div>
      )}

      <div className="mb-4 flex gap-3">
        <input type="text" placeholder="Search assets..." value={search} onChange={e => { setSearch(e.target.value); }}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Asset</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">Location</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No assets recorded yet</td></tr>
            ) : assets.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{a.name}</p>
                  {a.description && <p className="text-xs text-gray-400 truncate max-w-xs">{a.description}</p>}
                  {a.serialNumber && <p className="text-[10px] text-gray-400">SN: {a.serialNumber}</p>}
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CAT_COLORS[a.category]}`}>{CAT_LABELS[a.category]}</span></td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COND_COLORS[a.condition]}`}>{a.condition}</span></td>
                <td className="px-4 py-3 text-gray-900 font-medium hidden md:table-cell">{a.value ? formatCurrency(Number(a.value)) : '—'}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.source || (a.donorMember ? `${a.donorMember.firstName} ${a.donorMember.lastName}` : '—')}</td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{a.location || '—'}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => deleteAsset(a.id, a.name)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddAssetModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function AddAssetModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'EQUIPMENT', condition: 'GOOD', value: '', source: '', location: '', serialNumber: '', acquiredDate: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const up = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add asset</h2>
        <form onSubmit={async e => { e.preventDefault(); setSaving(true); setError(''); try { const data: any = { ...form }; if (data.value) data.value = parseFloat(data.value); else delete data.value; Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; }); data.category = form.category; data.condition = form.condition; await api.createAsset(data); onCreated(); } catch (err: any) { setError(err.response?.data?.message || 'Failed'); } finally { setSaving(false); } }} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Name *</label><input type="text" required value={form.name} onChange={e => up('name', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Yamaha Keyboard" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><input type="text" value={form.description} onChange={e => up('description', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label><select value={form.category} onChange={e => up('category', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="EQUIPMENT">Equipment</option><option value="FURNITURE">Furniture</option><option value="VEHICLE">Vehicle</option><option value="PROPERTY">Property</option><option value="INSTRUMENT">Instrument</option><option value="ELECTRONICS">Electronics</option><option value="OTHER">Other</option></select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Condition</label><select value={form.condition} onChange={e => up('condition', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="NEW">New</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option></select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Value (GHS)</label><input type="number" step="0.01" value={form.value} onChange={e => up('value', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Source / Donor</label><input type="text" value={form.source} onChange={e => up('source', e.target.value)} placeholder="e.g. Donated by Bro. Kwame" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date acquired</label><input type="date" value={form.acquiredDate} onChange={e => up('acquiredDate', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Location</label><input type="text" value={form.location} onChange={e => up('location', e.target.value)} placeholder="e.g. Main Auditorium" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Serial number</label><input type="text" value={form.serialNumber} onChange={e => up('serialNumber', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label><textarea value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add asset'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
