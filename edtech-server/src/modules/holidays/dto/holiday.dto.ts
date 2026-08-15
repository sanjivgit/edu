import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { HolidayType, HolidayStatus } from '@prisma/client';

export class CreateHolidayDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isFullDay?: boolean;

  @IsOptional()
  @IsString()
  appliesTo?: string;

  @IsOptional()
  @IsEnum(HolidayStatus)
  status?: HolidayStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateHolidayDto extends CreateHolidayDto {}
