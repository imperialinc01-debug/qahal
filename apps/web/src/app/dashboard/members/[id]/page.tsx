'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate, getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    if (!params.id) return;
    api.getMember(params.id as string)
      .then(function(r) { if (r.success) setMember(r.data); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Loading member...</p></div>;
  if (!member) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-400">Member not found</p></div>;

  var stats = member.stats || {};

  return (
    <div>
      {/* Back button */}
      <button onClick={function() { router.push('/dashboard/members'); }} className="mb-4 text-sm text-brand-600 hover:text-brand-700">&larr; Back to members</button>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className={'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold ' + getAvatarColor(member.firstName + member.lastName)}>
          {getInitials(member.firstName, member.lastName)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{member.firstName} {member.lastName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + getStatusColor(member.status)}>{member.status.replace('_', ' ')}</span>
            {member.family && <span className="text-sm text-gray-500">{member.family.name}</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact info */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact information</h2>
          <div className="space-y-3">
            {member.phone && <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{member.phone}</p></div>}
            {member.altPhone && <div><p className="text-xs text-gray-500">Alt phone</p><p className="text-sm font-medium text-gray-900">{member.altPhone}</p></div>}
            {member.email && <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{member.email}</p></div>}
            {member.address && <div><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium text-gray-900">{member.address}</p></div>}
            {member.city && <div><p className="text-xs text-gray-500">City</p><p className="text-sm font-medium text-gray-900">{member.city}{member.state ? ', ' + member.state : ''}{member.country ? ', ' + member.country : ''}</p></div>}
          </div>
          {member.phone && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <a href={'tel:' + member.phone} className="flex-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 text-center hover:bg-blue-100">Call</a>
              <a href={'sms:' + member.phone} className="flex-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 text-center hover:bg-amber-100">SMS</a>
              <a href={'https://wa.me/' + member.phone.replace(/[^0-9]/g, '')} target="_blank" className="flex-1 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 text-center hover:bg-green-100">WhatsApp</a>
            </div>
          )}
        </div>

        {/* Personal info */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Personal details</h2>
          <div className="space-y-3">
            {member.gender && <div><p className="text-xs text-gray-500">Gender</p><p className="text-sm font-medium text-gray-900">{member.gender}</p></div>}
            {member.dateOfBirth && <div><p className="text-xs text-gray-500">Date of birth</p><p className="text-sm font-medium text-gray-900">{formatDate(member.dateOfBirth)}</p></div>}
            {member.maritalStatus && <div><p className="text-xs text-gray-500">Marital status</p><p className="text-sm font-medium text-gray-900">{member.maritalStatus}</p></div>}
            {member.joinedDate && <div><p className="text-xs text-gray-500">Joined</p><p className="text-sm font-medium text-gray-900">{formatDate(member.joinedDate)}</p></div>}
            {member.salvationDate && <div><p className="text-xs text-gray-500">Salvation date</p><p className="text-sm font-medium text-gray-900">{formatDate(member.salvationDate)}</p></div>}
            {member.baptismDate && <div><p className="text-xs text-gray-500">Baptism date</p><p className="text-sm font-medium text-gray-900">{formatDate(member.baptismDate)}</p></div>}
            {member.weddingAnniversary && <div><p className="text-xs text-gray-500">Wedding anniversary</p><p className="text-sm font-medium text-gray-900">{formatDate(member.weddingAnniversary)}</p></div>}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Activity summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Total attendance</p><p className="text-xl font-semibold text-gray-900">{stats.totalAttendance || 0}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">YTD giving</p><p className="text-xl font-semibold text-gray-900">{formatCurrency(Number(stats.ytdGiving) || 0)}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Giving count</p><p className="text-xl font-semibold text-gray-900">{stats.ytdGivingCount || 0}</p></div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Last seen</p><p className="text-sm font-semibold text-gray-900">{stats.lastAttendance ? formatDate(stats.lastAttendance.date) : 'Never'}</p></div>
          </div>
        </div>
      </div>

      {/* Groups */}
      {member.groups && member.groups.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Groups & ministries</h2>
          <div className="flex flex-wrap gap-2">
            {member.groups.map(function(g: any) {
              return <span key={g.id} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">{g.name} ({g.type.toLowerCase()})</span>;
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {member.notes && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Notes</h2>
          <p className="text-sm text-gray-600">{member.notes}</p>
        </div>
      )}
    </div>
  );
}
