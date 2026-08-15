import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CreateAlbumDto, UpdateAlbumDto, AddMediaDto } from './dto/gallery.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAlbums(query: PaginationDto, tenantId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.GalleryAlbumWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.galleryAlbum.count({ where }),
      this.prisma.galleryAlbum.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { media: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        date: a.date,
        visibility: a.visibility,
        coverUrl: a.coverUrl,
        mediaCount: a._count.media,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAlbum(id: string) {
    const album = await this.prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        media: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async createAlbum(dto: CreateAlbumDto, tenantId?: string, userId?: string) {
    return this.prisma.galleryAlbum.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        visibility: dto.visibility ?? 'public',
        coverUrl: dto.coverUrl,
        tenantId,
        createdById: userId,
      },
    });
  }

  async updateAlbum(id: string, dto: UpdateAlbumDto) {
    await this.findAlbum(id);
    return this.prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        visibility: dto.visibility,
        coverUrl: dto.coverUrl,
      },
    });
  }

  async removeAlbum(id: string) {
    await this.findAlbum(id);
    await this.prisma.galleryAlbum.delete({ where: { id } });
    return { message: 'Album deleted successfully' };
  }

  async getMedia(albumId: string) {
    await this.findAlbum(albumId);
    return this.prisma.galleryMedia.findMany({
      where: { albumId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addMedia(albumId: string, dto: AddMediaDto) {
    await this.findAlbum(albumId);
    return this.prisma.galleryMedia.create({
      data: {
        albumId,
        type: dto.type,
        url: dto.url,
        caption: dto.caption,
      },
    });
  }

  async addMediaFiles(albumId: string, files: Express.Multer.File[], tenantId?: string) {
    await this.findAlbum(albumId);
    if (tenantId && files?.length) {
      const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      await this.billingService.checkStorage(tenantId, totalBytes);
    }
    const created = [];
    for (const file of files) {
      const type = file.mimetype.startsWith('video') ? 'video' : 'image';
      created.push(
        await this.prisma.galleryMedia.create({
          data: { albumId, type: type as any, url: `/uploads/${file.filename}`, caption: '' },
        }),
      );
      if (tenantId) await this.billingService.addStorage(tenantId, file.size);
    }
    return { message: `${created.length} media uploaded`, media: created };
  }

  async removeMedia(photoId: string) {
    const media = await this.prisma.galleryMedia.findUnique({ where: { id: photoId } });
    if (!media) throw new NotFoundException('Media not found');
    await this.prisma.galleryMedia.delete({ where: { id: photoId } });
    return { message: 'Media removed successfully' };
  }
}
