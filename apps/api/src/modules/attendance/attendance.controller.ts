import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CheckInDto, BatchCheckInDto, AttendanceReportQueryDto, AbsenteesQueryDto } from './attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Check in a single member to an event' })
  async checkIn(@CurrentTenant() tenant: any, @Body() dto: CheckInDto) {
    const data = await this.attendanceService.checkIn(tenant.id, dto);
    return { success: true, data };
  }

  @Post('batch-check-in')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Batch check-in multiple members' })
  async batchCheckIn(@CurrentTenant() tenant: any, @Body() dto: BatchCheckInDto) {
    const data = await this.attendanceService.batchCheckIn(tenant.id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Remove a check-in (undo)' })
  async removeCheckIn(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.attendanceService.removeCheckIn(tenant.id, id);
    return { success: true, data };
  }

  @Get('events/:eventId')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Get attendance list for an event' })
  async getEventAttendance(
    @CurrentTenant() tenant: any,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    const data = await this.attendanceService.getEventAttendance(tenant.id, eventId);
    return { success: true, data };
  }

  @Get('reports')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get attendance report' })
  async getReport(@CurrentTenant() tenant: any, @Query() query: AttendanceReportQueryDto) {
    const data = await this.attendanceService.getReport(tenant.id, query);
    return { success: true, data };
  }

  @Get('absentees')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'Get members who missed recent services' })
  async getAbsentees(@CurrentTenant() tenant: any, @Query() query: AbsenteesQueryDto) {
    const data = await this.attendanceService.getAbsentees(tenant.id, query);
    return { success: true, data };
  }

  @Get('stats')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get attendance stats for dashboard' })
  async getStats(@CurrentTenant() tenant: any) {
    const data = await this.attendanceService.getStats(tenant.id);
    return { success: true, data };
  }
}
