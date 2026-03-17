import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto, TransferMemberDto, ListGroupsQueryDto } from './groups.dto';

@Injectable()
export class GroupsService {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: ListGroupsQueryDto) {
    const where: any = { tenantId };
    if (query.type) where.type = query.type;
    if (query.parentGroupId) where.parentGroupId = query.parentGroupId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    return this.db.group.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parentGroup: { select: { id: true, name: true } },
        _count: { select: { members: true, childGroups: true } },
      },
    });
  }

  async findOne(tenantId: string, groupId: string) {
    const group = await this.db.group.findFirst({
      where: { id: groupId, tenantId },
      include: {
        parentGroup: { select: { id: true, name: true } },
        childGroups: { select: { id: true, name: true, type: true, isActive: true }, orderBy: { name: 'asc' } },
        members: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, photoUrl: true, status: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(tenantId: string, dto: CreateGroupDto) {
    return this.db.group.create({
      data: { tenantId, ...dto },
    });
  }

  async update(tenantId: string, groupId: string, dto: UpdateGroupDto) {
    const existing = await this.db.group.findFirst({ where: { id: groupId, tenantId } });
    if (!existing) throw new NotFoundException('Group not found');
    return this.db.group.update({ where: { id: groupId }, data: dto });
  }

  async remove(tenantId: string, groupId: string) {
    const existing = await this.db.group.findFirst({ where: { id: groupId, tenantId } });
    if (!existing) throw new NotFoundException('Group not found');
    await this.db.group.update({ where: { id: groupId }, data: { isActive: false } });
    return { message: 'Group deactivated' };
  }

  async addMember(tenantId: string, groupId: string, dto: AddGroupMemberDto) {
    const group = await this.db.group.findFirst({ where: { id: groupId, tenantId } });
    if (!group) throw new NotFoundException('Group not found');

    const member = await this.db.member.findFirst({ where: { id: dto.memberId, tenantId, isArchived: false } });
    if (!member) throw new NotFoundException('Member not found');

    const existing = await this.db.groupMember.findUnique({
      where: { groupId_memberId: { groupId, memberId: dto.memberId } },
    });
    if (existing) throw new ConflictException('Member is already in this group');

    return this.db.groupMember.create({
      data: { groupId, memberId: dto.memberId, role: dto.role || 'member' },
      include: { member: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async removeMember(tenantId: string, groupId: string, memberId: string) {
    const group = await this.db.group.findFirst({ where: { id: groupId, tenantId } });
    if (!group) throw new NotFoundException('Group not found');

    const gm = await this.db.groupMember.findUnique({
      where: { groupId_memberId: { groupId, memberId } },
    });
    if (!gm) throw new NotFoundException('Member not in this group');

    await this.db.groupMember.delete({ where: { id: gm.id } });
    return { message: 'Member removed from group' };
  }

  async transferMember(tenantId: string, groupId: string, dto: TransferMemberDto) {
    // Remove from current group
    await this.removeMember(tenantId, groupId, dto.memberId);
    // Add to new group
    return this.addMember(tenantId, dto.toGroupId, { memberId: dto.memberId, role: 'member' });
  }
}
