import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('overview')
  @Roles('PASTOR', 'ADMIN')
  async getOverview(@CurrentTenant() tenant: any) {
    const data = await this.reportsService.getOverviewReport(tenant.id);
    return { success: true, data };
  }

  @Get('attendance/member-rates')
  @Roles('PASTOR', 'ADMIN')
  async getMemberAttendanceRates(@CurrentTenant() tenant: any, @Query('months') months?: number) {
    const data = await this.reportsService.getMemberAttendanceRates(tenant.id, months || 3);
    return { success: true, data };
  }

  @Get('attendance/first-timer-conversions')
  @Roles('PASTOR', 'ADMIN')
  async getFirstTimerConversions(@CurrentTenant() tenant: any) {
    const data = await this.reportsService.getFirstTimerConversions(tenant.id);
    return { success: true, data };
  }

  @Get('attendance/seasonal-trends')
  @Roles('PASTOR', 'ADMIN')
  async getSeasonalTrends(@CurrentTenant() tenant: any) {
    const data = await this.reportsService.getSeasonalTrends(tenant.id);
    return { success: true, data };
  }

  @Get('attendance/service-comparison')
  @Roles('PASTOR', 'ADMIN')
  async getServiceComparison(@CurrentTenant() tenant: any) {
    const data = await this.reportsService.getServiceComparison(tenant.id);
    return { success: true, data };
  }

  @Get('giving/weekly')
  @Roles('PASTOR', 'ADMIN')
  async getWeeklyGiving(@CurrentTenant() tenant: any, @Query('weeks') weeks?: number) {
    const data = await this.reportsService.getWeeklyGivingSummary(tenant.id, weeks || 8);
    return { success: true, data };
  }

  @Get('giving/monthly')
  @Roles('PASTOR', 'ADMIN')
  async getMonthlyIncome(@CurrentTenant() tenant: any, @Query('year') year?: number) {
    const data = await this.reportsService.getMonthlyIncomeReport(tenant.id, year);
    return { success: true, data };
  }

  @Get('giving/member-statement/:memberId')
  @Roles('PASTOR', 'ADMIN')
  async getMemberStatement(@CurrentTenant() tenant: any, @Param('memberId', ParseUUIDPipe) memberId: string, @Query('year') year?: number) {
    const data = await this.reportsService.getMemberGivingStatement(tenant.id, memberId, year);
    return { success: true, data };
  }

  @Get('pledges')
  @Roles('PASTOR', 'ADMIN')
  async getPledgeReport(@CurrentTenant() tenant: any) {
    const data = await this.reportsService.getPledgeReport(tenant.id);
    return { success: true, data };
  }
}
