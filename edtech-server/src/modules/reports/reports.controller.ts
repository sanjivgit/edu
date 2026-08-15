import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReportsService, ReportQuery } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get(':type')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  report(@Param('type') type: string, @Query() query: ReportQuery) {
    switch (type) {
      case 'attendance':
        return this.reportsService.attendanceReport(query);
      case 'fees':
        return this.reportsService.feesReport(query);
      case 'academic':
        return this.reportsService.academicReport(query);
      default:
        return { summary: {}, trend: [], topRows: [] };
    }
  }

  @Get(':type/export')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  export(
    @Param('type') type: string,
    @Query('format') format: string,
    @Query() query: ReportQuery,
  ) {
    return this.reportsService.export(type, format ?? 'csv', query);
  }
}
