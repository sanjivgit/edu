import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  stats(
    @Query('role') role: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    const effectiveRole = role ?? 'admin';
    return this.dashboardService.getStats(effectiveRole, userId, tenantId);
  }

  @Get('enrollment-trend')
  enrollmentTrend(@Query('year') year?: number) {
    return this.dashboardService.getEnrollmentTrend(year ? Number(year) : undefined);
  }

  @Get('attendance-summary')
  attendanceSummary(@Query('classId') classId?: string) {
    return this.dashboardService.getAttendanceSummary(classId);
  }

  @Get('recent-activity')
  recentActivity(@CurrentUser('tenantId') tenantId?: string) {
    return this.dashboardService.getRecentActivity(tenantId);
  }
}
