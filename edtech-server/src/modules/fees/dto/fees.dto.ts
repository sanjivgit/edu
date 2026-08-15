import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeType, FeeFrequency, PaymentMode } from '@prisma/client';

export class CreateFeeStructureDto {
  @IsString()
  name: string;

  @IsString()
  classId: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsEnum(FeeType)
  type: FeeType;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(FeeFrequency)
  frequency?: FeeFrequency;
}

export class UpdateFeeStructureDto extends CreateFeeStructureDto {}

export class RecordPaymentDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  feeId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsEnum(PaymentMode)
  mode: PaymentMode;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateFeeAndPaymentDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  student?: string;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class GenerateInvoiceDto {
  @IsString()
  studentId: string;

  @IsString()
  month: string;
}
