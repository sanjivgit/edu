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
import { HomeworkService } from './homework.service';
import {
  CreateHomeworkDto,
  UpdateHomeworkDto,
  CreateSubmissionDto,
} from './dto/homework.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('homework')
@Controller('homework')
@ApiBearerAuth()
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser('role') role?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.homeworkService.findAll(query, role, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeworkService.findOne(id);
  }

  @Get(':id/submissions')
  submissions(@Param('id') id: string) {
    return this.homeworkService.getSubmissions(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  create(@Body() dto: CreateHomeworkDto, @CurrentUser('id') userId: string) {
    return this.homeworkService.create(dto, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto) {
    return this.homeworkService.update(id, dto);
  }

  @Patch(':id/close')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  close(@Param('id') id: string) {
    return this.homeworkService.close(id);
  }

  @Post(':id/submissions')
  addSubmission(@Param('id') id: string, @Body() dto: CreateSubmissionDto) {
    return this.homeworkService.addSubmission(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.homeworkService.remove(id);
  }
}
