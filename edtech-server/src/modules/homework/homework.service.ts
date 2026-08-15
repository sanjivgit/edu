import { Injectable, NotFoundException } from '@nestjs/common';
import { HomeworkStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHomeworkDto, UpdateHomeworkDto, CreateSubmissionDto } from './dto/homework.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, role?: string, userId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.HomeworkWhereInput = query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.homework.count({ where }),
      this.prisma.homework.findMany({
        where,
        include: {
          subject: true,
          author: { select: { id: true, name: true } },
          class_: true,
          _count: { select: { submissions: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { dueDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        classId: h.classId,
        className: h.class_?.name,
        section: h.section,
        subject: h.subject?.name ?? '',
        subjectId: h.subjectId,
        assignedDate: h.assignedDate,
        dueDate: h.dueDate,
        status: h.status,
        attachments: h.attachments,
        author: h.author,
        submissionCount: h._count.submissions,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        subject: true,
        author: { select: { id: true, name: true } },
        class_: true,
        submissions: { include: { student: true }, orderBy: { submittedAt: 'desc' } },
      },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    return homework;
  }

  async create(dto: CreateHomeworkDto, userId: string) {
    return this.prisma.homework.create({
      data: {
        title: dto.title,
        description: dto.description,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        assignedDate: new Date(dto.assignedDate),
        dueDate: new Date(dto.dueDate),
        status: dto.status ?? HomeworkStatus.assigned,
        attachments: dto.attachments ? (dto.attachments as any) : [],
        authorId: userId,
      },
    });
  }

  async update(id: string, dto: UpdateHomeworkDto) {
    await this.findOne(id);
    return this.prisma.homework.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        assignedDate: dto.assignedDate ? new Date(dto.assignedDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        attachments: dto.attachments ? (dto.attachments as any) : undefined,
      },
    });
  }

  async close(id: string) {
    await this.findOne(id);
    return this.prisma.homework.update({
      where: { id },
      data: { status: HomeworkStatus.closed },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.homework.delete({ where: { id } });
    return { message: 'Homework deleted successfully' };
  }

  async getSubmissions(homeworkId: string) {
    await this.findOne(homeworkId);
    return this.prisma.homeworkSubmission.findMany({
      where: { homeworkId },
      include: { student: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async addSubmission(homeworkId: string, dto: CreateSubmissionDto) {
    await this.findOne(homeworkId);
    const existing = await this.prisma.homeworkSubmission.findUnique({
      where: { homeworkId_studentId: { homeworkId, studentId: dto.studentId } },
    });
    if (existing) {
      return this.prisma.homeworkSubmission.update({
        where: { id: existing.id },
        data: { status: dto.status, note: dto.note, submittedAt: new Date() },
      });
    }
    return this.prisma.homeworkSubmission.create({
      data: {
        homeworkId,
        studentId: dto.studentId,
        status: dto.status ?? 'submitted',
        note: dto.note,
        submittedAt: new Date(),
      },
    });
  }
}
