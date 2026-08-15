import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  fullName: string;

  @IsString()
  employeeCode: string;

  @IsString()
  subject: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  classTeacherOf?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}

export class UpdateTeacherDto extends CreateTeacherDto {}
