import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

import { CreateEventDto, UpdateEventDto, ListEventsQueryDto } from './events.dto';

@Injectable()
export class EventsService {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: ListEventsQueryDto) {
    const { page = 1, limit = 25, type, from, to, groupId, isActive } = query;
    const where: any = { tenantId };

    if (type) where.type = type;
    if (groupId) where.groupId = groupId;
    if (isActive !== undefined) where.isActive = isActive;
    if (from || to) {
      where.date = {};
      if (from) (where.date as any).gte = new Date(from);
      if (to) (where.date as any).lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.db.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          group: { select: { id: true, name: true } },
          _count: { select: { attendanceRecords: true } },
        },
      }),
      this.db.event.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, eventId: string) {
    const event = await this.db.event.findFirst({
      where: { id: eventId, tenantId },
      include: {
        group: { select: { id: true, name: true } },
        _count: { select: { attendanceRecords: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(tenantId: string, dto: CreateEventDto) {
    return this.db.event.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        recurrence: dto.recurrence || 'NONE',
        recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : undefined,
        location: dto.location,
        groupId: dto.groupId,
      },
    });
  }

  async update(tenantId: string, eventId: string, dto: UpdateEventDto) {
    const existing = await this.db.event.findFirst({ where: { id: eventId, tenantId } });
    if (!existing) throw new NotFoundException('Event not found');

    const updateData: any = { ...dto };
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.recurrenceEndDate) updateData.recurrenceEndDate = new Date(updateData.recurrenceEndDate);

    return this.db.event.update({ where: { id: eventId }, data: updateData });
  }

  async remove(tenantId: string, eventId: string) {
    const existing = await this.db.event.findFirst({ where: { id: eventId, tenantId } });
    if (!existing) throw new NotFoundException('Event not found');
    await this.db.event.update({ where: { id: eventId }, data: { isActive: false } });
    return { message: 'Event deactivated' };
  }
}
