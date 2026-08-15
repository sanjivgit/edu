import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAll(query: PaginationDto, tenantId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { employeeCode: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.teacher.count({ where }),
      this.prisma.teacher.findMany({
        where,
        include: { classTeacherOf: { select: { id: true, name: true } } },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        employeeCode: t.employeeCode,
        subject: t.subject,
        phone: t.phone,
        email: t.email,
        status: t.status,
        classTeacherOf: t.classTeacherOf,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { classTeacherOf: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async create(dto: CreateTeacherDto, tenantId?: string) {
    const existing = await this.prisma.teacher.findFirst({
      where: {
        OR: [{ employeeCode: dto.employeeCode }, { email: dto.email }],
      },
    });
    if (existing) throw new BadRequestException('Employee code or email already exists');

    await this.billingService.enforceTeacherLimit(tenantId as string);

    return this.prisma.teacher.create({
      data: {
        fullName: dto.fullName,
        employeeCode: dto.employeeCode,
        subject: dto.subject,
        phone: dto.phone,
        email: dto.email,
        status: dto.status as any ?? 'active',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        employeeCode: dto.employeeCode,
        subject: dto.subject,
        phone: dto.phone,
        email: dto.email,
        status: dto.status as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.teacher.delete({ where: { id } });
    return { message: 'Teacher deleted successfully' };
  }
}
