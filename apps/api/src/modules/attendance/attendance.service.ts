import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { EventType } from '../../types/prisma-enums';
import { CheckInDto, BatchCheckInDto, AttendanceReportQueryDto, AbsenteesQueryDto } from './attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private db: DatabaseService) {}

  // ─── Single Check-in ──────────────────────────────────────
  async checkIn(tenantId: string, dto: CheckInDto) {
    // Verify event
    const event = await this.db.event.findFirst({ where: { id: dto.eventId, tenantId } });
    if (!event) throw new NotFoundException('Event not found');

    // Verify member
    const member = await this.db.member.findFirst({ where: { id: dto.memberId, tenantId, isArchived: false } });
    if (!member) throw new NotFoundException('Member not found');

    // Check for duplicate
    const existing = await this.db.attendance.findUnique({
      where: { eventId_memberId: { eventId: dto.eventId, memberId: dto.memberId } },
    });
    if (existing) throw new ConflictException('Member is already checked in for this event');

    return this.db.attendance.create({
      data: {
        tenantId,
        eventId: dto.eventId,
        memberId: dto.memberId,
        checkInMethod: dto.checkInMethod || 'MANUAL',
        isFirstTime: dto.isFirstTime || false,
        notes: dto.notes,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        event: { select: { id: true, name: true, date: true } },
      },
    });
  }

  // ─── Batch Check-in ───────────────────────────────────────
  async batchCheckIn(tenantId: string, dto: BatchCheckInDto) {
    const event = await this.db.event.findFirst({ where: { id: dto.eventId, tenantId } });
    if (!event) throw new NotFoundException('Event not found');

    let checkedIn = 0;
    let alreadyCheckedIn = 0;
    let failed = 0;

    for (const memberId of dto.memberIds) {
      try {
        const existing = await this.db.attendance.findUnique({
          where: { eventId_memberId: { eventId: dto.eventId, memberId } },
        });
        if (existing) {
          alreadyCheckedIn++;
          continue;
        }

        await this.db.attendance.create({
          data: {
            tenantId,
            eventId: dto.eventId,
            memberId,
            checkInMethod: dto.checkInMethod || 'MANUAL',
          },
        });
        checkedIn++;
      } catch {
        failed++;
      }
    }

    return { checkedIn, alreadyCheckedIn, failed, total: dto.memberIds.length };
  }

  // ─── Remove Check-in (Undo) ─────────────────────────────
  async removeCheckIn(tenantId: string, attendanceId: string) {
    const record = await this.db.attendance.findFirst({ where: { id: attendanceId, tenantId } });
    if (!record) throw new NotFoundException('Attendance record not found');
    await this.db.attendance.delete({ where: { id: attendanceId } });
    return { message: 'Check-in removed' };
  }

  // ─── Get Event Attendance ─────────────────────────────────
  async getEventAttendance(tenantId: string, eventId: string) {
    const event = await this.db.event.findFirst({ where: { id: eventId, tenantId } });
    if (!event) throw new NotFoundException('Event not found');

    const records = await this.db.attendance.findMany({
      where: { eventId, tenantId },
      orderBy: { checkedInAt: 'asc' },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true, status: true, phone: true },
        },
      },
    });

    return {
      event: { id: event.id, name: event.name, date: event.date, type: event.type },
      totalAttendees: records.length,
      firstTimers: records.filter((r) => r.isFirstTime).length,
      records,
    };
  }

  // ─── Attendance Report ────────────────────────────────────
  async getReport(tenantId: string, query: AttendanceReportQueryDto) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const to = query.to ? new Date(query.to) : now;

    const eventWhere: any = {
      tenantId,
      date: { gte: from, lte: to },
      isActive: true,
    };
    if (query.eventType) eventWhere.type = query.eventType;
    if (query.groupId) eventWhere.groupId = query.groupId;

    const events = await this.db.event.findMany({
      where: eventWhere,
      orderBy: { date: 'asc' },
      include: { _count: { select: { attendanceRecords: true } } },
    });

    const counts = events.map((e) => e._count.attendanceRecords);
    const totalEvents = events.length;
    const avgAttendance = totalEvents > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / totalEvents) : 0;
    const peakAttendance = counts.length > 0 ? Math.max(...counts) : 0;

    // Growth rate: compare first half to second half
    const midpoint = Math.floor(totalEvents / 2);
    const firstHalf = counts.slice(0, midpoint);
    const secondHalf = counts.slice(midpoint);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const growthRate = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100 * 10) / 10 : 0;

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      averageAttendance: avgAttendance,
      totalEvents,
      peakAttendance,
      growthRate,
      byEvent: events.map((e) => ({
        eventId: e.id,
        name: e.name,
        date: e.date,
        type: e.type,
        count: e._count.attendanceRecords,
      })),
    };
  }

  // ─── Absentees (members who missed N recent services) ─────
  async getAbsentees(tenantId: string, query: AbsenteesQueryDto) {
    const missedCount = query.missedCount || 2;
    const eventType = query.eventType || EventType.SUNDAY_SERVICE;

    // Get the last N events of this type
    const recentEvents = await this.db.event.findMany({
      where: { tenantId, type: eventType, isActive: true, date: { lte: new Date() } },
      orderBy: { date: 'desc' },
      take: missedCount,
      select: { id: true, date: true, name: true },
    });

    if (recentEvents.length < missedCount) {
      return { absentees: [], message: `Not enough recent ${eventType} events to determine absentees` };
    }

    const eventIds = recentEvents.map((e) => e.id);

    // Get all active members
    const allMembers = await this.db.member.findMany({
      where: { tenantId, isArchived: false, status: { notIn: ['VISITOR', 'INACTIVE', 'ARCHIVED'] } },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true, status: true },
    });

    // Get members who attended any of these events
    const attendees = await this.db.attendance.findMany({
      where: { tenantId, eventId: { in: eventIds } },
      select: { memberId: true },
    });
    const attendeeIds = new Set(attendees.map((a) => a.memberId));

    // Members who didn't attend any of the recent events
    const absentees = allMembers.filter((m) => !attendeeIds.has(m.id));

    return {
      absentees,
      totalAbsent: absentees.length,
      totalMembers: allMembers.length,
      eventsChecked: recentEvents.map((e) => ({ name: e.name, date: e.date })),
    };
  }

  // ─── Dashboard stats ──────────────────────────────────────
  async getStats(tenantId: string) {
    const lastSunday = await this.db.event.findFirst({
      where: { tenantId, type: EventType.SUNDAY_SERVICE, date: { lte: new Date() }, isActive: true },
      orderBy: { date: 'desc' },
      include: { _count: { select: { attendanceRecords: true } } },
    });

    const previousSunday = lastSunday
      ? await this.db.event.findFirst({
          where: {
            tenantId, type: EventType.SUNDAY_SERVICE, isActive: true,
            date: { lt: lastSunday.date },
          },
          orderBy: { date: 'desc' },
          include: { _count: { select: { attendanceRecords: true } } },
        })
      : null;

    const lastCount = lastSunday?._count.attendanceRecords || 0;
    const prevCount = previousSunday?._count.attendanceRecords || 0;

    return {
      lastSunday: lastCount,
      changeFromPrevious: lastCount - prevCount,
      lastEventName: lastSunday?.name || null,
      lastEventDate: lastSunday?.date || null,
    };
  }
}
