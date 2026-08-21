import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamTerm, ExamStatus } from '@prisma/client';

export class ExamPaperDto {
  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsString()
  subjectName: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsInt()
  durationMinutes: number;

  @IsInt()
  totalMarks: number;
}

export class CreateExamDto {
  @IsString()
  name: string;

  @IsEnum(ExamTerm)
  term: ExamTerm;

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  passPercentage?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamPaperDto)
  papers: ExamPaperDto[];

  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class UpdateExamDto extends CreateExamDto {}

export class ExamResultDto {
  @IsString()
  studentId: string;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class CreateExamResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamResultDto)
  results: ExamResultDto[];
}
