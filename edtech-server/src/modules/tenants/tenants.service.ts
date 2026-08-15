import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole, SubscriptionStatus, SubscriptionPeriod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { code: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.tenant.count({ where }),
      this.prisma.tenant.findMany({
        where,
        include: {
          _count: { select: { users: true, students: true, teachers: true, classes: true } },
          subscription: { include: { plan: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((t) => this.toDto(t)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: { select: { users: true, students: true, teachers: true, classes: true } },
        subscription: { include: { plan: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return this.toDto(tenant);
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Tenant code "${dto.code}" already exists`);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        code: dto.code,
        domain: dto.domain,
        logo: dto.logo,
        theme: dto.theme ?? 'indigo',
        colorMode: dto.colorMode ?? 'light',
        primaryColor: dto.primaryColor,
        tagline: dto.tagline,
        address: dto.address,
        phone: dto.phone,
        website: dto.website,
      },
    });

    await this.prisma.settings.create({
      data: {
        tenant: { connect: { id: tenant.id } },
        institutionName: dto.name,
        shortCode: dto.code.toUpperCase(),
        registrationNo: dto.registrationNo ?? '',
        institutionType: 'school',
        contactEmail: dto.adminEmail ?? '',
        phone: dto.phone,
        website: dto.website,
        notificationPrefs: {} as any,
        systemConfig: {} as any,
      },
    });

    let generatedPassword: string | undefined;
    if (dto.adminEmail) {
      generatedPassword = randomBytes(6).toString('hex');
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      await this.prisma.user.create({
        data: {
          name: dto.adminName ?? 'Administrator',
          email: dto.adminEmail.toLowerCase().trim(),
          phone: dto.phone,
          passwordHash,
          role: UserRole.admin,
          tenantId: tenant.id,
          isEmailVerified: true,
        },
      });
    }

    await this.startTrial(tenant.id);

    return {
      tenant: this.toDto(await this.prisma.tenant.findUnique({ where: { id: tenant.id } })),
      ...(generatedPassword
        ? {
            adminLogin: {
              email: dto.adminEmail,
              password: generatedPassword,
              message: 'Share these credentials with the school admin. Change after first login.',
            },
          }
        : {}),
    };
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (dto.code && dto.code !== tenant.code) {
      const existing = await this.prisma.tenant.findUnique({ where: { code: dto.code } });
      if (existing) throw new BadRequestException(`Tenant code "${dto.code}" already exists`);
    }

    return this.toDto(
      await this.prisma.tenant.update({
        where: { id },
        data: {
          name: dto.name,
          code: dto.code,
          domain: dto.domain,
          logo: dto.logo,
          theme: dto.theme,
          colorMode: dto.colorMode,
          primaryColor: dto.primaryColor,
          tagline: dto.tagline,
          address: dto.address,
          phone: dto.phone,
          website: dto.website,
        },
      }),
    );
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Tenant deleted successfully' };
  }

  private async startTrial(tenantId: string) {
    const defaultPlan = await this.billingService.getDefaultPlan();
    const plan = defaultPlan ?? (await this.prisma.billingPlan.findFirst({ where: { status: 'active' } }));
    if (!plan) return;

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: SubscriptionStatus.trial,
        period: SubscriptionPeriod.monthly,
        pricePerPeriod: plan.priceMonthly,
        currency: plan.currency,
        startsAt: now,
        expiresAt: trialEndsAt,
        trialEndsAt,
        notes: 'Auto-started 14-day trial',
      },
    });
  }

  private toDto(t: any) {
    return {
      id: t.id,
      name: t.name,
      code: t.code,
      domain: t.domain,
      logo: t.logo,
      theme: t.theme,
      colorMode: t.colorMode,
      primaryColor: t.primaryColor,
      tagline: t.tagline,
      address: t.address,
      phone: t.phone,
      website: t.website,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      settings: t.settings,
      userCount: t._count?.users,
      studentCount: t._count?.students,
      teacherCount: t._count?.teachers,
      classCount: t._count?.classes,
      subscription: t.subscription,
    };
  }
}
