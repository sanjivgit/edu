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
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto, UpdateAssessmentDto, CreateAssessmentResultsDto } from './dto/assessment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('assessments')
@Controller('assessments')
@ApiBearerAuth()
export class AssessmentsController {
  constructor(private assessmentsService: AssessmentsService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.assessmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentsService.findOne(id);
  }

  @Get(':id/results')
  results(@Param('id') id: string) {
    return this.assessmentsService.getResults(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  create(@Body() dto: CreateAssessmentDto, @CurrentUser('id') userId: string) {
    return this.assessmentsService.create(dto, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateAssessmentDto) {
    return this.assessmentsService.update(id, dto);
  }

  @Post(':id/results')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  saveResults(@Param('id') id: string, @Body() dto: CreateAssessmentResultsDto) {
    return this.assessmentsService.saveResults(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.assessmentsService.remove(id);
  }
}
