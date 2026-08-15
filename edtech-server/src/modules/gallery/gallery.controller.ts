import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import { GalleryService } from './gallery.service';
import { CreateAlbumDto, UpdateAlbumDto, AddMediaDto } from './dto/gallery.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const mediaStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${uuidv4()}${extname(file.originalname)}`),
});

@ApiTags('gallery')
@Controller('gallery')
@ApiBearerAuth()
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get('albums')
  albums(@Query() query: PaginationDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.galleryService.findAlbums(query, tenantId);
  }

  @Get('albums/:id')
  album(@Param('id') id: string) {
    return this.galleryService.findAlbum(id);
  }

  @Get('albums/:id/photos')
  photos(@Param('id') id: string) {
    return this.galleryService.getMedia(id);
  }

  @Post('albums')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  createAlbum(
    @Body() dto: CreateAlbumDto,
    @CurrentUser('tenantId') tenantId?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.galleryService.createAlbum(dto, tenantId, userId);
  }

  @Put('albums/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateAlbum(@Param('id') id: string, @Body() dto: UpdateAlbumDto) {
    return this.galleryService.updateAlbum(id, dto);
  }

  @Delete('albums/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  removeAlbum(@Param('id') id: string) {
    return this.galleryService.removeAlbum(id);
  }

  @Post('albums/:id/photos')
  @Roles(UserRole.superadmin, UserRole.admin, UserRole.teacher)
  @UseInterceptors(FilesInterceptor('files', 20, { storage: mediaStorage }))
  addPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: AddMediaDto,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    if (files?.length) {
      return this.galleryService.addMediaFiles(id, files, tenantId);
    }
    return this.galleryService.addMedia(id, dto);
  }

  @Delete('photos/:photoId')
  @Roles(UserRole.superadmin, UserRole.admin)
  removePhoto(@Param('photoId') photoId: string) {
    return this.galleryService.removeMedia(photoId);
  }
}
