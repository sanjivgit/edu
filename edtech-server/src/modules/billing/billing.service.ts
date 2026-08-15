import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma, SubscriptionPeriod, SubscriptionStatus, SubscriptionInvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreateSubscriptionDto,
  ChangePlanDto,
  RenewSubscriptionDto,
  CreateSubscriptionInvoiceDto,
} from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // ── Plans ────────────────────────────────────────────────────────────────

  async findPlans(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const skip = (page - 1) * limit;
    const where: Prisma.BillingPlanWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.billingPlan.count({ where }),
      this.prisma.billingPlan.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findPlan(id: string) {
    const plan = await this.prisma.billingPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async createPlan(dto: CreatePlanDto) {
    const existing = await this.prisma.billingPlan.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Plan code "${dto.code}" already exists`);
    return this.prisma.billingPlan.create({
      data: this.normalizePlanData(dto) as Prisma.BillingPlanCreateInput,
    });
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    await this.findPlan(id);
    return this.prisma.billingPlan.update({ where: { id }, data: this.normalizePlanData(dto) });
  }

  async removePlan(id: string) {
    await this.findPlan(id);
    const usage = await this.prisma.subscription.count({ where: { planId: id } });
    if (usage > 0) {
      throw new BadRequestException('Cannot delete a plan that is in use by active subscriptions');
    }
    await this.prisma.billingPlan.delete({ where: { id } });
    return { message: 'Plan deleted successfully' };
  }

  async getDefaultPlan() {
    return this.prisma.billingPlan.findFirst({
      where: { isDefault: true, status: 'active' },
    });
  }

  private normalizePlanData(dto: Partial<CreatePlanDto>): Prisma.BillingPlanUncheckedUpdateInput {
    const data: Prisma.BillingPlanUncheckedUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priceMonthly !== undefined) data.priceMonthly = dto.priceMonthly;
    if (dto.priceYearly !== undefined) data.priceYearly = dto.priceYearly;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.studentLimit !== undefined)
      data.studentLimit = (dto.studentLimit as number) < 0 ? null : dto.studentLimit;
    if (dto.teacherLimit !== undefined)
      data.teacherLimit = (dto.teacherLimit as number) < 0 ? null : dto.teacherLimit;
    if (dto.storageMb !== undefined) data.storageMb = dto.storageMb;
    if (dto.features !== undefined) data.features = dto.features as any;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    return data;
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  async findAllSubscriptions(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const where: Prisma.SubscriptionWhereInput = {};
    if (query.search) {
      where.tenant = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    const [total, items] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, code: true, logo: true, isActive: true } },
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { tenant: true, plan: true, invoices: { orderBy: { issuedAt: 'desc' }, take: 50 } },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async getTenantSubscription(tenantId: string) {
    const [sub, usage] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      }),
      this.getUsage(tenantId),
    ]);
    return {
      subscription: sub,
      plan: sub?.plan ?? (await this.getDefaultPlan()),
      usage,
      active: this.isSubscriptionActive(sub),
    };
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const plan = await this.findPlan(dto.planId);
    const existing = await this.prisma.subscription.findUnique({ where: { tenantId: dto.tenantId } });
    if (existing) {
      throw new BadRequestException(
        'Tenant already has a subscription. Use change-plan / renew instead.',
      );
    }

    const period = dto.period ?? SubscriptionPeriod.monthly;
    const now = new Date();
    const trialDays = dto.status === SubscriptionStatus.trial ? dto.trialDays ?? 14 : 0;
    const expiresAt = this.addPeriod(now, period, trialDays > 0 ? trialDays : undefined);

    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: dto.status ?? (trialDays > 0 ? SubscriptionStatus.trial : SubscriptionStatus.active),
        period,
        pricePerPeriod: period === SubscriptionPeriod.monthly ? plan.priceMonthly : plan.priceYearly,
        currency: plan.currency,
        startsAt: now,
        expiresAt,
        trialEndsAt: trialDays > 0 ? expiresAt : null,
        notes: dto.notes,
      },
    });
    return this.findSubscription(subscription.id);
  }

  async changePlan(id: string, dto: ChangePlanDto) {
    const sub = await this.findSubscription(id);
    const plan = await this.findPlan(dto.planId);
    const period = dto.period ?? sub.period;
    return this.prisma.subscription.update({
      where: { id },
      data: {
        planId: plan.id,
        period,
        pricePerPeriod: period === SubscriptionPeriod.monthly ? plan.priceMonthly : plan.priceYearly,
        currency: plan.currency,
      },
      include: { tenant: true, plan: true },
    });
  }

  async renewSubscription(id: string, dto: RenewSubscriptionDto) {
    const sub = await this.findSubscription(id);
    const period = dto.period ?? sub.period;
    const base = sub.expiresAt > new Date() ? sub.expiresAt : new Date();
    const nextExpiry = dto.months
      ? this.addMonths(base, dto.months)
      : this.addPeriod(base, period);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        expiresAt: nextExpiry,
        status: SubscriptionStatus.active,
        cancelledAt: null,
        autoRenew: true,
        notes: dto.notes ?? sub.notes,
      },
      include: { tenant: true, plan: true },
    });
  }

  async cancelSubscription(id: string, notes?: string) {
    const sub = await this.findSubscription(id);
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.cancelled, cancelledAt: new Date(), autoRenew: false, notes: notes ?? sub.notes },
      include: { tenant: true, plan: true },
    });
  }

  async setSubscriptionStatus(id: string, status: SubscriptionStatus) {
    const sub = await this.findSubscription(id);
    return this.prisma.subscription.update({
      where: { id },
      data: {
        status,
        ...(status === SubscriptionStatus.active ? { cancelledAt: null, autoRenew: true } : {}),
      },
      include: { tenant: true, plan: true },
    });
  }

  // ── Invoices ─────────────────────────────────────────────────────────────

  async findAllInvoices(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const where: Prisma.SubscriptionInvoiceWhereInput = {};
    if (query.search) {
      where.tenant = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    const [total, items] = await Promise.all([
      this.prisma.subscriptionInvoice.count({ where }),
      this.prisma.subscriptionInvoice.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, code: true } },
          subscription: { include: { plan: { select: { id: true, name: true } } } },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async issueInvoice(dto: CreateSubscriptionInvoiceDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const periodStart = dto.periodStart ? new Date(dto.periodStart) : new Date();
    const period = dto.period ?? SubscriptionPeriod.monthly;
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : this.addPeriod(periodStart, period);
    const invoiceNo = await this.nextInvoiceNo();

    return this.prisma.subscriptionInvoice.create({
      data: {
        invoiceNo,
        subscriptionId: dto.subscriptionId,
        tenantId: tenant.id,
        amount: dto.amount,
        currency: dto.currency ?? 'INR',
        period,
        periodStart,
        periodEnd,
        status: SubscriptionInvoiceStatus.issued,
        notes: dto.notes,
      },
      include: { tenant: { select: { id: true, name: true, code: true } } },
    });
  }

  async markInvoicePaid(id: string) {
    const invoice = await this.prisma.subscriptionInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === SubscriptionInvoiceStatus.paid) {
      throw new BadRequestException('Invoice is already marked as paid');
    }

    const updated = await this.prisma.subscriptionInvoice.update({
      where: { id },
      data: { status: SubscriptionInvoiceStatus.paid, paidAt: new Date() },
      include: { subscription: true },
    });

    if (invoice.subscriptionId && updated.subscription) {
      const sub = updated.subscription;
      const base = sub.expiresAt > new Date() ? sub.expiresAt : new Date();
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          expiresAt: this.addPeriod(base, invoice.period),
          status: SubscriptionStatus.active,
          cancelledAt: null,
          autoRenew: true,
        },
      });
    }

    return { message: 'Invoice marked as paid', invoice: updated };
  }

  async cancelInvoice(id: string) {
    const invoice = await this.prisma.subscriptionInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === SubscriptionInvoiceStatus.paid) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }
    await this.prisma.subscriptionInvoice.update({
      where: { id },
      data: { status: SubscriptionInvoiceStatus.cancelled },
    });
    return { message: 'Invoice cancelled' };
  }

  // ── Status / limits / storage ────────────────────────────────────────────

  async getTenantStatus(tenantId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
    const plan = sub?.plan ?? (await this.getDefaultPlan());
    return {
      subscription: sub,
      plan,
      active: this.isSubscriptionActive(sub),
      status: sub?.status ?? 'none',
      expiresAt: sub?.expiresAt ?? null,
    };
  }

  private isSubscriptionActive(sub?: { status: SubscriptionStatus; expiresAt: Date } | null) {
    if (!sub) return false;
    if (sub.status !== SubscriptionStatus.active && sub.status !== SubscriptionStatus.trial) {
      return false;
    }
    return sub.expiresAt >= new Date();
  }

  async enforceStudentLimit(tenantId: string) {
    const status = await this.getTenantStatus(tenantId);
    const limit = status.plan?.studentLimit;
    if (limit == null) return;
    const count = await this.prisma.student.count({ where: { tenantId } });
    if (count >= limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Plan limit reached',
          message: `Student limit of ${limit} reached on the current plan. Upgrade your plan to add more students.`,
          code: 'PLAN_LIMIT_REACHED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async enforceTeacherLimit(tenantId: string) {
    const status = await this.getTenantStatus(tenantId);
    const limit = status.plan?.teacherLimit;
    if (limit == null) return;
    const count = await this.prisma.teacher.count({ where: { tenantId } });
    if (count >= limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Plan limit reached',
          message: `Teacher limit of ${limit} reached on the current plan. Upgrade your plan to add more teachers.`,
          code: 'PLAN_LIMIT_REACHED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async checkStorage(tenantId: string, bytes: number) {
    const status = await this.getTenantStatus(tenantId);
    const limitMb = status.plan?.storageMb ?? 0;
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { storageUsedMb: true } });
    const usedMb = tenant?.storageUsedMb ?? 0;
    const addMb = bytes / (1024 * 1024);
    if (limitMb > 0 && usedMb + addMb > limitMb) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Storage limit reached',
          message: `Storage limit of ${limitMb} MB reached. Upgrade your plan to upload more files.`,
          code: 'STORAGE_LIMIT_REACHED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async addStorage(tenantId: string, bytes: number) {
    if (bytes <= 0) return;
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { storageUsedMb: { increment: bytes / (1024 * 1024) } },
    });
  }

  async getUsage(tenantId: string) {
    const [students, teachers, tenant] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.teacher.count({ where: { tenantId } }),
      this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { storageUsedMb: true } }),
    ]);
    return {
      students,
      teachers,
      storageMb: Math.round((tenant?.storageUsedMb ?? 0) * 100) / 100,
    };
  }

  // ── Dashboard stats (admin panel) ────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const activeSubs = await this.prisma.subscription.findMany({
      where: { status: { in: [SubscriptionStatus.active, SubscriptionStatus.trial] } },
      include: { plan: true },
    });

    let mrr = 0;
    for (const s of activeSubs) {
      mrr += s.period === SubscriptionPeriod.monthly ? s.pricePerPeriod : s.pricePerPeriod / 12;
    }

    const [totalTenants, activeTenants, expiringSoon, revenue, planCounts] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.subscription.count({
        where: { status: { in: [SubscriptionStatus.active, SubscriptionStatus.trial] }, expiresAt: { lte: in30Days } },
      }),
      this.prisma.subscriptionInvoice.aggregate({
        where: { status: SubscriptionInvoiceStatus.paid },
        _sum: { amount: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        _count: { planId: true },
      }),
    ]);

    const plans = await this.prisma.billingPlan.findMany({ select: { id: true, name: true } });
    const planBreakdown = planCounts.map((p) => ({
      planId: p.planId,
      name: plans.find((pl) => pl.id === p.planId)?.name ?? 'Unknown',
      count: p._count.planId,
    }));

    return {
      totalTenants,
      activeTenants,
      activeSubscriptions: activeSubs.length,
      expiringSoon,
      mrr: Math.round(mrr * 100) / 100,
      revenue: revenue._sum.amount ?? 0,
      planBreakdown,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private addPeriod(date: Date, period: SubscriptionPeriod, months?: number): Date {
    if (months) return this.addMonths(date, months);
    return this.addMonths(date, period === SubscriptionPeriod.yearly ? 12 : 1);
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private async nextInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.subscriptionInvoice.count();
    return `SUB-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
