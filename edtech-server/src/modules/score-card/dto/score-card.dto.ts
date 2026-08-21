import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreCardItemDto {
  @IsString()
  examPaperId: string;

  @IsString()
  subjectName: string;

  @IsInt()
  @Type(() => Number)
  totalMarks: number;

  @IsNumber()
  @Type(() => Number)
  obtainedMarks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateScoreCardDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreCardItemDto)
  items: ScoreCardItemDto[];
}

export class UpdateScoreCardItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreCardItemDto)
  items: ScoreCardItemDto[];
}

export class PublishScoreCardDto {
  @IsArray()
  @IsString({ each: true })
  scoreCardIds: string[];
}
