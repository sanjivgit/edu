import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdmissionDto, UpdateAdmissionDto, AdmissionStatusDto } from './dto/admission.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdmissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionWhereInput = query.search
      ? {
          OR: [
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { parentPhone: { contains: query.search } },
            { classApplyingFor: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.admission.count({ where }),
      this.prisma.admission.findMany({
        where,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder }
          : { appliedDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const admission = await this.prisma.admission.findUnique({ where: { id } });
    if (!admission) throw new NotFoundException('Admission application not found');
    return admission;
  }

  async create(dto: CreateAdmissionDto) {
    let tenantId: string | null = null;
    if (dto.tenantCode) {
      const tenant = await this.prisma.tenant.findUnique({ where: { code: dto.tenantCode } });
      if (!tenant) throw new NotFoundException('Invalid tenant code');
      tenantId = tenant.id;
    }

    const { tenantCode, ...rest } = dto;
    return this.prisma.admission.create({
      data: {
        ...rest,
        tenantId: tenantId ?? undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        appliedDate: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateAdmissionDto) {
    await this.findOne(id);
    return this.prisma.admission.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.admission.delete({ where: { id } });
    return { message: 'Admission application deleted' };
  }

  async updateStatus(id: string, dto: AdmissionStatusDto) {
    await this.findOne(id);
    const isApprove = dto.status === AdmissionStatus.approved;
    return this.prisma.admission.update({
      where: { id },
      data: {
        status: dto.status,
        approvedDate: dto.status === 'pending' ? null : new Date(),
        ...(isApprove ? { approvedDate: new Date() } : {}),
      },
    });
  }

  async stats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.admission.count(),
      this.prisma.admission.count({ where: { status: 'pending' } }),
      this.prisma.admission.count({ where: { status: 'approved' } }),
      this.prisma.admission.count({ where: { status: 'rejected' } }),
    ]);
    return { total, pending, approved, rejected };
  }
}
