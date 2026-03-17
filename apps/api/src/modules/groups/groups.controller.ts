import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto, TransferMemberDto, ListGroupsQueryDto } from './groups.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async findAll(@CurrentTenant() tenant: any, @Query() query: ListGroupsQueryDto) {
    const data = await this.groupsService.findAll(tenant.id, query);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async findOne(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.groupsService.findOne(tenant.id, id);
    return { success: true, data };
  }

  @Post()
  @Roles('PASTOR', 'ADMIN')
  async create(@CurrentTenant() tenant: any, @Body() dto: CreateGroupDto) {
    const data = await this.groupsService.create(tenant.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('PASTOR', 'ADMIN')
  async update(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGroupDto) {
    const data = await this.groupsService.update(tenant.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN')
  async remove(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.groupsService.remove(tenant.id, id);
    return { success: true, data };
  }

  @Post(':id/members')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async addMember(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AddGroupMemberDto) {
    const data = await this.groupsService.addMember(tenant.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id/members/:memberId')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async removeMember(
    @CurrentTenant() tenant: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const data = await this.groupsService.removeMember(tenant.id, id, memberId);
    return { success: true, data };
  }

  @Post(':id/transfer')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async transfer(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: TransferMemberDto) {
    const data = await this.groupsService.transferMember(tenant.id, id, dto);
    return { success: true, data };
  }
}
