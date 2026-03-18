'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';

const STATUS_OPTIONS = ['VISITOR', 'NEW_CONVERT', 'MEMBER', 'WORKER', 'LEADER', 'INACTIVE'];

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState<any>({});

  const loadMember = async () => {
    try {
      const res = await api.getMember(memberId);
      setMember(res.data);
      setForm({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        altPhone: res.data.altPhone || '',
        status: res.data.status || 'VISITOR',
        gender: res.data.gender || '',
        dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
        address: res.data.address || '',
        city: res.data.city || '',
        country: res.data.country || '',
        maritalStatus: res.data.maritalStatus || '',
        notes: res.data.notes || '',
      });
    } catch {
      setError('Member not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMember(); }, [memberId]);

  // Clear success message after 4 seconds
  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);

  const up = (f: string, v: string) => setForm((p: any) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data: any = { ...form };
      // Remove empty optional fields
      ['email', 'phone', 'altPhone', 'gender', 'dateOfBirth', 'address', 'city', 'maritalStatus', 'notes'].forEach(f => {
        if (!data[f]) delete data[f];
      });
      await api.updateMember(memberId, data);
      setEditing(false);
      setSuccessMsg('Member updated successfully');
      loadMember();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update member';
      setError(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to archive ${member.firstName} ${member.lastName}?`)) return;
    try {
      await api.deleteMember(memberId);
      router.push('/dashboard/members');
    } catch {}
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>;
  if (!member) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-red-500">{error || 'Member not found'}</p></div>;

  const m = member;
  const stats = m.stats;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <Link href="/dashboard/members" className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-block">&larr; Back to members</Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold ${getAvatarColor(m.firstName + m.lastName)}`}>
              {getInitials(m.firstName, m.lastName)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{m.firstName} {m.lastName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(m.status)}`}>{m.status.replace('_', ' ')}</span>
                {m.gender && <span className="text-xs text-gray-400">{m.gender}</span>}
                {m.joinedDate && <span className="text-xs text-gray-400">Joined {formatDate(m.joinedDate)}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Edit</button>
                <button onClick={handleDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Archive</button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditing(false); setError(''); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {successMsg && <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{successMsg}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Attendance</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.totalAttendance || 0}</p>
            <p className="text-xs text-gray-400">services attended</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last seen</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{stats?.lastAttendance ? formatDate(stats.lastAttendance.date) : '—'}</p>
            {stats?.lastAttendance && <p className="text-xs text-gray-400">{stats.lastAttendance.event}</p>}
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">YTD giving</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(Number(stats?.ytdGiving || 0))}</p>
            <p className="text-xs text-gray-400">{stats?.ytdGivingCount || 0} records</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Groups</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{m.groups?.length || 0}</p>
            <p className="text-xs text-gray-400">active groups</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact information</h2>
          {!editing ? (
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm text-gray-900">{m.email || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm text-gray-900">{m.phone || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Alt phone</p><p className="text-sm text-gray-900">{m.altPhone || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Gender</p><p className="text-sm text-gray-900">{m.gender || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Date of birth</p><p className="text-sm text-gray-900">{m.dateOfBirth ? formatDate(m.dateOfBirth) : '—'}</p></div>
              <div><p className="text-xs text-gray-500">Marital status</p><p className="text-sm text-gray-900">{m.maritalStatus || '—'}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="text-sm text-gray-900">{[m.address, m.city, m.country].filter(Boolean).join(', ') || '—'}</p></div>
              {m.notes && <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-900">{m.notes}</p></div>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">First name *</label>
                  <input type="text" required value={form.firstName} onChange={e => up('firstName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Last name *</label>
                  <input type="text" required value={form.lastName} onChange={e => up('lastName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => up('email', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => up('phone', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Alt phone</label>
                  <input type="tel" value={form.altPhone} onChange={e => up('altPhone', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select value={form.status} onChange={e => up('status', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => up('gender', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">—</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
                  </select></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Date of birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => up('dateOfBirth', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Marital status</label>
                  <select value={form.maritalStatus} onChange={e => up('maritalStatus', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">—</option><option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option><option value="Divorced">Divorced</option>
                  </select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => up('address', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                  <input type="text" value={form.city} onChange={e => up('city', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                  <input type="text" value={form.country} onChange={e => up('country', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            </div>
          )}

          {/* Quick actions */}
          {!editing && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
              {m.phone && <a href={`tel:${m.phone}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">Call</a>}
              {m.phone && <a href={`sms:${m.phone}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">SMS</a>}
              {m.phone && <a href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">WhatsApp</a>}
              {m.email && <a href={`mailto:${m.email}`} className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100">Email</a>}
            </div>
          )}
        </div>

        {/* Groups & Family sidebar */}
        <div className="space-y-6">
          {/* Groups */}
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Groups</h2>
            {m.groups && m.groups.length > 0 ? (
              <div className="space-y-2">
                {m.groups.map((g: any) => (
                  <Link key={g.id} href="/dashboard/groups" className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{g.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{g.role || 'member'}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{g.type}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not in any groups</p>
            )}
          </div>

          {/* Family */}
          {m.family && (
            <div className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Family — {m.family.name}</h2>
              <div className="space-y-2">
                {m.family.members?.map((fm: any) => (
                  <Link key={fm.id} href={`/dashboard/members/${fm.id}`}
                    className={`flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 ${fm.id === memberId ? 'bg-brand-50' : ''}`}>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(fm.firstName + fm.lastName)}`}>
                      {getInitials(fm.firstName, fm.lastName)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{fm.firstName} {fm.lastName}</p>
                      <p className="text-xs text-gray-400">{fm.status.replace('_', ' ')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
