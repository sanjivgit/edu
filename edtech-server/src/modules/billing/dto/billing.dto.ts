import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
  IsInt,
  Min,
} from 'class-validator';
import { PlanStatus, SubscriptionPeriod, SubscriptionStatus } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMonthly?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceYearly?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(-1)
  studentLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  teacherLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  storageMb?: number;

  @IsOptional()
  @IsObject()
  features?: Record<string, boolean>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdatePlanDto extends CreatePlanDto {}

export class CreateSubscriptionDto {
  @IsString()
  tenantId: string;

  @IsString()
  planId: string;

  @IsOptional()
  @IsEnum(SubscriptionPeriod)
  period?: SubscriptionPeriod;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  trialDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ChangePlanDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsEnum(SubscriptionPeriod)
  period?: SubscriptionPeriod;
}

export class RenewSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionPeriod)
  period?: SubscriptionPeriod;

  @IsOptional()
  @IsInt()
  @Min(1)
  months?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSubscriptionInvoiceDto {
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(SubscriptionPeriod)
  period?: SubscriptionPeriod;

  @IsOptional()
  @IsString()
  periodStart?: string;

  @IsOptional()
  @IsString()
  periodEnd?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
