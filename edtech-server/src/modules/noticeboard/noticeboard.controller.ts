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
import { NoticeboardService } from './noticeboard.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('noticeboard')
@Controller('notices')
@ApiBearerAuth()
export class NoticeboardController {
  constructor(private noticeboardService: NoticeboardService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.noticeboardService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticeboardService.findOne(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  create(@Body() dto: CreateNoticeDto, @CurrentUser('id') userId: string) {
    return this.noticeboardService.create(dto, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticeboardService.update(id, dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.superadmin, UserRole.admin)
  publish(@Param('id') id: string) {
    return this.noticeboardService.publish(id);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.noticeboardService.remove(id);
  }
}
