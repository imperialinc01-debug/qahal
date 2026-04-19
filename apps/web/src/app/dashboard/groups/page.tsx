'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getInitials, getAvatarColor } from '@/lib/utils';

var CAT_LABELS: Record<string, string> = { CELL: 'Cell', MINISTRY: 'Ministry', DEPARTMENT: 'Department', ZONE: 'Zone', DISTRICT: 'District', TEAM: 'Team' };
var CAT_COLORS: Record<string, string> = { CELL: 'bg-blue-100 text-blue-700', MINISTRY: 'bg-purple-100 text-purple-700', DEPARTMENT: 'bg-teal-100 text-teal-700', ZONE: 'bg-amber-100 text-amber-700', DISTRICT: 'bg-pink-100 text-pink-700', TEAM: 'bg-emerald-100 text-emerald-700' };

export default function GroupsPage() {
  var [groups, setGroups] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [selected, setSelected] = useState<any>(null);
  var [showCreate, setShowCreate] = useState(false);
  var [showAddMember, setShowAddMember] = useState(false);

  useEffect(function() { api.getGroups().then(function(r) { setGroups(r.data || []); }).catch(function() {}).finally(function() { setLoading(false); }); }, []);

  var loadGroup = async function(id: string) {
    try { var r = await api.getGroup(id); setSelected(r.data); } catch {}
  };

  var removeMember = async function(groupId: string, memberId: string) {
    if (!confirm('Remove this member from the group?')) return;
    try {
      var token = localStorage.getItem('qahal_access_token');
      await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/groups/' + groupId + '/members/' + memberId, {
        method: 'DELETE', headers: { 'Authorization': 'Bearer ' + (token || '') },
      });
      loadGroup(groupId);
    } catch {}
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Groups & ministries</h1><p className="text-sm text-gray-500">{groups.length} groups</p></div>
        <button onClick={function() { setShowCreate(true); }} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ Create group</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Groups list */}
        <div className="lg:col-span-1 space-y-2">
          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="text-sm text-gray-400">No groups yet</p></div>
          ) : groups.map(function(g: any) {
            return (
              <button key={g.id} onClick={function() { loadGroup(g.id); }}
                className={'w-full rounded-lg border p-3 text-left transition-colors ' + (selected?.id === g.id ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50')}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{g.name}</p>
                  <span className={'rounded-full px-2 py-0.5 text-[10px] font-medium ' + (CAT_COLORS[g.type] || 'bg-gray-100 text-gray-600')}>{CAT_LABELS[g.type] || g.type}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{g._count?.members || 0} members</p>
              </button>
            );
          })}
        </div>

        {/* Group detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center"><p className="text-sm text-gray-400">Select a group to view details</p></div>
          ) : (
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{CAT_LABELS[selected.type] || selected.type}{selected.parentGroup ? ' \u00b7 Part of ' + selected.parentGroup.name : ''}</p>
                </div>
                <span className={'rounded-full px-2.5 py-1 text-xs font-medium ' + (CAT_COLORS[selected.type] || '')}>{CAT_LABELS[selected.type]}</span>
              </div>

              {selected.description && <p className="text-sm text-gray-600 mb-4">{selected.description}</p>}

              <div className="grid grid-cols-3 gap-3 mb-4">
                {selected.meetingDay && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Meeting day</p><p className="text-sm font-medium">{selected.meetingDay}</p></div>}
                {selected.meetingTime && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Time</p><p className="text-sm font-medium">{selected.meetingTime}</p></div>}
                {selected.location && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Location</p><p className="text-sm font-medium">{selected.location}</p></div>}
              </div>

              {/* Members section with Add button */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Members ({selected.members?.length || 0})</h3>
                <button onClick={function() { setShowAddMember(true); }} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">+ Add member</button>
              </div>

              <div className="space-y-2">
                {(selected.members || []).map(function(gm: any) {
                  return (
                    <div key={gm.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5">
                      <div className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ' + getAvatarColor(gm.member.firstName + gm.member.lastName)}>
                        {getInitials(gm.member.firstName, gm.member.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{gm.member.firstName} {gm.member.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{gm.member.phone || gm.member.email || '\u2014'}</p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{gm.role}</span>
                      <button onClick={function() { removeMember(selected.id, gm.member.id); }} className="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Remove</button>
                    </div>
                  );
                })}
                {(!selected.members || selected.members.length === 0) && <p className="text-sm text-gray-400">No members in this group yet</p>}
              </div>

              {selected.childGroups?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Sub-groups ({selected.childGroups.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.childGroups.map(function(cg: any) {
                      return <button key={cg.id} onClick={function() { loadGroup(cg.id); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50">{cg.name}</button>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateGroupModal onClose={function() { setShowCreate(false); }} onCreated={function(g: any) { setGroups(function(p) { return [...p, g]; }); setShowCreate(false); }} />}
      {showAddMember && selected && <AddMemberToGroupModal groupId={selected.id} groupName={selected.name} existingMemberIds={(selected.members || []).map(function(gm: any) { return gm.member.id; })} onClose={function() { setShowAddMember(false); }} onAdded={function() { setShowAddMember(false); loadGroup(selected.id); }} />}
    </div>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (g: any) => void }) {
  var [form, setForm] = useState({ name: '', type: 'CELL', description: '', meetingDay: '', meetingTime: '', location: '' });
  var [saving, setSaving] = useState(false);
  var up = function(f: string, v: string) { setForm(function(p) { return { ...p, [f]: v }; }); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={function(e) { e.stopPropagation(); }}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create group</h2>
        <form onSubmit={async function(e) { e.preventDefault(); setSaving(true); try { var r = await api.createGroup(form); onCreated(r.data); } catch {} finally { setSaving(false); } }} className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Group name *</label><input type="text" required value={form.name} onChange={function(e) { up('name', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><select value={form.type} onChange={function(e) { up('type', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="CELL">Cell</option><option value="MINISTRY">Ministry</option><option value="DEPARTMENT">Department</option><option value="ZONE">Zone</option><option value="TEAM">Team</option></select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Meeting day</label><input type="text" value={form.meetingDay} onChange={function(e) { up('meetingDay', e.target.value); }} placeholder="e.g. Wednesday" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Time</label><input type="text" value={form.meetingTime} onChange={function(e) { up('meetingTime', e.target.value); }} placeholder="e.g. 6:30 PM" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Location</label><input type="text" value={form.location} onChange={function(e) { up('location', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><textarea value={form.description} onChange={function(e) { up('description', e.target.value); }} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberToGroupModal({ groupId, groupName, existingMemberIds, onClose, onAdded }: { groupId: string; groupName: string; existingMemberIds: string[]; onClose: () => void; onAdded: () => void }) {
  var [allMembers, setAllMembers] = useState<any[]>([]);
  var [search, setSearch] = useState('');
  var [adding, setAdding] = useState<string | null>(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    api.getMembers({ limit: 500 }).then(function(r) { setAllMembers(r.data || []); }).catch(function() {}).finally(function() { setLoading(false); });
  }, []);

  var available = allMembers.filter(function(m) {
    if (existingMemberIds.indexOf(m.id) >= 0) return false;
    if (!search) return true;
    var q = search.toLowerCase();
    return m.firstName.toLowerCase().indexOf(q) >= 0 || m.lastName.toLowerCase().indexOf(q) >= 0;
  });

  var addMember = async function(memberId: string) {
    setAdding(memberId);
    try {
      var token = localStorage.getItem('qahal_access_token');
      var res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/groups/' + groupId + '/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
        body: JSON.stringify({ memberId: memberId }),
      });
      var data = await res.json();
      if (data.success) {
        existingMemberIds.push(memberId);
        setAllMembers(function(prev) { return [...prev]; }); // force re-render
      }
    } catch {} finally { setAdding(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-xl bg-white shadow-xl" onClick={function(e) { e.stopPropagation(); }}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Add member to {groupName}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <input type="text" placeholder="Search members..." value={search} onChange={function(e) { setSearch(e.target.value); }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-gray-400 text-center">Loading members...</p>
          ) : available.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">{search ? 'No members found' : 'All members are already in this group'}</p>
          ) : (
            <div className="space-y-2">
              {available.map(function(m: any) {
                var isAdding = adding === m.id;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5 hover:bg-gray-50">
                    <div className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ' + getAvatarColor(m.firstName + m.lastName)}>
                      {getInitials(m.firstName, m.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{m.phone || m.email || '\u2014'}</p>
                    </div>
                    <button onClick={function() { addMember(m.id); }} disabled={isAdding}
                      className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                      {isAdding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onAdded} className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Done</button>
        </div>
      </div>
    </div>
  );
}
