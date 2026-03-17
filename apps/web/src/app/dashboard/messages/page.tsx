'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MessagesPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [showSend, setShowSend] = useState(false);
  const [sent, setSent] = useState<any[]>([]);

  useEffect(() => { api.getMembers({ limit: 200 }).then(r => setMembers(r.data || [])).catch(() => {}); }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Messages</h1><p className="text-sm text-gray-500">Send SMS, email, and push notifications</p></div>
        <button onClick={() => setShowSend(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ Send message</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total sent</p><p className="mt-1 text-2xl font-semibold text-gray-900">{sent.length}</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Templates</p><p className="mt-1 text-2xl font-semibold text-gray-900">—</p><p className="text-xs text-gray-400">Configure in Settings</p></div>
        <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Automations</p><p className="mt-1 text-2xl font-semibold text-gray-900">—</p><p className="text-xs text-gray-400">Birthday, follow-up, reminders</p></div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Message templates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: 'Birthday greeting', channel: 'SMS', preview: 'Happy Birthday, {first_name}! Wishing you God\'s blessings...' },
            { name: 'Visitor welcome', channel: 'SMS', preview: 'Hi {first_name}, thank you for visiting {church_name}!' },
            { name: 'Absentee follow-up', channel: 'SMS', preview: 'Hi {first_name}, we missed you last Sunday...' },
            { name: 'Event reminder', channel: 'SMS', preview: '{first_name}, reminder: {event_name} starts in 1 hour' },
          ].map((t, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{t.channel}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{t.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {showSend && <SendMessageModal members={members} onClose={() => setShowSend(false)} onSent={(m: any) => { setSent(p => [m, ...p]); setShowSend(false); }} />}
    </div>
  );
}

function SendMessageModal({ members, onClose, onSent }: { members: any[]; onClose: () => void; onSent: (m: any) => void }) {
  const [form, setForm] = useState({ recipientIds: [] as string[], channel: 'SMS', body: '', subject: '' });
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = members.filter(m => !search || (m.firstName + ' ' + m.lastName).toLowerCase().includes(search.toLowerCase()));

  const toggleMember = (id: string) => {
    setForm(p => ({ ...p, recipientIds: p.recipientIds.includes(id) ? p.recipientIds.filter(r => r !== id) : [...p.recipientIds, id] }));
  };

  const toggleAll = () => {
    if (selectAll) { setForm(p => ({ ...p, recipientIds: [] })); setSelectAll(false); }
    else { setForm(p => ({ ...p, recipientIds: filtered.map(m => m.id) })); setSelectAll(true); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Send message</h2>
        <form onSubmit={async e => { e.preventDefault(); if (!form.recipientIds.length) { alert('Select at least one recipient'); return; } setSending(true); onSent({ ...form, sentAt: new Date() }); }} className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
            <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="SMS">SMS</option><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
          {form.channel === 'EMAIL' && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Subject</label><input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          )}
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
            <textarea required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={3} placeholder="Hi {first_name}, ..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <p className="text-[10px] text-gray-400 mt-1">Use {'{first_name}'}, {'{last_name}'}, {'{church_name}'} as merge fields</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-600">Recipients ({form.recipientIds.length})</label>
              <button type="button" onClick={toggleAll} className="text-xs text-brand-600">{selectAll ? 'Deselect all' : 'Select all'}</button>
            </div>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full mb-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none" />
            <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-gray-200 p-2">
              {filtered.map(m => (
                <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.recipientIds.includes(m.id)} onChange={() => toggleMember(m.id)} className="rounded" />
                  <span className="text-xs text-gray-700">{m.firstName} {m.lastName}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{m.phone || m.email || ''}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={sending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{sending ? 'Sending...' : `Send to ${form.recipientIds.length} members`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
