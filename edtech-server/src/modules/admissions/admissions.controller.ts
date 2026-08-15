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
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto, UpdateAdmissionDto, AdmissionStatusDto } from './dto/admission.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('admissions')
@Controller('admissions')
@ApiBearerAuth()
export class AdmissionsController {
  constructor(private admissionsService: AdmissionsService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.admissionsService.findAll(query);
  }

  @Get('stats')
  stats() {
    return this.admissionsService.stats();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateAdmissionDto) {
    return this.admissionsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateAdmissionDto) {
    return this.admissionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.admissionsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateStatus(@Param('id') id: string, @Body() dto: AdmissionStatusDto) {
    return this.admissionsService.updateStatus(id, dto);
  }
}
