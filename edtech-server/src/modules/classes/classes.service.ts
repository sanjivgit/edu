import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateClassDto,
  UpdateClassDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
  PromoteStudentsDto,
  AutoPromoteDto,
} from './dto/class.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, tenantId?: string) {
    const where: Prisma.ClassWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const classes = await this.prisma.class.findMany({
      where,
      include: {
        sections: { include: { _count: { select: { students: true } } } },
        classTeacher: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    });
    return {
      items: classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        capacity: c.capacity,
        status: c.status,
        academicYearId: c.academicYearId,
        studentCount: c._count.students,
        classTeacher: c.classTeacher
          ? { id: c.classTeacher.id, fullName: c.classTeacher.fullName }
          : undefined,
        sections: c.sections.map((s) => ({
          id: s.id,
          name: s.name,
          roomNo: s.roomNo,
          studentCount: s._count.students,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  async findOne(id: string) {
    const class_ = await this.prisma.class.findUnique({
      where: { id },
      include: {
        sections: { include: { _count: { select: { students: true } } } },
        classTeacher: true,
        academicYear: true,
        _count: { select: { students: true } },
      },
    });
    if (!class_) throw new NotFoundException('Class not found');
    return class_;
  }

  async students(id: string, section?: string) {
    const students = await this.prisma.student.findMany({
      where: {
        classId: id,
        ...(section ? { section: { name: section } } : {}),
      },
      include: { section: true },
      orderBy: { rollNo: 'asc' },
    });
    return students.map((s) => ({
      id: s.id,
      rollNo: s.rollNo,
      name: s.name,
      gender: s.gender,
      sectionName: s.section?.name,
      status: s.status,
    }));
  }

  async create(dto: CreateClassDto, tenantId?: string) {
    const existing = await this.prisma.class.findFirst({
      where: { code: dto.code },
    });
    if (existing) throw new BadRequestException(`Class code ${dto.code} already exists`);
    const class_ = await this.prisma.class.create({
      data: {
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity ?? 40,
        classTeacherId: dto.classTeacherId,
        academicYearId: dto.academicYearId,
        status: dto.status as any ?? 'active',
        tenantId,
      },
    });
    await this.prisma.section.create({
      data: { name: 'A', classId: class_.id, status: 'active' as any },
    });
    return class_;
  }

  async update(id: string, dto: UpdateClassDto) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity,
        classTeacherId: dto.classTeacherId,
        academicYearId: dto.academicYearId,
        status: dto.status as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.class.delete({ where: { id } });
    return { message: 'Class deleted successfully' };
  }

  async createSection(dto: CreateSectionDto) {
    await this.findOne(dto.classId);
    return this.prisma.section.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        roomNo: dto.roomNo,
        sectionTeacherId: dto.sectionTeacherId,
        status: 'active' as any,
      },
    });
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return this.prisma.section.update({
      where: { id },
      data: {
        name: dto.name,
        roomNo: dto.roomNo,
        sectionTeacherId: dto.sectionTeacherId,
        status: dto.status as any,
      },
    });
  }

  async removeSection(id: string) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    await this.prisma.section.delete({ where: { id } });
    return { message: 'Section deleted successfully' };
  }

  async findAcademicYears(tenantId?: string) {
    return this.prisma.academicYear.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { startDate: 'desc' },
    });
  }

  async createAcademicYear(dto: CreateAcademicYearDto, tenantId?: string) {
    return this.prisma.academicYear.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status as any ?? 'planned',
        tenantId,
      },
    });
  }

  async updateAcademicYear(id: string, dto: UpdateAcademicYearDto) {
    const existing = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Academic year not found');
    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status as any }),
      },
    });
  }

  async removeAcademicYear(id: string) {
    const existing = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Academic year not found');
    await this.prisma.academicYear.delete({ where: { id } });
    return { message: 'Academic year deleted successfully' };
  }

  private async resolveTargetSectionId(toClassId: string, section?: string) {
    if (!section) return null;
    const target = await this.prisma.section.findFirst({
      where: { classId: toClassId, name: section },
    });
    return target?.id ?? null;
  }

  async promoteStudents(dto: PromoteStudentsDto) {
    const fromClass = await this.prisma.class.findUnique({ where: { id: dto.fromClassId } });
    if (!fromClass) throw new NotFoundException('Source class not found');
    const toClass = await this.prisma.class.findUnique({ where: { id: dto.toClassId } });
    if (!toClass) throw new NotFoundException('Target class not found');

    const studentWhere: Prisma.StudentWhereInput = dto.studentIds?.length
      ? { id: { in: dto.studentIds } }
      : {};
    const students = await this.prisma.student.findMany({
      where: {
        ...studentWhere,
        classId: dto.fromClassId,
        status: 'active' as any,
        ...(dto.section ? { section: { name: dto.section } } : {}),
      },
      include: { section: { select: { id: true, name: true } } },
    });
    if (students.length === 0) {
      throw new BadRequestException('No active students found to promote');
    }

    const toSectionId = await this.resolveTargetSectionId(dto.toClassId, dto.section);

    const tx = await this.prisma.$transaction(async (prisma) => {
      const promotion = await prisma.promotion.create({
        data: {
          fromClassId: dto.fromClassId,
          toClassId: dto.toClassId,
          academicYearId: dto.academicYearId ?? toClass.academicYearId,
          mode: 'manual',
          promotedCount: students.length,
          promotedOn: new Date(),
        },
      });
      await prisma.promotionStudent.createMany({
        data: students.map((s) => ({
          promotionId: promotion.id,
          studentId: s.id,
          fromClassId: dto.fromClassId,
          toClassId: dto.toClassId,
          fromSection: s.section?.name ?? dto.section ?? '',
          toSection: dto.section ?? '',
          status: 'promoted' as any,
          passed: true,
        })),
      });
      for (const student of students) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            classId: dto.toClassId,
            ...(toSectionId ? { sectionId: toSectionId } : {}),
            currentAcademicYearId: dto.academicYearId ?? toClass.academicYearId,
          },
        });
      }
      return promotion;
    });

    return {
      message: `Promoted ${students.length} students manually`,
      mode: 'manual',
      promotionId: tx.id,
      promotedCount: students.length,
      retainedCount: 0,
      promotion: tx,
      promotedStudents: students.map((s) => ({ id: s.id, name: s.name, rollNo: s.rollNo })),
    };
  }

  private async computeAutoPromotion(dto: AutoPromoteDto) {
    const fromClass = await this.prisma.class.findUnique({ where: { id: dto.fromClassId } });
    if (!fromClass) throw new NotFoundException('Source class not found');
    const toClass = await this.prisma.class.findUnique({ where: { id: dto.toClassId } });
    if (!toClass) throw new NotFoundException('Target class not found');
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
      include: { papers: true, results: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.term !== 'final') {
      throw new BadRequestException('Automatic promotion requires a Final Term exam');
    }
    if (exam.classId !== dto.fromClassId) {
      throw new BadRequestException('The selected exam does not belong to the source class');
    }

    const passPercentage = dto.passPercentage ?? exam.passPercentage ?? 35;
    const totalPossible = exam.papers.length
      ? exam.papers.reduce((acc, p) => acc + p.totalMarks, 0)
      : 100;
    if (totalPossible <= 0) throw new BadRequestException('Exam has no marks configured');

    const students = await this.prisma.student.findMany({
      where: {
        classId: dto.fromClassId,
        status: 'active' as any,
        ...(dto.section ? { section: { name: dto.section } } : {}),
      },
      include: { section: { select: { id: true, name: true } } },
      orderBy: { rollNo: 'asc' },
    });

    const resultsByStudent = new Map(
      exam.results.map((r) => [r.studentId, Number(r.total)]),
    );

    const evaluated = students.map((s) => {
      const total = resultsByStudent.get(s.id) ?? null;
      const percentage = total === null ? 0 : (total / totalPossible) * 100;
      const passed = total !== null && percentage >= passPercentage;
      return {
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        section: s.section?.name ?? '',
        total,
        percentage: Math.round(percentage * 100) / 100,
        passed,
      };
    });

    const willPromote = evaluated.filter((e) => e.passed);
    const willRetain = evaluated.filter((e) => !e.passed);

    return { fromClass, toClass, exam, passPercentage, totalPossible, willPromote, willRetain };
  }

  async previewAutoPromotion(dto: AutoPromoteDto) {
    const { exam, passPercentage, totalPossible, willPromote, willRetain } =
      await this.computeAutoPromotion(dto);
    return {
      fromClassId: dto.fromClassId,
      toClassId: dto.toClassId,
      section: dto.section ?? '',
      examId: exam.id,
      examName: exam.name,
      passPercentage,
      totalPossible,
      willPromote,
      willRetain,
      promotedCount: willPromote.length,
      retainedCount: willRetain.length,
    };
  }

  async autoPromoteStudents(dto: AutoPromoteDto) {
    const { fromClass, toClass, exam, passPercentage, willPromote, willRetain } =
      await this.computeAutoPromotion(dto);

    if (willPromote.length === 0) {
      throw new BadRequestException('No student reached the pass percentage to be promoted');
    }

    const toSectionId = await this.resolveTargetSectionId(dto.toClassId, dto.section);

    const tx = await this.prisma.$transaction(async (prisma) => {
      const promotion = await prisma.promotion.create({
        data: {
          fromClassId: dto.fromClassId,
          toClassId: dto.toClassId,
          academicYearId: dto.academicYearId ?? toClass.academicYearId,
          mode: 'auto',
          examId: exam.id,
          passPercentage,
          promotedCount: willPromote.length,
          retainedCount: willRetain.length,
          promotedOn: new Date(),
        },
      });
      await prisma.promotionStudent.createMany({
        data: [
          ...willPromote.map((e) => ({
            promotionId: promotion.id,
            studentId: e.studentId,
            fromClassId: dto.fromClassId,
            toClassId: dto.toClassId,
            fromSection: e.section,
            toSection: dto.section ?? e.section,
            totalMarks: e.total,
            passed: true,
            status: 'promoted' as any,
          })),
          ...willRetain.map((e) => ({
            promotionId: promotion.id,
            studentId: e.studentId,
            fromClassId: dto.fromClassId,
            toClassId: null,
            fromSection: e.section,
            toSection: e.section,
            totalMarks: e.total,
            passed: false,
            status: 'retained' as any,
          })),
        ],
      });
      for (const student of willPromote) {
        await prisma.student.update({
          where: { id: student.studentId },
          data: {
            classId: dto.toClassId,
            ...(toSectionId ? { sectionId: toSectionId } : {}),
            currentAcademicYearId: dto.academicYearId ?? toClass.academicYearId,
          },
        });
      }
      return promotion;
    });

    return {
      message: `Automatically promoted ${willPromote.length} students based on ${exam.name} results`,
      mode: 'auto',
      promotionId: tx.id,
      passPercentage,
      promotedCount: willPromote.length,
      retainedCount: willRetain.length,
      retainedStudentIds: willRetain.map((e) => e.studentId),
      promotion: tx,
      promotedStudents: willPromote.map((e) => ({ id: e.studentId, name: e.name, rollNo: e.rollNo })),
      retainedStudents: willRetain.map((e) => ({ id: e.studentId, name: e.name, rollNo: e.rollNo })),
    };
  }

  async findPromotions() {
    return this.prisma.promotion.findMany({
      include: {
        fromClass: true,
        toClass: true,
        academicYear: true,
        exam: { select: { id: true, name: true, term: true } },
        students: {
          include: {
            student: {
              select: { id: true, name: true, rollNo: true, class_: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { promotedOn: 'desc' },
    });
  }

  async findStudentPromotionHistory(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const records = await this.prisma.promotionStudent.findMany({
      where: { studentId },
      include: {
        promotion: {
          include: {
            fromClass: { select: { id: true, name: true } },
            toClass: { select: { id: true, name: true } },
            academicYear: { select: { id: true, name: true } },
            exam: { select: { id: true, name: true, term: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => ({
      id: r.id,
      promotionId: r.promotionId,
      mode: r.promotion.mode,
      fromClass: r.promotion.fromClass.name,
      toClass: r.promotion.toClass.name,
      academicYear: r.promotion.academicYear.name,
      exam: r.promotion.exam ? r.promotion.exam.name : null,
      fromSection: r.fromSection,
      toSection: r.toSection,
      totalMarks: r.totalMarks,
      passed: r.passed,
      status: r.status,
      promotedOn: r.promotion.promotedOn,
    }));
  }
}
