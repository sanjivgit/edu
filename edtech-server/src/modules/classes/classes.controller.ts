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
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  UpdateClassDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateAcademicYearDto,
  PromoteStudentsDto,
  AutoPromoteDto,
} from './dto/class.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('classes')
@Controller()
@ApiBearerAuth()
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get('classes')
  findAll(@Query() query: PaginationDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.classesService.findAll(query, tenantId);
  }

  @Get('classes/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get('classes/:id/students')
  students(@Param('id') id: string, @Query('section') section?: string) {
    return this.classesService.students(id, section);
  }

  @Post('classes')
  @Roles(UserRole.superadmin, UserRole.admin)
  create(@Body() dto: CreateClassDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.classesService.create(dto, tenantId);
  }

  @Put('classes/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Delete('classes/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Post('sections')
  @Roles(UserRole.superadmin, UserRole.admin)
  createSection(@Body() dto: CreateSectionDto) {
    return this.classesService.createSection(dto);
  }

  @Put('sections/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.classesService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  removeSection(@Param('id') id: string) {
    return this.classesService.removeSection(id);
  }

  @Get('academic-years')
  academicYears(@CurrentUser('tenantId') tenantId?: string) {
    return this.classesService.findAcademicYears(tenantId);
  }

  @Post('academic-years')
  @Roles(UserRole.superadmin, UserRole.admin)
  createAcademicYear(@Body() dto: CreateAcademicYearDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.classesService.createAcademicYear(dto, tenantId);
  }

  @Post('classes/promote')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  promote(@Body() dto: PromoteStudentsDto) {
    return this.classesService.promoteStudents(dto);
  }

  @Post('classes/promote/auto/preview')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  autoPreview(@Body() dto: AutoPromoteDto) {
    return this.classesService.previewAutoPromotion(dto);
  }

  @Post('classes/promote/auto')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  autoPromote(@Body() dto: AutoPromoteDto) {
    return this.classesService.autoPromoteStudents(dto);
  }

  @Get('promotions')
  promotions() {
    return this.classesService.findPromotions();
  }

  @Get('promotions/student/:id')
  studentPromotions(@Param('id') id: string) {
    return this.classesService.findStudentPromotionHistory(id);
  }
}
