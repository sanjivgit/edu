import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAll(query: PaginationDto, tenantId?: string, userId?: string, role?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { rollNo: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    if (role === 'student' && userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { student: { select: { id: true } } } });
      if (user?.student) {
        where.id = user.student.id;
      } else {
        return { items: [], meta: { page, limit, total: 0, totalPages: 0 } };
      }
    } else if (role === 'parent' && userId) {
      where.parentId = userId;
    }

    const [total, items] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          class_: true,
          section: true,
          parent: { select: { id: true, name: true, email: true } },
          currentAcademicYear: { select: { id: true, name: true } },
        },
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder }
          : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((s) => this.toDto(s)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMe(userId: string, role?: string) {
    if (role === 'student') {
      const student = await this.prisma.student.findFirst({
        where: { email: { not: undefined }, parent: undefined },
        include: {
          class_: true,
          section: true,
          parent: { select: { id: true, name: true, email: true, phone: true } },
          currentAcademicYear: { select: { id: true, name: true } },
        },
      });
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { student: true } });
      if (user?.student) {
        const me = await this.prisma.student.findUnique({
          where: { id: user.student.id },
          include: {
            class_: true,
            section: true,
            parent: { select: { id: true, name: true, email: true, phone: true } },
            currentAcademicYear: { select: { id: true, name: true } },
            attendanceEntries: { include: { session: true }, orderBy: { session: { date: 'desc' } }, take: 30 },
            payments: { orderBy: { paidDate: 'desc' } },
            invoices: true,
          },
        });
        if (!me) throw new NotFoundException('Student profile not found');
        return this.toDto(me);
      }
    }
    throw new NotFoundException('No student profile linked to this account');
  }

  async findParentChildren(parentId: string) {
    const children = await this.prisma.student.findMany({
      where: { parentId, status: 'active' as any },
      include: {
        class_: true,
        section: true,
        parent: { select: { id: true, name: true, email: true } },
        currentAcademicYear: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return children.map((s) => this.toDto(s));
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class_: true,
        section: true,
        parent: { select: { id: true, name: true, email: true, phone: true } },
        currentAcademicYear: { select: { id: true, name: true } },
        attendanceEntries: { include: { session: true }, orderBy: { session: { date: 'desc' } }, take: 30 },
        payments: { orderBy: { paidDate: 'desc' } },
        invoices: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.toDto(student);
  }

  async create(dto: CreateStudentDto, tenantId?: string) {
    const classId = dto.classId;
    const class_ = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!class_) throw new BadRequestException('Invalid class');

    const rollNo = dto.rollNo || `R-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await this.prisma.student.findFirst({
      where: { rollNo, classId },
    });
    if (existing) {
      throw new BadRequestException(`Student with roll number ${rollNo} already exists in this class`);
    }

    const effectiveTenantId = tenantId ?? class_.tenantId;
    await this.billingService.enforceStudentLimit(effectiveTenantId);

    const student = await this.prisma.student.create({
      data: {
        rollNo,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        avatar: dto.avatar,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        address: dto.address,
        admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
        status: dto.status,
        classId,
        sectionId: dto.sectionId,
        parentId: dto.parentId,
        currentAcademicYearId: dto.currentAcademicYearId,
        tenantId: effectiveTenantId,
      },
      include: { class_: true, section: true, parent: true, currentAcademicYear: { select: { id: true, name: true } } },
    });
    return this.toDto(student);
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);
    const student = await this.prisma.student.update({
      where: { id },
      data: {
        rollNo: dto.rollNo,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        avatar: dto.avatar,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        address: dto.address,
        admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : undefined,
        status: dto.status,
        classId: dto.classId,
        sectionId: dto.sectionId,
        parentId: dto.parentId,
        currentAcademicYearId: dto.currentAcademicYearId,
      },
      include: { class_: true, section: true, parent: true, currentAcademicYear: { select: { id: true, name: true } } },
    });
    return this.toDto(student);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }

  async approveAdmission(admissionId: string, userId: string, tenantId?: string) {
    const admission = await this.prisma.admission.findUnique({ where: { id: admissionId } });
    if (!admission) throw new NotFoundException('Admission application not found');

    const classes = await this.prisma.class.findMany({ where: { tenantId } });
    const targetClass = classes.find((c) => c.name === admission.classApplyingFor) ?? classes[0];
    if (!targetClass) throw new BadRequestException('No matching class found for admission');

    const sections = await this.prisma.section.findMany({
      where: { classId: targetClass.id },
    });
    const section = sections.find((s) => s.name === admission.sectionPreference) ?? sections[0];

    await this.billingService.enforceStudentLimit(tenantId as string);

    const fullName = `${admission.firstName} ${admission.lastName}`.trim();
    const student = await this.prisma.student.create({
      data: {
        rollNo: `R-${Math.floor(1000 + Math.random() * 9000)}`,
        name: fullName,
        email: admission.parentEmail,
        phone: admission.parentPhone,
        dob: admission.dateOfBirth,
        gender: admission.gender,
        address: `${admission.addressLine1}${admission.addressLine2 ? ', ' + admission.addressLine2 : ''}, ${admission.city}, ${admission.state}, ${admission.country} - ${admission.pincode}`,
        admissionDate: new Date(),
        status: StudentStatus.active,
        classId: targetClass.id,
        sectionId: section?.id,
        currentAcademicYearId: targetClass.academicYearId,
        tenantId,
      },
    });

    await this.prisma.admission.update({
      where: { id: admissionId },
      data: { status: 'approved', approvedDate: new Date(), reviewedBy: userId },
    });

    return { message: 'Admission approved and student enrolled', student };
  }

  async rejectAdmission(admissionId: string, userId: string) {
    const admission = await this.prisma.admission.findUnique({ where: { id: admissionId } });
    if (!admission) throw new NotFoundException('Admission application not found');
    await this.prisma.admission.update({
      where: { id: admissionId },
      data: { status: 'rejected', approvedDate: new Date(), reviewedBy: userId },
    });
    return { message: 'Admission application rejected' };
  }

  private toDto(s: any) {
    return {
      id: s.id,
      rollNo: s.rollNo,
      name: s.name,
      email: s.email,
      phone: s.phone,
      avatar: s.avatar,
      classId: s.classId,
      sectionId: s.sectionId,
      parentId: s.parentId,
      currentAcademicYearId: s.currentAcademicYearId,
      currentAcademicYearName: s.currentAcademicYear?.name,
      dob: s.dob,
      gender: s.gender,
      address: s.address,
      admissionDate: s.admissionDate,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      className: s.class_?.name,
      sectionName: s.section?.name,
      parent: s.parent
        ? { id: s.parent.id, name: s.parent.name, email: s.parent.email, phone: s.parent.phone }
        : undefined,
      attendanceEntries: s.attendanceEntries,
      payments: s.payments,
      invoices: s.invoices,
    };
  }
}
