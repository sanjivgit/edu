import { IsEmail, IsIn, IsString, Length } from 'class-validator';

export class OtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;

  @IsIn(['login', 'reset-password', 'verify-email'])
  purpose: 'login' | 'reset-password' | 'verify-email';
}
