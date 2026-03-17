import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GivingService } from './giving.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { RecordGivingDto, ListGivingQueryDto, GivingReportQueryDto } from './giving.dto';

@ApiTags('Giving')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('giving')
export class GivingController {
  constructor(private givingService: GivingService) {}

  @Post()
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Record a giving entry (tithe, offering, etc.)' })
  async record(@CurrentTenant() tenant: any, @Body() dto: RecordGivingDto) {
    const data = await this.givingService.record(tenant.id, dto);
    return { success: true, data };
  }

  @Get()
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'List giving records (paginated)' })
  async findAll(@CurrentTenant() tenant: any, @Query() query: ListGivingQueryDto) {
    const result = await this.givingService.findAll(tenant.id, query);
    return { success: true, ...result };
  }

  @Get('summary')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get giving summary for dashboard' })
  async getSummary(@CurrentTenant() tenant: any) {
    const data = await this.givingService.getSummary(tenant.id);
    return { success: true, data };
  }

  @Get('reports')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get giving report for a date range' })
  async getReport(@CurrentTenant() tenant: any, @Query() query: GivingReportQueryDto) {
    const data = await this.givingService.getReport(tenant.id, query);
    return { success: true, data };
  }

  @Get('member/:memberId/summary')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get giving summary for a specific member' })
  async getMemberSummary(
    @CurrentTenant() tenant: any,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const data = await this.givingService.getMemberSummary(tenant.id, memberId);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get a single giving record' })
  async findOne(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.givingService.findOne(tenant.id, id);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete a giving record' })
  async remove(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.givingService.remove(tenant.id, id);
    return { success: true, data };
  }
}
