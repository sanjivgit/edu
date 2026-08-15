import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportStatus } from '@prisma/client';

export class TransportStopDto {
  @IsString()
  name: string;

  @IsString()
  time: string;
}

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsString()
  vehicleNo: string;

  @IsString()
  driverName: string;

  @IsString()
  driverPhone: string;

  @IsString()
  startsAt: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportStopDto)
  stops: TransportStopDto[];

  @IsOptional()
  status?: TransportStatus;
}

export class UpdateRouteDto extends CreateRouteDto {}

export class AssignStudentDto {
  @IsString()
  studentId: string;

  @IsString()
  routeId: string;

  @IsString()
  stopName: string;
}

export class CreateVehicleDto {
  @IsString()
  vehicleNo: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;
}
