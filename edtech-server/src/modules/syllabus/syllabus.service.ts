import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSyllabusDto, UpdateSyllabusDto, UpdateSyllabusProgressDto } from './dto/syllabus.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SyllabusService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, classId?: string, subjectId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.SyllabusWhereInput = {
      ...(classId ? { classId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.syllabus.count({ where }),
      this.prisma.syllabus.findMany({
        where,
        include: { subject: true, class_: true, academicYear: true },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        title: s.title,
        classId: s.classId,
        className: s.class_?.name,
        section: s.section,
        subject: s.subject?.name ?? '',
        subjectId: s.subjectId,
        term: s.term,
        description: s.description,
        attachments: s.attachments,
        progress: s.progress,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const syllabus = await this.prisma.syllabus.findUnique({
      where: { id },
      include: { subject: true, class_: true, academicYear: true },
    });
    if (!syllabus) throw new NotFoundException('Syllabus entry not found');
    return syllabus;
  }

  async create(dto: CreateSyllabusDto) {
    return this.prisma.syllabus.create({
      data: {
        title: dto.title,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        term: dto.term ?? 'final',
        description: dto.description,
        attachments: dto.attachments ? (dto.attachments as any) : [],
        progress: dto.progress ?? 0,
        status: dto.status ?? 'draft',
        academicYearId: dto.academicYearId ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateSyllabusDto) {
    await this.findOne(id);
    return this.prisma.syllabus.update({
      where: { id },
      data: {
        title: dto.title,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        term: dto.term,
        description: dto.description,
        attachments: dto.attachments ? (dto.attachments as any) : undefined,
        progress: dto.progress,
        status: dto.status,
        academicYearId: dto.academicYearId ?? undefined,
      },
    });
  }

  async updateProgress(id: string, dto: UpdateSyllabusProgressDto) {
    await this.findOne(id);
    return this.prisma.syllabus.update({
      where: { id },
      data: { progress: dto.progress },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.syllabus.delete({ where: { id } });
    return { message: 'Syllabus entry deleted successfully' };
  }
}
