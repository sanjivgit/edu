import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { SaveAttendanceDto, AttendanceQueryDto, RosterQueryDto } from './dto/attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attendance')
@Controller('attendance')
@ApiBearerAuth()
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('roster')
  roster(@Query() query: RosterQueryDto) {
    return this.attendanceService.getRoster(query.classId, query.section);
  }

  @Get()
  getByClassAndDate(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getByClassAndDate(query);
  }

  @Get('summary/:studentId')
  summary(@Param('studentId') studentId: string, @Query('month') month?: string) {
    return this.attendanceService.getStudentSummary(studentId, month);
  }

  @Get('report')
  report(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getReport(query.classId, query.from, query.to);
  }

  @Get('history')
  history(@Query('classId') classId?: string, @Query('section') section?: string) {
    return this.attendanceService.getHistory(classId, section);
  }

  @Get('sessions/:id')
  session(@Param('id') id: string) {
    return this.attendanceService.getSessionById(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  save(@Body() dto: SaveAttendanceDto, @CurrentUser('id') userId: string) {
    return this.attendanceService.saveSession(dto, userId);
  }
}
