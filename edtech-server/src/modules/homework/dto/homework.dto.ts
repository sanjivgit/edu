import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { HomeworkStatus, SubmissionStatus } from '@prisma/client';

export class CreateHomeworkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

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

  @IsDateString()
  assignedDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  status?: HomeworkStatus;

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class UpdateHomeworkDto extends CreateHomeworkDto {}

export class CloseHomeworkDto {
  @IsOptional()
  status?: HomeworkStatus;
}

export class CreateSubmissionDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  status?: SubmissionStatus;
}
