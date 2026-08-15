import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, SubscriptionStatus } from '@prisma/client';
import { BillingService } from './billing.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreateSubscriptionDto,
  ChangePlanDto,
  RenewSubscriptionDto,
  CreateSubscriptionInvoiceDto,
} from './dto/billing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription-check.decorator';

@ApiTags('billing')
@Controller('billing')
@ApiBearerAuth()
export class BillingController {
  constructor(private billingService: BillingService) {}

  // ── Tenant-facing (own subscription) ─────────────────────────────────────

  @Get('my')
  @SkipSubscriptionCheck()
  @Roles(UserRole.superadmin, UserRole.admin)
  mySubscription(@CurrentUser('tenantId') tenantId?: string) {
    return this.billingService.getTenantSubscription(tenantId as string);
  }

  // ── Plans ────────────────────────────────────────────────────────────────

  @Get('plans')
  @Roles(UserRole.superadmin)
  plans(@Query() query: PaginationDto) {
    return this.billingService.findPlans(query);
  }

  @Get('plans/:id')
  @Roles(UserRole.superadmin)
  plan(@Param('id') id: string) {
    return this.billingService.findPlan(id);
  }

  @Post('plans')
  @Roles(UserRole.superadmin)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.billingService.createPlan(dto);
  }

  @Patch('plans/:id')
  @Roles(UserRole.superadmin)
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.billingService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.superadmin)
  removePlan(@Param('id') id: string) {
    return this.billingService.removePlan(id);
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  @Get('subscriptions')
  @Roles(UserRole.superadmin)
  subscriptions(@Query() query: PaginationDto) {
    return this.billingService.findAllSubscriptions(query);
  }

  @Get('subscriptions/:id')
  @Roles(UserRole.superadmin)
  subscription(@Param('id') id: string) {
    return this.billingService.findSubscription(id);
  }

  @Post('subscriptions')
  @Roles(UserRole.superadmin)
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.billingService.createSubscription(dto);
  }

  @Patch('subscriptions/:id/plan')
  @Roles(UserRole.superadmin)
  changePlan(@Param('id') id: string, @Body() dto: ChangePlanDto) {
    return this.billingService.changePlan(id, dto);
  }

  @Post('subscriptions/:id/renew')
  @Roles(UserRole.superadmin)
  renew(@Param('id') id: string, @Body() dto: RenewSubscriptionDto) {
    return this.billingService.renewSubscription(id, dto);
  }

  @Post('subscriptions/:id/cancel')
  @Roles(UserRole.superadmin)
  cancel(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.billingService.cancelSubscription(id, notes);
  }

  @Post('subscriptions/:id/suspend')
  @Roles(UserRole.superadmin)
  suspend(@Param('id') id: string) {
    return this.billingService.setSubscriptionStatus(id, SubscriptionStatus.suspended);
  }

  @Post('subscriptions/:id/resume')
  @Roles(UserRole.superadmin)
  resume(@Param('id') id: string) {
    return this.billingService.setSubscriptionStatus(id, SubscriptionStatus.active);
  }

  // ── Invoices ─────────────────────────────────────────────────────────────

  @Get('invoices')
  @Roles(UserRole.superadmin)
  invoices(@Query() query: PaginationDto) {
    return this.billingService.findAllInvoices(query);
  }

  @Post('invoices')
  @Roles(UserRole.superadmin)
  issueInvoice(@Body() dto: CreateSubscriptionInvoiceDto) {
    return this.billingService.issueInvoice(dto);
  }

  @Post('invoices/:id/mark-paid')
  @Roles(UserRole.superadmin)
  markPaid(@Param('id') id: string) {
    return this.billingService.markInvoicePaid(id);
  }

  @Post('invoices/:id/cancel')
  @Roles(UserRole.superadmin)
  cancelInvoice(@Param('id') id: string) {
    return this.billingService.cancelInvoice(id);
  }

  // ── Dashboard stats ──────────────────────────────────────────────────────

  @Get('stats')
  @Roles(UserRole.superadmin)
  stats() {
    return this.billingService.getStats();
  }
}
