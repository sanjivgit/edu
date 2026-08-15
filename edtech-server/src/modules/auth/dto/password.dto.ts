import { IsEmail, IsIn, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsIn(['login', 'reset-password', 'verify-email'])
  purpose: 'login' | 'reset-password' | 'verify-email';
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  newPassword: string;
}
