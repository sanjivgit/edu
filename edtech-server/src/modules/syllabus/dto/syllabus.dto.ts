import { IsString, IsOptional, IsInt, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamTerm, SyllabusStatus } from '@prisma/client';

export class CreateSyllabusDto {
  @IsString()
  title: string;

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsEnum(ExamTerm)
  term?: ExamTerm;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  progress?: number;

  @IsOptional()
  @IsEnum(SyllabusStatus)
  status?: SyllabusStatus;
}

export class UpdateSyllabusDto extends CreateSyllabusDto {}

export class UpdateSyllabusProgressDto {
  @IsInt()
  @Type(() => Number)
  progress: number;
}
