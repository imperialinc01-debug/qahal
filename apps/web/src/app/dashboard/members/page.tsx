'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';
import { exportMembersCSV } from '@/lib/export';

export default function MembersPage() {
  var [members, setMembers] = useState<any[]>([]);
  var [meta, setMeta] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('');
  var [page, setPage] = useState(1);
  var [showAddModal, setShowAddModal] = useState(false);

  var loadMembers = useCallback(async function() {
    setLoading(true);
    try {
      var params: Record<string, any> = { page: page, limit: 25 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      var res = await api.getMembers(params);
      setMembers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(function() { loadMembers(); }, [loadMembers]);

  var [searchInput, setSearchInput] = useState('');
  useEffect(function() {
    var t = setTimeout(function() { setSearch(searchInput); setPage(1); }, 400);
    return function() { clearTimeout(t); };
  }, [searchInput]);

  var deleteMember = async function(id: string, name: string) {
    if (!confirm('Are you sure you want to remove ' + name + '? This will archive the member.')) return;
    try {
      await api.deleteMember(id);
      loadMembers();
    } catch {}
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500">{meta?.total || 0} total members</p>
        </div>
        <button onClick={function() { setShowAddModal(true); }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
          + Add member
        </button>
        <button onClick={function() { exportMembersCSV(members); }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <input type="text" placeholder="Search by name, email, phone..." value={searchInput}
          onChange={function(e) { setSearchInput(e.target.value); }}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <select value={statusFilter} onChange={function(e) { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
          <option value="">All statuses</option>
          <option value="VISITOR">Visitor</option>
          <option value="NEW_CONVERT">New Convert</option>
          <option value="MEMBER">Member</option>
          <option value="WORKER">Worker</option>
          <option value="LEADER">Leader</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No members found</td></tr>
            ) : (
              members.map(function(m) {
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={'/dashboard/members/' + m.id} className="flex items-center gap-3">
                        <div className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ' + getAvatarColor(m.firstName + m.lastName)}>
                          {getInitials(m.firstName, m.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                          {m.family && <p className="text-xs text-gray-400">{m.family.name}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' + getStatusColor(m.status)}>{m.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.email || m.phone || '\u2014'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{m.groups?.[0]?.name || '\u2014'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{m.joinedDate ? formatDate(m.joinedDate) : '\u2014'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={function() { deleteMember(m.id, m.firstName + ' ' + m.lastName); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Showing {(page - 1) * meta.limit + 1}\u2013{Math.min(page * meta.limit, meta.total)} of {meta.total}</p>
            <div className="flex gap-1">
              <button onClick={function() { setPage(function(p) { return Math.max(1, p - 1); }); }} disabled={page === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-white">Prev</button>
              <button onClick={function() { setPage(function(p) { return Math.min(meta.totalPages, p + 1); }); }} disabled={page >= meta.totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-white">Next</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddMemberModal onClose={function() { setShowAddModal(false); }} onCreated={function() { setShowAddModal(false); loadMembers(); }} />}
    </div>
  );
}

function AddMemberModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  var [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', status: 'VISITOR',
    gender: '', dateOfBirth: '', city: '', country: 'Ghana',
    address: '', maritalStatus: '', altPhone: '', notes: '',
  });
  var [saving, setSaving] = useState(false);
  var [error, setError] = useState('');

  var update = function(field: string, value: string) { setForm(function(p) { return { ...p, [field]: value }; }); };

  var handleSubmit = async function(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      var data: any = { ...form };
      // Remove empty optional fields
      var optionalFields = ['email', 'phone', 'altPhone', 'gender', 'dateOfBirth', 'address', 'maritalStatus', 'notes'];
      optionalFields.forEach(function(f) { if (!data[f]) delete data[f]; });
      await api.createMember(data);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={function(e) { e.stopPropagation(); }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add new member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">First name *</label>
              <input type="text" required value={form.firstName} onChange={function(e) { update('firstName', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Last name *</label>
              <input type="text" required value={form.lastName} onChange={function(e) { update('lastName', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={function(e) { update('email', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={function(e) { update('phone', e.target.value); }} placeholder="+233..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>

          <div><label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input type="text" value={form.address} onChange={function(e) { update('address', e.target.value); }} placeholder="e.g. 15 Independence Ave, East Legon"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input type="text" value={form.city} onChange={function(e) { update('city', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input type="text" value={form.country} onChange={function(e) { update('country', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={function(e) { update('status', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="VISITOR">Visitor</option><option value="NEW_CONVERT">New Convert</option>
                <option value="MEMBER">Member</option><option value="WORKER">Worker</option><option value="LEADER">Leader</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              <select value={form.gender} onChange={function(e) { update('gender', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">--</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date of birth</label>
              <input type="date" value={form.dateOfBirth} onChange={function(e) { update('dateOfBirth', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Marital status</label>
              <select value={form.maritalStatus} onChange={function(e) { update('maritalStatus', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">--</option><option value="Single">Single</option><option value="Married">Married</option>
                <option value="Widowed">Widowed</option><option value="Divorced">Divorced</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Alt phone</label>
              <input type="tel" value={form.altPhone} onChange={function(e) { update('altPhone', e.target.value); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>

          <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={function(e) { update('notes', e.target.value); }} rows={2} placeholder="Any additional notes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
