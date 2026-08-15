import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { DiaryVisibility, DiaryStatus } from '@prisma/client';

export class CreateDiaryEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsString()
  subject: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(DiaryVisibility)
  visibility?: DiaryVisibility;

  @IsOptional()
  @IsEnum(DiaryStatus)
  status?: DiaryStatus;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateDiaryEntryDto extends CreateDiaryEntryDto {}
