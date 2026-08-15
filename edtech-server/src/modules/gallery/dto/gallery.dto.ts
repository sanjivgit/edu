import { IsString, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
import { AlbumVisibility, MediaType } from '@prisma/client';

export class CreateAlbumDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(AlbumVisibility)
  visibility?: AlbumVisibility;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class UpdateAlbumDto extends CreateAlbumDto {}

export class AddMediaDto {
  @IsEnum(MediaType)
  type: MediaType;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
