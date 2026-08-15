import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  classTeacherId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}

export class UpdateClassDto extends CreateClassDto {}

export class CreateSectionDto {
  @IsString()
  classId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  roomNo?: string;

  @IsOptional()
  @IsString()
  sectionTeacherId?: string;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  roomNo?: string;

  @IsOptional()
  @IsString()
  sectionTeacherId?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}

export class CreateAcademicYearDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'planned' | 'closed';
}

export class PromoteStudentsDto {
  @IsString()
  fromClassId: string;

  @IsString()
  toClassId: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString({ each: true })
  studentIds?: string[];
}

export class AutoPromoteDto {
  @IsString()
  fromClassId: string;

  @IsString()
  toClassId: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsString()
  examId: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  passPercentage?: number;
}
