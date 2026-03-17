import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateMemberDto, UpdateMemberDto, ListMembersQueryDto, BirthdaysQueryDto } from './members.dto';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'List all members (paginated, filterable)' })
  async findAll(@CurrentTenant() tenant: any, @Query() query: ListMembersQueryDto) {
    const result = await this.membersService.findAll(tenant.id, query);
    return { success: true, ...result };
  }

  @Get('stats')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get member statistics for dashboard' })
  async getStats(@CurrentTenant() tenant: any) {
    const data = await this.membersService.getStats(tenant.id);
    return { success: true, data };
  }

  @Get('birthdays')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Get upcoming birthdays' })
  async getBirthdays(@CurrentTenant() tenant: any, @Query() query: BirthdaysQueryDto) {
    const data = await this.membersService.getUpcomingBirthdays(tenant.id, query.days);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Get a single member with full profile' })
  async findOne(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.membersService.findOne(tenant.id, id);
    return { success: true, data };
  }

  @Post()
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create a new member' })
  async create(@CurrentTenant() tenant: any, @Body() dto: CreateMemberDto) {
    const data = await this.membersService.create(tenant.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update a member' })
  async update(
    @CurrentTenant() tenant: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    const data = await this.membersService.update(tenant.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Archive a member (soft-delete)' })
  async remove(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.membersService.remove(tenant.id, id);
    return { success: true, data };
  }

  @Get(':id/attendance')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Get attendance history for a member' })
  async getAttendance(
    @CurrentTenant() tenant: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.membersService.getAttendanceHistory(tenant.id, id, page, limit);
    return { success: true, ...result };
  }

  @Get(':id/giving')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get giving history for a member' })
  async getGiving(
    @CurrentTenant() tenant: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.membersService.getGivingHistory(tenant.id, id, page, limit);
    return { success: true, ...result };
  }
}
