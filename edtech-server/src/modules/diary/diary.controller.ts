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
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('diary')
@Controller('diary')
@ApiBearerAuth()
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('date') date?: string,
    @Query('classId') classId?: string,
  ) {
    return this.diaryService.findAll(query, date, classId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diaryService.findOne(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  create(@Body() dto: CreateDiaryEntryDto, @CurrentUser('id') userId: string) {
    return this.diaryService.create(dto, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateDiaryEntryDto) {
    return this.diaryService.update(id, dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  publish(@Param('id') id: string) {
    return this.diaryService.publish(id);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.diaryService.remove(id);
  }
}
