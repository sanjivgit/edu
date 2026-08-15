import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import { LecturesService } from './lectures.service';
import { BillingService } from '../billing/billing.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/lecture.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const videoStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, `lecture-${Date.now()}-${uuidv4()}${extname(file.originalname)}`),
});

@ApiTags('lectures')
@Controller('lectures')
@ApiBearerAuth()
export class LecturesController {
  constructor(
    private lecturesService: LecturesService,
    private billingService: BillingService,
  ) {}

  @Get('live')
  live(@Query() query: PaginationDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.lecturesService.findLive(query, tenantId);
  }

  @Get('recorded')
  recorded(@Query() query: PaginationDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.lecturesService.findRecorded(query, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lecturesService.findOne(id);
  }

  @Post('live')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  createLive(
    @Body() dto: CreateLectureDto,
    @CurrentUser('tenantId') tenantId?: string,
    @CurrentUser('id') hostId?: string,
  ) {
    return this.lecturesService.create({ ...dto, type: 'live' as any }, tenantId, hostId);
  }

  @Post('recorded')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: videoStorage,
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async createRecorded(
    @Body() dto: CreateLectureDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('tenantId') tenantId?: string,
    @CurrentUser('id') hostId?: string,
  ) {
    const attachments = dto.attachments ?? [];
    if (file) {
      if (tenantId) {
        await this.billingService.checkStorage(tenantId, file.size);
      }
      attachments.push({ name: file.originalname, url: `/uploads/${file.filename}` });
    }
    const lecture = await this.lecturesService.create(
      { ...dto, type: 'recorded' as any, attachments },
      tenantId,
      hostId,
    );
    if (file && tenantId) {
      await this.billingService.addStorage(tenantId, file.size);
    }
    return lecture;
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.lecturesService.join(id, userId);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  update(@Param('id') id: string, @Body() dto: UpdateLectureDto) {
    return this.lecturesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.lecturesService.remove(id);
  }
}
