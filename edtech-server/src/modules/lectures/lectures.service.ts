import { Injectable, NotFoundException } from '@nestjs/common';
import { LectureType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/lecture.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LecturesService {
  constructor(private prisma: PrismaService) {}

  async findLive(query: PaginationDto, tenantId?: string) {
    return this.findAll(query, LectureType.live, tenantId);
  }

  async findRecorded(query: PaginationDto, tenantId?: string) {
    return this.findAll(query, LectureType.recorded, tenantId);
  }

  async findAll(query: PaginationDto, type: LectureType, tenantId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.LectureWhereInput = {
      type,
      ...(tenantId ? { tenantId } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.lecture.count({ where }),
      this.prisma.lecture.findMany({
        where,
        include: { host: { select: { id: true, name: true } } },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        subject: l.subject,
        classId: l.classId,
        section: l.section,
        description: l.description,
        scheduledAt: l.scheduledAt,
        durationMinutes: l.durationMinutes,
        meetingUrl: l.meetingUrl,
        status: l.status,
        attachments: l.attachments,
        host: l.host,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: { host: { select: { id: true, name: true } } },
    });
    if (!lecture) throw new NotFoundException('Lecture not found');
    return lecture;
  }

  async create(dto: CreateLectureDto, tenantId?: string, hostId?: string) {
    return this.prisma.lecture.create({
      data: {
        title: dto.title,
        type: dto.type,
        subject: dto.subject,
        classId: dto.classId,
        section: dto.section,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        durationMinutes: dto.durationMinutes,
        meetingUrl: dto.meetingUrl,
        status: dto.status ?? (dto.type === 'live' ? 'scheduled' : 'published'),
        attachments: dto.attachments ? (dto.attachments as any) : [],
        hostId,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateLectureDto) {
    await this.findOne(id);
    return this.prisma.lecture.update({
      where: { id },
      data: {
        title: dto.title,
        subject: dto.subject,
        classId: dto.classId,
        section: dto.section,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        durationMinutes: dto.durationMinutes,
        meetingUrl: dto.meetingUrl,
        status: dto.status,
        attachments: dto.attachments ? (dto.attachments as any) : undefined,
      },
    });
  }

  async join(id: string, userId: string) {
    const lecture = await this.findOne(id);
    if (lecture.type === 'live' && lecture.status === 'scheduled') {
      await this.prisma.lecture.update({ where: { id }, data: { status: 'live' as any } });
    }
    return { ...lecture, joinUrl: lecture.meetingUrl };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lecture.delete({ where: { id } });
    return { message: 'Lecture deleted successfully' };
  }
}
