import { IsString, IsOptional, IsInt, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  stock?: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

export class UpdateProductDto extends CreateProductDto {}
