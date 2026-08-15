import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimetableDay } from '@prisma/client';

export class GetTimetableQueryDto {
  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  week?: number;
}

export class AssignTimetableCellDto {
  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  week?: number;

  @IsEnum(TimetableDay)
  day: TimetableDay;

  @IsInt()
  periodId: number;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  teacher?: string;
}

export class UpdateTimetableCellDto {
  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  teacher?: string;
}
