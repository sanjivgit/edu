import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TimetableService } from './timetable.service';
import {
  GetTimetableQueryDto,
  AssignTimetableCellDto,
  UpdateTimetableCellDto,
} from './dto/timetable.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('timetable')
@Controller('timetable')
@ApiBearerAuth()
export class TimetableController {
  constructor(private timetableService: TimetableService) {}

  @Get()
  findAll(@Query('classId') classId?: string) {
    return this.timetableService.listAll(classId);
  }

  @Get(':classId')
  findByClass(@Param('classId') classId: string, @Query() query: Omit<GetTimetableQueryDto, 'classId'>) {
    return this.timetableService.findByClass({ classId, ...query });
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin)
  assignCell(@Body() dto: AssignTimetableCellDto) {
    return this.timetableService.assignCell(dto);
  }

  @Put('cells/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateCell(@Param('id') id: string, @Body() dto: UpdateTimetableCellDto) {
    return this.timetableService.updateCell(id, dto);
  }

  @Delete('cells/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  removeCell(@Param('id') id: string) {
    return this.timetableService.removeCell(id);
  }
}
