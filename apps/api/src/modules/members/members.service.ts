import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { MemberStatus } from '../../types/prisma-enums';
import { CreateMemberDto, UpdateMemberDto, ListMembersQueryDto } from './members.dto';

@Injectable()
export class MembersService {
  constructor(private db: DatabaseService) {}

  // ─── List Members (paginated, filterable, searchable) ─────
  async findAll(tenantId: string, query: ListMembersQueryDto) {
    const { page = 1, limit = 25, search, status, groupId, gender, ageMin, ageMax, joinedAfter, joinedBefore, sortBy = 'lastName', sortOrder = 'asc' } = query;

    const where: any = {
      tenantId,
      isArchived: false,
    };

    // Text search
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;

    // Age filter (calculate DOB range)
    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMax) {
        const minDob = new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate());
        where.dateOfBirth = { ...(where.dateOfBirth as any), gte: minDob };
      }
      if (ageMin) {
        const maxDob = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate());
        where.dateOfBirth = { ...(where.dateOfBirth as any), lte: maxDob };
      }
    }

    if (joinedAfter) where.joinedDate = { ...(where.joinedDate as any), gte: new Date(joinedAfter) };
    if (joinedBefore) where.joinedDate = { ...(where.joinedDate as any), lte: new Date(joinedBefore) };

    // Group filter
    if (groupId) {
      where.groupMembers = { some: { groupId } };
    }

    // Validate sort field
    const allowedSortFields = ['firstName', 'lastName', 'email', 'status', 'joinedDate', 'createdAt', 'dateOfBirth'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'lastName';

    const [data, total] = await Promise.all([
      this.db.member.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
        include: {
          family: { select: { id: true, name: true } },
          groupMembers: {
            include: {
              group: { select: { id: true, name: true, type: true } },
            },
          },
        },
      }),
      this.db.member.count({ where }),
    ]);

    // Flatten groups for response
    const members = data.map((m) => ({
      ...m,
      groups: m.groupMembers.map((gm) => ({
        id: gm.group.id,
        name: gm.group.name,
        type: gm.group.type,
        role: gm.role,
      })),
      groupMembers: undefined,
    }));

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get Single Member ────────────────────────────────────
  async findOne(tenantId: string, memberId: string) {
    const member = await this.db.member.findFirst({
      where: { id: memberId, tenantId, isArchived: false },
      include: {
        family: {
          include: {
            members: {
              where: { isArchived: false },
              select: { id: true, firstName: true, lastName: true, status: true },
            },
          },
        },
        groupMembers: {
          include: {
            group: { select: { id: true, name: true, type: true } },
          },
        },
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    // Get attendance summary
    const attendanceSummary = await this.db.attendance.aggregate({
      where: { memberId, tenantId },
      _count: true,
    });

    const lastAttendance = await this.db.attendance.findFirst({
      where: { memberId, tenantId },
      orderBy: { checkedInAt: 'desc' },
      include: { event: { select: { name: true, date: true } } },
    });

    // Get giving summary (current year)
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const givingSummary = await this.db.giving.aggregate({
      where: { memberId, tenantId, date: { gte: yearStart } },
      _sum: { amount: true },
      _count: true,
    });

    return {
      ...member,
      groups: member.groupMembers.map((gm) => ({
        id: gm.group.id,
        name: gm.group.name,
        type: gm.group.type,
        role: gm.role,
      })),
      groupMembers: undefined,
      stats: {
        totalAttendance: attendanceSummary._count,
        lastAttendance: lastAttendance
          ? { date: lastAttendance.checkedInAt, event: lastAttendance.event.name }
          : null,
        ytdGiving: givingSummary._sum.amount || 0,
        ytdGivingCount: givingSummary._count,
      },
    };
  }

  // ─── Create Member ────────────────────────────────────────
  async create(tenantId: string, dto: CreateMemberDto) {
    // Check for duplicate email within tenant
    if (dto.email) {
      const existing = await this.db.member.findFirst({
        where: { tenantId, email: dto.email.toLowerCase(), isArchived: false },
      });
      if (existing) {
        throw new ConflictException('A member with this email already exists');
      }
    }

    const member = await this.db.member.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        altPhone: dto.altPhone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'Ghana',
        postalCode: dto.postalCode,
        status: dto.status || MemberStatus.VISITOR,
        salvationDate: dto.salvationDate ? new Date(dto.salvationDate) : undefined,
        baptismDate: dto.baptismDate ? new Date(dto.baptismDate) : undefined,
        joinedDate: dto.joinedDate ? new Date(dto.joinedDate) : new Date(),
        weddingAnniversary: dto.weddingAnniversary ? new Date(dto.weddingAnniversary) : undefined,
        familyId: dto.familyId,
        customFields: (dto.customFields || {}) as any,
        notes: dto.notes,
      },
      include: {
        family: { select: { id: true, name: true } },
      },
    });

    return member;
  }

  // ─── Update Member ────────────────────────────────────────
  async update(tenantId: string, memberId: string, dto: UpdateMemberDto) {
    const existing = await this.db.member.findFirst({
      where: { id: memberId, tenantId, isArchived: false },
    });
    if (!existing) throw new NotFoundException('Member not found');

    // Check email uniqueness if email is being changed
    if (dto.email && dto.email.toLowerCase() !== existing.email?.toLowerCase()) {
      const duplicate = await this.db.member.findFirst({
        where: { tenantId, email: dto.email.toLowerCase(), isArchived: false, NOT: { id: memberId } },
      });
      if (duplicate) throw new ConflictException('A member with this email already exists');
    }

    const updateData: any = { ...dto };

    // Convert date strings to Date objects
    const dateFields = ['dateOfBirth', 'salvationDate', 'baptismDate', 'joinedDate', 'weddingAnniversary'];
    for (const field of dateFields) {
      if (updateData[field]) updateData[field] = new Date(updateData[field]);
    }
    if (updateData.email) updateData.email = updateData.email.toLowerCase();

    const member = await this.db.member.update({
      where: { id: memberId },
      data: updateData,
      include: {
        family: { select: { id: true, name: true } },
        groupMembers: {
          include: { group: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    return member;
  }

  // ─── Delete (soft-delete / archive) ───────────────────────
  async remove(tenantId: string, memberId: string) {
    const existing = await this.db.member.findFirst({
      where: { id: memberId, tenantId, isArchived: false },
    });
    if (!existing) throw new NotFoundException('Member not found');

    await this.db.member.update({
      where: { id: memberId },
      data: { isArchived: true, status: MemberStatus.ARCHIVED },
    });

    return { message: 'Member archived successfully' };
  }

  // ─── Upcoming Birthdays ───────────────────────────────────
  async getUpcomingBirthdays(tenantId: string, days: number = 30) {
    // Get all members with a date of birth, then filter in JS
    // (date part comparison across year boundaries is complex in raw SQL)
    const members = await this.db.member.findMany({
      where: {
        tenantId,
        isArchived: false,
        dateOfBirth: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        photoUrl: true,
        phone: true,
        email: true,
      },
    });

    const today = new Date();
    const upcoming = members
      .map((m) => {
        const dob = m.dateOfBirth!;
        // Next birthday this year or next year
        let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (nextBirthday < today) {
          nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const age = nextBirthday.getFullYear() - dob.getFullYear();
        return { ...m, nextBirthday, daysUntil, turningAge: age };
      })
      .filter((m) => m.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming;
  }

  // ─── Member Stats (for dashboard) ─────────────────────────
  async getStats(tenantId: string) {
    const [total, byStatus, newThisMonth] = await Promise.all([
      this.db.member.count({ where: { tenantId, isArchived: false } }),
      this.db.member.groupBy({
        by: ['status'],
        where: { tenantId, isArchived: false },
        _count: true,
      }),
      this.db.member.count({
        where: {
          tenantId,
          isArchived: false,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    return {
      total,
      newThisMonth,
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ─── Get Member Attendance History ────────────────────────
  async getAttendanceHistory(tenantId: string, memberId: string, page = 1, limit = 25) {
    const member = await this.db.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const [data, total] = await Promise.all([
      this.db.attendance.findMany({
        where: { memberId, tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { checkedInAt: 'desc' },
        include: {
          event: { select: { id: true, name: true, type: true, date: true } },
        },
      }),
      this.db.attendance.count({ where: { memberId, tenantId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Get Member Giving History ────────────────────────────
  async getGivingHistory(tenantId: string, memberId: string, page = 1, limit = 25) {
    const member = await this.db.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const [data, total] = await Promise.all([
      this.db.giving.findMany({
        where: { memberId, tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.db.giving.count({ where: { memberId, tenantId } }),
    ]);

    // YTD summary
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const ytdSummary = await this.db.giving.groupBy({
      by: ['category'],
      where: { memberId, tenantId, date: { gte: yearStart } },
      _sum: { amount: true },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      ytdByCategory: ytdSummary.reduce((acc, g) => {
        acc[g.category] = Number(g._sum.amount) || 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
