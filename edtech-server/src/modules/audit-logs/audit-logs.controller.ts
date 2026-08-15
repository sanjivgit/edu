import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('audit-logs')
@Controller('audit-logs')
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.superadmin, UserRole.admin)
  findAll(@Query() query: PaginationDto & { module?: string }) {
    return this.auditLogsService.findAll(query);
  }

  @Get('export')
  @Roles(UserRole.superadmin, UserRole.admin)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  export() {
    return this.auditLogsService.exportCsv();
  }

  @Get(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
