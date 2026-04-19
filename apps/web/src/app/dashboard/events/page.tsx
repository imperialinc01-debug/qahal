'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';
import { exportAttendanceCSV } from '@/lib/export';

const TYPE_LABELS: Record<string, string> = { SUNDAY_SERVICE: 'Sunday Service', MIDWEEK_SERVICE: 'Midweek Service', PRAYER_MEETING: 'Prayer Meeting', CELL_MEETING: 'Cell Meeting', SPECIAL_EVENT: 'Special Event', CONFERENCE: 'Conference', OTHER: 'Other' };
const TYPE_COLORS: Record<string, string> = { SUNDAY_SERVICE: 'bg-blue-100 text-blue-700', MIDWEEK_SERVICE: 'bg-purple-100 text-purple-700', PRAYER_MEETING: 'bg-teal-100 text-teal-700', CELL_MEETING: 'bg-emerald-100 text-emerald-700', SPECIAL_EVENT: 'bg-amber-100 text-amber-700', CONFERENCE: 'bg-pink-100 text-pink-700', OTHER: 'bg-gray-100 text-gray-600' };

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState<'services' | 'events'>('services');
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);

  const loadEvents = () => {
    api.getEvents({ limit: 100 }).then(r => setEvents(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const deleteEvent = async (id: string, name: string) => {
    if (!confirm('Delete event "' + name + '"?')) return;
    try { await api.deleteEvent(id); setEvents(prev => prev.filter(e => e.id !== id)); if (selectedEvent?.id === id) setSelectedEvent(null); } catch {}
  };

  const loadEventDetail = async (event: any) => {
    setSelectedEvent(event);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('qahal_access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/attendance/events/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAttendees(data.data.records || []);
    } catch {} finally { setLoadingDetail(false); }
  };

  const services = events.filter(e => ['SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING'].includes(e.type));
  const otherEvents = events.filter(e => !['SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING'].includes(e.type));
  const displayEvents = tab === 'services' ? services : otherEvents;

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Events</h1><p className="text-sm text-gray-500">{services.length} services, {otherEvents.length} other events</p></div>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ Create event</button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button onClick={() => { setTab('services'); setSelectedEvent(null); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Church services ({services.length})
        </button>
        <button onClick={() => { setTab('events'); setSelectedEvent(null); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === 'events' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Other events ({otherEvents.length})
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Event list */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Event</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Attended</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayEvents.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">{tab === 'services' ? 'No church services yet' : 'No other events yet'}</td></tr>
                ) : displayEvents.map((e: any) => (
                  <tr key={e.id} onClick={() => loadEventDetail(e)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedEvent?.id === e.id ? 'bg-brand-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{e.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[e.type] || 'bg-gray-100 text-gray-600'}`}>{TYPE_LABELS[e.type] || e.type}</span>
                        <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{e._count?.attendanceRecords || 0}</td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(ev) => { ev.stopPropagation(); setEditEvent(e); }} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Edit</button>
                        <button onClick={(ev) => { ev.stopPropagation(); deleteEvent(e.id, e.name); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event detail */}
        <div className="lg:col-span-3">
          {!selectedEvent ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-sm text-gray-400">Click on an event to see who attended</p>
            </div>
          ) : loadingDetail ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center"><p className="text-sm text-gray-400">Loading...</p></div>
          ) : (
            <div className="rounded-xl border border-gray-200">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedEvent.name}</h2>
                    <p className="text-sm text-gray-500">{formatDate(selectedEvent.date)} {selectedEvent.location ? ` \u2022 ${selectedEvent.location}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{attendees.length}</p>
                    <p className="text-xs text-gray-500">attended</p>
                    <button onClick={() => exportAttendanceCSV(selectedEvent.name, attendees)} className="mt-1 rounded-md border border-gray-300 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50">Export</button>
                  </div>
                </div>
              </div>

              {/* Attendees list */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Who was present</h3>
                {attendees.length === 0 ? (
                  <p className="text-sm text-gray-400">No one was checked in for this event</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {attendees.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(a.member.firstName + a.member.lastName)}`}>
                          {getInitials(a.member.firstName, a.member.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.member.firstName} {a.member.lastName}</p>
                          <p className="text-xs text-gray-400">{a.member.phone || '\u2014'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{a.checkInMethod || 'Manual'}</p>
                          {a.isFirstTime && <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">First timer</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadEvents(); }} />}
      {editEvent && <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={(updated) => {
        setEditEvent(null);
        setEvents(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
        if (selectedEvent?.id === updated.id) setSelectedEvent({ ...selectedEvent, ...updated });
      }} />}
    </div>
  );
}

// ─── Create Event Modal ─────────────────────────────────────
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '', type: 'SUNDAY_SERVICE',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '12:00',
    location: '', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const up = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Event name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const data: any = {
        name: form.name,
        type: form.type,
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
      };
      await api.createEvent(data);
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create event';
      setError(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Create event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event name *</label>
            <input type="text" required value={form.name} onChange={e => up('name', e.target.value)}
              placeholder="e.g. Sunday Service" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select value={form.type} onChange={e => up('type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="SUNDAY_SERVICE">Sunday Service</option>
                <option value="MIDWEEK_SERVICE">Midweek Service</option>
                <option value="PRAYER_MEETING">Prayer Meeting</option>
                <option value="CELL_MEETING">Cell Meeting</option>
                <option value="SPECIAL_EVENT">Special Event</option>
                <option value="CONFERENCE">Conference</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" required value={form.date} onChange={e => up('date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
              <input type="time" value={form.startTime} onChange={e => up('startTime', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
              <input type="time" value={form.endTime} onChange={e => up('endTime', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input type="text" value={form.location} onChange={e => up('location', e.target.value)}
              placeholder="e.g. Main Auditorium" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => up('description', e.target.value)} rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Event Modal ───────────────────────────────────────
function EditEventModal({ event, onClose, onSaved }: { event: any; onClose: () => void; onSaved: (e: any) => void }) {
  const toDateStr = (d: string) => d ? new Date(d).toISOString().split('T')[0] : '';
  const toTimeStr = (d: string | null | undefined) => d ? new Date(d).toISOString().slice(11, 16) : '';

  const [form, setForm] = useState({
    name: event.name || '',
    type: event.type || 'SUNDAY_SERVICE',
    date: toDateStr(event.date),
    startTime: toTimeStr(event.startTime),
    endTime: toTimeStr(event.endTime),
    location: event.location || '',
    description: event.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const up = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Event name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const data: any = {
        name: form.name,
        type: form.type,
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
      };
      const res = await api.updateEvent(event.id, data);
      onSaved(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update event';
      setError(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event name *</label>
            <input type="text" required value={form.name} onChange={e => up('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select value={form.type} onChange={e => up('type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="SUNDAY_SERVICE">Sunday Service</option>
                <option value="MIDWEEK_SERVICE">Midweek Service</option>
                <option value="PRAYER_MEETING">Prayer Meeting</option>
                <option value="CELL_MEETING">Cell Meeting</option>
                <option value="SPECIAL_EVENT">Special Event</option>
                <option value="CONFERENCE">Conference</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" required value={form.date} onChange={e => up('date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
              <input type="time" value={form.startTime} onChange={e => up('startTime', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
              <input type="time" value={form.endTime} onChange={e => up('endTime', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input type="text" value={form.location} onChange={e => up('location', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => up('description', e.target.value)} rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
