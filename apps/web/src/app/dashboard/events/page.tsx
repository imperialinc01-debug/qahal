'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = { SUNDAY_SERVICE: 'Sunday Service', MIDWEEK_SERVICE: 'Midweek Service', PRAYER_MEETING: 'Prayer Meeting', CELL_MEETING: 'Cell Meeting', SPECIAL_EVENT: 'Special Event', CONFERENCE: 'Conference', OTHER: 'Other' };
const TYPE_COLORS: Record<string, string> = { SUNDAY_SERVICE: 'bg-blue-100 text-blue-700', MIDWEEK_SERVICE: 'bg-purple-100 text-purple-700', PRAYER_MEETING: 'bg-teal-100 text-teal-700', CELL_MEETING: 'bg-emerald-100 text-emerald-700', SPECIAL_EVENT: 'bg-amber-100 text-amber-700', CONFERENCE: 'bg-pink-100 text-pink-700', OTHER: 'bg-gray-100 text-gray-600' };

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState<'services' | 'events'>('services');

  useEffect(() => { api.getEvents({ limit: 100 }).then(r => setEvents(r.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayEvents.length === 0 ? (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-sm">{tab === 'services' ? 'No church services yet' : 'No other events yet'}</td></tr>
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
    </div>
  );
}
