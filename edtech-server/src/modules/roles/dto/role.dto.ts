import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export interface PermissionAction {
  module: string;
  actions: string[];
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: PermissionAction[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoleDto extends CreateRoleDto {}

export class UpdateRolePermissionsDto {
  @IsArray()
  permissions: PermissionAction[];
}
