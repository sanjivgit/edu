import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, CreateExamResultsDto } from './dto/exam.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('exams')
@Controller('exams')
@ApiBearerAuth()
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.examsService.findAll(query);
  }

  @Get('schedule/:classId')
  schedule(@Param('classId') classId: string) {
    return this.examsService.findByClass(classId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Get(':id/results')
  results(@Param('id') id: string) {
    return this.examsService.getResults(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  create(@Body() dto: CreateExamDto, @CurrentUser('id') userId: string) {
    return this.examsService.create(dto, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.superadmin, UserRole.admin)
  publish(@Param('id') id: string) {
    return this.examsService.publish(id);
  }

  @Post(':id/results')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  saveResults(@Param('id') id: string, @Body() dto: CreateExamResultsDto) {
    return this.examsService.saveResults(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
