import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto, CreateExamResultsDto } from './dto/exam.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ExamWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        where,
        include: {
          class_: true,
          author: { select: { id: true, name: true } },
          papers: true,
          academicYear: true,
          _count: { select: { results: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((e) => ({
        id: e.id,
        name: e.name,
        term: e.term,
        classId: e.classId,
        className: e.class_?.name,
        section: e.section,
        status: e.status,
        notes: e.notes,
        papers: e.papers,
        resultCount: e._count.results,
        author: e.author,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        class_: true,
        author: { select: { id: true, name: true } },
        papers: true,
        academicYear: true,
        results: { include: { student: true }, orderBy: { student: { rollNo: 'asc' } } },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async findByClass(classId: string) {
    return this.prisma.exam.findMany({
      where: { classId },
      include: { papers: true, results: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateExamDto, userId: string) {
    return this.prisma.exam.create({
      data: {
        name: dto.name,
        term: dto.term,
        classId: dto.classId,
        section: dto.section,
        status: dto.status ?? ExamStatus.draft,
        notes: dto.notes,
        passPercentage: dto.passPercentage,
        authorId: userId,
        academicYearId: dto.academicYearId ?? undefined,
        papers: {
          create: dto.papers.map((p) => ({
            subjectId: p.subjectId,
            subjectName: p.subjectName,
            date: new Date(p.date),
            startTime: p.startTime,
            durationMinutes: p.durationMinutes,
            totalMarks: p.totalMarks,
          })),
        },
      },
      include: { papers: true },
    });
  }

  async update(id: string, dto: UpdateExamDto) {
    await this.findOne(id);
    await this.prisma.examPaper.deleteMany({ where: { examId: id } });
    return this.prisma.exam.update({
      where: { id },
      data: {
        name: dto.name,
        term: dto.term,
        classId: dto.classId,
        section: dto.section,
        status: dto.status,
        notes: dto.notes,
        passPercentage: dto.passPercentage,
        academicYearId: dto.academicYearId ?? undefined,
        papers: {
          create: dto.papers.map((p) => ({
            subjectId: p.subjectId,
            subjectName: p.subjectName,
            date: new Date(p.date),
            startTime: p.startTime,
            durationMinutes: p.durationMinutes,
            totalMarks: p.totalMarks,
          })),
        },
      },
      include: { papers: true },
    });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.exam.update({
      where: { id },
      data: { status: ExamStatus.scheduled },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.exam.delete({ where: { id } });
    return { message: 'Exam deleted successfully' };
  }

  async getResults(id: string) {
    await this.findOne(id);
    const results = await this.prisma.examResult.findMany({
      where: { examId: id },
      include: { student: { select: { id: true, name: true, rollNo: true } } },
      orderBy: { student: { rollNo: 'asc' } },
    });
    return results.map((r) => ({
      id: r.id,
      examId: r.examId,
      studentId: r.studentId,
      student: r.student.name,
      rollNo: r.student.rollNo,
      total: r.total,
      grade: r.grade,
    }));
  }

  async saveResults(id: string, dto: CreateExamResultsDto) {
    await this.findOne(id);
    const saved = [];
    for (const r of dto.results) {
      const existing = await this.prisma.examResult.findUnique({
        where: { examId_studentId: { examId: id, studentId: r.studentId } },
      });
      if (existing) {
        saved.push(
          await this.prisma.examResult.update({
            where: { id: existing.id },
            data: { total: r.total, grade: r.grade },
          }),
        );
      } else {
        saved.push(
          await this.prisma.examResult.create({
            data: { examId: id, studentId: r.studentId, total: r.total, grade: r.grade },
          }),
        );
      }
    }
    return { message: `${saved.length} results saved`, results: saved };
  }
}
