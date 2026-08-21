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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('students')
@Controller()
@ApiBearerAuth()
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('students/me')
  findMe(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role?: string,
  ) {
    return this.studentsService.findMe(userId, role);
  }

  @Get('students/parent/children')
  findParentChildren(@CurrentUser('id') parentId: string) {
    return this.studentsService.findParentChildren(parentId);
  }

  @Get('students')
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser('tenantId') tenantId?: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') role?: string,
  ) {
    return this.studentsService.findAll(query, tenantId, userId, role);
  }

  @Get('students/:id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post('students')
  @Roles(UserRole.superadmin, UserRole.admin)
  create(
    @Body() dto: CreateStudentDto,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.studentsService.create(dto, tenantId);
  }

  @Put('students/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete('students/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Patch('admissions/:id/approve')
  @Roles(UserRole.superadmin, UserRole.admin)
  approveAdmission(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.studentsService.approveAdmission(id, userId, tenantId);
  }

  @Patch('admissions/:id/reject')
  @Roles(UserRole.superadmin, UserRole.admin)
  rejectAdmission(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.studentsService.rejectAdmission(id, userId);
  }
}
