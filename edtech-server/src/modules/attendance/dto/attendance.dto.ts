import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceEntryDto {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class SaveAttendanceDto {
  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  entries: AttendanceEntryDto[];
}

export class AttendanceQueryDto {
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class RosterQueryDto {
  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;
}
