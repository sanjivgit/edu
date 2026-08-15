import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { OtpDto } from './dto/otp.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto, ResendOtpDto } from './dto/password.dto';
import { UserRole, OtpPurpose, OtpStatus, AuditAction, Severity } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { role_: true, tenant: true },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        actor: user.name,
        actorId: user.id,
        action: AuditAction.login,
        module: 'auth',
        summary: `${user.name} logged in`,
        ip,
        tenantId: user.tenantId,
        severity: Severity.info,
      },
    });

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
      message: 'Login successful',
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    let tenantId: string | null = null;
    if (dto.tenantCode) {
      const tenant = await this.prisma.tenant.findUnique({ where: { code: dto.tenantCode } });
      if (tenant) tenantId = tenant.id;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        passwordHash,
        role: dto.role ?? UserRole.student,
        tenantId,
      },
    });

    const tokens = await this.generateTokens(user);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
      message: 'Registration successful',
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revoked: true },
      });
    }
    await this.prisma.auditLog.create({
      data: {
        actor: userId,
        actorId: userId,
        action: AuditAction.logout,
        module: 'auth',
        summary: 'User logged out',
        severity: Severity.info,
      },
    });
    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role_: true, tenant: true, student: true, teacher: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return { user: this.sanitizeUser(user) };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.generateTokens(stored.user);
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
    return tokens;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      // Do not reveal whether the email exists
      return { message: 'If the email exists, an OTP has been sent' };
    }
    const otp = this.generateOtp();
    await this.createOtp(user.email, otp, OtpPurpose.reset_password);
    this.logger.log(`[DEV] Reset password OTP for ${user.email}: ${otp}`);
    return { message: 'OTP sent to your email', devOtp: otp };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email: dto.email.toLowerCase().trim(),
        purpose: OtpPurpose.reset_password,
        status: OtpStatus.pending,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otpRecord || otpRecord.code !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { email: dto.email.toLowerCase().trim() },
      data: { passwordHash },
    });
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { status: OtpStatus.verified },
    });
    return { message: 'Password reset successful' };
  }

  async verifyOtp(dto: OtpDto) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email: dto.email.toLowerCase().trim(),
        purpose: this.mapPurpose(dto.purpose),
        status: OtpStatus.pending,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otpRecord || otpRecord.code !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { status: OtpStatus.verified },
    });
    return { message: 'OTP verified', verified: true };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      return { message: 'If the email exists, an OTP has been sent' };
    }
    const otp = this.generateOtp();
    await this.createOtp(user.email, otp, this.mapPurpose(dto.purpose));
    this.logger.log(`[DEV] ${dto.purpose} OTP for ${user.email}: ${otp}`);
    return { message: 'OTP sent to your email', devOtp: otp };
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private mapPurpose(purpose: string): OtpPurpose {
    switch (purpose) {
      case 'reset-password':
        return OtpPurpose.reset_password;
      case 'verify-email':
        return OtpPurpose.verify_email;
      default:
        return OtpPurpose.login;
    }
  }

  private async createOtp(email: string, code: string, purpose: OtpPurpose) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    await this.prisma.otp.updateMany({
      where: { email, purpose, status: OtpStatus.pending },
      data: { status: OtpStatus.expired },
    });
    await this.prisma.otp.create({ data: { email, code, purpose, expiresAt } });
  }

  private async generateTokens(user: { id: string; email: string; tenantId?: string | null }) {
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId ?? null };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn', '1d'),
    });
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    const permissions = (user.role_?.permissions as any[]) ?? [];
    const rolePermissions = permissions
      .flatMap((entry) => entry.actions.map((action) => `${entry.module}.${action}`));
    const explicit = (user.permissions as string[]) ?? [];
    return {
      id: rest.id,
      name: rest.name,
      email: rest.email,
      role: rest.role,
      avatar: rest.avatar,
      phone: rest.phone,
      tenantId: rest.tenantId,
      isEmailVerified: rest.isEmailVerified,
      permissions: [...new Set([...explicit, ...rolePermissions])],
      meta: rest.meta,
    };
  }
}
