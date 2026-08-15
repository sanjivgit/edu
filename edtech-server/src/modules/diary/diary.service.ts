import { Injectable, NotFoundException } from '@nestjs/common';
import { DiaryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, date?: string, classId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.DiaryEntryWhereInput = {
      ...(classId ? { classId } : {}),
      ...(date
        ? {
            date: {
              gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
              lt: new Date(new Date(date).setHours(24, 0, 0, 0)),
            },
          }
        : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.diaryEntry.count({ where }),
      this.prisma.diaryEntry.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          class_: { select: { id: true, name: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((d) => this.decorate(d)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } }, class_: true },
    });
    if (!entry) throw new NotFoundException('Diary entry not found');
    return this.decorate(entry);
  }

  async create(dto: CreateDiaryEntryDto, userId: string) {
    const entry = await this.prisma.diaryEntry.create({
      data: {
        date: new Date(dto.date),
        classId: dto.classId,
        section: dto.section,
        subject: dto.subject,
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility ?? 'both',
        status: dto.status ?? DiaryStatus.draft,
        tags: dto.tags ? (dto.tags as any) : [],
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return this.decorate(entry);
  }

  async update(id: string, dto: UpdateDiaryEntryDto) {
    await this.findOne(id);
    const entry = await this.prisma.diaryEntry.update({
      where: { id },
      data: {
        date: new Date(dto.date),
        classId: dto.classId,
        section: dto.section,
        subject: dto.subject,
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility,
        status: dto.status,
        tags: dto.tags ? (dto.tags as any) : undefined,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return this.decorate(entry);
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.diaryEntry.update({
      where: { id },
      data: { status: DiaryStatus.published },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.diaryEntry.delete({ where: { id } });
    return { message: 'Diary entry deleted successfully' };
  }

  private decorate(d: any) {
    return {
      id: d.id,
      date: d.date,
      classId: d.classId,
      className: d.class_?.name,
      section: d.section,
      subject: d.subject,
      title: d.title,
      content: d.content,
      visibility: d.visibility,
      status: d.status,
      tags: d.tags,
      author: d.author,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }
}
