'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';

export default function AttendancePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [tab, setTab] = useState<'checkin' | 'present' | 'absent'>('checkin');
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        let evts: any[] = [];
        let mems: any[] = [];
        let sts: any = null;

        try { const r = await api.getEvents({ limit: 50 }); evts = r.data || []; } catch (e: any) { console.error('Events load error:', e); }
        try { const r = await api.getMembers({ limit: 500 }); mems = r.data || []; } catch (e: any) { console.error('Members load error:', e); }
        try { const r = await api.getAttendanceStats(); sts = r.data; } catch (e: any) { console.error('Stats load error:', e); }

        setEvents(evts);
        setAllMembers(mems);
        setStats(sts);

        if (mems.length === 0) setError('Could not load members. Try refreshing the page.');
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  // Load attendance when event changes
  useEffect(() => {
    if (!selectedEvent) { setAttendanceRecords([]); return; }
    const token = localStorage.getItem('qahal_access_token');
    if (!token) return;
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/attendance/events/' + selectedEvent, {
      headers: { 'Authorization': 'Bearer ' + token },
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.data && data.data.records) {
          setAttendanceRecords(data.data.records);
        }
      })
      .catch(function() {});
  }, [selectedEvent]);

  // Build checked-in set from attendance records
  const checkedInMap = new Map<string, string>();
  attendanceRecords.forEach(function(r: any) { checkedInMap.set(r.memberId || r.member?.id, r.id); });

  const handleCheckIn = async (memberId: string) => {
    if (!selectedEvent) return;

    // Deselect if already checked in
    if (checkedInMap.has(memberId)) {
      const attendanceId = checkedInMap.get(memberId);
      try {
        const token = localStorage.getItem('qahal_access_token');
        await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/attendance/' + attendanceId, {
          method: 'DELETE', headers: { 'Authorization': 'Bearer ' + (token || '') },
        });
        setAttendanceRecords(function(prev) { return prev.filter(function(r) { return r.id !== attendanceId; }); });
      } catch {}
      return;
    }

    // Check in
    setCheckingIn(memberId);
    try {
      const res = await api.checkIn({ eventId: selectedEvent, memberId: memberId });
      if (res.success) {
        setAttendanceRecords(function(prev) { return [...prev, res.data]; });
      }
    } catch {} finally { setCheckingIn(null); }
  };

  const handleBatchCheckIn = async () => {
    if (!selectedEvent) return;
    const ids = displayMembers.filter(function(m) { return !checkedInMap.has(m.id); }).map(function(m) { return m.id; });
    if (!ids.length) return;
    if (!confirm('Check in ' + ids.length + ' members?')) return;
    try {
      await api.batchCheckIn({ eventId: selectedEvent, memberIds: ids });
      // Reload attendance
      const token = localStorage.getItem('qahal_access_token');
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/attendance/events/' + selectedEvent, {
        headers: { 'Authorization': 'Bearer ' + (token || '') },
      });
      const data = await res.json();
      if (data.success) setAttendanceRecords(data.data.records || []);
    } catch {}
  };

  // Filter members by search
  const displayMembers = allMembers.filter(function(m: any) {
    if (!search) return true;
    var q = search.toLowerCase();
    return m.firstName.toLowerCase().indexOf(q) >= 0 || m.lastName.toLowerCase().indexOf(q) >= 0 || (m.phone && m.phone.indexOf(q) >= 0);
  });

  // Split into present and absent (exclude visitors from absent count)
  const presentMembers = displayMembers.filter(function(m) { return checkedInMap.has(m.id); });
  const absentMembers = displayMembers.filter(function(m) { return !checkedInMap.has(m.id) && m.status !== 'VISITOR'; });
  const firstTimers = attendanceRecords.filter(function(r: any) { return r.isFirstTime; });

  // Separate services from other events
  const serviceTypes = ['SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING'];
  const services = events.filter(function(e) { return serviceTypes.indexOf(e.type) >= 0; });
  const otherEvents = events.filter(function(e) { return serviceTypes.indexOf(e.type) < 0; });

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Attendance</h1><p className="text-sm text-gray-500">Check in members for services and events ({allMembers.length} members loaded)</p></div>
        <button onClick={function() { setShowNewEvent(true); }} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ New event</button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last Sunday</p><p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.lastSunday || 0}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Present</p><p className="mt-1 text-2xl font-semibold text-emerald-600">{checkedInMap.size}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Absent</p><p className="mt-1 text-2xl font-semibold text-red-500">{selectedEvent ? absentMembers.length : 0}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total members</p><p className="mt-1 text-2xl font-semibold text-gray-900">{allMembers.length}</p></div>
      </div>

      {/* Event selector */}
      <div className="mb-4">
        <select value={selectedEvent} onChange={function(e) { setSelectedEvent(e.target.value); setTab('checkin'); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
          <option value="">Select a service or event...</option>
          {services.length > 0 && <optgroup label="--- Church Services ---">{services.map(function(e: any) { return <option key={e.id} value={e.id}>{e.name} -- {formatDate(e.date)} ({e._count?.attendanceRecords || 0} attended)</option>; })}</optgroup>}
          {otherEvents.length > 0 && <optgroup label="--- Other Events ---">{otherEvents.map(function(e: any) { return <option key={e.id} value={e.id}>{e.name} -- {formatDate(e.date)} ({e._count?.attendanceRecords || 0} attended)</option>; })}</optgroup>}
        </select>
      </div>

      {!selectedEvent ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center"><p className="text-sm text-gray-400">Select a service or event to start taking attendance</p></div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
            <button onClick={function() { setTab('checkin'); }} className={'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ' + (tab === 'checkin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>Check in</button>
            <button onClick={function() { setTab('present'); }} className={'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ' + (tab === 'present' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>Present ({checkedInMap.size})</button>
            <button onClick={function() { setTab('absent'); }} className={'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ' + (tab === 'absent' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>Absent ({absentMembers.length})</button>
          </div>

          {/* Search + batch */}
          <div className="mb-4 flex gap-3">
            <input type="text" placeholder="Search members..." value={search} onChange={function(e) { setSearch(e.target.value); }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            {tab === 'checkin' && <button onClick={handleBatchCheckIn} className="rounded-lg border border-brand-600 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50">Check in all</button>}
          </div>

          {/* First timers banner */}
          {firstTimers.length > 0 && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">First-time visitors today: {firstTimers.length}</p>
              <p className="text-xs text-amber-600 mt-1">These members need follow-up within 48 hours</p>
            </div>
          )}

          {/* CHECK-IN TAB */}
          {tab === 'checkin' && (
            allMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="text-sm text-gray-400">No members found. Add members on the Members page first.</p></div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {displayMembers.map(function(m: any) {
                  var done = checkedInMap.has(m.id);
                  return (
                    <button key={m.id} onClick={function() { handleCheckIn(m.id); }} disabled={checkingIn === m.id}
                      className={'flex items-center gap-3 rounded-lg border p-3 text-left transition-all ' + (done ? 'border-emerald-200 bg-emerald-50 hover:bg-red-50 hover:border-red-200' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50')}>
                      <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ' + (done ? 'bg-emerald-200 text-emerald-800' : getAvatarColor(m.firstName + m.lastName))}>
                        {done ? '\u2713' : getInitials(m.firstName, m.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{m.phone || '\u2014'}</p>
                      </div>
                      {done && <span className="text-xs text-gray-400 shrink-0">Tap to remove</span>}
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* PRESENT TAB */}
          {tab === 'present' && (
            presentMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="text-sm text-gray-400">No one checked in yet</p></div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {presentMembers.map(function(m: any) {
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-medium text-emerald-800">{'\u2713'}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{m.phone || m.email || '\u2014'}</p>
                      </div>
                      <button onClick={function() { handleCheckIn(m.id); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ABSENT TAB */}
          {tab === 'absent' && (
            absentMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center"><p className="text-sm text-emerald-600">Everyone is present!</p></div>
            ) : (
              <div>
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">{absentMembers.length} members absent</p>
                  <p className="text-xs text-red-600 mt-1">Use the buttons below to follow up with each member</p>
                </div>
                <div className="space-y-2">
                  {absentMembers.map(function(m: any) {
                    return (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                        <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ' + getAvatarColor(m.firstName + m.lastName)}>
                          {getInitials(m.firstName, m.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{m.phone || m.email || '\u2014'}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {m.phone && <a href={'tel:' + m.phone} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">Call</a>}
                          {m.phone && <a href={'sms:' + m.phone + '?body=Hi ' + m.firstName + ', we missed you at church today. Hope all is well!'} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">SMS</a>}
                          {m.phone && <a href={'https://wa.me/' + m.phone.replace(/[^0-9]/g, '') + '?text=Hi ' + m.firstName + ', we missed you at church today. Hope all is well!'} target="_blank" className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">WhatsApp</a>}
                          <button onClick={function() { handleCheckIn(m.id); }} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">Mark present</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </>
      )}

      {showNewEvent && <NewEventModal onClose={function() { setShowNewEvent(false); }} onCreated={function(evt: any) { setEvents(function(p) { return [evt, ...p]; }); setSelectedEvent(evt.id); setShowNewEvent(false); }} />}
    </div>
  );
}

function NewEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: (e: any) => void }) {
  const [form, setForm] = useState({ name: 'Sunday Service', type: 'SUNDAY_SERVICE', date: new Date().toISOString().slice(0, 16), location: '' });
  const [saving, setSaving] = useState(false);
  var up = function(f: string, v: string) {
    setForm(function(p) {
      var u: any = { ...p };
      u[f] = v;
      if (f === 'type') {
        var names: Record<string, string> = { SUNDAY_SERVICE: 'Sunday Service', MIDWEEK_SERVICE: 'Midweek Service', PRAYER_MEETING: 'Prayer Meeting', CELL_MEETING: 'Cell Meeting', SPECIAL_EVENT: '', CONFERENCE: '', OTHER: '' };
        if (names[v] !== undefined) u.name = names[v];
      }
      return u;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={function(e) { e.stopPropagation(); }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create service or event</h2>
        <form onSubmit={async function(e) { e.preventDefault(); setSaving(true); try { var r = await api.createEvent({ ...form, date: new Date(form.date).toISOString() }); onCreated(r.data); } catch {} finally { setSaving(false); } }} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Quick select</label>
            <div className="flex flex-wrap gap-2">
              {[{ label: 'Sunday Service', type: 'SUNDAY_SERVICE' }, { label: 'Midweek Service', type: 'MIDWEEK_SERVICE' }, { label: 'Prayer Meeting', type: 'PRAYER_MEETING' }].map(function(p) {
                return <button key={p.type} type="button" onClick={function() { up('type', p.type); setForm(function(f) { return { ...f, name: p.label }; }); }}
                  className={'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ' + (form.type === p.type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>{p.label}</button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={function(e) { up('type', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <optgroup label="Church Services"><option value="SUNDAY_SERVICE">Sunday Service</option><option value="MIDWEEK_SERVICE">Midweek Service</option><option value="PRAYER_MEETING">Prayer Meeting</option></optgroup>
                <optgroup label="Other Events"><option value="CELL_MEETING">Cell Meeting</option><option value="SPECIAL_EVENT">Special Event</option><option value="CONFERENCE">Conference</option><option value="OTHER">Other</option></optgroup>
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date & time *</label><input type="datetime-local" required value={form.date} onChange={function(e) { up('date', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Name *</label><input type="text" required value={form.name} onChange={function(e) { up('name', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Location</label><input type="text" value={form.location} onChange={function(e) { up('location', e.target.value); }} placeholder="e.g. Main Auditorium" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
