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
import { AssessmentType, AssessmentStatus } from '@prisma/client';

export class CreateAssessmentDto {
  @IsString()
  title: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsInt()
  totalMarks: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsEnum(AssessmentStatus)
  status?: AssessmentStatus;

  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class UpdateAssessmentDto extends CreateAssessmentDto {}

export class AssessmentResultDto {
  @IsString()
  studentId: string;

  @IsNumber()
  marks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAssessmentResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentResultDto)
  results: AssessmentResultDto[];
}
