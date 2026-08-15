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
import { SyllabusService } from './syllabus.service';
import { CreateSyllabusDto, UpdateSyllabusDto, UpdateSyllabusProgressDto } from './dto/syllabus.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('syllabus')
@Controller('syllabus')
@ApiBearerAuth()
export class SyllabusController {
  constructor(private syllabusService: SyllabusService) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.syllabusService.findAll(query, classId, subjectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syllabusService.findOne(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin)
  create(@Body() dto: CreateSyllabusDto) {
    return this.syllabusService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateSyllabusDto) {
    return this.syllabusService.update(id, dto);
  }

  @Patch(':id/progress')
  updateProgress(@Param('id') id: string, @Body() dto: UpdateSyllabusProgressDto) {
    return this.syllabusService.updateProgress(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.syllabusService.remove(id);
  }
}
