import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        include: { teacher: true, class_: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        category: s.category,
        weeklyPeriods: s.weeklyPeriods,
        isActive: s.isActive,
        classId: s.classId,
        className: s.class_?.name,
        teacher: s.teacher ? { id: s.teacher.id, fullName: s.teacher.fullName } : undefined,
        teacherId: s.teacherId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { teacher: true, class_: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findFirst({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Subject code ${dto.code} already exists`);
    return this.prisma.subject.create({
      data: {
        name: dto.name,
        code: dto.code,
        category: dto.category,
        weeklyPeriods: dto.weeklyPeriods ?? 4,
        classId: dto.classId,
        teacherId: dto.teacherId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        category: dto.category,
        weeklyPeriods: dto.weeklyPeriods,
        classId: dto.classId,
        teacherId: dto.teacherId,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Subject deleted successfully' };
  }
}
