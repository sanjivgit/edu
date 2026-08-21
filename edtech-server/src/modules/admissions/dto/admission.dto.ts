import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender, AdmissionStatus } from '@prisma/client';

export class CreateAdmissionDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  studentAadhaar?: string;

  @IsString()
  classApplyingFor: string;

  @IsOptional()
  @IsString()
  sectionPreference?: string;

  @IsOptional()
  @IsString()
  previousSchool?: string;

  @IsOptional()
  @IsString()
  previousGrade?: string;

  @IsOptional()
  @IsString()
  tcNumber?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  relationToStudent?: string;

  @IsString()
  parentPhone: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  annualIncome?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  disabilities?: string;

  @IsString()
  emergencyContactName: string;

  @IsString()
  emergencyContactPhone: string;

  @IsOptional()
  @IsBoolean()
  transportRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  hostelRequired?: boolean;

  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @IsOptional()
  @IsString()
  tenantCode?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;
}

export class UpdateAdmissionDto extends CreateAdmissionDto {}

export class AdmissionStatusDto {
  @IsEnum(AdmissionStatus)
  status: AdmissionStatus;
}
