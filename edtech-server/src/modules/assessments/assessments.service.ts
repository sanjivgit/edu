import { Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssessmentDto, UpdateAssessmentDto, CreateAssessmentResultsDto } from './dto/assessment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentWhereInput = query.search
      ? { title: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        include: {
          subject: true,
          class_: true,
          author: { select: { id: true, name: true } },
          academicYear: true,
          _count: { select: { results: true } },
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
        type: a.type,
        classId: a.classId,
        className: a.class_?.name,
        section: a.section,
        subject: a.subject?.name ?? '',
        subjectId: a.subjectId,
        totalMarks: a.totalMarks,
        date: a.date,
        instructions: a.instructions,
        status: a.status,
        resultCount: a._count.results,
        author: a.author,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: true,
        class_: true,
        author: { select: { id: true, name: true } },
        academicYear: true,
        results: { include: { student: true }, orderBy: { student: { rollNo: 'asc' } } },
      },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async create(dto: CreateAssessmentDto, userId: string) {
    return this.prisma.assessment.create({
      data: {
        title: dto.title,
        type: dto.type,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        totalMarks: dto.totalMarks,
        date: new Date(dto.date),
        instructions: dto.instructions,
        status: dto.status ?? AssessmentStatus.draft,
        authorId: userId,
        academicYearId: dto.academicYearId ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateAssessmentDto) {
    await this.findOne(id);
    return this.prisma.assessment.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        classId: dto.classId,
        section: dto.section,
        subjectId: dto.subjectId,
        totalMarks: dto.totalMarks,
        date: dto.date ? new Date(dto.date) : undefined,
        instructions: dto.instructions,
        status: dto.status,
        academicYearId: dto.academicYearId ?? undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.assessment.delete({ where: { id } });
    return { message: 'Assessment deleted successfully' };
  }

  async getResults(id: string) {
    await this.findOne(id);
    const results = await this.prisma.assessmentResult.findMany({
      where: { assessmentId: id },
      include: { student: { select: { id: true, name: true, rollNo: true } } },
      orderBy: { student: { rollNo: 'asc' } },
    });
    return results.map((r) => ({
      id: r.id,
      assessmentId: r.assessmentId,
      studentId: r.studentId,
      student: r.student.name,
      rollNo: r.student.rollNo,
      marks: r.marks,
      grade: r.grade,
      remarks: r.remarks,
    }));
  }

  async saveResults(id: string, dto: CreateAssessmentResultsDto) {
    await this.findOne(id);
    const saved = [];
    for (const r of dto.results) {
      const existing = await this.prisma.assessmentResult.findUnique({
        where: { assessmentId_studentId: { assessmentId: id, studentId: r.studentId } },
      });
      if (existing) {
        saved.push(
          await this.prisma.assessmentResult.update({
            where: { id: existing.id },
            data: { marks: r.marks, grade: r.grade, remarks: r.remarks },
          }),
        );
      } else {
        saved.push(
          await this.prisma.assessmentResult.create({
            data: {
              assessmentId: id,
              studentId: r.studentId,
              marks: r.marks,
              grade: r.grade,
              remarks: r.remarks,
            },
          }),
        );
      }
    }
    return { message: `${saved.length} results saved`, results: saved };
  }
}
