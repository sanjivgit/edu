import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { NoticeStatus, NoticeCategory, AudienceScope } from '@prisma/client';

export class CreateNoticeDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NoticeCategory)
  category?: NoticeCategory;

  @IsDateString()
  publishAt: string;

  @IsOptional()
  @IsDateString()
  expireAt?: string;

  @IsOptional()
  @IsEnum(AudienceScope)
  scope?: AudienceScope;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;
}

export class UpdateNoticeDto extends CreateNoticeDto {}
