import { Injectable, NotFoundException } from '@nestjs/common';
import { NoticeStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NoticeboardService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.NoticeWhereInput = query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { message: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.notice.count({ where }),
      this.prisma.notice.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          class_: { select: { id: true, name: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { publishAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((n) => this.decorate(n)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    await this.prisma.notice.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    const notice = await this.prisma.notice.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } }, class_: true },
    });
    if (!notice) throw new NotFoundException('Notice not found');
    return this.decorate(notice);
  }

  async create(dto: CreateNoticeDto, userId: string) {
    const notice = await this.prisma.notice.create({
      data: {
        title: dto.title,
        message: dto.message,
        category: dto.category,
        publishAt: new Date(dto.publishAt),
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
        scope: dto.scope ?? 'all',
        classId: dto.classId,
        section: dto.section,
        status: dto.status ?? NoticeStatus.draft,
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return this.decorate(notice);
  }

  async update(id: string, dto: UpdateNoticeDto) {
    await this.findOne(id);
    const notice = await this.prisma.notice.update({
      where: { id },
      data: {
        title: dto.title,
        message: dto.message,
        category: dto.category,
        publishAt: new Date(dto.publishAt),
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
        scope: dto.scope,
        classId: dto.classId,
        section: dto.section,
        status: dto.status,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return this.decorate(notice);
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.notice.update({
      where: { id },
      data: { status: NoticeStatus.published },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.notice.delete({ where: { id } });
    return { message: 'Notice deleted successfully' };
  }

  private decorate(n: any) {
    const audience = {
      scope: n.scope,
      classId: n.classId,
      section: n.section,
      label:
        n.scope === 'all'
          ? 'All'
          : n.scope === 'staff'
            ? 'Staff'
            : n.scope === 'parents'
              ? 'Parents'
              : `Class ${n.class_?.name ?? n.classId}${n.section ? '-' + n.section : ''}`,
    };
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category,
      publishAt: n.publishAt,
      expireAt: n.expireAt,
      status: n.status,
      views: n.views,
      author: n.author,
      audience,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    };
  }
}
