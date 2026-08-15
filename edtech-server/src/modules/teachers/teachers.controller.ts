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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('teachers')
@Controller('teachers')
@ApiBearerAuth()
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.teachersService.findAll(query, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin)
  create(@Body() dto: CreateTeacherDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.teachersService.create(dto, tenantId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
