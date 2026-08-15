import { IsString, IsOptional, IsDateString, IsEnum, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { LectureType, LectureStatus } from '@prisma/client';

export class CreateLectureDto {
  @IsString()
  title: string;

  @IsEnum(LectureType)
  type: LectureType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsEnum(LectureStatus)
  status?: LectureStatus;

  @IsOptional()
  @IsArray()
  attachments?: any[];
}

export class UpdateLectureDto extends CreateLectureDto {}
